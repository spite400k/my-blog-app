// ================================
// src/app/(main)/step3/page.tsx
// ================================
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function BlogStep3Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const draftIdParam = searchParams.get('id')

  const [userId, setUserId] = useState<string | null>(null)
  const [draftId, setDraftId] = useState<string | null>(draftIdParam)
  const [summary, setSummary] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUserAndDraft = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login')
        return
      }
      setUserId(data.user.id)

      if (draftIdParam) {
        // id指定あり：そのドラフトを取得
        const { data: draft, error } = await supabase
          .from('trn_blog_drafts')
          .select('summary')
          .eq('id', draftIdParam)
          .single()

        if (error) {
          setError(error.message)
        } else {
          setSummary(draft.summary || '')
          setDraftId(draftIdParam)
        }
      } else {
        // id指定なし：最新ドラフト取得
        const { data: drafts, error } = await supabase
          .from('trn_blog_drafts')
          .select('id, summary')
          .eq('user_id', data.user.id)
          .order('created_at', { ascending: false })
          .limit(1)

        if (error || !drafts || drafts.length === 0) {
          setError('ドラフトが見つかりません')
        } else {
          setDraftId(drafts[0].id)
          setSummary(drafts[0].summary || '')
        }
      }
      setLoading(false)
    }
    loadUserAndDraft()
  }, [draftIdParam, router])

  const handleNext = async () => {
    if (!draftId) return setError('下書きIDが見つかりません')
    if (!summary.trim()) return setError('あらすじを入力してください')

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
      <h1 className="text-2xl font-bold mb-6">ステップ3：記事のあらすじを作成</h1>

      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        className="w-full h-40 border p-2 rounded"
        placeholder="記事の目的・全体像・読者のメリットを簡単にまとめましょう"
      />

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <div className="flex gap-4 mt-4">
        {/* 戻るボタン */}
        <button
          onClick={() => {
            if (draftId) router.push(`/step2?id=${draftId}`)
          }}
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          ステップ2に戻る
        </button>

        {/* 次へボタン */}
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
