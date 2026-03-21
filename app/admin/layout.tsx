// Bare pass-through layout for the /admin segment.
// Auth protection lives in (protected)/layout.tsx so that
// /admin/login is NOT caught in the auth redirect loop.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
