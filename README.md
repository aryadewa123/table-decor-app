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

## License

Private

