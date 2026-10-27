-- ==============================================================================
-- BLUEPRINT SCHEMA: TABLE DECOR MANAGEMENT & REKAP DEAL SYSTEM
-- Versi: 2.0 (PostgreSQL 15+ / Supabase)
-- ==============================================================================

-- 1. DROP EXISTING OBJECTS (Hati-hati: jalankan jika ingin reset skema)
-- DROP TABLE IF EXISTS public.event_decor_items CASCADE;
-- DROP TABLE IF EXISTS public.item_variants CASCADE;
-- DROP TABLE IF EXISTS public.inventory_items CASCADE;
-- DROP TABLE IF EXISTS public.inventory_categories CASCADE;
-- DROP TABLE IF EXISTS public.events CASCADE;
-- DROP TYPE IF EXISTS payment_status_type CASCADE;

-- 2. ENUM STATUS PEMBAYARAN
DO $$ BEGIN
  CREATE TYPE payment_status_type AS ENUM ('DP', 'Lunas', 'Kurang', 'Batal');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. TABEL UTAMA: REKAP DEAL EVENT (Menggantikan Sheet AGUSTUS & SEPTEMBER)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_number INT GENERATED ALWAYS AS IDENTITY,
  dealing_date DATE NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  decor_type TEXT NOT NULL,
  venue TEXT NOT NULL,
  event_date DATE NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  transfer_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (transfer_amount >= 0),
  remaining_amount NUMERIC(12,2) GENERATED ALWAYS AS (total_amount - transfer_amount) STORED,
  status payment_status_type NOT NULL DEFAULT 'DP',
  charge_overtime NUMERIC(12,2) DEFAULT 0,
  sales_pic VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing untuk query performa tinggi pada filter tanggal
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_dealing_date ON public.events(dealing_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);

-- 4. TABEL MASTER INVENTARIS
CREATE TABLE IF NOT EXISTS public.inventory_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_code VARCHAR(20) UNIQUE NOT NULL,
  category_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.inventory_categories(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  unit VARCHAR(50) DEFAULT 'pcs',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.item_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  variant_name VARCHAR(100) NOT NULL,
  stock_qty INT NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL RELASI: BARANG DEKOR PER EVENT
CREATE TABLE IF NOT EXISTS public.event_decor_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.item_variants(id) ON DELETE RESTRICT,
  qty_required INT NOT NULL CHECK (qty_required > 0),
  qty_picked INT DEFAULT 0,
  qty_returned INT DEFAULT 0,
  qty_damaged INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SETUP ROW LEVEL SECURITY (RLS) & POLICIES (Akses Publik Anonim untuk Operasional)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_decor_items ENABLE ROW LEVEL SECURITY;

-- Drop policy lama jika ada sebelum membuat baru
DROP POLICY IF EXISTS "Anon public access events" ON public.events;
CREATE POLICY "Anon public access events" ON public.events FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon public access inventory_categories" ON public.inventory_categories;
CREATE POLICY "Anon public access inventory_categories" ON public.inventory_categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon public access inventory_items" ON public.inventory_items;
CREATE POLICY "Anon public access inventory_items" ON public.inventory_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon public access item_variants" ON public.item_variants;
CREATE POLICY "Anon public access item_variants" ON public.item_variants FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon public access event_decor_items" ON public.event_decor_items;
CREATE POLICY "Anon public access event_decor_items" ON public.event_decor_items FOR ALL USING (true) WITH CHECK (true);

-- 7. SEED DATA AWAL: 10 Kategori Inventaris Standar
INSERT INTO public.inventory_categories (category_code, category_name) VALUES
  ('CAT-01', 'Decor Utama'),
  ('CAT-02', 'Balon'),
  ('CAT-03', 'ATK & Perekat'),
  ('CAT-04', 'Florist & Bunga'),
  ('CAT-05', 'Backdrop & Rangka'),
  ('CAT-06', 'Perlampuan & Kelistrikan'),
  ('CAT-07', 'Kain & Taplak'),
  ('CAT-08', 'Tempat Lilin & Centerpiece'),
  ('CAT-09', 'Signage & Akrilik'),
  ('CAT-10', 'Perkakas & Tools')
ON CONFLICT (category_code) DO NOTHING;