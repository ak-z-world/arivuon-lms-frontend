// app/admin/dashboard/page.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import LuminaBackground from "@/components/background/LuminaBackground"
import LuminaTopBar     from "@/components/layout/LuminaTopBar"
import LuminaSideNav from "@/components/layout/LuminaSideNav"

/* ══════════════════════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════════════════════ */
const C = {
  gold:    "#ffc933",
  blue:    "#1a96ff",
  cyan:    "#00d4ff",
  green:   "#00e5a0",
  red:     "#ff4d6a",
  purple:  "#a78bfa",
  orange:  "#ff8c42",
  surface: "rgba(5,14,32,0.88)",
  w90:     "rgba(255,255,255,0.9)",
  w80:     "rgba(255,255,255,0.8)",
  w70:     "rgba(255,255,255,0.7)",
  w60:     "rgba(255,255,255,0.6)",
  w50:     "rgba(255,255,255,0.5)",
  w40:     "rgba(255,255,255,0.4)",
  w30:     "rgba(255,255,255,0.3)",
  w20:     "rgba(255,255,255,0.2)",
  w15:     "rgba(255,255,255,0.15)",
  w08:     "rgba(255,255,255,0.08)",
  w04:     "rgba(255,255,255,0.04)",
}

/* ══════════════════════════════════════════════════════════════
   REUSABLE: CARD
══════════════════════════════════════════════════════════════ */
function Card({
  children, accent = C.gold, style = {}, noHover = false, className = "",
}: {
  children: React.ReactNode
  accent?:  string
  style?:   React.CSSProperties
  noHover?: boolean
  className?: string
}) {
  const [hov, setHov] = useState(false)
  return (
    <div
      className={className}
      onMouseEnter={() => !noHover && setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background:     C.surface,
        border:         `1px solid ${hov ? accent + "38" : accent + "15"}`,
        borderRadius:   20,
        backdropFilter: "blur(28px) saturate(155%)",
        position:       "relative",
        overflow:       "hidden",
        transition:     "all .35s cubic-bezier(.22,1,.36,1)",
        transform:      hov && !noHover ? "translateY(-3px)" : "none",
        boxShadow:      hov && !noHover
          ? `0 20px 60px rgba(0,0,0,0.55), 0 0 28px ${accent}10`
          : "0 8px 40px rgba(0,0,0,0.45)",
        ...style,
      }}
    >
      <div
        style={{
          position:   "absolute",
          top:        0,
          left:       "8%",
          right:      "8%",
          height:     1,
          background: `linear-gradient(90deg,transparent,${accent}50,transparent)`,
        }}
      />
      {children}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   REUSABLE: PROGRESS BAR
══════════════════════════════════════════════════════════════ */
function ProgressBar({ pct, color = C.gold, height = 6 }: { pct: number; color?: string; height?: number }) {
  const [w, setW] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setW(pct), 220)
    return () => clearTimeout(t)
  }, [pct])
  return (
    <div style={{ height, borderRadius: height, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
      <div style={{
        height: "100%", width: `${w}%`, borderRadius: height,
        background: `linear-gradient(90deg,${color}80,${color})`,
        boxShadow:  `0 0 8px ${color}55`,
        transition: "width 1.4s cubic-bezier(.22,1,.36,1)",
      }} />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   REUSABLE: ARC RING
══════════════════════════════════════════════════════════════ */
function ArcRing({
  pct, size = 80, color = C.gold, value, label,
}: { pct: number; size: number; color: string; value: string; label: string }) {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const [p, setP] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setP(pct), 260)
    return () => clearTimeout(t)
  }, [pct])
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}15`} strokeWidth={7} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={7}
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - p / 100)}
            style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: "stroke-dashoffset 1.5s ease" }} />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontFamily: "'Oxanium',sans-serif", fontWeight: 700, fontSize: size * 0.21, color, lineHeight: 1 }}>
            {value}
          </span>
        </div>
      </div>
      <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: C.w50, textAlign: "center", lineHeight: 1.3 }}>
        {label}
      </span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   REUSABLE: STAT CARD (admin gold variant)
══════════════════════════════════════════════════════════════ */
function StatCard({
  icon, value, label, change, color, positive = true, sub = "",
}: {
  icon: string; value: string; label: string; change: string
  color: string; positive?: boolean; sub?: string
}) {
  return (
    <Card accent={color} style={{ padding: "20px 22px" }}>
      <div style={{
        width: 42, height: 42, borderRadius: 11, marginBottom: 14,
        background: `${color}12`, border: `1px solid ${color}25`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19,
      }}>{icon}</div>
      <div style={{
        fontFamily: "'Oxanium',sans-serif", fontWeight: 700,
        fontSize: 28, color, letterSpacing: "-0.5px", lineHeight: 1, marginBottom: 4,
      }}>{value}</div>
      {sub && (
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: `${color}80`, marginBottom: 3, letterSpacing: "0.5px" }}>
          {sub}
        </div>
      )}
      <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: C.w60, marginBottom: 10 }}>{label}</div>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "3px 10px", borderRadius: 100,
        background: positive ? "rgba(0,229,160,0.1)" : "rgba(255,77,106,0.1)",
        border: `1px solid ${positive ? "rgba(0,229,160,0.22)" : "rgba(255,77,106,0.22)"}`,
        fontFamily: "'Share Tech Mono',monospace", fontSize: 11,
        color: positive ? C.green : C.red,
      }}>
        {positive ? "↑" : "↓"} {change}
      </div>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════
   CHIP
══════════════════════════════════════════════════════════════ */
function Chip({ text, color, dot = false }: { text: string; color: string; dot?: boolean }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 11px", borderRadius: 100,
      background: `${color}12`, border: `1px solid ${color}28`,
      fontFamily: "'Share Tech Mono',monospace", fontSize: 10,
      color, letterSpacing: "0.5px", textTransform: "uppercase",
      flexShrink: 0,
    }}>
      {dot && <span style={{ width: 5, height: 5, borderRadius: "50%", background: color }} />}
      {text}
    </span>
  )
}

/* ══════════════════════════════════════════════════════════════
   INLINE BAR CHART (revenue / weekly)
══════════════════════════════════════════════════════════════ */
function BarChart({ data, color, maxH = 80 }: {
  data: { label: string; value: number; highlight?: boolean }[]
  color: string
  maxH?: number
}) {
  const max = Math.max(...data.map(d => d.value))
  const [ready, setReady] = useState(false)
  useEffect(() => { const t = setTimeout(() => setReady(true), 300); return () => clearTimeout(t) }, [])

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: maxH }}>
      {data.map((d, i) => {
        const h = (d.value / max) * maxH
        const c = d.highlight ? C.gold : color
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <div style={{
              width: "100%", borderRadius: "4px 4px 0 0",
              height: ready ? `${h}px` : "4px", minHeight: 4,
              background: `linear-gradient(180deg,${c},${c}44)`,
              boxShadow: `0 0 10px ${c}33`,
              transition: `height 1.3s cubic-bezier(.22,1,.36,1) ${i * 0.06}s`,
              cursor: "pointer",
            }}
              onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.5)"}
              onMouseLeave={e => e.currentTarget.style.filter = "brightness(1)"}
            />
            <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: C.w30, letterSpacing: "0.3px" }}>
              {d.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   ALERT ROW  (AI Insights)
══════════════════════════════════════════════════════════════ */
function AlertRow({
  type, title, desc, time, action,
}: {
  type: "success" | "warning" | "info" | "danger"
  title: string; desc: string; time: string; action?: string
}) {
  const MAP = {
    success: { color: C.green,  icon: "✅", bg: "rgba(0,229,160,0.06)",   border: "rgba(0,229,160,0.18)"  },
    warning: { color: C.gold,   icon: "⚠️", bg: "rgba(255,185,0,0.06)",   border: "rgba(255,185,0,0.2)"   },
    info:    { color: C.blue,   icon: "◉",  bg: "rgba(26,150,255,0.06)",  border: "rgba(26,150,255,0.18)" },
    danger:  { color: C.red,    icon: "⛔", bg: "rgba(255,77,106,0.06)",  border: "rgba(255,77,106,0.18)" },
  }
  const m = MAP[type]
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:      "flex",
        gap:          14,
        padding:      "14px 16px",
        borderRadius: 14,
        background:   hov ? `${m.color}12` : m.bg,
        border:       `1px solid ${hov ? m.color + "30" : m.border}`,
        marginBottom: 10,
        cursor:       "pointer",
        transition:   "all .2s",
        transform:    hov ? "translateX(4px)" : "none",
      }}
    >
      <span style={{ fontSize: 17, flexShrink: 0, marginTop: 1 }}>{m.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 14, fontWeight: 600, color: C.w90, marginBottom: 3 }}>
          {title}
        </div>
        <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: C.w50, lineHeight: 1.6, fontWeight: 300 }}>
          {desc}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: C.w30, letterSpacing: "0.5px", textTransform: "uppercase" }}>
            {time}
          </span>
          {action && (
            <span style={{
              fontFamily: "'Share Tech Mono',monospace", fontSize: 10,
              color: m.color, letterSpacing: "0.5px", textTransform: "uppercase", cursor: "pointer",
            }}>
              {action} →
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   ACTIVITY ROW
══════════════════════════════════════════════════════════════ */
function ActivityRow({ icon, text, sub, time, color }: {
  icon: string; text: string; sub: string; time: string; color: string
}) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:      "flex",
        alignItems:   "flex-start",
        gap:          12,
        padding:      "10px 10px",
        borderRadius: 12,
        background:   hov ? C.w04 : "transparent",
        transition:   "background .2s",
        cursor:       "pointer",
      }}
    >
      <div style={{
        width: 34, height: 34, borderRadius: 9, flexShrink: 0,
        background: `${color}10`, border: `1px solid ${color}22`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: C.w80, lineHeight: 1.5 }}>
          {text}
        </div>
        <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: C.w40, marginTop: 2 }}>{sub}</div>
      </div>
      <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: C.w30, letterSpacing: "0.4px", flexShrink: 0, paddingTop: 2 }}>
        {time}
      </span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   USER ROW (table-style)
══════════════════════════════════════════════════════════════ */
function UserRow({ name, role, course, score, status, avatar, color }: {
  name: string; role: string; course: string; score: number
  status: "Active" | "Inactive" | "At Risk"; avatar: string; color: string
}) {
  const [hov, setHov] = useState(false)
  const sColor = status === "Active" ? C.green : status === "At Risk" ? C.red : C.w40
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:     "flex",
        alignItems:  "center",
        gap:         14,
        padding:     "11px 14px",
        borderRadius: 12,
        background:  hov ? C.w04 : "transparent",
        border:      `1px solid ${hov ? C.w08 : "transparent"}`,
        transition:  "all .2s",
        cursor:      "pointer",
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: `linear-gradient(135deg,${color},${color}77)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Oxanium',sans-serif", fontWeight: 700, fontSize: 14,
        color: "#020810",
      }}>{avatar}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 14, fontWeight: 600, color: C.w90, marginBottom: 2 }}>
          {name}
        </div>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: color, letterSpacing: "0.5px", textTransform: "uppercase" }}>
          {role}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "none" }} className="lu-admin-table-col">
        <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: C.w50, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {course}
        </div>
      </div>
      <div style={{ width: 80, flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: C.w40, letterSpacing: "0.3px" }}>Score</span>
          <span style={{ fontFamily: "'Oxanium',sans-serif", fontSize: 12, fontWeight: 700, color: C.gold }}>{score}%</span>
        </div>
        <ProgressBar pct={score} color={C.gold} height={4} />
      </div>
      <span style={{
        padding: "3px 10px", borderRadius: 100, flexShrink: 0,
        background: `${sColor}12`, border: `1px solid ${sColor}25`,
        fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: sColor, letterSpacing: "0.5px",
      }}>
        {status}
      </span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   QUICK ACTION CARD
