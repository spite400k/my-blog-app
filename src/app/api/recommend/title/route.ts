// app/api/recommend/title/route.ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { audience } = await req.json()

  const prompt = `
  あなたはブログタイトルの生成アシスタントです。
  想定読者:「${audience}」
  この読者に刺さるブログタイトルを日本語で1つだけ短く提案してください。
  例：「初心者向け副業スタートガイド」
  出力はタイトルだけでお願いします。
  `

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 50,
      temperature: 0.5,
    }),
  })
  const data = await res.json()
  const title = data.choices?.[0]?.message?.content.trim() ?? ''

  return NextResponse.json({ title })
}
