// app/api/recommend/audience/route.ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { title } = await req.json()

  const prompt = `
  あなたはブログの想定読者を提案するアシスタントです。
  ブログタイトル:「${title}」
  このタイトルに合う読者像を日本語で1つだけ提案してください。
  例：「副業に興味がある会社員」
  出力は読者像だけにしてください。
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
  const audience = data.choices?.[0]?.message?.content.trim() ?? ''

  return NextResponse.json({ audience })
}
