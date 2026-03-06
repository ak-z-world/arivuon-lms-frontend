"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { jwtDecode } from "jwt-decode"
import CosmosEngine from "@/components/background/CosmosEngine"

interface TokenPayload { role: string }

/* ══════════════════════════════════════════════════════════════
   WORMHOLE TUNNEL CANVAS
══════════════════════════════════════════════════════════════ */
function WormholeTunnel({ onComplete }: { onComplete: () => void }) {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const context = canvas.getContext("2d")
    if (!context) return
    const ctx = context
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const W = canvas.width, H = canvas.height
    let t = 0, raf: number, alive = true

    function draw() {
      if (!alive) return
      // Motion blur — partial clear
      ctx.fillStyle = "rgba(2,4,8,0.16)"
      ctx.fillRect(0, 0, W, H)
      t += 0.03

      // 64 rings converging to center
      for (let i = 0; i < 64; i++) {
        const z = ((t * 52 + i * 7) % 420)
        const scale = z / 420
        const radius = scale * Math.min(W, H) * 0.76
        const alpha = (1 - scale) * 0.9
        const hue = 188 + i * 3.4 + t * 24

        ctx.beginPath()
        ctx.arc(W / 2, H / 2, radius, 0, Math.PI * 2)
        ctx.strokeStyle = `hsla(${hue}, 100%, 65%, ${alpha})`
        ctx.lineWidth = (1 - scale) * 3
        ctx.stroke()

        // Radial spokes every 4th ring
        if (i % 4 === 0 && radius > 8) {
          const innerZ = ((t * 52 + (i + 4) * 7) % 420)
          const innerR = (innerZ / 420) * Math.min(W, H) * 0.76
          for (let j = 0; j < 8; j++) {
            const ang = (j / 8) * Math.PI * 2 + t * 0.38
            ctx.beginPath()
            ctx.moveTo(W / 2 + radius * Math.cos(ang), H / 2 + radius * Math.sin(ang))
            ctx.lineTo(W / 2 + innerR * Math.cos(ang), H / 2 + innerR * Math.sin(ang))
            ctx.strokeStyle = `hsla(${hue + 25}, 100%, 80%, ${alpha * 0.22})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }

      // Center portal burst
      const burst = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 95)
      burst.addColorStop(0, "rgba(0,220,255,0.95)")
      burst.addColorStop(0.3, "rgba(100,40,255,0.5)")
      burst.addColorStop(0.7, "rgba(0,212,255,0.12)")
      burst.addColorStop(1, "rgba(0,212,255,0)")
      ctx.fillStyle = burst
      ctx.beginPath(); ctx.arc(W / 2, H / 2, 95, 0, Math.PI * 2); ctx.fill()

      raf = requestAnimationFrame(draw)
    }

    draw()
    const timer = setTimeout(() => {
      alive = false
      cancelAnimationFrame(raf)
      // Fade out
      let op = 1
      const fade = () => {
        op -= 0.06
        if (canvas) canvas.style.opacity = String(Math.max(0, op))
        if (op > 0) requestAnimationFrame(fade)
        else onComplete()
      }
      requestAnimationFrame(fade)
    }, 2600)

    return () => { alive = false; cancelAnimationFrame(raf); clearTimeout(timer) }
  }, [onComplete])

  return <canvas ref={ref} className="fixed inset-0" style={{ zIndex: 60 }} />
}

/* ══════════════════════════════════════════════════════════════
   TYPEWRITER
══════════════════════════════════════════════════════════════ */
function Typewriter({ text, speed = 30, onDone }: { text: string; speed?: number; onDone?: () => void }) {
  const [out, setOut] = useState("")
  const [cur, setCur] = useState(true)

  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      setOut(text.slice(0, i + 1))
      i++
      if (i >= text.length) {
        clearInterval(id)
        onDone?.()
        // blink cursor after done
        const blink = setInterval(() => setCur(c => !c), 500)
        return () => clearInterval(blink)
      }
    }, speed)
    return () => clearInterval(id)
  }, [text, speed, onDone])

  return (
    <span style={{ fontFamily: "'VT323', monospace", letterSpacing: "0.12em" }}>
      {out}
      <span style={{ opacity: cur ? 1 : 0, color: "#00D4FF", transition: "opacity 0.1s" }}>█</span>
    </span>
  )
}

/* ══════════════════════════════════════════════════════════════
   SCAN LINE + NOISE OVERLAYS
══════════════════════════════════════════════════════════════ */
function Overlays() {
  return (
    <>
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 3 }}>
        <div style={{
          position: "absolute", width: "100%", height: 1,
          background: "linear-gradient(90deg,transparent,rgba(0,212,255,0.06),rgba(0,212,255,0.14),rgba(0,212,255,0.06),transparent)",
          animation: "scanH 14s linear infinite",
        }} />
      </div>
      <div className="fixed inset-0 pointer-events-none" style={{
        zIndex: 3, opacity: 0.02,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "110px 110px",
      }} />
    </>
  )
}

/* ══════════════════════════════════════════════════════════════
   MAIN LOGIN PAGE
══════════════════════════════════════════════════════════════ */
type Phase = "wormhole" | "typewriter" | "form"
type Role = "student" | "trainer" | "admin"

const ROLES: { id: Role; label: string; icon: string; color: string; glow: string }[] = [
  { id: "student", label: "Navigator", icon: "◎", color: "#00D4FF", glow: "rgba(0,212,255,0.4)" },
  { id: "trainer", label: "Commander", icon: "⬡", color: "#A78BFA", glow: "rgba(167,139,250,0.4)" },
  { id: "admin", label: "Overseer", icon: "◆", color: "#00FFCC", glow: "rgba(0,255,204,0.4)" },
]

export default function LoginPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>("wormhole")
  const [role, setRole] = useState<Role>("student")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [formIn, setFormIn] = useState(false)

  const handleWormholeDone = useCallback(() => setPhase("typewriter"), [])
  const handleTypeDone = useCallback(() => setTimeout(() => {
    setPhase("form")
    setTimeout(() => setFormIn(true), 80)
  }, 350), [])

  const rc = ROLES.find(r => r.id === role)!

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError("")
    try {
      const res = await axios.post("http://localhost:8000/auth/login", { email, password })
      const { access_token, refresh_token } = res.data
      localStorage.setItem("access_token", access_token)
      localStorage.setItem("refresh_token", refresh_token)
      const decoded = jwtDecode<TokenPayload>(access_token)
      const r = decoded.role
      if (r === "student") router.push("/student/dashboard")
      else if (r === "trainer") router.push("/trainer/dashboard")
      else if (r === "admin" || r === "super_admin") router.push("/admin/dashboard")
    } catch {
      setError("Invalid credentials — check your neural signature")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Persistent cosmos bg */}
      <CosmosEngine />
      <Overlays />

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Teko:wght@400;600;700&family=Exo+2:wght@300;400;500;600&family=VT323&family=Saira+Condensed:wght@100;400;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #020408; overflow-x: hidden; }
        input::placeholder { color: rgba(200,230,240,0.22); font-family: 'Exo 2', sans-serif; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px #060E1C inset !important; -webkit-text-fill-color: #E8F4FF !important; }

        @keyframes scanH {
          from { transform: translateY(-100vh); }
          to   { transform: translateY(200vh);  }
        }
        @keyframes holoPan {
          0%   { background-position: 0%   center; }
          100% { background-position: 200% center; }
        }
        @keyframes gravPulse {
          0%,100% { box-shadow: 0 0 30px rgba(0,212,255,0.22), 0 0 70px rgba(0,212,255,0.08); }
          50%     { box-shadow: 0 0 55px rgba(0,212,255,0.50), 0 0 120px rgba(0,212,255,0.18); }
        }
        @keyframes orbSpin  { to { transform: rotate(360deg);  } }
        @keyframes orbSpinR { to { transform: rotate(-360deg); } }
        @keyframes ringPulse {
          0%   { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(2.8); opacity: 0;   }
        }
        @keyframes slideUp {
          from { transform: translateY(28px); opacity: 0; }
          to   { transform: translateY(0px);  opacity: 1; }
        }
        @keyframes warpIn {
          0%   { transform: scaleX(0.04) scaleY(0.3); opacity: 0; filter: blur(18px); }
          55%  { transform: scaleX(1.04) scaleY(1.03); opacity: 1; filter: blur(0px); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bootBlink { 0%,100%{opacity:0.5} 50%{opacity:1} }
      `}</style>

      {/* ── Phase: wormhole ── */}
      {phase === "wormhole" && (
        <>
          <WormholeTunnel onComplete={handleWormholeDone} />
          <div className="fixed inset-0 flex items-end justify-center pb-12" style={{ zIndex: 65 }}>
            <p style={{
              fontFamily: "'VT323', monospace", fontSize: 13, color: "rgba(0,212,255,0.55)",
              letterSpacing: "0.4em", animation: "bootBlink 1.8s ease infinite"
            }}>
              INITIALIZING ARIVUON UNIVERSE PORTAL…
            </p>
          </div>
        </>
      )}

      {/* ── Phase: typewriter + form ── */}
      {(phase === "typewriter" || phase === "form") && (
        <div
          className="fixed inset-0 flex flex-col items-center px-4"
          style={{
            overflowY: "auto",
            justifyContent: "flex-start",
            paddingTop: "min(10vh,80px)",
            paddingBottom: "60px",
          }}
        >

          {/* ── Brand block ── */}
          <div style={{
            textAlign: "center", marginBottom: 36,
            animation: "slideUp 0.7s cubic-bezier(0.23,1,0.32,1) both"
          }}>

            {/* Logo orb */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
              <div style={{ position: "relative", width: 72, height: 72 }}>
                {/* Outer orbital ring */}
                <div style={{
                  position: "absolute", inset: -8, borderRadius: "50%",
                  border: "1px solid rgba(0,212,255,0.18)",
                  animation: "orbSpin 10s linear infinite",
                }} />
                {/* Inner ring */}
                <div style={{
                  position: "absolute", inset: -3, borderRadius: "50%",
                  border: "1px dashed rgba(0,212,255,0.12)",
                  animation: "orbSpinR 6s linear infinite",
                }} />
                {/* Core orb */}
                <div style={{
                  width: 72, height: 72, borderRadius: 20,
                  background: "linear-gradient(135deg,rgba(0,212,255,0.16),rgba(123,47,255,0.2))",
                  border: "1px solid rgba(0,212,255,0.35)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 30, color: "#00D4FF",
                  boxShadow: "0 0 0 1px rgba(0,212,255,0.08)",
                  animation: "gravPulse 3.5s ease-in-out infinite",
                }}>⬡</div>
              </div>
            </div>

            {/* Wordmark */}
            {/* <h1 style={{
              fontFamily: "'Teko', sans-serif", fontSize: 68, fontWeight: 700,
              letterSpacing: "0.25em", lineHeight: 1,
              background: "linear-gradient(90deg,#00D4FF,#A78BFA,#00FFCC,#00D4FF)",
              backgroundSize: "300% auto",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              animation: "holoPan 7s linear infinite",
            }}>ARIVUON</h1>

            <p style={{
              fontFamily: "'Saira Condensed', sans-serif", fontWeight: 100,
              fontSize: 13, color: "rgba(200,230,240,0.45)",
              letterSpacing: "0.5em", marginTop: 4, textTransform: "uppercase",
            }}>The Universe Portal</p> */}

            {/* Typewriter line
            <div style={{ minHeight: 24, marginTop: 14 }}>
              {phase === "typewriter" && (
                <p style={{ fontSize: 13, color: "rgba(0,212,255,0.7)", letterSpacing: "0.08em" }}>
                  <Typewriter text="NEURAL PATHWAYS ACTIVE — COSMOS SYNCHRONIZED" onDone={handleTypeDone} />
                </p>
              )}

            </div> */}
          </div>

          {/* ── Login card ── */}
          {phase === "form" && (
            <div
              style={{
                width: "100%",
                maxWidth: "min(440px, 92vw)",

                background: "rgba(5,12,24,0.9)",
                border: `1px solid ${rc.color}1a`,
                borderRadius: 26,

                backdropFilter: "blur(48px) saturate(1.6)",

                padding: "clamp(20px, 4vw, 34px) clamp(18px, 4vw, 34px) clamp(18px, 3vw, 28px)",

                boxShadow: `0 0 0 1px ${rc.color}08,
                0 32px 90px rgba(0,0,0,0.72),
                0 0 80px ${rc.color}08`,

                position: "relative",
                overflow: "hidden",

                margin: "0 auto",

                animation: formIn
                  ? "warpIn 0.45s cubic-bezier(0.23,1,0.32,1) both"
                  : "none",

                transition: "border-color 0.5s ease, box-shadow 0.5s ease",
              }}
            >

              {/* Animated top glow edge */}
              <div style={{
                position: "absolute", top: 0, left: "8%", right: "8%", height: 1,
                background: `linear-gradient(90deg,transparent,${rc.color}80,transparent)`,
                transition: "background 0.5s ease",
              }} />

              {/* Corner accent brackets */}
              {([
                { top: 0, left: 0, br: "22px 0 0 0", bt: "1px solid", bl: "1px solid", bb: "none", br2: "none" },
                { top: 0, right: 0, br: "0 22px 0 0", bt: "1px solid", bl: "none", bb: "none", br2: "1px solid" },
                { bottom: 0, left: 0, br: "0 0 0 22px", bt: "none", bl: "1px solid", bb: "1px solid", br2: "none" },
                { bottom: 0, right: 0, br: "0 0 22px 0", bt: "none", bl: "none", bb: "1px solid", br2: "1px solid" },
              ] as any[]).map((c, i) => (
                <div key={i} style={{
                  position: "absolute", width: 22, height: 22,
                  top: c.top, bottom: c.bottom, left: c.left, right: c.right,
                  borderRadius: c.br, borderColor: `${rc.color}55`,
                  borderTop: c.bt, borderLeft: c.bl, borderBottom: c.bb, borderRight: c.br2,
                  transition: "border-color 0.5s ease",
                }} />
              ))}

              {/* Card heading */}
              <div style={{ textAlign: "center", marginBottom: 26 }}>
                <h2 style={{
                  fontFamily: "'Teko', sans-serif", fontSize: 28, fontWeight: 600,
                  letterSpacing: "0.2em", color: rc.color,
                  textShadow: `0 0 24px ${rc.color}70`,
                  transition: "color 0.5s ease, text-shadow 0.5s ease",
                }}>ENTER THE COSMOS</h2>
                <p style={{
                  fontFamily: "'VT323', monospace", fontSize: 13,
                  color: "rgba(200,230,240,0.28)", letterSpacing: "0.28em", marginTop: 2,
                }}>AUTHENTICATE NEURAL SIGNATURE</p>
              </div>

              <form onSubmit={login} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Role selector */}
                <div>
                  <p style={{
                    fontFamily: "'VT323',monospace", fontSize: 12, color: "rgba(200,230,240,0.35)",
                    letterSpacing: "0.22em", marginBottom: 9, textTransform: "uppercase"
                  }}>
                    Select Role
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))",
                      gap: 8,
                    }}
                  >
                    {ROLES.map(r => (
                      <button key={r.id} type="button" onClick={() => setRole(r.id)}
                        style={{
                          flex: 1, padding: "10px 0", borderRadius: 13,
                          border: `1px solid ${role === r.id ? r.color + "55" : "rgba(255,255,255,0.07)"}`,
                          background: role === r.id ? `${r.color}14` : "rgba(255,255,255,0.03)",
                          color: role === r.id ? r.color : "rgba(200,230,240,0.28)",
                          fontFamily: "'Exo 2', sans-serif", fontSize: 11, fontWeight: 600,
                          letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer",
                          transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                          boxShadow: role === r.id ? `0 0 18px ${r.color}22` : "none",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        }}>
                        <span style={{ fontSize: 13 }}>{r.icon}</span>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email */}
                <InputField
                  label="Email Address"
                  type="email"
                  placeholder="navigator@arivuon.io"
                  value={email}
                  onChange={setEmail}
                  accent={rc.color}

                />

                {/* Password */}
                <div>
                  <p style={{
                    fontFamily: "'VT323',monospace", fontSize: 12, color: "rgba(200,230,240,0.35)",
                    letterSpacing: "0.22em", marginBottom: 9, textTransform: "uppercase"
                  }}>
                    Password
                  </p>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPass ? "text" : "password"}
                      required
                      value={password}
                      placeholder="••••••••••"
                      onChange={e => setPassword(e.target.value)}
                      style={{
                        width: "100%", padding: "13px 44px 13px 16px", borderRadius: 13,
                        background: "rgba(0,212,255,0.04)",
                        border: "1px solid rgba(0,212,255,0.14)",
                        color: "#E8F4FF", fontSize: 14,
                        fontFamily: "'Exo 2', sans-serif",
                        outline: "none", transition: "border-color 0.25s",
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = rc.color + "55"}
                      onBlur={e => e.currentTarget.style.borderColor = "rgba(0,212,255,0.14)"}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      style={{
                        position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer",
                        color: "rgba(200,230,240,0.35)", fontSize: 15, padding: 2
                      }}>
                      {showPass ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div style={{
                    padding: "10px 14px", borderRadius: 11,
                    background: "rgba(255,0,110,0.09)", border: "1px solid rgba(255,0,110,0.25)",
                    color: "#FF6B9D", fontSize: 12, fontFamily: "'Exo 2', sans-serif",
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <span>⚠</span> {error}
                  </div>
                )}

                {/* Submit button */}
                <button type="submit" disabled={loading}
                  style={{
                    marginTop: 4, width: "100%", padding: "15px 0", borderRadius: 15,
                    background: loading
                      ? "rgba(255,255,255,0.05)"
                      : `linear-gradient(135deg,${rc.color}dd,${rc.color}88)`,
                    border: `1px solid ${rc.color}44`,
                    color: loading ? "rgba(200,230,240,0.35)" : "#020408",
                    fontFamily: "'Teko', sans-serif", fontSize: 20, fontWeight: 600,
                    letterSpacing: "0.22em", cursor: loading ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: loading ? "none" : `0 0 36px ${rc.glow}, 0 10px 40px rgba(0,0,0,0.5)`,
                    position: "relative", overflow: "hidden",
                  }}>
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                      <span style={{ animation: "spin 0.9s linear infinite", display: "inline-block" }}>◌</span>
                      WARPING IN…
                    </span>
                  ) : `ENTER THE UNIVERSE  →`}
                </button>

                {/* Footer links */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                  <FooterLink href="/forgot-password" label="FORGOT PASSWORD?" accent={rc.color} />
                  <FooterLink href="/register" label="NEW NAVIGATOR?" accent={rc.color} />
                </div>
              </form>
            </div>
          )}

          {/* Copyright */}
          {phase === "form" && (
            <p style={{
              marginTop: 28, fontFamily: "'VT323', monospace", fontSize: 12,
              color: "rgba(200,230,240,0.15)", letterSpacing: "0.3em",
              animation: "fadeIn 1.2s ease 0.6s both",
            }}>
              ARIVUON UNIVERSE PORTAL © 2026 — NEURAL OS v3.2
            </p>
          )}
        </div>
      )}
    </>
  )
}

