// src/app/(main)/layout.tsx
import { ReactNode } from 'react'

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow p-4">
        <h1 className="text-xl font-bold">Blog Maker</h1>
      </header>
      <main className="p-4">{children}</main>
    </div>
  )
}
