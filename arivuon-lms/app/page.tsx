"use client";
import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   ARIVUON 2.0 — NEURAL OPERATING SYSTEM FOR LEARNING
   Design Language: "Biopunk Holographic Terminal"
   - Chromatic aberration overlays
   - DNA helix progress indicators
   - Holographic scan-line effects
   - Neural mesh backgrounds
   - Liquid metal gradients
   - Orbital navigation system
   - Biometric-style data rings
═══════════════════════════════════════════════════════════════ */

// ── CSS Injection ─────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --plasma: #00f5ff;
    --plasma-dim: rgba(0,245,255,0.15);
    --acid: #39ff14;
    --acid-dim: rgba(57,255,20,0.12);
    --nova: #ff2d78;
    --nova-dim: rgba(255,45,120,0.12);
    --solar: #ffb800;
    --solar-dim: rgba(255,184,0,0.12);
    --void: #050a14;
    --surface: rgba(8,16,32,0.88);
    --glass: rgba(0,245,255,0.04);
    --border: rgba(0,245,255,0.12);
    --text-primary: #e8f4f8;
    --text-dim: rgba(200,230,240,0.35);
  }

  html, body { background: var(--void); overflow: hidden; height: 100%; width: 100%; }

  ::-webkit-scrollbar { width: 2px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--plasma); border-radius: 1px; }

  @keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  @keyframes flicker {
    0%,100% { opacity: 1; } 92% { opacity: 1; } 93% { opacity: 0.4; } 94% { opacity: 1; } 96% { opacity: 0.6; } 97% { opacity: 1; }
  }
  @keyframes drift {
    0%,100% { transform: translateY(0px) translateX(0px); }
    25% { transform: translateY(-12px) translateX(6px); }
    50% { transform: translateY(-6px) translateX(-8px); }
    75% { transform: translateY(-14px) translateX(4px); }
  }
  @keyframes orbit {
    from { transform: rotate(0deg) translateX(28px) rotate(0deg); }
    to { transform: rotate(360deg) translateX(28px) rotate(-360deg); }
  }
  @keyframes pulse-ring {
    0% { transform: scale(0.8); opacity: 1; }
    100% { transform: scale(2.4); opacity: 0; }
  }
  @keyframes data-stream {
    0% { transform: translateY(0); opacity: 0.8; }
    100% { transform: translateY(-100%); opacity: 0; }
  }
  @keyframes glitch {
    0%,100% { clip-path: inset(0 0 100% 0); }
    10% { clip-path: inset(10% 0 60% 0); transform: translate(-2px,0); }
    20% { clip-path: inset(40% 0 20% 0); transform: translate(2px,0); }
    30% { clip-path: inset(70% 0 5% 0); transform: translate(-1px,0); }
    40%,90% { clip-path: inset(0 0 100% 0); }
  }
  @keyframes holo-shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes breath {
    0%,100% { box-shadow: 0 0 20px rgba(0,245,255,0.2), inset 0 0 20px rgba(0,245,255,0.03); }
    50% { box-shadow: 0 0 40px rgba(0,245,255,0.4), inset 0 0 30px rgba(0,245,255,0.06); }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes spin-reverse {
    from { transform: rotate(360deg); }
    to { transform: rotate(0deg); }
  }
  @keyframes count-up {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes node-pulse {
    0%,100% { r: 3; opacity: 0.8; }
    50% { r: 5; opacity: 1; }
  }
  @keyframes matrix-fall {
    0% { transform: translateY(-20px); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 0.5; }
    100% { transform: translateY(100px); opacity: 0; }
  }
  @keyframes warp-in {
    0% { transform: scaleX(0); opacity: 0; }
    100% { transform: scaleX(1); opacity: 1; }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .holo-text {
    background: linear-gradient(90deg, var(--plasma), #a78bfa, var(--plasma), #60a5fa, var(--plasma));
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: holo-shimmer 4s linear infinite;
  }
  .card-hover {
    transition: all 0.4s cubic-bezier(0.23,1,0.32,1);
  }
  .card-hover:hover {
    transform: translateY(-4px) scale(1.01);
    border-color: rgba(0,245,255,0.35) !important;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(0,245,255,0.12) !important;
  }
  .btn-plasma {
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
  }
  .btn-plasma::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(0,245,255,0.2), rgba(167,139,250,0.2));
    opacity: 0;
    transition: opacity 0.3s;
  }
  .btn-plasma:hover::before { opacity: 1; }
  .nav-item-active { animation: breath 2.5s ease-in-out infinite; }
  .animate-in { animation: fadeSlideUp 0.5s ease forwards; }
`;

// ── Neural Mesh Background ────────────────────────────────────────────────────
function NeuralMesh() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    let W = c.width = window.innerWidth;
    let H = c.height = window.innerHeight;
    const nodes = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 0.5,
      phase: Math.random() * Math.PI * 2,
    }));
    let t = 0, raf;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.008;
      // Deep background gradient
      const grad = ctx.createRadialGradient(W * 0.3, H * 0.2, 0, W * 0.3, H * 0.2, W * 0.6);
      grad.addColorStop(0, "rgba(0,30,60,0.4)");
      grad.addColorStop(1, "rgba(5,10,20,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      const grad2 = ctx.createRadialGradient(W * 0.8, H * 0.8, 0, W * 0.8, H * 0.8, W * 0.5);
      grad2.addColorStop(0, "rgba(60,0,80,0.3)");
      grad2.addColorStop(1, "rgba(5,10,20,0)");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, W, H);

      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        const pulse = Math.sin(t + n.phase) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size * (1 + pulse * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,245,255,${0.3 + pulse * 0.4})`;
        ctx.fill();
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 140) {
            const alpha = (1 - d / 140) * 0.12;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            const lGrad = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
            lGrad.addColorStop(0, `rgba(0,245,255,${alpha})`);
            lGrad.addColorStop(0.5, `rgba(167,139,250,${alpha * 1.5})`);
            lGrad.addColorStop(1, `rgba(0,245,255,${alpha})`);
            ctx.strokeStyle = lGrad;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    const onResize = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);
  return (
    <>
      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />
      {/* Scanline overlay */}
      <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: "100%", height: 2, background: "linear-gradient(90deg,transparent,rgba(0,245,255,0.04),transparent)", animation: "scanline 8s linear infinite" }} />
      </div>
      {/* Vignette */}
      <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)" }} />
    </>
  );
}