/* ── Small helpers ── */
function InputField({ label, type, placeholder, value, onChange, accent }:
  { label: string; type: string; placeholder: string; value: string; onChange: (v: string) => void; accent: string }) {
  return (
    <div>
      <p style={{
        fontFamily: "'VT323',monospace", fontSize: 12, color: "rgba(200,230,240,0.35)",
        letterSpacing: "0.22em", marginBottom: 9, textTransform: "uppercase"
      }}>
        {label}
      </p>
      <input
        type={type} required value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{
          width: "100%", padding: "13px 16px", borderRadius: 13,
          background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.14)",
          color: "#E8F4FF", fontSize: 14, fontFamily: "'Exo 2', sans-serif",
          outline: "none", transition: "border-color 0.25s",
        }}
        onFocus={e => e.currentTarget.style.borderColor = accent + "55"}
        onBlur={e => e.currentTarget.style.borderColor = "rgba(0,212,255,0.14)"}
      />
    </div>
  )
}

function FooterLink({ href, label, accent }: { href: string; label: string; accent: string }) {
  const [hov, setHov] = useState(false)
  return (
    <a href={href} style={{
      fontFamily: "'VT323',monospace", fontSize: 12,
      color: hov ? accent : "rgba(200,230,240,0.25)",
      letterSpacing: "0.15em", textDecoration: "none", transition: "color 0.2s",
    }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {label}
    </a>
  )
}