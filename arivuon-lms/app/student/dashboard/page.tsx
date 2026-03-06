"use client"

import { useEffect, useRef, useState } from "react"
import CosmosEngine from "@/components/background/CosmosEngine"
import ConstellationNav from "@/components/layout/Constellationnav"
import CosmicTopBar from "@/components/layout/Cosmictopbar"

/* ══════════════════════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════════════════════ */
const T = {
  plasma:  "#00D4FF",
  aurora1: "#00FFCC",
  aurora2: "#7B2FFF",
  aurora3: "#FF006E",
  gold:    "#FFD700",
  pink:    "#FF6B9D",
  purple:  "#A78BFA",
  surface: "rgba(5,12,24,0.88)",
  border:  "rgba(0,212,255,0.10)",
}

/* ══════════════════════════════════════════════════════════════
   PRIMITIVE COMPONENTS
══════════════════════════════════════════════════════════════ */
function CrystalPanel({
  children, accent = T.plasma, glow = false,
  style = {}, className = "",
}: {
  children: React.ReactNode; accent?: string; glow?: boolean;
  style?: React.CSSProperties; className?: string
}) {
  const [hov, setHov] = useState(false)
  return (
    <div className={className}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: T.surface,
        border: `1px solid ${hov ? accent + "42" : accent + "13"}`,
        borderRadius: 22,
        backdropFilter: "blur(42px) saturate(1.6)",
        position: "relative", overflow: "hidden",
        transition: "all 0.38s cubic-bezier(0.23,1,0.32,1)",
        transform: hov ? "translateY(-4px)" : "translateY(0)",
        boxShadow: glow
          ? `0 0 0 1px ${accent}10, 0 18px 56px rgba(0,0,0,0.58), 0 0 70px ${accent}07`
          : "0 16px 52px rgba(0,0,0,0.52)",
        ...style,
      }}>
      {/* Corner brackets */}
      {[
        {top:0,left:0,   br:"22px 0 0 0",  bTop:"1px solid",  bLeft:"1px solid",  bBtm:"none",       bRgt:"none"},
        {top:0,right:0,  br:"0 22px 0 0",  bTop:"1px solid",  bLeft:"none",        bBtm:"none",       bRgt:"1px solid"},
        {btm:0,left:0,   br:"0 0 0 22px",  bTop:"none",        bLeft:"1px solid",  bBtm:"1px solid",  bRgt:"none"},
        {btm:0,right:0,  br:"0 0 22px 0",  bTop:"none",        bLeft:"none",        bBtm:"1px solid",  bRgt:"1px solid"},
      ].map((c,i) => (
        <div key={i} style={{
          position:"absolute",width:18,height:18,
          top:c.top??undefined,bottom:c.btm??undefined,
          left:(c.left!==undefined?c.left:undefined),
          right:(c.right!==undefined?c.right:undefined),
          borderRadius:c.br,borderColor:`${accent}52`,
          borderTop:c.bTop,borderLeft:c.bLeft,borderBottom:c.bBtm,borderRight:c.bRgt,
        }}/>
      ))}
      {/* Top glow edge */}
      <div style={{position:"absolute",top:0,left:"10%",right:"10%",height:1,
                   background:`linear-gradient(90deg,transparent,${accent}68,transparent)`}}/>
      {children}
    </div>
  )
}

function SectionLabel({ text, color=T.plasma, icon="◈" }:{text:string;color?:string;icon?:string}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
      <span style={{color,fontSize:13}}>{icon}</span>
      <span style={{color,fontSize:9,fontFamily:"'VT323',monospace",letterSpacing:"0.35em",textTransform:"uppercase"}}>{text}</span>
      <div style={{flex:1,height:1,background:`linear-gradient(90deg,${color}50,transparent)`}}/>
    </div>
  )
}

