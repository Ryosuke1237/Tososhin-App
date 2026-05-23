"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { getTodayLabel } from "@/lib/mockData";
import { createClient } from "@supabase/supabase-js";

// クライアントサイド用Supabaseクライアント（遅延初期化）
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !url.startsWith("http") || !key) return null;
  return createClient(url, key);
}

type FoodItem = {
  name: string;
  calories: number;
  protein: number;
};

type AnalysisResult = {
  foods: FoodItem[];
  total_calories: number;
  total_protein: number;
  comment: string;
};

type SavedMeal = {
  id: string;
  created_at: string;
  meal_type: string;
  foods: string;
  total_calories: number;
  total_protein: number;
};

export default function MealPage() {
  const dateLabel = getTodayLabel();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const today = new Date().toISOString().split("T")[0];

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [mealType, setMealType] = useState("食事");
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // ── 起動時：ユーザーIDと今日の食事記録を取得 ──
  useEffect(() => {
    const init = async () => {
      const supabase = getSupabase();
      if (!supabase) return;

      // プロフィール取得
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .limit(1)
        .single();

      if (!profile) return;
      setUserId(profile.id);

      // 今日の食事記録を取得
      const { data: logs } = await supabase
        .from("meal_logs")
        .select("*")
        .eq("user_id", profile.id)
        .eq("date", today)
        .order("created_at", { ascending: true });

      if (logs) setSavedMeals(logs);
    };
    init();
  }, [today]);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("画像ファイルを選択してください");
      return;
    }
    setError(null);
    setAnalysisResult(null);
    setImageMimeType(file.type);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const handleAnalyze = async () => {
    if (!imageBase64) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType: imageMimeType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "解析に失敗しました");
      setAnalysisResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "解析中にエラーが発生しました");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!analysisResult) return;
    setIsSaving(true);

    const foodsText = analysisResult.foods.map((f) => f.name).join("、");
    const newMealData = {
      meal_type: mealType,
      foods: foodsText,
      total_calories: analysisResult.total_calories,
      total_protein: analysisResult.total_protein,
      image_description: analysisResult.comment ?? "",
    };

    // Supabaseに保存
    const supabase = getSupabase();
    if (supabase && userId) {
      const { data, error: dbError } = await supabase
        .from("meal_logs")
        .insert({ user_id: userId, date: today, ...newMealData })
        .select()
        .single();

      if (dbError) {
        setError("保存に失敗しました: " + dbError.message);
        setIsSaving(false);
        return;
      }
      if (data) setSavedMeals((prev) => [...prev, data]);
    } else {
      // Supabase未設定時はローカル保存
      setSavedMeals((prev) => [
        ...prev,
        { id: Date.now().toString(), created_at: new Date().toISOString(), ...newMealData },
      ]);
    }

    setImagePreview(null);
    setImageBase64(null);
    setAnalysisResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsSaving(false);
  };

  const totalCaloriesToday = savedMeals.reduce((s, m) => s + m.total_calories, 0);
  const totalProteinToday = savedMeals.reduce((s, m) => s + m.total_protein, 0);

  return (
    <div className="page">

      {/* ── ページヘッダー ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">🍽️ 食事ログ</h1>
          <p className="page-sub">{dateLabel} · AIが食事を自動解析</p>
        </div>
        {userId ? (
          <span style={{ fontSize: "11px", color: "var(--green)", fontWeight: 700 }}>● Supabase連携中</span>
        ) : (
          <span style={{ fontSize: "11px", color: "var(--gray)", fontWeight: 700 }}>○ ローカルモード</span>
        )}
      </div>

      {/* ── 今日の合計 ── */}
      {savedMeals.length > 0 && (
        <div className="kpi-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="kpi-card primary">
            <div className="kpi-icon">🔥</div>
            <div>
              <span className="kpi-value red">{totalCaloriesToday.toLocaleString()}</span>
              <span className="kpi-unit">kcal</span>
            </div>
            <div className="kpi-label">今日の摂取カロリー</div>
            <div className="kpi-trend trend-neutral">目標 2,200kcal</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">💪</div>
            <div>
              <span className="kpi-value">{totalProteinToday}</span>
              <span className="kpi-unit">g</span>
            </div>
            <div className="kpi-label">タンパク質</div>
            <div className="kpi-trend trend-up">↑ 目標比 {Math.round(totalProteinToday / 160 * 100)}%</div>
          </div>
        </div>
      )}

      {/* ── 写真アップロード ── */}
      <div className="card" style={{ padding: "24px" }}>
        <div className="card-header" style={{ marginBottom: "16px" }}>
          <span className="card-title">📷 食事写真をアップロード</span>
        </div>

        {/* 食事タイプ選択 */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
          {["朝食", "昼食", "夕食", "間食"].map((type) => (
            <button
              key={type}
              onClick={() => setMealType(type)}
              style={{
                padding: "6px 16px",
                borderRadius: "20px",
                border: `1px solid ${mealType === type ? "var(--red)" : "var(--border)"}`,
                background: mealType === type ? "var(--red)" : "transparent",
                color: "var(--white)",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {/* ドロップゾーン */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${isDragging ? "var(--red)" : "var(--border)"}`,
            borderRadius: "12px",
            padding: "32px 16px",
            textAlign: "center",
            cursor: "pointer",
            background: isDragging ? "rgba(204,0,0,0.05)" : "transparent",
            transition: "all 0.2s",
            minHeight: "160px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="食事プレビュー"
              style={{ maxHeight: "240px", maxWidth: "100%", borderRadius: "8px", objectFit: "contain" }}
            />
          ) : (
            <>
              <span style={{ fontSize: "40px" }}>📷</span>
              <p style={{ color: "var(--gray-l)", fontSize: "14px", fontWeight: 600 }}>
                クリックまたはドラッグ＆ドロップ
              </p>
              <p style={{ color: "var(--gray)", fontSize: "11px" }}>JPG / PNG / HEIC 対応</p>
            </>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />

        {error && (
          <p style={{ color: "var(--red-b)", fontSize: "12px", marginTop: "8px" }}>⚠️ {error}</p>
        )}

        {imagePreview && !analysisResult && (
          <button
            className="btn-primary"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            style={{ marginTop: "16px", width: "100%", opacity: isAnalyzing ? 0.7 : 1 }}
          >
            {isAnalyzing ? "🤖 AI解析中..." : "🤖 AIでカロリーを解析する"}
          </button>
        )}
      </div>

      {/* ── AI解析結果 ── */}
      {analysisResult && (
        <div className="card" style={{ padding: "24px" }}>
          <div className="card-header" style={{ marginBottom: "16px" }}>
            <span className="card-title">🤖 AI解析結果</span>
            <span className="card-sub" style={{ color: "var(--green)" }}>✅ 解析完了</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
            {analysisResult.foods.map((food, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 14px", background: "var(--dark)", borderRadius: "8px",
                borderLeft: "3px solid var(--red)",
              }}>
                <span style={{ fontSize: "14px", fontWeight: 700 }}>{food.name}</span>
                <div style={{ textAlign: "right" }}>
                  <span style={{ color: "var(--red-b)", fontWeight: 800, fontSize: "15px" }}>{food.calories}kcal</span>
                  <span style={{ color: "var(--gray)", fontSize: "11px", marginLeft: "8px" }}>P: {food.protein}g</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            display: "flex", justifyContent: "space-between", padding: "14px 16px",
            background: "rgba(204,0,0,0.1)", borderRadius: "8px",
            border: "1px solid rgba(204,0,0,0.3)", marginBottom: "12px",
          }}>
            <span style={{ fontWeight: 800, fontSize: "14px" }}>合計</span>
            <div style={{ textAlign: "right" }}>
              <span style={{ color: "var(--red-b)", fontWeight: 900, fontSize: "18px" }}>{analysisResult.total_calories}kcal</span>
              <span style={{ color: "var(--gray-l)", fontSize: "12px", marginLeft: "10px" }}>タンパク質 {analysisResult.total_protein}g</span>
            </div>
          </div>

          {analysisResult.comment && (
            <p style={{ fontSize: "12px", color: "var(--gray-l)", marginBottom: "16px", fontStyle: "italic" }}>
              💬 {analysisResult.comment}
            </p>
          )}

          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn-primary" onClick={handleSave} disabled={isSaving}
              style={{ flex: 1, opacity: isSaving ? 0.7 : 1 }}>
              {isSaving ? "保存中..." : "💾 Supabaseに保存する"}
            </button>
            <button className="btn-secondary"
              onClick={() => { setAnalysisResult(null); setImagePreview(null); setImageBase64(null); }}
              style={{ padding: "0 16px" }}>
              やり直す
            </button>
          </div>
        </div>
      )}

      {/* ── 今日の食事記録一覧 ── */}
      <div className="card" style={{ padding: "24px" }}>
        <div className="card-header" style={{ marginBottom: "16px" }}>
          <span className="card-title">📋 今日の食事記録</span>
          <span className="card-sub">{savedMeals.length}件</span>
        </div>

        {savedMeals.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--gray)" }}>
            <p style={{ fontSize: "32px", marginBottom: "8px" }}>🍽️</p>
            <p style={{ fontSize: "13px" }}>まだ記録がありません</p>
            <p style={{ fontSize: "11px", marginTop: "4px" }}>写真をアップロードして記録しましょう</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {savedMeals.map((meal) => (
              <div key={meal.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 16px", background: "var(--dark)", borderRadius: "10px",
                borderLeft: "3px solid var(--border)",
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "11px", color: "var(--gray)", fontWeight: 700 }}>
                      {new Date(meal.created_at).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span style={{
                      fontSize: "10px", padding: "2px 8px", background: "var(--border)",
                      borderRadius: "10px", color: "var(--gray-l)", fontWeight: 700,
                    }}>
                      {meal.meal_type}
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--white)" }}>{meal.foods}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "var(--red-b)", fontWeight: 800, fontSize: "16px" }}>
                    {meal.total_calories}<span style={{ fontSize: "10px", fontWeight: 600 }}>kcal</span>
                  </div>
                  <div style={{ color: "var(--gray)", fontSize: "11px" }}>P: {meal.total_protein}g</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
