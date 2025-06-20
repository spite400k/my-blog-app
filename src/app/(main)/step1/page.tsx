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

  // 追加：自動提案ボタンのローディング状態
  const [loadingKeyword, setLoadingKeyword] = useState(false)
  const [loadingTitle, setLoadingTitle] = useState(false)
  const [loadingAudience, setLoadingAudience] = useState(false)

  const [recommendSets, setRecommendSets] = useState<string[][]>([])
  const [showModal, setShowModal] = useState(false)

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

  const handleRecommend = async () => {

    if (!title || !audience) {
      return setError('タイトルと想定読者を入力してください')
    }
    setError('')
    setLoadingKeyword(true)
    try {
      const res = await fetch('/api/recommend/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, audience })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'キーワードの提案に失敗しました')
      }
      if (!data.result) {
        throw new Error('結果が見つかりません')
      }
      const parsed = JSON.parse(data.result)
      if (!parsed.keyword_sets || !Array.isArray(parsed.keyword_sets)) {
        throw new Error('形式が正しくありません')
      }
      setRecommendSets(parsed.keyword_sets)
      setShowModal(true)
    } catch (e) {
      setError('キーワードの提案に失敗しました')
      console.error(e)
    } finally {
      setLoadingKeyword(false)
    }
  }

  // 追加：タイトル自動提案
  const generateTitle = async () => {
    if (!audience.trim()) {
      setError('先に想定読者を入力してください')
      return
    }
    setError('')
    setLoadingTitle(true)
    try {
      const res = await fetch('/api/recommend/title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audience }),
      })
      const data = await res.json()
      if (data.title) {
        setTitle(data.title)
      } else {
        setError('タイトル提案に失敗しました')
      }
    } catch {
      setError('タイトル提案APIエラー')
    } finally {
      setLoadingTitle(false)
    }
  }

  // 追加：読者自動提案
  const generateAudience = async () => {
    if (!title.trim()) {
      setError('先にブログタイトルを入力してください')
      return
    }
    setError('')
    setLoadingAudience(true)
    try {
      const res = await fetch('/api/recommend/audience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })
      const data = await res.json()
      if (data.audience) {
        setAudience(data.audience)
      } else {
        setError('読者提案に失敗しました')
      }
    } catch {
      setError('読者提案APIエラー')
    } finally {
      setLoadingAudience(false)
    }
  }

  if (loading) return <p className="p-4">読み込み中...</p>

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">ステップ1：ブログ構成を決めましょう</h1>

      <div className="mb-4">
        <label className="block font-medium mb-1">ブログタイトル</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 border p-2 rounded"
            placeholder="例：初心者のための副業ブログの始め方"
          />
          <button
            onClick={generateTitle}
            disabled={loadingTitle}
            className="bg-green-500 text-white px-3 rounded"
          >
            {loadingTitle ? '生成中...' : 'タイトル提案'}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">想定読者</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="flex-1 border p-2 rounded"
            placeholder="例：副業に興味がある会社員"
          />
          <button
            onClick={generateAudience}
            disabled={loadingAudience}
            className="bg-green-500 text-white px-3 rounded"
          >
            {loadingAudience ? '生成中...' : '読者提案'}
          </button>
        </div>
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
        {/* 「おすすめを生成」ボタン追加 */}
        <button
          onClick={handleRecommend}
          className="mb-4 bg-gray-300 text-black px-4 py-2 rounded"
        >
          {loadingKeyword ? '生成中...' : 'おすすめのキーワードを生成'}
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {showModal && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)} // 外側クリックで閉じる
        >
          <div
            className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg"
            onClick={(e) => e.stopPropagation()} // 内側クリックは無視
          >
            <h2 className="text-lg font-bold mb-4">おすすめのキーワード</h2>
            <p className="text-sm text-gray-500 mb-2">1セットをクリックして適用</p>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {recommendSets.map((set, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setKeywords(set)
                    setShowModal(false)
                  }}
                  className="w-full text-left border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded"
                >
                  {set.join(' / ')}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 text-sm bg-gray-300 text-black rounded hover:bg-gray-200 px-4 py-2"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      <button onClick={handleNext} className="bg-blue-500 text-white px-4 py-2 rounded">
        次へ（ステップ2）
      </button>
    </div>
  )
}
