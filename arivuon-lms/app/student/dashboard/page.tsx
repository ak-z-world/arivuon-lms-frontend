// app/student/dashboard/page.tsx
"use client"


import axios from "axios"
import { jwtDecode } from "jwt-decode"
import { useEffect, useRef, useState } from "react"
import LuminaBackground from "@/components/background/LuminaBackground"
import LuminaSideNav    from "@/components/layout/LuminaSideNav"
import LuminaTopBar     from "@/components/layout/LuminaTopBar"

type TokenPayload = {
  sub: string
  role: string
}
/* ══════════════════════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════════════════════ */
const C = {
  blue:    "#1a96ff",
  cyan:    "#00d4ff",
  gold:    "#ffc933",
  green:   "#00e5a0",
  red:     "#ff4d6a",
  purple:  "#a78bfa",
  surface: "rgba(5,14,32,0.88)",
  w90:     "rgba(255,255,255,0.9)",
  w70:     "rgba(255,255,255,0.7)",
  w60:     "rgba(255,255,255,0.6)",
  w50:     "rgba(255,255,255,0.5)",
  w40:     "rgba(255,255,255,0.4)",
  w80: "rgba(255,255,255,0.8)",
  w30:     "rgba(255,255,255,0.3)",
  w15:     "rgba(255,255,255,0.15)",
  w08:     "rgba(255,255,255,0.08)",
  w04:     "rgba(255,255,255,0.04)",
}

/* ══════════════════════════════════════════════════════════════
   REUSABLE CARD
══════════════════════════════════════════════════════════════ */
function Card({
  children,
  accent    = C.blue,
  style     = {},
  noHover   = false,
  className = "",
}: {
  children:   React.ReactNode
  accent?:    string
  style?:     React.CSSProperties
  noHover?:   boolean
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
        border:         `1px solid ${hov ? accent + "38" : accent + "16"}`,
        borderRadius:   20,
        backdropFilter: "blur(28px) saturate(155%)",
        position:       "relative",
        overflow:       "hidden",
        transition:     "all 0.35s cubic-bezier(0.22,1,0.36,1)",
        transform:      hov && !noHover ? "translateY(-3px)" : "none",
        boxShadow:      hov && !noHover
          ? `0 20px 60px rgba(0,0,0,0.55), 0 0 30px ${accent}10`
          : "0 8px 40px rgba(0,0,0,0.45)",
        ...style,
      }}
    >
      {/* Top sheen */}
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
   PROGRESS BAR
══════════════════════════════════════════════════════════════ */
function ProgressBar({
  pct,
  color  = C.blue,
  height = 6,
}: { pct: number; color?: string; height?: number }) {
  const [w, setW] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setW(pct), 200)
    return () => clearTimeout(t)
  }, [pct])

  return (
    <div
      style={{
        height,
        borderRadius: height,
        background:   "rgba(255,255,255,0.05)",
        overflow:     "hidden",
      }}
    >
      <div
        style={{
          height:     "100%",
          width:      `${w}%`,
          borderRadius: height,
          background: `linear-gradient(90deg,${color}80,${color})`,
          boxShadow:  `0 0 8px ${color}55`,
          transition: "width 1.4s cubic-bezier(0.22,1,0.36,1)",
        }}
      />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   STAT CARD
══════════════════════════════════════════════════════════════ */
function StatCard({
  icon, value, label, change, color, positive = true,
}: {
  icon: string; value: string; label: string
  change: string; color: string; positive?: boolean
}) {
  return (
    <Card accent={color} style={{ padding: "22px 24px" }}>
      <div
        style={{
          width:          44,
          height:         44,
          borderRadius:   12,
          marginBottom:   16,
          background:     `${color}12`,
          border:         `1px solid ${color}25`,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          fontSize:       20,
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontFamily:    "'Oxanium', sans-serif",
          fontWeight:    700,
          fontSize:      30,
          color,
          letterSpacing: "-0.5px",
          lineHeight:    1,
          marginBottom:  5,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily:   "'Raleway', sans-serif",
          fontSize:     14,
          color:        C.w60,
          marginBottom: 10,
        }}
      >
        {label}
      </div>
      <div
        style={{
          display:     "inline-flex",
          alignItems:  "center",
          gap:         5,
          padding:     "3px 10px",
          borderRadius: 100,
          background:  positive ? "rgba(0,229,160,0.1)" : "rgba(255,77,106,0.1)",
          border:      `1px solid ${positive ? "rgba(0,229,160,0.22)" : "rgba(255,77,106,0.22)"}`,
          fontFamily:  "'Share Tech Mono', monospace",
          fontSize:    11,
          color:       positive ? C.green : C.red,
        }}
      >
        {positive ? "↑" : "↓"} {change}
      </div>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════
   SVG ARC RING
══════════════════════════════════════════════════════════════ */
function ArcRing({
  pct, size = 80, color = C.blue, value, label,
}: { pct: number; size: number; color: string; value: string; label: string }) {
  const r    = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const [p, setP] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setP(pct), 260)
    return () => clearTimeout(t)
  }, [pct])

  return (
    <div
      style={{
        display:       "flex",
        flexDirection: "column",
        alignItems:    "center",
        gap:           8,
      }}
    >
      <div style={{ position: "relative", width: size, height: size }}>
        <svg
          width={size}
          height={size}
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={`${color}15`} strokeWidth={7}
          />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color} strokeWidth={7}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - p / 100)}
            style={{
              filter:     `drop-shadow(0 0 6px ${color})`,
              transition: "stroke-dashoffset 1.5s ease",
            }}
          />
        </svg>
        <div
          style={{
            position:       "absolute",
            inset:          0,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "'Oxanium', sans-serif",
              fontWeight: 700,
              fontSize:   size * 0.2,
              color,
              lineHeight: 1,
            }}
          >
            {value}
          </span>
        </div>
      </div>
      <span
        style={{
          fontFamily:  "'Raleway', sans-serif",
          fontSize:    13,
          color:       C.w50,
          textAlign:   "center",
          lineHeight:  1.3,
        }}
      >
        {label}
      </span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   AI TUTOR CHAT
