// Next.js template.tsx re-mounts on every navigation, so this replays the page-in animation per route.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>
}
