"use client";
import { useState, useEffect, useRef, useCallback } from "react";

/* ════════════════════════════════════════════════════════════════════════════
   ARIVUON — THE UNIVERSE PORTAL
   "When you enter, you never leave."

   Design Philosophy: COSMIC IMMERSION OPERATING SYSTEM
   ─ You are not using an app. You are INSIDE a living universe.
   ─ Every pixel breathes. Every interaction is a cosmic event.
   ─ The background IS the UI. The UI IS the universe.

   Visual Language: "Deep Space Neural Cosmos"
   ─ Wormhole tunnel entry sequence
   ─ Nebula aurora backgrounds that shift and breathe
   ─ 3D star parallax depth layers
   ─ Gravitational lens distortion effects  
   ─ Constellation course maps
   ─ Supernova progress indicators
   ─ Living planet orbs for each course
   ─ Crystalline holographic panels
   ─ Chromatic aberration glitch transitions
════════════════════════════════════════════════════════════════════════════ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@100;200;300;400;600;700;900&family=Teko:wght@300;400;500;600;700&family=VT323&family=Saira+Condensed:wght@100;200;300;400;700;900&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;width:100%;overflow:hidden;cursor:none}
:root{
  --cosmos:#020408;
  --nebula1:#0d1b2a;
  --nebula2:#1a0a2e;
  --star:#e8f4ff;
  --plasma:#00d4ff;
  --aurora1:#00ffcc;
  --aurora2:#7b2fff;
  --aurora3:#ff006e;
  --gold:#ffd700;
  --surface:rgba(8,20,40,0.75);
  --glass:rgba(0,212,255,0.04);
  --border:rgba(0,212,255,0.12);
}
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(0,212,255,0.3);border-radius:2px}

/* ── CURSOR ── */
#cursor{
  position:fixed;width:20px;height:20px;border-radius:50%;
  border:1px solid var(--plasma);pointer-events:none;z-index:99999;
  transform:translate(-50%,-50%);
  box-shadow:0 0 10px var(--plasma),0 0 20px rgba(0,212,255,0.3);
  transition:transform 0.1s ease,width 0.2s,height 0.2s;
  mix-blend-mode:screen;
}
#cursor-dot{
  position:fixed;width:4px;height:4px;border-radius:50%;
  background:var(--plasma);pointer-events:none;z-index:99999;
  transform:translate(-50%,-50%);
  box-shadow:0 0 6px var(--plasma);
}
body:hover #cursor{opacity:1}

