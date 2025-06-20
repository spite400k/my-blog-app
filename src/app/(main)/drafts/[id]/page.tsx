'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function DraftEditPage() {
  const router = useRouter()
  const pathname = usePathname()
  const draftId = pathname.split('/').pop()!

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    keywords: '',
    outline: '',
    summary: '',
    content: '',
  })

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
        setForm({
          title: data.title || '',
          keywords: data.keywords || '',
          outline: data.outline || '',
          summary: data.summary || '',
          content: data.content || '',
        })
      }
      setLoading(false)
    }
    fetchDraft()
  }, [draftId, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleUpdate = async () => {
    if (!form.title.trim()) return setError('タイトルを入力してください')
    if (!form.content.trim()) return setError('本文を入力してください')

    const { error } = await supabase
      .from('trn_blog_drafts')
      .update({
        title: form.title,
        keywords: form.keywords,
        outline: form.outline,
        summary: form.summary,
        content: form.content,
      })
      .eq('id', draftId)

    if (error) {
      setError(error.message)
    } else {
      alert('下書きを更新しました')
      router.push('/drafts')
    }
  }

  const handleDelete = async () => {
    if (!confirm('本当にこの下書きを削除しますか？')) return

    const { error } = await supabase
      .from('trn_blog_drafts')
      .delete()
      .eq('id', draftId)

    if (error) {
      setError(error.message)
    } else {
      alert('下書きを削除しました')
      router.push('/drafts')
    }
  }

  if (loading) return <p className="p-4">読み込み中...</p>

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">下書き編集</h1>

      {error && <p className="text-red-500">{error}</p>}

      <div>
        <label className="block font-semibold mb-1">タイトル</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="タイトルを入力"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">キーワード</label>
        <input
          type="text"
          name="keywords"
          value={form.keywords}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="カンマ区切りで入力"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">アウトライン（概要）</label>
        <textarea
          name="outline"
          value={form.outline}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          rows={3}
          placeholder="記事のアウトラインを入力"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">あらすじ</label>
        <textarea
          name="summary"
          value={form.summary}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          rows={3}
          placeholder="記事のあらすじを入力"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">本文</label>
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          rows={10}
          placeholder="本文を入力"
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleUpdate}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          更新する
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          削除する
        </button>
      </div>
    </div>
  )
}
