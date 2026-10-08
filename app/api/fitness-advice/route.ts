import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { ACTIVITY_LABELS } from "@/lib/nutritionCalc";

export async function POST(req: NextRequest) {
  try {
    const { profile, targets } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEYが設定されていません" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `あなたは株式会社闘争心の代表・高橋です。経営者向けボクシングジムのトレーナーとして、以下のクライアントデータを元に厳しくも具体的なアドバイスをしてください。

【クライアントデータ】
性別: ${profile.gender === "male" ? "男性" : "女性"} / 年齢: ${profile.age}歳
現在: 身長${profile.height}cm・体重${profile.weight}kg・体脂肪率${profile.bodyFat}%
目標: 体重${profile.goalWeight}kg・体脂肪率${profile.goalBodyFat}%
活動レベル: ${ACTIVITY_LABELS[profile.activityLevel] || profile.activityLevel}

【算出された1日の目標栄養素】
目標カロリー: ${targets.targetCalories}kcal（基礎代謝:${targets.bmr}kcal / TDEE:${targets.tdee}kcal）
タンパク質: ${targets.protein}g（体重×2.2g/kg）
炭水化物: ${targets.carbs}g
脂質: ${targets.fat}g

以下の3セクションで、具体的な数値を使ってアドバイスしてください（各セクション150字程度）:

## 🍽️ 食事プラン
このカロリー・PFCが必要な理由と、具体的な食材・食事タイミング（朝/昼/夜/間食の配分も）

## 🥊 トレーニングプラン
週何回・どの種類（ボクシング、筋トレ、有酸素）・強度と具体的なメニュー例

## 📅 目標達成タイムライン
現在の体脂肪率${profile.bodyFat}%から${profile.goalBodyFat}%へ、体重${profile.weight}kgから${profile.goalWeight}kgへの現実的な期間と段階的マイルストーン

力強い口調で、「〜しろ」「動け」「これだけやれ」など高橋代表らしい表現を適度に使ってください。`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    return NextResponse.json({
      advice: result.text ?? "アドバイスを取得できませんでした。",
    });
  } catch (e) {
    console.error("Fitness advice error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
