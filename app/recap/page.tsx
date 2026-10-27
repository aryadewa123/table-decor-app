'use client'

import { useState, Suspense } from 'react'
import TopHeader from '@/components/TopHeader'
import BottomNav from '@/components/BottomNav'
import EventManager from '@/components/EventManager'
function RecapContent() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-transparent selection:bg-[#FFEDA8] selection:text-[#322A5E]">
      <TopHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 space-y-6">
        {/* Recap Header with "Deal Event Baru" Button - Export CSV available in filter controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DED9F4]/70">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#322A5E]">
              Recap
            </h1>
            <p className="text-xs text-[#7B739B] mt-0.5">
              Rekap lengkap transaksi deal decor, status pelunasan, dan pencatatan event
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Primary Tambah Button (only on Recap page) */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[#322A5E] bg-[#FFEDA8] hover:bg-[#FFE892] active:scale-95 transition-all shadow-md shadow-[#FFEDA8]/60 border border-[#FAE489]"
            >
              <span className="text-lg leading-none">+</span>
              <span>Deal Event Baru</span>
            </button>
          </div>
        </div>

        {/* Floral divider */}
        <div className="floral-divider my-4"></div>

        <EventManager
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
      </main>

      <BottomNav />
    </div>
  )
}

export default function RecapPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-[#7B739B]">
          Memuat rekap transaksi...
        </div>
      }
    >
      <RecapContent />
    </Suspense>
  )
}