function WarpBadge({ text, color=T.plasma, pulse=false }:{text:string;color?:string;pulse?:boolean}) {
  return (
    <span style={{
      display:"inline-flex",alignItems:"center",gap:5,
      padding:"3px 10px",borderRadius:6,
      background:`${color}10`,border:`1px solid ${color}28`,
      fontSize:9,fontFamily:"'VT323',monospace",
      color,letterSpacing:"0.15em",textTransform:"uppercase",
      flexShrink:0,
    }}>
      {pulse && <span style={{
        width:5,height:5,borderRadius:"50%",background:color,
        boxShadow:`0 0 6px ${color}`,display:"inline-block",
        animation:"ringPulse 1.6s ease-out infinite",
      }}/>}
      {text}
    </span>
  )
}

function EnergyBar({ pct, color=T.plasma, h=3 }:{pct:number;color?:string;h?:number}) {
  const [w, setW] = useState(0)
  useEffect(() => { const t = setTimeout(() => setW(pct), 180); return () => clearTimeout(t) }, [pct])
  return (
    <div style={{height:h,borderRadius:h,background:"rgba(255,255,255,0.04)",overflow:"hidden"}}>
      <div style={{
        height:"100%", width:`${w}%`, borderRadius:h,
        background:`linear-gradient(90deg,${color}77,${color},${color}aa)`,
        backgroundSize:"300% 100%",
        animation:"eFlow 2.5s linear infinite",
        boxShadow:`0 0 10px ${color}66`,
        transition:"width 1.6s cubic-bezier(0.4,0,0.2,1)",
      }}/>
    </div>
  )
}

function CosmicRing({ pct, size=70, color=T.plasma, value, label }:{pct:number;size?:number;color?:string;value:string;label:string}) {
  const r    = (size-10)/2
  const circ = 2*Math.PI*r
  const [p, setP] = useState(0)
  useEffect(() => { const t = setTimeout(() => setP(pct), 250); return () => clearTimeout(t) }, [pct])
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:7}}>
      <div style={{position:"relative",width:size,height:size}}>
        {/* Tick ring */}
        <svg style={{position:"absolute",inset:0,animation:"orbSpin 22s linear infinite"}} width={size} height={size}>
          {Array.from({length:12},(_,i)=>{
            const a = (i/12)*Math.PI*2
            const bold = i%3===0
            return <line key={i}
              x1={size/2+(r+1)*Math.cos(a)} y1={size/2+(r+1)*Math.sin(a)}
              x2={size/2+(r+4)*Math.cos(a)} y2={size/2+(r+4)*Math.sin(a)}
              stroke={`${color}${bold?"88":"22"}`} strokeWidth={bold?1.6:0.6}/>
          })}
        </svg>
        {/* Arc */}
        <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${color}18`} strokeWidth={5}/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ*(1-p/100)}
            style={{filter:`drop-shadow(0 0 7px ${color})`,transition:"stroke-dashoffset 1.6s ease"}}/>
        </svg>
        {/* Center value */}
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:14,fontWeight:700,color,fontFamily:"'Teko',sans-serif",letterSpacing:1}}>{value}</span>
        </div>
      </div>
      <span style={{fontSize:8,color:"rgba(200,230,240,0.35)",fontFamily:"'VT323',monospace",
                    letterSpacing:"0.2em",textTransform:"uppercase",textAlign:"center",lineHeight:1.3}}>{label}</span>
    </div>
  )
}

function PlanetOrb({ c1, c2, c3, icon, pct, size=52 }:{c1:string;c2:string;c3:string;icon:string;pct:number;size?:number}) {
  const r    = size/2 - 4
  const circ = 2*Math.PI*r
  const [hov, setHov] = useState(false)
  return (
    <div style={{position:"relative",width:size,height:size,cursor:"pointer",flexShrink:0}}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <div style={{position:"absolute",inset:-9,borderRadius:"50%",border:`1px solid ${c1}22`,animation:"orbSpin 9s linear infinite"}}/>
      <div style={{position:"absolute",inset:-15,borderRadius:"50%",border:`1px dashed ${c2}14`,animation:"orbSpinR 15s linear infinite"}}/>
      <div style={{position:"absolute",inset:-3,borderRadius:"50%",animation:"breathe 3s ease-in-out infinite",
                   boxShadow:`0 0 ${hov?30:18}px ${c1}${hov?"60":"30"}`,transition:"box-shadow 0.3s ease"}}/>
      <div style={{
        width:size,height:size,borderRadius:"50%",
        background:`radial-gradient(circle at 32% 30%,${c1},${c2} 55%,${c3} 100%)`,
        boxShadow:`0 0 20px ${c1}45,inset -${size*0.18}px -${size*0.1}px ${size*0.3}px rgba(0,0,0,0.55)`,
        display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:size*0.28,position:"relative",
        transform:hov?"scale(1.12)":"scale(1)",transition:"transform 0.3s ease",
      }}>{icon}</div>
      <svg style={{position:"absolute",inset:0,transform:"rotate(-90deg)"}} width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${c1}18`} strokeWidth={2}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c1} strokeWidth={2}
          strokeLinecap="round" strokeDasharray={`${circ*pct/100} ${circ}`}
          style={{filter:`drop-shadow(0 0 4px ${c1})`}}/>
      </svg>
      <div style={{
        position:"absolute",bottom:-18,left:"50%",transform:"translateX(-50%)",
        fontSize:9,fontFamily:"'VT323',monospace",color:c1,letterSpacing:"0.1em",
        whiteSpace:"nowrap",
      }}>{pct}%</div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   SESSION CARD
