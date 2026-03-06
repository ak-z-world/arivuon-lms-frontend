// app/(student)/layout.tsx
// Wraps all /student/* pages with the cosmos shell + sidebar + topbar
// The ConstellationNav and CosmicTopBar are rendered inside each page 
// because CosmosEngine is a canvas that must be per-page.
// Use this layout only if you want server-level wrappers (auth check, metadata).

import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cosmos Hub — Arivuon",
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  // Future: add server-side auth guard here
  // const session = await getServerSession()
  // if (!session || session.role !== "student") redirect("/login")
  return <>{children}</>
}