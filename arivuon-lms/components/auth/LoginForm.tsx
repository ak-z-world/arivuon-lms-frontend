// components/auth/LoginForm.tsx
"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { jwtDecode } from "jwt-decode"
import LuminaBackground from "@/components/background/LuminaBackground"

interface TokenPayload {
  sub: string
  role: string
}

/* ════════════════════════════════════════════════════════════
   PORTAL ENTRY ANIMATION (replaces WormholeTunnel)
   A luminous iris / aperture opening effect
════════════════════════════════════════════════════════════ */
function PortalEntry({ onComplete }: { onComplete: () => void }) {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
    const W = canvas.width, H = canvas.height
    let t = 0, raf: number, alive = true

    function draw() {
      if (!alive) return
      // Motion blur partial clear
      ctx.fillStyle = "rgba(2,8,16,0.18)"
      ctx.fillRect(0, 0, W, H)
      t += 0.025

      const cx = W / 2, cy = H / 2

      // 56 convergent rings — blue → cyan → white
      for (let i = 0; i < 56; i++) {
        const z      = ((t * 48 + i * 7.5) % 400)
        const scale  = z / 400
        const radius = scale * Math.min(W, H) * 0.74
        const alpha  = (1 - scale) * 0.88
        // Colour sweeps from navy → blue → cyan → white
        const hue    = 210 + scale * 25          // 210° (blue) → 185° (cyan)
        const sat    = 95 - scale * 10
        const lght   = 52 + scale * 38           // darkish → bright

        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.strokeStyle = `hsla(${hue},${sat}%,${lght}%,${alpha})`
        ctx.lineWidth   = (1 - scale) * 2.8
        ctx.stroke()

        // Radial spokes on every 5th ring
        if (i % 5 === 0 && radius > 10) {
          const innerZ = ((t * 48 + (i + 5) * 7.5) % 400)
          const innerR = (innerZ / 400) * Math.min(W, H) * 0.74
          for (let j = 0; j < 6; j++) {
            const ang = (j / 6) * Math.PI * 2 + t * 0.32
            ctx.beginPath()
            ctx.moveTo(cx + radius * Math.cos(ang), cy + radius * Math.sin(ang))
            ctx.lineTo(cx + innerR * Math.cos(ang), cy + innerR * Math.sin(ang))
            ctx.strokeStyle = `rgba(0,180,255,${alpha * 0.18})`
            ctx.lineWidth   = 0.5
            ctx.stroke()
          }
        }
      }

      // Central portal burst — blue core
      const burst = ctx.createRadialGradient(cx, cy, 0, cx, cy, 100)
      burst.addColorStop(0,   "rgba(0,212,255,0.92)")
      burst.addColorStop(0.25,"rgba(0,120,255,0.55)")
      burst.addColorStop(0.65,"rgba(0,80,200,0.14)")
      burst.addColorStop(1,   "rgba(0,80,200,0)")
      ctx.fillStyle = burst
      ctx.beginPath(); ctx.arc(cx, cy, 100, 0, Math.PI * 2); ctx.fill()

      // Gold ring flash at center
      if (Math.sin(t * 2) > 0.7) {
        ctx.beginPath(); ctx.arc(cx, cy, 14 + Math.abs(Math.sin(t * 4)) * 12, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255,185,0,${(Math.sin(t * 2) - 0.7) * 2})`
        ctx.lineWidth = 1.5; ctx.stroke()
      }

      raf = requestAnimationFrame(draw)
    }

    draw()

    const timer = setTimeout(() => {
      alive = false
      cancelAnimationFrame(raf)
      // Fade out canvas
      let op = 1
      const fade = () => {
        op -= 0.055
        if (canvas) canvas.style.opacity = String(Math.max(0, op))
        if (op > 0) requestAnimationFrame(fade)
        else onComplete()
      }
      requestAnimationFrame(fade)
    }, 2400)

    return () => { alive = false; cancelAnimationFrame(raf); clearTimeout(timer) }
  }, [onComplete])

  return (
    <canvas
      ref={ref}
      style={{ position:"fixed", inset:0, zIndex:60 }}
    />
  )
}

/* ════════════════════════════════════════════════════════════
   TYPEWRITER
════════════════════════════════════════════════════════════ */
function Typewriter({ text, speed = 30, onDone }: { text:string; speed?:number; onDone?:()=>void }) {
  const [out, setOut] = useState("")
  const [cur, setCur] = useState(true)

  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      setOut(text.slice(0, i + 1)); i++
      if (i >= text.length) {
        clearInterval(id); onDone?.()
        const blink = setInterval(() => setCur(c => !c), 520)
        return () => clearInterval(blink)
      }
    }, speed)
    return () => clearInterval(id)
  }, [text, speed, onDone])

  return (
    <span style={{ fontFamily:"'Share Tech Mono',monospace", letterSpacing:"0.1em" }}>
      {out}
      <span style={{ opacity:cur ? 1 : 0, color:"#00d4ff", transition:"opacity 0.1s" }}>█</span>
    </span>
  )
}

/* ════════════════════════════════════════════════════════════
   SCAN LINE OVERLAY
════════════════════════════════════════════════════════════ */
function ScanOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex:4 }}>
      <div style={{
        position:"absolute", width:"100%", height:1,
        background:"linear-gradient(90deg,transparent,rgba(0,212,255,0.06),rgba(0,212,255,0.13),rgba(0,212,255,0.06),transparent)",
        animation:"lu-scan-v 15s linear infinite",
      }}/>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   ROLE CONFIG — plain, instantly understandable labels
════════════════════════════════════════════════════════════ */
type Phase = "portal" | "intro" | "form"
type Role  = "student" | "trainer" | "admin"

const ROLES: {
  id:    Role
  label: string
  desc:  string
  icon:  string
  color: string
  glow:  string
}[] = [
  { id:"student", label:"Student",  desc:"Learn & grow",    icon:"◎", color:"#1a96ff", glow:"rgba(26,150,255,0.4)"  },
  { id:"trainer", label:"Trainer",  desc:"Teach & guide",   icon:"△", color:"#00d4ff", glow:"rgba(0,212,255,0.4)"   },
  { id:"admin",   label:"Admin",    desc:"Manage platform", icon:"⊞", color:"#ffc933", glow:"rgba(255,185,0,0.4)"   },
]

/* ════════════════════════════════════════════════════════════
   MAIN LOGIN COMPONENT
════════════════════════════════════════════════════════════ */
export default function LoginForm() {
  const router   = useRouter()
  const [phase,    setPhase]    = useState<Phase>("portal")
  const [role,     setRole]     = useState<Role>("student")
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState("")
  const [showPass, setShowPass] = useState(false)
  const [formIn,   setFormIn]   = useState(false)

  const handlePortalDone = useCallback(() => setPhase("intro"), [])
  const handleIntroDone  = useCallback(() => {
    setTimeout(() => { setPhase("form"); setTimeout(() => setFormIn(true), 80) }, 320)
  }, [])

  const rc = ROLES.find(r => r.id === role)!

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError("")
    try {
      const res = await axios.post("http://localhost:8000/auth/login", { email, password })
      const { access_token, refresh_token } = res.data
      localStorage.setItem("access_token",  access_token)
      localStorage.setItem("refresh_token", refresh_token)
      const decoded = jwtDecode<TokenPayload>(access_token)
      const r       = decoded.role
      if (r === "student")                         router.push("/student/dashboard")
      else if (r === "trainer")                    router.push("/trainer/dashboard")
      else if (r === "admin" || r === "super_admin") router.push("/admin/dashboard")
    } catch {
      setError("Invalid email or password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Persistent background */}
      <LuminaBackground />
      <ScanOverlay />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@300;400;500;600;700;800&family=Raleway:wght@300;400;500;600&family=Share+Tech+Mono&display=swap');

        *, *::before, *::after { box-sizing:border-box; }
        html, body { height:100%; background:#020810; overflow-x:hidden; }
        input::placeholder { color:rgba(200,220,255,0.2); font-family:'Raleway',sans-serif; }
        input:-webkit-autofill {
          -webkit-box-shadow:0 0 0 100px #050d1e inset !important;
          -webkit-text-fill-color:#e8f4ff !important;
        }

        @keyframes lu-scan-v    { from{transform:translateY(-100vh)} to{transform:translateY(200vh)} }
        @keyframes lu-holo-pan  { 0%{background-position:0% center} 100%{background-position:200% center} }
        @keyframes lu-gem-pulse {
          0%,100%{ box-shadow:0 0 18px rgba(0,150,255,0.35),0 0 50px rgba(0,150,255,0.12); }
          50%    { box-shadow:0 0 38px rgba(0,212,255,0.65),0 0 90px rgba(0,212,255,0.22); }
        }
        @keyframes lu-orb-spin  { to{transform:rotate(360deg)}  }
        @keyframes lu-orb-spinr { to{transform:rotate(-360deg)} }
        @keyframes lu-warp-in {
          0%  { transform:scaleX(0.06) scaleY(0.4); opacity:0; filter:blur(16px); }
          55% { transform:scaleX(1.03) scaleY(1.02); opacity:1; filter:blur(0);   }
          100%{ transform:scale(1); opacity:1; }
        }
        @keyframes lu-slide-up  { from{transform:translateY(26px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes lu-fade-in   { from{opacity:0} to{opacity:1} }
        @keyframes lu-spin      { to{transform:rotate(360deg)} }
        @keyframes lu-ring-pulse{ 0%{transform:scale(0.5);opacity:0.9} 100%{transform:scale(2.8);opacity:0} }
        @keyframes lu-notif     { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes lu-boot-blink{ 0%,100%{opacity:0.4} 50%{opacity:1} }
      `}</style>

      {/* ── Phase: portal animation ── */}
      {phase === "portal" && (
        <>
          <PortalEntry onComplete={handlePortalDone}/>
          <div style={{
            position:"fixed", inset:0, zIndex:65,
            display:"flex", alignItems:"flex-end", justifyContent:"center", paddingBottom:48,
          }}>
            <p style={{
              fontFamily:"'Share Tech Mono',monospace", fontSize:12,
              color:"rgba(0,212,255,0.5)", letterSpacing:"0.4em",
              textTransform:"uppercase", animation:"lu-boot-blink 1.8s ease infinite",
            }}>Initializing Lumina Learning Platform…</p>
          </div>
        </>
      )}

      {/* ── Phase: intro + form ── */}
      {(phase === "intro" || phase === "form") && (
        <div style={{
          position:"fixed", inset:0,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"flex-start",
          overflowY:"auto", padding:"min(9vh,72px) 20px 60px",
          zIndex:10,
        }}>

          {/* ── Brand block ── */}
          <div style={{
            textAlign:"center", marginBottom:36,
            animation:"lu-slide-up 0.7s cubic-bezier(0.22,1,0.36,1) both",
          }}>
            {/* Logo gem with orbital rings */}
            <div style={{ display:"flex", justifyContent:"center", marginBottom:18 }}>
              <div style={{ position:"relative", width:72, height:72 }}>
                <div style={{
                  position:"absolute", inset:-9, borderRadius:"50%",
                  border:"1px solid rgba(26,150,255,0.18)",
                  animation:"lu-orb-spin 12s linear infinite",
                }}/>
                <div style={{
                  position:"absolute", inset:-3, borderRadius:"50%",
                  border:"1px dashed rgba(0,212,255,0.12)",
                  animation:"lu-orb-spinr 7s linear infinite",
                }}/>
                <div style={{
                  width:72, height:72, borderRadius:20,
                  background:"linear-gradient(135deg,rgba(26,150,255,0.14),rgba(0,212,255,0.18))",
                  border:"1px solid rgba(0,212,255,0.3)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:30, color:"#00d4ff",
                  animation:"lu-gem-pulse 3.5s ease-in-out infinite",
                }}>◈</div>
              </div>
            </div>

            {/* Wordmark */}
            <h1 style={{
              fontFamily:"'Oxanium',sans-serif", fontSize:64, fontWeight:800,
              letterSpacing:"0.22em", lineHeight:1,
              background:"linear-gradient(90deg,#1a96ff,#00d4ff,#ffffff,#ffc933,#1a96ff)",
              backgroundSize:"300% auto",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
              animation:"lu-holo-pan 7s linear infinite",
              margin:0,
            }}>LUMINA</h1>

            <p style={{
              fontFamily:"'Share Tech Mono',monospace", fontWeight:400,
              fontSize:11, color:"rgba(200,220,255,0.38)",
              letterSpacing:"0.5em", marginTop:6, textTransform:"uppercase",
            }}>
              {phase === "intro"
                ? <Typewriter text="Intelligent Learning Platform" speed={28} onDone={handleIntroDone}/>
                : "Intelligent Learning Platform"
              }
            </p>
          </div>

          {/* ── Login card ── */}
          {phase === "form" && (
            <div style={{
              width:"100%", maxWidth:"min(430px,92vw)",
              background:"rgba(5,12,26,0.92)",
              border:`1px solid ${rc.color}20`,
              borderRadius:24,
              backdropFilter:"blur(48px) saturate(1.6)",
              padding:"clamp(20px,4vw,32px) clamp(18px,4vw,32px) clamp(18px,3vw,26px)",
              boxShadow:`0 0 0 1px ${rc.color}0a, 0 32px 90px rgba(0,0,0,0.75), 0 0 80px ${rc.color}0a`,
              position:"relative", margin:"0 auto",
              animation: formIn ? "lu-warp-in 0.44s cubic-bezier(0.22,1,0.36,1) both" : "none",
              transition:"border-color 0.5s, box-shadow 0.5s",
            }}>

              {/* Top glow edge */}
              <div style={{
                position:"absolute", top:0, left:"6%", right:"6%", height:1,
                background:`linear-gradient(90deg,transparent,${rc.color}70,transparent)`,
                transition:"background 0.5s",
              }}/>

              {/* Corner brackets */}
              {([
                { top:0,    left:0,   bt:"1px solid", bl:"1px solid", bb:"none",       br:"none",       br2:"22px 0 0 0" },
                { top:0,    right:0,  bt:"1px solid", bl:"none",       bb:"none",       br:"1px solid",  br2:"0 22px 0 0" },
                { bottom:0, left:0,   bt:"none",       bl:"1px solid", bb:"1px solid",  br:"none",       br2:"0 0 0 22px" },
                { bottom:0, right:0,  bt:"none",       bl:"none",       bb:"1px solid",  br:"1px solid",  br2:"0 0 22px 0" },
              ] as any[]).map((c, i) => (
                <div key={i} style={{
                  position:"absolute", width:20, height:20,
                  top:c.top, bottom:c.bottom, left:c.left, right:c.right,
                  borderRadius:c.br2, borderColor:`${rc.color}45`,
                  borderTop:c.bt, borderLeft:c.bl, borderBottom:c.bb, borderRight:c.br,
                  transition:"border-color 0.5s",
                }}/>
              ))}

              {/* Card heading */}
              <div style={{ textAlign:"center", marginBottom:24 }}>
                <h2 style={{
                  fontFamily:"'Oxanium',sans-serif", fontSize:24, fontWeight:700,
                  letterSpacing:"0.18em", textTransform:"uppercase",
                  color:rc.color, textShadow:`0 0 22px ${rc.color}60`,
                  transition:"color 0.5s, text-shadow 0.5s",
                }}>Sign In</h2>
                <p style={{
                  fontFamily:"'Share Tech Mono',monospace", fontSize:10,
                  color:"rgba(200,220,255,0.28)", letterSpacing:"0.25em", marginTop:3,
                  textTransform:"uppercase",
                }}>Enter your credentials to continue</p>
              </div>

              <form onSubmit={login} style={{ display:"flex", flexDirection:"column", gap:14 }}>

                {/* ── Role selector ── */}
                <div>
                  <label style={{
                    fontFamily:"'Share Tech Mono',monospace", fontSize:9,
                    color:"rgba(200,220,255,0.32)", letterSpacing:"1.8px",
                    textTransform:"uppercase", display:"block", marginBottom:8,
                  }}>
                    I am a
                  </label>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:7 }}>
                    {ROLES.map(r => (
                      <button key={r.id} type="button" onClick={() => setRole(r.id)} style={{
                        padding:"10px 0", borderRadius:12,
                        border:`1px solid ${role === r.id ? r.color + "55" : "rgba(255,255,255,0.07)"}`,
                        background: role === r.id ? `${r.color}12` : "rgba(255,255,255,0.03)",
                        color: role === r.id ? r.color : "rgba(200,220,255,0.3)",
                        cursor:"pointer", transition:"all 0.25s",
                        boxShadow: role === r.id ? `0 0 16px ${r.color}20` : "none",
                        display:"flex", flexDirection:"column",
                        alignItems:"center", justifyContent:"center", gap:4,
                      }}>
                        <span style={{ fontSize:16 }}>{r.icon}</span>
                        <span style={{
                          fontFamily:"'Oxanium',sans-serif", fontSize:11, fontWeight:600,
                          letterSpacing:"0.1em", textTransform:"uppercase",
                        }}>{r.label}</span>
                        <span style={{
                          fontFamily:"'Raleway',sans-serif", fontSize:9,
                          color: role === r.id ? `${r.color}90` : "rgba(200,220,255,0.2)",
                          fontWeight:300,
                        }}>{r.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Email ── */}
                <LField
                  label="Email Address"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={setEmail}
                  accent={rc.color}
                />

                {/* ── Password ── */}
                <div>
                  <label style={{
                    fontFamily:"'Share Tech Mono',monospace", fontSize:9,
                    color:"rgba(200,220,255,0.32)", letterSpacing:"1.8px",
                    textTransform:"uppercase", display:"block", marginBottom:8,
                  }}>Password</label>
                  <div style={{ position:"relative" }}>
                    <input
                      type={showPass ? "text" : "password"}
                      required
                      value={password}
                      placeholder="••••••••••"
                      onChange={e => setPassword(e.target.value)}
                      style={{
                        width:"100%", padding:"13px 44px 13px 16px",
                        borderRadius:12,
                        background:"rgba(26,150,255,0.04)",
                        border:"1px solid rgba(26,150,255,0.14)",
                        color:"#e8f4ff", fontSize:14,
                        fontFamily:"'Raleway',sans-serif",
                        outline:"none", transition:"border-color 0.25s",
                      }}
                      onFocus={e  => e.currentTarget.style.borderColor = rc.color + "55"}
                      onBlur={e   => e.currentTarget.style.borderColor = "rgba(26,150,255,0.14)"}
                    />
                    <button type="button" onClick={() => setShowPass(s => !s)} style={{
                      position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                      background:"none", border:"none", cursor:"pointer",
                      color:"rgba(200,220,255,0.35)", fontSize:14, padding:2,
                    }}>{showPass ? "🙈" : "👁"}</button>
                  </div>
                </div>

                {/* Forgot password */}
                <div style={{ textAlign:"right", marginTop:-6 }}>
                  <a href="/forgot-password" style={{
                    fontFamily:"'Share Tech Mono',monospace", fontSize:10,
                    color:"rgba(200,220,255,0.25)", letterSpacing:"0.15em",
                    textDecoration:"none", textTransform:"uppercase",
                    transition:"color 0.2s",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.color = rc.color)}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(200,220,255,0.25)")}
                  >Forgot password?</a>
                </div>

                {/* Error */}
                {error && (
                  <div style={{
                    padding:"10px 14px", borderRadius:10,
                    background:"rgba(255,77,106,0.08)", border:"1px solid rgba(255,77,106,0.22)",
                    color:"#ff8096", fontSize:12,
                    fontFamily:"'Raleway',sans-serif",
                    display:"flex", alignItems:"center", gap:8,
                  }}>
                    <span>⚠</span>{error}
                  </div>
                )}

                {/* ── Submit ── */}
                <button type="submit" disabled={loading} style={{
                  marginTop:4, width:"100%", padding:"15px 0",
                  borderRadius:13,
                  background: loading
                    ? "rgba(255,255,255,0.05)"
                    : `linear-gradient(135deg,${rc.color}e0,${rc.color}90)`,
                  border:`1px solid ${rc.color}44`,
                  color: loading ? "rgba(200,220,255,0.35)" : "#020810",
                  fontFamily:"'Oxanium',sans-serif", fontSize:17, fontWeight:700,
                  letterSpacing:"0.2em", textTransform:"uppercase",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition:"all 0.3s",
                  boxShadow: loading ? "none" : `0 0 32px ${rc.glow}, 0 10px 40px rgba(0,0,0,0.5)`,
                  position:"relative", overflow:"hidden",
                }}>
                  {loading ? (
                    <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                      <span style={{ animation:"lu-spin 0.9s linear infinite", display:"inline-block" }}>◌</span>
                      Signing in…
                    </span>
                  ) : "Sign In  →"}
                </button>

                {/* Register link */}
                <p style={{
                  textAlign:"center", marginTop:4,
                  fontFamily:"'Share Tech Mono',monospace", fontSize:10,
                  color:"rgba(200,220,255,0.22)", letterSpacing:"0.18em", textTransform:"uppercase",
                }}>
                  New here?{" "}
                  <a href="/register" style={{
                    color:"rgba(200,220,255,0.22)", transition:"color 0.2s", textDecoration:"none",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.color = rc.color)}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(200,220,255,0.22)")}
                  >Create an account</a>
                </p>
              </form>
            </div>
          )}

          {/* Footer */}
          {phase === "form" && (
            <p style={{
              marginTop:28,
              fontFamily:"'Share Tech Mono',monospace", fontSize:10,
              color:"rgba(200,220,255,0.12)", letterSpacing:"0.28em", textTransform:"uppercase",
              animation:"lu-fade-in 1.2s ease 0.6s both",
            }}>
              Lumina Learning Platform © 2026
            </p>
          )}
        </div>
      )}
    </>
  )
}

/* ── Small field helper ── */
function LField({ label, type, placeholder, value, onChange, accent }:
  { label:string; type:string; placeholder:string; value:string; onChange:(v:string)=>void; accent:string }) {
  return (
    <div>
      <label style={{
        fontFamily:"'Share Tech Mono',monospace", fontSize:9,
        color:"rgba(200,220,255,0.32)", letterSpacing:"1.8px",
        textTransform:"uppercase", display:"block", marginBottom:8,
      }}>{label}</label>
      <input
        type={type} required value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{
          width:"100%", padding:"13px 16px", borderRadius:12,
          background:"rgba(26,150,255,0.04)",
          border:"1px solid rgba(26,150,255,0.14)",
          color:"#e8f4ff", fontSize:14,
          fontFamily:"'Raleway',sans-serif",
          outline:"none", transition:"border-color 0.25s",
        }}
        onFocus={e  => e.currentTarget.style.borderColor = accent + "55"}
        onBlur={e   => e.currentTarget.style.borderColor = "rgba(26,150,255,0.14)"}
      />
    </div>
  )
}