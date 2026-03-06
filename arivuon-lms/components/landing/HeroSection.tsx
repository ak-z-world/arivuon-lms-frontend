"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

/* ══════════════════════════════════════════════════════════════
   ORBITAL RING CANVAS — floating rings behind the title
══════════════════════════════════════════════════════════════ */
function OrbitalCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const context = canvas.getContext("2d")
    if (!context) return
    const ctx = context

    let W = (canvas.width = canvas.offsetWidth)
    let H = (canvas.height = canvas.offsetHeight)
    let t = 0, raf: number

    const rings = [
      { r: 220, speed: 0.00030, color: [0, 212, 255], op: 0.12, dots: 3 },
      { r: 330, speed: 0.00018, color: [123, 47, 255], op: 0.08, dots: 5 },
      { r: 440, speed: 0.00012, color: [0, 255, 200], op: 0.06, dots: 4 },
      { r: 560, speed: 0.00008, color: [255, 0, 110], op: 0.04, dots: 2 },
    ]

    function draw() {
      ctx.clearRect(0, 0, W, H)
      t++
      const cx = W / 2, cy = H / 2

      rings.forEach((ring, ri) => {
        const angle = t * ring.speed * 1000

        // Elliptical orbit (perspective tilt)
        const scaleY = 0.30 + ri * 0.04
        ctx.save()
        ctx.translate(cx, cy)
        ctx.scale(1, scaleY)

        // Ring arc
        ctx.beginPath()
        ctx.arc(0, 0, ring.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${ring.color}, ${ring.op})`
        ctx.lineWidth = 1
        ctx.setLineDash([4, 8])
        ctx.stroke()
        ctx.setLineDash([])

        // Orbiting dots
        for (let d = 0; d < ring.dots; d++) {
          const a = angle + (d / ring.dots) * Math.PI * 2
          const dx = ring.r * Math.cos(a)
          const dy = ring.r * Math.sin(a)

          // Glow
          const grd = ctx.createRadialGradient(dx, dy, 0, dx, dy, 6)
          grd.addColorStop(0, `rgba(${ring.color}, 0.9)`)
          grd.addColorStop(1, `rgba(${ring.color}, 0)`)
          ctx.beginPath()
          ctx.arc(dx, dy, 6, 0, Math.PI * 2)
          ctx.fillStyle = grd
          ctx.fill()

          // Core dot
          ctx.beginPath()
          ctx.arc(dx, dy, 2.2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${ring.color}, 1)`
          ctx.fill()
        }

        ctx.restore()
      })

      raf = requestAnimationFrame(draw)
    }

    draw()

    const onResize = () => {
      W = canvas.width = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
    }
    window.addEventListener("resize", onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize) }
  }, [])

  return (
    <canvas
      ref={ref}
      style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 0,
      }}
    />
  )
}

/* ══════════════════════════════════════════════════════════════
   TYPEWRITER HOOK
══════════════════════════════════════════════════════════════ */
function useTypewriter(text: string, speed = 35, startDelay = 0) {
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

/* ══════════════════════════════════════════════════════════════
   PARTICLE BURST on button click
══════════════════════════════════════════════════════════════ */
function useBurst() {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; vx: number; vy: number; color: string }[]>([])
  const trigger = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top
    const colors = ["#00D4FF", "#00FFCC", "#7B2FFF", "#FFD700", "#FF006E"]
    const pts = Array.from({ length: 16 }, (_, i) => ({
      id: Date.now() + i,
      x: cx, y: cy,
      vx: (Math.random() - 0.5) * 120,
      vy: (Math.random() - 0.5) * 120,
      color: colors[i % colors.length],
    }))
    setParticles(pts)
    setTimeout(() => setParticles([]), 800)
  }
  return { particles, trigger }
}

/* ══════════════════════════════════════════════════════════════
   STATS TICKER
══════════════════════════════════════════════════════════════ */
const STATS = [
  { value: "48K+", label: "Navigators", color: "#00D4FF" },
  { value: "2.4K+", label: "Courses", color: "#A78BFA" },
  { value: "98%", label: "Orbit Rate", color: "#00FFCC" },
  { value: "4.9★", label: "Cosmos Score", color: "#FFD700" },
]