══════════════════════════════════════════════════════════════ */
const INITIAL_MESSAGES = [
  {
    from: "ai",
    text: "Hi Arun! You're doing great — 74% through Neural Networks. Your next topic is Backpropagation. Want me to break it down for you?",
  },
  {
    from: "user",
    text: "Yes, explain it simply",
  },
  {
    from: "ai",
    text: "Think of it like passing blame backwards through a relay race. Each layer gets told how much it contributed to the error and adjusts. I've built a 15-minute visual session matched to your learning style — ready?",
  },
]

const AI_REPLIES = [
  "Based on your recent sessions, I'd focus on the Chain Rule next — it's the foundation of what you asked. Want a quick example?",
  "Your strongest skill right now is Mathematics (85%). I suggest pairing that with Data Science to close the gap. Shall I build a study plan?",
  "You're in the top 8% of your batch this week 🎯 The next milestone unlocks a Certificate badge. Keep it up!",
  "I've noticed you study best between 9 AM and 12 PM. Today's lab falls right in that window — great timing.",
]

function AITutorChat() {
  const [msgs,     setMsgs]     = useState(INITIAL_MESSAGES)
  const [input,    setInput]    = useState("")
  const [thinking, setThinking] = useState(false)
  const bottomRef              = useRef<HTMLDivElement>(null)


  const send = async (text: string) => {
    if (!text.trim()) return
    setMsgs(m => [...m, { from: "user", text }])
    setInput("")
    setThinking(true)
    await new Promise(r => setTimeout(r, 1050))
    setMsgs(m => [
      ...m,
      { from: "ai", text: AI_REPLIES[Math.floor(Math.random() * AI_REPLIES.length)] },
    ])
    setThinking(false)
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [msgs, thinking])

  return (
    <Card
      accent={C.cyan}
      noHover
      style={{
        display:       "flex",
        flexDirection: "column",
        height:        "100%",
        padding:       0,
        overflow:      "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding:      "18px 20px",
          borderBottom: "1px solid rgba(0,212,255,0.12)",
          display:      "flex",
          alignItems:   "center",
          gap:          14,
          flexShrink:   0,
        }}
      >
        <div
          style={{
            width:        42,
            height:       42,
            borderRadius: 12,
            flexShrink:   0,
            background:   "linear-gradient(135deg,rgba(26,150,255,0.2),rgba(0,212,255,0.2))",
            border:       "1px solid rgba(0,212,255,0.3)",
            display:      "flex",
            alignItems:   "center",
            justifyContent: "center",
            fontSize:     20,
            animation:    "lu-orb-breathe 4s ease-in-out infinite",
          }}
        >◉</div>

        <div>
          <div
            style={{
              fontFamily:    "'Oxanium', sans-serif",
              fontWeight:    700,
              fontSize:      16,
              color:         C.w90,
              letterSpacing: "0.5px",
            }}
          >
            AI Tutor
          </div>
          <div
            style={{
              display:     "flex",
              alignItems:  "center",
              gap:         6,
              marginTop:   2,
            }}
          >
            <div
              style={{
                width:     6,
                height:    6,
                borderRadius: "50%",
                background: C.green,
                boxShadow: `0 0 6px ${C.green}`,
              }}
            />
            <span
              style={{
                fontFamily:    "'Share Tech Mono', monospace",
                fontSize:      11,
                color:         C.green,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Online
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex:      1,
          overflowY: "auto",
          padding:   "16px 18px",
          display:   "flex",
          flexDirection: "column",
          gap:       14,
          minHeight: 0,
        }}
      >
        {msgs.map((m, i) => (
          <div
            key={i}
            style={{
              display:       "flex",
              justifyContent: m.from === "user" ? "flex-end" : "flex-start",
            }}
          >
            {m.from === "ai" && (
              <div
                style={{
                  width:        32,
                  height:       32,
                  borderRadius: 10,
                  flexShrink:   0,
                  marginRight:  10,
                  background:   "linear-gradient(135deg,#1a96ff,#00d4ff)",
                  display:      "flex",
                  alignItems:   "center",
                  justifyContent: "center",
                  fontSize:     14,
                  alignSelf:    "flex-end",
                }}
              >◉</div>
            )}
            <div
              style={{
                maxWidth:    "76%",
                padding:     "12px 16px",
                borderRadius: m.from === "user"
                  ? "16px 16px 4px 16px"
                  : "4px 16px 16px 16px",
                background: m.from === "user"
                  ? "linear-gradient(135deg,rgba(26,150,255,0.2),rgba(0,150,255,0.12))"
                  : "rgba(0,212,255,0.07)",
                border: `1px solid ${
                  m.from === "user"
                    ? "rgba(0,180,255,0.25)"
                    : "rgba(0,212,255,0.15)"
                }`,
                fontFamily: "'Raleway', sans-serif",
                fontSize:   14,
                lineHeight: 1.7,
                color:      C.w80,
              }}
            >
              {m.text}
            </div>
          </div>
        ))}

        {/* Thinking dots */}
        {thinking && (
          <div style={{ display: "flex", gap: 10 }}>
            <div
              style={{
                width:        32,
                height:       32,
                borderRadius: 10,
                background:   "linear-gradient(135deg,#1a96ff,#00d4ff)",
                display:      "flex",
                alignItems:   "center",
                justifyContent: "center",
                fontSize:     14,
              }}
            >◉</div>
            <div
              style={{
                padding:      "12px 16px",
                borderRadius: "4px 16px 16px 16px",
                background:   "rgba(0,212,255,0.07)",
                border:       "1px solid rgba(0,212,255,0.15)",
                display:      "flex",
                gap:          5,
                alignItems:   "center",
              }}
            >
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  style={{
                    width:        6,
                    height:       6,
                    borderRadius: "50%",
                    background:   C.cyan,
                    animation:    `lu-dot-bounce 1s ease ${i * 0.18}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestion chips */}
      <div
        style={{
          padding:      "10px 16px",
          borderTop:    "1px solid rgba(0,212,255,0.08)",
          display:      "flex",
          gap:          8,
          flexWrap:     "wrap",
          flexShrink:   0,
        }}
      >
        {["Explain this topic", "Quiz me", "What's next?", "My weak areas"].map(s => (
          <button
            key={s}
            onClick={() => send(s)}
            style={{
              padding:      "6px 13px",
              borderRadius: 100,
              cursor:       "pointer",
              background:   "rgba(0,212,255,0.07)",
              border:       "1px solid rgba(0,212,255,0.2)",
              color:        C.cyan,
              fontFamily:   "'Raleway', sans-serif",
              fontSize:     12,
              fontWeight:   500,
              transition:   "all 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(0,212,255,0.15)"
              e.currentTarget.style.transform  = "translateY(-2px)"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(0,212,255,0.07)"
              e.currentTarget.style.transform  = "none"
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div
        style={{
          padding:   "14px 16px",
          borderTop: "1px solid rgba(0,212,255,0.08)",
          display:   "flex",
          gap:       10,
          flexShrink: 0,
        }}
      >
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send(input)}
          placeholder="Ask your AI tutor anything…"
          style={{
            flex:        1,
            background:  "rgba(0,212,255,0.05)",
            border:      "1px solid rgba(0,212,255,0.18)",
            borderRadius: 12,
            padding:     "11px 15px",
            color:       C.w90,
            fontFamily:  "'Raleway', sans-serif",
            fontSize:    14,
            outline:     "none",
            transition:  "border-color 0.2s",
          }}
          onFocus={e  => e.currentTarget.style.borderColor = "rgba(0,212,255,0.45)"}
          onBlur={e   => e.currentTarget.style.borderColor = "rgba(0,212,255,0.18)"}
        />
        <button
          onClick={() => send(input)}
          style={{
            width:        42,
            height:       42,
            borderRadius: 12,
            border:       "none",
            cursor:       "pointer",
            background:   "linear-gradient(135deg,#1a96ff,#00d4ff)",
            color:        "white",
            fontSize:     16,
            display:      "flex",
            alignItems:   "center",
            justifyContent: "center",
            boxShadow:    "0 0 16px rgba(0,150,255,0.4)",
            transition:   "all 0.2s",
            flexShrink:   0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "scale(1.08)"
            e.currentTarget.style.boxShadow = "0 0 24px rgba(0,200,255,0.55)"
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "scale(1)"
            e.currentTarget.style.boxShadow = "0 0 16px rgba(0,150,255,0.4)"
          }}
        >↑</button>
      </div>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════
   ATTENDANCE BAR CHART  (animated on mount)
══════════════════════════════════════════════════════════════ */
function AttBar({ day, value, delay }: { day: string; value: number; delay: number }) {
  const color =
    value >= 90 ? C.green :
    value >= 70 ? C.blue  :
    value >= 50 ? C.gold  : C.red

  const [h, setH] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setH(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])

  return (
    <div
      style={{
        flex:          1,
        display:       "flex",
        flexDirection: "column",
        alignItems:    "center",
        gap:           6,
      }}
    >
      <div
        style={{
          width:        "100%",
          borderRadius: "5px 5px 0 0",
          height:       `${h * 0.75}%`,
          minHeight:    4,
          background:   `linear-gradient(180deg,${color},${color}44)`,
          boxShadow:    `0 0 10px ${color}33`,
          transition:   "height 1.4s cubic-bezier(0.22,1,0.36,1)",
          cursor:       "pointer",
        }}
        onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.5)")}
        onMouseLeave={e => (e.currentTarget.style.filter = "brightness(1)")}
      />
      <span
        style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize:   10,
          color:      C.w30,
          letterSpacing: "0.3px",
        }}
      >
        {day}
      </span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   STUDENT DASHBOARD PAGE
══════════════════════════════════════════════════════════════ */
export default function StudentDashboard() {
  const [ready, setReady] = useState(false)
    const [dashboard, setDashboard] = useState<any>(null)
const [loading, setLoading] = useState(true)
  useEffect(() => {
  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      // decode token
      const decoded = jwtDecode<TokenPayload>(token)
      const studentUUID = decoded.sub

      // call backend directly
      const res = await axios.get(
        `http://localhost:8000/analytics/dashboard/student/${studentUUID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setDashboard(res.data.data)

    } catch (err) {
      console.error("Dashboard fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  fetchDashboard()
}, [])
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80)
    return () => clearTimeout(t)
  }, [])
if (loading) {
  return <div style={{ color: "white", padding: "20px" }}>Loading...</div>
}
const formatSkills = (skills: any[]) => {
  const colors = [C.blue, C.cyan, C.green, C.gold, "#ff7c5c"]

  return skills.map((s, i) => ({
    name: s.name || s.skill || "Skill",
    pct: s.percentage || s.pct || 0,
    color: colors[i % colors.length],
  }))
}
const formatSchedule = (sessions: any[]) => {
  const icons = ["🧠", "⚡", "📊", "☁️"]

  return sessions.map((s, i) => ({
    time: s.time || s.start_time || "00:00",
    title: s.title || s.name || "Session",
    trainer: s.trainer_name || s.trainer || "Trainer",
    live: s.is_live ?? false,
    icon: icons[i % icons.length],
  }))
}
  const formatCourses = (courses: any[]) => {
  const colors = [C.blue, C.cyan, C.purple, C.gold]
  const icons  = ["🧠", "⚡", "☁️", "🔮"]

  return courses.map((c, i) => ({
    name: c.name || c.title || "Course",
    cat: c.category || "General",
    pct: c.progress || c.pct || 0,
    color: colors[i % colors.length],
    icon: icons[i % icons.length],
  }))
}
const formatAttendance = (attendance: any[]) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  return attendance.map((a, i) => ({
    day: a.day || days[i % 7],
    value: a.value || a.percentage || 0,
  }))
}
  /* ── Static data ── */
  const courses = formatCourses(dashboard?.courses || [])

  const schedule = formatSchedule(dashboard?.upcoming_sessions || [])

  const skills = formatSkills(dashboard?.skills || [])

  const attendance = formatAttendance(dashboard?.attendance || [])

  const leaderboard = [
    { name: "Arun",  score: 3210, you: false },
    { name: "Vignesh", score: 3088, you: false },
    { name: "You",      score: 2847, you: true  },
    { name: "Siva",   score: 2621, you: false },
  ]

  const D = (s: number) =>
    ready ? `lu-slide-up 0.5s cubic-bezier(0.22,1,0.36,1) ${s}s both` : "none"

  return (
    <>
      {/* ── Persistent background canvas ── */}
      <LuminaBackground />

      {/* ── Scan-line overlay ── */}
      <div
        style={{
          position:      "fixed",
          inset:         0,
          pointerEvents: "none",
          overflow:      "hidden",
          zIndex:        1,
        }}
      >
        <div
          style={{
            position:   "absolute",
            width:      "100%",
            height:     1,
            background: "linear-gradient(90deg,transparent,rgba(0,212,255,0.05),rgba(0,212,255,0.11),rgba(0,212,255,0.05),transparent)",
            animation:  "lu-scan 14s linear infinite",
          }}
        />
      </div>

      {/* ── App shell: nav + main column ── */}
      <div
        style={{
          display:   "flex",
          height:    "100vh",
          overflow:  "hidden",
          position:  "relative",
          zIndex:    2,
        }}
      >
        {/* ── Side nav (separate component) ── */}
        <LuminaSideNav role="student" />

        {/* ── Right column: top bar + scrollable content ── */}
        <div
          style={{
            flex:          1,
            display:       "flex",
            flexDirection: "column",
            overflow:      "hidden",
            minWidth:      0,
          }}
        >
          {/* ── Top bar (separate component) ── */}
          <LuminaTopBar role="student" />

          {/* ── Scrollable dashboard content ── */}
          <div
            style={{
              flex:      1,
              overflowY: "auto",
              padding:   "22px 22px 44px",
            }}
          >
            <div style={{ maxWidth: 1400, margin: "0 auto" }}>

              {/* ── Page header ── */}
              <div style={{ marginBottom: 28, animation: D(0) }}>
                <div
                  style={{
                    fontFamily:    "'Share Tech Mono', monospace",
                    fontSize:      12,
                    color:         C.cyan,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    marginBottom:  6,
                    display:       "flex",
                    alignItems:    "center",
                    gap:           8,
                  }}
                >
                  <span
                    style={{
                      width:      18,
                      height:     1,
                      background: C.cyan,
                      opacity:    0.6,
                      display:    "inline-block",
                    }}
                  />
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month:   "long",
                    day:     "numeric",
                    year:    "numeric",
                  })}
                </div>

                <div
                  style={{
                    display:     "flex",
                    alignItems:  "flex-end",
                    justifyContent: "space-between",
                    flexWrap:    "wrap",
                    gap:         14,
                  }}
                >
                  <div>
                    <h1
                      style={{
                        fontFamily:    "'Oxanium', sans-serif",
                        fontWeight:    800,
                        fontSize:      "clamp(24px, 3.5vw, 36px)",
                        color:         C.w90,
                        letterSpacing: "-0.5px",
                        margin:        0,
                        lineHeight:    1.1,
                      }}
                    >
                      Your Dashboard
                    </h1>
                    <p
                      style={{
                        fontFamily: "'Raleway', sans-serif",
                        fontSize:   15,
                        color:      C.w50,
                        margin:     "6px 0 0",
                        fontWeight: 300,
                      }}
                    >
                      You're on a{" "}
                      <span style={{ color: C.gold, fontWeight: 600 }}>23-day streak</span>
                      . Today's focus: Neural Networks — Module 7.
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      style={{
                        padding:      "10px 20px",
                        borderRadius: 100,
                        border:       `1px solid ${C.w15}`,
                        background:   C.w04,
                        color:        C.w70,
                        cursor:       "pointer",
                        fontFamily:   "'Oxanium', sans-serif",
                        fontSize:     13,
                        fontWeight:   600,
                        letterSpacing: "0.5px",
                        transition:   "all 0.2s",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = C.w08
                        e.currentTarget.style.color      = C.w90
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = C.w04
                        e.currentTarget.style.color      = C.w70
                      }}
                    >
                      📅 Schedule
                    </button>
                    <button
                      style={{
                        padding:      "10px 20px",
                        borderRadius: 100,
                        border:       "1px solid rgba(0,212,255,0.35)",
                        background:   "linear-gradient(135deg,#1a96ff,#00d4ff)",
                        color:        "#020810",
                        cursor:       "pointer",
                        fontFamily:   "'Oxanium', sans-serif",
                        fontSize:     13,
                        fontWeight:   700,
                        letterSpacing: "0.5px",
                        boxShadow:    "0 0 24px rgba(0,150,255,0.4)",
                        transition:   "all 0.25s",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = "translateY(-2px)"
                        e.currentTarget.style.boxShadow = "0 0 36px rgba(0,200,255,0.55)"
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = "none"
                        e.currentTarget.style.boxShadow = "0 0 24px rgba(0,150,255,0.4)"
                      }}
                    >
                      ◉ Open AI Tutor
                    </button>
                  </div>
                </div>
              </div>

              {/* ── AI Insight banner ── */}
              <Card
                accent={C.blue}
                noHover
                style={{ padding: "22px 26px", marginBottom: 22, animation: D(0.06) }}
              >
                <div
                  style={{
                    display:     "flex",
                    alignItems:  "flex-start",
                    gap:         18,
                    flexWrap:    "wrap",
                  }}
                >
                  <div
                    style={{
                      width:        48,
                      height:       48,
                      borderRadius: 14,
                      flexShrink:   0,
                      background:   "linear-gradient(135deg,rgba(26,150,255,0.2),rgba(0,212,255,0.2))",
                      border:       "1px solid rgba(0,212,255,0.3)",
                      display:      "flex",
                      alignItems:   "center",
                      justifyContent: "center",
                      fontSize:     22,
                      animation:    "lu-orb-breathe 4s ease-in-out infinite",
                    }}
                  >◉</div>

                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div
                      style={{
                        display:    "flex",
                        alignItems: "center",
                        gap:        10,
                        marginBottom: 9,
                        flexWrap:   "wrap",
                      }}
                    >
                      {/* Chip: AI Insight */}
                      <span
                        style={{
                          display:     "inline-flex",
                          alignItems:  "center",
                          gap:         5,
                          padding:     "3px 12px",
                          borderRadius: 100,
                          background:  "rgba(0,212,255,0.1)",
                          border:      "1px solid rgba(0,212,255,0.25)",
                          fontFamily:  "'Share Tech Mono', monospace",
                          fontSize:    11,
                          color:       C.cyan,
                          letterSpacing: "0.5px",
                          textTransform: "uppercase",
                        }}
                      >
                        <span
                          style={{
                            width:        5,
                            height:       5,
                            borderRadius: "50%",
                            background:   C.cyan,
                          }}
                        />
                        AI Insight
                      </span>
                      {/* Chip: Active */}
                      <span
                        style={{
                          display:     "inline-flex",
                          alignItems:  "center",
                          gap:         5,
                          fontFamily:  "'Share Tech Mono', monospace",
                          fontSize:    11,
                          color:       C.green,
                          letterSpacing: "0.3px",
                          textTransform: "uppercase",
                        }}
                      >
                        <span
                          style={{
                            width:        5,
                            height:       5,
                            borderRadius: "50%",
                            background:   C.green,
                            animation:    "lu-pulse 2s ease-in-out infinite",
                          }}
                        />
                        Active now
                      </span>
                    </div>

                    <div
                      style={{
                        fontFamily:  "'Oxanium', sans-serif",
                        fontWeight:  700,
                        fontSize:    19,
                        color:       C.w90,
                        marginBottom: 8,
                        lineHeight:  1.3,
                      }}
                    >
                      Alex, you're in the top{" "}
                      <span style={{ color: C.cyan }}>8%</span> of your batch this week 🎯
                    </div>
                    <div
                      style={{
                        fontFamily: "'Raleway', sans-serif",
                        fontSize:   14,
                        color:      C.w50,
                        lineHeight: 1.75,
                        fontWeight: 300,
                        maxWidth:   640,
                      }}
                    >
                      You're strongest in Mathematics (92%) and Coding (89%). I've spotted a gap in
                      gradient descent — I've built a 20-minute visual session tailored to how you
                      learn. Ready to start?
                    </div>
                    <div
                      style={{
                        display:   "flex",
                        gap:       10,
                        marginTop: 16,
                        flexWrap:  "wrap",
                      }}
                    >
                      <button
                        style={{
                          padding:      "9px 18px",
                          borderRadius: 100,
                          border:       "none",
                          cursor:       "pointer",
                          background:   "linear-gradient(135deg,#1a96ff,#00d4ff)",
                          color:        "#020810",
                          fontFamily:   "'Oxanium', sans-serif",
                          fontSize:     13,
                          fontWeight:   700,
                          letterSpacing: "0.5px",
                          boxShadow:    "0 0 20px rgba(0,150,255,0.35)",
                          transition:   "all 0.2s",
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = "translateY(-2px)"
                          e.currentTarget.style.boxShadow = "0 0 32px rgba(0,200,255,0.5)"
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = "none"
                          e.currentTarget.style.boxShadow = "0 0 20px rgba(0,150,255,0.35)"
                        }}
                      >
                        ◉ Start Focus Session
                      </button>
                      <button
                        style={{
                          padding:      "9px 18px",
                          borderRadius: 100,
                          cursor:       "pointer",
                          background:   C.w04,
                          border:       `1px solid ${C.w15}`,
                          color:        C.w70,
                          fontFamily:   "'Oxanium', sans-serif",
                          fontSize:     13,
                          fontWeight:   600,
                          letterSpacing: "0.5px",
                          transition:   "all 0.2s",
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = C.w08
                          e.currentTarget.style.color      = C.w90
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = C.w04
                          e.currentTarget.style.color      = C.w70
                        }}
                      >
                        View Full Analysis →
                      </button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* ── Stat cards ── */}
              <div
                style={{
                  display:             "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
                  gap:                 16,
                  marginBottom:        22,
                  animation:           D(0.1),
                }}
              >
                <StatCard icon="⚡" value="2,847" label="XP Points"      change="+380 this week"  color={C.cyan}   positive />
                <StatCard icon="🔥" value="23"    label="Day Streak"     change="Personal best"    color={C.gold}   positive />
                <StatCard icon="📘" value="7"     label="Active Courses" change="2 enrolled"       color={C.blue}   positive />
                <StatCard icon="🏆" value="94%"   label="Average Score"  change="-2% vs last week" color={C.green}  positive={false} />
              </div>

              {/* ── Main 3-column grid ── */}
              <div
                style={{
                  display:             "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
                  gap:                 18,
                  marginBottom:        18,
                }}
              >
                {/* My Courses */}
                <Card accent={C.blue} style={{ padding: "22px", animation: D(0.14) }}>
                  <div
                    style={{
                      display:       "flex",
                      alignItems:    "center",
                      justifyContent: "space-between",
                      marginBottom:  20,
                    }}
                  >
                    <h2
                      style={{
                        fontFamily:    "'Oxanium', sans-serif",
                        fontWeight:    700,
                        fontSize:      17,
                        color:         C.w90,
                        letterSpacing: "0.3px",
                        margin:        0,
                      }}
                    >
                      My Courses
                    </h2>
                    <a
                      href="/student/courses"
                      style={{
                        fontFamily:    "'Share Tech Mono', monospace",
                        fontSize:      11,
                        color:         C.blue,
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                        textDecoration: "none",
                        transition:    "color 0.2s",
                      }}
                    >
                      See all →
                    </a>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
  {courses.length === 0 ? (
    <div style={{ color: C.w40 }}>No courses available</div>
  ) : (
    courses.map((c, i) => (
      <div
        key={i}
        style={{ cursor: "pointer", transition: "opacity 0.2s" }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              flexShrink: 0,
              background: `${c.color}12`,
              border: `1px solid ${c.color}25`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            {c.icon}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "'Raleway', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                color: C.w90,
                marginBottom: 2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {c.name}
            </div>

            <div
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 10,
                color: c.color,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              {c.cat}
            </div>
          </div>

          <span
            style={{
              fontFamily: "'Oxanium', sans-serif",
              fontWeight: 700,
              fontSize: 15,
              color: c.color,
              flexShrink: 0,
            }}
          >
            {c.pct}%
          </span>
        </div>

        <ProgressBar pct={c.pct} color={c.color} height={5} />
      </div>
    ))
  )}
</div>
                </Card>

                {/* Today's Classes */}
                <Card accent={C.cyan} style={{ padding: "22px", animation: D(0.17) }}>
                  <div
                    style={{
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "space-between",
                      marginBottom:   20,
                    }}
                  >
                    <h2
                      style={{
                        fontFamily:    "'Oxanium', sans-serif",
                        fontWeight:    700,
                        fontSize:      17,
                        color:         C.w90,
                        letterSpacing: "0.3px",
                        margin:        0,
                      }}
                    >
                      Today's Classes
                    </h2>
                    <span
                      style={{
                        display:      "inline-flex",
                        alignItems:   "center",
                        gap:          5,
                        padding:      "3px 10px",
                        borderRadius: 100,
                        background:   "rgba(0,229,160,0.1)",
                        border:       "1px solid rgba(0,229,160,0.22)",
                        fontFamily:   "'Share Tech Mono', monospace",
                        fontSize:     11,
                        color:        C.green,
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                      }}
                    >
                      <span
                        style={{
                          width:        5,
                          height:       5,
                          borderRadius: "50%",
                          background:   C.green,
                        }}
                      />
                      1 Live
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {schedule.map((s, i) => (
                      <div
                        key={i}
                        style={{
                          display:     "flex",
                          alignItems:  "center",
                          gap:         14,
                          padding:     "13px 15px",
                          borderRadius: 14,
                          cursor:       "pointer",
                          background:   s.live ? "rgba(0,229,160,0.06)" : C.w04,
                          border:       `1px solid ${s.live ? "rgba(0,229,160,0.2)" : "rgba(255,255,255,0.07)"}`,
                          transition:   "all 0.2s",
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = s.live
                            ? "rgba(0,229,160,0.1)"
                            : "rgba(255,255,255,0.06)"
                          e.currentTarget.style.transform = "translateX(4px)"
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = s.live
                            ? "rgba(0,229,160,0.06)"
                            : C.w04
                          e.currentTarget.style.transform = "none"
                        }}
                      >
                        <span style={{ fontSize: 20, flexShrink: 0 }}>{s.icon}</span>
                        <div
                          style={{
                            minWidth:  44,
                            flexShrink: 0,
                            fontFamily: "'Share Tech Mono', monospace",
                            fontSize:   13,
                            color:      s.live ? C.green : C.w40,
                            textAlign:  "center",
                          }}
                        >
                          {s.time}
                        </div>
                        <div
                          style={{
                            width:     2,
                            height:    32,
                            borderRadius: 1,
                            flexShrink: 0,
                            background: s.live ? C.green : C.w15,
                            boxShadow:  s.live ? `0 0 8px ${C.green}` : "none",
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontFamily:   "'Raleway', sans-serif",
                              fontSize:     14,
                              fontWeight:   600,
                              color:        C.w90,
                              marginBottom: 2,
                              whiteSpace:   "nowrap",
                              overflow:     "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {s.title}
                          </div>
                          <div
                            style={{
                              fontFamily: "'Raleway', sans-serif",
                              fontSize:   12,
                              color:      C.w40,
                            }}
                          >
                            {s.trainer}
                          </div>
                        </div>
                        <span
                          style={{
                            padding:       "4px 10px",
                            borderRadius:  100,
                            flexShrink:    0,
                            fontFamily:    "'Share Tech Mono', monospace",
                            fontSize:      11,
                            letterSpacing: "0.5px",
                            background:    s.live ? "rgba(0,229,160,0.12)" : C.w04,
                            border:        `1px solid ${s.live ? "rgba(0,229,160,0.28)" : C.w15}`,
                            color:         s.live ? C.green : C.w30,
                          }}
                        >
                          {s.live ? "Live" : "Later"}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Day completion bar */}
                  <div
                    style={{
                      marginTop:   16,
                      padding:     "14px 16px",
                      borderRadius: 14,
                      background:  "rgba(0,212,255,0.05)",
                      border:      "1px solid rgba(0,212,255,0.12)",
                    }}
                  >
                    <div
                      style={{
                        display:        "flex",
                        justifyContent: "space-between",
                        alignItems:     "center",
                        marginBottom:   9,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Raleway', sans-serif",
                          fontSize:   13,
                          color:      C.w50,
                        }}
                      >
                        Classes completed today
                      </span>
                      <span
                        style={{
                          fontFamily: "'Oxanium', sans-serif",
                          fontWeight: 700,
                          fontSize:   16,
                          color:      C.cyan,
                        }}
                      >
                        1 / 3
                      </span>
                    </div>
                    <ProgressBar pct={33} color={C.cyan} height={5} />
                  </div>
                </Card>

                {/* Skill Progress */}
                <Card accent={C.gold} style={{ padding: "22px", animation: D(0.2) }}>
                  <div
                    style={{
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "space-between",
                      marginBottom:   20,
                    }}
                  >
                    <h2
                      style={{
                        fontFamily:    "'Oxanium', sans-serif",
                        fontWeight:    700,
                        fontSize:      17,
                        color:         C.w90,
                        letterSpacing: "0.3px",
                        margin:        0,
                      }}
                    >
                      Skill Progress
                    </h2>
                    <a
                      href="/student/progress"
                      style={{
                        fontFamily:    "'Share Tech Mono', monospace",
                        fontSize:      11,
                        color:         C.blue,
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                        textDecoration: "none",
                      }}
                    >
                      Details →
                    </a>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
  {schedule.length === 0 ? (
    <div style={{ color: C.w40 }}>No sessions today</div>
  ) : (
    schedule.map((s, i) => (
      <div
        key={i}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "13px 15px",
          borderRadius: 14,
          cursor: "pointer",
          background: s.live ? "rgba(0,229,160,0.06)" : C.w04,
          border: `1px solid ${
            s.live ? "rgba(0,229,160,0.2)" : "rgba(255,255,255,0.07)"
          }`,
          transition: "all 0.2s",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = s.live
            ? "rgba(0,229,160,0.1)"
            : "rgba(255,255,255,0.06)"
          e.currentTarget.style.transform = "translateX(4px)"
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = s.live
            ? "rgba(0,229,160,0.06)"
            : C.w04
          e.currentTarget.style.transform = "none"
        }}
      >
        {/* Icon */}
        <span style={{ fontSize: 20, flexShrink: 0 }}>{s.icon}</span>

        {/* Time */}
        <div
          style={{
            minWidth: 44,
            flexShrink: 0,
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 13,
            color: s.live ? C.green : C.w40,
            textAlign: "center",
          }}
        >
          {s.time}
        </div>

        {/* Divider */}
        <div
          style={{
            width: 2,
            height: 32,
            borderRadius: 1,
            flexShrink: 0,
            background: s.live ? C.green : C.w15,
            boxShadow: s.live ? `0 0 8px ${C.green}` : "none",
          }}
        />

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'Raleway', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: C.w90,
              marginBottom: 2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {s.title}
          </div>

          <div
            style={{
              fontFamily: "'Raleway', sans-serif",
              fontSize: 12,
              color: C.w40,
            }}
          >
            {s.trainer}
          </div>
        </div>

        {/* Badge */}
        <span
          style={{
            padding: "4px 10px",
            borderRadius: 100,
            flexShrink: 0,
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.5px",
            background: s.live
              ? "rgba(0,229,160,0.12)"
              : C.w04,
            border: `1px solid ${
              s.live ? "rgba(0,229,160,0.28)" : C.w15
            }`,
            color: s.live ? C.green : C.w30,
          }}
        >
          {s.live ? "Live" : "Later"}
        </span>
      </div>
    ))
  )}
</div>
                </Card>
              </div>

              {/* ── Bottom grid ── */}
              <div
                style={{
                  display:             "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
                  gap:                 18,
                }}
              >
                {/* Attendance */}
                <Card accent={C.gold} style={{ padding: "22px", animation: D(0.23) }}>
                  <div
                    style={{
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "space-between",
                      marginBottom:   20,
                    }}
                  >
                    <h2
                      style={{
                        fontFamily:    "'Oxanium', sans-serif",
                        fontWeight:    700,
                        fontSize:      17,
                        color:         C.w90,
                        margin:        0,
                      }}
                    >
                      Attendance
                    </h2>
                    <span
                      style={{
                        padding:       "3px 12px",
                        borderRadius:  100,
                        background:    "rgba(255,185,0,0.1)",
                        border:        "1px solid rgba(255,185,0,0.25)",
                        fontFamily:    "'Share Tech Mono', monospace",
                        fontSize:      11,
                        color:         C.gold,
                        letterSpacing: "0.5px",
                      }}
                    >
                      86%
                    </span>
                  </div>

                  <div
                    style={{
                      display:     "flex",
                      gap:         8,
                      alignItems:  "flex-end",
                      height:      80,
                      marginBottom: 18,
                    }}
                  >
                    {attendance.map((a, i) => (
                      <AttBar key={i} day={a.day} value={a.value} delay={250 + i * 60} />
                    ))}
                  </div>

                  <div
                    style={{
                      display:             "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap:                 10,
                    }}
                  >
                    {[
                      { label: "Present Rate",    value: "86%",      color: C.cyan   },
                      { label: "Current Streak",  value: "14 days",  color: C.gold   },
                      { label: "Sessions",        value: "24 / 28",  color: C.green  },
                      { label: "Study Hours",     value: "142 hrs",  color: C.purple },
                    ].map((s, i) => (
                      <div
                        key={i}
                        style={{
                          padding:      "12px 14px",
                          borderRadius: 12,
                          background:   `${s.color}08`,
                          border:       `1px solid ${s.color}18`,
                        }}
                      >
                        <div
                          style={{
                            fontFamily:   "'Raleway', sans-serif",
                            fontSize:     12,
                            color:        C.w40,
                            marginBottom: 5,
                          }}
                        >
                          {s.label}
                        </div>
                        <div
                          style={{
                            fontFamily: "'Oxanium', sans-serif",
                            fontWeight: 700,
                            fontSize:   18,
                            color:      s.color,
                          }}
                        >
                          {s.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Leaderboard */}
                <Card accent={C.cyan} style={{ padding: "22px", animation: D(0.26) }}>
                  <div
                    style={{
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "space-between",
                      marginBottom:   20,
                    }}
                  >
                    <h2
                      style={{
                        fontFamily:    "'Oxanium', sans-serif",
                        fontWeight:    700,
                        fontSize:      17,
                        color:         C.w90,
                        margin:        0,
                      }}
                    >
                      Leaderboard
                    </h2>
                    <a
                      href="/student/leaderboard"
                      style={{
                        fontFamily:    "'Share Tech Mono', monospace",
                        fontSize:      11,
                        color:         C.blue,
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                        textDecoration: "none",
                      }}
                    >
                      Full board →
                    </a>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {leaderboard.map((l, i) => (
                      <div
                        key={i}
                        style={{
                          display:      "flex",
                          alignItems:   "center",
                          gap:          14,
                          padding:      "12px 14px",
                          borderRadius: 12,
                          background:   l.you ? "rgba(0,200,255,0.08)" : C.w04,
                          border:       `1px solid ${l.you ? "rgba(0,200,255,0.22)" : "rgba(255,255,255,0.06)"}`,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'Oxanium', sans-serif",
                            fontWeight: 700,
                            fontSize:   16,
                            color:
                              i === 0 ? C.gold :
                              i === 1 ? "rgba(180,200,220,0.75)" :
                              l.you  ? C.cyan : C.w40,
                            width:  22,
                            textAlign: "center",
                            flexShrink: 0,
                          }}
                        >
                          {["①", "②", "③", "④"][i]}
                        </span>
                        <div
                          style={{
                            width:        34,
                            height:       34,
                            borderRadius: 9,
                            flexShrink:   0,
                            background:   l.you
                              ? "linear-gradient(135deg,#ffc933,#ffad00)"
                              : `linear-gradient(135deg,${C.blue}88,${C.cyan}55)`,
                            display:      "flex",
                            alignItems:   "center",
                            justifyContent: "center",
                            fontFamily:   "'Oxanium', sans-serif",
                            fontWeight:   700,
                            fontSize:     14,
                            color:        l.you ? "#020810" : C.w90,
                          }}
                        >
                          {l.name.charAt(0)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontFamily: "'Raleway', sans-serif",
                              fontSize:   14,
                              fontWeight: 600,
                              color:      l.you ? C.cyan : C.w80,
                            }}
                          >
                            {l.name}
                          </div>
                          {l.you && (
                            <div
                              style={{
                                fontFamily:    "'Share Tech Mono', monospace",
                                fontSize:      10,
                                color:         `${C.cyan}88`,
                                letterSpacing: "0.5px",
                                textTransform: "uppercase",
                              }}
                            >
                              Alex Kumar
                            </div>
                          )}
                        </div>
                        <span
                          style={{
                            fontFamily: "'Share Tech Mono', monospace",
                            fontSize:   14,
                            color:      l.you ? C.cyan : C.blue,
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        >
                          {l.score.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      display:        "flex",
                      justifyContent: "space-around",
                      marginTop:      20,
                    }}
                  >
                    <ArcRing pct={91} size={76} color={C.blue} value="91%"  label="Score"  />
                    <ArcRing pct={87} size={76} color={C.gold} value="23d"  label="Streak" />
                    <ArcRing pct={73} size={76} color={C.cyan} value="#3"   label="Rank"   />
                  </div>
                </Card>

                {/* Upcoming */}
                <Card accent={C.purple} style={{ padding: "22px", animation: D(0.29) }}>
                  <h2
                    style={{
                      fontFamily:    "'Oxanium', sans-serif",
                      fontWeight:    700,
                      fontSize:      17,
                      color:         C.w90,
                      margin:        "0 0 20px",
                      letterSpacing: "0.3px",
                    }}
                  >
                    Upcoming
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { icon: "📝", title: "Neural Networks Assignment", due: "Due Friday",     dueColor: C.red,   badge: "2 days"   },
                      { icon: "🎥", title: "Live Quantum Class",          due: "Sat 10:00 AM",  dueColor: C.w40,   badge: ""         },
                      { icon: "🏆", title: "Monthly Hackathon",           due: "March 18",      dueColor: C.gold,  badge: "Register" },
                      { icon: "📊", title: "React Workshop Quiz",         due: "Next Monday",   dueColor: C.w40,   badge: ""         },
                    ].map((item, i) => (
                      <div
                        key={i}
                        style={{
                          display:      "flex",
                          alignItems:   "center",
                          gap:          14,
                          padding:      "13px 15px",
                          borderRadius: 13,
                          cursor:       "pointer",
                          background:   C.w04,
                          border:       `1px solid ${C.w08}`,
                          transition:   "all 0.2s",
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background   = "rgba(167,139,250,0.07)"
                          e.currentTarget.style.borderColor  = "rgba(167,139,250,0.2)"
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background   = C.w04
                          e.currentTarget.style.borderColor  = C.w08
                        }}
                      >
                        <div
                          style={{
                            width:        38,
                            height:       38,
                            borderRadius: 10,
                            flexShrink:   0,
                            background:   "rgba(167,139,250,0.1)",
                            border:       "1px solid rgba(167,139,250,0.2)",
                            display:      "flex",
                            alignItems:   "center",
                            justifyContent: "center",
                            fontSize:     18,
                          }}
                        >
                          {item.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontFamily:   "'Raleway', sans-serif",
                              fontSize:     14,
                              fontWeight:   600,
                              color:        C.w90,
                              marginBottom: 3,
                              whiteSpace:   "nowrap",
                              overflow:     "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {item.title}
                          </div>
                          <div
                            style={{
                              fontFamily: "'Raleway', sans-serif",
                              fontSize:   12,
                              color:      item.dueColor,
                            }}
                          >
                            {item.due}
                          </div>
                        </div>
                        {item.badge && (
                          <span
                            style={{
                              padding:       "3px 10px",
                              borderRadius:  100,
                              flexShrink:    0,
                              fontFamily:    "'Share Tech Mono', monospace",
                              fontSize:      11,
                              letterSpacing: "0.3px",
                              background:    item.dueColor === C.red
                                ? "rgba(255,77,106,0.1)"
                                : "rgba(255,185,0,0.1)",
                              border: `1px solid ${
                                item.dueColor === C.red
                                  ? "rgba(255,77,106,0.25)"
                                  : "rgba(255,185,0,0.25)"
                              }`,
                              color: item.dueColor === C.red ? C.red : C.gold,
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>

                {/* AI Tutor chat — spans 2 columns on wide screens */}
                <div
                  style={{
                    gridColumn: "span 2",
                    height:     440,
                    animation:  D(0.32),
                  }}
                  className="lu-ai-span"
                >
                  <div style={{ marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h2
                      style={{
                        fontFamily:    "'Oxanium', sans-serif",
                        fontWeight:    700,
                        fontSize:      17,
                        color:         C.w90,
                        margin:        0,
                      }}
                    >
                      AI Tutor Chat
                    </h2>
                    <a
                      href="/student/ai-tutor"
                      style={{
                        fontFamily:    "'Share Tech Mono', monospace",
                        fontSize:      11,
                        color:         C.blue,
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                        textDecoration: "none",
                      }}
                    >
                      Open full chat →
                    </a>
                  </div>
                  <AITutorChat />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          GLOBAL STYLES  (fonts + animations used in this page only)
      ══════════════════════════════════════════════════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@300;400;500;600;700;800&family=Raleway:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap');

        *, *::before, *::after { box-sizing: border-box; }
        html, body { background: #020810; margin: 0; height: 100%; }
        input::placeholder { color: rgba(200,220,255,0.22); font-family: 'Raleway', sans-serif; }

        @keyframes lu-scan        { from{transform:translateY(-100vh)} to{transform:translateY(200vh)} }
        @keyframes lu-slide-up    { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes lu-orb-breathe {
          0%,100%{ box-shadow:0 0 12px rgba(0,150,255,0.45),0 0 30px rgba(0,150,255,0.18); }
          50%    { box-shadow:0 0 24px rgba(0,212,255,0.70),0 0 60px rgba(0,212,255,0.28); }
        }
        @keyframes lu-dot-bounce  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes lu-pulse       { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.15)} }

        ::-webkit-scrollbar       { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,150,255,0.2); border-radius: 4px; }

        /* AI chat card spans 2 cols on medium+, 1 on mobile */
        .lu-ai-span { grid-column: span 2; }
        @media (max-width: 680px) { .lu-ai-span { grid-column: span 1; } }
      `}</style>
    </>
  )
}

// Tiny helper referenced in JSX
declare module "react" { interface CSSProperties { [key: string]: any } }
const _extra = { w80: "rgba(255,255,255,0.8)" as const }
Object.assign(C, _extra)