// ================================
// src/app/(main)/step4/page.tsx
// ================================
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function BlogStep4Page() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [content, setContent] = useState('')
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

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">ステップ4：本文を作成しましょう</h1>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-80 border p-2 rounded"
        placeholder="これまでの内容をもとに、記事本文を自由に書いてください"
      />

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <button onClick={handleSubmit} className="mt-4 bg-green-600 text-white px-4 py-2 rounded">
        完了する
      </button>
    </div>
  )
}