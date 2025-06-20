import { NextResponse } from 'next/server';

export async function POST(req: Request) {

  const { title, audience, keywords, headings,summary, max_length } = await req.json();

  if (!title || !audience || !headings || !summary || !max_length) {
    return NextResponse.json({ error: '不正な入力です' }, { status: 400 });
  }

  // ChatGPTへのプロンプト例
  const prompt = `
あなたはプロのライターです。以下の情報をもとに、魅力的で読みやすいブログ記事を書いてください。

タイトル: ${title}
想定読者: ${audience}
キーワード: ${keywords?.join(', ') || ''}
目次:
${headings.map((h: string, i: number) => `${i + 1}. ${h}`).join('\n')}

あらすじ:
${summary}

この記事の本文を、各見出しごとに段落を分けて書いてください。
記事の文字数は${max_length}文字以内にしてください。

`

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo',
      messages: [{ role: 'system', content: 'あなたは親切なアシスタントです。' },{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.5,
    }),
  })

  const data = await res.json()

  if (!data.choices || !data.choices[0]?.message?.content) {
    console.error('OpenAI response error:', data)
    return new Response(JSON.stringify({ result: "" }), { status: 200 })
  }
  
  const output = data.choices?.[0]?.message?.content || ''
  return NextResponse.json({ result: output })
}