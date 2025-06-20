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
  const [loadingSuggest, setLoadingSuggest] = useState(false)

  const [draftMeta, setDraftMeta] = useState<{
    title?: string
    audience?: string
    keywords?: string[]
  }>({})

  useEffect(() => {
    const loadUserAndDraft = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login')
        return
      }
      setUserId(data.user.id)

      if (draftIdParam) {
        const { data: draft, error } = await supabase
          .from('trn_blog_drafts')
          .select('headings, title, audience, keywords')
          .eq('id', draftIdParam)
          .single()

        if (error) {
          setError(error.message)
        } else {
          setHeadings(draft.headings?.length > 0 ? draft.headings : [''])
          setDraftMeta({
            title: draft.title,
            audience: draft.audience,
            keywords: draft.keywords || [],
          })
          setDraftId(draftIdParam)
        }
      } else {
        const { data: drafts, error } = await supabase
          .from('trn_blog_drafts')
          .select('id, headings, title, audience, keywords')
          .eq('user_id', data.user.id)
          .order('created_at', { ascending: false })
          .limit(1)

        if (error || !drafts || drafts.length === 0) {
          setError('ドラフトが見つかりません')
        } else {
          const latest = drafts[0]
          setDraftId(latest.id)
          setHeadings(latest.headings?.length > 0 ? latest.headings : [''])
          setDraftMeta({
            title: latest.title,
            audience: latest.audience,
            keywords: latest.keywords || [],
          })
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

  // 👇 目次自動提案処理
  const generateHeadings = async () => {
    if (!draftMeta.title || !draftMeta.audience) {
      return setError('タイトルと想定読者が必要です。ステップ1を完了してください。')
    }

    setError('')
    setLoadingSuggest(true)

    try {
      const res = await fetch('/api/recommend/headings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: draftMeta.title,
          audience: draftMeta.audience,
          keywords: draftMeta.keywords,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || '目次の提案に失敗しました（サーバーエラー）')
      }
      let parsedResult: any = {}

      try {
        // まず result が JSON文字列なら parse
        let cleaned = data.result.trim()

        // ```json ... ``` を除去
        if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/```json|```/g, '').trim()
        }

        parsedResult = JSON.parse(cleaned)

        if (!parsedResult.headings || !Array.isArray(parsedResult.headings)) {
          throw new Error('形式が正しくありません（headingsが見つかりません）')
        }

        setHeadings(parsedResult.headings)
      } catch (e) {
        setError('目次の提案に失敗しました（解析エラー）')
        console.error(e)
      }

    } catch (e) {
      console.error(e)
      setError('目次の自動生成に失敗しました')
    } finally {
      setLoadingSuggest(false)
    }
  }

  if (loading) return <p className="p-4">読み込み中...</p>

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">ステップ2：記事の目次を考えましょう</h1>

      {/* ✅ 目次自動生成ボタン */}
      <button
        onClick={generateHeadings}
        disabled={loadingSuggest}
        className="mb-4 bg-green-500 text-white px-4 py-2 rounded"
      >
        {loadingSuggest ? '目次生成中...' : '目次を自動生成'}
      </button>

      {/* ✅ ユーザーが編集するUI */}
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
            <button onClick={() => handleRemoveHeading(i)} className="text-red-500">
              削除
            </button>
          )}
        </div>
      ))}

      <button onClick={handleAddHeading} className="text-blue-500 mb-4">
        ＋ 見出しを追加
      </button>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* ✅ ナビゲーションボタン */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={() => {
            if (draftId) router.push(`/step1?id=${draftId}`)
          }}
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          ステップ1に戻る
        </button>
        <button onClick={handleNext} className="bg-blue-500 text-white px-4 py-2 rounded">
          次へ（ステップ3）
        </button>
      </div>
    </div>
  )
}
