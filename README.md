# Yabes — Table Decor Management & Deal Recap

Platform manajemen rekap deal event dan master inventaris table decor.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Supabase (auth + database)
- Tailwind CSS 4 + Turbopack
- Motion (Framer Motion)
- next-pwa

## Getting Started

1. Install dependencies
   ```bash
   npm install
   ```

2. Copy `.env.local.example` to `.env.local` and fill in values:
   ```bash
   copy .env.local.example .env.local
   ```

   Required variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Run dev server
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run test suite |

## Deploy

Recommended: Vercel.

1. Push to GitHub
2. Import repo in Vercel
3. Add env vars in Vercel project settings
4. Deploy

## App Settings and Installation

- The app can be installed from the browser menu on supported devices. Installed
  browsers use fullscreen display when available and fall back to standalone mode.
- To enable profile photo uploads, run `supabase/avatar-storage.sql` in the
  Supabase SQL Editor. This creates the public `avatars` bucket and limits
  uploads and changes to each authenticated user's own folder.
- Language and profile details are saved to the signed-in user's Supabase Auth
  metadata.

## License

Private
