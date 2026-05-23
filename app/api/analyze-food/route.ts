import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY が設定されていません' }, { status: 500 })
    }

    const ai = new GoogleGenAI({ apiKey })

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
