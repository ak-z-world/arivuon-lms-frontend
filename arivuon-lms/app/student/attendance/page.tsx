// app/student/attendance/page.tsx
"use client"

import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import LuminaBackground from "@/components/background/LuminaBackground"
import LuminaSideNav    from "@/components/layout/LuminaSideNav"
import LuminaTopBar     from "@/components/layout/LuminaTopBar"

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

/* ─────────────── TYPES ─────────────── */
interface AttRecord  { uuid:string; status:string; checked_in_at?:string; marked_by_role:string; attendance_session?:{ uuid:string; opened_at:string; batch_session?:{ title:string; session_number:number; session_date:string } } }
interface Summary    { total_sessions:number; present:number; absent:number; late:number; excused:number; attendance_pct:number }

/* ─────────────── COLOURS ─────────────── */
const C = {
  blue:"#1a96ff",cyan:"#00d4ff",gold:"#ffc933",
  green:"#00e5a0",red:"#ff4d6a",purple:"#a78bfa",orange:"#ff8c42",
  surf:"rgba(5,14,32,0.92)", w06:"rgba(255,255,255,0.06)",
  w90:"rgba(255,255,255,0.9)",w70:"rgba(255,255,255,0.7)",
  w60:"rgba(255,255,255,0.6)",w50:"rgba(255,255,255,0.5)",w40:"rgba(255,255,255,0.4)",
  w30:"rgba(255,255,255,0.3)",w15:"rgba(255,255,255,0.15)",
  w10:"rgba(255,255,255,0.10)",w08:"rgba(255,255,255,0.08)",w04:"rgba(255,255,255,0.04)",
}
const STATUS_META:Record<string,{color:string;icon:string;label:string}> = {
  present: { color:C.green,   icon:"✅", label:"Present"  },
  absent:  { color:C.red,     icon:"⛔", label:"Absent"   },
  late:    { color:C.orange,  icon:"⏰", label:"Late"     },
  excused: { color:C.purple,  icon:"📋", label:"Excused"  },
}

function fmtDate(s:string){ return new Date(s).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric",weekday:"short"}) }
function fmtTime(s:string){ return new Date(s).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}) }

/* ─────────────── TOAST ─────────────── */
function useToast(){
  const [toasts,setToasts]=useState<{id:number;msg:string;type:string}[]>([])
  const show=useCallback((msg:string,type="info")=>{
    const id=Date.now();setToasts(t=>[...t,{id,msg,type}])
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3200)
  },[])
  return{toasts,show}
}