// ── Holographic Card ───────────────────────────────────────────────────────────
function HoloCard({ children, className = "card-hover", style = {}, accent = "var(--plasma)", glow = false }) {
  return (
    <div className={className} style={{
      background: "var(--surface)",
      border: `1px solid rgba(0,245,255,0.1)`,
      borderRadius: 20,
      backdropFilter: "blur(32px)",
      position: "relative",
      overflow: "hidden",
      boxShadow: glow
        ? `0 0 0 1px ${accent}22, 0 8px 40px rgba(0,0,0,0.5), 0 0 60px ${accent}08`
        : "0 8px 40px rgba(0,0,0,0.5)",
      ...style,
    }}>
      {/* Corner accents */}
      <div style={{ position: "absolute", top: 0, left: 0, width: 20, height: 20, borderTop: `1px solid ${accent}`, borderLeft: `1px solid ${accent}`, borderRadius: "20px 0 0 0" }} />
      <div style={{ position: "absolute", top: 0, right: 0, width: 20, height: 20, borderTop: `1px solid ${accent}`, borderRight: `1px solid ${accent}`, borderRadius: "0 20px 0 0" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, width: 20, height: 20, borderBottom: `1px solid ${accent}`, borderLeft: `1px solid ${accent}`, borderRadius: "0 0 0 20px" }} />
      <div style={{ position: "absolute", bottom: 0, right: 0, width: 20, height: 20, borderBottom: `1px solid ${accent}`, borderRight: `1px solid ${accent}`, borderRadius: "0 0 20px 0" }} />
      {children}
    </div>
  );
}

// ── Section Label ──────────────────────────────────────────────────────────────
function SectionLabel({ text, color = "var(--plasma)", icon = "◈" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
      <span style={{ color, fontSize: 14 }}>{icon}</span>
      <span style={{ color, fontSize: 10, fontFamily: "'Share Tech Mono',monospace", letterSpacing: 3, textTransform: "uppercase" }}>{text}</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${color}44,transparent)` }} />
    </div>
  );
}

// ── Plasma Badge ───────────────────────────────────────────────────────────────
function Badge({ label, color = "var(--plasma)", dot = false }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: `${color}12`, border: `1px solid ${color}30`,
      borderRadius: 6, padding: "3px 9px",
      fontSize: 9, fontFamily: "'Share Tech Mono',monospace", color,
      letterSpacing: 1.5, textTransform: "uppercase",
    }}>
      {dot && <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}`, display: "inline-block", animation: "pulse-ring 1.5s ease infinite" }} />}
      {label}
    </span>
  );
}

