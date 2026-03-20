// components/background/LuminaBackground.tsx
"use client"

import { useEffect, useRef } from "react"

/**
 * LuminaBackground
 * Full-screen animated canvas: deep navy void + particle network
 * + drifting nebula orbs + perspective grid + scan-line overlay.
 * Drop-in replacement for CosmosEngine — same fixed/inset positioning.
 */
export default function LuminaBackground() {
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

    /* ── Particle class ──────────────────────────────────── */
    class Particle {
      x!: number; y!: number; r!: number
      a!: number; spd!: number; op!: number; tw!: number
      col!: string

      constructor() { this.reset() }

      reset() {
        this.x   = Math.random() * W
        this.y   = Math.random() * H
        this.r   = Math.random() * 1.1 + 0.2
        this.a   = Math.random() * Math.PI * 2
        this.spd = Math.random() * 0.16 + 0.04
        this.op  = Math.random() * 0.45 + 0.1
        this.tw  = (Math.random() * 0.014 + 0.003) * (Math.random() > 0.5 ? 1 : -1)
        // nebula blue / cyan / white / gold (rare)
        const palette = [
          "26,150,255",   // nebula blue
          "0,212,255",    // electric cyan
          "200,220,255",  // cool white
          "255,185,0",    // gold accent (rare)
        ]
        const weights = [0.45, 0.35, 0.15, 0.05]
        let rand = Math.random(), idx = 0
        for (let i = 0; i < weights.length; i++) {
          rand -= weights[i]
          if (rand <= 0) { idx = i; break }
        }
        this.col = palette[idx]
      }

      update() {
        this.x   += Math.cos(this.a) * this.spd
        this.y   += Math.sin(this.a) * this.spd
        this.a   += (Math.random() - 0.5) * 0.014
        this.op  += this.tw
        if (this.op > 0.65 || this.op < 0.05) this.tw *= -1
        if (this.x < -10 || this.x > W + 10 || this.y < -10 || this.y > H + 10) this.reset()
      }

      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${this.col},${this.op})`
        ctx.fill()
      }
    }

    /* ── Nebula orbs ─────────────────────────────────────── */
    const nebulas = [
      { ox: 0.08, oy: 0.12, rx: 480, ry: 280, col: "0,80,200",  op: 0.28, sp: 0.7, ph: 0 },
      { ox: 0.88, oy: 0.15, rx: 420, ry: 240, col: "0,140,255", op: 0.20, sp: 1.0, ph: 2 },
      { ox: 0.48, oy: 0.78, rx: 520, ry: 280, col: "0,40,120",  op: 0.32, sp: 0.6, ph: 4 },
      { ox: 0.82, oy: 0.80, rx: 360, ry: 200, col: "255,185,0", op: 0.06, sp: 0.8, ph: 1 },
      { ox: 0.22, oy: 0.60, rx: 400, ry: 220, col: "0,100,220", op: 0.22, sp: 0.9, ph: 3 },
    ]

    const PARTICLE_COUNT = 240
    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => new Particle())

    /* ── Connection threads ──────────────────────────────── */
    function drawConnections() {
      const MAX_DIST = 85
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const d  = Math.sqrt(dx * dx + dy * dy)
          if (d < MAX_DIST) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(0,140,255,${(1 - d / MAX_DIST) * 0.055})`
            ctx.lineWidth   = 0.4
            ctx.stroke()
          }
        }
      }
    }

    /* ── Perspective grid ────────────────────────────────── */
    function drawGrid() {
      const COLS = 22, ROWS = 14
      const cw = W / COLS, ch = H / ROWS
      ctx.strokeStyle = "rgba(26,150,255,0.04)"
      ctx.lineWidth   = 0.5
      for (let c = 0; c <= COLS; c++) {
        ctx.beginPath(); ctx.moveTo(c * cw, 0); ctx.lineTo(c * cw, H); ctx.stroke()
      }
      for (let r = 0; r <= ROWS; r++) {
        ctx.beginPath(); ctx.moveTo(0, r * ch); ctx.lineTo(W, r * ch); ctx.stroke()
      }
    }

    /* ── Draw loop ───────────────────────────────────────── */
    function draw() {
      ctx.clearRect(0, 0, W, H)
      t += 0.008

      // Deep void base
      ctx.fillStyle = "#020810"
      ctx.fillRect(0, 0, W, H)

      // Ambient corner gradients
      const g1 = ctx.createRadialGradient(W * 0.05, H * 0.05, 0, W * 0.05, H * 0.05, W * 0.55)
      g1.addColorStop(0, "rgba(0,30,80,0.55)")
      g1.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H)

      const g2 = ctx.createRadialGradient(W * 0.92, H * 0.92, 0, W * 0.92, H * 0.92, W * 0.5)
      g2.addColorStop(0, "rgba(0,20,60,0.4)")
      g2.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H)

      // Animated nebula blobs
      nebulas.forEach(n => {
        const dx    = Math.sin(t * n.sp * 0.08 + n.ph) * 22
        const dy    = Math.cos(t * n.sp * 0.06 + n.ph) * 14
        const pulse = Math.sin(t * 0.55 + n.ph) * 0.5 + 0.5
        const cx    = n.ox * W + dx
        const cy    = n.oy * H + dy

        ctx.save()
        ctx.translate(cx, cy)
        ctx.scale(1, n.ry / n.rx)
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, n.rx)
        grad.addColorStop(0, `rgba(${n.col},${n.op * (1 + pulse * 0.6)})`)
        grad.addColorStop(0.5, `rgba(${n.col},${n.op * 0.35})`)
        grad.addColorStop(1, `rgba(${n.col},0)`)
        ctx.beginPath(); ctx.arc(0, 0, n.rx, 0, Math.PI * 2)
        ctx.fillStyle = grad; ctx.fill()
        ctx.restore()
      })

      // Grid
      drawGrid()

      // Particle connections
      drawConnections()

      // Particles
      particles.forEach(p => { p.update(); p.draw() })

      // Vignette
      const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.1, W / 2, H / 2, W * 0.8)
      vig.addColorStop(0, "rgba(0,0,0,0)")
      vig.addColorStop(1, "rgba(0,0,0,0.72)")
      ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H)

      animId = requestAnimationFrame(draw)
    }

    draw()

    const onResize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    window.addEventListener("resize", onResize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}