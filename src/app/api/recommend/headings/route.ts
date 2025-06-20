import { NextResponse } from 'next/server'


export async function POST(req: Request) {
  const { title, audience, keywords } = await req.json()

    const prompt = `
      あなたはプロのライターです。
      次のブログのタイトル、想定読者、キーワードから
      記事の目次（見出し）を5つ提案してください。

      タイトル: ${title}
      想定読者: ${audience}
      キーワード: ${Array.isArray(keywords) ? keywords.join(', ') : ''}

      結果はJSON形式で、"headings"キーに文字列配列で返してください。
      JSON形式で、コードブロックなし・エスケープなしで返してください。
      例：
      {
        "headings": [
          "はじめに",
          "基本知識",
          "実践方法",
          "注意点",
          "まとめ"
        ]
      }
      `

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo',
      messages: [{ role: 'system', content: 'あなたは親切なアシスタントです。' },{ role: 'user', content: prompt }],
      max_tokens: 1000,
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