// ── Biometric Ring ─────────────────────────────────────────────────────────────
function BioRing({ pct, size = 72, label, value, color = "var(--plasma)" }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        {/* Outer decorative ring */}
        <svg style={{ position: "absolute", inset: 0, animation: "spin-slow 20s linear infinite" }} width={size} height={size}>
          {Array.from({ length: 24 }, (_, i) => {
            const angle = (i / 24) * Math.PI * 2;
            const x1 = size / 2 + (r + 1) * Math.cos(angle);
            const y1 = size / 2 + (r + 1) * Math.sin(angle);
            const x2 = size / 2 + (r + 3) * Math.cos(angle);
            const y2 = size / 2 + (r + 3) * Math.sin(angle);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={`${color}${i % 3 === 0 ? "88" : "33"}`} strokeWidth={i % 3 === 0 ? 1.5 : 0.5} />;
          })}
        </svg>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}15`} strokeWidth={6} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
            strokeLinecap="round" strokeDasharray={`${circ * pct / 100} ${circ}`}
            style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 16, fontWeight: 700, color, fontFamily: "'Orbitron',monospace", lineHeight: 1 }}>{value}</span>
        </div>
      </div>
      <span style={{ fontSize: 9, color: "var(--text-dim)", fontFamily: "'Share Tech Mono',monospace", letterSpacing: 2, textAlign: "center" }}>{label}</span>
    </div>
  );
}

// ── Quantum Progress Bar ───────────────────────────────────────────────────────
function QuantumBar({ pct, color = "var(--plasma)", height = 3 }) {
  return (
    <div style={{ height, borderRadius: 2, background: "rgba(255,255,255,0.04)", overflow: "hidden", position: "relative" }}>
      <div style={{
        height: "100%", width: `${pct}%`, borderRadius: 2,
        background: `linear-gradient(90deg,${color}88,${color},${color}88)`,
        backgroundSize: "200% 100%",
        animation: "holo-shimmer 3s linear infinite",
        boxShadow: `0 0 10px ${color}88`,
        transition: "width 1.2s cubic-bezier(.4,0,.2,1)",
      }} />
    </div>
  );
}

// ── Matrix Rain Column ────────────────────────────────────────────────────────
function MatrixColumn({ chars = "01アイウエオカキクケコABCDEF", delay = 0, left, speed = 3 }) {
  return (
    <div style={{
      position: "absolute", left, top: 0, fontFamily: "'Share Tech Mono',monospace",
      fontSize: 10, color: "var(--plasma)", opacity: 0.08,
      display: "flex", flexDirection: "column", gap: 2,
      animation: `matrix-fall ${speed}s linear ${delay}s infinite`,
    }}>
      {chars.split("").map((c, i) => <span key={i}>{c}</span>)}
    </div>
  );
}

// ── Orbital Nav ────────────────────────────────────────────────────────────────
const NAV = [
  { id: "student", glyph: "⬡", label: "NEURAL HUB", color: "var(--plasma)" },
  { id: "courses", glyph: "◈", label: "COURSES", color: "var(--plasma)" },
  { id: "sessions", glyph: "◎", label: "SESSIONS", color: "var(--plasma)" },
  { id: "trainer", glyph: "⬢", label: "TRAINER", color: "#a78bfa" },
  { id: "admin", glyph: "◆", label: "ADMIN", color: "var(--acid)" },
  { id: "analytics", glyph: "⬟", label: "ANALYTICS", color: "var(--solar)" },
  { id: "ai", glyph: "◉", label: "AI CORE", color: "var(--nova)" },
];

function OrbitalNav({ active, setActive }) {
  const [hov, setHov] = useState(null);
  return (
    <div style={{
      width: 76, display: "flex", flexDirection: "column", alignItems: "center",
      padding: "24px 0 20px", gap: 4, zIndex: 10,
      background: "rgba(5,10,20,0.92)", borderRight: "1px solid rgba(0,245,255,0.08)",
      position: "relative",
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14, position: "relative",
          background: "linear-gradient(135deg,rgba(0,245,255,0.15),rgba(167,139,250,0.15))",
          border: "1px solid rgba(0,245,255,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 24px rgba(0,245,255,0.2)",
        }}>
          <span style={{ fontSize: 22, filter: "drop-shadow(0 0 8px var(--plasma))" }}>⬡</span>
          <div style={{ position: "absolute", inset: -2, borderRadius: 16, border: "1px solid rgba(0,245,255,0.15)", animation: "spin-slow 8s linear infinite" }} />
        </div>
      </div>

      {NAV.map(item => {
        const isActive = active === item.id;
        const isHov = hov === item.id;
        return (
          <div key={item.id} style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>
            {/* Tooltip */}
            {isHov && !isActive && (
              <div style={{
                position: "absolute", left: "calc(100% + 12px)", top: "50%", transform: "translateY(-50%)",
                background: "rgba(5,10,20,0.95)", border: "1px solid rgba(0,245,255,0.2)",
                borderRadius: 8, padding: "6px 12px", whiteSpace: "nowrap", zIndex: 100,
                fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: item.color, letterSpacing: 2,
                boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                animation: "warp-in 0.15s ease",
              }}>{item.label}</div>
            )}
            <div
              onClick={() => setActive(item.id)}
              onMouseEnter={() => setHov(item.id)}
              onMouseLeave={() => setHov(null)}
              className={isActive ? "nav-item-active" : ""}
              style={{
                width: 48, height: 48, borderRadius: 14, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19,
                transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
                background: isActive ? `${item.color}18` : isHov ? `${item.color}0a` : "transparent",
                border: `1px solid ${isActive ? `${item.color}50` : "transparent"}`,
                color: isActive ? item.color : "rgba(200,230,240,0.25)",
                filter: isActive ? `drop-shadow(0 0 8px ${item.color})` : "none",
                transform: isActive ? "scale(1.08)" : isHov ? "scale(1.04)" : "scale(1)",
              }}>{item.glyph}</div>
          </div>
        );
      })}

      <div style={{ flex: 1 }} />
      {/* Status indicator */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <div style={{ width: 1, height: 30, background: "linear-gradient(180deg,transparent,rgba(0,245,255,0.2),transparent)" }} />
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,var(--plasma),#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, fontFamily: "'Orbitron',monospace", color: "#000", cursor: "pointer", boxShadow: "0 0 14px rgba(0,245,255,0.4)" }}>A</div>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--acid)", boxShadow: "0 0 8px var(--acid)" }} />
      </div>
    </div>
  );
}

// ── Command Palette ────────────────────────────────────────────────────────────
function CmdPalette({ open, onClose }) {
  const [q, setQ] = useState("");
  const cmds = [
    { g: "▶", t: "Launch Deep Learning Session", badge: "LIVE", c: "var(--acid)" },
    { g: "⬡", t: "Open Neural Hub Dashboard", badge: "DASH", c: "var(--plasma)" },
    { g: "◈", t: "View Course Roadmap", badge: "LEARN", c: "#a78bfa" },
    { g: "◉", t: "Ask ARIA — AI Assistant", badge: "AI", c: "var(--nova)" },
    { g: "⬢", t: "Trainer Control Panel", badge: "CTRL", c: "#a78bfa" },
    { g: "◆", t: "Admin System Overview", badge: "SYS", c: "var(--acid)" },
    { g: "⬟", t: "Batch Analytics Deep Dive", badge: "DATA", c: "var(--solar)" },
  ].filter(c => c.t.toLowerCase().includes(q.toLowerCase()));
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 100 }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,8,0.8)", backdropFilter: "blur(12px)" }} />
      <HoloCard className="" style={{ width: 600, zIndex: 1, border: "1px solid rgba(0,245,255,0.3)", boxShadow: "0 0 100px rgba(0,245,255,0.15), 0 40px 80px rgba(0,0,0,0.6)", animation: "fadeSlideUp 0.2s ease" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(0,245,255,0.1)", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "var(--plasma)", fontFamily: "'Share Tech Mono',monospace", fontSize: 13 }}>⌘</span>
          <input autoFocus value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search neural pathways, sessions, students…"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--text-primary)", fontFamily: "'Rajdhani',sans-serif", fontSize: 16, letterSpacing: 0.5 }} />
          <Badge label="ESC" color="var(--plasma)" />
        </div>
        <div style={{ padding: 8, maxHeight: 340, overflowY: "auto" }}>
          {cmds.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: 12, cursor: "pointer", transition: "all 0.15s", animationDelay: `${i * 0.04}s` }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,245,255,0.06)"; e.currentTarget.style.borderLeft = "2px solid var(--plasma)"; e.currentTarget.style.paddingLeft = "14px"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderLeft = "none"; e.currentTarget.style.paddingLeft = "16px"; }}>
              <span style={{ fontSize: 18, color: c.c, filter: `drop-shadow(0 0 6px ${c.c})` }}>{c.g}</span>
              <span style={{ flex: 1, color: "var(--text-primary)", fontSize: 14, fontFamily: "'Rajdhani',sans-serif", fontWeight: 500 }}>{c.t}</span>
              <Badge label={c.badge} color={c.c} />
            </div>
          ))}
        </div>
        <div style={{ padding: "10px 20px", borderTop: "1px solid rgba(0,245,255,0.06)", display: "flex", gap: 20 }}>
          {["↵ EXECUTE", "↑↓ NAVIGATE", "ESC EXIT"].map(k => (
            <span key={k} style={{ fontSize: 9, color: "var(--text-dim)", fontFamily: "'Share Tech Mono',monospace", letterSpacing: 1 }}>{k}</span>
          ))}
        </div>
      </HoloCard>
    </div>
  );
}

// ── STUDENT DASHBOARD ──────────────────────────────────────────────────────────
function StudentDashboard() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  const courses = [
    { name: "Neural Networks & Deep Learning", pct: 74, color: "var(--plasma)", tag: "AI/ML", level: "ADV" },
    { name: "Full-Stack Architecture", pct: 51, color: "#a78bfa", tag: "DEV", level: "MID" },
    { name: "Quantum Algorithms", pct: 88, color: "var(--acid)", tag: "CS", level: "ADV" },
    { name: "Cloud Neural Systems", pct: 33, color: "var(--solar)", tag: "INFRA", level: "BEG" },
  ];

  const sessions = [
    { time: "09:00", name: "Deep Learning Lab", trainer: "Dr. Arjun V.", live: true, duration: "90m" },
    { time: "13:30", name: "React Neural Patterns", trainer: "Priya S.", live: false, duration: "60m" },
    { time: "16:00", name: "Algorithm Warfare #14", trainer: "Vikram R.", live: false, duration: "45m" },
  ];

  const attendance = [
    { d: "MON", v: 100 }, { d: "TUE", v: 85 }, { d: "WED", v: 60 },
    { d: "THU", v: 100 }, { d: "FRI", v: 80 }, { d: "SAT", v: 90 },
  ];

  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState([
    { from: "ai", text: "NEURAL LINK ESTABLISHED. Aryan, your Deep Learning session begins in 47 minutes. Shall I prime your neural pathways with backpropagation theory?" },
    { from: "user", text: "Yes — show me gradient descent in 3D space" },
    { from: "ai", text: "Imagine a loss landscape — a mountain range in high-dimensional space. Gradient descent is your descent vector, always moving opposite to the steepest slope. In 3D: ∇L(θ) = [∂L/∂θ₁, ∂L/∂θ₂, ∂L/∂θ₃]. You follow this vector scaled by learning rate α until you reach a valley — the minimum loss." },
  ]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 320px", gridTemplateRows: "auto 1fr 1fr", gap: 16, padding: "20px 24px", height: "100%", overflowY: "auto" }}>

      {/* ── HEADER ── */}
      <div style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, animation: mounted ? "fadeSlideUp 0.5s ease" : "none" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 6 }}>
            <h1 style={{ fontSize: 32, fontFamily: "'Orbitron',monospace", fontWeight: 900, letterSpacing: 2 }} className="holo-text">
              NEURAL HUB
            </h1>
            <Badge label="ONLINE" color="var(--acid)" dot />
            <Badge label="SESSION TODAY" color="var(--plasma)" dot />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "var(--text-dim)", fontSize: 11, fontFamily: "'Share Tech Mono',monospace", letterSpacing: 2 }}>OPERATOR:</span>
            <span style={{ color: "var(--plasma)", fontSize: 11, fontFamily: "'Share Tech Mono',monospace", letterSpacing: 1 }}>ARYAN KUMAR</span>
            <span style={{ color: "var(--text-dim)", fontSize: 11, fontFamily: "'Share Tech Mono',monospace" }}>// FRI 2026-03-06 // BATCH B7</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <BioRing pct={87} size={64} label="STREAK" value="14D" color="var(--solar)" />
          <BioRing pct={91} size={64} label="SCORE" value="91%" color="var(--plasma)" />
          <BioRing pct={73} size={64} label="RANK" value="#4" color="#a78bfa" />
        </div>
      </div>

      {/* ── TODAY'S SESSIONS ── */}
      <HoloCard style={{ padding: 22 }} glow>
        <SectionLabel text="Today's Mission Log" color="var(--plasma)" icon="▶" />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sessions.map((s, i) => (
            <div key={i} className="card-hover" style={{
              padding: "14px 16px", borderRadius: 14, cursor: "pointer",
              background: s.live ? "rgba(0,245,255,0.06)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${s.live ? "rgba(0,245,255,0.25)" : "rgba(255,255,255,0.06)"}`,
              display: "flex", alignItems: "center", gap: 14,
              animationDelay: `${i * 0.1}s`,
            }}>
              <div style={{ textAlign: "center", minWidth: 42 }}>
                <div style={{ color: "var(--text-dim)", fontSize: 9, fontFamily: "'Share Tech Mono',monospace", letterSpacing: 1 }}>{s.time}</div>
                <div style={{ color: "var(--text-dim)", fontSize: 8, fontFamily: "'Share Tech Mono',monospace", marginTop: 2 }}>{s.duration}</div>
              </div>
              <div style={{ width: 2, height: 38, borderRadius: 1, background: s.live ? "var(--plasma)" : "#2d3748", boxShadow: s.live ? "0 0 10px var(--plasma)" : "none" }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 600, fontFamily: "'Rajdhani',sans-serif", letterSpacing: 0.5, marginBottom: 3 }}>{s.name}</div>
                <div style={{ color: "var(--text-dim)", fontSize: 10, fontFamily: "'Share Tech Mono',monospace" }}>{s.trainer}</div>
              </div>
              {s.live ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ position: "relative" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--acid)", boxShadow: "0 0 10px var(--acid)" }} />
                    <div style={{ position: "absolute", inset: -4, borderRadius: "50%", border: "1px solid var(--acid)", animation: "pulse-ring 1.5s ease infinite" }} />
                  </div>
                  <Badge label="LIVE" color="var(--acid)" />
                </div>
              ) : (
                <Badge label="QUEUED" color="var(--text-dim)" />
              )}
            </div>
          ))}
        </div>
      </HoloCard>

      {/* ── COURSE MATRIX ── */}
      <HoloCard style={{ padding: 22 }} accent="#a78bfa">
        <SectionLabel text="Learning Matrix" color="#a78bfa" icon="◈" />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {courses.map((c, i) => (
            <div key={i} style={{ animationDelay: `${i * 0.08}s` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Badge label={c.tag} color={c.color} />
                  <Badge label={c.level} color={c.color} />
                </div>
                <span style={{ color: c.color, fontSize: 14, fontFamily: "'Orbitron',monospace", fontWeight: 700 }}>{c.pct}%</span>
              </div>
              <div style={{ color: "rgba(200,230,240,0.7)", fontSize: 12, fontFamily: "'Rajdhani',sans-serif", fontWeight: 500, marginBottom: 8, letterSpacing: 0.3 }}>{c.name}</div>
              <QuantumBar pct={c.pct} color={c.color} height={3} />
            </div>
          ))}
        </div>
      </HoloCard>

      {/* ── AI ASSISTANT ── */}
      <HoloCard style={{ gridColumn: "3/4", gridRow: "2/4", padding: 0, display: "flex", flexDirection: "column" }} accent="var(--nova)" glow>
        {/* Header */}
        <div style={{ padding: "16px 18px", borderBottom: "1px solid rgba(255,45,120,0.15)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg,rgba(255,45,120,0.3),rgba(167,139,250,0.3))", border: "1px solid rgba(255,45,120,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>◉</div>
            <div style={{ position: "absolute", inset: -3, borderRadius: 15, border: "1px solid rgba(255,45,120,0.2)", animation: "spin-reverse 6s linear infinite" }} />
          </div>
          <div>
            <div style={{ color: "var(--text-primary)", fontSize: 12, fontFamily: "'Orbitron',monospace", fontWeight: 700, letterSpacing: 2 }}>ARIA</div>
            <div style={{ color: "var(--nova)", fontSize: 9, fontFamily: "'Share Tech Mono',monospace", letterSpacing: 1 }}>NEURAL AI · ACTIVE · v4.2</div>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--acid)", boxShadow: "0 0 8px var(--acid)" }} />
        </div>

        {/* Messages */}
        <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
          {aiMessages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "88%", padding: "10px 13px",
                borderRadius: m.from === "user" ? "14px 14px 4px 14px" : "4px 14px 14px 14px",
                background: m.from === "user"
                  ? "linear-gradient(135deg,rgba(0,245,255,0.1),rgba(167,139,250,0.1))"
                  : "rgba(255,45,120,0.06)",
                border: `1px solid ${m.from === "user" ? "rgba(0,245,255,0.2)" : "rgba(255,45,120,0.15)"}`,
                color: "rgba(200,230,240,0.85)", fontSize: 12, lineHeight: 1.6,
                fontFamily: "'Rajdhani',sans-serif", fontWeight: 400, letterSpacing: 0.3,
              }}>
                {m.from === "ai" && <div style={{ color: "var(--nova)", fontSize: 8, fontFamily: "'Share Tech Mono',monospace", letterSpacing: 2, marginBottom: 5 }}>ARIA:</div>}
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Suggested queries */}
        <div style={{ padding: "8px 14px", display: "flex", gap: 6, flexWrap: "wrap", borderTop: "1px solid rgba(255,45,120,0.08)" }}>
          {["Explain backprop", "Quiz me", "Study plan"].map(s => (
            <button key={s} onClick={() => setAiInput(s)} style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(255,45,120,0.08)", border: "1px solid rgba(255,45,120,0.2)", color: "var(--nova)", fontSize: 9, cursor: "pointer", fontFamily: "'Share Tech Mono',monospace", letterSpacing: 1 }}>{s}</button>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,45,120,0.1)", display: "flex", gap: 8 }}>
          <input value={aiInput} onChange={e => setAiInput(e.target.value)}
            placeholder="Query neural pathways…"
            style={{ flex: 1, background: "rgba(255,45,120,0.05)", border: "1px solid rgba(255,45,120,0.2)", borderRadius: 12, padding: "9px 13px", color: "var(--text-primary)", fontSize: 12, outline: "none", fontFamily: "'Rajdhani',sans-serif" }} />
          <button style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,var(--nova),#a78bfa)", border: "none", cursor: "pointer", fontSize: 14, boxShadow: "0 0 14px rgba(255,45,120,0.3)" }}>↑</button>
        </div>
      </HoloCard>

      {/* ── ATTENDANCE GRID ── */}
      <HoloCard style={{ padding: 22 }} accent="var(--solar)">
        <SectionLabel text="Attendance Spectrum" color="var(--solar)" icon="⬟" />
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 90, marginBottom: 16 }}>
          {attendance.map((a, i) => {
            const col = a.v >= 90 ? "var(--acid)" : a.v >= 70 ? "var(--plasma)" : a.v >= 50 ? "var(--solar)" : "var(--nova)";
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <div style={{ width: "100%", borderRadius: "4px 4px 0 0", height: `${a.v * 0.88}%`, minHeight: 4, background: `linear-gradient(180deg,${col},${col}44)`, boxShadow: `0 0 10px ${col}44`, transition: "height 1.2s cubic-bezier(.4,0,.2,1)", cursor: "pointer", position: "relative" }}
                  onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; }}>
                  <div style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)", fontSize: 8, color: col, fontFamily: "'Share Tech Mono',monospace", opacity: 0, transition: "opacity 0.2s" }} className="bar-label">{a.v}%</div>
                </div>
                <span style={{ fontSize: 8, color: "var(--text-dim)", fontFamily: "'Share Tech Mono',monospace" }}>{a.d}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { label: "PRESENT RATE", val: "86%", color: "var(--plasma)" },
            { label: "PERFECT DAYS", val: "3", color: "var(--acid)" },
            { label: "STREAK", val: "14D", color: "var(--solar)" },
            { label: "SESSIONS LEFT", val: "12", color: "#a78bfa" },
          ].map((s, i) => (
            <div key={i} style={{ padding: "10px 12px", borderRadius: 12, background: `${s.color}08`, border: `1px solid ${s.color}18` }}>
              <div style={{ color: "var(--text-dim)", fontSize: 8, fontFamily: "'Share Tech Mono',monospace", letterSpacing: 1.5, marginBottom: 5 }}>{s.label}</div>
              <div style={{ color: s.color, fontSize: 20, fontFamily: "'Orbitron',monospace", fontWeight: 700 }}>{s.val}</div>
            </div>
          ))}
        </div>
      </HoloCard>

      {/* ── PERFORMANCE MATRIX ── */}
      <HoloCard style={{ padding: 22 }} accent="var(--acid)">
        <SectionLabel text="Bio-Metric Performance" color="var(--acid)" icon="◎" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { pct: 91, val: "91.4%", label: "OVERALL\nSCORE", color: "var(--plasma)" },
            { pct: 86, val: "86%", label: "ATTEND-\nANCE", color: "var(--acid)" },
            { pct: 85, val: "24/28", label: "ASSIGN-\nMENTS", color: "#a78bfa" },
            { pct: 71, val: "142h", label: "STUDY\nHOURS", color: "var(--solar)" },
          ].map((s, i) => (
            <BioRing key={i} pct={s.pct} size={76} label={s.label} value={s.val} color={s.color} />
          ))}
        </div>
      </HoloCard>
    </div>
  );
}

