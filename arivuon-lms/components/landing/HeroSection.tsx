// components/landing/HeroSection.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

/* ════════════════════════════════════════════════════════════
   ORBITAL RING CANVAS
════════════════════════════════════════════════════════════ */
function OrbitalCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!

    let W = (canvas.width  = canvas.offsetWidth)
    let H = (canvas.height = canvas.offsetHeight)
    let t = 0, raf: number

    const rings = [
      { r: 200, speed: 0.00028, r_: [0,  180, 255], op: 0.14, dots: 3 },
      { r: 300, speed: 0.00016, r_: [0,  212, 255], op: 0.09, dots: 5 },
      { r: 420, speed: 0.00010, r_: [26, 150, 255], op: 0.07, dots: 4 },
      { r: 540, speed: 0.00006, r_: [255,185,  0], op: 0.05, dots: 2 },
    ]

    function draw() {
      ctx.clearRect(0, 0, W, H)
      t++
      const cx = W / 2, cy = H / 2

      rings.forEach((ring, ri) => {
        const angle  = t * ring.speed * 1000
        const scaleY = 0.28 + ri * 0.04

        ctx.save()
        ctx.translate(cx, cy)
        ctx.scale(1, scaleY)

        // Dashed orbit ring
        ctx.beginPath()
        ctx.arc(0, 0, ring.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${ring.r_},${ring.op})`
        ctx.lineWidth   = 1
        ctx.setLineDash([3, 9])
        ctx.stroke()
        ctx.setLineDash([])

        // Orbiting dots with glow
        for (let d = 0; d < ring.dots; d++) {
          const a  = angle + (d / ring.dots) * Math.PI * 2
          const dx = ring.r * Math.cos(a)
          const dy = ring.r * Math.sin(a)

          // Glow halo
          const grd = ctx.createRadialGradient(dx, dy, 0, dx, dy, 7)
          grd.addColorStop(0, `rgba(${ring.r_},0.9)`)
          grd.addColorStop(1, `rgba(${ring.r_},0)`)
          ctx.beginPath(); ctx.arc(dx, dy, 7, 0, Math.PI * 2)
          ctx.fillStyle = grd; ctx.fill()

          // Core dot
          ctx.beginPath(); ctx.arc(dx, dy, 2.2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${ring.r_},1)`; ctx.fill()
        }

        ctx.restore()
      })

      raf = requestAnimationFrame(draw)
    }

    draw()

    const onResize = () => {
      W = canvas.width  = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
    }
    window.addEventListener("resize", onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize) }
  }, [])

  return (
    <canvas
      ref={ref}
      style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:0 }}
    />
  )
}

/* ════════════════════════════════════════════════════════════
   TYPEWRITER HOOK
════════════════════════════════════════════════════════════ */
function useTypewriter(text: string, speed = 38, startDelay = 0) {
  const [out, setOut] = useState("")
  useEffect(() => {
    let i = 0
    const delay = setTimeout(() => {
      const id = setInterval(() => {
        setOut(text.slice(0, i + 1))
        i++
        if (i >= text.length) clearInterval(id)
      }, speed)
      return () => clearInterval(id)
    }, startDelay)
    return () => clearTimeout(delay)
  }, [text, speed, startDelay])
  return out
}

/* ════════════════════════════════════════════════════════════
   PARTICLE BURST (button click)
════════════════════════════════════════════════════════════ */
function useBurst() {
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; vx: number; vy: number; color: string }[]
  >([])

  const trigger = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const cx   = e.clientX - rect.left
    const cy   = e.clientY - rect.top
    const cols = ["#00d4ff", "#1a96ff", "#ffc933", "#ffffff", "#00e5a0"]
    const pts  = Array.from({ length: 18 }, (_, i) => ({
      id: Date.now() + i, x: cx, y: cy,
      vx: (Math.random() - 0.5) * 130,
      vy: (Math.random() - 0.5) * 130,
      color: cols[i % cols.length],
    }))
    setParticles(pts)
    setTimeout(() => setParticles([]), 800)
  }
  return { particles, trigger }
}

/* ════════════════════════════════════════════════════════════
   STAT PILLS
════════════════════════════════════════════════════════════ */
const STATS = [
  { value: "48K+",  label: "Active Learners", color: "#00d4ff"  },
  { value: "2,400", label: "Courses",          color: "#1a96ff"  },
  { value: "98%",   label: "Completion Rate",  color: "#00e5a0"  },
  { value: "4.9★",  label: "Platform Rating",  color: "#ffc933"  },
]

