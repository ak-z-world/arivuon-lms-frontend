// components/layout/LuminaSideNav.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

/* ══════════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════════ */
type Role = "student" | "trainer" | "admin"

interface NavItem {
  id:     string
  icon:   string
  label:  string
  href:   string
  badge?: string | number
}

/* ══════════════════════════════════════════════════════════════
   NAV TREES  (plain, readable labels — no jargon)
══════════════════════════════════════════════════════════════ */
const NAV: Record<Role, NavItem[]> = {
  student: [
    { id: "dashboard",   icon: "⌂",  label: "Dashboard",     href: "/student/dashboard"   },
    { id: "courses",     icon: "◈",  label: "My Courses",    href: "/student/courses"     },
    { id: "sessions",    icon: "▶",  label: "Live Classes",  href: "/student/sessions"    },
    { id: "assignments", icon: "✎",  label: "Assignments",   href: "/student/assignments" },
    { id: "progress",    icon: "◎",  label: "Progress",      href: "/student/progress"    },
    { id: "attendance",  icon: "✓",  label: "Attendance",    href: "/student/attendance"  },
    { id: "leaderboard", icon: "⊞",  label: "Leaderboard",   href: "/student/leaderboard" },
    { id: "ai-tutor",    icon: "◉",  label: "AI Tutor",      href: "/student/ai-tutor"    },
    { id: "profile",     icon: "○",  label: "My Profile",    href: "/student/profile"     },
  ],
  trainer: [
    { id: "dashboard",   icon: "⌂",  label: "Dashboard",       href: "/trainer/dashboard"   },
    { id: "sessions",    icon: "▶",  label: "My Classes",       href: "/trainer/sessions"    },
    { id: "batches",     icon: "◷",  label: "Batches",          href: "/trainer/batches"     },
    { id: "attendance",  icon: "✓",  label: "Attendance",       href: "/trainer/attendance"  },
    { id: "assignments", icon: "✎",  label: "Assignments",      href: "/trainer/assignments" },
    { id: "analytics",   icon: "◎",  label: "Reports",          href: "/trainer/analytics"   },
    { id: "content",     icon: "◈",  label: "Course Materials", href: "/trainer/content"     },
    { id: "profile",     icon: "○",  label: "My Profile",       href: "/trainer/profile"     },
  ],
  admin: [
    { id: "dashboard",   icon: "⌂",  label: "Dashboard",    href: "/admin/dashboard"          },
    { id: "users",       icon: "◷",  label: "All Users",    href: "/admin/users"              },
    { id: "students",    icon: "○",  label: "Students",     href: "/admin/students"           },
    { id: "trainers",    icon: "△",  label: "Trainers",     href: "/admin/trainers"           },
    { id: "courses",     icon: "◈",  label: "Courses",      href: "/admin/courses"            },
    { id: "batches",     icon: "⊞",  label: "Batches",      href: "/admin/batches"            },
    { id: "schedules",   icon: "▷",  label: "Schedules",    href: "/admin/schedules"          },
    { id: "attendance",  icon: "✓",  label: "Attendance",   href: "/admin/attendance"         },
    { id: "analytics",   icon: "◎",  label: "Analytics",    href: "/admin/analytics"          },
    { id: "revenue",     icon: "⬡",  label: "Revenue",      href: "/admin/analytics/revenue"  },
    { id: "settings",    icon: "◌",  label: "Settings",     href: "/admin/settings"           },
  ],
}

/* ══════════════════════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════════════════════ */
const ACCENT: Record<Role, string> = {
  student: "#1a96ff",
  trainer: "#00d4ff",
  admin:   "#ffc933",
}

const ROLE_LABEL: Record<Role, string> = {
  student: "Student",
  trainer: "Trainer",
  admin:   "Admin",
}

// Widths
const W_OPEN     = 240
const W_COLLAPSED = 68