// ── TRAINER DASHBOARD ──────────────────────────────────────────────────────────
function TrainerDashboard() {
  const students = [
    { name: "Aryan K.", score: 91, attend: 86, status: "on-track", delta: "+4%" },
    { name: "Meera S.", score: 78, attend: 72, status: "at-risk", delta: "-2%" },
    { name: "Rohan P.", score: 95, attend: 100, status: "excellent", delta: "+7%" },
    { name: "Divya N.", score: 62, attend: 55, status: "critical", delta: "-8%" },
    { name: "Karan T.", score: 84, attend: 90, status: "on-track", delta: "+3%" },
    { name: "Sneha R.", score: 88, attend: 95, status: "excellent", delta: "+5%" },
  ];
  const STATUS = { excellent: { c: "var(--acid)", icon: "◆" }, "on-track": { c: "var(--plasma)", icon: "◎" }, "at-risk": { c: "var(--solar)", icon: "⬟" }, critical: { c: "var(--nova)", icon: "⬡" } };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "auto 1fr 1fr", gap: 16, padding: "20px 24px", height: "100%", overflowY: "auto" }}>

      <div style={{ gridColumn: "1/-1", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div>
          <h1 style={{ fontSize: 28, fontFamily: "'Orbitron',monospace", fontWeight: 900, letterSpacing: 2, marginBottom: 6 }} className="holo-text">TRAINER COMMAND</h1>
          <div style={{ display: "flex", gap: 10 }}>
            <Badge label="BATCH B7" color="var(--plasma)" />
            <Badge label="24 OPERATORS" color="#a78bfa" />
            <Badge label="SESSION ACTIVE" color="var(--acid)" dot />
          </div>
        </div>
        <button className="btn-plasma" style={{ padding: "12px 24px", borderRadius: 14, background: "linear-gradient(135deg,rgba(0,245,255,0.15),rgba(167,139,250,0.15))", border: "1px solid rgba(0,245,255,0.3)", color: "var(--plasma)", fontSize: 11, fontFamily: "'Orbitron',monospace", letterSpacing: 2, cursor: "pointer", fontWeight: 700, boxShadow: "0 0 24px rgba(0,245,255,0.15)" }}>
          ▶ INITIATE SESSION
        </button>
      </div>

      {/* Session Control */}
      <HoloCard style={{ padding: 22 }} glow>
        <SectionLabel text="Session Control Matrix" color="var(--plasma)" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
          {[
            { icon: "▶", label: "START", color: "var(--acid)" },
            { icon: "⏸", label: "PAUSE", color: "var(--solar)" },
            { icon: "📋", label: "ROLL CALL", color: "var(--plasma)" },
            { icon: "💬", label: "Q&A MODE", color: "#a78bfa" },
            { icon: "🎯", label: "QUIZ", color: "var(--nova)" },
            { icon: "📊", label: "POLL", color: "var(--plasma)" },
          ].map((b, i) => (
            <button key={i} className="btn-plasma" style={{
              padding: "11px 8px", borderRadius: 12, background: `${b.color}0d`,
              border: `1px solid ${b.color}25`, color: b.color, cursor: "pointer",
              fontSize: 10, fontFamily: "'Share Tech Mono',monospace", letterSpacing: 1.5,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <span>{b.icon}</span> {b.label}
            </button>
          ))}
        </div>
        <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(0,245,255,0.04)", border: "1px solid rgba(0,245,255,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ color: "var(--text-dim)", fontSize: 9, fontFamily: "'Share Tech Mono',monospace", letterSpacing: 2 }}>SESSION ELAPSED</span>
            <span style={{ color: "var(--plasma)", fontSize: 10, fontFamily: "'Orbitron',monospace" }}>47:23 / 90:00</span>
          </div>
          <QuantumBar pct={52} color="var(--plasma)" height={4} />
        </div>
      </HoloCard>

      {/* Live Attendance Grid */}
      <HoloCard style={{ padding: 22 }} accent="var(--acid)">
        <SectionLabel text="Live Operator Grid" color="var(--acid)" icon="◎" />
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 18 }}>
          <BioRing pct={79} size={80} label="PRESENT" value="19/24" color="var(--acid)" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Badge label="19 ONLINE" color="var(--acid)" dot />
            <Badge label="3 DELAYED" color="var(--solar)" dot />
            <Badge label="2 OFFLINE" color="var(--nova)" />
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {Array.from({ length: 24 }, (_, i) => {
            const col = i < 19 ? "var(--acid)" : i < 22 ? "var(--solar)" : "var(--nova)";
            return (
              <div key={i} title={`Student ${i + 1}`} className="card-hover" style={{
                width: 26, height: 26, borderRadius: 7,
                background: `${col}15`, border: `1px solid ${col}35`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 7, color: col, fontFamily: "'Share Tech Mono',monospace",
                cursor: "pointer",
              }}>S{String(i + 1).padStart(2, "0")}</div>
            );
          })}
        </div>
      </HoloCard>

      {/* Performance Metrics */}
      <HoloCard style={{ padding: 22 }} accent="#a78bfa">
        <SectionLabel text="Batch Intelligence" color="#a78bfa" icon="⬟" />
        {[
          { k: "Batch Avg Score", v: "82.4%", t: "+4.2%", up: true, bar: 82 },
          { k: "Completion Rate", v: "76%", t: "+1.8%", up: true, bar: 76 },
          { k: "Engagement Index", v: "HIGH", t: "↑ 12%", up: true, bar: 85 },
          { k: "At-Risk Operators", v: "2", t: "↓ 1", up: true, bar: 8 },
        ].map((m, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "rgba(200,230,240,0.6)", fontSize: 11, fontFamily: "'Rajdhani',sans-serif", fontWeight: 500 }}>{m.k}</span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ color: "var(--text-primary)", fontSize: 13, fontFamily: "'Orbitron',monospace", fontWeight: 700 }}>{m.v}</span>
                <span style={{ fontSize: 9, color: m.up ? "var(--acid)" : "var(--nova)", fontFamily: "'Share Tech Mono',monospace" }}>{m.t}</span>
              </div>
            </div>
            <QuantumBar pct={m.bar} color="#a78bfa" height={2} />
          </div>
        ))}
      </HoloCard>

      {/* Student Table */}
      <HoloCard style={{ gridColumn: "1/-1", padding: 22 }} accent="var(--solar)">
        <SectionLabel text="Operator Performance Matrix" color="var(--solar)" icon="◆" />
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 4px" }}>
            <thead>
              <tr>
                {["OPERATOR", "NEURAL SCORE", "ATTENDANCE FLUX", "ASSIGNMENTS", "STATUS", "DELTA", "ACTION"].map(h => (
                  <th key={h} style={{ color: "var(--text-dim)", fontSize: 8, fontFamily: "'Share Tech Mono',monospace", letterSpacing: 2, textAlign: "left", padding: "6px 12px", fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => {
                const st = STATUS[s.status];
                return (
                  <tr key={i} className="card-hover" style={{ cursor: "pointer", animation: `fadeSlideUp 0.4s ease ${i * 0.07}s both` }}>
                    {[
                      <td key="name" style={{ padding: "11px 12px", borderRadius: "12px 0 0 12px", background: "rgba(255,255,255,0.02)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 9, background: `linear-gradient(135deg,${st.c}33,${st.c}11)`, border: `1px solid ${st.c}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontFamily: "'Orbitron',monospace", fontWeight: 700, color: st.c }}>{s.name[0]}</div>
                          <span style={{ color: "var(--text-primary)", fontSize: 12, fontFamily: "'Rajdhani',sans-serif", fontWeight: 600 }}>{s.name}</span>
                        </div>
                      </td>,
                      <td key="score" style={{ padding: "11px 12px", background: "rgba(255,255,255,0.02)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 36, borderRadius: 4, overflow: "hidden", height: 4, background: "rgba(255,255,255,0.04)" }}>
                            <div style={{ height: "100%", width: `${s.score}%`, background: "var(--plasma)", boxShadow: "0 0 6px var(--plasma)" }} />
                          </div>
                          <span style={{ color: "var(--plasma)", fontSize: 12, fontFamily: "'Orbitron',monospace", fontWeight: 700 }}>{s.score}%</span>
                        </div>
                      </td>,
                      <td key="att" style={{ padding: "11px 12px", background: "rgba(255,255,255,0.02)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <QuantumBar pct={s.attend} color={s.attend > 80 ? "var(--acid)" : s.attend > 60 ? "var(--solar)" : "var(--nova)"} />
                          <span style={{ color: "var(--text-dim)", fontSize: 10, fontFamily: "'Share Tech Mono',monospace", minWidth: 28 }}>{s.attend}%</span>
                        </div>
                      </td>,
                      <td key="asg" style={{ padding: "11px 12px", background: "rgba(255,255,255,0.02)", color: "var(--text-dim)", fontSize: 10, fontFamily: "'Share Tech Mono',monospace" }}>{Math.round(s.score / 4)}/28</td>,
                      <td key="status" style={{ padding: "11px 12px", background: "rgba(255,255,255,0.02)" }}><Badge label={s.status.toUpperCase()} color={st.c} /></td>,
                      <td key="delta" style={{ padding: "11px 12px", background: "rgba(255,255,255,0.02)", color: s.delta.startsWith("+") ? "var(--acid)" : "var(--nova)", fontSize: 10, fontFamily: "'Orbitron',monospace", fontWeight: 700 }}>{s.delta}</td>,
                      <td key="action" style={{ padding: "11px 12px", borderRadius: "0 12px 12px 0", background: "rgba(255,255,255,0.02)" }}>
                        <button style={{ padding: "5px 12px", borderRadius: 8, background: "rgba(0,245,255,0.08)", border: "1px solid rgba(0,245,255,0.2)", color: "var(--plasma)", fontSize: 9, cursor: "pointer", fontFamily: "'Share Tech Mono',monospace", letterSpacing: 1 }}>VIEW →</button>
                      </td>
                    ]}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </HoloCard>
    </div>
  );
}

// ── ADMIN DASHBOARD ────────────────────────────────────────────────────────────
function AdminDashboard() {
  const kpis = [
    { label: "TOTAL OPERATORS", val: "1,842", delta: "+124", color: "var(--plasma)", icon: "👥", pct: 78 },
    { label: "ACTIVE COURSES", val: "36", delta: "+3", color: "#a78bfa", icon: "◈", pct: 72 },
    { label: "REVENUE OUTPUT", val: "₹24.8L", delta: "+18.3%", color: "var(--acid)", icon: "◆", pct: 85 },
    { label: "COMPLETION FLUX", val: "73%", delta: "+5.2%", color: "var(--solar)", icon: "⬟", pct: 73 },
  ];
  const revenue = [42, 58, 51, 67, 72, 80, 75, 90, 84, 98, 88, 105];
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const batches = [
    { name: "B7 — Full-Stack", students: 24, prog: 68, status: "active", color: "var(--plasma)" },
    { name: "B8 — Neural AI/ML", students: 30, prog: 42, status: "active", color: "#a78bfa" },
    { name: "B9 — Cloud Ops", students: 18, prog: 21, status: "new", color: "var(--acid)" },
    { name: "B6 — CyberSec", students: 22, prog: 94, status: "closing", color: "var(--solar)" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gridTemplateRows: "auto auto 1fr 1fr", gap: 16, padding: "20px 24px", height: "100%", overflowY: "auto" }}>

      <div style={{ gridColumn: "1/-1", marginBottom: 4 }}>
        <h1 style={{ fontSize: 28, fontFamily: "'Orbitron',monospace", fontWeight: 900, letterSpacing: 2, marginBottom: 6 }} className="holo-text">SYSTEM ADMIN ◆</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <Badge label="ARIVUON v3.2.1" color="var(--acid)" />
          <Badge label="ALL SYSTEMS NOMINAL" color="var(--plasma)" dot />
          <Badge label="1842 USERS ONLINE" color="#a78bfa" />
        </div>
      </div>

      {/* KPI Cards */}
      {kpis.map((k, i) => (
        <HoloCard key={i} style={{ padding: 22 }} accent={k.color} glow>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <span style={{ color: "var(--text-dim)", fontSize: 9, fontFamily: "'Share Tech Mono',monospace", letterSpacing: 2 }}>{k.label}</span>
            <span style={{ fontSize: 16, filter: `drop-shadow(0 0 8px ${k.color})` }}>{k.icon}</span>
          </div>
          <div style={{ fontSize: 30, fontWeight: 900, fontFamily: "'Orbitron',monospace", color: k.color, marginBottom: 6, lineHeight: 1, textShadow: `0 0 30px ${k.color}44` }}>{k.val}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 10, color: "var(--acid)", fontFamily: "'Share Tech Mono',monospace" }}>{k.delta} THIS CYCLE</span>
          </div>
          <QuantumBar pct={k.pct} color={k.color} height={3} />
        </HoloCard>
      ))}

      {/* Revenue Holo Chart */}
      <HoloCard style={{ gridColumn: "1/3", padding: 22 }} accent="var(--acid)">
        <SectionLabel text="Revenue Flux — 2025 Cycle" color="var(--acid)" icon="◆" />
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 110 }}>
          {revenue.map((v, i) => {
            const isMax = v === Math.max(...revenue);
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: "100%", borderRadius: "3px 3px 0 0",
                  height: `${(v / 110) * 100}%`, minHeight: 6,
                  background: isMax
                    ? `linear-gradient(180deg,var(--plasma),var(--acid))`
                    : `linear-gradient(180deg,var(--acid),rgba(57,255,20,0.2))`,
                  boxShadow: isMax ? "0 0 16px var(--plasma)" : `0 0 8px rgba(57,255,20,0.25)`,
                  transition: "all 0.3s",
                  position: "relative",
                  cursor: "pointer",
                }}
                  onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.5)"; }}
                  onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; }} />
                <span style={{ fontSize: 7, color: "var(--text-dim)", fontFamily: "'Share Tech Mono',monospace" }}>{months[i]}</span>
              </div>
            );
          })}
        </div>
      </HoloCard>

      {/* Batch Status */}
      <HoloCard style={{ gridColumn: "3/5", padding: 22 }} accent="#a78bfa">
        <SectionLabel text="Batch Deployment Status" color="#a78bfa" icon="⬢" />
        {batches.map((b, i) => (
          <div key={i} style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
              <span style={{ color: "rgba(200,230,240,0.75)", fontSize: 12, fontFamily: "'Rajdhani',sans-serif", fontWeight: 500 }}>{b.name}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ color: "var(--text-dim)", fontSize: 9, fontFamily: "'Share Tech Mono',monospace" }}>{b.students} ops</span>
                <Badge label={b.status.toUpperCase()} color={b.color} />
              </div>
            </div>
            <QuantumBar pct={b.prog} color={b.color} height={3} />
          </div>
        ))}
      </HoloCard>

      {/* User Management */}
      <HoloCard style={{ gridColumn: "1/3", padding: 22 }} accent="var(--plasma)">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <SectionLabel text="User Registry" color="var(--plasma)" />
          <button style={{ padding: "7px 16px", borderRadius: 10, background: "rgba(0,245,255,0.1)", border: "1px solid rgba(0,245,255,0.25)", color: "var(--plasma)", fontSize: 9, cursor: "pointer", fontFamily: "'Share Tech Mono',monospace", letterSpacing: 2 }}>+ REGISTER</button>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {[
            { role: "OPERATORS", count: "1,842", color: "var(--plasma)" },
            { role: "TRAINERS", count: "28", color: "#a78bfa" },
            { role: "ADMINS", count: "4", color: "var(--solar)" },
          ].map((r, i) => (
            <div key={i} style={{ flex: 1, padding: "16px 14px", borderRadius: 14, background: `${r.color}08`, border: `1px solid ${r.color}20`, textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: r.color, fontFamily: "'Orbitron',monospace", marginBottom: 6, textShadow: `0 0 20px ${r.color}44` }}>{r.count}</div>
              <div style={{ fontSize: 8, color: "var(--text-dim)", fontFamily: "'Share Tech Mono',monospace", letterSpacing: 2 }}>{r.role}</div>
            </div>
          ))}
        </div>
      </HoloCard>

      {/* System Health */}
      <HoloCard style={{ gridColumn: "3/5", padding: 22 }} accent="var(--solar)">
        <SectionLabel text="System Diagnostics" color="var(--solar)" icon="◎" />
        {[
          { name: "API Gateway", status: "NOMINAL", lat: "12ms", pct: 98 },
          { name: "Video Stream Core", status: "NOMINAL", lat: "34ms", pct: 96 },
          { name: "Neural AI Engine", status: "NOMINAL", lat: "89ms", pct: 91 },
          { name: "Database Cluster", status: "DEGRADED", lat: "210ms", pct: 62 },
          { name: "Auth Service", status: "NOMINAL", lat: "8ms", pct: 100 },
        ].map((s, i) => {
          const ok = s.status === "NOMINAL";
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: ok ? "var(--acid)" : "var(--solar)", boxShadow: `0 0 8px ${ok ? "var(--acid)" : "var(--solar)"}` }} />
              <span style={{ flex: 1, color: "rgba(200,230,240,0.65)", fontSize: 11, fontFamily: "'Rajdhani',sans-serif", fontWeight: 500 }}>{s.name}</span>
              <div style={{ width: 50 }}><QuantumBar pct={s.pct} color={ok ? "var(--acid)" : "var(--solar)"} height={2} /></div>
              <span style={{ color: ok ? "var(--acid)" : "var(--solar)", fontSize: 8, fontFamily: "'Share Tech Mono',monospace", minWidth: 52, textAlign: "right" }}>{s.status}</span>
              <span style={{ color: "var(--text-dim)", fontSize: 8, fontFamily: "'Share Tech Mono',monospace", minWidth: 32 }}>{s.lat}</span>
            </div>
          );
        })}
      </HoloCard>
    </div>
  );
}

