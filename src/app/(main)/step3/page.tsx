// ================================
// src/app/(main)/step3/page.tsx
// ================================
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function BlogStep3Page() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [summary, setSummary] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) return router.push('/login')
      setUserId(data.user.id)

      const { data: drafts } = await supabase
        .from('trn_blog_drafts')
        .select('id')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (drafts && drafts.length > 0) {
        setDraftId(drafts[0].id)
      } else {
        setError('ドラフトが見つかりません')
      }
    }
    loadUser()
  }, [])

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
      router.push('/step4')
    }
  }

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

      <button onClick={handleNext} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
        次へ（ステップ4）
      </button>
    </div>
  )
}