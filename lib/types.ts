export type PaymentStatus = 'DP' | 'Lunas' | 'Kurang' | 'Batal'

export interface EventRecord {
  id: string
  event_number?: number
  dealing_date: string
  client_name: string
  decor_type: string
  venue: string
  event_date: string
  total_amount: number
  transfer_amount: number
  remaining_amount?: number
  status: PaymentStatus
  charge_overtime?: number
  sales_pic: string | null
  notes: string | null
  created_at?: string
  updated_at?: string
}

export interface InventoryCategory {
  id: string
  category_code: string
  category_name: string
  created_at?: string
}

export interface InventoryItem {
  id: string
  category_id: string
  item_name: string
  unit: string
  created_at?: string
  inventory_categories?: {
    category_name: string
    category_code: string
  }
  item_variants?: ItemVariant[]
}

export interface ItemVariant {
  id: string
  item_id: string
  variant_name: string
  stock_qty: number
  created_at?: string
}

// Legacy prototype types
export interface Category {
  id: number
  name: string
  created_at?: string
}

export interface Item {
  id: number
  name: string
  category_id: number
  stock: number
  created_at?: string
  categories?: {
    name: string
  }
}