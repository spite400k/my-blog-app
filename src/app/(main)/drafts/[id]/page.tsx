// src/app/(main)/drafts/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function DraftDetailPage() {
  const router = useRouter()
  const pathname = usePathname()
  const draftId = pathname.split('/').pop()!

  const [draft, setDraft] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDraft = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('trn_blog_drafts')
        .select('*')
        .eq('id', draftId)
        .single()

      if (error) {
        setError(error.message)
      } else {
        setDraft(data)
      }
      setLoading(false)
    }
    fetchDraft()
  }, [draftId, router])

  if (loading) return <p className="p-4">読み込み中...</p>
  if (error) return <p className="p-4 text-red-500">{error}</p>
  if (!draft) return <p className="p-4">下書きが見つかりません</p>

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">下書き詳細（閲覧専用）</h1>

      <div><strong>タイトル:</strong> {draft.title || '-'}</div>
      <div><strong>キーワード:</strong> {draft.keywords?.join('、') || '-'}</div>
      <div><strong>アウトライン（概要）:</strong> {draft.summary || '-'}</div>
      <div><strong>あらすじ:</strong> {draft.summary || '-'}</div>
      <div>
        <strong>本文:</strong>
        <pre className="whitespace-pre-wrap border p-2 rounded bg-gray-100">{draft.content || '-'}</pre>
      </div>

      <button
        onClick={() => router.push(`/step1?id=${draftId}`)}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded"
      >
        ステップ1から編集を始める
      </button>
    </div>
  )
}