function StatPill({ value, label, color, delay }: { value: string; label: string; color: string; delay: number }) {
  const [vis, setVis] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t) }, [delay])
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "12px 22px",
      background: `${color}08`,
      border: `1px solid ${color}22`,
      borderRadius: 16,
      backdropFilter: "blur(24px)",
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(16px)",
      transition: "all 0.6s cubic-bezier(0.23,1,0.32,1)",
      minWidth: 90,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* top edge glow */}
      <div style={{
        position: "absolute", top: 0, left: "15%", right: "15%", height: 1,
        background: `linear-gradient(90deg,transparent,${color}60,transparent)`,
      }} />
      <span style={{
        fontFamily: "'Teko',sans-serif", fontSize: 22, fontWeight: 700,
        color, letterSpacing: "0.06em", lineHeight: 1,
        textShadow: `0 0 14px ${color}88`,
      }}>{value}</span>
      <span style={{
        fontFamily: "'VT323',monospace", fontSize: 11,
        color: "rgba(200,230,240,0.40)", letterSpacing: "0.2em", marginTop: 3,
        textTransform: "uppercase",
      }}>{label}</span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   FEATURE CHIPS
══════════════════════════════════════════════════════════════ */
const FEATURES = [
  { icon: "◉", text: "ARIA AI Tutor", color: "#FF6B9D" },
  { icon: "⚡", text: "Live Sessions", color: "#00D4FF" },
  { icon: "🪐", text: "Course Worlds", color: "#A78BFA" },
  { icon: "🌌", text: "Real-time Analytics", color: "#00FFCC" },
]

