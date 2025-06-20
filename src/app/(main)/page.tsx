'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TopPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login')
      } else {
        setUserId(data.user.id)
      }
    }
    checkAuth()
  }, [router])

  const handleStart = () => {
    router.push('/step1')
  }

  const handleViewDrafts = () => {
    router.push('/drafts')
  }

  return (
    <div className="max-w-xl mx-auto p-4 text-center">
      <h1 className="text-3xl font-bold mb-6">ブログ作成アプリへようこそ</h1>
      <p className="mb-6">初心者でも簡単にブログが書けるステップ形式のサポートアプリです。</p>
      <div className="space-y-4">
        <button
          onClick={handleStart}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg"
        >
          はじめる（ステップ1へ）
        </button>
        <br />
        <button
          onClick={handleViewDrafts}
          className="bg-gray-600 text-white px-6 py-3 rounded-lg text-lg"
        >
          下書きを見る
        </button>
      </div>
    </div>
  )
}