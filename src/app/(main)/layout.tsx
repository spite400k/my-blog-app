'use client'
import { ReactNode } from 'react'
import Link from 'next/link'

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow p-4">
        <h1 className="text-xl font-bold">
          <Link href="/" className="hover:underline">
            Blog Maker
          </Link>
        </h1>
      </header>
      <main className="p-4">{children}</main>
    </div>
  )
}