/* ══════════════════════════════════════════════════════════════
   HERO SECTION
══════════════════════════════════════════════════════════════ */
export default function HeroSection() {
  const router = useRouter()
  const { particles, trigger } = useBurst()
  const subtitle = useTypewriter("THE UNIVERSE OF LEARNING", 42, 900)
  const [ready, setReady] = useState(false)

  useEffect(() => { const t = setTimeout(() => setReady(true), 100); return () => clearTimeout(t) }, [])

  return (
    <>
      {/* ── Google Fonts (only needed if not in root layout) ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Teko:wght@400;600;700&family=Exo+2:wght@300;400;500;600&family=VT323&family=Saira+Condensed:wght@100;400;700&display=swap');

        @keyframes holoPan {
          0%   { background-position: 0%   center; }
          100% { background-position: 200% center; }
        }
        @keyframes orbSpin  { to { transform: rotate(360deg);  } }
        @keyframes orbSpinR { to { transform: rotate(-360deg); } }
        @keyframes breathe {
          0%,100% { opacity:0.5; transform:scale(1);    }
          50%     { opacity:1;   transform:scale(1.06); }
        }
        @keyframes ringPulse {
          0%   { transform:scale(0.5); opacity:1; }
          100% { transform:scale(3);   opacity:0; }
        }
        @keyframes slideUp {
          from { transform:translateY(32px); opacity:0; }
          to   { transform:translateY(0);    opacity:1; }
        }
        @keyframes fadeIn {
          from { opacity:0; }
          to   { opacity:1; }
        }
        @keyframes scanH {
          from { transform:translateY(-200px); }
          to   { transform:translateY(110vh);  }
        }
        @keyframes particleFly {
          0%   { transform:translate(0,0)          scale(1);   opacity:1; }
          100% { transform:translate(var(--vx),var(--vy)) scale(0); opacity:0; }
        }
        @keyframes scrollBounce {
          0%,100% { transform:translateX(-50%) translateY(0px); }
          50%     { transform:translateX(-50%) translateY(8px);  }
        }
        @keyframes glitchShift {
          0%,90%,100% { clip-path:none; transform:none; }
          91%  { clip-path:inset(20% 0 60% 0); transform:translateX(-3px); }
          93%  { clip-path:inset(60% 0 10% 0); transform:translateX(3px);  }
          95%  { clip-path:none; transform:none; }
        }
      `}</style>

      <section style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 24px",
        overflow: "hidden",
      }}>

        {/* ── Orbital rings canvas ── */}
        <OrbitalCanvas />

        {/* ── Nebula glow blobs ── */}
        <div style={{
          position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)",
          width: 900, height: 900,
          background: "radial-gradient(circle,rgba(0,212,255,0.07) 0%,rgba(123,47,255,0.04) 45%,transparent 70%)",
          borderRadius: "50%", pointerEvents: "none", animation: "breathe 8s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", bottom: "-10%", left: "20%",
          width: 600, height: 600,
          background: "radial-gradient(circle,rgba(123,47,255,0.06) 0%,transparent 70%)",
          borderRadius: "50%", pointerEvents: "none", animation: "breathe 10s ease-in-out 2s infinite",
        }} />
        <div style={{
          position: "absolute", bottom: "-5%", right: "15%",
          width: 500, height: 500,
          background: "radial-gradient(circle,rgba(0,255,200,0.05) 0%,transparent 70%)",
          borderRadius: "50%", pointerEvents: "none", animation: "breathe 12s ease-in-out 4s infinite",
        }} />

        {/* ── Scan line ── */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 1,
        }}>
          <div style={{
            position: "absolute", width: "100%", height: 1,
            background: "linear-gradient(90deg,transparent,rgba(0,212,255,0.06),rgba(0,212,255,0.14),rgba(0,212,255,0.06),transparent)",
            animation: "scanH 14s linear infinite",
          }} />
        </div>

        {/* ── Main content ── */}
        <div style={{ position: "relative", zIndex: 10, maxWidth: 880, width: "100%" }}>

          {/* System badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 100,
            background: "rgba(0,212,255,0.06)",
            border: "1px solid rgba(0,212,255,0.20)",
            marginBottom: 32,
            opacity: ready ? 1 : 0,
            transform: ready ? "translateY(0)" : "translateY(16px)",
            transition: "all 0.6s ease",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#00FFCC", boxShadow: "0 0 8px #00FFCC",
              display: "inline-block", animation: "ringPulse 2s ease infinite",
            }} />
            <span style={{
              fontFamily: "'VT323',monospace", fontSize: 12,
              color: "rgba(0,255,204,0.85)", letterSpacing: "0.3em",
            }}>NEURAL OS v3.2 · ALL SYSTEMS NOMINAL</span>
          </div>

          {/* ── WORDMARK ── */}
          <div style={{
            position: "relative", display: "inline-block", marginBottom: 6,
            opacity: ready ? 1 : 0,
            transform: ready ? "translateY(0)" : "translateY(40px)",
            transition: "all 0.8s cubic-bezier(0.23,1,0.32,1) 0.15s",
          }}>
            {/* Glitch ghost layers */}
            <h1 style={{
              fontFamily: "'Teko',sans-serif",
              fontSize: "clamp(72px, 14vw, 148px)",
              fontWeight: 700,
              letterSpacing: "0.22em",
              lineHeight: 1,
              position: "absolute", inset: 0,
              color: "#00FFCC",
              opacity: 0.08,
              transform: "translateX(3px)",
              userSelect: "none",
              animation: "glitchShift 8s ease 3s infinite",
            }}>ARIVUON</h1>
            <h1 style={{
              fontFamily: "'Teko',sans-serif",
              fontSize: "clamp(72px, 14vw, 148px)",
              fontWeight: 700,
              letterSpacing: "0.22em",
              lineHeight: 1,
              position: "absolute", inset: 0,
              color: "#FF006E",
              opacity: 0.06,
              transform: "translateX(-3px)",
              userSelect: "none",
            }}>ARIVUON</h1>
            {/* Main holo wordmark */}
            <h1 style={{
              fontFamily: "'Teko',sans-serif",
              fontSize: "clamp(72px, 14vw, 148px)",
              fontWeight: 700,
              letterSpacing: "0.22em",
              lineHeight: 1,
              background: "linear-gradient(90deg,#00D4FF,#A78BFA,#00FFCC,#FFD700,#00D4FF)",
              backgroundSize: "300% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "holoPan 6s linear infinite",
              position: "relative",
              margin: 0,
            }}>ARIVUON</h1>
          </div>

          {/* ── Typewriter subtitle ── */}
          <div style={{
            height: 32,
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 24,
          }}>
            <p style={{
              fontFamily: "'VT323',monospace",
              fontSize: "clamp(14px,2.4vw,19px)",
              color: "rgba(0,212,255,0.75)",
              letterSpacing: "0.35em",
            }}>
              {subtitle}
              <span style={{
                opacity: subtitle.length < 24 ? 1 : 0,
                color: "#00D4FF",
                animation: subtitle.length < 24 ? "none" : "ringPulse 1s ease infinite",
                transition: "opacity 0.3s",
              }}>█</span>
            </p>
          </div>

          {/* ── Description ── */}
          <p style={{
            fontFamily: "'Exo 2',sans-serif",
            fontSize: "clamp(14px,1.8vw,17px)",
            fontWeight: 300,
            color: "rgba(200,230,240,0.58)",
            lineHeight: 1.82,
            maxWidth: 640,
            margin: "0 auto 40px",
            letterSpacing: "0.02em",
            opacity: ready ? 1 : 0,
            transform: ready ? "translateY(0)" : "translateY(24px)",
            transition: "all 0.8s cubic-bezier(0.23,1,0.32,1) 0.5s",
          }}>
            A next-generation learning cosmos powered by{" "}
            <span style={{ color: "#FF6B9D", fontWeight: 600 }}>ARIA AI</span>,
            real-time orbital sessions and immersive universe environments
            for students, trainers and institutions across every galaxy.
          </p>

          {/* ── Feature chips ── */}
          <div style={{
            display: "flex", flexWrap: "wrap", justifyContent: "center",
            gap: 10, marginBottom: 42,
            opacity: ready ? 1 : 0,
            transition: "opacity 0.6s ease 0.7s",
          }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "6px 14px",
                borderRadius: 100,
                background: `${f.color}0a`,
                border: `1px solid ${f.color}28`,
                cursor: "default",
                transition: "all 0.25s ease",
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `${f.color}18`
                  e.currentTarget.style.borderColor = `${f.color}55`
                  e.currentTarget.style.transform = "translateY(-2px)"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = `${f.color}0a`
                  e.currentTarget.style.borderColor = `${f.color}28`
                  e.currentTarget.style.transform = "translateY(0)"
                }}
              >
                <span style={{ fontSize: 12 }}>{f.icon}</span>
                <span style={{
                  fontFamily: "'Exo 2',sans-serif", fontSize: 11, fontWeight: 600,
                  color: f.color, letterSpacing: "0.1em", textTransform: "uppercase",
                }}>{f.text}</span>
              </div>
            ))}
          </div>

          {/* ── CTA Buttons ── */}
          <div style={{
            display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14,
            opacity: ready ? 1 : 0,
            transform: ready ? "translateY(0)" : "translateY(24px)",
            transition: "all 0.7s cubic-bezier(0.23,1,0.32,1) 0.65s",
          }}>

            {/* Primary */}
            <button
              onClick={(e) => { trigger(e); setTimeout(() => router.push("/auth/login"), 350) }}
              style={{
                position: "relative",
                padding: "15px 36px",
                borderRadius: 16,
                background: "linear-gradient(135deg,#00D4FF,#7B2FFF)",
                border: "1px solid rgba(0,212,255,0.4)",
                color: "#020408",
                fontFamily: "'Teko',sans-serif", fontSize: 18, fontWeight: 600,
                letterSpacing: "0.2em",
                cursor: "pointer",
                boxShadow: "0 0 40px rgba(0,212,255,0.35),0 14px 40px rgba(0,0,0,0.5)",
                transition: "all 0.3s cubic-bezier(0.23,1,0.32,1)",
                overflow: "visible",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-4px) scale(1.03)"
                e.currentTarget.style.boxShadow = "0 0 60px rgba(0,212,255,0.55),0 20px 50px rgba(0,0,0,0.5)"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0) scale(1)"
                e.currentTarget.style.boxShadow = "0 0 40px rgba(0,212,255,0.35),0 14px 40px rgba(0,0,0,0.5)"
              }}
            >
              {/* Shimmer sweep */}
              <div style={{
                position: "absolute", inset: 0, borderRadius: 16,
                background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.12) 50%,transparent 60%)",
                backgroundSize: "200% 100%",
                animation: "holoPan 3s linear infinite",
                pointerEvents: "none",
              }} />
              ENTER THE UNIVERSE  →

              {/* Burst particles */}
              {particles.map(p => (
                <div key={p.id} style={{
                  position: "absolute",
                  left: p.x, top: p.y,
                  width: 5, height: 5, borderRadius: "50%",
                  background: p.color,
                  boxShadow: `0 0 6px ${p.color}`,
                  pointerEvents: "none",
                  // @ts-ignore
                  "--vx": `${p.vx}px`,
                  "--vy": `${p.vy}px`,
                  animation: "particleFly 0.7s ease-out both",
                  transform: "translate(-50%,-50%)",
                }} />
              ))}
            </button>

            {/* Secondary */}
            <button
              style={{
                padding: "15px 36px",
                borderRadius: 16,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(0,212,255,0.22)",
                color: "rgba(0,212,255,0.88)",
                fontFamily: "'Teko',sans-serif", fontSize: 18, fontWeight: 600,
                letterSpacing: "0.2em",
                cursor: "pointer",
                backdropFilter: "blur(12px)",
                transition: "all 0.3s cubic-bezier(0.23,1,0.32,1)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(0,212,255,0.1)"
                e.currentTarget.style.borderColor = "rgba(0,212,255,0.5)"
                e.currentTarget.style.transform = "translateY(-4px)"
                e.currentTarget.style.color = "#00D4FF"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.03)"
                e.currentTarget.style.borderColor = "rgba(0,212,255,0.22)"
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.color = "rgba(0,212,255,0.88)"
              }}
            >
              EXPLORE PLATFORM
            </button>

          </div>

          {/* ── Stats row ── */}
          <div style={{
            display: "flex", flexWrap: "wrap", justifyContent: "center",
            gap: 12, marginTop: 56,
          }}>
            {STATS.map((s, i) => (
              <StatPill key={i} {...s} delay={900 + i * 120} />
            ))}
          </div>

        </div>

        {/* ── Scroll indicator ── */}
        <div style={{
          position: "absolute", bottom: 32, left: "50%",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          animation: "scrollBounce 2.4s ease-in-out infinite",
          cursor: "pointer",
          opacity: ready ? 0.55 : 0,
          transition: "opacity 1s ease 1.2s",
          zIndex: 10,
        }}
          onClick={() => window.scrollBy({ top: window.innerHeight, behavior: "smooth" })}
          onMouseEnter={e => { e.currentTarget.style.opacity = "1" }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "0.55" }}
        >
          {/* Animated chevron stack */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 10, height: 6,
                borderRight: `1.5px solid rgba(0,212,255,${0.3 + i * 0.25})`,
                borderBottom: `1.5px solid rgba(0,212,255,${0.3 + i * 0.25})`,
                transform: "rotate(45deg)",
                boxShadow: `1px 1px 4px rgba(0,212,255,${0.2 + i * 0.15})`,
              }} />
            ))}
          </div>
          <span style={{
            fontFamily: "'VT323',monospace", fontSize: 11,
            color: "rgba(0,212,255,0.55)", letterSpacing: "0.3em",
            textTransform: "uppercase",
          }}>SCROLL</span>
        </div>

      </section>
    </>
  )
}