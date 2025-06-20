'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function BlogStep3Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const draftId = searchParams.get('id')

  const [userId, setUserId] = useState<string | null>(null)
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [draftInfo, setDraftInfo] = useState<{
    title: string
    audience: string
    keywords: string[]
    headings: string[]
  } | null>(null)

  const [generating, setGenerating] = useState(false)

  // ユーザーと下書きを取得
  useEffect(() => {
    const loadDraft = async () => {
      const { data: authData } = await supabase.auth.getUser()
      if (!authData.user) return router.push('/login')
      setUserId(authData.user.id)

      if (!draftId) {
        setError('ドラフトIDが指定されていません')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('trn_blog_drafts')
        .select('title, audience, keywords, headings, summary')
        .eq('id', draftId)
        .single()

      if (error || !data) {
        setError(error?.message || '下書きの読み込みに失敗しました')
        setLoading(false)
        return
      }

      setDraftInfo({
        title: data.title || '',
        audience: data.audience || '',
        keywords: data.keywords || [],
        headings: data.headings || [],
      })
      setSummary(data.summary || '')
      setLoading(false)
    }

    loadDraft()
  }, [draftId, router])

  const handleGenerate = async () => {
    if (!draftInfo) return
    setGenerating(true)
    setError('')

    try {
      const res = await fetch('/api/recommend/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftInfo),
      })
      const data = await res.json()

      if (!res.ok || !data.summary) {
        throw new Error(data.error || 'あらすじの生成に失敗しました')
      }

      setSummary(data.summary)
    } catch (e) {
      setError((e as Error).message || 'API呼び出し失敗')
    } finally {
      setGenerating(false)
    }
  }

  const handleNext = async () => {
    if (!draftId) return

    const { error } = await supabase
      .from('trn_blog_drafts')
      .update({ summary })
      .eq('id', draftId)

    if (error) {
      setError(error.message)
    } else {
      router.push(`/step4?id=${draftId}`)
    }
  }

  if (loading) return <p className="p-4">読み込み中...</p>

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">ステップ3：記事のあらすじを作成しましょう</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <button
        onClick={handleGenerate}
        disabled={generating}
        className="mb-4 bg-green-500 text-white px-4 py-2 rounded"
      >
        {generating ? '生成中...' : 'あらすじを自動生成'}
      </button>

      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        rows={6}
        className="w-full border p-2 rounded mb-4"
        placeholder="あらすじを入力または生成..."
      />

      <div className="flex gap-4">
        <button
          onClick={() => router.push(`/step2?id=${draftId}`)}
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          ステップ2に戻る
        </button>

        <button
          onClick={handleNext}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          次へ（ステップ4）
        </button>
      </div>
    </div>
  )
}
