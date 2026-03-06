"use client"

import { useEffect, useRef } from "react"

export default function CosmosEngine() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext("2d")
    if (!context) return
    const ctx = context

    let W = (canvas.width = window.innerWidth)
    let H = (canvas.height = window.innerHeight)
    let animId: number
    let t = 0

    /* ── 3-tier star field ─────────────────────────────────── */
    const mkStar = (rMin: number, rMax: number, col: [number, number, number]) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * (rMax - rMin) + rMin,
      phase: Math.random() * Math.PI * 2,
      col,
    })

    const stars = [
      ...Array.from({ length: 200 }, () => mkStar(0.1, 0.85, [255, 255, 255])),
      ...Array.from({ length: 80 }, () => mkStar(0.3, 1.4, [180, 220, 255])),
      ...Array.from({ length: 30 }, () => mkStar(0.5, 2.2, [0, 212, 255])),
    ]

    /* ── Nebula blobs ──────────────────────────────────────── */
    type Nebula = { ox: number; oy: number; rx: number; ry: number; col: [number, number, number]; op: number; sp: number; ph: number }
    const nebulas: Nebula[] = [
      { ox: 0.15, oy: 0.18, rx: 430, ry: 220, col: [0, 212, 255], op: 0.038, sp: 0.8, ph: 0 },
      { ox: 0.82, oy: 0.14, rx: 380, ry: 200, col: [123, 47, 255], op: 0.032, sp: 1.1, ph: 1 },
      { ox: 0.50, oy: 0.72, rx: 510, ry: 260, col: [255, 0, 110], op: 0.024, sp: 0.7, ph: 2 },
      { ox: 0.88, oy: 0.82, rx: 360, ry: 180, col: [0, 255, 200], op: 0.028, sp: 0.9, ph: 3 },
      { ox: 0.22, oy: 0.78, rx: 450, ry: 230, col: [80, 0, 200], op: 0.026, sp: 0.6, ph: 4 },
      { ox: 0.62, oy: 0.42, rx: 300, ry: 160, col: [0, 180, 255], op: 0.030, sp: 1.0, ph: 5 },
    ]

    /* ── Shooting stars ────────────────────────────────────── */
    type Shoot = { x: number; y: number; vx: number; vy: number; life: number; max: number; len: number }
    const shoots: Shoot[] = []

    function spawnShoot() {
      if (Math.random() > 0.003) return
      const a = Math.random() * Math.PI / 6 + Math.PI / 10
      const spd = Math.random() * 6 + 4
      shoots.push({
        x: Math.random() * W * 0.7, y: Math.random() * H * 0.4,
        vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
        life: 0, max: Math.random() * 55 + 40, len: Math.random() * 90 + 50
      })
    }

    /* ── Main draw loop ────────────────────────────────────── */
    function draw() {
      ctx.clearRect(0, 0, W, H)
      t += 0.008

      // Deep void
      ctx.fillStyle = "#020408"
      ctx.fillRect(0, 0, W, H)

      // Ambient corner gradients
      const c1 = ctx.createRadialGradient(W * 0.1, H * 0.1, 0, W * 0.1, H * 0.1, W * 0.5)
      c1.addColorStop(0, "rgba(0,25,55,0.5)")
      c1.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = c1; ctx.fillRect(0, 0, W, H)

      const c2 = ctx.createRadialGradient(W * 0.9, H * 0.9, 0, W * 0.9, H * 0.9, W * 0.55)
      c2.addColorStop(0, "rgba(45,0,75,0.38)")
      c2.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = c2; ctx.fillRect(0, 0, W, H)

      // Animated nebula blobs
      nebulas.forEach(n => {
        const dx = Math.sin(t * n.sp * 0.08 + n.ph) * 20
        const dy = Math.cos(t * n.sp * 0.06 + n.ph) * 13
        const pulse = (Math.sin(t * 0.55 + n.ph) * 0.5 + 0.5)
        const g = ctx.createRadialGradient(n.ox * W + dx, n.oy * H + dy, 0, n.ox * W + dx, n.oy * H + dy, n.rx)
        g.addColorStop(0, `rgba(${n.col},${n.op * (1 + pulse * 0.7)})`)
        g.addColorStop(0.5, `rgba(${n.col},${n.op * 0.38})`)
        g.addColorStop(1, `rgba(${n.col},0)`)
        ctx.save()
        ctx.translate(n.ox * W + dx, n.oy * H + dy)
        ctx.scale(1, n.ry / n.rx)
        ctx.beginPath(); ctx.arc(0, 0, n.rx, 0, Math.PI * 2)
        ctx.fillStyle = g; ctx.fill()
        ctx.restore()
      })

      // Stars with twinkling
      stars.forEach(s => {
        const tw = Math.sin(t * 2.2 + s.phase) * 0.5 + 0.5
        const alpha = 0.18 + tw * 0.82
        const sz = s.r * (1 + tw * 0.35)
        if (s.col[0] === 0) { // tier-3 glow halo
          ctx.beginPath(); ctx.arc(s.x, s.y, sz * 3.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(0,212,255,${alpha * 0.07})`; ctx.fill()
        }
        ctx.beginPath(); ctx.arc(s.x, s.y, sz, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${s.col},${alpha})`; ctx.fill()
      })

      // Shooting stars
      spawnShoot()
      for (let i = shoots.length - 1; i >= 0; i--) {
        const s = shoots[i]; s.x += s.vx; s.y += s.vy; s.life++
        if (s.life > s.max) { shoots.splice(i, 1); continue }
        const p = s.life / s.max
        const alpha = p < 0.25 ? p / 0.25 : p > 0.72 ? (1 - p) / 0.28 : 1
        const mag = Math.sqrt(s.vx * s.vx + s.vy * s.vy)
        const trail = ctx.createLinearGradient(s.x, s.y, s.x - (s.vx / mag) * s.len, s.y - (s.vy / mag) * s.len)
        trail.addColorStop(0, `rgba(255,255,255,${alpha})`)
        trail.addColorStop(0.4, `rgba(0,212,255,${alpha * 0.75})`)
        trail.addColorStop(1, "rgba(0,212,255,0)")
        ctx.beginPath(); ctx.moveTo(s.x, s.y)
        ctx.lineTo(s.x - (s.vx / mag) * s.len, s.y - (s.vy / mag) * s.len)
        ctx.strokeStyle = trail; ctx.lineWidth = 1.6; ctx.stroke()
        ctx.beginPath(); ctx.arc(s.x, s.y, 1.8, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${alpha})`; ctx.fill()
      }

      // Cinematic vignette
      const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.08, W / 2, H / 2, W * 0.78)
      vig.addColorStop(0, "rgba(0,0,0,0)")
      vig.addColorStop(1, "rgba(0,0,0,0.75)")
      ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H)

      animId = requestAnimationFrame(draw)
    }

    draw()

    const onResize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    window.addEventListener("resize", onResize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize) }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />
}