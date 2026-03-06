// app/(auth)/layout.tsx
// Pure cosmos shell — no sidebar, no topbar
// Used by: /login, /register, /forgot-password

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#020408" }}>
      {children}
    </div>
  )
}