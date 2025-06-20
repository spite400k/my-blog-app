// ================================
// src/app/(main)/step4/page.tsx
// ================================
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function BlogStep4Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const draftIdParam = searchParams.get('id')

  const [userId, setUserId] = useState<string | null>(null)
  const [draftId, setDraftId] = useState<string | null>(draftIdParam)
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [draftData, setDraftData] = useState<{
    title?: string
    audience?: string
    keywords?: string[]
    headings?: string[]
    summary?: string
  }>({})

  // 追加：文字数指定（初期値3000）
  const [length, setLength] = useState(3000)

  useEffect(() => {
    const loadUserAndDraft = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login')
        return
      }
      setUserId(data.user.id)

      if (draftIdParam) {
        // id指定あり：対象ドラフトを取得
        const { data: draft, error } = await supabase
          .from('trn_blog_drafts')
          .select('title, audience, keywords, headings, summary, content')
          .eq('id', draftIdParam)
          .single()

        if (error) {
          setError(error.message)
        } else if (draft) {
          setDraftData({
            title: draft.title,
            audience: draft.audience,
            keywords: draft.keywords,
            headings: draft.headings,
            summary: draft.summary,
          })
          setContent(draft.content || '')
          setDraftId(draftIdParam)
        }
      } else {
        // id指定なし：ログインユーザーの最新ドラフト取得
        const { data: drafts, error } = await supabase
          .from('trn_blog_drafts')
          .select('id, content')
          .eq('user_id', data.user.id)
          .order('created_at', { ascending: false })
          .limit(1)

        if (error || !drafts || drafts.length === 0) {
          setError('ドラフトが見つかりません')
        } else {
          setDraftId(drafts[0].id)
          setContent(drafts[0].content || '')
        }
      }
      setLoading(false)
    }
    loadUserAndDraft()
  }, [draftIdParam, router])

  const generateArticle = async () => {
    if (!draftId) {
      setError('ドラフトIDがありません')
      return
    }
    if (!draftData.title || !draftData.audience || !draftData.headings || !draftData.summary) {
      setError('タイトル、想定読者、目次、あらすじがすべて揃っている必要があります。')
      return
    }
    setError('')
    setGenerating(true)

    try {
      const res = await fetch('/api/generate/article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: draftData.title,
          audience: draftData.audience,
          keywords: draftData.keywords,
          headings: draftData.headings,
          summary: draftData.summary,
          max_length: length,  // ここで文字数を渡す
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '記事の生成に失敗しました（HTTPエラー）')
      }

      if (!data.result) {
        throw new Error(data.error || '記事の生成に失敗しました（結果がありません）')
      }

      setContent(data.result)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setGenerating(false)
    }
  }

  const handleSubmit = async () => {
    if (!draftId) return setError('下書きIDが見つかりません')
    if (!content.trim()) return setError('本文を入力してください')

    const { error } = await supabase
      .from('trn_blog_drafts')
      .update({ content })
      .eq('id', draftId)

    if (error) {
      setError(error.message)
    } else {
      alert('記事の下書きが完了しました！')
      router.push('/')
    }
  }

  if (loading) return <p className="p-4">読み込み中...</p>

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">ステップ4：本文を作成しましょう</h1>

      {/* 文字数指定フォーム */}
      <label className="block mb-2 font-medium">生成する記事の文字数（目安）</label>
      <input
        type="number"
        value={length}
        onChange={(e) => setLength(Number(e.target.value))}
        min={500}
        max={5000}
        step={100}
        className="border p-2 rounded w-40 mb-4"
      />

      <button
        onClick={generateArticle}
        disabled={generating}
        className="mb-4 bg-green-600 text-white px-4 py-2 rounded"
      >
        {generating ? '記事を生成中...' : '記事を自動生成する'}
      </button>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-80 border p-2 rounded"
        placeholder="これまでの内容をもとに、記事本文を自由に書いてください"
      />

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <div className="flex gap-4 mt-4">
        {/* 戻るボタン */}
        <button
          onClick={() => {
            if (draftId) router.push(`/step3?id=${draftId}`)
          }}
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          ステップ3に戻る
        </button>

        {/* 完了ボタン */}
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          完了する
        </button>
      </div>
    </div>
  )
}
