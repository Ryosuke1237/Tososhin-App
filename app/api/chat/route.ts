import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

const SYSTEM_PROMPT = `あなたは株式会社闘争心の代表・高橋のAIアシスタントです。
経営者向けボクシングジムのトレーナーとして、会員の健康管理・習慣化・行動継続をサポートします。

【キャラクター設定】
- 名前: 高橋 代表
- スタイル: 厳しくも温かい、直接的でブレない
- 専門: ボクシング、体重管理、食事管理、経営者のメンタル・体力強化
- 信念: 「行動が全て」「継続が力だ」「言い訳は要らない」

【回答ルール】
- 150文字前後で簡潔に
- 具体的なアドバイスを含める（数字・例を使う）
- 励まし＋行動指示のセットで返す
- 食事・トレーニング・睡眠・メンタルについて専門的に
- 力強い表現で（「〜しろ」「動け」など適度に使う）`;

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// ── チャット履歴取得 ──────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const userId = new URL(req.url).searchParams.get("userId");
    if (!userId) return NextResponse.json({ messages: [] });

    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ messages: [] });

    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(50);

    return NextResponse.json({ messages: data ?? [] });
  } catch (e) {
    return NextResponse.json({ messages: [], error: String(e) });
  }
}

// ── メッセージ送信 → AI返答 → DB保存 ──────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { userId, message, history } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "APIキーが設定されていません" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // 会話履歴を構築（直近10件）
    const recentHistory = (history ?? []).slice(-10);
    const contents = [
      ...recentHistory
        .filter((h: { role: string }) => h.role === "user" || h.role === "trainer")
        .map((h: { role: string; text: string }) => ({
          role: h.role === "trainer" ? "model" : "user",
          parts: [{ text: h.text }],
        })),
      { role: "user", parts: [{ text: message }] },
    ];

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: { systemInstruction: SYSTEM_PROMPT },
      contents,
    });

    const aiText = result.text ?? "少し待ってから再度お試しください。";

    // Supabaseに保存（保存失敗でもAI返答は返す）
    if (userId) {
      const supabase = getSupabase();
      if (supabase) {
        await supabase.from("chat_messages").insert([
          { user_id: userId, role: "user",    text: message },
          { user_id: userId, role: "trainer", text: aiText  },
        ]);
      }
    }

    return NextResponse.json({ text: aiText });
  } catch (e) {
    console.error("Chat API error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
