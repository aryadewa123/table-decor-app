'use client'

import { PlusIcon } from '@/components/icons/Icons'

interface FABProps {
  onClick: () => void
}

export default function FAB({ onClick }: FABProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Catat Deal Baru"
      className="fixed right-5 bottom-20 z-40 w-13 h-13 rounded-full bg-[#FFEDA8] hover:bg-[#FFE892] text-[#4A3E85] border border-[#F0DA80] shadow-lg shadow-[#C9A227]/20 flex items-center justify-center transition-all active:scale-95"
    >
      <PlusIcon className="w-6 h-6 stroke-[2.2]" />
    </button>
  )
}