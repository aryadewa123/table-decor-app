'use client'

import TopHeader from '@/components/TopHeader'
import BottomNav from '@/components/BottomNav'
import InventoryManager from '@/components/InventoryManager'
import { useAuth } from '@/lib/auth-context'
import { translate } from '@/lib/i18n'

export default function InventoryPage() {
  const { user } = useAuth()
  const t = (key: Parameters<typeof translate>[1]) =>
    translate(user?.language ?? 'id', key)

  return (
    <div className="min-h-screen flex flex-col bg-transparent selection:bg-[#FFEDA8] selection:text-[#322A5E]">
      <TopHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#DED9F4]/70">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#322A5E]">
              {t('page.inventory')}
            </h1>
            <p className="text-xs text-[#7B739B] mt-0.5">
              {t('page.inventoryDescription')}
            </p>
          </div>
        </div>

        <InventoryManager />
      </main>

      <BottomNav />
    </div>
  )
}