══════════════════════════════════════════════════════════════ */
function SessionCard({ time, title, trainer, live, icon }:{time:string;title:string;trainer:string;live:boolean;icon:string}) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        display:"flex",alignItems:"center",gap:13,padding:"12px 15px",
        borderRadius:14,marginBottom:9,cursor:"pointer",
        background: hov?"rgba(0,212,255,0.08)":live?"rgba(0,212,255,0.04)":"rgba(255,255,255,0.02)",
        border:`1px solid ${hov?"rgba(0,212,255,0.32)":live?"rgba(0,212,255,0.18)":"rgba(255,255,255,0.05)"}`,
        transition:"all 0.22s ease",
        transform:hov?"translateX(4px)":"translateX(0)",
      }}>
      <span style={{fontSize:18,flexShrink:0}}>{icon}</span>
      <div style={{textAlign:"center",minWidth:38,flexShrink:0}}>
        <div style={{color:live?T.plasma:"rgba(200,230,240,0.28)",fontSize:10,
                     fontFamily:"'VT323',monospace",letterSpacing:"0.06em"}}>{time}</div>
      </div>
      <div style={{width:2,height:34,borderRadius:1,flexShrink:0,
                   background:live?T.plasma:"rgba(255,255,255,0.07)",
                   boxShadow:live?`0 0 10px ${T.plasma}`:"none"}}/>
      <div style={{flex:1,minWidth:0}}>
        <div style={{color:"rgba(220,240,255,0.88)",fontSize:12,fontFamily:"'Exo 2',sans-serif",
                     fontWeight:600,marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{title}</div>
        <div style={{color:"rgba(200,230,240,0.32)",fontSize:10,fontFamily:"'Exo 2',sans-serif"}}>{trainer}</div>
      </div>
      {live ? (
        <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
          <span style={{position:"relative",width:8,height:8,display:"inline-block"}}>
            <span style={{position:"absolute",inset:0,borderRadius:"50%",background:T.aurora1,boxShadow:`0 0 8px ${T.aurora1}`}}/>
            <span style={{position:"absolute",inset:-3,borderRadius:"50%",border:`1px solid ${T.aurora1}`,animation:"ringPulse 1.6s ease-out infinite"}}/>
          </span>
          <WarpBadge text="LIVE" color={T.aurora1}/>
        </div>
      ) : <WarpBadge text="QUEUED" color="rgba(200,230,240,0.15)"/>}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   ARIA CHAT PANEL
══════════════════════════════════════════════════════════════ */
const INIT_MSGS = [
  { from:"ai",   text:"NEURAL LINK ESTABLISHED ◈  Aryan, your cosmos is live. Deep Learning Lab starts in 47 min. Ready to warp?" },
  { from:"user", text:"Show me my galaxy rank" },
  { from:"ai",   text:"You're at SECTOR-B7, Rank #4 of 48 navigators — 74% into Neural Networks constellation. Velocity 23% above cohort avg. 🌌" },
]

function ARIAPanel() {
  const [msgs, setMsgs] = useState(INIT_MSGS)
  const [input, setInput] = useState("")
  const [thinking, setThinking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const send = async (text: string) => {
    if (!text.trim()) return
    setMsgs(m => [...m, { from:"user", text }])
    setInput(""); setThinking(true)
    await new Promise(r => setTimeout(r, 1100))
    const reps = [
      "Analyzing your learning trajectory across 4 course worlds… Recommendation: focus on Convolutional Networks next. 🧠",
      "Your neural patterns suggest 91% confidence in this topic. Want a quick 5-question quiz to verify? ⚡",
      "Based on attendance patterns, your peak focus window is 09:00–12:00. Today's lab falls right in your optimal zone. 🌟",
    ]
    setMsgs(m => [...m, { from:"ai", text: reps[Math.floor(Math.random()*reps.length)] }])
    setThinking(false)
  }

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }) }, [msgs, thinking])

  return (
    <CrystalPanel accent={T.pink} glow style={{display:"flex",flexDirection:"column",height:"100%",padding:0,overflow:"hidden"}}>
      {/* Header */}
      <div style={{padding:"15px 17px",borderBottom:"1px solid rgba(255,107,157,0.12)",
                   display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
        <div style={{position:"relative"}}>
          <div style={{
            width:38,height:38,borderRadius:13,
            background:"linear-gradient(135deg,rgba(255,107,157,0.22),rgba(123,47,255,0.22))",
            border:"1px solid rgba(255,107,157,0.32)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:16,boxShadow:"0 0 18px rgba(255,107,157,0.18)",
          }}>◉</div>
          <div style={{position:"absolute",inset:-3,borderRadius:16,
                       border:"1px solid rgba(255,107,157,0.18)",animation:"orbSpinR 5s linear infinite"}}/>
        </div>
        <div>
          <div style={{color:"rgba(220,240,255,0.9)",fontSize:14,fontFamily:"'Teko',sans-serif",
                       fontWeight:600,letterSpacing:"0.22em"}}>ARIA</div>
          <div style={{color:T.pink,fontSize:9,fontFamily:"'VT323',monospace",letterSpacing:"0.18em"}}>
            AI CONSCIOUSNESS · ONLINE
          </div>
        </div>
        <div style={{flex:1}}/>
        <span style={{width:7,height:7,borderRadius:"50%",background:T.aurora1,
                      boxShadow:`0 0 8px ${T.aurora1}`,display:"inline-block"}}/>
      </div>

      {/* Messages */}
      <div style={{flex:1,padding:"13px 15px",display:"flex",flexDirection:"column",
                   gap:10,overflowY:"auto",minHeight:0}}>
        {msgs.map((m,i) => (
          <div key={i} style={{display:"flex",justifyContent:m.from==="user"?"flex-end":"flex-start",
                               animation:"msgIn 0.28s ease both"}}>
            <div style={{
              maxWidth:"88%",padding:"9px 13px",
              borderRadius:m.from==="user"?"14px 14px 4px 14px":"4px 14px 14px 14px",
              background:m.from==="user"
                ?"linear-gradient(135deg,rgba(0,212,255,0.1),rgba(123,47,255,0.1))"
                :"rgba(255,107,157,0.06)",
              border:`1px solid ${m.from==="user"?"rgba(0,212,255,0.2)":"rgba(255,107,157,0.14)"}`,
              color:"rgba(200,230,240,0.85)",fontSize:11.5,lineHeight:1.68,
              fontFamily:"'Exo 2',sans-serif",fontWeight:300,
            }}>
              {m.from==="ai" && (
                <div style={{color:T.pink,fontSize:8,fontFamily:"'VT323',monospace",
                             letterSpacing:"0.22em",marginBottom:4}}>ARIA:</div>
              )}
              {m.text}
            </div>
          </div>
        ))}
        {thinking && (
          <div style={{display:"flex",justifyContent:"flex-start"}}>
            <div style={{padding:"10px 14px",borderRadius:"4px 14px 14px 14px",
                         background:"rgba(255,107,157,0.06)",border:"1px solid rgba(255,107,157,0.14)"}}>
              <div style={{display:"flex",gap:4}}>
                {[0,1,2].map(i=>(
                  <span key={i} style={{width:5,height:5,borderRadius:"50%",background:T.pink,
                                        animation:`dotBounce 1s ease ${i*0.18}s infinite`,display:"inline-block"}}/>
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Quick chips */}
      <div style={{padding:"8px 13px",display:"flex",gap:6,flexWrap:"wrap",
                   borderTop:"1px solid rgba(255,107,157,0.07)",flexShrink:0}}>
        {["What's next?","Quiz me","Explain this","My weak areas"].map(s=>(
          <button key={s} onClick={()=>send(s)}
            style={{padding:"4px 9px",borderRadius:8,background:"rgba(255,107,157,0.06)",
                    border:"1px solid rgba(255,107,157,0.18)",color:T.pink,fontSize:9,
                    cursor:"pointer",fontFamily:"'VT323',monospace",letterSpacing:"0.1em",
                    transition:"all 0.2s"}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,107,157,0.14)"}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,107,157,0.06)"}}>
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{padding:"11px 13px",borderTop:"1px solid rgba(255,107,157,0.08)",
                   display:"flex",gap:8,flexShrink:0}}>
        <input value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&send(input)}
          placeholder="Transmit to ARIA…"
          style={{flex:1,background:"rgba(255,107,157,0.05)",border:"1px solid rgba(255,107,157,0.18)",
                  borderRadius:12,padding:"9px 13px",color:"rgba(220,240,255,0.9)",
                  fontSize:12,outline:"none",fontFamily:"'Exo 2',sans-serif"}}/>
        <button onClick={()=>send(input)}
          style={{width:38,height:38,borderRadius:11,
                  background:"linear-gradient(135deg,#ff6b9d,#a78bfa)",
                  border:"none",cursor:"pointer",fontSize:15,
                  boxShadow:"0 0 14px rgba(255,107,157,0.28)",color:"white",
                  display:"flex",alignItems:"center",justifyContent:"center"}}>↑</button>
      </div>
    </CrystalPanel>
  )
}

/* ══════════════════════════════════════════════════════════════
   STUDENT DASHBOARD PAGE
══════════════════════════════════════════════════════════════ */
export default function StudentDashboard() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(()=>setMounted(true), 100); return ()=>clearTimeout(t) }, [])

  const courses = [
    { name:"Neural Networks & Deep Learning", sub:"AI/ML",  pct:74, c1:"#00D4FF", c2:"#0040FF", c3:"#001040", icon:"🧠" },
    { name:"Full-Stack Architecture",          sub:"DEV",    pct:51, c1:"#A78BFA", c2:"#6D28D9", c3:"#2D0050", icon:"⚡" },
    { name:"Quantum Algorithms",               sub:"CS",     pct:88, c1:"#00FFCC", c2:"#00AA88", c3:"#003328", icon:"🔮" },
    { name:"Cloud Nebula Infrastructure",      sub:"CLOUD",  pct:33, c1:"#FFD700", c2:"#FF8C00", c3:"#301800", icon:"☁️" },
  ]

  const sessions = [
    { time:"09:00", title:"Deep Learning Lab",        trainer:"Dr. Arjun V.",  live:true,  icon:"🌌" },
    { time:"13:30", title:"React Quantum Patterns",   trainer:"Priya S.",      live:false, icon:"⚡" },
    { time:"16:00", title:"Algorithm Wars #14",       trainer:"Vikram R.",     live:false, icon:"🔮" },
  ]

  const attendance = [
    {d:"MON",v:100},{d:"TUE",v:85},{d:"WED",v:60},{d:"THU",v:100},{d:"FRI",v:80},{d:"SAT",v:90},
  ]

  const delay = (n: number) => mounted ? `slideUp 0.5s cubic-bezier(0.23,1,0.32,1) ${n}s both` : "none"

  return (
    <>
      {/* ── Background ── */}
      <CosmosEngine />
      {/* Scan line */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{zIndex:1}}>
        <div style={{position:"absolute",width:"100%",height:1,
                     background:"linear-gradient(90deg,transparent,rgba(0,212,255,0.06),rgba(0,212,255,0.12),rgba(0,212,255,0.06),transparent)",
                     animation:"scanH 14s linear infinite"}}/>
      </div>

      {/* ── App shell ── */}
      <div style={{display:"flex",height:"100vh",overflow:"hidden",position:"relative",zIndex:2}}>
        <ConstellationNav role="student" />

        <div style={{display:"flex",flexDirection:"column",flex:1,overflow:"hidden"}}>
          <CosmicTopBar role="student" />

          {/* ── Dashboard Scroll Area ── */}
          <div style={{
            flex:1, overflowY:"auto",
            padding:"20px 22px 28px",
            display:"grid",
            gridTemplateColumns:"1fr 1fr 295px",
            gridTemplateRows:"auto auto auto",
            gap:15,
            alignContent:"start",
          }}>

            {/* ══ HEADER ROW ══ */}
            <div style={{
              gridColumn:"1/-1",
              display:"flex",alignItems:"center",justifyContent:"space-between",
              padding:"4px 0 12px",
              borderBottom:"1px solid rgba(0,212,255,0.07)",
              marginBottom:2,
              animation:delay(0),
            }}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:8}}>
                  <h1 style={{
                    fontFamily:"'Teko',sans-serif",fontSize:38,fontWeight:700,
                    letterSpacing:"0.18em",lineHeight:1,
                    background:"linear-gradient(90deg,#00D4FF,#A78BFA,#00FFCC,#00D4FF)",
                    backgroundSize:"300% auto",
                    WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
                    animation:"holoPan 7s linear infinite",
                  }}>COSMOS HUB</h1>
                  <WarpBadge text="ONLINE" color={T.aurora1} pulse/>
                  <WarpBadge text="3 ORBITS TODAY" color={T.plasma}/>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{color:"rgba(200,230,240,0.25)",fontSize:10,fontFamily:"'VT323',monospace",letterSpacing:"0.2em"}}>NAVIGATOR:</span>
                  <span style={{color:T.plasma,fontSize:11,fontFamily:"'VT323',monospace",letterSpacing:"0.18em"}}>ARYAN KUMAR</span>
                  <span style={{color:"rgba(200,230,240,0.18)",fontSize:10,fontFamily:"'VT323',monospace"}}>// SECTOR B7 // BATCH-2024</span>
                </div>
              </div>

              {/* 3 metric rings */}
              <div style={{display:"flex",gap:22,alignItems:"center"}}>
                <CosmicRing pct={87} size={68} color={T.gold}    value="14D"  label={"STREAK"}/>
                <CosmicRing pct={91} size={68} color={T.plasma}  value="91%"  label={"SCORE"}/>
                <CosmicRing pct={73} size={68} color={T.aurora2} value="#4"   label={"RANK"}/>
              </div>
            </div>

            {/* ══ COL 1: TODAY'S SESSIONS ══ */}
            <CrystalPanel accent={T.plasma} glow style={{padding:22,animation:delay(0.08)}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
                <SectionLabel text="Today's Orbit Log" color={T.plasma} icon="▶"/>
                <WarpBadge text="ACTIVE" color={T.aurora1} pulse/>
              </div>
              {sessions.map((s,i) => <SessionCard key={i} {...s}/>)}

              {/* Mini progress */}
              <div style={{marginTop:14,padding:"12px 14px",borderRadius:14,
                           background:"rgba(0,212,255,0.04)",border:"1px solid rgba(0,212,255,0.10)"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                  <span style={{fontSize:9,fontFamily:"'VT323',monospace",color:"rgba(200,230,240,0.35)",letterSpacing:"0.2em"}}>DAY COMPLETION</span>
                  <span style={{fontSize:12,fontFamily:"'Teko',sans-serif",color:T.plasma,fontWeight:600}}>1/3</span>
                </div>
                <EnergyBar pct={33} color={T.plasma} h={4}/>
              </div>
            </CrystalPanel>

            {/* ══ COL 2: COURSE WORLDS ══ */}
            <CrystalPanel accent={T.purple} style={{padding:22,animation:delay(0.13)}}>
              <SectionLabel text="Course Worlds" color={T.purple} icon="🪐"/>

              {/* Planet orbs */}
              <div style={{display:"flex",justifyContent:"space-around",marginBottom:28,paddingTop:4}}>
                {courses.map((c,i)=>(
                  <PlanetOrb key={i} c1={c.c1} c2={c.c2} c3={c.c3} icon={c.icon} pct={c.pct} size={52}/>
                ))}
              </div>

              {/* Progress rows */}
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {courses.map((c,i)=>(
                  <div key={i}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <WarpBadge text={c.sub} color={c.c1}/>
                        <span style={{color:"rgba(215,235,255,0.62)",fontSize:11,
                                      fontFamily:"'Exo 2',sans-serif",
                                      whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:155}}>{c.name}</span>
                      </div>
                      <span style={{color:c.c1,fontSize:13,fontFamily:"'Teko',sans-serif",fontWeight:700,letterSpacing:1,flexShrink:0}}>{c.pct}%</span>
                    </div>
                    <EnergyBar pct={c.pct} color={c.c1} h={3}/>
                  </div>
                ))}
              </div>
            </CrystalPanel>

            {/* ══ COL 3: ARIA (spans rows 2–4) ══ */}
            <div style={{gridColumn:"3/4",gridRow:"2/5",display:"flex",flexDirection:"column",animation:delay(0.18)}}>
              <ARIAPanel/>
            </div>

            {/* ══ COL 1: ATTENDANCE ══ */}
            <CrystalPanel accent={T.gold} style={{padding:22,animation:delay(0.2)}}>
              <SectionLabel text="Stellar Attendance" color={T.gold} icon="✦"/>
              {/* Bar chart */}
              <div style={{display:"flex",gap:8,alignItems:"flex-end",height:88,marginBottom:16}}>
                {attendance.map((a,i)=>{
                  const c = a.v>=90?T.aurora1 : a.v>=70?T.plasma : a.v>=50?T.gold : T.aurora3
                  const [bH, setBH] = useState(0)
                  useEffect(()=>{const t=setTimeout(()=>setBH(a.v),250+i*80);return()=>clearTimeout(t)},[])
                  return (
                    <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                      <div style={{
                        width:"100%",borderRadius:"4px 4px 0 0",
                        height:`${bH*0.86}%`,minHeight:4,
                        background:`linear-gradient(180deg,${c},${c}33)`,
                        boxShadow:`0 0 12px ${c}38`,
                        transition:"height 1.6s cubic-bezier(0.4,0,0.2,1)",
                        cursor:"pointer",
                      }}
                        onMouseEnter={e=>{e.currentTarget.style.filter="brightness(1.6)"}}
                        onMouseLeave={e=>{e.currentTarget.style.filter="brightness(1)"}}/>
                      <span style={{fontSize:7,color:"rgba(200,230,240,0.25)",fontFamily:"'VT323',monospace"}}>{a.d}</span>
                    </div>
                  )
                })}
              </div>
              {/* Stat grid */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
                {[
                  {l:"PRESENT RATE",v:"86%",    c:T.plasma},
                  {l:"STREAK",      v:"14 DAYS", c:T.gold},
                  {l:"SESSIONS",    v:"24 / 28", c:T.aurora1},
                  {l:"STUDY HOURS", v:"142h",    c:T.purple},
                ].map((s,i)=>(
                  <div key={i} style={{padding:"10px 12px",borderRadius:12,
                                       background:`${s.c}07`,border:`1px solid ${s.c}16`}}>
                    <div style={{color:"rgba(200,230,240,0.26)",fontSize:8,fontFamily:"'VT323',monospace",
                                 letterSpacing:"0.18em",marginBottom:5}}>{s.l}</div>
                    <div style={{color:s.c,fontSize:19,fontFamily:"'Teko',sans-serif",fontWeight:600,letterSpacing:1}}>{s.v}</div>
                  </div>
                ))}
              </div>
            </CrystalPanel>

            {/* ══ COL 2: BIOMETRIC VITALS ══ */}
            <CrystalPanel accent={T.aurora1} style={{padding:22,animation:delay(0.24)}}>
              <SectionLabel text="Biometric Vitals" color={T.aurora1} icon="◎"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,justifyItems:"center",paddingTop:4}}>
                {[
                  {pct:91, v:"91.4%", l:"NEURAL\nSCORE",   c:T.plasma},
                  {pct:86, v:"86%",   l:"ATTEND\nFLUX",    c:T.aurora1},
                  {pct:85, v:"24/28", l:"MISSIONS\nDONE",  c:T.purple},
                  {pct:71, v:"142h",  l:"STUDY\nHOURS",    c:T.gold},
                ].map((s,i)=>(
                  <CosmicRing key={i} pct={s.pct} size={76} color={s.c} value={s.v} label={s.l}/>
                ))}
              </div>

              {/* Mini leaderboard teaser */}
              <div style={{marginTop:18,padding:"12px 14px",borderRadius:14,
                           background:"rgba(0,255,204,0.04)",border:"1px solid rgba(0,255,204,0.10)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <span style={{fontSize:9,fontFamily:"'VT323',monospace",color:"rgba(200,230,240,0.3)",letterSpacing:"0.2em"}}>COHORT STANDING</span>
                  <WarpBadge text="RANK #4" color={T.gold}/>
                </div>
                {[{name:"Riya M.",pct:96},{name:"Karan S.",pct:94},{name:"Dev P.",pct:92},{name:"ARYAN K.",pct:91,me:true}].map((p,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <span style={{width:16,fontSize:9,fontFamily:"'VT323',monospace",
                                  color:p.me?T.gold:"rgba(200,230,240,0.3)"}}>{i+1}</span>
                    <span style={{flex:1,fontSize:10,fontFamily:"'Exo 2',sans-serif",
                                  color:p.me?"rgba(255,215,0,0.9)":"rgba(200,230,240,0.55)",
                                  fontWeight:p.me?600:400}}>{p.name}</span>
                    <EnergyBar pct={p.pct} color={p.me?T.gold:T.aurora1} h={3}/>
                    <span style={{fontSize:11,fontFamily:"'Teko',sans-serif",
                                  color:p.me?T.gold:T.aurora1,minWidth:30,textAlign:"right"}}>{p.pct}%</span>
                  </div>
                ))}
              </div>
            </CrystalPanel>

          </div>
        </div>
      </div>

      {/* ══ GLOBAL STYLES ══ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Teko:wght@400;600;700&family=Exo+2:wght@300;400;500;600&family=VT323&family=Saira+Condensed:wght@100;400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html, body { background: #020408; margin: 0; height: 100%; }
        input::placeholder { color: rgba(200,230,240,0.2); }

        @keyframes holoPan  { 0%{background-position:0% center} 100%{background-position:200% center} }
        @keyframes slideUp  { from{transform:translateY(22px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes eFlow    { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
        @keyframes orbSpin  { to{transform:rotate(360deg)}  }
        @keyframes orbSpinR { to{transform:rotate(-360deg)} }
        @keyframes breathe  { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.1)} }
        @keyframes ringPulse{ 0%{transform:scale(0.6);opacity:1} 100%{transform:scale(2.8);opacity:0} }
        @keyframes scanH    { from{transform:translateY(-100vh)} to{transform:translateY(200vh)} }
        @keyframes dotBounce{ 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes msgIn    { from{transform:translateY(8px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes gravPulse{ 0%,100%{box-shadow:0 0 30px rgba(0,212,255,0.22)} 50%{box-shadow:0 0 55px rgba(0,212,255,0.50)} }

        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.22); border-radius: 2px; }
      `}</style>
    </>
  )
}