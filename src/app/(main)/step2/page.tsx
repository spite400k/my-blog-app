// ================================
// src/app/(main)/step2/page.tsx
// ================================
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function BlogStep2Page() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [headings, setHeadings] = useState([''])
  const [error, setError] = useState('')

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) return router.push('/login')
      setUserId(data.user.id)

      // 最新のドラフトを取得（仮: 自分の最新1件を取得）
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
      router.push('/step3')
    }
  }

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

      <button onClick={handleNext} className="bg-blue-500 text-white px-4 py-2 rounded">
        次へ（ステップ3）
      </button>
    </div>
  )
}