/* ── KEYFRAMES ── */
@keyframes cosmicPulse{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.05)}}
@keyframes nebulaDrift{
  0%{background-position:0% 50%}
  50%{background-position:100% 50%}
  100%{background-position:0% 50%}
}
@keyframes starTwinkle{0%,100%{opacity:.2;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}
@keyframes orbitalSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes orbitalSpinR{from{transform:rotate(360deg)}to{transform:rotate(0deg)}}
@keyframes auroraShift{
  0%{filter:hue-rotate(0deg) brightness(1)}
  33%{filter:hue-rotate(30deg) brightness(1.2)}
  66%{filter:hue-rotate(-20deg) brightness(.9)}
  100%{filter:hue-rotate(0deg) brightness(1)}
}
@keyframes warpIn{
  0%{transform:scaleX(0) scaleY(0.3);opacity:0;filter:blur(20px)}
  60%{transform:scaleX(1.05) scaleY(1.05);opacity:1;filter:blur(0)}
  100%{transform:scaleX(1) scaleY(1);opacity:1;filter:blur(0)}
}
@keyframes slideUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes slideRight{from{transform:translateX(-30px);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes energyFlow{
  0%{background-position:0% 50%}
  100%{background-position:200% 50%}
}
@keyframes quantumFlicker{
  0%,100%{opacity:1} 8%{opacity:.4} 9%{opacity:1} 92%{opacity:1} 93%{opacity:.6} 94%{opacity:1}
}
@keyframes dataStream{
  0%{transform:translateY(-100%);opacity:0}
  10%{opacity:.8}
  90%{opacity:.4}
  100%{transform:translateY(200%);opacity:0}
}
@keyframes planetRotate{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes gravityPulse{
  0%,100%{box-shadow:0 0 30px var(--plasma),0 0 60px rgba(0,212,255,0.2),inset 0 0 30px rgba(0,212,255,0.05)}
  50%{box-shadow:0 0 60px var(--plasma),0 0 120px rgba(0,212,255,0.3),inset 0 0 50px rgba(0,212,255,0.1)}
}
@keyframes holoPan{0%{background-position:-200% center}100%{background-position:200% center}}
@keyframes cosmicEntrance{
  0%{transform:perspective(1000px) rotateX(20deg) scale(.9) translateY(40px);opacity:0;filter:blur(10px)}
  100%{transform:perspective(1000px) rotateX(0) scale(1) translateY(0);opacity:1;filter:blur(0)}
}
@keyframes pulseDot{
  0%{transform:scale(1);opacity:1}
  100%{transform:scale(3);opacity:0}
}
@keyframes wormhole{
  0%{transform:scale(0) rotate(0deg);opacity:0;filter:blur(40px)}
  30%{opacity:1}
  100%{transform:scale(1) rotate(720deg);opacity:1;filter:blur(0)}
}
@keyframes breathe{
  0%,100%{transform:scale(1);opacity:.7}
  50%{transform:scale(1.08);opacity:1}
}
@keyframes scanH{from{transform:translateY(-100%)}to{transform:translateY(200%)}}
@keyframes countUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes particleDrift{
  0%{transform:translateY(0) translateX(0) scale(1);opacity:.8}
  50%{transform:translateY(-20px) translateX(10px) scale(1.3);opacity:.4}
  100%{transform:translateY(0) translateX(0) scale(1);opacity:.8}
}
@keyframes ringExpand{
  0%{transform:scale(.5);opacity:1}
  100%{transform:scale(2.5);opacity:0}
}

/* ── HOVER GLOW ── */
.cosmic-card{transition:all .4s cubic-bezier(.23,1,.32,1)}
.cosmic-card:hover{transform:translateY(-6px) scale(1.01);border-color:rgba(0,212,255,.35)!important;box-shadow:0 30px 80px rgba(0,0,0,.6),0 0 40px rgba(0,212,255,.15)!important}
.nav-orb:hover .nav-orb-inner{box-shadow:0 0 30px var(--plasma),0 0 60px rgba(0,212,255,.25)!important;transform:scale(1.15)!important}
.btn-cosmic{transition:all .3s ease;position:relative;overflow:hidden}
.btn-cosmic::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(0,212,255,.15),rgba(123,47,255,.15));opacity:0;transition:opacity .3s}
.btn-cosmic:hover::after{opacity:1}
.btn-cosmic:hover{transform:translateY(-2px);box-shadow:0 10px 40px rgba(0,212,255,.25)!important}
.holo-shimmer{
  background:linear-gradient(90deg,var(--plasma),var(--aurora1),var(--aurora2),var(--plasma));
  background-size:300% auto;
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  animation:holoPan 6s linear infinite;
}
.energy-bar{
  background:linear-gradient(90deg,var(--aurora2)88,var(--plasma),var(--aurora1),var(--plasma),var(--aurora2)88);
  background-size:300% 100%;
  animation:energyFlow 3s linear infinite;
}
`;

/* ── COSMIC BACKGROUND ENGINE ── */
function CosmosEngine() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    let t = 0;

    // Stars in 3 depth layers
    const layers = [
      Array.from({ length: 200 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * .8 + .1, speed: .05, phase: Math.random() * Math.PI * 2, color: [255, 255, 255] })),
      Array.from({ length: 80 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.2 + .3, speed: .15, phase: Math.random() * Math.PI * 2, color: [180, 220, 255] })),
      Array.from({ length: 30 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 2 + .5, speed: .4, phase: Math.random() * Math.PI * 2, color: [0, 212, 255] })),
    ];

    // Nebula particles
    const nebulas = Array.from({ length: 6 }, (_, i) => ({
      x: Math.random() * W, y: Math.random() * H,
      rx: Math.random() * 300 + 200, ry: Math.random() * 200 + 100,
      color: [[0, 180, 255], [120, 0, 255], [255, 0, 110], [0, 255, 200], [80, 0, 200], [0, 255, 150]][i],
      opacity: Math.random() * .04 + .02,
      speed: Math.random() * .003 + .001,
      phase: Math.random() * Math.PI * 2,
    }));

    // Shooting stars
    const shoots = [];
    let raf;

    function spawnShoot() {
      if (Math.random() < .003) {
        shoots.push({
          x: Math.random() * W, y: Math.random() * H * .4,
          vx: (Math.random() * 3 + 2) * (Math.random() < .5 ? 1 : -1),
          vy: Math.random() * 2 + 1,
          life: 1, maxLife: 60 + Math.random() * 40,
          len: Math.random() * 80 + 40,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      // Deep space base
      const base = ctx.createRadialGradient(W * .5, H * .5, 0, W * .5, H * .5, W * .8);
      base.addColorStop(0, "rgba(5,12,25,0)");
      base.addColorStop(1, "rgba(2,4,8,0)");
      ctx.fillStyle = base; ctx.fillRect(0, 0, W, H);

      t += .008;

      // Nebula clouds
      nebulas.forEach(n => {
        n.x += Math.sin(t * n.speed * 10) * 0.3;
        n.y += Math.cos(t * n.speed * 7) * 0.2;
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.rx);
        const pulse = Math.sin(t + n.phase) * .5 + .5;
        g.addColorStop(0, `rgba(${n.color.join(',')},${n.opacity * (1 + pulse * .5)})`);
        g.addColorStop(.5, `rgba(${n.color.join(',')},${n.opacity * .5})`);
        g.addColorStop(1, `rgba(${n.color.join(',')},0)`);
        ctx.save();
        ctx.scale(1, n.ry / n.rx);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(n.x, n.y * (n.rx / n.ry), n.rx, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Stars
      layers.forEach((layer, li) => {
        layer.forEach(s => {
          const twinkle = Math.sin(t * 2 + s.phase) * .5 + .5;
          const alpha = .2 + twinkle * .8;
          const size = s.r * (1 + twinkle * .3);
          if (li === 2) {
            ctx.beginPath();
            ctx.arc(s.x, s.y, size * 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0,212,255,${alpha * .08})`;
            ctx.fill();
          }
          ctx.beginPath();
          ctx.arc(s.x, s.y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${s.color.join(',')},${alpha})`;
          ctx.fill();
        });
      });

      // Shooting stars
      spawnShoot();
      shoots.forEach((s, i) => {
        s.x += s.vx; s.y += s.vy; s.life++;
        const prog = s.life / s.maxLife;
        if (prog > 1) { shoots.splice(i, 1); return; }
        const alpha = prog < .3 ? prog / .3 : prog > .7 ? (1 - prog) / .3 : 1;
        const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * (s.len / Math.sqrt(s.vx * s.vx + s.vy * s.vy)), s.y - s.vy * (s.len / Math.sqrt(s.vx * s.vx + s.vy * s.vy)));
        grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
        grad.addColorStop(.5, `rgba(0,212,255,${alpha * .6})`);
        grad.addColorStop(1, "rgba(0,212,255,0)");
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 8, s.y - s.vy * 8);
        ctx.strokeStyle = grad; ctx.lineWidth = 1.5; ctx.stroke();
      });

      // Vignette
      const vig = ctx.createRadialGradient(W * .5, H * .5, H * .1, W * .5, H * .5, W * .7);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.7)");
      ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);

      raf = requestAnimationFrame(draw);
    }
    draw();
    const onR = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight };
    window.addEventListener("resize", onR);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onR) };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />
      {/* Horizontal scan line */}
      <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: "100%", height: "1px", background: "linear-gradient(90deg,transparent,rgba(0,212,255,0.06),rgba(0,212,255,0.12),rgba(0,212,255,0.06),transparent)", animation: "scanH 12s linear infinite" }} />
      </div>
      {/* Noise texture */}
      <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", opacity: .025, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "128px 128px" }} />
    </>
  );
}

/* ── CUSTOM CURSOR ── */
function CosmicCursor() {
  const cursorRef = useRef(null);
  const dotRef = useRef(null);
  useEffect(() => {
    let mx = 0, my = 0, cx = 0, cy = 0;
    const move = e => { mx = e.clientX; my = e.clientY; if (dotRef.current) { dotRef.current.style.left = mx + "px"; dotRef.current.style.top = my + "px" } };
    const animate = () => {
      cx += (mx - cx) * .15; cy += (my - cy) * .15;
      if (cursorRef.current) { cursorRef.current.style.left = cx + "px"; cursorRef.current.style.top = cy + "px" }
      requestAnimationFrame(animate);
    };
    window.addEventListener("mousemove", move);
    animate();
    return () => window.removeEventListener("mousemove", move);
  }, []);
  return (
    <>
      <div id="cursor" ref={cursorRef} />
      <div id="cursor-dot" ref={dotRef} />
    </>
  );
}

/* ── CRYSTAL PANEL ── */
function CrystalPanel({ children, style = {}, accent = "var(--plasma)", glow = false, anim = "", delay = 0 }) {
  return (
    <div className={`cosmic-card ${anim}`} style={{
      background: "rgba(6,14,28,0.82)",
      border: `1px solid rgba(0,212,255,0.1)`,
      borderRadius: 24,
      backdropFilter: "blur(40px) saturate(1.5)",
      position: "relative", overflow: "hidden",
      boxShadow: glow ? `0 0 0 1px ${accent}18,0 20px 60px rgba(0,0,0,0.6),0 0 80px ${accent}06` : "0 20px 60px rgba(0,0,0,0.5)",
      animationDelay: `${delay}s`, animationFillMode: "both",
      ...style,
    }}>
      {/* Inner glow top */}
      <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: `linear-gradient(90deg,transparent,${accent}60,transparent)` }} />
      {/* Corner crystals */}
      {[[0, 0, "20px 0 0 0"], [0, "auto", "0 20px 0 0"], ["auto", 0, "0 0 0 20px"], ["auto", "auto", "0 0 20px 0"]].map(([t, r, br], i) => (
        <div key={i} style={{ position: "absolute", top: t || undefined, bottom: t === "auto" ? 0 : undefined, right: r || undefined, left: r === "auto" ? 0 : undefined, width: 16, height: 16, borderRadius: br, border: `1px solid ${accent}50`, opacity: .7 }} />
      ))}
      {children}
    </div>
  );
}

/* ── PLANET ORB ── */
function PlanetOrb({ color1, color2, color3, size = 60, pct, label, icon, onClick }) {
  return (
    <div onClick={onClick} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, cursor: "pointer" }} className="nav-orb">
      <div style={{ position: "relative", width: size, height: size }} className="nav-orb-inner">
        {/* Orbital ring */}
        <div style={{ position: "absolute", inset: -8, borderRadius: "50%", border: `1px solid ${color1}25`, animation: "orbitalSpin 8s linear infinite" }} />
        <div style={{ position: "absolute", inset: -14, borderRadius: "50%", border: `1px dashed ${color2}15`, animation: "orbitalSpinR 14s linear infinite" }} />
        {/* Glow halo */}
        <div style={{ position: "absolute", inset: -2, borderRadius: "50%", boxShadow: `0 0 20px ${color1}40`, animation: "breathe 3s ease-in-out infinite" }} />
        {/* Planet */}
        <div className="nav-orb-inner" style={{
          width: size, height: size, borderRadius: "50%",
          background: `radial-gradient(circle at 30% 30%,${color1},${color2} 50%,${color3} 100%)`,
          boxShadow: `0 0 20px ${color1}50,inset -${size * .2}px -${size * .1}px ${size * .3}px rgba(0,0,0,0.5)`,
          transition: "all .3s ease", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * .3,
        }}>{icon}</div>
        {/* Progress ring */}
        <svg style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }} width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={size / 2 - 3} fill="none" stroke={`${color1}20`} strokeWidth={2} />
          <circle cx={size / 2} cy={size / 2} r={size / 2 - 3} fill="none" stroke={color1} strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * (size / 2 - 3) * pct / 100} ${2 * Math.PI * (size / 2 - 3)}`}
            style={{ filter: `drop-shadow(0 0 4px ${color1})` }} />
        </svg>
      </div>
      <span style={{ fontSize: 9, color: "rgba(200,230,240,0.5)", fontFamily: "'Exo 2',sans-serif", letterSpacing: 2, textTransform: "uppercase", textAlign: "center" }}>{label}</span>
    </div>
  );
}