// ── TOPBAR ─────────────────────────────────────────────────────────────────────
function TopBar({ view, setView, onCmd }) {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      height: 52, display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", borderBottom: "1px solid rgba(0,245,255,0.07)",
      background: "rgba(5,10,20,0.9)", backdropFilter: "blur(24px)", zIndex: 10,
      position: "relative",
    }}>
      {/* Left: View Switcher */}
      <div style={{ display: "flex", gap: 4 }}>
        {[
          { id: "student", label: "NEURAL HUB", c: "var(--plasma)" },
          { id: "trainer", label: "TRAINER OPS", c: "#a78bfa" },
          { id: "admin", label: "ADMIN SYS", c: "var(--acid)" },
        ].map(v => (
          <button key={v.id} onClick={() => setView(v.id)} style={{
            padding: "6px 14px", borderRadius: 8, fontSize: 9, cursor: "pointer",
            fontFamily: "'Share Tech Mono',monospace", letterSpacing: 2,
            background: view === v.id ? `${v.c}18` : "transparent",
            border: `1px solid ${view === v.id ? `${v.c}40` : "rgba(255,255,255,0.05)"}`,
            color: view === v.id ? v.c : "rgba(200,230,240,0.25)",
            transition: "all 0.2s",
          }}>{v.label}</button>
        ))}
      </div>

      {/* Center: Matrix rain decorative */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ height: 1, width: 80, background: "linear-gradient(90deg,transparent,rgba(0,245,255,0.2),transparent)" }} />
        <span style={{ color: "var(--plasma)", fontSize: 11, fontFamily: "'Orbitron',monospace", letterSpacing: 3, opacity: 0.6, animation: "flicker 8s ease infinite" }}>ARIVUON</span>
        <div style={{ height: 1, width: 80, background: "linear-gradient(90deg,transparent,rgba(0,245,255,0.2),transparent)" }} />
      </div>

      {/* Right: Tools */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Live clock */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 8, background: "rgba(0,245,255,0.04)", border: "1px solid rgba(0,245,255,0.1)" }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--acid)", boxShadow: "0 0 6px var(--acid)" }} />
          <span style={{ color: "var(--plasma)", fontSize: 11, fontFamily: "'Share Tech Mono',monospace", letterSpacing: 1 }}>{time}</span>
        </div>

        {/* Cmd+K */}
        <button onClick={onCmd} style={{
          display: "flex", alignItems: "center", gap: 10, padding: "6px 14px",
          borderRadius: 10, background: "rgba(0,245,255,0.04)", border: "1px solid rgba(0,245,255,0.1)",
          color: "rgba(200,230,240,0.4)", cursor: "pointer", fontSize: 10,
          fontFamily: "'Share Tech Mono',monospace", letterSpacing: 1.5, transition: "all 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,245,255,0.3)"; e.currentTarget.style.color = "var(--plasma)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,245,255,0.1)"; e.currentTarget.style.color = "rgba(200,230,240,0.4)"; }}>
          <span>SEARCH NEURAL PATHS</span>
          <span style={{ padding: "2px 7px", borderRadius: 5, background: "rgba(0,245,255,0.1)", fontSize: 9, color: "var(--plasma)" }}>⌘K</span>
        </button>

        {/* Notification */}
        <div style={{ position: "relative", cursor: "pointer" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,245,255,0.25)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}>🔔</div>
          <div style={{ position: "absolute", top: -2, right: -2, width: 9, height: 9, borderRadius: "50%", background: "var(--nova)", border: "2px solid var(--void)", boxShadow: "0 0 8px var(--nova)" }} />
        </div>

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 12, borderLeft: "1px solid rgba(0,245,255,0.1)" }}>
          <div style={{ width: 28, height: 28, borderRadius: 9, background: "linear-gradient(135deg,rgba(0,245,255,0.2),rgba(167,139,250,0.2))", border: "1px solid rgba(0,245,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, boxShadow: "0 0 12px rgba(0,245,255,0.3)" }}>⬡</div>
          <div>
            <div style={{ fontSize: 11, fontFamily: "'Orbitron',monospace", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2, letterSpacing: 1 }}>ARIVUON</div>
            <div style={{ fontSize: 7, color: "var(--text-dim)", fontFamily: "'Share Tech Mono',monospace", letterSpacing: 2 }}>FUTURE OF LEARNING</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── FLOATING AI ────────────────────────────────────────────────────────────────
function FloatingAI() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 200 }}>
      {open && (
        <div style={{ position: "absolute", bottom: 66, right: 0, width: 260, animation: "fadeSlideUp 0.2s ease" }}>
          <HoloCard style={{ padding: 14, border: "1px solid rgba(255,45,120,0.3)", boxShadow: "0 0 40px rgba(255,45,120,0.15)" }} accent="var(--nova)">
            <div style={{ color: "var(--nova)", fontSize: 9, fontFamily: "'Share Tech Mono',monospace", letterSpacing: 2, marginBottom: 10 }}>ARIA QUICK ACCESS</div>
            <input placeholder="Ask neural pathways…" style={{ width: "100%", background: "rgba(255,45,120,0.06)", border: "1px solid rgba(255,45,120,0.2)", borderRadius: 10, padding: "9px 12px", color: "var(--text-primary)", fontSize: 12, outline: "none", fontFamily: "'Rajdhani',sans-serif" }} />
          </HoloCard>
        </div>
      )}
      <div onClick={() => setOpen(o => !o)} style={{
        width: 50, height: 50, borderRadius: "50%", cursor: "pointer",
        background: "linear-gradient(135deg,var(--nova),#a78bfa)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        boxShadow: "0 0 30px rgba(255,45,120,0.4), 0 0 60px rgba(255,45,120,0.15)",
        animation: "drift 5s ease-in-out infinite",
        position: "relative",
      }}>
        ◉
        <div style={{ position: "absolute", inset: -4, borderRadius: "50%", border: "1px solid rgba(255,45,120,0.3)", animation: "pulse-ring 2s ease infinite" }} />
        <div style={{ position: "absolute", inset: -8, borderRadius: "50%", border: "1px solid rgba(255,45,120,0.15)", animation: "pulse-ring 2s ease 0.5s infinite" }} />
      </div>
    </div>
  );
}