function StatPill({ value, label, color, delay }: { value:string; label:string; color:string; delay:number }) {
  const [vis, setVis] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t) }, [delay])
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "12px 22px", borderRadius: 16, minWidth: 100,
      background: `${color}0a`, border: `1px solid ${color}22`,
      backdropFilter: "blur(20px)",
      position: "relative", overflow: "hidden",
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(18px)",
      transition: "all 0.6s cubic-bezier(0.22,1,0.36,1)",
    }}>
      {/* Top edge glow */}
      <div style={{
        position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
        background: `linear-gradient(90deg,transparent,${color}55,transparent)`,
      }}/>
      <span style={{
        fontFamily: "'Oxanium', sans-serif", fontSize: 22, fontWeight: 700,
        color, letterSpacing: "0.04em", lineHeight: 1,
        textShadow: `0 0 14px ${color}80`,
      }}>{value}</span>
      <span style={{
        fontFamily: "'Share Tech Mono', monospace", fontSize: 10,
        color: "rgba(200,220,255,0.38)", letterSpacing: "0.18em",
        marginTop: 4, textTransform: "uppercase",
      }}>{label}</span>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   FEATURE CHIPS
════════════════════════════════════════════════════════════ */
const FEATURES = [
  { icon: "◉", text: "AI Tutor",         color: "#00d4ff" },
  { icon: "▶", text: "Live Sessions",     color: "#1a96ff" },
  { icon: "◈", text: "Course Library",    color: "#ffc933" },
  { icon: "◎", text: "Progress Tracking", color: "#00e5a0" },
]