/* ── WARP BADGE ── */
function WarpBadge({ text, color = "var(--plasma)", pulse = false }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 6, background: `${color}10`, border: `1px solid ${color}28`, fontSize: 9, fontFamily: "'Exo 2',sans-serif", color, letterSpacing: 2, textTransform: "uppercase" }}>
      {pulse && <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}`, display: "inline-block", position: "relative" }}>
        <span style={{ position: "absolute", inset: -3, borderRadius: "50%", border: `1px solid ${color}`, animation: "ringExpand 1.5s ease infinite" }} />
      </span>}
      {text}
    </span>
  );
}

/* ── ENERGY BAR ── */
function EnergyBar({ pct, color = "var(--plasma)", h = 3 }) {
  return (
    <div style={{ height: h, borderRadius: h, background: "rgba(255,255,255,0.04)", overflow: "hidden", position: "relative" }}>
      <div style={{
        height: "100%", width: `${pct}%`, borderRadius: h,
        background: `linear-gradient(90deg,${color}66,${color},${color}aa)`,
        backgroundSize: "300% 100%",
        animation: "energyFlow 2s linear infinite",
        boxShadow: `0 0 10px ${color}66`,
        transition: "width 1.5s cubic-bezier(.4,0,.2,1)",
      }} />
    </div>
  );
}

/* ── COSMIC METRIC ── */
function CosmicMetric({ val, label, color, size = 70, pct, icon }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg style={{ position: "absolute", inset: 0, animation: "orbitalSpin 20s linear infinite" }} width={size} height={size}>
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const x1 = size / 2 + (r + 1) * Math.cos(a), y1 = size / 2 + (r + 1) * Math.sin(a);
            const x2 = size / 2 + (r + 4) * Math.cos(a), y2 = size / 2 + (r + 4) * Math.sin(a);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={`${color}${i % 3 === 0 ? "80" : "25"}`} strokeWidth={i % 3 === 0 ? 1.5 : .5} />;
          })}
        </svg>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}18`} strokeWidth={5} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct / 100)}
            style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: "stroke-dashoffset 1.5s ease" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {icon ? <span style={{ fontSize: 18 }}>{icon}</span> : <span style={{ fontSize: 14, fontWeight: 700, color, fontFamily: "'Teko',sans-serif", letterSpacing: 1 }}>{val}</span>}
        </div>
      </div>
      <span style={{ fontSize: 9, color: "rgba(200,230,240,0.4)", fontFamily: "'Exo 2',sans-serif", letterSpacing: 2, textAlign: "center", textTransform: "uppercase", lineHeight: 1.3 }}>{label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   WORMHOLE ENTRY SEQUENCE
═══════════════════════════════════════════════════════════════ */
function WormholeEntry({ onComplete }) {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState(0); // 0=tunnel 1=text 2=done
  const [text, setText] = useState("");
  const full = "ARIVUON UNIVERSE — INITIALIZING NEURAL PATHWAYS...";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const W = canvas.width, H = canvas.height;
    let t = 0, raf, done = false;

    function draw() {
      ctx.fillStyle = "rgba(2,4,8,0.15)";
      ctx.fillRect(0, 0, W, H);
      t += .03;

      // Wormhole rings
      const rings = 60;
      for (let i = 0; i < rings; i++) {
        const z = ((t * 50 + i * 8) % 400);
        const scale = z / 400;
        const r = scale * Math.min(W, H) * .7;
        const alpha = (1 - scale) * .8;
        const hue = 200 + i * 3 + t * 20;
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${hue},100%,70%,${alpha})`;
        ctx.lineWidth = (1 - scale) * 3;
        ctx.stroke();

        // Radial lines in tunnel
        if (i % 5 === 0) {
          for (let j = 0; j < 8; j++) {
            const angle = (j / 8) * Math.PI * 2 + t * .5;
            ctx.beginPath();
            ctx.moveTo(W / 2 + r * Math.cos(angle), H / 2 + r * Math.sin(angle));
            const r2 = ((z + 8) / 400) * Math.min(W, H) * .7;
            ctx.lineTo(W / 2 + r2 * Math.cos(angle), H / 2 + r2 * Math.sin(angle));
            ctx.strokeStyle = `hsla(${hue + 20},100%,80%,${alpha * .3})`;
            ctx.lineWidth = .5;
            ctx.stroke();
          }
        }
      }

      // Center burst
      const cg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 80);
      cg.addColorStop(0, "rgba(0,212,255,0.9)");
      cg.addColorStop(.3, "rgba(123,47,255,0.4)");
      cg.addColorStop(1, "rgba(0,212,255,0)");
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, 80, 0, Math.PI * 2);
      ctx.fill();

      if (!done) raf = requestAnimationFrame(draw);
    }
    draw();
    setTimeout(() => { done = true; cancelAnimationFrame(raf); setPhase(1); }, 2200);
    return () => { done = true; cancelAnimationFrame(raf) };
  }, []);

  // Typewriter
  useEffect(() => {
    if (phase !== 1) return;
    let i = 0;
    const id = setInterval(() => {
      setText(full.slice(0, i));
      i++;
      if (i > full.length) { clearInterval(id); setTimeout(() => setPhase(2), 600); }
    }, 28);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => { if (phase === 2) setTimeout(onComplete, 800); }, [phase]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9998, background: "#020408", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", animation: phase === 2 ? "fadeIn .8s ease reverse forwards" : "" }} >
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />
      {phase >= 1 && (
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", animation: "slideUp .6s ease" }}>
          <div style={{ fontSize: 56, fontFamily: "'Teko',sans-serif", fontWeight: 700, letterSpacing: 8, marginBottom: 16 }} className="holo-shimmer">ARIVUON</div>
          <div style={{ fontSize: 11, fontFamily: "'Exo 2',monospace", color: "var(--plasma)", letterSpacing: 4, opacity: .8, minHeight: 20 }}>{text}<span style={{ animation: "quantumFlicker .5s infinite" }}>█</span></div>
          <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 20 }}>
            {["NEURAL", "COSMOS", "PORTAL"].map((w, i) => <WarpBadge key={w} text={w} color={["var(--plasma)", "var(--aurora2)", "var(--aurora1)"][i]} />)}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CONSTELLATION SIDEBAR
═══════════════════════════════════════════════════════════════ */
const NAV_ITEMS = [
  { id: "student", icon: "🌌", label: "COSMOS HUB", color: "var(--plasma)" },
  { id: "courses", icon: "🪐", label: "COURSE WORLDS", color: "#a78bfa" },
  { id: "sessions", icon: "⚡", label: "LIVE SESSIONS", color: "var(--aurora1)" },
  { id: "trainer", icon: "🌟", label: "TRAINER CMD", color: var_or("#ffd700") },
  { id: "admin", icon: "🔮", label: "ADMIN CORE", color: "var(--aurora3)" },
  { id: "ai", icon: "🤖", label: "ARIA AI", color: "#ff6b9d" },
];
function var_or(v) { return v; }

function ConstellationNav({ active, setActive }) {
  const [hov, setHov] = useState(null);
  return (
    <div style={{ width: 78, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0", gap: 4, background: "rgba(3,8,18,0.95)", borderRight: "1px solid rgba(0,212,255,0.07)", zIndex: 10, position: "relative" }}>
      {/* Logo */}
      <div style={{ marginBottom: 28, position: "relative" }}>
        <div style={{ width: 46, height: 46, borderRadius: 15, background: "linear-gradient(135deg,rgba(0,212,255,0.2),rgba(123,47,255,0.2))", border: "1px solid rgba(0,212,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 0 30px rgba(0,212,255,0.25)", cursor: "pointer", animation: "gravityPulse 3s ease-in-out infinite" }}>⬡</div>
        <div style={{ position: "absolute", inset: -4, borderRadius: 19, border: "1px solid rgba(0,212,255,0.1)", animation: "orbitalSpin 10s linear infinite" }} />
      </div>

      {NAV_ITEMS.map(item => {
        const isActive = active === item.id;
        const isHov = hov === item.id;
        return (
          <div key={item.id} style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center", marginBottom: 2 }}>
            {/* Tooltip */}
            {isHov && !isActive && (
              <div style={{ position: "absolute", left: "calc(100% + 14px)", top: "50%", transform: "translateY(-50%)", background: "rgba(3,8,18,0.98)", border: `1px solid ${item.color}40`, borderRadius: 10, padding: "8px 14px", whiteSpace: "nowrap", zIndex: 100, fontFamily: "'Exo 2',sans-serif", fontSize: 10, color: item.color, letterSpacing: 2, boxShadow: `0 8px 30px rgba(0,0,0,0.6),0 0 20px ${item.color}15`, animation: "warpIn .15s ease" }}>
                {item.label}
                <div style={{ position: "absolute", right: "100%", top: "50%", transform: "translateY(-50%)", borderWidth: "5px 5px 5px 0", borderStyle: "solid", borderColor: `transparent ${item.color}40 transparent transparent` }} />
              </div>
            )}
            <div onClick={() => setActive(item.id)} onMouseEnter={() => setHov(item.id)} onMouseLeave={() => setHov(null)} style={{
              width: 50, height: 50, borderRadius: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
              transition: "all .25s cubic-bezier(.4,0,.2,1)",
              background: isActive ? `${item.color}18` : isHov ? `${item.color}0c` : "transparent",
              border: `1px solid ${isActive ? `${item.color}45` : "transparent"}`,
              boxShadow: isActive ? `0 0 20px ${item.color}25,inset 0 0 20px ${item.color}08` : "none",
              transform: isActive ? "scale(1.1)" : isHov ? "scale(1.05)" : "scale(1)",
              filter: isActive ? `drop-shadow(0 0 8px ${item.color})` : "none",
            }}>{item.icon}</div>
          </div>
        );
      })}

      <div style={{ flex: 1 }} />
      {/* Constellation dots */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, marginBottom: 10 }}>
        {[.8, .4, .6].map((o, i) => <div key={i} style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--plasma)", opacity: o, boxShadow: "0 0 4px var(--plasma)" }} />)}
      </div>
      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,var(--plasma),var(--aurora2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, fontFamily: "'Teko',sans-serif", color: "#000", cursor: "pointer", boxShadow: "0 0 16px rgba(0,212,255,0.4)" }}>A</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMMAND PALETTE
═══════════════════════════════════════════════════════════════ */
function CosmicCmd({ open, onClose }) {
  const [q, setQ] = useState("");
  const cmds = [
    { icon: "🌌", text: "Enter Neural Cosmos Dashboard", tag: "HUB", c: "var(--plasma)" },
    { icon: "⚡", text: "Launch Live Session Now", tag: "LIVE", c: "var(--aurora1)" },
    { icon: "🤖", text: "Open ARIA AI Consciousness", tag: "AI", c: "#ff6b9d)" },
    { icon: "🪐", text: "Explore Course Worlds", tag: "LEARN", c: "#a78bfa" },
    { icon: "🔮", text: "Admin Universe Control", tag: "SYS", c: "var(--aurora3)" },
    { icon: "🌟", text: "Trainer Command Bridge", tag: "CTRL", c: "var(--gold)" },
    { icon: "📡", text: "Batch Signal Analytics", tag: "DATA", c: "var(--aurora1)" },
  ].filter(c => c.text.toLowerCase().includes(q.toLowerCase()));
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9990, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 90 }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(20px)" }} />
      <CrystalPanel style={{ width: 620, zIndex: 1, border: "1px solid rgba(0,212,255,0.3)", boxShadow: "0 0 120px rgba(0,212,255,0.12),0 60px 120px rgba(0,0,0,0.7)", animation: "warpIn .2s ease" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(0,212,255,0.1)", display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ color: "var(--plasma)", fontFamily: "'Exo 2',monospace", fontSize: 18, opacity: .6 }}>⌘</span>
          <input autoFocus value={q} onChange={e => setQ(e.target.value)}
            placeholder="Navigate the cosmos... search anything"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--star)", fontFamily: "'Exo 2',sans-serif", fontSize: 15, letterSpacing: .3 }} />
          <WarpBadge text="ESC" color="var(--plasma)" />
        </div>
        <div style={{ padding: 10, maxHeight: 360, overflowY: "auto" }}>
          {cmds.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", borderRadius: 14, cursor: "pointer", transition: "all .15s", borderLeft: "2px solid transparent" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,212,255,0.06)"; e.currentTarget.style.borderLeftColor = "var(--plasma)" }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderLeftColor = "transparent" }}>
              <span style={{ fontSize: 20 }}>{c.icon}</span>
              <span style={{ flex: 1, color: "rgba(220,240,255,0.85)", fontSize: 14, fontFamily: "'Exo 2',sans-serif" }}>{c.text}</span>
              <WarpBadge text={c.tag} color={c.c} />
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 22px", borderTop: "1px solid rgba(0,212,255,0.06)", display: "flex", gap: 20 }}>
          {["↵ WARP IN", "↑↓ NAVIGATE", "ESC EXIT"].map(k => <span key={k} style={{ fontSize: 9, color: "rgba(200,230,240,0.25)", fontFamily: "'Exo 2',monospace", letterSpacing: 1.5 }}>{k}</span>)}
        </div>
      </CrystalPanel>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STUDENT COSMOS DASHBOARD
═══════════════════════════════════════════════════════════════ */
function CosmosHub() {
  const [aiInput, setAiInput] = useState("");
  const [aiMsgs, setAiMsgs] = useState([
    { from: "ai", text: "NEURAL LINK ESTABLISHED ◈ Aryan, your learning cosmos is active. You have a Deep Learning orbit in 47 minutes. Shall I prepare your neural pathways?" },
    { from: "user", text: "Show me my position in the learning galaxy" },
    { from: "ai", text: "You are currently in SECTOR 7 of the Neural Networks constellation. You've traversed 74% of this star system. Your velocity is 23% above the cohort average — you're burning bright. The next checkpoint: Convolutional Networks, 2 sessions ahead. 🌌" },
  ]);

  const courses = [
    { name: "Neural Networks", sub: "Deep Learning", pct: 74, c1: "#00d4ff", c2: "#0040ff", c3: "#001040", icon: "🧠", tag: "AI/ML" },
    { name: "Full-Stack Cosmos", sub: "React & Node", pct: 51, c1: "#a78bfa", c2: "#6d28d9", c3: "#2d0050", icon: "⚡", tag: "DEV" },
    { name: "Quantum Algorithms", sub: "CS Theory", pct: 88, c1: "#00ffcc", c2: "#00aa88", c3: "#003328", icon: "🔮", tag: "CS" },
    { name: "Cloud Nebula", sub: "Architecture", pct: 33, c1: "#ffd700", c2: "#ff8c00", c3: "#301800", icon: "☁️", tag: "CLOUD" },
  ];

  const sessions = [
    { time: "09:00", title: "Deep Learning Lab", trainer: "Dr. Arjun V.", live: true, planet: "🌌" },
    { time: "13:30", title: "React Quantum Patterns", trainer: "Priya S.", live: false, planet: "⚡" },
    { time: "16:00", title: "Algorithm Wars #14", trainer: "Vikram R.", live: false, planet: "🔮" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 300px", gridTemplateRows: "auto 1fr 1fr", gap: 16, padding: "18px 22px", height: "100%", overflowY: "auto" }}>

      {/* ── UNIVERSE HEADER ── */}
      <div style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, animation: "slideUp .6s ease .1s both" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
            <h1 style={{ fontSize: 38, fontFamily: "'Teko',sans-serif", fontWeight: 700, letterSpacing: 4, lineHeight: 1 }} className="holo-shimmer">COSMOS HUB</h1>
            <WarpBadge text="ONLINE" color="var(--aurora1)" pulse />
            <WarpBadge text="3 ORBITS TODAY" color="var(--plasma)" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "rgba(200,230,240,0.3)", fontSize: 11, fontFamily: "'Exo 2',sans-serif", letterSpacing: 3 }}>NAVIGATOR:</span>
            <span style={{ color: "var(--plasma)", fontSize: 11, fontFamily: "'Exo 2',sans-serif", fontWeight: 600, letterSpacing: 2 }}>ARYAN KUMAR</span>
            <span style={{ color: "rgba(200,230,240,0.2)", fontSize: 11, fontFamily: "'Exo 2',monospace" }}>// SECTOR B7 // STELLAR RANK #4</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <CosmicMetric pct={87} val="14D" label="STREAK ORBIT" color="var(--gold)" size={68} />
          <CosmicMetric pct={91} val="91%" label="NEURAL SCORE" color="var(--plasma)" size={68} />
          <CosmicMetric pct={73} val="#4" label="GALAXY RANK" color="var(--aurora2)" size={68} />
        </div>
      </div>

      {/* ── TODAY'S ORBIT SCHEDULE ── */}
      <CrystalPanel style={{ padding: 22 }} glow anim="animate-in" delay={0.15}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "var(--plasma)", fontSize: 14 }}>▶</span>
            <span style={{ color: "var(--plasma)", fontSize: 10, fontFamily: "'Exo 2',sans-serif", letterSpacing: 3 }}>TODAY'S ORBIT LOG</span>
          </div>
          <WarpBadge text="ACTIVE" color="var(--aurora1)" pulse />
        </div>
        {sessions.map((s, i) => (
          <div key={i} className="cosmic-card" style={{
            display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 16, marginBottom: 10, cursor: "pointer",
            background: s.live ? "rgba(0,212,255,0.06)" : "rgba(255,255,255,0.02)",
            border: `1px solid ${s.live ? "rgba(0,212,255,0.25)" : "rgba(255,255,255,0.05)"}`,
            animationDelay: `${.2 + i * .1}s`, animationFillMode: "both",
            animation: `slideRight .5s ease ${.2 + i * .1}s both`,
          }}>
            <span style={{ fontSize: 22 }}>{s.planet}</span>
            <div style={{ textAlign: "center", minWidth: 38 }}>
              <div style={{ color: "rgba(200,230,240,0.35)", fontSize: 9, fontFamily: "'Exo 2',monospace", letterSpacing: 1 }}>{s.time}</div>
            </div>
            <div style={{ width: 2, height: 36, borderRadius: 1, background: s.live ? "var(--plasma)" : "rgba(255,255,255,0.08)", boxShadow: s.live ? "0 0 10px var(--plasma)" : "none" }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: "rgba(220,240,255,0.9)", fontSize: 13, fontFamily: "'Exo 2',sans-serif", fontWeight: 600, marginBottom: 3 }}>{s.title}</div>
              <div style={{ color: "rgba(200,230,240,0.35)", fontSize: 10, fontFamily: "'Exo 2',sans-serif" }}>{s.trainer}</div>
            </div>
            {s.live ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ position: "relative" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--aurora1)", boxShadow: "0 0 10px var(--aurora1)" }} />
                  <div style={{ position: "absolute", inset: -4, borderRadius: "50%", border: "1px solid var(--aurora1)", animation: "ringExpand 1.5s ease infinite" }} />
                </div>
                <WarpBadge text="LIVE" color="var(--aurora1)" />
              </div>
            ) : <WarpBadge text="QUEUED" color="rgba(200,230,240,0.2)" />}
          </div>
        ))}
      </CrystalPanel>

      {/* ── COURSE PLANET SYSTEM ── */}
      <CrystalPanel style={{ padding: 22 }} accent="#a78bfa" anim="animate-in" delay={0.2}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <span style={{ fontSize: 14 }}>🪐</span>
          <span style={{ color: "#a78bfa", fontSize: 10, fontFamily: "'Exo 2',sans-serif", letterSpacing: 3 }}>COURSE WORLDS</span>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(167,139,250,0.3),transparent)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-start", marginBottom: 18 }}>
          {courses.map((c, i) => (
            <PlanetOrb key={i} color1={c.c1} color2={c.c2} color3={c.c3} size={52} pct={c.pct} label={c.name} icon={c.icon}
              onClick={() => { }} />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {courses.map((c, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <WarpBadge text={c.tag} color={c.c1} />
                  <span style={{ color: "rgba(220,240,255,0.7)", fontSize: 12, fontFamily: "'Exo 2',sans-serif" }}>{c.sub}</span>
                </div>
                <span style={{ color: c.c1, fontSize: 13, fontFamily: "'Teko',sans-serif", fontWeight: 700, letterSpacing: 1 }}>{c.pct}%</span>
              </div>
              <EnergyBar pct={c.pct} color={c.c1} h={3} />
            </div>
          ))}
        </div>
      </CrystalPanel>

      {/* ── ARIA AI CONSCIOUSNESS ── */}
      <CrystalPanel style={{ gridColumn: "3/4", gridRow: "2/4", padding: 0, display: "flex", flexDirection: "column", overflow: "hidden" }} accent="#ff6b9d" glow anim="animate-in" delay={0.25}>
        <div style={{ padding: "16px 18px", borderBottom: "1px solid rgba(255,107,157,0.12)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: 40, height: 40, borderRadius: 14, background: "linear-gradient(135deg,rgba(255,107,157,0.25),rgba(123,47,255,0.25))", border: "1px solid rgba(255,107,157,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 0 20px rgba(255,107,157,0.2)" }}>◉</div>
            <div style={{ position: "absolute", inset: -3, borderRadius: 17, border: "1px solid rgba(255,107,157,0.2)", animation: "orbitalSpinR 5s linear infinite" }} />
            <div style={{ position: "absolute", inset: -7, borderRadius: 21, border: "1px dashed rgba(255,107,157,0.1)", animation: "orbitalSpin 9s linear infinite" }} />
          </div>
          <div>
            <div style={{ color: "rgba(220,240,255,0.9)", fontSize: 13, fontFamily: "'Teko',sans-serif", fontWeight: 600, letterSpacing: 3 }}>ARIA</div>
            <div style={{ color: "#ff6b9d", fontSize: 9, fontFamily: "'Exo 2',monospace", letterSpacing: 2 }}>AI CONSCIOUSNESS · AWAKE</div>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--aurora1)", boxShadow: "0 0 8px var(--aurora1)" }} />
        </div>

        <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
          {aiMsgs.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start", animation: `slideUp .3s ease ${i * .1}s both` }}>
              <div style={{
                maxWidth: "88%", padding: "11px 14px",
                borderRadius: m.from === "user" ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
                background: m.from === "user" ? "linear-gradient(135deg,rgba(0,212,255,0.1),rgba(123,47,255,0.1))" : "rgba(255,107,157,0.06)",
                border: `1px solid ${m.from === "user" ? "rgba(0,212,255,0.2)" : "rgba(255,107,157,0.15)"}`,
                color: "rgba(200,230,240,0.85)", fontSize: 12, lineHeight: 1.65,
                fontFamily: "'Exo 2',sans-serif", fontWeight: 300, letterSpacing: .3,
              }}>
                {m.from === "ai" && <div style={{ color: "#ff6b9d", fontSize: 8, fontFamily: "'Exo 2',monospace", letterSpacing: 3, marginBottom: 6 }}>ARIA RESPONSE:</div>}
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: "8px 14px", display: "flex", gap: 6, flexWrap: "wrap", borderTop: "1px solid rgba(255,107,157,0.08)" }}>
          {["What's next?", "Quiz me", "Explain concept", "Study plan"].map(s => (
            <button key={s} onClick={() => setAiInput(s)} style={{ padding: "4px 9px", borderRadius: 8, background: "rgba(255,107,157,0.07)", border: "1px solid rgba(255,107,157,0.18)", color: "#ff6b9d", fontSize: 9, cursor: "pointer", fontFamily: "'Exo 2',sans-serif", letterSpacing: 1, transition: "all .2s" }}
              onMouseEnter={e => { e.target.style.background = "rgba(255,107,157,0.15)" }}
              onMouseLeave={e => { e.target.style.background = "rgba(255,107,157,0.07)" }}>{s}</button>
          ))}
        </div>
        <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,107,157,0.08)", display: "flex", gap: 8 }}>
          <input value={aiInput} onChange={e => setAiInput(e.target.value)}
            placeholder="Ask ARIA anything across the cosmos…"
            style={{ flex: 1, background: "rgba(255,107,157,0.05)", border: "1px solid rgba(255,107,157,0.18)", borderRadius: 12, padding: "9px 13px", color: "rgba(220,240,255,0.9)", fontSize: 12, outline: "none", fontFamily: "'Exo 2',sans-serif" }} />
          <button className="btn-cosmic" style={{ width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg,#ff6b9d,#a78bfa)", border: "none", cursor: "pointer", fontSize: 14, boxShadow: "0 0 16px rgba(255,107,157,0.3)" }}>↑</button>
        </div>
      </CrystalPanel>

      {/* ── STELLAR ATTENDANCE ── */}
      <CrystalPanel style={{ padding: 22 }} accent="var(--gold)" anim="animate-in" delay={0.3}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <span style={{ fontSize: 14 }}>✦</span>
          <span style={{ color: "var(--gold)", fontSize: 10, fontFamily: "'Exo 2',sans-serif", letterSpacing: 3 }}>STELLAR ATTENDANCE</span>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(255,215,0,0.3),transparent)" }} />
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 80, marginBottom: 14 }}>
          {[{ d: "MON", v: 100 }, { d: "TUE", v: 85 }, { d: "WED", v: 60 }, { d: "THU", v: 100 }, { d: "FRI", v: 80 }, { d: "SAT", v: 90 }].map((a, i) => {
            const c = a.v >= 90 ? "var(--aurora1)" : a.v >= 70 ? "var(--plasma)" : a.v >= 50 ? "var(--gold)" : "var(--aurora3)";
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <div style={{ width: "100%", borderRadius: "3px 3px 0 0", height: `${a.v * .78}%`, minHeight: 4, background: `linear-gradient(180deg,${c},${c}33)`, boxShadow: `0 0 12px ${c}44`, transition: "height 1.5s cubic-bezier(.4,0,.2,1)", cursor: "pointer" }}
                  onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.5)" }}
                  onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)" }} />
                <span style={{ fontSize: 8, color: "rgba(200,230,240,0.3)", fontFamily: "'Exo 2',monospace" }}>{a.d}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[{ l: "PRESENT RATE", v: "86%", c: "var(--plasma)" }, { l: "STREAK", v: "14 DAYS", c: "var(--gold)" }, { l: "SESSIONS", v: "24/28", c: "var(--aurora1)" }, { l: "HOURS", v: "142H", c: "#a78bfa)" }].map((s, i) => (
            <div key={i} style={{ padding: "10px 12px", borderRadius: 12, background: `${s.c}08`, border: `1px solid ${s.c}15` }}>
              <div style={{ color: "rgba(200,230,240,0.3)", fontSize: 8, fontFamily: "'Exo 2',monospace", letterSpacing: 2, marginBottom: 4 }}>{s.l}</div>
              <div style={{ color: s.c, fontSize: 18, fontFamily: "'Teko',sans-serif", fontWeight: 600, letterSpacing: 1 }}>{s.v}</div>
            </div>
          ))}
        </div>
      </CrystalPanel>

      {/* ── BIOMETRICS ── */}
      <CrystalPanel style={{ padding: 22, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, alignContent: "start" }} accent="var(--aurora1)" anim="animate-in" delay={0.35}>
        <div style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 14 }}>◎</span>
          <span style={{ color: "var(--aurora1)", fontSize: 10, fontFamily: "'Exo 2',sans-serif", letterSpacing: 3 }}>BIOMETRIC VITALS</span>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(0,255,204,0.3),transparent)" }} />
        </div>
        {[
          { pct: 91, val: "91.4%", label: "NEURAL\nSCORE", c: "var(--plasma)" },
          { pct: 86, val: "86%", label: "ATTEND\nFLUX", c: "var(--aurora1)" },
          { pct: 85, val: "24/28", label: "MISSIONS\nDONE", c: "#a78bfa" },
          { pct: 71, val: "142h", label: "STUDY\nHOURS", c: "var(--gold)" },
        ].map((s, i) => (
          <CosmicMetric key={i} pct={s.pct} val={s.val} label={s.label} color={s.c} size={66} />
        ))}
      </CrystalPanel>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TRAINER COMMAND BRIDGE
═══════════════════════════════════════════════════════════════ */
function TrainerBridge() {
  const students = [
    { name: "Aryan K.", score: 91, attend: 86, status: "stellar", delta: "+4%" },
    { name: "Meera S.", score: 78, attend: 72, status: "orbit", delta: "-2%" },
    { name: "Rohan P.", score: 95, attend: 100, status: "stellar", delta: "+7%" },
    { name: "Divya N.", score: 62, attend: 55, status: "critical", delta: "-8%" },
    { name: "Karan T.", score: 84, attend: 90, status: "orbit", delta: "+3%" },
    { name: "Sneha R.", score: 88, attend: 95, status: "stellar", delta: "+5%" },
  ];
  const S = { stellar: { c: "var(--aurora1)", icon: "⭐" }, orbit: { c: "var(--plasma)", icon: "◎" }, "at-risk": { c: "var(--gold)", icon: "⚠" }, critical: { c: "var(--aurora3)", icon: "🔴" } };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "auto 1fr 1fr", gap: 16, padding: "18px 22px", height: "100%", overflowY: "auto" }}>
      <div style={{ gridColumn: "1/-1", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, animation: "slideUp .5s ease both" }}>
        <div>
          <h1 style={{ fontSize: 34, fontFamily: "'Teko',sans-serif", fontWeight: 700, letterSpacing: 4, marginBottom: 8 }} className="holo-shimmer">TRAINER COMMAND BRIDGE</h1>
          <div style={{ display: "flex", gap: 10 }}><WarpBadge text="BATCH B7" color="var(--plasma)" /><WarpBadge text="24 NAVIGATORS" color="#a78bfa" /><WarpBadge text="SESSION LIVE" color="var(--aurora1)" pulse /></div>
        </div>
        <button className="btn-cosmic" style={{ padding: "13px 26px", borderRadius: 14, background: "linear-gradient(135deg,rgba(0,212,255,0.12),rgba(123,47,255,0.12))", border: "1px solid rgba(0,212,255,0.3)", color: "var(--plasma)", fontSize: 11, fontFamily: "'Exo 2',sans-serif", letterSpacing: 3, cursor: "pointer", fontWeight: 700, boxShadow: "0 0 30px rgba(0,212,255,0.12)" }}>
          ▶ LAUNCH ORBIT
        </button>
      </div>

      <CrystalPanel style={{ padding: 22 }} glow anim="animate-in" delay={0.1}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <span style={{ color: "var(--plasma)", fontSize: 14 }}>⚡</span>
          <span style={{ color: "var(--plasma)", fontSize: 10, fontFamily: "'Exo 2',sans-serif", letterSpacing: 3 }}>SESSION CONTROLS</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
          {[{ i: "▶", l: "IGNITE", c: "var(--aurora1)" }, { i: "⏸", l: "PAUSE", c: "var(--gold)" }, { i: "📡", l: "ROLL CALL", c: "var(--plasma)" }, { i: "💬", l: "Q&A MODE", c: "#a78bfa" }, { i: "🎯", l: "QUIZ BEAM", c: "var(--aurora3)" }, { i: "📊", l: "WARP POLL", c: "var(--aurora1)" }].map((b, i) => (
            <button key={i} className="btn-cosmic" style={{ padding: "11px 8px", borderRadius: 12, background: `${b.c}0d`, border: `1px solid ${b.c}22`, color: b.c, cursor: "pointer", fontSize: 9, fontFamily: "'Exo 2',sans-serif", letterSpacing: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              {b.i} {b.l}
            </button>
          ))}
        </div>
        <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: "rgba(200,230,240,0.3)", fontSize: 9, fontFamily: "'Exo 2',monospace", letterSpacing: 2 }}>ORBIT PROGRESS</span>
            <span style={{ color: "var(--plasma)", fontSize: 10, fontFamily: "'Teko',sans-serif", letterSpacing: 1 }}>47:23 / 90:00</span>
          </div>
          <EnergyBar pct={52} color="var(--plasma)" h={4} />
        </div>
      </CrystalPanel>

      <CrystalPanel style={{ padding: 22 }} accent="var(--aurora1)">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <span style={{ fontSize: 14 }}>👥</span>
          <span style={{ color: "var(--aurora1)", fontSize: 10, fontFamily: "'Exo 2',sans-serif", letterSpacing: 3 }}>LIVE NAVIGATOR GRID</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 16 }}>
          <CosmicMetric pct={79} val="79%" label="ONLINE" color="var(--aurora1)" size={76} />
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <WarpBadge text="19 ACTIVE" color="var(--aurora1)" pulse />
            <WarpBadge text="3 DELAYED" color="var(--gold)" />
            <WarpBadge text="2 OFFLINE" color="var(--aurora3)" />
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {Array.from({ length: 24 }, (_, i) => {
            const c = i < 19 ? "var(--aurora1)" : i < 22 ? "var(--gold)" : "var(--aurora3)";
            return <div key={i} style={{ width: 26, height: 26, borderRadius: 8, background: `${c}12`, border: `1px solid ${c}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, color: c, fontFamily: "'Exo 2',monospace", cursor: "pointer", transition: "all .2s" }} onMouseEnter={e => { e.currentTarget.style.background = `${c}25` }} onMouseLeave={e => { e.currentTarget.style.background = `${c}12` }}>N{String(i + 1).padStart(2, "0")}</div>;
          })}
        </div>
      </CrystalPanel>

      <CrystalPanel style={{ padding: 22 }} accent="#a78bfa">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <span style={{ fontSize: 14 }}>🌟</span>
          <span style={{ color: "#a78bfa", fontSize: 10, fontFamily: "'Exo 2',sans-serif", letterSpacing: 3 }}>BATCH INTELLIGENCE</span>
        </div>
        {[{ k: "Batch Avg Velocity", v: "82.4%", t: "+4.2%", up: true, b: 82 }, { k: "Completion Orbit", v: "76%", t: "+1.8%", up: true, b: 76 }, { k: "Engagement Field", v: "HIGH", t: "↑ 12%", up: true, b: 85 }, { k: "Drift Risk", v: "2", t: "↓ 1", up: true, b: 8 }].map((m, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "rgba(200,230,240,0.55)", fontSize: 11, fontFamily: "'Exo 2',sans-serif" }}>{m.k}</span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ color: "rgba(220,240,255,0.9)", fontSize: 14, fontFamily: "'Teko',sans-serif", fontWeight: 600, letterSpacing: 1 }}>{m.v}</span>
                <span style={{ fontSize: 9, color: m.up ? "var(--aurora1)" : "var(--aurora3)", fontFamily: "'Exo 2',monospace" }}>{m.t}</span>
              </div>
            </div>
            <EnergyBar pct={m.b} color="#a78bfa" h={2} />
          </div>
        ))}
      </CrystalPanel>

      <CrystalPanel style={{ gridColumn: "1/-1", padding: 22 }} accent="var(--gold)">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <span style={{ fontSize: 14 }}>◆</span>
          <span style={{ color: "var(--gold)", fontSize: 10, fontFamily: "'Exo 2',sans-serif", letterSpacing: 3 }}>NAVIGATOR PERFORMANCE MATRIX</span>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(255,215,0,0.3),transparent)" }} />
        </div>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 5px" }}>
          <thead>
            <tr>{["NAVIGATOR", "NEURAL SCORE", "ORBIT FLUX", "MISSIONS", "STATUS", "DELTA", "ACTION"].map(h => (
              <th key={h} style={{ color: "rgba(200,230,240,0.25)", fontSize: 8, fontFamily: "'Exo 2',monospace", letterSpacing: 2, textAlign: "left", padding: "6px 12px", fontWeight: 400 }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {students.map((s, i) => {
              const st = S[s.status] || S.orbit;
              return (
                <tr key={i} className="cosmic-card" style={{ cursor: "pointer", animation: `slideUp .4s ease ${i * .07}s both` }}>
                  <td style={{ padding: "12px", borderRadius: "12px 0 0 12px", background: "rgba(255,255,255,0.02)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 10, background: `linear-gradient(135deg,${st.c}25,${st.c}08)`, border: `1px solid ${st.c}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontFamily: "'Teko',sans-serif", fontWeight: 700, color: st.c }}>{s.name[0]}</div>
                      <span style={{ color: "rgba(220,240,255,0.85)", fontSize: 12, fontFamily: "'Exo 2',sans-serif" }}>{s.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px", background: "rgba(255,255,255,0.02)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 40, height: 3, borderRadius: 2, overflow: "hidden", background: "rgba(255,255,255,0.04)" }}>
                        <div style={{ height: "100%", width: `${s.score}%`, background: "var(--plasma)", boxShadow: "0 0 6px var(--plasma)" }} />
                      </div>
                      <span style={{ color: "var(--plasma)", fontSize: 12, fontFamily: "'Teko',sans-serif", fontWeight: 600 }}>{s.score}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px", background: "rgba(255,255,255,0.02)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <EnergyBar pct={s.attend} color={s.attend > 80 ? "var(--aurora1)" : s.attend > 60 ? "var(--gold)" : "var(--aurora3)"} />
                      <span style={{ color: "rgba(200,230,240,0.4)", fontSize: 10, fontFamily: "'Exo 2',monospace", minWidth: 28 }}>{s.attend}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px", background: "rgba(255,255,255,0.02)", color: "rgba(200,230,240,0.35)", fontSize: 10, fontFamily: "'Exo 2',monospace" }}>{Math.round(s.score / 4)}/28</td>
                  <td style={{ padding: "12px", background: "rgba(255,255,255,0.02)" }}><WarpBadge text={s.status.toUpperCase()} color={st.c} /></td>
                  <td style={{ padding: "12px", background: "rgba(255,255,255,0.02)", color: s.delta.startsWith("+") ? "var(--aurora1)" : "var(--aurora3)", fontSize: 11, fontFamily: "'Teko',sans-serif", fontWeight: 600 }}>{s.delta}</td>
                  <td style={{ padding: "12px", borderRadius: "0 12px 12px 0", background: "rgba(255,255,255,0.02)" }}>
                    <button style={{ padding: "5px 12px", borderRadius: 8, background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", color: "var(--plasma)", fontSize: 9, cursor: "pointer", fontFamily: "'Exo 2',monospace", letterSpacing: 1 }}>VIEW →</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CrystalPanel>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN UNIVERSE CONTROL
═══════════════════════════════════════════════════════════════ */
function AdminUniverse() {
  const kpis = [
    { l: "TOTAL NAVIGATORS", v: "1,842", d: "+124 THIS CYCLE", c: "var(--plasma)", icon: "🌌", p: 78 },
    { l: "ACTIVE WORLDS", v: "36", d: "+3 NEW REALMS", c: "#a78bfa", icon: "🪐", p: 72 },
    { l: "REVENUE FLUX", v: "₹24.8L", d: "+18.3% SURGE", c: "var(--aurora1)", icon: "⚡", p: 85 },
    { l: "COMPLETION ORBIT", v: "73%", d: "+5.2% VELOCITY", c: "var(--gold)", icon: "✦", p: 73 },
  ];
  const revenue = [42, 58, 51, 67, 72, 80, 75, 90, 84, 98, 88, 105];
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gridTemplateRows: "auto auto 1fr 1fr", gap: 16, padding: "18px 22px", height: "100%", overflowY: "auto" }}>
      <div style={{ gridColumn: "1/-1", marginBottom: 4, animation: "slideUp .5s ease both" }}>
        <h1 style={{ fontSize: 34, fontFamily: "'Teko',sans-serif", fontWeight: 700, letterSpacing: 4, marginBottom: 8 }} className="holo-shimmer">UNIVERSE CONTROL ◆</h1>
        <div style={{ display: "flex", gap: 10 }}><WarpBadge text="ARIVUON v3.2.1" color="var(--aurora1)" /><WarpBadge text="ALL SYSTEMS STABLE" color="var(--plasma)" pulse /><WarpBadge text="1842 IN COSMOS" color="#a78bfa" /></div>
      </div>

      {kpis.map((k, i) => (
        <CrystalPanel key={i} style={{ padding: 22 }} accent={k.c} glow anim="animate-in" delay={i * .08}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <span style={{ color: "rgba(200,230,240,0.3)", fontSize: 9, fontFamily: "'Exo 2',monospace", letterSpacing: 2 }}>{k.l}</span>
            <span style={{ fontSize: 18 }}>{k.icon}</span>
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, fontFamily: "'Teko',sans-serif", color: k.c, marginBottom: 6, lineHeight: 1, textShadow: `0 0 30px ${k.c}44`, letterSpacing: 2 }}>{k.v}</div>
          <div style={{ fontSize: 9, color: "var(--aurora1)", fontFamily: "'Exo 2',monospace", letterSpacing: 1, marginBottom: 12 }}>{k.d}</div>
          <EnergyBar pct={k.p} color={k.c} h={3} />
        </CrystalPanel>
      ))}

      <CrystalPanel style={{ gridColumn: "1/3", padding: 22 }} accent="var(--aurora1)">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <span style={{ fontSize: 14 }}>⚡</span>
          <span style={{ color: "var(--aurora1)", fontSize: 10, fontFamily: "'Exo 2',sans-serif", letterSpacing: 3 }}>REVENUE TRAJECTORY 2025</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 110 }}>
          {revenue.map((v, i) => {
            const isMax = v === Math.max(...revenue);
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: "100%", borderRadius: "3px 3px 0 0", height: `${(v / 110) * 100}%`, minHeight: 6, background: isMax ? `linear-gradient(180deg,var(--plasma),var(--aurora1))` : `linear-gradient(180deg,var(--aurora1),rgba(0,255,204,0.15))`, boxShadow: isMax ? "0 0 20px var(--plasma)" : `0 0 8px rgba(0,255,204,0.2)`, transition: "all .3s", cursor: "pointer" }}
                  onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.6)" }}
                  onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)" }} />
                <span style={{ fontSize: 7, color: "rgba(200,230,240,0.25)", fontFamily: "'Exo 2',monospace" }}>{months[i]}</span>
              </div>
            );
          })}
        </div>
      </CrystalPanel>

      <CrystalPanel style={{ gridColumn: "3/5", padding: 22 }} accent="#a78bfa">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <span style={{ fontSize: 14 }}>🪐</span>
          <span style={{ color: "#a78bfa", fontSize: 10, fontFamily: "'Exo 2',sans-serif", letterSpacing: 3 }}>WORLD DEPLOYMENT STATUS</span>
        </div>
        {[{ n: "B7 — Full-Stack Cosmos", s: 24, p: 68, c: "var(--plasma)", st: "ACTIVE" }, { n: "B8 — Neural AI/ML", s: 30, p: 42, c: "#a78bfa", st: "ACTIVE" }, { n: "B9 — Cloud Nebula", s: 18, p: 21, c: "var(--aurora1)", st: "NEW" }, { n: "B6 — CyberSec Matrix", s: 22, p: 94, c: "var(--gold)", st: "CLOSING" }].map((b, i) => (
          <div key={i} style={{ padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ color: "rgba(220,240,255,0.7)", fontSize: 12, fontFamily: "'Exo 2',sans-serif" }}>{b.n}</span>
              <div style={{ display: "flex", gap: 8 }}><span style={{ color: "rgba(200,230,240,0.25)", fontSize: 9, fontFamily: "'Exo 2',monospace" }}>{b.s} nav</span><WarpBadge text={b.st} color={b.c} /></div>
            </div>
            <EnergyBar pct={b.p} color={b.c} h={3} />
          </div>
        ))}
      </CrystalPanel>

      <CrystalPanel style={{ gridColumn: "1/3", padding: 22 }} accent="var(--plasma)">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 14 }}>👥</span>
            <span style={{ color: "var(--plasma)", fontSize: 10, fontFamily: "'Exo 2',sans-serif", letterSpacing: 3 }}>COSMOS REGISTRY</span>
          </div>
          <button style={{ padding: "7px 14px", borderRadius: 10, background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)", color: "var(--plasma)", fontSize: 9, cursor: "pointer", fontFamily: "'Exo 2',monospace", letterSpacing: 2 }}>+ ENROLL</button>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {[{ r: "NAVIGATORS", n: "1,842", c: "var(--plasma)" }, { r: "TRAINERS", n: "28", c: "#a78bfa" }, { r: "ADMINS", n: "4", c: "var(--gold)" }].map((r, i) => (
            <div key={i} style={{ flex: 1, padding: "16px 14px", borderRadius: 14, background: `${r.c}06`, border: `1px solid ${r.c}18`, textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: r.c, fontFamily: "'Teko',sans-serif", letterSpacing: 2, marginBottom: 5, textShadow: `0 0 20px ${r.c}44` }}>{r.n}</div>
              <div style={{ fontSize: 8, color: "rgba(200,230,240,0.3)", fontFamily: "'Exo 2',monospace", letterSpacing: 2 }}>{r.r}</div>
            </div>
          ))}
        </div>
      </CrystalPanel>

      <CrystalPanel style={{ gridColumn: "3/5", padding: 22 }} accent="var(--gold)">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <span style={{ fontSize: 14 }}>◎</span>
          <span style={{ color: "var(--gold)", fontSize: 10, fontFamily: "'Exo 2',sans-serif", letterSpacing: 3 }}>SYSTEM DIAGNOSTICS</span>
        </div>
        {[{ n: "API Gateway", s: "NOMINAL", l: "12ms", p: 98 }, { n: "Stream Core", s: "NOMINAL", l: "34ms", p: 96 }, { n: "Neural Engine", s: "NOMINAL", l: "89ms", p: 91 }, { n: "Data Cluster", s: "DEGRADED", l: "210ms", p: 62 }, { n: "Auth Shield", s: "NOMINAL", l: "8ms", p: 100 }].map((s, i) => {
          const ok = s.s === "NOMINAL";
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: ok ? "var(--aurora1)" : "var(--gold)", boxShadow: `0 0 8px ${ok ? "var(--aurora1)" : "var(--gold)"}` }} />
              <span style={{ flex: 1, color: "rgba(200,230,240,0.6)", fontSize: 11, fontFamily: "'Exo 2',sans-serif" }}>{s.n}</span>
              <div style={{ width: 44 }}><EnergyBar pct={s.p} color={ok ? "var(--aurora1)" : "var(--gold)"} h={2} /></div>
              <span style={{ color: ok ? "var(--aurora1)" : "var(--gold)", fontSize: 8, fontFamily: "'Exo 2',monospace", minWidth: 52, textAlign: "right" }}>{s.s}</span>
              <span style={{ color: "rgba(200,230,240,0.25)", fontSize: 8, fontFamily: "'Exo 2',monospace", minWidth: 30 }}>{s.l}</span>
            </div>
          );
        })}
      </CrystalPanel>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TOP NAVIGATION BAR
