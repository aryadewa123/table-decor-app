'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Category, Item } from '@/lib/types'
import FloralSelect from '@/components/FloralSelect'

export default function ItemManager() {
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [itemName, setItemName] = useState('')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [stock, setStock] = useState<number | ''>('')

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('items')
      .select('*, categories(name)')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(`Gagal memuat barang: ${fetchError.message}`)
      console.error('Error fetching items:', fetchError)
    } else {
      setItems(data || [])
    }
    setLoading(false)
  }, [])

  const fetchCategories = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (fetchError) {
      console.error('Error fetching categories for dropdown:', fetchError)
    } else {
      setCategories(data || [])
    }
  }, [])

  useEffect(() => {
    fetchItems()
    fetchCategories()
  }, [fetchItems, fetchCategories])

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault()
    const trimmedName = itemName.trim()
    if (!trimmedName || categoryId === '' || stock === '') return

    setSubmitting(true)
    setError(null)

    const { error: insertError } = await supabase.from('items').insert({
      name: trimmedName,
      category_id: Number(categoryId),
      stock: Number(stock),
    })

    if (insertError) {
      setError(`Gagal menambah barang: ${insertError.message}`)
      console.error('Error inserting item:', insertError)
    } else {
      setItemName('')
      setCategoryId('')
      setStock('')
      await fetchItems()
    }
    setSubmitting(false)
  }

  async function handleDeleteItem(id: number, name: string) {
    const confirmed = window.confirm(
      `Yakin ingin menghapus barang "${name}"?`
    )
    if (!confirmed) return

    setError(null)
    const { error: deleteError } = await supabase
      .from('items')
      .delete()
      .eq('id', id)

    if (deleteError) {
      setError(`Gagal menghapus barang: ${deleteError.message}`)
      console.error('Error deleting item:', deleteError)
    } else {
      await fetchItems()
    }
  }

  function getStockBadgeClass(stockCount: number): string {
    if (stockCount === 0) return 'bg-red-100 text-red-700'
    if (stockCount <= 5) return 'bg-yellow-100 text-yellow-700'
    return 'bg-green-100 text-green-700'
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-2xl">📦</span> Manajemen Barang
      </h2>

      {/* Form Tambah Barang */}
      <form onSubmit={handleAddItem} className="mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Nama barang..."
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            disabled={submitting}
            required
          />

          <FloralSelect
            value={categoryId === '' ? '' : String(categoryId)}
            onChange={(value) => setCategoryId(value ? Number(value) : '')}
            ariaLabel="Pilih Kategori"
            placeholder="-- Pilih Kategori --"
            required
            className="w-full"
            disabled={submitting}
            options={[
              { value: '', label: '-- Pilih Kategori --' },
              ...categories.map((category) => ({
                value: String(category.id),
                label: category.name,
              })),
            ]}
          />

          <input
            type="number"
            value={stock}
            onChange={(e) =>
              setStock(e.target.value ? Number(e.target.value) : '')
            }
            placeholder="Stok awal..."
            min={0}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            disabled={submitting}
            required
          />

          <button
            type="submit"
            disabled={
              submitting ||
              !itemName.trim() ||
              categoryId === '' ||
              stock === ''
            }
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Menambah...
              </span>
            ) : (
              '+ Tambah Barang'
            )}
          </button>
        </div>

        {categories.length === 0 && !loading && (
          <p className="mt-2 text-sm text-amber-600">
            ⚠️ Belum ada kategori. Tambahkan kategori terlebih dahulu sebelum menambah barang.
          </p>
        )}
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

      {/* Tabel Barang */}
      {loading ? (
        <div className="flex items-center justify-center py-8 text-gray-400">
          <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Memuat barang...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p className="text-4xl mb-2">📭</p>
          <p>Belum ada barang. Tambahkan barang pertama Anda!</p>
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
                  Nama Barang
                </th>
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28 text-center">
                  Stok
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
              {items.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 text-sm text-gray-500">{index + 1}</td>
                  <td className="py-3 text-sm font-medium text-gray-800">
                    {item.name}
                  </td>
                  <td className="py-3 text-sm text-gray-600">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {item.categories?.name || 'Tidak diketahui'}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStockBadgeClass(item.stock)}`}
                    >
                      {item.stock}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-gray-500">
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString('id-ID', {
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
                      onClick={() => handleDeleteItem(item.id, item.name)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                      title={`Hapus ${item.name}`}
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
      {!loading && items.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
          <p>Total: {items.length} barang</p>
          <p>
            Total stok: {items.reduce((sum, item) => sum + item.stock, 0)} unit
          </p>
        </div>
      )}
    </section>
  )
}