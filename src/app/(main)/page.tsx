'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function TopPage() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login')
      } else {
        setUser(data.user)
      }
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">メニュー</h2>
        <ul>
          <li className="mb-2">🏠 ダッシュボード</li>
          <li className="mb-2">✏️ ブログを書く</li>
          <li className="mb-2">📚 記事一覧</li>
        </ul>
      </aside>
      <main className="flex-1 p-6">
        <h1 className="text-2xl mb-4">TOPページ</h1>
        {user && <p>ようこそ、{user.email} さん</p>}
        <button onClick={handleLogout} className="mt-4 p-2 bg-red-500 text-white">ログアウト</button>
      </main>
    </div>
  )
}