═══════════════════════════════════════════════════════════════ */
function CosmicTopBar({ view, setView, onCmd }) {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);
  return (
    <div style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", borderBottom: "1px solid rgba(0,212,255,0.07)", background: "rgba(2,4,8,0.92)", backdropFilter: "blur(30px)", zIndex: 10, position: "relative" }}>
      <div style={{ display: "flex", gap: 4 }}>
        {[{ id: "student", l: "COSMOS HUB", c: "var(--plasma)" }, { id: "trainer", l: "TRAINER BRIDGE", c: "#a78bfa" }, { id: "admin", l: "UNIVERSE CTRL", c: "var(--aurora1)" }].map(v => (
          <button key={v.id} onClick={() => setView(v.id)} style={{ padding: "6px 14px", borderRadius: 8, fontSize: 9, cursor: "pointer", fontFamily: "'Exo 2',monospace", letterSpacing: 2, background: view === v.id ? `${v.c}14` : "transparent", border: `1px solid ${view === v.id ? `${v.c}40` : "rgba(255,255,255,0.04)"}`, color: view === v.id ? v.c : "rgba(200,230,240,0.2)", transition: "all .2s" }}>{v.l}</button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ height: 1, width: 60, background: "linear-gradient(90deg,transparent,rgba(0,212,255,0.25),transparent)" }} />
        <span style={{ color: "var(--plasma)", fontSize: 13, fontFamily: "'Teko',sans-serif", fontWeight: 600, letterSpacing: 6, opacity: .7, animation: "quantumFlicker 10s ease infinite" }}>ARIVUON</span>
        <div style={{ height: 1, width: 60, background: "linear-gradient(90deg,transparent,rgba(0,212,255,0.25),transparent)" }} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 8, background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.1)" }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--aurora1)", boxShadow: "0 0 6px var(--aurora1)" }} />
          <span style={{ color: "var(--plasma)", fontSize: 11, fontFamily: "'Exo 2',monospace", letterSpacing: 2 }}>{time}</span>
        </div>
        <button onClick={onCmd} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 10, background: "rgba(0,212,255,0.03)", border: "1px solid rgba(0,212,255,0.1)", color: "rgba(200,230,240,0.3)", cursor: "pointer", fontSize: 9, fontFamily: "'Exo 2',monospace", letterSpacing: 2, transition: "all .2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,212,255,0.3)"; e.currentTarget.style.color = "var(--plasma)" }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,212,255,0.1)"; e.currentTarget.style.color = "rgba(200,230,240,0.3)" }}>
          SEARCH COSMOS
          <span style={{ padding: "2px 6px", borderRadius: 5, background: "rgba(0,212,255,0.1)", color: "var(--plasma)", fontSize: 9 }}>⌘K</span>
        </button>
        <div style={{ position: "relative", cursor: "pointer" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, transition: "all .2s" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,212,255,0.25)" }} onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)" }}>🔔</div>
          <div style={{ position: "absolute", top: -2, right: -2, width: 9, height: 9, borderRadius: "50%", background: "var(--aurora3)", border: "2px solid #020408", boxShadow: "0 0 8px var(--aurora3)" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 10, borderLeft: "1px solid rgba(0,212,255,0.08)" }}>
          <div style={{ width: 30, height: 30, borderRadius: 10, background: "linear-gradient(135deg,rgba(0,212,255,0.2),rgba(123,47,255,0.2))", border: "1px solid rgba(0,212,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, boxShadow: "0 0 14px rgba(0,212,255,0.2)" }}>⬡</div>
          <div>
            <div style={{ fontSize: 11, fontFamily: "'Teko',sans-serif", fontWeight: 600, color: "rgba(220,240,255,0.9)", letterSpacing: 2 }}>ARIVUON</div>
            <div style={{ fontSize: 7, color: "rgba(200,230,240,0.25)", fontFamily: "'Exo 2',monospace", letterSpacing: 3 }}>THE UNIVERSE PORTAL</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FLOATING ARIA BUBBLE
═══════════════════════════════════════════════════════════════ */
function FloatingARIA() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 500 }}>
      {open && (
        <div style={{ position: "absolute", bottom: 68, right: 0, width: 280, animation: "slideUp .25s ease" }}>
          <CrystalPanel style={{ padding: 16, border: "1px solid rgba(255,107,157,0.3)", boxShadow: "0 0 60px rgba(255,107,157,0.15)" }} accent="#ff6b9d">
            <div style={{ color: "#ff6b9d", fontSize: 9, fontFamily: "'Exo 2',monospace", letterSpacing: 3, marginBottom: 12 }}>ARIA QUICK CHANNEL</div>
            <input placeholder="Transmit query to ARIA consciousness…" style={{ width: "100%", background: "rgba(255,107,157,0.06)", border: "1px solid rgba(255,107,157,0.2)", borderRadius: 12, padding: "10px 13px", color: "rgba(220,240,255,0.9)", fontSize: 12, outline: "none", fontFamily: "'Exo 2',sans-serif" }} />
            <div style={{ marginTop: 10, display: "flex", gap: 6 }}>{["Help", "Explain", "Quiz"].map(s => <button key={s} style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(255,107,157,0.08)", border: "1px solid rgba(255,107,157,0.2)", color: "#ff6b9d", fontSize: 9, cursor: "pointer", fontFamily: "'Exo 2',monospace" }}>{s}</button>)}</div>
          </CrystalPanel>
        </div>
      )}
      <div onClick={() => setOpen(o => !o)} style={{ width: 52, height: 52, borderRadius: "50%", cursor: "pointer", background: "linear-gradient(135deg,#ff6b9d,#a78bfa,var(--plasma))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 0 30px rgba(255,107,157,0.4),0 0 60px rgba(123,47,255,0.2)", animation: "particleDrift 5s ease-in-out infinite", position: "relative" }}>
        ◉
        <div style={{ position: "absolute", inset: -5, borderRadius: "50%", border: "1px solid rgba(255,107,157,0.3)", animation: "ringExpand 2s ease infinite" }} />
        <div style={{ position: "absolute", inset: -10, borderRadius: "50%", border: "1px solid rgba(255,107,157,0.15)", animation: "ringExpand 2s ease .7s infinite" }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════════ */
export default function ArivuonUniverse() {
  const [entered, setEntered] = useState(false);
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
    if (view === "trainer") return <TrainerBridge />;
    if (view === "admin") return <AdminUniverse />;
    return <CosmosHub />;
  };

  return (
    <>
      <style>{CSS}</style>
      <CosmicCursor />
      <div style={{ display: "flex", height: "100vh", width: "100vw", background: "var(--cosmos)", overflow: "hidden", position: "relative" }}>
        <CosmosEngine />
        {!entered && <WormholeEntry onComplete={() => setEntered(true)} />}
        {entered && (
          <div style={{ display: "flex", width: "100%", height: "100%", position: "relative", zIndex: 2, animation: "cosmicEntrance .8s cubic-bezier(.23,1,.32,1) both" }}>
            <ConstellationNav active={view} setActive={setView} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <CosmicTopBar view={view} setView={setView} onCmd={() => setCmd(true)} />
              <div style={{ flex: 1, overflow: "hidden" }}>{renderView()}</div>
            </div>
          </div>
        )}
        <CosmicCmd open={cmd} onClose={() => setCmd(false)} />
        {entered && <FloatingARIA />}
      </div>
    </>
  );
}