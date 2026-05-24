"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { getTodayLabel } from "@/lib/mockData";
import { createClient } from "@supabase/supabase-js";

// クライアントサイド用Supabaseクライアント（シングルトン）
let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (_supabase) return _supabase;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !url.startsWith("http") || !key) return null;
  _supabase = createClient(url, key);
  return _supabase;
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
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [recalculating, setRecalculating] = useState<boolean[]>([]);
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [addingFoodName, setAddingFoodName] = useState("");
  const [isAddingCalc, setIsAddingCalc] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [inputMode, setInputMode] = useState<"photo" | "text">("photo");
  const [textFoods, setTextFoods] = useState<string[]>([""]);
  const [mealType, setMealType] = useState("食事");
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // ── 起動時：ユーザーIDと今日の食事記録を取得 ──
  useEffect(() => {
    const init = async () => {
      const supabase = getSupabase();
      if (!supabase) {
        setError("⚠️ Supabase未接続（環境変数を確認してください）");
        return;
      }

      // プロフィール取得
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile, error: profileError } = await (supabase as any)
        .from("profiles")
        .select("id")
        .limit(1)
        .single();

      if (profileError || !profile) {
        setError("⚠️ プロフィール取得失敗: " + (profileError?.message ?? "データなし"));
        return;
      }
      setUserId(profile.id);

      // 今日の食事記録を取得
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: logs } = await (supabase as any)
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

  const handleTextAnalyze = async () => {
    const validFoods = textFoods.map((f) => f.trim()).filter(Boolean);
    if (validFoods.length === 0) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodNames: validFoods }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "計算に失敗しました");
      setAnalysisResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "計算中にエラーが発生しました");
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
      total_calories: Math.round(analysisResult.total_calories),
      total_protein: Math.round(analysisResult.total_protein),
      image_description: analysisResult.comment ?? "",
    };

    // Supabaseに保存
    const supabase = getSupabase();
    if (supabase && userId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: dbError } = await (supabase as any)
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

      {/* ── 食事記録入力 ── */}
      <div className="card" style={{ padding: "24px" }}>

        {/* タブ切り替え */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "var(--dark)", borderRadius: "10px", padding: "4px" }}>
          {[
            { mode: "photo" as const, label: "📷 写真で解析" },
            { mode: "text" as const,  label: "⌨️ 料理名を入力" },
          ].map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => { setInputMode(mode); setError(null); setAnalysisResult(null); }}
              style={{
                flex: 1, padding: "10px", borderRadius: "8px",
                border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 700,
                background: inputMode === mode ? "var(--red)" : "transparent",
                color: inputMode === mode ? "var(--white)" : "var(--gray)",
                transition: "all 0.2s",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 食事タイプ選択 */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
          {["朝食", "昼食", "夕食", "間食"].map((type) => (
            <button
              key={type}
              onClick={() => setMealType(type)}
              style={{
                padding: "6px 16px", borderRadius: "20px",
                border: `1px solid ${mealType === type ? "var(--red)" : "var(--border)"}`,
                background: mealType === type ? "var(--red)" : "transparent",
                color: "var(--white)", fontSize: "12px", fontWeight: 700,
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {/* ── 写真モード ── */}
        {inputMode === "photo" && (
          <>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${isDragging ? "var(--red)" : "var(--border)"}`,
                borderRadius: "12px", padding: "32px 16px", textAlign: "center",
                cursor: "pointer", background: isDragging ? "rgba(204,0,0,0.05)" : "transparent",
                transition: "all 0.2s", minHeight: "160px", display: "flex",
                flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="食事プレビュー"
                  style={{ maxHeight: "240px", maxWidth: "100%", borderRadius: "8px", objectFit: "contain" }} />
              ) : (
                <>
                  <span style={{ fontSize: "40px" }}>📷</span>
                  <p style={{ color: "var(--gray-l)", fontSize: "14px", fontWeight: 600 }}>クリックまたはドラッグ＆ドロップ</p>
                  <p style={{ color: "var(--gray)", fontSize: "11px" }}>JPG / PNG / HEIC 対応</p>
                </>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
            {imagePreview && !analysisResult && (
              <button className="btn-primary" onClick={handleAnalyze} disabled={isAnalyzing}
                style={{ marginTop: "16px", width: "100%", opacity: isAnalyzing ? 0.7 : 1 }}>
                {isAnalyzing ? "🤖 AI解析中..." : "🤖 AIでカロリーを解析する"}
              </button>
            )}
          </>
        )}

        {/* ── テキスト入力モード ── */}
        {inputMode === "text" && (
          <>
            <p style={{ fontSize: "12px", color: "var(--gray-l)", marginBottom: "12px", fontStyle: "italic" }}>
              💡 量やサイズを含めて入力すると、より正確なカロリー計算ができます。<br />
              例：生ビール（中）、日本酒3合、ハイボール（大ジョッキ）、牛丼（並盛）
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
              {textFoods.map((food, idx) => (
                <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="text"
                    value={food}
                    onChange={(e) => {
                      const updated = [...textFoods];
                      updated[idx] = e.target.value;
                      setTextFoods(updated);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        setTextFoods((prev) => [...prev, ""]);
                      }
                    }}
                    placeholder={idx === 0 ? "例：生ビール（中）、日本酒3合" : "例：味噌汁、ハイボール（大）"}
                    style={{
                      flex: 1, padding: "10px 14px", background: "var(--dark)",
                      border: "1px solid var(--border)", borderRadius: "8px",
                      color: "var(--white)", fontSize: "14px", fontWeight: 600, outline: "none",
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "var(--red)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
                  />
                  {textFoods.length > 1 && (
                    <button
                      onClick={() => setTextFoods((prev) => prev.filter((_, i) => i !== idx))}
                      style={{
                        width: "32px", height: "32px", borderRadius: "50%", border: "none",
                        background: "var(--border)", color: "var(--gray)", cursor: "pointer",
                        fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              {/* 料理を追加ボタン */}
              <button
                onClick={() => setTextFoods((prev) => [...prev, ""])}
                style={{
                  padding: "10px", borderRadius: "8px", border: `1px dashed var(--border)`,
                  background: "transparent", color: "var(--gray)", fontSize: "13px",
                  fontWeight: 700, cursor: "pointer", textAlign: "center",
                }}
              >
                ＋ 料理を追加
              </button>
            </div>

            <button
              className="btn-primary"
              onClick={handleTextAnalyze}
              disabled={isAnalyzing || textFoods.every((f) => !f.trim())}
              style={{ width: "100%", opacity: (isAnalyzing || textFoods.every((f) => !f.trim())) ? 0.6 : 1 }}
            >
              {isAnalyzing ? "🤖 計算中..." : "🤖 AIでカロリーを計算する"}
            </button>
          </>
        )}

        {error && (
          <p style={{ color: "var(--red-b)", fontSize: "12px", marginTop: "8px" }}>⚠️ {error}</p>
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
                {/* 料理名：クリックで編集 */}
                {editingIndex === i ? (
                  <input
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={async () => {
                      const newName = editingName.trim();
                      setEditingIndex(null);
                      if (!newName || newName === food.name) return;

                      // 新しい料理名でカロリーを自動再計算
                      setRecalculating((prev) => { const a = [...prev]; a[i] = true; return a; });
                      try {
                        const res = await fetch("/api/analyze-food", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ foodName: newName }),
                        });
                        const data = await res.json();
                        const updated = [...analysisResult.foods];
                        updated[i] = {
                          name: newName,
                          calories: data.calories ?? food.calories,
                          protein: data.protein ?? food.protein,
                        };
                        const newTotal = updated.reduce((s, f) => s + f.calories, 0);
                        const newProtein = updated.reduce((s, f) => s + f.protein, 0);
                        setAnalysisResult({ ...analysisResult, foods: updated, total_calories: newTotal, total_protein: newProtein });
                      } catch {
                        // エラー時は名前だけ更新
                        const updated = [...analysisResult.foods];
                        updated[i] = { ...updated[i], name: newName };
                        setAnalysisResult({ ...analysisResult, foods: updated });
                      } finally {
                        setRecalculating((prev) => { const a = [...prev]; a[i] = false; return a; });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                      if (e.key === "Escape") { setEditingIndex(null); }
                    }}
                    style={{
                      background: "var(--border)", border: "1px solid var(--red)",
                      borderRadius: "6px", color: "var(--white)", fontSize: "14px",
                      fontWeight: 700, padding: "4px 8px", outline: "none", flex: 1,
                    }}
                  />
                ) : (
                  <button
                    onClick={() => { setEditingIndex(i); setEditingName(food.name); }}
                    title="クリックして編集"
                    style={{
                      fontSize: "14px", fontWeight: 700, background: "none",
                      border: "none", color: "var(--white)", cursor: "pointer",
                      textAlign: "left", padding: "2px 4px", borderRadius: "4px",
                      textDecoration: "underline dotted var(--gray)",
                    }}
                  >
                    ✏️ {food.name}
                  </button>
                )}
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "8px" }}>
                  {recalculating[i] ? (
                    <span style={{ color: "var(--gray-l)", fontWeight: 700, fontSize: "13px" }}>計算中...</span>
                  ) : (
                    <>
                      <span style={{ color: "var(--red-b)", fontWeight: 800, fontSize: "15px" }}>{food.calories}kcal</span>
                      <span style={{ color: "var(--gray)", fontSize: "11px", marginLeft: "8px" }}>P: {food.protein}g</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ── 料理を追加 ── */}
          {isAddingFood ? (
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px", alignItems: "center" }}>
              <input
                autoFocus
                type="text"
                value={addingFoodName}
                onChange={(e) => setAddingFoodName(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === "Enter") {
                    const name = addingFoodName.trim();
                    if (!name || !analysisResult) return;
                    setIsAddingCalc(true);
                    try {
                      const res = await fetch("/api/analyze-food", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ foodName: name }),
                      });
                      const data = await res.json();
                      const newFood = { name, calories: data.calories ?? 0, protein: data.protein ?? 0 };
                      const updatedFoods = [...analysisResult.foods, newFood];
                      setAnalysisResult({
                        ...analysisResult,
                        foods: updatedFoods,
                        total_calories: updatedFoods.reduce((s, f) => s + f.calories, 0),
                        total_protein: updatedFoods.reduce((s, f) => s + f.protein, 0),
                      });
                    } finally {
                      setIsAddingCalc(false);
                      setAddingFoodName("");
                      setIsAddingFood(false);
                    }
                  }
                  if (e.key === "Escape") { setIsAddingFood(false); setAddingFoodName(""); }
                }}
                placeholder="例：生ビール（中）、日本酒3合、ハイボール（大）"
                disabled={isAddingCalc}
                style={{
                  flex: 1, padding: "10px 14px", background: "var(--dark)",
                  border: "1px solid var(--red)", borderRadius: "8px",
                  color: "var(--white)", fontSize: "14px", fontWeight: 600, outline: "none",
                  opacity: isAddingCalc ? 0.6 : 1,
                }}
              />
              {isAddingCalc ? (
                <span style={{ color: "var(--gray-l)", fontSize: "12px", whiteSpace: "nowrap" }}>計算中...</span>
              ) : (
                <button
                  onClick={() => { setIsAddingFood(false); setAddingFoodName(""); }}
                  style={{
                    padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border)",
                    background: "transparent", color: "var(--gray)", cursor: "pointer", fontSize: "12px",
                  }}
                >
                  キャンセル
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => { setIsAddingFood(true); setAddingFoodName(""); }}
              style={{
                width: "100%", padding: "10px", marginBottom: "12px",
                borderRadius: "8px", border: "1px dashed var(--border)",
                background: "transparent", color: "var(--gray-l)",
                fontSize: "13px", fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              }}
            >
              ＋ 料理を追加
            </button>
          )}

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
              onClick={() => {
                setAnalysisResult(null);
                setImagePreview(null);
                setImageBase64(null);
                setTextFoods([""]);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
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
