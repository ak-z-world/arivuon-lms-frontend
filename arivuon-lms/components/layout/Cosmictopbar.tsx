"use client"

import { useState, useEffect } from "react"

type Role = "student" | "trainer" | "admin"

const ACCENT: Record<Role,string> = {
  student: "#00D4FF",
  trainer: "#A78BFA",
  admin:   "#00FFCC",
}

export default function CosmicTopBar({ role = "student" }: { role?: Role }) {
  const [time, setTime] = useState("")
  const [cmd,  setCmd]  = useState(false)

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString("en-US", { hour12: false, hour:"2-digit", minute:"2-digit", second:"2-digit" }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmd(c => !c) }
      if (e.key === "Escape") setCmd(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const accent = ACCENT[role]

  return (
    <>
      <div style={{
        height: 52, flexShrink: 0,
        background: "rgba(2,4,8,0.92)",
        borderBottom: "1px solid rgba(0,212,255,0.08)",
        backdropFilter: "blur(20px)",
        display: "flex", alignItems: "center",
        padding: "0 22px", gap: 16,
        position: "relative", zIndex: 15,
      }}>

        {/* Brand wordmark */}
        <span style={{
          fontFamily: "'Teko', sans-serif", fontWeight: 700, fontSize: 20,
          letterSpacing: "0.3em",
          background: `linear-gradient(90deg,${accent},#A78BFA)`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>ARIVUON</span>

        <div style={{ flex: 1 }} />

        {/* ⌘K hint */}
        <button onClick={() => setCmd(true)} style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "7px 14px", borderRadius: 10,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          cursor: "pointer", transition: "all 0.2s",
          color: "rgba(200,230,240,0.28)",
          fontFamily: "'Exo 2', sans-serif", fontSize: 11, letterSpacing: "0.08em",
        }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(0,212,255,0.25)";e.currentTarget.style.color="rgba(200,230,240,0.6)"}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.07)";e.currentTarget.style.color="rgba(200,230,240,0.28)"}}>
          <span>Search universe…</span>
          <span style={{
            display:"inline-flex",alignItems:"center",gap:2,
            background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",
            borderRadius:5,padding:"1px 6px",fontSize:10,fontFamily:"monospace",
          }}>⌘K</span>
        </button>

        {/* Live clock */}
        <div style={{
          fontFamily: "'VT323', monospace", fontSize: 16,
          color: accent, letterSpacing: "0.15em",
          textShadow: `0 0 10px ${accent}60`,
          padding: "5px 12px", borderRadius: 8,
          background: `${accent}08`,
          border: `1px solid ${accent}18`,
        }}>{time}</div>

        {/* Notification bell */}
        <button style={{
          width: 36, height: 36, borderRadius: 10,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          cursor: "pointer", display:"flex", alignItems:"center", justifyContent:"center",
          fontSize: 16, position: "relative", transition: "all 0.2s",
          color: "rgba(200,230,240,0.5)",
        }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=accent+"30";e.currentTarget.style.color=accent}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.07)";e.currentTarget.style.color="rgba(200,230,240,0.5)"}}>
          🔔
          <div style={{
            position:"absolute",top:6,right:6,width:7,height:7,borderRadius:"50%",
            background:"#FF006E",border:"1.5px solid #020408",
            boxShadow:"0 0 6px #FF006E",
          }}/>
        </button>

        {/* Avatar */}
        <div style={{
          width:34,height:34,borderRadius:"50%",
          background:`linear-gradient(135deg,${accent},${accent}66)`,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontFamily:"'Exo 2',sans-serif",fontWeight:700,fontSize:14,color:"#020408",
          cursor:"pointer",boxShadow:`0 0 14px ${accent}35`,
        }}>A</div>
      </div>

      {/* Command palette modal */}
      {cmd && (
        <div className="fixed inset-0" style={{ zIndex: 200 }} onClick={() => setCmd(false)}>
          <div style={{
            position:"absolute",top:"22%",left:"50%",transform:"translateX(-50%)",
            width:"100%",maxWidth:560,
            background:"rgba(4,10,22,0.97)",
            border:"1px solid rgba(0,212,255,0.22)",
            borderRadius:18,backdropFilter:"blur(40px)",
            boxShadow:"0 0 0 1px rgba(0,212,255,0.06),0 40px 120px rgba(0,0,0,0.85)",
            overflow:"hidden",animation:"warpIn 0.22s ease both",
          }} onClick={e => e.stopPropagation()}>
            <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 18px",borderBottom:"1px solid rgba(0,212,255,0.1)"}}>
              <span style={{fontSize:14,color:"rgba(200,230,240,0.35)"}}>🔍</span>
              <input autoFocus placeholder="Search universe, courses, sessions…"
                style={{flex:1,background:"none",border:"none",outline:"none",
                        color:"#E8F4FF",fontSize:15,fontFamily:"'Exo 2',sans-serif",
                        letterSpacing:"0.02em"}}/>
              <span style={{fontFamily:"monospace",fontSize:10,color:"rgba(200,230,240,0.2)",
                            background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",
                            borderRadius:5,padding:"2px 7px"}}>ESC</span>
            </div>
            <div style={{padding:"8px 0"}}>
              {["Go to Dashboard","Open ARIA AI","View Courses","Check Attendance","Leaderboard"].map((cmd,i)=>(
                <div key={i} style={{padding:"10px 18px",cursor:"pointer",fontSize:13,
                                     fontFamily:"'Exo 2',sans-serif",color:"rgba(200,230,240,0.6)",
                                     letterSpacing:"0.04em",transition:"all 0.15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,212,255,0.07)";e.currentTarget.style.color="#E8F4FF"}}
                  onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="rgba(200,230,240,0.6)"}}>
                  {cmd}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes warpIn {
          from { transform:translateX(-50%) scaleY(0.85); opacity:0; filter:blur(8px); }
          to   { transform:translateX(-50%) scaleY(1);    opacity:1; filter:blur(0);   }
        }
      `}</style>
    </>
  )
}