// ── ROOT ───────────────────────────────────────────────────────────────────────
export default function Arivuon() {
  const [view, setView] = useState("student");
  const [cmd, setCmd] = useState(false);

  useEffect(() => {
    const h = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmd(o => !o); }
      if (e.key === "Escape") setCmd(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const renderView = () => {
    if (view === "trainer") return <TrainerDashboard />;
    if (view === "admin") return <AdminDashboard />;
    return <StudentDashboard />;
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ display: "flex", height: "100vh", width: "100vw", background: "var(--void)", overflow: "hidden", position: "relative" }}>
        <NeuralMesh />

        {/* Subtle matrix rain */}
        <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
          {[8, 18, 36, 52, 68, 82, 91].map((l, i) => (
            <MatrixColumn key={i} left={`${l}%`} delay={i * 1.2} speed={4 + i * 0.5}
              chars={["0","1","A","F","◈","⬡","◆","0","1","E","B"][i % 11]} />
          ))}
        </div>

        {/* Sidebar */}
        <OrbitalNav active={view} setActive={setView} />

        {/* Main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", zIndex: 2, overflow: "hidden" }}>
          <TopBar view={view} setView={setView} onCmd={() => setCmd(true)} />
          <div style={{ flex: 1, overflow: "hidden" }}>
            {renderView()}
          </div>
        </div>

        <CmdPalette open={cmd} onClose={() => setCmd(false)} />
        <FloatingAI />
      </div>
    </>
  );
}