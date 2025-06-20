'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Draft = {
  id: string
  title: string
  created_at: string
}

export default function DraftsPage() {
  const router = useRouter()
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDrafts = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        router.push('/login')
        return
      }
      const userId = userData.user.id

      const { data, error } = await supabase
        .from('trn_blog_drafts')
        .select('id, title, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        setDrafts(data || [])
      }
      setLoading(false)
    }
    fetchDrafts()
  }, [router])

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">下書き一覧</h1>
      {loading && <p>読み込み中...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && drafts.length === 0 && <p>下書きはまだありません。</p>}
      <ul>
        {drafts.map((draft) => (
          <li
            key={draft.id}
            className="border-b py-2 cursor-pointer hover:bg-gray-100"
            onClick={() => router.push(`/drafts/${draft.id}`)}
          >
            <div className="font-semibold">{draft.title || 'タイトルなし'}</div>
            <div className="text-sm text-gray-600">
              {new Date(draft.created_at).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
