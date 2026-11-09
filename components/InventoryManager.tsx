'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { translate } from '@/lib/i18n'
import type { InventoryCategory, InventoryItem, ItemVariant } from '@/lib/types'
import FloralSelect from '@/components/FloralSelect'

export default function InventoryManager() {
  const { user } = useAuth()
  const t = (key: Parameters<typeof translate>[1]) =>
    translate(user?.language ?? 'id', key)
  const [categories, setCategories] = useState<InventoryCategory[]>([])
  const [items, setItems] = useState<InventoryItem[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // New Item Form State
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemCategoryId, setNewItemCategoryId] = useState('')
  const [newItemUnit, setNewItemUnit] = useState('pcs')
  const [newVariantName, setNewVariantName] = useState('Standard')
  const [newVariantQty, setNewVariantQty] = useState<number>(10)
  const [savingItem, setSavingItem] = useState(false)

  // Add Variant to existing item modal state
  const [selectedItemForVariant, setSelectedItemForVariant] = useState<InventoryItem | null>(null)
  const [additionalVariantName, setAdditionalVariantName] = useState('')
  const [additionalVariantQty, setAdditionalVariantQty] = useState<number>(5)
  const [savingVariant, setSavingVariant] = useState(false)

  const loadData = useCallback(async () => {
    // 1. Fetch categories
    const { data: catData, error: catErr } = await supabase
      .from('inventory_categories')
      .select('*')
      .order('category_code', { ascending: true })

    // 2. Fetch items with variants and category join
    const { data: itemData, error: itemErr } = await supabase
      .from('inventory_items')
      .select(`
        id,
        category_id,
        item_name,
        unit,
        created_at,
        inventory_categories ( category_name, category_code ),
        item_variants ( id, item_id, variant_name, stock_qty )
      `)
      .order('created_at', { ascending: false })

    return { catData, catErr, itemData, itemErr }
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { catData, catErr, itemData, itemErr } = await loadData()

    if (!catErr && catData) {
      setCategories(catData)
      if (catData.length > 0) {
        setNewItemCategoryId(current => current || catData[0].id)
      }
    }

    if (!itemErr && itemData) {
      // cast to InventoryItem
      setItems(itemData as unknown as InventoryItem[])
    }

    setLoading(false)
  }, [loadData])

  useEffect(() => {
    let active = true
    void loadData().then(({ catData, catErr, itemData, itemErr }) => {
      if (!active) return

      if (!catErr && catData) {
        setCategories(catData)
        if (catData.length > 0) {
          setNewItemCategoryId(current => current || catData[0].id)
        }
      }

      if (!itemErr && itemData) {
        setItems(itemData as unknown as InventoryItem[])
      }

      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [loadData])

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchCat =
      selectedCategoryId === 'all' || item.category_id === selectedCategoryId
    const matchSearch =
      !searchQuery.trim() ||
      item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.inventory_categories?.category_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
    return matchCat && matchSearch
  })

  // Create Item + Initial Variant
  async function handleCreateItem(e: React.FormEvent) {
    e.preventDefault()
    if (!newItemName.trim() || !newItemCategoryId) return

    setSavingItem(true)
    try {
      // 1. Insert item
      const { data: itemInserted, error: itemErr } = await supabase
        .from('inventory_items')
        .insert([
          {
            category_id: newItemCategoryId,
            item_name: newItemName.trim(),
            unit: newItemUnit.trim(),
          },
        ])
        .select()
        .single()

      if (itemErr) throw itemErr

      // 2. Insert initial variant
      if (itemInserted) {
        const { error: varErr } = await supabase.from('item_variants').insert([
          {
            item_id: itemInserted.id,
            variant_name: newVariantName.trim() || 'Standard',
            stock_qty: Number(newVariantQty) || 0,
          },
        ])
        if (varErr) throw varErr
      }

      setNewItemName('')
      setNewVariantName('Standard')
      setNewVariantQty(10)
      setIsAddItemOpen(false)
      await fetchData()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal membuat barang'
      alert(`Error: ${message}`)
    } finally {
      setSavingItem(false)
    }
  }

  // Add Variant to existing Item
  async function handleAddVariant(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedItemForVariant || !additionalVariantName.trim()) return

    setSavingVariant(true)
    try {
      const { error } = await supabase.from('item_variants').insert([
        {
          item_id: selectedItemForVariant.id,
          variant_name: additionalVariantName.trim(),
          stock_qty: Number(additionalVariantQty) || 0,
        },
      ])
      if (error) throw error

      setAdditionalVariantName('')
      setAdditionalVariantQty(5)
      setSelectedItemForVariant(null)
      await fetchData()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal tambah varian'
      alert(`Error: ${message}`)
    } finally {
      setSavingVariant(false)
    }
  }

  // Quick Adjust Stock
  async function handleAdjustStock(variantId: string, delta: number) {
    // find existing qty
    let curQty = 0
    items.forEach((it) => {
      it.item_variants?.forEach((v) => {
        if (v.id === variantId) curQty = v.stock_qty
      })
    })

    const newQty = Math.max(0, curQty + delta)

    const { error } = await supabase
      .from('item_variants')
      .update({ stock_qty: newQty })
      .eq('id', variantId)

    if (error) {
      alert(`Gagal ubah stok: ${error.message}`)
    } else {
      // Update local state optimistically
      setItems((prev) =>
        prev.map((item) => ({
          ...item,
          item_variants: item.item_variants?.map((v) =>
            v.id === variantId ? { ...v, stock_qty: newQty } : v
          ),
        }))
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Category Pills */}
      <div className="p-6 rounded-3xl bg-white border border-[#DED9F4] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#322A5E]">
              {t('inventory.masterTitle')}
            </h2>
            <p className="text-xs text-[#7B739B]">
              {t('inventory.description')}
            </p>
          </div>

          <button
            onClick={() => setIsAddItemOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#322A5E] bg-[#FFEDA8] hover:bg-[#FFE892] border border-[#FAE489] transition shadow-sm self-start sm:self-auto"
          >
            <span>+</span>
            <span>{t('inventory.addItem')}</span>
          </button>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
          <button
            onClick={() => setSelectedCategoryId('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategoryId === 'all'
                ? 'bg-[#B1A9DA] text-white shadow-sm'
                : 'bg-[#F4F2FB] text-[#6D658E] hover:bg-[#EAE5F7]'
            }`}
          >
            {t('inventory.allCategories')} ({items.length})
          </button>
          {categories.map((cat) => {
            const count = items.filter((i) => i.category_id === cat.id).length
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategoryId === cat.id
                    ? 'bg-[#B1A9DA] text-white shadow-sm'
                    : 'bg-[#F4F2FB] text-[#6D658E] hover:bg-[#EAE5F7]'
                }`}
              >
                {cat.category_name} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('inventory.search')}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-[#DED9F4] text-xs sm:text-sm text-[#322A5E] placeholder-[#B5B0CC] focus:outline-none focus:ring-2 focus:ring-[#B1A9DA]"
          />
          <span className="absolute left-3 top-2.5 text-xs text-[#7B739B]">🔍</span>
        </div>
        <span className="text-xs text-[#7B739B]">
          {t('inventory.showing')} <strong>{filteredItems.length}</strong> {t('inventory.items')}
        </span>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#7B739B]">
          <div className="w-10 h-10 border-4 border-[#B1A9DA] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium">{t('inventory.loading')}</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-[#DED9F4] shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[#F4F2FB] border border-[#DED9F4] flex items-center justify-center mx-auto mb-3 text-2xl">
            🌿
          </div>
          <h3 className="font-serif text-base font-bold text-[#322A5E]">
            {t('inventory.emptyTitle')}
          </h3>
          <p className="text-xs text-[#7B739B] mt-1 mb-4">
            {t('inventory.emptyDescription')}
          </p>
          <button
            onClick={() => setIsAddItemOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#322A5E] bg-[#FFEDA8] hover:bg-[#FFE892] border border-[#FAE489]"
          >
            + {t('inventory.addNow')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-white border border-[#DED9F4] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#F4F2FB] text-[#564B95] border border-[#DED9F4]">
                    {item.inventory_categories?.category_name || t('inventory.category')}
                  </span>
                  <span className="text-[11px] font-medium text-[#7B739B]">
                    {t('inventory.unit')}: {item.unit}
                  </span>
                </div>

                <h4 className="font-serif text-lg font-bold text-[#322A5E] leading-snug">
                  {item.item_name}
                </h4>
              </div>

              {/* Variants & Stock Section */}
              <div className="p-3 rounded-2xl bg-[#FAF9F6] border border-[#EAE5F7] space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#6D658E]">
                  <span>{t('inventory.variantsStock')}</span>
                  <button
                    onClick={() => setSelectedItemForVariant(item)}
                    className="text-[#564B95] hover:underline font-bold text-[10px]"
                  >
                    + {t('inventory.addVariant')}
                  </button>
                </div>

                {(!item.item_variants || item.item_variants.length === 0) ? (
                  <p className="text-[11px] text-[#7B739B] italic">{t('inventory.noVariants')}</p>
                ) : (
                  <div className="space-y-1.5">
                    {item.item_variants.map((v: ItemVariant) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#EAE5F7] text-xs"
                      >
                        <span className="font-medium text-[#322A5E] truncate max-w-[140px]">
                          {v.variant_name}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAdjustStock(v.id, -1)}
                            className="w-5 h-5 rounded bg-[#F4F2FB] hover:bg-[#EAE5F7] text-[#564B95] flex items-center justify-center font-bold text-xs"
                            title={t('inventory.decreaseOne')}
                          >
                            -
                          </button>
                          <span
                            className={`min-w-7 text-center font-bold ${
                              v.stock_qty <= 2
                                ? 'text-red-600'
                                : v.stock_qty <= 5
                                ? 'text-amber-600'
                                : 'text-[#322A5E]'
                            }`}
                          >
                            {v.stock_qty}
                          </span>
                          <button
                            onClick={() => handleAdjustStock(v.id, 1)}
                            className="w-5 h-5 rounded bg-[#F4F2FB] hover:bg-[#EAE5F7] text-[#564B95] flex items-center justify-center font-bold text-xs"
                            title={t('inventory.increaseOne')}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Tambah Barang Baru */}
      {isAddItemOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#322A5E]/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#FAF9F6] rounded-3xl p-6 w-full max-w-md border border-[#DED9F4] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DED9F4]">
              <h3 className="font-serif text-lg font-bold text-[#322A5E]">
                + {t('inventory.addNewTitle')}
              </h3>
              <button
                onClick={() => setIsAddItemOpen(false)}
                className="text-[#7B739B] hover:text-[#322A5E]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4 text-xs">
              <div>
                <label id="inventory-new-category-label" className="block font-semibold text-[#564B95] mb-1">
                  {t('inventory.categoryRequired')}
                </label>
                <FloralSelect
                  value={newItemCategoryId}
                  onChange={setNewItemCategoryId}
                  ariaLabelledBy="inventory-new-category-label"
                  required
                  className="w-full"
                  options={categories.map((category) => ({
                    value: category.id,
                    label: `${category.category_name} (${category.category_code})`,
                  }))}
                />
              </div>

              <div>
                <label className="block font-semibold text-[#564B95] mb-1">
                  {t('inventory.itemRequired')}
                </label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={t('inventory.itemExample')}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DED9F4] text-[#322A5E] focus:outline-none focus:ring-2 focus:ring-[#B1A9DA]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label id="inventory-new-unit-label" className="block font-semibold text-[#564B95] mb-1">
                    {t('inventory.unitLabel')}
                  </label>
                  <FloralSelect
                    value={newItemUnit}
                    onChange={setNewItemUnit}
                    ariaLabelledBy="inventory-new-unit-label"
                    className="w-full"
                    options={[
                      { value: 'pcs', label: 'pcs' },
                      { value: 'set', label: 'set' },
                      { value: 'batang', label: 'batang' },
                      { value: 'meter', label: 'meter' },
                      { value: 'roll', label: 'roll' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#564B95] mb-1">
                    {t('inventory.initialVariant')}
                  </label>
                  <input
                    type="text"
                    value={newVariantName}
                    onChange={(e) => setNewVariantName(e.target.value)}
                    placeholder={t('inventory.standardExample')}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#DED9F4] text-[#322A5E] focus:outline-none focus:ring-2 focus:ring-[#B1A9DA]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#564B95] mb-1">
                  {t('inventory.startingStock')}
                </label>
                <input
                  type="number"
                  min={0}
                  value={newVariantQty}
                  onChange={(e) => setNewVariantQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DED9F4] text-[#322A5E] focus:outline-none focus:ring-2 focus:ring-[#B1A9DA]"
                />
              </div>

              <div className="pt-3 border-t border-[#DED9F4] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddItemOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7B739B] hover:bg-gray-100"
                >
                  {t('inventory.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={savingItem}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-[#322A5E] bg-[#FFEDA8] hover:bg-[#FFE892] border border-[#FAE489] transition"
                >
                  {savingItem ? t('inventory.saving') : t('inventory.saveItem')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tambah Varian Tambahan */}
      {selectedItemForVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#322A5E]/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#FAF9F6] rounded-3xl p-6 w-full max-w-sm border border-[#DED9F4] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DED9F4]">
              <div>
                <h3 className="font-serif text-base font-bold text-[#322A5E]">
                  + {t('inventory.newVariantTitle')}
                </h3>
                <p className="text-[11px] text-[#7B739B]">
                  Untuk: {selectedItemForVariant.item_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedItemForVariant(null)}
                className="text-[#7B739B] hover:text-[#322A5E]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVariant} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#564B95] mb-1">
                  {t('inventory.variantRequired')}
                </label>
                <input
                  type="text"
                  value={additionalVariantName}
                  onChange={(e) => setAdditionalVariantName(e.target.value)}
                  placeholder={t('inventory.variantExample')}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DED9F4] text-[#322A5E] focus:outline-none focus:ring-2 focus:ring-[#B1A9DA]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#564B95] mb-1">
                  {t('inventory.startingStock')}
                </label>
                <input
                  type="number"
                  min={0}
                  value={additionalVariantQty}
                  onChange={(e) => setAdditionalVariantQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DED9F4] text-[#322A5E] focus:outline-none focus:ring-2 focus:ring-[#B1A9DA]"
                />
              </div>

              <div className="pt-3 border-t border-[#DED9F4] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedItemForVariant(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7B739B] hover:bg-gray-100"
                >
                  {t('inventory.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={savingVariant}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-[#322A5E] bg-[#FFEDA8] hover:bg-[#FFE892] border border-[#FAE489] transition"
                >
                  {savingVariant ? t('inventory.saving') : t('inventory.saveVariant')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}