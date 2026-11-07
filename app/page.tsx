'use client'

import { useEffect, useState } from 'react'
import TopHeader from '@/components/TopHeader'
import BottomNav from '@/components/BottomNav'
import { useAuth } from '@/lib/auth-context'
import { translate } from '@/lib/i18n'
import { supabase } from '@/lib/supabase'

interface CategorySummary {
  id: string | number
  name: string
}

export default function Home() {
  const { user } = useAuth()
  const t = (key: Parameters<typeof translate>[1]) =>
    translate(user?.language ?? 'id', key)
  const [categories, setCategories] = useState<CategorySummary[]>([])

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase.from('categories').select('*')
      if (error) console.error('Error fetching:', error)
      else setCategories(data || [])
    }
    fetchCategories()
  }, [])

  return (
    <div className="min-h-dvh flex flex-col">
      <TopHeader />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-32">
        <h1 className="text-2xl font-bold mb-4">{t('home.title')}</h1>
        <p className="mb-2">{t('home.databaseStatus')}</p>
        <div className="p-4 border rounded bg-gray-50 text-black">
          {categories.length === 0 ? (
            <p className="text-gray-500">{t('home.databaseEmpty')}</p>
          ) : (
            <ul className="list-disc pl-5">
              {categories.map((cat) => (
                <li key={cat.id}>{cat.name}</li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}