/* ══════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════ */
export default function LuminaSideNav({ role }: { role: Role }) {
  const pathname          = usePathname()
  const items             = NAV[role]
  const accent            = ACCENT[role]

  const [open,    setOpen]    = useState(true)   // expanded by default
  const [tooltip, setTooltip] = useState<string | null>(null)

  return (
    <>
      {/* ── Keyframes & scrollbar (scoped) ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@500;600;700;800&family=Raleway:wght@400;500;600&family=Share+Tech+Mono&display=swap');

        @keyframes lu-gem-pulse {
          0%,100% { box-shadow: 0 0 10px rgba(0,150,255,0.45), 0 0 26px rgba(0,150,255,0.18); }
          50%     { box-shadow: 0 0 22px rgba(0,212,255,0.70), 0 0 55px rgba(0,212,255,0.28); }
        }
        @keyframes lu-tooltip-in {
          from { opacity: 0; transform: translateX(-6px) translateY(-50%); }
          to   { opacity: 1; transform: translateX(0)    translateY(-50%); }
        }

        /* Slim scrollbar inside the nav */
        .lu-nav-items::-webkit-scrollbar       { width: 3px; }
        .lu-nav-items::-webkit-scrollbar-track { background: transparent; }
        .lu-nav-items::-webkit-scrollbar-thumb { background: rgba(26,150,255,0.18); border-radius: 10px; }
      `}</style>

      {/* ── Mobile overlay (visible on small screens when nav is open) ── */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            display:    "none",           // shown via CSS media query below
            position:   "fixed",
            inset:      0,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(3px)",
            zIndex:     49,
          }}
          className="lu-nav-overlay"
        />
      )}

      <style>{`
        @media (max-width: 860px) {
          .lu-nav-overlay { display: block !important; }
          .lu-sidenav-root {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            z-index: 50 !important;
            box-shadow: 4px 0 40px rgba(0,0,0,0.7) !important;
          }
        }
      `}</style>

      <nav
        className="lu-sidenav-root"
        style={{
          width:          open ? W_OPEN : W_COLLAPSED,
          minWidth:       open ? W_OPEN : W_COLLAPSED,
          height:         "100vh",
          background:     "rgba(2,8,20,0.97)",
          borderRight:    "1px solid rgba(26,150,255,0.09)",
          backdropFilter: "blur(28px) saturate(160%)",
          display:        "flex",
          flexDirection:  "column",
          padding:        "16px 10px",
          transition:     "width 0.3s cubic-bezier(0.22,1,0.36,1), min-width 0.3s cubic-bezier(0.22,1,0.36,1)",
          flexShrink:     0,
          position:       "relative",
          overflow:       "hidden",
          zIndex:         50,
        }}
      >

        {/* ── Logo / Wordmark row ── */}
        <div
          style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: open ? "space-between" : "center",
            marginBottom:   22,
            padding:        "0 2px",
            minHeight:      44,
          }}
        >
          {/* Gem + wordmark (only visible when open) */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width:        34,
                height:       34,
                borderRadius: 10,
                background:   "linear-gradient(135deg,#1a96ff,#00d4ff)",
                display:      "flex",
                alignItems:   "center",
                justifyContent: "center",
                fontSize:     16,
                color:        "white",
                flexShrink:   0,
                animation:    "lu-gem-pulse 4s ease-in-out infinite",
              }}
            >◈</div>

            {open && (
              <span
                style={{
                  fontFamily:    "'Oxanium', sans-serif",
                  fontWeight:    700,
                  fontSize:      16,
                  letterSpacing: "2.5px",
                  textTransform: "uppercase",
                  color:         accent,
                  whiteSpace:    "nowrap",
                  overflow:      "hidden",
                }}
              >
                LUMINA
              </span>
            )}
          </div>

          {/* Collapse button (only when open) */}
          {open && (
            <button
              onClick={() => setOpen(false)}
              title="Collapse sidebar"
              style={{
                width:        30,
                height:       30,
                borderRadius: 8,
                border:       `1px solid rgba(26,150,255,0.18)`,
                background:   "rgba(255,255,255,0.04)",
                cursor:       "pointer",
                display:      "flex",
                alignItems:   "center",
                justifyContent: "center",
                color:        accent,
                fontSize:     13,
                flexShrink:   0,
                transition:   "all 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background   = `rgba(26,150,255,0.1)`
                e.currentTarget.style.borderColor  = `rgba(26,150,255,0.35)`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background   = "rgba(255,255,255,0.04)"
                e.currentTarget.style.borderColor  = "rgba(26,150,255,0.18)"
              }}
            >◀</button>
          )}
        </div>

        {/* Expand button — sticks out of the right edge when collapsed */}
        {!open && (
          <button
            onClick={() => setOpen(true)}
            title="Expand sidebar"
            style={{
              position:     "absolute",
              right:        -12,
              top:          18,
              width:        24,
              height:       28,
              borderRadius: 7,
              border:       `1px solid rgba(26,150,255,0.3)`,
              background:   "#020810",
              cursor:       "pointer",
              display:      "flex",
              alignItems:   "center",
              justifyContent: "center",
              color:        accent,
              fontSize:     12,
              zIndex:       60,
              transition:   "all 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background  = `rgba(26,150,255,0.12)`
              e.currentTarget.style.borderColor = `rgba(26,150,255,0.5)`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background  = "#020810"
              e.currentTarget.style.borderColor = "rgba(26,150,255,0.3)"
            }}
          >▶</button>
        )}

        {/* ── Section label (open only) ── */}
        {open && (
          <div
            style={{
              fontFamily:    "'Share Tech Mono', monospace",
              fontSize:      9,
              color:         "rgba(200,220,255,0.22)",
              textTransform: "uppercase",
              letterSpacing: "1.8px",
              padding:       "0 6px",
              marginBottom:  10,
            }}
          >
            Navigation
          </div>
        )}

        {/* ── Nav items ── */}
        <div
          className="lu-nav-items"
          style={{
            flex:       1,
            display:    "flex",
            flexDirection: "column",
            gap:        3,
            overflowY:  "auto",
            overflowX:  "visible",
          }}
        >
          {items.map(item => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/")

            return (
              <div
                key={item.id}
                style={{ position: "relative" }}
                onMouseEnter={() => setTooltip(item.id)}
                onMouseLeave={() => setTooltip(null)}
              >
                <Link href={item.href} style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      display:        "flex",
                      alignItems:     "center",
                      gap:            open ? 12 : 0,
                      justifyContent: open ? "flex-start" : "center",
                      height:         46,
                      padding:        open ? "0 12px" : "0",
                      borderRadius:   12,
                      background:     active ? `rgba(0,150,255,0.15)` : "transparent",
                      border:         `1px solid ${active ? "rgba(0,200,255,0.3)" : "transparent"}`,
                      color:          active ? accent : "rgba(200,220,255,0.5)",
                      cursor:         "pointer",
                      transition:     "all 0.22s",
                      position:       "relative",
                      boxShadow:      active ? `0 0 18px rgba(0,180,255,0.12)` : "none",
                      whiteSpace:     "nowrap",
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        e.currentTarget.style.background   = "rgba(26,150,255,0.08)"
                        e.currentTarget.style.color        = "rgba(255,255,255,0.9)"
                        e.currentTarget.style.borderColor  = "rgba(26,150,255,0.2)"
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        e.currentTarget.style.background   = "transparent"
                        e.currentTarget.style.color        = "rgba(200,220,255,0.5)"
                        e.currentTarget.style.borderColor  = "transparent"
                      }
                    }}
                  >
                    {/* Active left bar */}
                    {active && (
                      <div
                        style={{
                          position:   "absolute",
                          left:       0,
                          top:        "18%",
                          bottom:     "18%",
                          width:      3,
                          borderRadius: 2,
                          background: `linear-gradient(180deg,${accent},${accent}55)`,
                          boxShadow:  `0 0 8px ${accent}`,
                        }}
                      />
                    )}

                    {/* Icon */}
                    <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>
                      {item.icon}
                    </span>

                    {/* Label (open only) */}
                    {open && (
                      <span
                        style={{
                          fontFamily:   "'Raleway', sans-serif",
                          fontSize:     14,
                          fontWeight:   500,
                          letterSpacing: "0.02em",
                          overflow:     "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.label}
                      </span>
                    )}

                    {/* Badge (open only) */}
                    {item.badge !== undefined && open && (
                      <span
                        style={{
                          marginLeft:   "auto",
                          background:   `${accent}22`,
                          border:       `1px solid ${accent}40`,
                          borderRadius: 100,
                          padding:      "1px 8px",
                          fontFamily:   "'Share Tech Mono', monospace",
                          fontSize:     11,
                          color:        accent,
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>

                {/* Tooltip — collapsed mode only */}
                {!open && tooltip === item.id && (
                  <div
                    style={{
                      position:      "absolute",
                      left:          60,
                      top:           "50%",
                      transform:     "translateY(-50%)",
                      zIndex:        200,
                      background:    "#030d1e",
                      border:        `1px solid ${accent}35`,
                      borderRadius:  9,
                      padding:       "7px 13px",
                      fontFamily:    "'Raleway', sans-serif",
                      fontSize:      13,
                      fontWeight:    500,
                      color:         accent,
                      whiteSpace:    "nowrap",
                      pointerEvents: "none",
                      boxShadow:     `0 4px 20px rgba(0,0,0,0.6), 0 0 12px ${accent}18`,
                      animation:     "lu-tooltip-in 0.18s ease both",
                    }}
                  >
                    {item.label}
                    {/* Arrow */}
                    <div
                      style={{
                        position:    "absolute",
                        left:        -5,
                        top:         "50%",
                        transform:   "translateY(-50%) rotate(45deg)",
                        width:       8,
                        height:      8,
                        background:  "#030d1e",
                        border:      `1px solid ${accent}35`,
                        borderRight: "none",
                        borderTop:   "none",
                      }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Divider ── */}
        <div
          style={{
            height:     1,
            background: "linear-gradient(90deg,transparent,rgba(26,150,255,0.18),transparent)",
            margin:     "12px 4px",
          }}
        />

        {/* ── User block ── */}
        <div
          style={{
            display:        "flex",
            alignItems:     "center",
            gap:            open ? 10 : 0,
            justifyContent: open ? "flex-start" : "center",
            padding:        open ? "8px 10px" : "8px 0",
            borderRadius:   12,
            cursor:         "pointer",
            transition:     "background 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(26,150,255,0.07)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          {/* Avatar */}
          <div
            style={{
              width:        34,
              height:       34,
              borderRadius: 9,
              background:   `linear-gradient(135deg,${accent},${accent}70)`,
              display:      "flex",
              alignItems:   "center",
              justifyContent: "center",
              fontFamily:   "'Oxanium', sans-serif",
              fontWeight:   700,
              fontSize:     14,
              color:        "#020810",
              boxShadow:    `0 0 12px ${accent}30`,
              flexShrink:   0,
            }}
          >A</div>

          {/* Name + role (open only) */}
          {open && (
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  fontFamily:  "'Raleway', sans-serif",
                  fontSize:    14,
                  fontWeight:  600,
                  color:       "rgba(255,255,255,0.9)",
                  whiteSpace:  "nowrap",
                }}
              >
                ArivuOn
              </div>
              <div
                style={{
                  fontFamily:    "'Share Tech Mono', monospace",
                  fontSize:      11,
                  color:         accent,
                  textTransform: "uppercase",
                  letterSpacing: "0.6px",
                }}
              >
                {ROLE_LABEL[role]}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}