// ================================
// src/app/(main)/step2/page.tsx
// ================================
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function BlogStep2Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const draftIdParam = searchParams.get('id')

  const [userId, setUserId] = useState<string | null>(null)
  const [draftId, setDraftId] = useState<string | null>(draftIdParam)
  const [headings, setHeadings] = useState([''])
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
        // id指定あれば読み込み
        const { data: draft, error } = await supabase
          .from('trn_blog_drafts')
          .select('headings')
          .eq('id', draftIdParam)
          .single()

        if (error) {
          setError(error.message)
        } else {
          setHeadings(draft.headings && draft.headings.length > 0 ? draft.headings : [''])
          setDraftId(draftIdParam)
        }
      } else {
        // id指定なければ最新ドラフト取得（自分の最新1件）
        const { data: drafts, error } = await supabase
          .from('trn_blog_drafts')
          .select('id, headings')
          .eq('user_id', data.user.id)
          .order('created_at', { ascending: false })
          .limit(1)

        if (error || !drafts || drafts.length === 0) {
          setError('ドラフトが見つかりません')
        } else {
          setDraftId(drafts[0].id)
          setHeadings(drafts[0].headings && drafts[0].headings.length > 0 ? drafts[0].headings : [''])
        }
      }
      setLoading(false)
    }
    loadUserAndDraft()
  }, [draftIdParam, router])

  const handleHeadingChange = (index: number, value: string) => {
    const updated = [...headings]
    updated[index] = value
    setHeadings(updated)
  }

  const handleAddHeading = () => {
    setHeadings([...headings, ''])
  }

  const handleRemoveHeading = (index: number) => {
    setHeadings(headings.filter((_, i) => i !== index))
  }

  const handleNext = async () => {
    if (!draftId) return setError('下書きIDが見つかりません')

    const cleanedHeadings = headings.filter(h => h.trim() !== '')
    if (cleanedHeadings.length === 0) {
      return setError('1つ以上の見出しを入力してください')
    }

    const { error } = await supabase
      .from('trn_blog_drafts')
      .update({ headings: cleanedHeadings })
      .eq('id', draftId)

    if (error) {
      setError(error.message)
    } else {
      router.push(`/step3?id=${draftId}`)
    }
  }

  if (loading) return <p className="p-4">読み込み中...</p>

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">ステップ2：記事の目次を考えましょう</h1>

      {headings.map((heading, i) => (
        <div key={i} className="mb-2 flex gap-2">
          <input
            type="text"
            value={heading}
            onChange={(e) => handleHeadingChange(i, e.target.value)}
            className="flex-1 border p-2 rounded"
            placeholder={`見出し${i + 1}`}
          />
          {headings.length > 1 && (
            <button onClick={() => handleRemoveHeading(i)} className="text-red-500">削除</button>
          )}
        </div>
      ))}

      <button onClick={handleAddHeading} className="text-blue-500 mb-4">＋ 見出しを追加</button>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="flex gap-4 mt-4">
        {/* 戻るボタン */}
        <button
          onClick={() => {
            if (draftId) router.push(`/step1?id=${draftId}`)
          }}
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          ステップ1に戻る
        </button>

        {/* 次へボタン */}
        <button
          onClick={handleNext}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          次へ（ステップ3）
        </button>
      </div>
    </div>
  )
}
