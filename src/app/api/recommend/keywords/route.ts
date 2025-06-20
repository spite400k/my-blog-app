// OpenAI APIでキーワードを生成
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { title, audience } = await req.json()

const prompt = `
以下のブログ構成に基づいて、検索キーワードの候補を5セット提案してください。
各セットには3つのキーワードを含めてください。
出力は以下のようなJSON形式で返してください：

{
  "keyword_sets": [
    ["キーワード1", "キーワード2", "キーワード3"],
    ["キーワード4", "キーワード5", "キーワード6"],
    ...
  ]
}

タイトル: ${title}
想定読者: ${audience}

[キーワード提案: ]という文言は不要

  `

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
      temperature: 0.4,
      // response_format: 'json',     // ← GPT-4であれば必須（gpt-3.5では未対応）
    })
  })

  const data = await res.json()

  if (!data.choices || !data.choices[0]?.message?.content) {
    console.error('OpenAI response error:', data)
    return new Response(JSON.stringify({ result: "" }), { status: 200 })
  }
  
  const output = data.choices?.[0]?.message?.content || ''
  return NextResponse.json({ result: output })
}
