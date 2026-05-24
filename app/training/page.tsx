"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { getTodayLabel } from "@/lib/mockData";
import { createClient } from "@supabase/supabase-js";

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (_supabase) return _supabase;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !url.startsWith("http") || !key) return null;
  _supabase = createClient(url, key);
  return _supabase;
}

type TrainingLog = {
  id: string;
  date: string;
  training_time: string;
  video_url: string;
  file_name: string;
  created_at: string;
};

export default function TrainingPage() {
  const dateLabel = getTodayLabel();
  const today = new Date().toISOString().split("T")[0];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [date, setDate] = useState(today);
  const [trainingTime, setTrainingTime] = useState(
    new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", hour12: false })
  );
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [trainingLogs, setTrainingLogs] = useState<TrainingLog[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const supabase = getSupabase();
      if (!supabase) {
        setError("Supabase環境変数が設定されていません。");
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile, error: profileError } = await (supabase as any)
        .from("profiles")
        .select("id")
        .limit(1)
        .single();

      if (profileError || !profile) {
        console.warn("profiles取得失敗:", profileError?.message);
        return;
      }
      setUserId(profile.id);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: logs } = await (supabase as any)
        .from("training_logs")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });

      if (logs) setTrainingLogs(logs);
    };
    init();
  }, []);

  const processFile = (file: File) => {
    // スマホでは file.type が空になることがあるため、拡張子でも判定
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const videoExts = ["mp4", "mov", "avi", "mkv", "webm", "m4v", "3gp", "hevc", "ts"];
    const isVideo =
      file.type.startsWith("video/") ||
      file.type === "" ||                 // iOS Safari では type が空になる場合あり
      videoExts.includes(ext);
    if (!isVideo) {
      setError("動画ファイルを選択してください");
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setError("ファイルサイズは500MB以下にしてください");
      return;
    }
    setError(null);
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
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

  const handleUpload = async () => {
    if (!videoFile) return;

    // userId が null の場合はエラーを表示（無音で終わらせない）
    if (!userId) {
      setError("Supabaseに接続できていません。ページを再読み込みしてください。");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase未接続: 環境変数を確認してください");

      const ext = videoFile.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${ext}`;

      // Supabase Storageにアップロード
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: storageError } = await (supabase as any)
        .storage
        .from("training-videos")
        .upload(fileName, videoFile, { cacheControl: "3600", upsert: false });

      if (storageError) {
        // Storage ポリシー未設定の場合に分かりやすいメッセージを出す
        const msg = storageError.message.includes("row-level") || storageError.message.includes("policy") || storageError.message.includes("Unauthorized")
          ? "アップロード権限がありません。Supabase Storageのポリシー設定を確認してください。"
          : `アップロードエラー: ${storageError.message}`;
        throw new Error(msg);
      }

      // 公開URLを取得
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: urlData } = (supabase as any)
        .storage
        .from("training-videos")
        .getPublicUrl(fileName);

      // training_logsに保存
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: logData, error: logError } = await (supabase as any)
        .from("training_logs")
        .insert({
          user_id: userId,
          date,
          training_time: trainingTime,
          video_url: urlData.publicUrl,
          file_name: videoFile.name,
        })
        .select()
        .single();

      if (logError) throw new Error(logError.message);
      if (logData) setTrainingLogs((prev) => [logData, ...prev]);

      // リセット
      setVideoFile(null);
      setVideoPreview(null);
      setDate(today);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "アップロードに失敗しました");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, videoUrl: string) => {
    const supabase = getSupabase();
    if (!supabase) return;

    // Storageから動画を削除
    const parts = videoUrl.split("/training-videos/");
    if (parts[1]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).storage.from("training-videos").remove([parts[1]]);
    }

    // DBから記録を削除
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("training_logs").delete().eq("id", id);

    setTrainingLogs((prev) => prev.filter((l) => l.id !== id));
    setDeletingId(null);
  };

  return (
    <div className="page">

      {/* ── ページヘッダー ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">🥊 トレーニング記録</h1>
          <p className="page-sub">{dateLabel} · 動画で成長を記録</p>
        </div>
        {userId ? (
          <span style={{ fontSize: "11px", color: "var(--green)", fontWeight: 700 }}>● Supabase連携中</span>
        ) : (
          <span style={{ fontSize: "11px", color: "var(--gray)", fontWeight: 700 }}>○ ローカルモード</span>
        )}
      </div>

      {/* ── アップロードフォーム ── */}
      <div className="card" style={{ padding: "24px" }}>
        <div className="card-header" style={{ marginBottom: "16px" }}>
          <span className="card-title">📹 動画をアップロード</span>
        </div>

        {/* 日付・時間 */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "11px", color: "var(--gray)", fontWeight: 700, display: "block", marginBottom: "6px" }}>
              📅 日付
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: "100%", padding: "10px 14px", background: "var(--dark)",
                border: "1px solid var(--border)", borderRadius: "8px",
                color: "var(--white)", fontSize: "14px", fontWeight: 600,
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "11px", color: "var(--gray)", fontWeight: 700, display: "block", marginBottom: "6px" }}>
              ⏱️ 時間
            </label>
            <input
              type="time"
              value={trainingTime}
              onChange={(e) => setTrainingTime(e.target.value)}
              style={{
                width: "100%", padding: "10px 14px", background: "var(--dark)",
                border: "1px solid var(--border)", borderRadius: "8px",
                color: "var(--white)", fontSize: "14px", fontWeight: 600,
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* ドロップゾーン */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${isDragging ? "var(--red)" : "var(--border)"}`,
            borderRadius: "12px", padding: "32px 16px", textAlign: "center",
            cursor: "pointer", background: isDragging ? "rgba(204,0,0,0.05)" : "transparent",
            transition: "all 0.2s", minHeight: "160px",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px",
          }}
        >
          {videoPreview ? (
            <video
              src={videoPreview}
              controls
              style={{ maxHeight: "300px", maxWidth: "100%", borderRadius: "8px" }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <>
              <span style={{ fontSize: "48px" }}>🎥</span>
              <p style={{ color: "var(--gray-l)", fontSize: "14px", fontWeight: 600 }}>クリックまたはドラッグ＆ドロップ</p>
              <p style={{ color: "var(--gray)", fontSize: "11px" }}>MP4 / MOV / AVI 対応（最大200MB）</p>
            </>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileChange} style={{ display: "none" }} />

        {error && (
          <div style={{
            marginTop: "12px",
            padding: "12px 14px",
            background: "rgba(204,0,0,0.1)",
            border: "1px solid rgba(204,0,0,0.4)",
            borderRadius: "8px",
          }}>
            <p style={{ color: "var(--red-b)", fontSize: "13px", fontWeight: 700, lineHeight: 1.5 }}>
              ⚠️ {error}
            </p>
          </div>
        )}

        {videoFile && (
          <div style={{ marginTop: "12px" }}>
            <p style={{ fontSize: "12px", color: "var(--gray-l)", marginBottom: "8px" }}>
              📁 {videoFile.name}（{(videoFile.size / 1024 / 1024).toFixed(1)}MB）
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn-primary"
                onClick={handleUpload}
                disabled={isUploading}
                style={{ flex: 1, opacity: isUploading ? 0.7 : 1 }}
              >
                {isUploading ? "⏳ アップロード中..." : "📤 記録する"}
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  setVideoFile(null);
                  setVideoPreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                style={{ padding: "0 16px" }}
              >
                やり直す
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── トレーニング記録一覧 ── */}
      <div className="card" style={{ padding: "24px" }}>
        <div className="card-header" style={{ marginBottom: "16px" }}>
          <span className="card-title">📋 トレーニング記録</span>
          <span className="card-sub">{trainingLogs.length}件</span>
        </div>

        {trainingLogs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--gray)" }}>
            <p style={{ fontSize: "40px", marginBottom: "8px" }}>🥊</p>
            <p style={{ fontSize: "13px" }}>まだ記録がありません</p>
            <p style={{ fontSize: "11px", marginTop: "4px" }}>動画をアップロードして記録しましょう</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {trainingLogs.map((log) => (
              <div key={log.id} style={{
                background: "var(--dark)", borderRadius: "10px",
                borderLeft: "3px solid var(--red)", overflow: "hidden",
              }}>
                {/* ヘッダー */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--white)" }}>
                      📅 {log.date}
                    </span>
                    {log.training_time && (
                      <span style={{ fontSize: "12px", color: "var(--gray-l)", fontWeight: 700 }}>
                        ⏱️ {log.training_time}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setDeletingId(log.id)}
                    title="削除"
                    style={{
                      width: "28px", height: "28px", borderRadius: "6px",
                      border: "1px solid var(--border)", background: "transparent",
                      color: "var(--gray)", cursor: "pointer", fontSize: "14px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    🗑️
                  </button>
                </div>

                {/* 動画プレイヤー */}
                {log.video_url && (
                  <video
                    src={log.video_url}
                    controls
                    style={{ width: "100%", maxHeight: "400px", background: "#000", display: "block" }}
                  />
                )}

                {/* 2段階削除確認 */}
                {deletingId === log.id && (
                  <div style={{
                    padding: "10px 16px", background: "rgba(204,0,0,0.1)",
                    borderTop: "1px solid rgba(204,0,0,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px",
                  }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--red-b)" }}>
                      ⚠️ 本当に削除しますか？
                    </span>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleDelete(log.id, log.video_url)}
                        style={{
                          padding: "6px 14px", borderRadius: "6px", border: "none",
                          background: "var(--red)", color: "var(--white)",
                          fontSize: "12px", fontWeight: 700, cursor: "pointer",
                        }}
                      >
                        削除する
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        style={{
                          padding: "6px 14px", borderRadius: "6px", border: "1px solid var(--border)",
                          background: "transparent", color: "var(--gray)",
                          fontSize: "12px", fontWeight: 700, cursor: "pointer",
                        }}
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
