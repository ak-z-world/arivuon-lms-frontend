// components/layout/LuminaTopBar.tsx
"use client"

import { useState, useEffect } from "react"

type Role = "student" | "trainer" | "admin"

/* Role → accent colour */
const ACCENT: Record<Role, string> = {
  student: "#1a96ff",
  trainer: "#00d4ff",
  admin: "#ffc933",
}

/* Role → display label */
const ROLE_LABEL: Record<Role, string> = {
  student: "Student",
  trainer: "Trainer",
  admin: "Admin",
}

/* ── Command palette quick actions ── */
const CMD_ACTIONS = [
  "Go to Dashboard",
  "Open AI Tutor",
  "Browse Courses",
  "Check Assignments",
  "View Leaderboard",
  "Account Settings",
]

/* ── Font injection (add once in root layout for production) ── */
const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@300;400;500;600;700;800&family=Raleway:wght@300;400;500;600&family=Share+Tech+Mono&display=swap');`

export default function LuminaTopBar({ role = "student" }: { role?: Role }) {
  const [time, setTime] = useState("")
  const [cmdOpen, setCmdOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [profileOpen, setProfileOpen] = useState(false)

  const accent = ACCENT[role]

  /* Live clock */
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  /* ⌘K / Ctrl+K shortcut */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdOpen(c => !c) }
      if (e.key === "Escape") { setCmdOpen(false); setQuery("") }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const filtered = CMD_ACTIONS.filter(a => a.toLowerCase().includes(query.toLowerCase()))
  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    window.location.href = "/auth/login"
  }
  return (
    <>
      <style>{`
        ${FONT_IMPORT}
        @keyframes lu-notif-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes lu-cmd-in {
          from { transform:translateX(-50%) scaleY(0.88); opacity:0; filter:blur(6px); }
          to   { transform:translateX(-50%) scaleY(1);    opacity:1; filter:blur(0);   }
        }
        @keyframes lu-gem-pulse {
          0%,100% { box-shadow:0 0 8px rgba(0,150,255,0.45), 0 0 20px rgba(0,150,255,0.18); }
          50%     { box-shadow:0 0 18px rgba(0,212,255,0.7), 0 0 45px rgba(0,212,255,0.28); }
        }
      `}</style>

      {/* ── Top bar ── */}
      <header style={{
        height: 52,
        flexShrink: 0,
        background: "rgba(2,8,20,0.92)",
        borderBottom: "1px solid rgba(26,150,255,0.1)",
        backdropFilter: "blur(24px) saturate(160%)",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: 14,
        position: "relative",
        zIndex: 20,
      }}>

        {/* Logo gem + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg,#1a96ff,#00d4ff)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, color: "white",
            animation: "lu-gem-pulse 4s ease-in-out infinite",
          }}>◈</div>
          <span style={{
            fontFamily: "'Oxanium', sans-serif",
            fontWeight: 700, fontSize: 16,
            letterSpacing: "3px", textTransform: "uppercase",
            background: "linear-gradient(90deg,#1a96ff,#00d4ff)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            LUMINA
          </span>
        </div>

        {/* Role badge */}
        <div style={{
          padding: "3px 10px",
          borderRadius: 100,
          background: `${accent}12`,
          border: `1px solid ${accent}28`,
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 10,
          color: accent,
          letterSpacing: "1.2px",
          textTransform: "uppercase",
          flexShrink: 0,
        }}>
          {ROLE_LABEL[role]}
        </div>

        <div style={{ flex: 1 }} />

        {/* Search / command bar trigger */}
        <button
          onClick={() => setCmdOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 9,
            padding: "7px 14px", borderRadius: 10,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            cursor: "pointer", transition: "all 0.2s",
            color: "rgba(200,220,255,0.32)",
            fontFamily: "'Raleway', sans-serif",
            fontSize: 12, letterSpacing: "0.05em",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "rgba(26,150,255,0.3)"
            e.currentTarget.style.color = "rgba(200,220,255,0.65)"
            e.currentTarget.style.background = "rgba(26,150,255,0.06)"
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"
            e.currentTarget.style.color = "rgba(200,220,255,0.32)"
            e.currentTarget.style.background = "rgba(255,255,255,0.03)"
          }}
        >
          <span style={{ fontSize: 13 }}>🔍</span>
          <span>Search…</span>
          <span style={{
            display: "inline-flex", alignItems: "center",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 5, padding: "1px 6px",
            fontFamily: "'Share Tech Mono', monospace", fontSize: 10,
            color: "rgba(200,220,255,0.4)",
          }}>⌘K</span>
        </button>

        {/* Live clock */}
        <div style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 14, letterSpacing: "0.15em",
          color: accent,
          textShadow: `0 0 10px ${accent}55`,
          padding: "5px 12px",
          borderRadius: 8,
          background: `${accent}0a`,
          border: `1px solid ${accent}1a`,
          flexShrink: 0,
        }}>
          {time}
        </div>

        {/* Notification bell */}
        <button style={{
          width: 36, height: 36, borderRadius: 10,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, position: "relative",
          color: "rgba(200,220,255,0.45)",
          transition: "all 0.2s", flexShrink: 0,
        }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = `${accent}35`
            e.currentTarget.style.color = accent
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"
            e.currentTarget.style.color = "rgba(200,220,255,0.45)"
          }}
        >
          🔔
          <div style={{
            position: "absolute", top: 7, right: 7,
            width: 7, height: 7, borderRadius: "50%",
            background: "#ff4d6a",
            border: "1.5px solid #020810",
            animation: "lu-notif-blink 2s ease infinite",
            boxShadow: "0 0 6px #ff4d6a",
          }} />
        </button>

        {/* Avatar */}
        <div style={{ position: "relative" }}>
          <div
            onClick={() => setProfileOpen(o => !o)}
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: `linear-gradient(135deg,${accent},${accent}88)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Oxanium', sans-serif",
              fontWeight: 700,
              fontSize: 13,
              color: "#020810",
              cursor: "pointer",
              boxShadow: `0 0 12px ${accent}30`,
              border: `1px solid ${accent}35`,
              transition: "transform 0.2s",
            }}
          >
            A
          </div>

          {profileOpen && (
            <div
              style={{
                position: "absolute",
                top: 44,
                right: 0,
                width: 170,
                background: "rgba(4,12,28,0.98)",
                border: `1px solid ${accent}25`,
                borderRadius: 12,
                backdropFilter: "blur(24px)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                overflow: "hidden",
                zIndex: 100,
              }}
            >
              <div
                style={{
                  padding: "10px 14px",
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: 10,
                  color: "rgba(200,220,255,0.35)",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                Account
              </div>

              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "transparent",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  color: "#ff4d6a",
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.background = "rgba(255,77,106,0.08)")
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                ⎋ Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Command palette overlay ── */}
      {cmdOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(2,8,20,0.65)", backdropFilter: "blur(4px)" }}
          onClick={() => { setCmdOpen(false); setQuery("") }}
        >
          <div
            style={{
              position: "absolute", top: "20%", left: "50%",
              transform: "translateX(-50%)",
              width: "100%", maxWidth: 520,
              background: "rgba(4,12,28,0.97)",
              border: "1px solid rgba(26,150,255,0.25)",
              borderRadius: 20,
              backdropFilter: "blur(48px)",
              boxShadow: "0 0 0 1px rgba(26,150,255,0.06), 0 40px 120px rgba(0,0,0,0.85), 0 0 60px rgba(0,120,255,0.1)",
              overflow: "hidden",
              animation: "lu-cmd-in 0.22s ease both",
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Search input */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 18px",
              borderBottom: "1px solid rgba(26,150,255,0.1)",
            }}>
              <span style={{ fontSize: 14, color: "rgba(200,220,255,0.4)" }}>🔍</span>
              <input
                autoFocus
                placeholder="Search courses, assignments, settings…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  color: "#e8f4ff", fontSize: 14,
                  fontFamily: "'Raleway', sans-serif", letterSpacing: "0.02em",
                }}
              />
              <span style={{
                fontFamily: "'Share Tech Mono', monospace", fontSize: 10,
                color: "rgba(200,220,255,0.2)",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 5, padding: "2px 7px",
              }}>ESC</span>
            </div>

            {/* Results */}
            <div style={{ padding: "6px 0", maxHeight: 280, overflowY: "auto" }}>
              {filtered.length === 0 ? (
                <div style={{
                  padding: "16px 18px", textAlign: "center",
                  fontFamily: "'Share Tech Mono', monospace", fontSize: 11,
                  color: "rgba(200,220,255,0.25)", letterSpacing: "1px", textTransform: "uppercase",
                }}>No results</div>
              ) : filtered.map((action, i) => (
                <div
                  key={i}
                  style={{
                    padding: "11px 18px", cursor: "pointer",
                    fontSize: 13, fontFamily: "'Raleway', sans-serif",
                    color: "rgba(200,220,255,0.6)",
                    letterSpacing: "0.03em", transition: "all 0.15s",
                    display: "flex", alignItems: "center", gap: 10,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(26,150,255,0.08)"
                    e.currentTarget.style.color = "#e8f4ff"
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "transparent"
                    e.currentTarget.style.color = "rgba(200,220,255,0.6)"
                  }}
                  onClick={() => { setCmdOpen(false); setQuery("") }}
                >
                  <span style={{ color: "rgba(26,150,255,0.5)", fontSize: 12 }}>→</span>
                  {action}
                </div>
              ))}
            </div>

            {/* Footer hint */}
            <div style={{
              padding: "8px 18px",
              borderTop: "1px solid rgba(26,150,255,0.08)",
              display: "flex", gap: 16,
            }}>
              {[["↵ Select", ""], ["↑↓ Navigate", ""], ["ESC Close", ""]].map(([hint], i) => (
                <span key={i} style={{
                  fontFamily: "'Share Tech Mono', monospace", fontSize: 9,
                  color: "rgba(200,220,255,0.2)", letterSpacing: "0.8px", textTransform: "uppercase",
                }}>{hint}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}