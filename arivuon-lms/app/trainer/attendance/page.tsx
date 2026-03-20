// app/trainer/attendance/page.tsx
"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import axios from "axios"
import LuminaBackground from "@/components/background/LuminaBackground"
import LuminaSideNav    from "@/components/layout/LuminaSideNav"
import LuminaTopBar     from "@/components/layout/LuminaTopBar"

/* ─────────────── TYPES ─────────────── */
interface BatchSession { id:number; uuid:string; title:string; session_number:number; session_date:string }
interface UserMini     { id:number; uuid:string; name:string; email:string }
interface AttSummary   { uuid:string; pulse_code:string; is_open:boolean; pulse_expires_at:string; opened_at:string; batch_session?:BatchSession; total_present:number; total_absent:number; total_late:number }
interface AttRecord    { uuid:string; status:string; checked_in_at?:string; marked_by_role:string; note?:string; student?:UserMini }

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

/* ─────────────── COLOURS ─────────────── */
const C = {
  gold:"#ffc933",blue:"#1a96ff",cyan:"#00d4ff",
  green:"#00e5a0",red:"#ff4d6a",purple:"#a78bfa",orange:"#ff8c42",
  surf:"rgba(5,14,32,0.92)", w60:"rgba(255,255,255,0.6)",
  w90:"rgba(255,255,255,0.9)",w70:"rgba(255,255,255,0.7)",
  w50:"rgba(255,255,255,0.5)",w40:"rgba(255,255,255,0.4)",
  w30:"rgba(255,255,255,0.3)",w15:"rgba(255,255,255,0.15)",
  w10:"rgba(255,255,255,0.10)",w08:"rgba(255,255,255,0.08)",w04:"rgba(255,255,255,0.04)",
}
const STATUS_COL:Record<string,string> = { present:C.green, absent:C.red, late:C.orange, excused:C.purple }

function initials(n:string){ return n.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2) }
function fmtTime(s:string){ return new Date(s).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}) }
function secsLeft(exp:string){ return Math.max(0,Math.round((new Date(exp).getTime()-Date.now())/1000)) }

/* ─────────────── TOAST ─────────────── */
function useToast(){
  const [toasts,setToasts]=useState<{id:number;msg:string;type:string}[]>([])
  const show=useCallback((msg:string,type="info")=>{
    const id=Date.now();setToasts(t=>[...t,{id,msg,type}])
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3200)
  },[])
  return {toasts,show}
}

/* ─────────────── SHARED INPUT ─────────────── */
const FI:React.CSSProperties={background:C.w04,border:"1px solid rgba(255,255,255,0.1)",borderRadius:11,padding:"11px 14px",color:C.w90,fontFamily:"'Raleway',sans-serif",fontSize:14,outline:"none",transition:"all .2s",width:"100%"}

/* ─────────────── PULSE CODE DISPLAY ─────────────── */
function PulseCodeDisplay({code,expiresAt,onClose}:{code:string;expiresAt:string;onClose:()=>void}){
  const [secs,setSecs]=useState(secsLeft(expiresAt))
  useEffect(()=>{
    const t=setInterval(()=>setSecs(secsLeft(expiresAt)),1000)
    return ()=>clearInterval(t)
  },[expiresAt])
  const pct=Math.round((secs/Math.max(1,(new Date(expiresAt).getTime()-Date.now()+secs*1000)/1000))*100)
  const col=secs>120?C.green:secs>30?C.orange:C.red

  return(
    <div style={{textAlign:"center",padding:"32px 28px"}}>
      <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:C.w30,letterSpacing:"2px",textTransform:"uppercase",marginBottom:12}}>PULSE CODE — Share with students</div>
      {/* Code digits */}
      <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:24}}>
        {code.split("").map((ch,i)=>(
          <div key={i} style={{width:54,height:68,borderRadius:14,background:`rgba(255,185,0,0.1)`,border:`1px solid rgba(255,185,0,0.35)`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Oxanium',sans-serif",fontWeight:800,fontSize:30,color:C.gold,boxShadow:`0 0 16px rgba(255,185,0,0.2)`}}>
            {ch}
          </div>
        ))}
      </div>
      {/* Timer ring */}
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,marginBottom:24}}>
        <svg width={80} height={80} style={{transform:"rotate(-90deg)"}}>
          <circle cx={40} cy={40} r={34} fill="none" stroke={`${col}15`} strokeWidth={6}/>
          <circle cx={40} cy={40} r={34} fill="none" stroke={col} strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={2*Math.PI*34}
            strokeDashoffset={2*Math.PI*34*(1-Math.min(pct,100)/100)}
            style={{filter:`drop-shadow(0 0 6px ${col})`,transition:"stroke-dashoffset .9s ease"}}/>
        </svg>
        <div style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:22,color:col,marginTop:-68}}>{secs}s</div>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:C.w30,textTransform:"uppercase",letterSpacing:".5px",marginTop:30}}>Window remaining</div>
      </div>
      <button onClick={onClose} style={{padding:"10px 26px",borderRadius:100,border:"1px solid rgba(255,77,106,0.3)",background:"rgba(255,77,106,0.12)",color:C.red,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700,letterSpacing:".5px"}}>
        Close PULSE Window
      </button>
    </div>
  )
}