/* ════════════════════════════════════════════════════════════
   HERO SECTION
════════════════════════════════════════════════════════════ */
export default function HeroSection() {
  const router            = useRouter()
  const { particles, trigger } = useBurst()
  const tagline           = useTypewriter("INTELLIGENT LEARNING PLATFORM", 40, 800)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@300;400;500;600;700;800&family=Raleway:wght@300;400;500;600&family=Share+Tech+Mono&display=swap');

        @keyframes lu-holo-pan {
          0%   { background-position:0%   center; }
          100% { background-position:200% center; }
        }
        @keyframes lu-breathe {
          0%,100% { opacity:0.5; transform:scale(1);    }
          50%     { opacity:1;   transform:scale(1.06); }
        }
        @keyframes lu-scan-h {
          from { transform:translateY(-200px); }
          to   { transform:translateY(110vh);  }
        }
        @keyframes lu-particle-fly {
          0%   { transform:translate(0,0) scale(1);              opacity:1; }
          100% { transform:translate(var(--vx),var(--vy)) scale(0); opacity:0; }
        }
        @keyframes lu-scroll-bounce {
          0%,100% { transform:translateX(-50%) translateY(0px); }
          50%     { transform:translateX(-50%) translateY(8px);  }
        }
        @keyframes lu-slide-up {
          from { transform:translateY(28px); opacity:0; }
          to   { transform:translateY(0);    opacity:1; }
        }
        @keyframes lu-glow-pulse {
          0%,100% { box-shadow:0 0 25px rgba(0,150,255,0.35); }
          50%     { box-shadow:0 0 50px rgba(0,212,255,0.6);  }
        }
        @keyframes lu-notif-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>

      <section style={{
        position: "relative", minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "0 24px", overflow: "hidden",
      }}>

        {/* Orbital canvas */}
        <OrbitalCanvas />

        {/* Ambient nebula blobs */}
        <div style={{
          position:"absolute", top:"-20%", left:"50%", transform:"translateX(-50%)",
          width:880, height:880,
          background:"radial-gradient(circle,rgba(0,100,255,0.08) 0%,rgba(0,40,120,0.05) 45%,transparent 70%)",
          borderRadius:"50%", pointerEvents:"none", animation:"lu-breathe 9s ease-in-out infinite",
        }}/>
        <div style={{
          position:"absolute", bottom:"-8%", left:"18%",
          width:560, height:560,
          background:"radial-gradient(circle,rgba(0,80,200,0.07) 0%,transparent 70%)",
          borderRadius:"50%", pointerEvents:"none", animation:"lu-breathe 12s ease-in-out 2s infinite",
        }}/>
        <div style={{
          position:"absolute", bottom:"-5%", right:"12%",
          width:460, height:460,
          background:"radial-gradient(circle,rgba(255,185,0,0.04) 0%,transparent 70%)",
          borderRadius:"50%", pointerEvents:"none", animation:"lu-breathe 14s ease-in-out 4s infinite",
        }}/>

        {/* Scan line */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:1 }}>
          <div style={{
            position:"absolute", width:"100%", height:1,
            background:"linear-gradient(90deg,transparent,rgba(0,212,255,0.05),rgba(0,212,255,0.12),rgba(0,212,255,0.05),transparent)",
            animation:"lu-scan-h 15s linear infinite",
          }}/>
        </div>

        {/* ── Main content ── */}
        <div style={{ position:"relative", zIndex:10, maxWidth:860, width:"100%" }}>

          {/* Status badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 100, marginBottom: 34,
            background: "rgba(0,212,255,0.06)",
            border: "1px solid rgba(0,212,255,0.18)",
            opacity: ready ? 1 : 0,
            transform: ready ? "translateY(0)" : "translateY(14px)",
            transition: "all 0.6s ease",
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#00e5a0", boxShadow: "0 0 8px #00e5a0",
              display: "inline-block", animation: "lu-notif-blink 2s ease infinite",
            }}/>
            <span style={{
              fontFamily:"'Share Tech Mono',monospace", fontSize:11,
              color:"rgba(0,212,255,0.8)", letterSpacing:"0.28em",
            }}>SYSTEM ONLINE · AI TUTOR ACTIVE</span>
          </div>

          {/* ── WORDMARK ── */}
          <div style={{
            position:"relative", display:"inline-block", marginBottom:8,
            opacity: ready ? 1 : 0,
            transform: ready ? "translateY(0)" : "translateY(36px)",
            transition: "all 0.85s cubic-bezier(0.22,1,0.36,1) 0.12s",
          }}>
            <h1 style={{
              fontFamily:"'Oxanium',sans-serif",
              fontSize:"clamp(64px,13vw,140px)",
              fontWeight: 800,
              letterSpacing: "0.18em",
              lineHeight: 1,
              background: "linear-gradient(90deg,#1a96ff,#00d4ff,#ffffff,#ffc933,#1a96ff)",
              backgroundSize: "300% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "lu-holo-pan 7s linear infinite",
              margin: 0,
            }}>LUMINA</h1>
          </div>

          {/* ── Typewriter tagline ── */}
          <div style={{ height:30, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:22 }}>
            <p style={{
              fontFamily:"'Share Tech Mono',monospace",
              fontSize:"clamp(12px,2.2vw,17px)",
              color:"rgba(0,212,255,0.72)", letterSpacing:"0.32em",
            }}>
              {tagline}
              <span style={{
                opacity: tagline.length < TAGLINE_LEN ? 1 : 0,
                color:"#00d4ff", transition:"opacity 0.3s",
              }}>█</span>
            </p>
          </div>

          {/* ── Description ── */}
          <p style={{
            fontFamily:"'Raleway',sans-serif",
            fontSize:"clamp(14px,1.75vw,17px)",
            fontWeight: 300,
            color:"rgba(200,220,255,0.56)",
            lineHeight: 1.85,
            maxWidth: 620, margin:"0 auto 38px",
            letterSpacing:"0.02em",
            opacity: ready ? 1 : 0,
            transform: ready ? "translateY(0)" : "translateY(22px)",
            transition: "all 0.8s cubic-bezier(0.22,1,0.36,1) 0.45s",
          }}>
            A next-generation learning platform powered by{" "}
            <span style={{ color:"#00d4ff", fontWeight:600 }}>adaptive AI</span>,
            live instructor sessions and intelligent progress tracking
            — built for students, trainers and institutions.
          </p>

          {/* ── Feature chips ── */}
          <div style={{
            display:"flex", flexWrap:"wrap", justifyContent:"center",
            gap:10, marginBottom:40,
            opacity: ready ? 1 : 0,
            transition:"opacity 0.6s ease 0.65s",
          }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:7,
                padding:"6px 15px", borderRadius:100,
                background:`${f.color}0a`, border:`1px solid ${f.color}25`,
                cursor:"default", transition:"all 0.25s",
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `${f.color}16`
                  e.currentTarget.style.borderColor= `${f.color}50`
                  e.currentTarget.style.transform  = "translateY(-2px)"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = `${f.color}0a`
                  e.currentTarget.style.borderColor= `${f.color}25`
                  e.currentTarget.style.transform  = "translateY(0)"
                }}
              >
                <span style={{ fontSize:13 }}>{f.icon}</span>
                <span style={{
                  fontFamily:"'Raleway',sans-serif", fontSize:11, fontWeight:600,
                  color:f.color, letterSpacing:"0.1em", textTransform:"uppercase",
                }}>{f.text}</span>
              </div>
            ))}
          </div>

          {/* ── CTA Buttons ── */}
          <div style={{
            display:"flex", flexWrap:"wrap", justifyContent:"center", gap:14,
            opacity: ready ? 1 : 0,
            transform: ready ? "translateY(0)" : "translateY(22px)",
            transition: "all 0.75s cubic-bezier(0.22,1,0.36,1) 0.62s",
          }}>

            {/* Primary CTA */}
            <button
              onClick={e => { trigger(e); setTimeout(() => router.push("/auth/login"), 320) }}
              style={{
                position:"relative",
                padding:"15px 38px", borderRadius:14,
                background:"linear-gradient(135deg,#1a96ff,#00d4ff)",
                border:"1px solid rgba(0,212,255,0.45)",
                color:"#020810",
                fontFamily:"'Oxanium',sans-serif", fontSize:16, fontWeight:700,
                letterSpacing:"0.18em", textTransform:"uppercase",
                cursor:"pointer",
                boxShadow:"0 0 40px rgba(0,150,255,0.4), 0 12px 40px rgba(0,0,0,0.5)",
                transition:"all 0.3s cubic-bezier(0.22,1,0.36,1)",
                overflow:"visible",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform  = "translateY(-4px) scale(1.03)"
                e.currentTarget.style.boxShadow  = "0 0 60px rgba(0,200,255,0.6), 0 20px 50px rgba(0,0,0,0.5)"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0) scale(1)"
                e.currentTarget.style.boxShadow = "0 0 40px rgba(0,150,255,0.4), 0 12px 40px rgba(0,0,0,0.5)"
              }}
            >
              {/* Shimmer sweep */}
              <div style={{
                position:"absolute", inset:0, borderRadius:14, pointerEvents:"none",
                background:"linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.14) 50%,transparent 60%)",
                backgroundSize:"200% 100%",
                animation:"lu-holo-pan 3s linear infinite",
              }}/>
              Get Started  →
              {/* Burst particles */}
              {particles.map(p => (
                <div key={p.id} style={{
                  position:"absolute", left:p.x, top:p.y,
                  width:5, height:5, borderRadius:"50%",
                  background:p.color, boxShadow:`0 0 6px ${p.color}`,
                  pointerEvents:"none",
                  // @ts-ignore
                  "--vx":`${p.vx}px`, "--vy":`${p.vy}px`,
                  animation:"lu-particle-fly 0.7s ease-out both",
                  transform:"translate(-50%,-50%)",
                }}/>
              ))}
            </button>

            {/* Secondary CTA */}
            <button
              onClick={() => router.push("/courses")}
              style={{
                padding:"15px 38px", borderRadius:14,
                background:"rgba(255,255,255,0.03)",
                border:"1px solid rgba(26,150,255,0.25)",
                color:"rgba(0,212,255,0.85)",
                fontFamily:"'Oxanium',sans-serif", fontSize:16, fontWeight:700,
                letterSpacing:"0.18em", textTransform:"uppercase",
                cursor:"pointer",
                backdropFilter:"blur(12px)",
                transition:"all 0.3s cubic-bezier(0.22,1,0.36,1)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background   = "rgba(0,212,255,0.1)"
                e.currentTarget.style.borderColor  = "rgba(0,212,255,0.5)"
                e.currentTarget.style.transform    = "translateY(-4px)"
                e.currentTarget.style.color        = "#00d4ff"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background   = "rgba(255,255,255,0.03)"
                e.currentTarget.style.borderColor  = "rgba(26,150,255,0.25)"
                e.currentTarget.style.transform    = "translateY(0)"
                e.currentTarget.style.color        = "rgba(0,212,255,0.85)"
              }}
            >
              Browse Courses
            </button>
          </div>

          {/* ── Stats row ── */}
          <div style={{
            display:"flex", flexWrap:"wrap", justifyContent:"center", gap:12, marginTop:56,
          }}>
            {STATS.map((s, i) => (
              <StatPill key={i} {...s} delay={850 + i * 110}/>
            ))}
          </div>
        </div>

        {/* ── Scroll indicator ── */}
        <div style={{
          position:"absolute", bottom:30, left:"50%",
          display:"flex", flexDirection:"column", alignItems:"center", gap:6,
          animation:"lu-scroll-bounce 2.5s ease-in-out infinite",
          cursor:"pointer", zIndex:10,
          opacity: ready ? 0.5 : 0,
          transition:"opacity 1s ease 1.2s",
        }}
          onClick={() => window.scrollBy({ top: window.innerHeight, behavior:"smooth" })}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "0.5")}
        >
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width:9, height:5,
                borderRight:`1.5px solid rgba(0,212,255,${0.28 + i * 0.24})`,
                borderBottom:`1.5px solid rgba(0,212,255,${0.28 + i * 0.24})`,
                transform:"rotate(45deg)",
              }}/>
            ))}
          </div>
          <span style={{
            fontFamily:"'Share Tech Mono',monospace", fontSize:9,
            color:"rgba(0,212,255,0.5)", letterSpacing:"0.3em", textTransform:"uppercase",
          }}>Scroll</span>
        </div>
      </section>
    </>
  )
}

const TAGLINE_LEN = "INTELLIGENT LEARNING PLATFORM".length