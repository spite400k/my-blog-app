// ================================
// src/app/(main)/step1/page.tsx
// ================================
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function BlogStep1Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const draftId = searchParams.get('id')

  const [userId, setUserId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [audience, setAudience] = useState('')
  const [keywords, setKeywords] = useState(['', '', ''])
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

      if (draftId) {
        const { data: draft, error } = await supabase
          .from('trn_blog_drafts')
          .select('title, audience, keywords')
          .eq('id', draftId)
          .single()

        if (error) {
          setError(error.message)
        } else if (draft) {
          setTitle(draft.title || '')
          setAudience(draft.audience || '')
          setKeywords(draft.keywords?.length ? draft.keywords : ['', '', ''])
        }
      }
      setLoading(false)
    }
    loadUserAndDraft()
  }, [draftId, router])

  const handleKeywordChange = (index: number, value: string) => {
    const newKeywords = [...keywords]
    newKeywords[index] = value
    setKeywords(newKeywords)
  }

  const handleNext = async () => {
    if (!title.trim()) return setError('ブログタイトルを入力してください')
    if (!userId) return setError('ログイン情報を取得できません')

    if (draftId) {
      // 更新
      const { error } = await supabase
        .from('trn_blog_drafts')
        .update({
          title,
          audience,
          keywords: keywords.filter(k => k.trim() !== ''),
        })
        .eq('id', draftId)

      if (error) {
        setError(error.message)
        return
      }
    } else {
      // 新規作成
      const { data, error } = await supabase
        .from('trn_blog_drafts')
        .insert({
          user_id: userId,
          title,
          audience,
          keywords: keywords.filter(k => k.trim() !== ''),
        })
        .select('id')
        .single()

      if (error || !data) {
        setError(error?.message || '新規作成に失敗しました')
        return
      }
      router.push(`/step2?id=${data.id}`)
      return
    }

    // 更新後はstep2に遷移
    router.push(`/step2?id=${draftId}`)
  }

  if (loading) return <p className="p-4">読み込み中...</p>

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">ステップ1：ブログ構成を決めましょう</h1>

      <div className="mb-4">
        <label className="block font-medium mb-1">ブログタイトル</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="例：初心者のための副業ブログの始め方"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">想定読者</label>
        <input
          type="text"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="例：副業に興味がある会社員"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">キーワード（最大3つ）</label>
        {keywords.map((kw, i) => (
          <input
            key={i}
            type="text"
            value={kw}
            onChange={(e) => handleKeywordChange(i, e.target.value)}
            className="w-full border p-2 rounded mb-2"
            placeholder={`キーワード${i + 1}`}
          />
        ))}
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <button onClick={handleNext} className="bg-blue-500 text-white px-4 py-2 rounded">
        次へ（ステップ2）
      </button>
    </div>
  )
}