/* ─────────────── PULSE CHECK-IN PANEL ─────────────── */
function PulseCheckIn({ attSessionUUID, studentUUID, onSuccess }:{attSessionUUID:string;studentUUID:string;onSuccess:(msg:string)=>void}){
  const [code,setCode]=useState(["","","","","",""])
  const [loading,setLoading]=useState(false)
  const [err,setErr]=useState("")
  const refs = Array.from({length:6},()=>useState<HTMLInputElement|null>(null))

  const handleKey=(i:number,val:string)=>{
    if(!/^[A-Z0-9]$/i.test(val) && val!=="")return
    const next=[...code]; next[i]=val.toUpperCase(); setCode(next)
    if(val && i<5){ document.getElementById(`pc-${i+1}`)?.focus() }
    if(!val && i>0){ document.getElementById(`pc-${i-1}`)?.focus() }
  }

  const handlePaste=(e:React.ClipboardEvent)=>{
    const text=e.clipboardData.getData("text").replace(/\s/g,"").toUpperCase().slice(0,6)
    const next=[...code]
    text.split("").forEach((c,i)=>{ if(i<6)next[i]=c })
    setCode(next)
    document.getElementById(`pc-5`)?.focus()
  }

  const submit=async()=>{
    const pulse=code.join("")
    if(pulse.length<6){ setErr("Enter all 6 digits"); return }
    setLoading(true); setErr("")
    try{
      await axios.post(`${API}/attendance/sessions/${attSessionUUID}/checkin?student_uuid=${studentUUID}`,{ pulse_code:pulse })
      onSuccess("You're marked Present! ✅")
    }catch(e:any){
      setErr(e?.response?.data?.detail??"Invalid code — try again")
    }finally{ setLoading(false) }
  }

  return(
    <div style={{padding:"28px 0",textAlign:"center"}}>
      <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:C.w40,letterSpacing:"2px",textTransform:"uppercase",marginBottom:6}}>Enter PULSE code from your trainer</div>
      <div style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:18,color:C.w90,marginBottom:22}}>Type the 6-character code</div>

      {/* Code boxes */}
      <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:20}}>
        {code.map((ch,i)=>(
          <input
            key={i} id={`pc-${i}`}
            maxLength={1}
            value={ch}
            onPaste={handlePaste}
            onChange={e=>handleKey(i,e.target.value)}
            onKeyDown={e=>{ if(e.key==="Backspace"&&!ch&&i>0){ document.getElementById(`pc-${i-1}`)?.focus() } if(e.key==="Enter")submit() }}
            style={{
              width:52,height:64,borderRadius:14,textAlign:"center",
              fontFamily:"'Oxanium',sans-serif",fontWeight:800,fontSize:26,
              background:ch?"rgba(26,150,255,0.12)":"rgba(255,255,255,0.04)",
              border:`1px solid ${ch?"rgba(26,150,255,0.45)":"rgba(255,255,255,0.12)"}`,
              color:ch?C.blue:C.w40,outline:"none",cursor:"pointer",
              boxShadow:ch?`0 0 14px rgba(26,150,255,0.2)`:"none",
              transition:"all .2s",textTransform:"uppercase",
            }}
          />
        ))}
      </div>

      {err && (
        <div style={{fontFamily:"'Raleway',sans-serif",fontSize:13,color:C.red,marginBottom:16,padding:"9px 16px",borderRadius:10,background:"rgba(255,77,106,0.1)",border:"1px solid rgba(255,77,106,0.25)",display:"inline-block"}}>{err}</div>
      )}

      <div style={{display:"flex",gap:10,justifyContent:"center"}}>
        <button onClick={()=>setCode(["","","","","",""])} style={{padding:"10px 20px",borderRadius:100,border:`1px solid ${C.w15}`,background:C.w04,color:C.w60,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700}}>Clear</button>
        <button onClick={submit} disabled={loading||code.join("").length<6} style={{padding:"10px 26px",borderRadius:100,border:"none",background:loading||code.join("").length<6?"rgba(26,150,255,0.3)":"linear-gradient(135deg,#1a96ff,#00d4ff)",color:"white",cursor:loading||code.join("").length<6?"not-allowed":"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700,boxShadow:"0 0 20px rgba(26,150,255,0.3)",display:"flex",alignItems:"center",gap:8}}>
          {loading?<><span style={{width:14,height:14,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.2)",borderTopColor:"white",animation:"lu-spin .8s linear infinite",display:"inline-block"}}/>Checking in…</>:"Check In ✓"}
        </button>
      </div>
    </div>
  )
}

/* ─────────────── ARC RING ─────────────── */
function ArcRing({pct,size=90,color=C.blue,value,label}:{pct:number;size:number;color:string;value:string;label:string}){
  const r=(size-10)/2, circ=2*Math.PI*r
  const [p,setP]=useState(0)
  useEffect(()=>{ const t=setTimeout(()=>setP(pct),250); return()=>clearTimeout(t) },[pct])
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
      <div style={{position:"relative",width:size,height:size}}>
        <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${color}15`} strokeWidth={7}/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7}
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ*(1-p/100)}
            style={{filter:`drop-shadow(0 0 5px ${color})`,transition:"stroke-dashoffset 1.4s ease"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:size*.2,color,lineHeight:1}}>{value}</span>
        </div>
      </div>
      <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w30,textTransform:"uppercase",letterSpacing:".8px",textAlign:"center"}}>{label}</span>
    </div>
  )
}

/* ─────────────── MAIN PAGE ─────────────── */
export default function StudentAttendancePage(){
  const {toasts,show:toast}=useToast()

  // In production derive from auth
  const STUDENT_UUID = "s001"
  const ATT_SESSION_UUID = "as001"  // In production, get from current active session API

  const [history,  setHistory]  = useState<AttRecord[]>([])
  const [summary,  setSummary]  = useState<Summary|null>(null)
  const [loading,  setLoading]  = useState(true)
  const [view,     setView]     = useState<"checkin"|"history">("checkin")
  const [checkedIn,setCheckedIn]=useState(false)

  const load = useCallback(async()=>{
    setLoading(true)
    try{
      const [histR, sumR] = await Promise.all([
        axios.get(`${API}/attendance/students/${STUDENT_UUID}/history`),
        axios.get(`${API}/attendance/students/${STUDENT_UUID}/summary`),
      ])
      setHistory(histR.data?.data ?? histR.data ?? [])
      setSummary(sumR.data?.data ?? sumR.data)
    }catch{
      // Demo data
      const today=new Date().toISOString()
      setHistory([
        {uuid:"r1",status:"present",checked_in_at:today,marked_by_role:"self",attendance_session:{uuid:"as001",opened_at:today,batch_session:{title:"Neural Networks Lab",session_number:5,session_date:"2025-03-15"}}},
        {uuid:"r2",status:"late",   checked_in_at:today,marked_by_role:"self",attendance_session:{uuid:"as002",opened_at:today,batch_session:{title:"React Workshop",session_number:4,session_date:"2025-03-12"}}},
        {uuid:"r3",status:"absent", checked_in_at:undefined, marked_by_role:"trainer",attendance_session:{uuid:"as003",opened_at:today,batch_session:{title:"Neural Networks Lab",session_number:4,session_date:"2025-03-10"}}},
        {uuid:"r4",status:"present",checked_in_at:today,marked_by_role:"self",attendance_session:{uuid:"as004",opened_at:today,batch_session:{title:"Cloud DevOps",session_number:2,session_date:"2025-03-08"}}},
        {uuid:"r5",status:"present",checked_in_at:today,marked_by_role:"self",attendance_session:{uuid:"as005",opened_at:today,batch_session:{title:"React Workshop",session_number:3,session_date:"2025-03-05"}}},
        {uuid:"r6",status:"excused",checked_in_at:undefined,marked_by_role:"admin",attendance_session:{uuid:"as006",opened_at:today,batch_session:{title:"Neural Networks Lab",session_number:3,session_date:"2025-03-03"}}},
      ])
      setSummary({total_sessions:6,present:4,absent:1,late:1,excused:1,attendance_pct:83.3})
    }finally{ setLoading(false) }
  },[STUDENT_UUID])

  useEffect(()=>{ load() },[load])

  const onCheckInSuccess=(msg:string)=>{
    toast(msg,"success")
    setCheckedIn(true)
    load()
  }

  const pctCol = (summary?.attendance_pct??0)>=75 ? C.green : (summary?.attendance_pct??0)>=50 ? C.orange : C.red

  return(
    <>
      <LuminaBackground/>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:1}}>
        <div style={{position:"absolute",width:"100%",height:1,background:"linear-gradient(90deg,transparent,rgba(0,212,255,0.06),rgba(0,212,255,0.12),rgba(0,212,255,0.06),transparent)",animation:"lu-scan 18s linear infinite"}}/>
      </div>

      <div style={{display:"flex",height:"100vh",overflow:"hidden",position:"relative",zIndex:2}}>
        <LuminaSideNav role="student"/>

        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
          <LuminaTopBar role="student"/>

          <div style={{flex:1,overflowY:"auto",padding:"22px 24px 44px"}}>
            <div style={{maxWidth:1100,margin:"0 auto"}}>

              {/* PAGE HEADER */}
              <div style={{marginBottom:24}}>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:C.cyan,letterSpacing:"2px",textTransform:"uppercase",marginBottom:5,display:"flex",alignItems:"center",gap:8}}>
                  <span style={{width:16,height:1,background:C.cyan,opacity:.6,display:"inline-block"}}/>My Attendance
                </div>
                <h1 style={{fontFamily:"'Oxanium',sans-serif",fontWeight:800,fontSize:"clamp(20px,3vw,30px)",color:C.w90,letterSpacing:"-.5px",margin:0,lineHeight:1.1}}>Attendance Tracker</h1>
                <p style={{fontFamily:"'Raleway',sans-serif",fontSize:14,color:C.w50,margin:"4px 0 0",fontWeight:300}}>Check in to live sessions and track your attendance history</p>
              </div>

              {/* SUMMARY RINGS */}
              {summary && (
                <div style={{background:C.surf,border:`1px solid rgba(0,212,255,0.15)`,borderRadius:20,padding:"24px 28px",marginBottom:22,backdropFilter:"blur(28px)",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:0,left:"8%",right:"8%",height:1,background:"linear-gradient(90deg,transparent,rgba(0,212,255,0.45),transparent)"}}/>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-around",flexWrap:"wrap",gap:20}}>
                    <ArcRing pct={summary.attendance_pct} size={96} color={pctCol} value={`${summary.attendance_pct}%`} label="Overall Rate"/>
                    <ArcRing pct={Math.round(summary.present/Math.max(1,summary.total_sessions)*100)} size={80} color={C.green} value={String(summary.present)} label="Present"/>
                    <ArcRing pct={Math.round(summary.late/Math.max(1,summary.total_sessions)*100)} size={80} color={C.orange} value={String(summary.late)} label="Late"/>
                    <ArcRing pct={Math.round(summary.absent/Math.max(1,summary.total_sessions)*100)} size={80} color={C.red} value={String(summary.absent)} label="Absent"/>
                    <ArcRing pct={Math.round(summary.excused/Math.max(1,summary.total_sessions)*100)} size={80} color={C.purple} value={String(summary.excused)} label="Excused"/>
                    <ArcRing pct={100} size={80} color={C.blue} value={String(summary.total_sessions)} label="Total"/>
                  </div>

                  {/* Attendance warning */}
                  {(summary.attendance_pct)<75 && (
                    <div style={{marginTop:20,padding:"12px 16px",borderRadius:12,background:"rgba(255,77,106,0.08)",border:"1px solid rgba(255,77,106,0.22)",display:"flex",alignItems:"center",gap:12}}>
                      <span style={{fontSize:20}}>⚠️</span>
                      <div>
                        <div style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:14,color:C.red}}>Attendance Below 75%</div>
                        <div style={{fontFamily:"'Raleway',sans-serif",fontSize:12,color:C.w50,marginTop:2}}>Minimum required attendance is 75%. Please attend upcoming sessions to stay on track.</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TABS */}
              <div style={{display:"flex",gap:8,marginBottom:20}}>
                {(["checkin","history"] as const).map(v=>(
                  <button key={v} onClick={()=>setView(v)} style={{padding:"9px 20px",borderRadius:100,border:`1px solid ${view===v?"rgba(0,212,255,0.4)":"rgba(255,255,255,0.1)"}`,background:view===v?"rgba(0,212,255,0.1)":C.w04,color:view===v?C.cyan:C.w50,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:12,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",transition:"all .2s"}}>
                    {v==="checkin"?"◎ Check In":"📋 History"}
                  </button>
                ))}
              </div>

              {/* ── CHECK IN VIEW ── */}
              {view==="checkin" && (
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:18}}>
                  {/* Pulse check-in card */}
                  <div style={{background:C.surf,border:"1px solid rgba(0,212,255,0.15)",borderRadius:20,backdropFilter:"blur(28px)",position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",top:0,left:"8%",right:"8%",height:1,background:"linear-gradient(90deg,transparent,rgba(0,212,255,0.45),transparent)"}}/>
                    <div style={{padding:"20px 22px 0",borderBottom:`1px solid ${C.w08}`}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                        <span style={{width:8,height:8,borderRadius:"50%",background:C.green,boxShadow:`0 0 8px ${C.green}`,display:"inline-block",animation:"lu-pulse 2s ease-in-out infinite"}}/>
                        <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.green,letterSpacing:"1px",textTransform:"uppercase"}}>Session Active</span>
                      </div>
                      <div style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:17,color:C.w90,marginBottom:4}}>PULSE Check-In</div>
                      <div style={{fontFamily:"'Raleway',sans-serif",fontSize:13,color:C.w40,marginBottom:16,fontWeight:300}}>Your trainer has opened an attendance window. Enter the 6-character PULSE code to mark yourself present.</div>
                    </div>

                    {checkedIn ? (
                      <div style={{padding:"40px 24px",textAlign:"center"}}>
                        <div style={{fontSize:52,marginBottom:16}}>✅</div>
                        <div style={{fontFamily:"'Oxanium',sans-serif",fontWeight:800,fontSize:22,color:C.green,marginBottom:8}}>You're Checked In!</div>
                        <div style={{fontFamily:"'Raleway',sans-serif",fontSize:14,color:C.w50}}>Your attendance has been recorded as <span style={{color:C.green,fontWeight:600}}>Present</span></div>
                      </div>
                    ) : (
                      <PulseCheckIn attSessionUUID={ATT_SESSION_UUID} studentUUID={STUDENT_UUID} onSuccess={onCheckInSuccess}/>
                    )}
                  </div>

                  {/* How it works */}
                  <div style={{background:C.surf,border:`1px solid ${C.w08}`,borderRadius:20,backdropFilter:"blur(24px)",padding:"22px",position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",top:0,left:"8%",right:"8%",height:1,background:`linear-gradient(90deg,transparent,rgba(255,185,0,0.35),transparent)`}}/>
                    <div style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:16,color:C.w90,marginBottom:18}}>How PULSE Works</div>
                    {[
                      {icon:"1",title:"Trainer opens session",desc:"Your trainer generates a unique 6-character PULSE code at the start of class.",color:C.blue},
                      {icon:"2",title:"Enter the code",desc:"Type the PULSE code before the timer runs out (usually 10–15 minutes).",color:C.cyan},
                      {icon:"3",title:"Marked Present",desc:"Your attendance is instantly recorded as Present with the exact check-in time.",color:C.green},
                      {icon:"✎",title:"Trainer can adjust",desc:"Late arrivals or corrections can be updated manually by your trainer.",color:C.gold},
                    ].map((step,i)=>(
                      <div key={i} style={{display:"flex",gap:14,marginBottom:i<3?16:0}}>
                        <div style={{width:34,height:34,borderRadius:10,background:`${step.color}12`,border:`1px solid ${step.color}25`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Oxanium',sans-serif",fontWeight:800,fontSize:13,color:step.color,flexShrink:0}}>{step.icon}</div>
                        <div>
                          <div style={{fontFamily:"'Raleway',sans-serif",fontSize:13,fontWeight:600,color:C.w90,marginBottom:2}}>{step.title}</div>
                          <div style={{fontFamily:"'Raleway',sans-serif",fontSize:12,color:C.w40,lineHeight:1.6,fontWeight:300}}>{step.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── HISTORY VIEW ── */}
              {view==="history" && (
                <div style={{background:C.surf,border:`1px solid ${C.w08}`,borderRadius:20,backdropFilter:"blur(24px)",overflow:"hidden"}}>
                  <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.w08}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:16,color:C.w90}}>Attendance History</div>
                    <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:C.w30,letterSpacing:".5px"}}>{history.length} records</div>
                  </div>

                  {loading ? (
                    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:150}}>
                      <div style={{width:28,height:28,borderRadius:"50%",border:"3px solid rgba(0,212,255,0.2)",borderTopColor:C.cyan,animation:"lu-spin .8s linear infinite"}}/>
                    </div>
                  ) : history.length===0 ? (
                    <div style={{padding:"60px 24px",textAlign:"center"}}>
                      <div style={{fontSize:44,opacity:.4,marginBottom:12}}>📋</div>
                      <div style={{fontFamily:"'Raleway',sans-serif",fontSize:14,color:C.w40}}>No attendance records yet</div>
                    </div>
                  ) : (
                    <div>
                      {history.map((r,idx)=>{
                        const sm=STATUS_META[r.status]??{color:C.w40,icon:"?",label:r.status}
                        const bs=r.attendance_session?.batch_session
                        return(
                          <div key={r.uuid} style={{display:"flex",alignItems:"center",gap:14,padding:"13px 20px",borderBottom:idx<history.length-1?`1px solid ${C.w06}`:"none",transition:"background .2s"}}
                            onMouseEnter={e=>e.currentTarget.style.background="rgba(0,212,255,0.03)"}
                            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                            {/* Status icon */}
                            <div style={{width:42,height:42,borderRadius:12,background:`${sm.color}12`,border:`1px solid ${sm.color}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{sm.icon}</div>
                            {/* Session info */}
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontFamily:"'Raleway',sans-serif",fontSize:14,fontWeight:600,color:C.w90,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{bs?.title??`Session #${idx+1}`}</div>
                              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:C.w40,marginTop:2}}>Session #{bs?.session_number??"-"} · {bs?.session_date ? fmtDate(bs.session_date) : "—"}</div>
                            </div>
                            {/* Check-in time */}
                            {r.checked_in_at && (
                              <div style={{textAlign:"right",flexShrink:0}}>
                                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:12,color:C.w60}}>{fmtTime(r.checked_in_at)}</div>
                                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w30,marginTop:2}}>Checked in</div>
                              </div>
                            )}
                            {/* Who marked */}
                            <div style={{flexShrink:0,textAlign:"right"}}>
                              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w30,textTransform:"uppercase",letterSpacing:".5px",marginBottom:4}}>{r.marked_by_role}</div>
                              <span style={{padding:"3px 10px",borderRadius:100,fontFamily:"'Share Tech Mono',monospace",fontSize:9,letterSpacing:".5px",textTransform:"uppercase",background:`${sm.color}12`,border:`1px solid ${sm.color}25`,color:sm.color}}>
                                {sm.label}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TOASTS */}
      <div style={{position:"fixed",bottom:28,right:28,zIndex:1000,display:"flex",flexDirection:"column",gap:10}}>
        {toasts.map(t=>(
          <div key={t.id} style={{padding:"12px 18px",borderRadius:14,backdropFilter:"blur(24px)",fontFamily:"'Raleway',sans-serif",fontSize:14,fontWeight:500,display:"flex",alignItems:"center",gap:10,minWidth:260,boxShadow:"0 8px 32px rgba(0,0,0,0.5)",background:t.type==="success"?"rgba(0,229,160,0.12)":t.type==="error"?"rgba(255,77,106,0.12)":"rgba(0,212,255,0.1)",border:`1px solid ${t.type==="success"?"rgba(0,229,160,0.3)":t.type==="error"?"rgba(255,77,106,0.3)":"rgba(0,212,255,0.28)"}`,color:t.type==="success"?C.green:t.type==="error"?C.red:C.cyan}}>
            <span>{t.type==="success"?"✅":t.type==="error"?"⛔":"◉"}</span><span>{t.msg}</span>
          </div>
        ))}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@400;600;700;800&family=Raleway:wght@300;400;500;600&family=Share+Tech+Mono&display=swap');
        *,*::before,*::after{box-sizing:border-box}html,body{background:#020810;margin:0;height:100%}
        @keyframes lu-scan{from{transform:translateY(-100vh)}to{transform:translateY(200vh)}}
        @keyframes lu-spin{to{transform:rotate(360deg)}}
        @keyframes lu-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.2)}}
        ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(0,212,255,0.2);border-radius:4px}
      `}</style>
    </>
  )
}

declare module "react"{ interface CSSProperties{ [key:string]:any } }