/* ─────────────── STUDENT ROW ─────────────── */
function StudentRow({record,onMark}:{record:AttRecord;onMark:(uuid:string,status:string)=>void}){
  const [open,setOpen]=useState(false)
  const sc=STATUS_COL[record.status]??C.w40
  return(
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:13,background:C.w04,border:`1px solid ${C.w08}`,transition:"background .2s",marginBottom:8}}
      onMouseEnter={e=>e.currentTarget.style.background="rgba(26,150,255,0.05)"}
      onMouseLeave={e=>e.currentTarget.style.background=C.w04}>
      <div style={{width:36,height:36,borderRadius:10,background:`${sc}14`,border:`1px solid ${sc}28`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:12,color:sc,flexShrink:0}}>
        {record.student ? initials(record.student.name) : "?"}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontFamily:"'Raleway',sans-serif",fontSize:14,fontWeight:600,color:C.w90}}>{record.student?.name??`Student`}</div>
        <div style={{fontFamily:"'Raleway',sans-serif",fontSize:12,color:C.w40}}>{record.student?.email}</div>
      </div>
      {record.checked_in_at && <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:C.w30}}>{fmtTime(record.checked_in_at)}</div>}
      {/* Status chip */}
      <span style={{padding:"3px 10px",borderRadius:100,fontFamily:"'Share Tech Mono',monospace",fontSize:9,letterSpacing:".5px",textTransform:"uppercase",background:`${sc}12`,border:`1px solid ${sc}25`,color:sc,flexShrink:0}}>
        {record.status}
      </span>
      {/* Quick mark dropdown */}
      <div style={{position:"relative",flexShrink:0}}>
        <button onClick={()=>setOpen(o=>!o)} style={{width:28,height:28,borderRadius:7,border:"1px solid rgba(255,185,0,0.2)",background:"rgba(255,185,0,0.06)",cursor:"pointer",color:C.gold,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>✎</button>
        {open && (
          <div style={{position:"absolute",right:0,top:32,zIndex:50,background:"rgba(5,14,32,0.98)",border:"1px solid rgba(255,185,0,0.2)",borderRadius:12,overflow:"hidden",boxShadow:"0 12px 40px rgba(0,0,0,0.6)",minWidth:130}}>
            {["present","absent","late","excused"].map(s=>(
              <div key={s} onClick={()=>{onMark(record.student?.uuid??"",s);setOpen(false)}}
                style={{padding:"10px 14px",cursor:"pointer",fontFamily:"'Raleway',sans-serif",fontSize:13,fontWeight:500,color:STATUS_COL[s]??C.w60,transition:"background .15s"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                {s.charAt(0).toUpperCase()+s.slice(1)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────── MAIN PAGE ─────────────── */
export default function TrainerAttendancePage(){
  const {toasts,show:toast} = useToast()

  // In production get these from auth context/cookie
  const TRAINER_UUID = "t001"

  const [sessions,  setSessions]  = useState<AttSummary[]>([])
  const [active,    setActive]    = useState<AttSummary|null>(null)
  const [records,   setRecords]   = useState<AttRecord[]>([])
  const [loading,   setLoading]   = useState(true)
  const [opening,   setOpening]   = useState(false)
  const [showOpen,  setShowOpen]  = useState(false)

  // Open-pulse form
  const [bsUUID,    setBsUUID]    = useState("")
  const [winMins,   setWinMins]   = useState(15)

  const pollRef = useRef<NodeJS.Timeout|null>(null)

  /* ── Load sessions list ── */
  const loadSessions = useCallback(async()=>{
    try{
      const r = await axios.get(`${API}/attendance/sessions`)
      setSessions(r.data?.data ?? r.data ?? [])
    }catch{
      // demo fallback
      setSessions([
        {uuid:"as001",pulse_code:"X4P9RK",is_open:true,pulse_expires_at:new Date(Date.now()+8*60000).toISOString(),opened_at:new Date().toISOString(),batch_session:{id:1,uuid:"bs001",title:"Neural Networks Lab",session_number:5,session_date:new Date().toISOString().split("T")[0]},total_present:8,total_absent:3,total_late:1},
        {uuid:"as002",pulse_code:"M7NWZA",is_open:false,pulse_expires_at:new Date(Date.now()-30*60000).toISOString(),opened_at:new Date(Date.now()-60*60000).toISOString(),batch_session:{id:2,uuid:"bs002",title:"React Workshop #4",session_number:4,session_date:new Date().toISOString().split("T")[0]},total_present:12,total_absent:2,total_late:0},
      ])
    }finally{ setLoading(false) }
  },[])

  /* ── Load records for active session ── */
  const loadRecords = useCallback(async(attUUID:string)=>{
    try{
      const r = await axios.get(`${API}/attendance/sessions/${attUUID}/report`)
      const data = r.data?.data
      setRecords(data?.records ?? [])
      // Also refresh summary
      setSessions(s=>s.map(x=>x.uuid===attUUID?{...x,...(data?.attendance_session??{})}:x))
    }catch{
      setRecords([
        {uuid:"r1",status:"present",checked_in_at:new Date().toISOString(),marked_by_role:"self",student:{id:1,uuid:"s001",name:"Aryan Kumar",email:"aryan@example.com"}},
        {uuid:"r2",status:"present",checked_in_at:new Date().toISOString(),marked_by_role:"self",student:{id:2,uuid:"s002",name:"Priya Sharma",email:"priya@example.com"}},
        {uuid:"r3",status:"absent", checked_in_at:undefined,               marked_by_role:"trainer",student:{id:3,uuid:"s003",name:"Rahul Singh", email:"rahul@example.com"}},
        {uuid:"r4",status:"late",   checked_in_at:new Date().toISOString(),marked_by_role:"self",  student:{id:4,uuid:"s004",name:"Sneha Patel",  email:"sneha@example.com"}},
      ])
    }
  },[])

  useEffect(()=>{ loadSessions() },[loadSessions])

  // Poll records every 8s when a session is selected and open
  useEffect(()=>{
    if(active?.is_open){
      pollRef.current = setInterval(()=>loadRecords(active.uuid),8000)
    }
    return ()=>{ if(pollRef.current)clearInterval(pollRef.current) }
  },[active,loadRecords])

  const selectSession = async(s:AttSummary)=>{
    setActive(s)
    await loadRecords(s.uuid)
  }

  /* ── Open pulse ── */
  const openPulse = async()=>{
    if(!bsUUID.trim()){ toast("Paste a batch session UUID","error"); return }
    setOpening(true)
    try{
      const r = await axios.post(`${API}/attendance/sessions/open?opened_by_uuid=${TRAINER_UUID}`,{
        batch_session_uuid:bsUUID.trim(), window_minutes:winMins
      })
      const att = r.data?.data ?? r.data
      setSessions(s=>[att,...s])
      setActive(att); setRecords([])
      setShowOpen(false); setBsUUID(""); setWinMins(15)
      toast("PULSE opened!","success")
    }catch(e:any){
      toast(e?.response?.data?.detail??"Failed to open pulse","error")
    }finally{ setOpening(false) }
  }

  /* ── Close pulse ── */
  const closePulse = async()=>{
    if(!active)return
    try{
      await axios.post(`${API}/attendance/sessions/${active.uuid}/close`)
      setActive(a=>a?{...a,is_open:false}:null)
      setSessions(s=>s.map(x=>x.uuid===active.uuid?{...x,is_open:false}:x))
      toast("PULSE closed","info")
    }catch{ toast("Failed to close","error") }
  }

  /* ── Manual mark ── */
  const markStudent = async(studentUUID:string, status:string)=>{
    if(!active||!studentUUID)return
    try{
      await axios.post(`${API}/attendance/sessions/${active.uuid}/mark?marker_uuid=${TRAINER_UUID}&marker_role=trainer`,{
        student_uuid:studentUUID, status
      })
      await loadRecords(active.uuid)
      toast(`Marked ${status}`,"success")
    }catch{ toast("Failed to mark","error") }
  }

  /* ── Stats ── */
  const present = records.filter(r=>r.status==="present").length
  const absent  = records.filter(r=>r.status==="absent").length
  const late    = records.filter(r=>r.status==="late").length
  const total   = records.length
  const pct     = total ? Math.round(((present+late)/total)*100) : 0

  const FIS:React.CSSProperties={...FI,padding:"9px 14px",fontSize:13}

  return(
    <>
      <LuminaBackground/>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:1}}>
        <div style={{position:"absolute",width:"100%",height:1,background:"linear-gradient(90deg,transparent,rgba(26,150,255,0.08),rgba(26,150,255,0.12),rgba(26,150,255,0.08),transparent)",animation:"lu-scan 18s linear infinite"}}/>
      </div>

      <div style={{display:"flex",height:"100vh",overflow:"hidden",position:"relative",zIndex:2}}>
        <LuminaSideNav role="trainer"/>

        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
          <LuminaTopBar role="trainer"/>

          <div style={{flex:1,display:"flex",overflow:"hidden"}}>

            {/* ── LEFT PANEL: session list ── */}
            <div style={{width:320,flexShrink:0,borderRight:`1px solid ${C.w08}`,display:"flex",flexDirection:"column",overflow:"hidden"}}>
              <div style={{padding:"18px 16px 12px",borderBottom:`1px solid ${C.w08}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:16,color:C.w90}}>Attendance</div>
                  <div style={{fontFamily:"'Raleway',sans-serif",fontSize:12,color:C.w40,marginTop:2}}>PULSE sessions</div>
                </div>
                <button onClick={()=>setShowOpen(true)} style={{padding:"7px 14px",borderRadius:100,border:"none",background:`linear-gradient(135deg,${C.blue},${C.cyan})`,color:"white",cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:11,fontWeight:700,letterSpacing:".5px",boxShadow:"0 0 16px rgba(26,150,255,0.3)"}}>
                  + Open PULSE
                </button>
              </div>

              <div style={{flex:1,overflowY:"auto",padding:"10px 12px"}}>
                {loading ? (
                  <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:100}}>
                    <div style={{width:24,height:24,borderRadius:"50%",border:"2px solid rgba(26,150,255,0.2)",borderTopColor:C.blue,animation:"lu-spin .8s linear infinite"}}/>
                  </div>
                ) : sessions.map(s=>(
                  <div key={s.uuid} onClick={()=>selectSession(s)}
                    style={{padding:"13px 14px",borderRadius:14,marginBottom:8,cursor:"pointer",border:`1px solid ${active?.uuid===s.uuid?"rgba(26,150,255,0.35)":C.w08}`,background:active?.uuid===s.uuid?"rgba(26,150,255,0.1)":C.w04,transition:"all .2s"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                      <span style={{width:7,height:7,borderRadius:"50%",background:s.is_open?C.green:C.w30,boxShadow:s.is_open?`0 0 8px ${C.green}`:"none",display:"inline-block",animation:s.is_open?"lu-pulse 2s ease-in-out infinite":"none"}}/>
                      <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,letterSpacing:".5px",textTransform:"uppercase",color:s.is_open?C.green:C.w30}}>{s.is_open?"LIVE":"Closed"}</span>
                    </div>
                    <div style={{fontFamily:"'Raleway',sans-serif",fontSize:13,fontWeight:600,color:C.w90,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {s.batch_session?.title??"Session"}
                    </div>
                    <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:C.gold,letterSpacing:"1px"}}>{s.pulse_code}</div>
                    <div style={{display:"flex",gap:10,marginTop:6}}>
                      {[{l:"P",v:s.total_present,c:C.green},{l:"A",v:s.total_absent,c:C.red},{l:"L",v:s.total_late,c:C.orange}].map(x=>(
                        <span key={x.l} style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:x.c}}>{x.l}: {x.v}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

              {active ? (
                <>
                  {/* Header */}
                  <div style={{padding:"18px 22px",borderBottom:`1px solid ${C.w08}`,display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:18,color:C.w90}}>{active.batch_session?.title}</div>
                      <div style={{fontFamily:"'Raleway',sans-serif",fontSize:13,color:C.w40}}>Session #{active.batch_session?.session_number} · {active.batch_session?.session_date}</div>
                    </div>
                    {/* Stats */}
                    {[{v:present,l:"Present",c:C.green},{v:absent,l:"Absent",c:C.red},{v:late,l:"Late",c:C.orange},{v:`${pct}%`,l:"Rate",c:C.blue}].map(s=>(
                      <div key={s.l} style={{textAlign:"center",padding:"10px 16px",borderRadius:12,background:`${s.c}08`,border:`1px solid ${s.c}18`}}>
                        <div style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:20,color:s.c}}>{s.v}</div>
                        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w30,textTransform:"uppercase",letterSpacing:".5px"}}>{s.l}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{flex:1,display:"flex",overflow:"hidden"}}>
                    {/* Students list */}
                    <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
                      {records.length===0 ? (
                        <div style={{textAlign:"center",padding:"60px 20px"}}>
                          <div style={{fontSize:44,marginBottom:14,opacity:.5}}>◎</div>
                          <div style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:18,color:C.w50,marginBottom:6}}>Waiting for check-ins</div>
                          <div style={{fontFamily:"'Raleway',sans-serif",fontSize:14,color:C.w30}}>Share the PULSE code with your students</div>
                        </div>
                      ) : records.map(r=>(
                        <StudentRow key={r.uuid} record={r} onMark={markStudent}/>
                      ))}
                    </div>

                    {/* Pulse code panel (if open) */}
                    {active.is_open && (
                      <div style={{width:300,flexShrink:0,borderLeft:`1px solid ${C.w08}`,background:"rgba(5,14,32,0.6)"}}>
                        <PulseCodeDisplay
                          code={active.pulse_code}
                          expiresAt={active.pulse_expires_at}
                          onClose={closePulse}
                        />
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:40,textAlign:"center"}}>
                  <div style={{fontSize:60,marginBottom:20,opacity:.4}}>◎</div>
                  <div style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:22,color:C.w50,marginBottom:8}}>No session selected</div>
                  <div style={{fontFamily:"'Raleway',sans-serif",fontSize:14,color:C.w30,marginBottom:24}}>Select an attendance session from the left, or open a new PULSE</div>
                  <button onClick={()=>setShowOpen(true)} style={{padding:"11px 24px",borderRadius:100,border:"none",background:`linear-gradient(135deg,${C.blue},${C.cyan})`,color:"white",cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700,boxShadow:"0 0 24px rgba(26,150,255,0.35)"}}>
                    + Open a PULSE
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Open PULSE dialog ── */}
      {showOpen && (
        <div style={{position:"fixed",inset:0,background:"rgba(2,8,16,0.86)",backdropFilter:"blur(7px)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}
          onClick={e=>{if(e.target===e.currentTarget)setShowOpen(false)}}>
          <div style={{background:"rgba(5,14,32,0.98)",border:"1px solid rgba(26,150,255,0.22)",borderRadius:22,backdropFilter:"blur(48px)",maxWidth:460,width:"100%",boxShadow:"0 32px 90px rgba(0,0,0,0.75)",position:"relative"}}>
            <div style={{position:"absolute",top:0,left:"8%",right:"8%",height:1,background:"linear-gradient(90deg,transparent,rgba(26,150,255,0.55),transparent)"}}/>
            <div style={{padding:"24px 26px 20px",borderBottom:`1px solid ${C.w08}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:19,color:C.w90}}>Open PULSE Window</div>
                <div style={{fontFamily:"'Raleway',sans-serif",fontSize:13,color:C.w40,marginTop:3,fontWeight:300}}>Generate a 6-digit code for your class</div>
              </div>
              <button onClick={()=>setShowOpen(false)} style={{width:32,height:32,borderRadius:9,border:`1px solid ${C.w10}`,background:C.w04,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:C.w50,fontSize:17}} onMouseEnter={e=>{e.currentTarget.style.color=C.red}} onMouseLeave={e=>{e.currentTarget.style.color=C.w50}}>✕</button>
            </div>
            <div style={{padding:"20px 26px"}}>
              <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
                <label style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w40,letterSpacing:"1.5px",textTransform:"uppercase"}}>Batch Session UUID *</label>
                <input style={FIS} value={bsUUID} onChange={e=>setBsUUID(e.target.value)} placeholder="Paste session UUID from Schedules" onFocus={e=>{e.currentTarget.style.borderColor="rgba(26,150,255,0.45)"}} onBlur={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"}}/>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                <label style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w40,letterSpacing:"1.5px",textTransform:"uppercase"}}>Window Duration — {winMins} minutes</label>
                <input type="range" min={1} max={60} value={winMins} onChange={e=>setWinMins(Number(e.target.value))} style={{accentColor:C.blue,width:"100%",cursor:"pointer"}}/>
                <div style={{display:"flex",justifyContent:"space-between",fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w30}}>
                  <span>1 min</span><span>60 min</span>
                </div>
              </div>
            </div>
            <div style={{padding:"16px 26px 22px",borderTop:`1px solid ${C.w08}`,display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button onClick={()=>setShowOpen(false)} style={{padding:"10px 18px",borderRadius:100,border:`1px solid ${C.w15}`,background:C.w04,color:C.w70,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700}}>Cancel</button>
              <button onClick={openPulse} disabled={opening} style={{padding:"10px 22px",borderRadius:100,border:"none",background:`linear-gradient(135deg,${C.blue},${C.cyan})`,color:"white",cursor:opening?"not-allowed":"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700,boxShadow:"0 0 20px rgba(26,150,255,0.35)",display:"flex",alignItems:"center",gap:8}}>
                {opening?<><span style={{width:14,height:14,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.2)",borderTopColor:"white",animation:"lu-spin .8s linear infinite",display:"inline-block"}}/>Opening…</>:"Generate PULSE"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOASTS */}
      <div style={{position:"fixed",bottom:28,right:28,zIndex:1000,display:"flex",flexDirection:"column",gap:10}}>
        {toasts.map(t=>(
          <div key={t.id} style={{padding:"12px 18px",borderRadius:14,backdropFilter:"blur(24px)",fontFamily:"'Raleway',sans-serif",fontSize:14,fontWeight:500,display:"flex",alignItems:"center",gap:10,minWidth:260,boxShadow:"0 8px 32px rgba(0,0,0,0.5)",background:t.type==="success"?"rgba(0,229,160,0.12)":t.type==="error"?"rgba(255,77,106,0.12)":"rgba(26,150,255,0.1)",border:`1px solid ${t.type==="success"?"rgba(0,229,160,0.3)":t.type==="error"?"rgba(255,77,106,0.3)":"rgba(26,150,255,0.28)"}`,color:t.type==="success"?C.green:t.type==="error"?C.red:C.blue}}>
            <span>{t.type==="success"?"✅":t.type==="error"?"⛔":"◉"}</span><span>{t.msg}</span>
          </div>
        ))}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@400;600;700;800&family=Raleway:wght@300;400;500;600&family=Share+Tech+Mono&display=swap');
        *,*::before,*::after{box-sizing:border-box}html,body{background:#020810;margin:0;height:100%}
        input::placeholder{color:rgba(200,220,255,0.22);font-family:'Raleway',sans-serif}
        @keyframes lu-scan{from{transform:translateY(-100vh)}to{transform:translateY(200vh)}}
        @keyframes lu-spin{to{transform:rotate(360deg)}}
        @keyframes lu-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.2)}}
        ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(26,150,255,0.2);border-radius:4px}
        input[type=range]::-webkit-slider-track{height:4px;border-radius:4px;background:rgba(255,255,255,0.08)}
        input[type=range]::-webkit-slider-thumb{width:16px;height:16px;border-radius:50%;background:var(--blue,#1a96ff)}
      `}</style>
    </>
  )
}

declare module "react"{ interface CSSProperties{ [key:string]:any } }