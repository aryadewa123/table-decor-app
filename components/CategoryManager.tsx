'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Category } from '@/lib/types'

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(`Gagal memuat kategori: ${fetchError.message}`)
      console.error('Error fetching categories:', fetchError)
    } else {
      setCategories(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = newCategoryName.trim()
    if (!trimmed) return

    setSubmitting(true)
    setError(null)

    const { error: insertError } = await supabase
      .from('categories')
      .insert({ name: trimmed })

    if (insertError) {
      setError(`Gagal menambah kategori: ${insertError.message}`)
      console.error('Error inserting category:', insertError)
    } else {
      setNewCategoryName('')
      await fetchCategories()
    }
    setSubmitting(false)
  }

  async function handleDeleteCategory(id: number, name: string) {
    const confirmed = window.confirm(
      `Yakin ingin menghapus kategori "${name}"?\nSemua barang dalam kategori ini juga akan terdampak.`
    )
    if (!confirmed) return

    setError(null)
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (deleteError) {
      setError(`Gagal menghapus kategori: ${deleteError.message}`)
      console.error('Error deleting category:', deleteError)
    } else {
      await fetchCategories()
    }
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-2xl">📂</span> Manajemen Kategori
      </h2>

      {/* Form Tambah Kategori */}
      <form onSubmit={handleAddCategory} className="flex gap-3 mb-5">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Nama kategori baru..."
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          disabled={submitting}
          required
        />
        <button
          type="submit"
          disabled={submitting || !newCategoryName.trim()}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Menambah...
            </span>
          ) : (
            '+ Tambah Kategori'
          )}
        </button>
      </form>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
          <span className="mt-0.5">⚠️</span>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabel Kategori */}
      {loading ? (
        <div className="flex items-center justify-center py-8 text-gray-400">
          <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Memuat kategori...
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p className="text-4xl mb-2">📭</p>
          <p>Belum ada kategori. Tambahkan kategori pertama Anda!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                  No
                </th>
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Nama Kategori
                </th>
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-48">
                  Dibuat
                </th>
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24 text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat, index) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 text-sm text-gray-500">{index + 1}</td>
                  <td className="py-3 text-sm font-medium text-gray-800">
                    {cat.name}
                  </td>
                  <td className="py-3 text-sm text-gray-500">
                    {cat.created_at
                      ? new Date(cat.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '-'}
                  </td>
                  <td className="py-3 text-center">
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                      title={`Hapus ${cat.name}`}
                    >
                      🗑️ Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Info */}
      {!loading && categories.length > 0 && (
        <p className="mt-4 text-xs text-gray-400">
          Total: {categories.length} kategori
        </p>
      )}
    </section>
  )
}