══════════════════════════════════════════════════════════════ */
function QuickAction({ icon, title, sub, color }: { icon: string; title: string; sub: string; color: string }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding:      "18px 16px",
        borderRadius: 16,
        background:   hov ? `${color}10` : C.w04,
        border:       `1px solid ${hov ? color + "30" : C.w08}`,
        cursor:       "pointer",
        transition:   "all .3s cubic-bezier(.22,1,.36,1)",
        textAlign:    "center",
        transform:    hov ? "translateY(-4px)" : "none",
        boxShadow:    hov ? `0 12px 32px rgba(0,0,0,0.4), 0 0 20px ${color}10` : "none",
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontFamily: "'Oxanium',sans-serif", fontWeight: 700, fontSize: 14, color: hov ? color : C.w80, marginBottom: 4, transition: "color .2s" }}>
        {title}
      </div>
      <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: C.w40 }}>{sub}</div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   ADMIN DASHBOARD PAGE
══════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [ready, setReady] = useState(false)
  useEffect(() => { const t = setTimeout(() => setReady(true), 80); return () => clearTimeout(t) }, [])

  const D = (s: number) => ready ? `lu-admin-reveal .5s cubic-bezier(.22,1,.36,1) ${s}s both` : "none"

  /* ── Data ── */
  const revenueData = [
    { label: "Jan", value: 62 }, { label: "Feb", value: 78 }, { label: "Mar", value: 55 },
    { label: "Apr", value: 90 }, { label: "May", value: 72 }, { label: "Jun", value: 84 },
    { label: "Jul", value: 95 }, { label: "Aug", value: 68 }, { label: "Sep", value: 88 },
    { label: "Oct", value: 76 }, { label: "Nov", value: 93 }, { label: "Dec", value: 100, highlight: true },
  ]

  const weeklyEnrollments = [
    { label: "Mon", value: 42 }, { label: "Tue", value: 67 }, { label: "Wed", value: 55 },
    { label: "Thu", value: 80 }, { label: "Fri", value: 73 }, { label: "Sat", value: 38 }, { label: "Sun", value: 22 },
  ]

  const courseCompletion = [
    { name: "AI / Machine Learning", pct: 84, color: C.blue,   learners: "3,200" },
    { name: "Full-Stack Engineering",  pct: 71, color: C.cyan,   learners: "2,800" },
    { name: "Quantum Computing",       pct: 58, color: C.purple, learners: "1,400" },
    { name: "Cloud & DevOps",          pct: 67, color: C.green,  learners: "2,100" },
    { name: "XR / Spatial Design",     pct: 79, color: C.gold,   learners: "1,600" },
    { name: "Cybersecurity",           pct: 65, color: C.red,    learners: "1,900" },
  ]

  const recentUsers = [
    { name: "Sara Chen",    role: "Student", course: "Deep Learning",        score: 92, status: "Active"   as const, avatar: "S", color: C.blue   },
    { name: "Marcus Lee",   role: "Student", course: "Quantum Computing",    score: 87, status: "Active"   as const, avatar: "M", color: C.cyan   },
    { name: "Dr. Arjun V.", role: "Trainer", course: "Neural Networks",       score: 96, status: "Active"   as const, avatar: "A", color: C.gold   },
    { name: "Jamie Park",   role: "Student", course: "Full-Stack Dev",        score: 45, status: "At Risk"  as const, avatar: "J", color: C.red    },
    { name: "Priya S.",     role: "Trainer", course: "React Workshop",        score: 91, status: "Active"   as const, avatar: "P", color: C.green  },
    { name: "Ravi Kumar",   role: "Student", course: "Cloud Infrastructure",  score: 34, status: "Inactive" as const, avatar: "R", color: C.w30    },
  ]

  const batchData = [
    { name: "Batch 2024-A", students: 48, trainer: "Dr. Arjun V.", course: "Neural Networks",  start: "Jan 10", end: "Mar 30", pct: 78, color: C.blue   },
    { name: "Batch 2024-B", students: 36, trainer: "Priya S.",     course: "React Workshop",    start: "Feb 01", end: "Apr 15", pct: 55, color: C.cyan   },
    { name: "Batch 2024-C", students: 52, trainer: "Vikram R.",    course: "Quantum Computing", start: "Mar 01", end: "May 31", pct: 33, color: C.purple },
    { name: "Batch 2024-D", students: 44, trainer: "Lena M.",      course: "XR & Spatial UI",   start: "Mar 15", end: "Jun 15", pct: 18, color: C.gold   },
  ]

  return (
    <>
      <LuminaBackground />

      {/* Scan line */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 1 }}>
        <div style={{
          position: "absolute", width: "100%", height: 1,
          background: "linear-gradient(90deg,transparent,rgba(255,185,0,0.04),rgba(255,185,0,0.09),rgba(255,185,0,0.04),transparent)",
          animation: "lu-admin-scan 16s linear infinite",
        }} />
      </div>

      <div style={{ display: "flex", height: "100vh", overflow: "hidden", position: "relative", zIndex: 2 }}>

        {/* ── Side Nav ── */}
        <LuminaSideNav role="admin" />

        {/* ── Right column ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

          {/* ── Top bar ── */}
          <LuminaTopBar role="admin" />

          {/* ── Scrollable content ── */}
          <div style={{ flex: 1, overflowY: "auto", padding: "22px 22px 44px" }}>
            <div style={{ maxWidth: 1440, margin: "0 auto" }}>

              {/* ── PAGE HEADER ── */}
              <div style={{ marginBottom: 28, animation: D(0) }}>
                <div style={{
                  fontFamily: "'Share Tech Mono',monospace", fontSize: 12,
                  color: C.gold, letterSpacing: "2px", textTransform: "uppercase",
                  marginBottom: 6, display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{ width: 18, height: 1, background: C.gold, opacity: .6, display: "inline-block" }} />
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
                  <div>
                    <h1 style={{
                      fontFamily: "'Oxanium',sans-serif", fontWeight: 800,
                      fontSize: "clamp(24px,3.5vw,36px)", color: C.w90,
                      letterSpacing: "-0.5px", margin: 0, lineHeight: 1.1,
                    }}>Admin Dashboard</h1>
                    <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 15, color: C.w50, margin: "6px 0 0", fontWeight: 300 }}>
                      Platform overview · <span style={{ color: C.gold, fontWeight: 600 }}>8,492 learners active</span> right now
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button style={{
                      padding: "10px 20px", borderRadius: 100, border: `1px solid ${C.w15}`,
                      background: C.w04, color: C.w70, cursor: "pointer",
                      fontFamily: "'Oxanium',sans-serif", fontSize: 13, fontWeight: 600,
                      letterSpacing: ".5px", transition: "all .2s",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = C.w08; e.currentTarget.style.color = C.w90 }}
                      onMouseLeave={e => { e.currentTarget.style.background = C.w04; e.currentTarget.style.color = C.w70 }}
                    >↓ Export Report</button>
                    <button style={{
                      padding: "10px 20px", borderRadius: 100,
                      border: "1px solid rgba(255,185,0,0.35)",
                      background: "linear-gradient(135deg,#ffc933,#ffad00)",
                      color: "#020810", cursor: "pointer",
                      fontFamily: "'Oxanium',sans-serif", fontSize: 13, fontWeight: 700,
                      letterSpacing: ".5px", boxShadow: "0 0 24px rgba(255,185,0,0.35)",
                      transition: "all .25s",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 36px rgba(255,185,0,0.55)" }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 0 24px rgba(255,185,0,0.35)" }}
                    >+ Add Course</button>
                  </div>
                </div>
              </div>

              {/* ── AI INSIGHT BANNER ── */}
              <Card accent={C.gold} noHover style={{ padding: "22px 26px", marginBottom: 22, animation: D(.06) }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 18, flexWrap: "wrap" }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                    background: "linear-gradient(135deg,rgba(255,185,0,0.18),rgba(255,185,0,0.08))",
                    border: "1px solid rgba(255,185,0,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, animation: "lu-admin-orb 4s ease-in-out infinite",
                  }}>◉</div>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9, flexWrap: "wrap" }}>
                      <Chip text="AI Insight" color={C.gold} dot />
                      <Chip text="Live" color={C.green} dot />
                    </div>
                    <div style={{ fontFamily: "'Oxanium',sans-serif", fontWeight: 700, fontSize: 19, color: C.w90, marginBottom: 8, lineHeight: 1.3 }}>
                      Platform engagement is up <span style={{ color: C.gold }}>18%</span> week-over-week 🎯 — 3 students need immediate attention
                    </div>
                    <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 14, color: C.w50, lineHeight: 1.75, fontWeight: 300, maxWidth: 680 }}>
                      AI Tutor has resolved 1,240 student queries today. Course completion in AI/ML domain reached 84% — highest this quarter. 3 at-risk students detected: Jamie Park, Ravi Kumar, Aditi Nair. Automated outreach is ready to send.
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                      <button style={{
                        padding: "9px 18px", borderRadius: 100, border: "none", cursor: "pointer",
                        background: "linear-gradient(135deg,#ffc933,#ffad00)",
                        color: "#020810", fontFamily: "'Oxanium',sans-serif",
                        fontSize: 13, fontWeight: 700, letterSpacing: ".5px",
                        boxShadow: "0 0 20px rgba(255,185,0,0.35)", transition: "all .2s",
                      }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 32px rgba(255,185,0,0.5)" }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 0 20px rgba(255,185,0,0.35)" }}
                      >Send Intervention Messages</button>
                      <button style={{
                        padding: "9px 18px", borderRadius: 100, cursor: "pointer",
                        background: C.w04, border: `1px solid ${C.w15}`,
                        color: C.w70, fontFamily: "'Oxanium',sans-serif",
                        fontSize: 13, fontWeight: 600, letterSpacing: ".5px", transition: "all .2s",
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = C.w08; e.currentTarget.style.color = C.w90 }}
                        onMouseLeave={e => { e.currentTarget.style.background = C.w04; e.currentTarget.style.color = C.w70 }}
                      >View Full Report →</button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* ── STAT CARDS ── */}
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
                gap: 14, marginBottom: 22, animation: D(.1),
              }}>
                <StatCard icon="👥" value="8,492"  label="Active Learners"  change="+342 this week"   color={C.blue}   positive />
                <StatCard icon="📘" value="247"    label="Live Courses"     change="+12 added"        color={C.cyan}   positive />
                <StatCard icon="🧑‍🏫" value="48"  label="Trainers"         change="+3 onboarded"     color={C.gold}   positive />
                <StatCard icon="✅" value="73%"    label="Completion Rate"  change="+4% vs last month" color={C.green}  positive />
                <StatCard icon="◉" value="23K"     label="AI Sessions Today" change="+2,400 today"    color={C.purple} positive sub="queries handled" />
                <StatCard icon="💰" value="₹12.4L" label="Monthly Revenue"  change="+18% vs last"     color={C.orange} positive sub="this month" />
              </div>

              {/* ── PLATFORM HEALTH RINGS ── */}
              <Card accent={C.gold} noHover style={{ padding: "22px 28px", marginBottom: 22, animation: D(.13) }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 10 }}>
                  <h2 style={{ fontFamily: "'Oxanium',sans-serif", fontWeight: 700, fontSize: 17, color: C.w90, margin: 0 }}>
                    Platform Health
                  </h2>
                  <Chip text="All Systems Normal" color={C.green} dot />
                </div>
                <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 20 }}>
                  <ArcRing pct={87} size={82} color={C.gold}   value="87%"  label="Attendance Rate" />
                  <ArcRing pct={73} size={82} color={C.blue}   value="73%"  label="Completion Rate" />
                  <ArcRing pct={94} size={82} color={C.green}  value="94%"  label="Student Score Avg" />
                  <ArcRing pct={78} size={82} color={C.cyan}   value="78%"  label="Engagement Index" />
                  <ArcRing pct={62} size={82} color={C.purple} value="62%"  label="Trainer Utilisation" />
                  <ArcRing pct={91} size={82} color={C.orange} value="91%"  label="AI Tutor Accuracy" />
                </div>
              </Card>

              {/* ── CHARTS ROW ── */}
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
                gap: 18, marginBottom: 22,
              }}>

                {/* Revenue chart */}
                <Card accent={C.gold} style={{ padding: "22px", animation: D(.15) }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                    <h2 style={{ fontFamily: "'Oxanium',sans-serif", fontWeight: 700, fontSize: 17, color: C.w90, margin: 0 }}>Revenue</h2>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontFamily: "'Oxanium',sans-serif", fontWeight: 700, fontSize: 22, color: C.gold }}>₹12.4L</span>
                      <Chip text="+18%" color={C.green} />
                    </div>
                  </div>
                  <BarChart data={revenueData} color={C.gold} maxH={88} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
                    {[
                      { l: "Annual Target",   v: "₹1.5Cr",  c: C.gold  },
                      { l: "This Quarter",    v: "₹38.2L",  c: C.cyan  },
                      { l: "Avg per Student", v: "₹1,462",  c: C.blue  },
                      { l: "Pending Dues",    v: "₹2.1L",   c: C.red   },
                    ].map((s, i) => (
                      <div key={i} style={{ padding: "10px 12px", borderRadius: 10, background: `${s.c}08`, border: `1px solid ${s.c}18` }}>
                        <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: C.w40, marginBottom: 4 }}>{s.l}</div>
                        <div style={{ fontFamily: "'Oxanium',sans-serif", fontWeight: 700, fontSize: 16, color: s.c }}>{s.v}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Weekly enrollments */}
                <Card accent={C.blue} style={{ padding: "22px", animation: D(.17) }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                    <h2 style={{ fontFamily: "'Oxanium',sans-serif", fontWeight: 700, fontSize: 17, color: C.w90, margin: 0 }}>New Enrollments</h2>
                    <Chip text="This Week" color={C.blue} />
                  </div>
                  <div style={{ marginBottom: 6 }}>
                    <span style={{ fontFamily: "'Oxanium',sans-serif", fontWeight: 700, fontSize: 26, color: C.blue }}>437</span>
                    <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: C.w40, marginLeft: 10 }}>students enrolled</span>
                  </div>
                  <BarChart data={weeklyEnrollments} color={C.blue} maxH={75} />
                  <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                    {[
                      { l: "AI / ML",     v: "142", c: C.blue   },
                      { l: "Engineering", v: "98",  c: C.cyan   },
                      { l: "Design",      v: "76",  c: C.gold   },
                      { l: "Security",    v: "121", c: C.purple },
                    ].map((s, i) => (
                      <div key={i} style={{
                        flex: "1 1 80px", padding: "8px 10px", borderRadius: 10,
                        background: `${s.c}08`, border: `1px solid ${s.c}18`, textAlign: "center",
                      }}>
                        <div style={{ fontFamily: "'Oxanium',sans-serif", fontWeight: 700, fontSize: 18, color: s.c }}>{s.v}</div>
                        <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: C.w40 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Course completion by domain */}
                <Card accent={C.cyan} style={{ padding: "22px", animation: D(.19) }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <h2 style={{ fontFamily: "'Oxanium',sans-serif", fontWeight: 700, fontSize: 17, color: C.w90, margin: 0 }}>Completion by Domain</h2>
                    <a href="/admin/analytics" style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: C.blue, letterSpacing: "0.5px", textTransform: "uppercase", textDecoration: "none" }}>Details →</a>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {courseCompletion.map((c, i) => (
                      <div key={i}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, boxShadow: `0 0 6px ${c.color}`, flexShrink: 0 }} />
                            <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: C.w70, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
                          </div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                            <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: C.w30 }}>{c.learners}</span>
                            <span style={{ fontFamily: "'Oxanium',sans-serif", fontWeight: 700, fontSize: 14, color: c.color, minWidth: 36, textAlign: "right" }}>{c.pct}%</span>
                          </div>
                        </div>
                        <ProgressBar pct={c.pct} color={c.color} height={5} />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* ── USERS + ALERTS ── */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 18, marginBottom: 22 }}>

                {/* Recent users */}
                <div style={{ gridColumn: "span 2", animation: D(.21) }}>
                  <Card accent={C.gold} style={{ padding: "22px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                      <h2 style={{ fontFamily: "'Oxanium',sans-serif", fontWeight: 700, fontSize: 17, color: C.w90, margin: 0 }}>Recent Users</h2>
                      <div style={{ display: "flex", gap: 10 }}>
                        <a href="/admin/students" style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: C.blue, letterSpacing: "0.5px", textTransform: "uppercase", textDecoration: "none" }}>All users →</a>
                      </div>
                    </div>

                    {/* Header row */}
                    <div style={{
                      display: "flex", gap: 14, padding: "6px 14px",
                      fontFamily: "'Share Tech Mono',monospace", fontSize: 9,
                      color: C.w30, textTransform: "uppercase", letterSpacing: "1px",
                      borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 6,
                    }}>
                      <div style={{ width: 36, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>Name</div>
                      <div style={{ width: 80, flexShrink: 0 }}>Score</div>
                      <div style={{ width: 70, flexShrink: 0 }}>Status</div>
                    </div>

                    {recentUsers.map((u, i) => (
                      <UserRow key={i} {...u} />
                    ))}
                  </Card>
                </div>

                {/* AI Alerts */}
                <Card accent={C.gold} style={{ padding: "22px", animation: D(.23) }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                    <h2 style={{ fontFamily: "'Oxanium',sans-serif", fontWeight: 700, fontSize: 17, color: C.w90, margin: 0 }}>AI Alerts</h2>
                    <Chip text="4 new" color={C.gold} dot />
                  </div>
                  <AlertRow type="success" title="Engagement up 18%"       desc="AI Tutor feature is driving more learner time-on-platform. Suggest expanding to all cohorts." time="Just now"   action="View Details" />
                  <AlertRow type="danger"  title="3 students at dropout risk" desc="Jamie Park, Ravi Kumar, and Aditi Nair show low attendance and declining scores."          time="25 min ago" action="Send Message" />
                  <AlertRow type="warning" title="Course deadline this Friday"  desc="47 students have not submitted Neural Networks Assignment due in 2 days."               time="1 hr ago"   action="Notify Batch" />
                  <AlertRow type="info"    title="New course suggestion"        desc="AI analysis: A Quantum for ML Engineers path could serve 24% of your AI learners."       time="2 hrs ago"  action="Create Course" />
                </Card>
              </div>

              {/* ── BATCHES + ACTIVITY ── */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 18, marginBottom: 22 }}>

                {/* Active batches */}
                <div style={{ gridColumn: "span 2", animation: D(.25) }}>
                  <Card accent={C.cyan} style={{ padding: "22px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                      <h2 style={{ fontFamily: "'Oxanium',sans-serif", fontWeight: 700, fontSize: 17, color: C.w90, margin: 0 }}>Active Batches</h2>
                      <a href="/admin/batches" style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: C.blue, letterSpacing: "0.5px", textTransform: "uppercase", textDecoration: "none" }}>Manage →</a>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {batchData.map((b, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex", alignItems: "center", gap: 16, padding: "14px 16px",
                            borderRadius: 14, background: C.w04, border: `1px solid ${C.w08}`,
                            cursor: "pointer", transition: "all .2s", flexWrap: "wrap",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,212,255,0.06)"; e.currentTarget.style.borderColor = "rgba(0,212,255,0.2)" }}
                          onMouseLeave={e => { e.currentTarget.style.background = C.w04; e.currentTarget.style.borderColor = C.w08 }}
                        >
                          <div style={{
                            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                            background: `${b.color}12`, border: `1px solid ${b.color}25`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontFamily: "'Oxanium',sans-serif", fontWeight: 800, fontSize: 11,
                            color: b.color, letterSpacing: "0.5px",
                          }}>
                            {b.students}
                          </div>
                          <div style={{ flex: 1, minWidth: 180 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4, flexWrap: "wrap" }}>
                              <span style={{ fontFamily: "'Oxanium',sans-serif", fontWeight: 700, fontSize: 15, color: C.w90 }}>{b.name}</span>
                              <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: b.color, letterSpacing: "0.8px", textTransform: "uppercase" }}>
                                {b.students} students
                              </span>
                            </div>
                            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: C.w40 }}>
                              {b.trainer} · {b.course}
                            </div>
                          </div>
                          <div style={{ minWidth: 140, flex: "0 0 auto" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                              <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: C.w40 }}>{b.start} → {b.end}</span>
                              <span style={{ fontFamily: "'Oxanium',sans-serif", fontWeight: 700, fontSize: 13, color: b.color }}>{b.pct}%</span>
                            </div>
                            <ProgressBar pct={b.pct} color={b.color} height={4} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Activity feed */}
                <Card accent={C.purple} style={{ padding: "22px", animation: D(.27) }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                    <h2 style={{ fontFamily: "'Oxanium',sans-serif", fontWeight: 700, fontSize: 17, color: C.w90, margin: 0 }}>Live Activity</h2>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, boxShadow: `0 0 8px ${C.green}`, animation: "lu-admin-pulse 2s ease-in-out infinite" }} />
                  </div>
                  <ActivityRow icon="📖" text="Sara Chen completed Module 7 — Deep Learning"        sub="Score: 94%"             time="2m ago"  color={C.blue}   />
                  <ActivityRow icon="🏆" text="Marcus Lee earned the Speed Learner achievement"      sub="Level 18 reached"      time="5m ago"  color={C.gold}   />
                  <ActivityRow icon="◉"  text="AI Tutor resolved 47 learner queries in last hour"   sub="Avg response: 3.2s"    time="8m ago"  color={C.cyan}   />
                  <ActivityRow icon="🆕" text="Dr. Arjun V. published Advanced Vision Transformers" sub="Course · 12 modules"   time="22m ago" color={C.orange} />
                  <ActivityRow icon="⚠️" text="Jamie Park missed 3 consecutive sessions"            sub="Attendance: 34%"       time="35m ago" color={C.red}    />
                  <ActivityRow icon="🎓" text="12 students passed Quantum Primer certification"     sub="Batch 2024-C"          time="1h ago"  color={C.green}  />
                  <ActivityRow icon="🧑‍🏫" text="Priya S. started React Workshop live session"      sub="36 students joined"    time="1h ago"  color={C.purple} />
                </Card>
              </div>

              {/* ── QUICK ACTIONS ── */}
              <div style={{ animation: D(.29) }}>
                <h2 style={{ fontFamily: "'Oxanium',sans-serif", fontWeight: 700, fontSize: 17, color: C.w90, margin: "0 0 16px" }}>Quick Actions</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12 }}>
                  <QuickAction icon="📢" title="Broadcast"     sub="Message all learners"    color={C.blue}   />
                  <QuickAction icon="🧑‍🏫" title="Add Trainer"  sub="Onboard a new faculty"   color={C.gold}   />
                  <QuickAction icon="📘" title="New Course"    sub="Create learning content"  color={C.cyan}   />
                  <QuickAction icon="👥" title="New Batch"     sub="Group students together"  color={C.green}  />
                  <QuickAction icon="📅" title="Schedule Class" sub="Add to timetable"         color={C.purple} />
                  <QuickAction icon="📊" title="Generate Report" sub="Export platform data"   color={C.orange} />
                  <QuickAction icon="⚙️" title="Settings"      sub="Platform configuration"  color={C.w40}    />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── GLOBAL STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@300;400;500;600;700;800&family=Raleway:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap');
        *, *::before, *::after { box-sizing:border-box; }
        html, body { background:#020810; margin:0; height:100%; }
        input::placeholder { color:rgba(200,220,255,0.22); font-family:'Raleway',sans-serif; }

        @keyframes lu-admin-scan  { from{transform:translateY(-100vh)} to{transform:translateY(200vh)} }
        @keyframes lu-admin-reveal{ from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes lu-admin-orb   {
          0%,100%{ box-shadow:0 0 12px rgba(255,185,0,0.4),0 0 30px rgba(255,185,0,0.14); }
          50%    { box-shadow:0 0 24px rgba(255,185,0,0.65),0 0 60px rgba(255,185,0,0.24); }
        }
        @keyframes lu-admin-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.2)} }

        ::-webkit-scrollbar       { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(255,185,0,0.2); border-radius:4px; }

        @media (max-width:640px) {
          .lu-admin-table-col { display:none !important; }
        }
      `}</style>
    </>
  )
}

declare module "react" { interface CSSProperties { [key: string]: any } }