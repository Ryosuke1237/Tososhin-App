import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY が設定されていません' }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

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

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: imageBase64,
        },
      },
    ])

    const text = result.response.text().trim()
    console.log('Gemini response:', text)

    // JSONを抽出（```json ブロックが含まれる場合も対応）
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
