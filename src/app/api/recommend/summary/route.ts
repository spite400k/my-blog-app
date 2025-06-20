// ================================
// src/app/api/recommend/summary/route.ts
// ================================

import { NextResponse } from 'next/server';


export async function POST(req: Request) {

    const { title, audience, keywords, headings } = await req.json();

    if (!title || !audience || !Array.isArray(headings)) {
      return NextResponse.json({ error: '不正な入力です' }, { status: 400 });
    }

    const prompt = `以下のブログ構成をもとに、読者に向けた丁寧で親しみやすいあらすじを日本語で作成してください。120〜200文字程度にしてください。

タイトル: ${title}
想定読者: ${audience}
キーワード: ${keywords?.join(', ') || 'なし'}
目次:
${headings.map((h, i) => `${i + 1}. ${h}`).join('\n')}`;

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
  return NextResponse.json({ summary: output })
}
