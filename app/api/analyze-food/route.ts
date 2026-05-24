import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType, foodName, foodNames } = await req.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY が設定されていません' }, { status: 500 })
    }

    const ai = new GoogleGenAI({ apiKey })

    // ── テキストモード（複数料理）：料理名リストからカロリーを一括計算 ──
    if (foodNames && Array.isArray(foodNames) && foodNames.length > 0) {
      const prompt = `以下の食事メニューのカロリーとタンパク質を分析してください。
※重要：料理名に（中）、3合、大ジョッキなど量やサイズが含まれている場合は、それを考慮して計算してください。

メニュー: ${foodNames.join('、')}

以下のJSON形式で返してください。JSONのみを返し、コードブロックや説明文は不要です。

{
  "foods": [
    { "name": "料理名", "calories": カロリー数値, "protein": タンパク質g数値 }
  ],
  "total_calories": 合計カロリー数値,
  "total_protein": 合計タンパク質g数値,
  "comment": "一言コメント（日本語）"
}`

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: prompt }] }],
      })
      const text = response.text?.trim() ?? ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) return NextResponse.json({ error: 'パース失敗' }, { status: 500 })
      return NextResponse.json(JSON.parse(jsonMatch[0]))
    }

    // ── テキストモード（単品）：料理名からカロリーを計算 ──
    if (foodName) {
      const prompt = `「${foodName}」のカロリーとタンパク質を以下のJSON形式で返してください。
※重要：（中）、3合、大ジョッキなど量やサイズが含まれている場合は、それを考慮して計算してください。
例：生ビール（中）→約200kcal、日本酒3合→約555kcal、ハイボール（大ジョッキ）→約250kcal

JSONのみを返し、コードブロックや説明文は不要です。

{ "calories": カロリー数値, "protein": タンパク質g数値 }`

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: prompt }] }],
      })
      const text = response.text?.trim() ?? ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) return NextResponse.json({ error: 'パース失敗' }, { status: 500 })
      return NextResponse.json(JSON.parse(jsonMatch[0]))
    }

    // ── 画像モード：写真から食事を解析 ──
    const prompt = `この食事の写真を分析して、以下のJSON形式で返してください。
JSONのみを返し、コードブロックや説明文は不要です。

{
  "foods": [
    { "name": "料理名", "calories": カロリー数値, "protein": タンパク質g数値 }
  ],
  "total_calories": 合計カロリー数値,
  "total_protein": 合計タンパク質g数値,
  "comment": "一言コメント（日本語）"
}`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: imageBase64,
              },
            },
          ],
        },
      ],
    })

    const text = response.text?.trim() ?? ''
    console.log('Gemini response:', text)

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI解析結果のパースに失敗しました', raw: text }, { status: 500 })
    }

    const data = JSON.parse(jsonMatch[0])
    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('analyze-food error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
