// app/admin/attendance/page.tsx
"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import axios from "axios"
import LuminaBackground from "@/components/background/LuminaBackground"
import LuminaSideNav   from "@/components/layout/LuminaSideNav"
import LuminaTopBar     from "@/components/layout/LuminaTopBar"

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

/* ─────────────── TYPES ─────────────── */
interface BatchSession { id:number; uuid:string; title:string; session_number:number; session_date:string }
interface UserMini     { id:number; uuid:string; name:string; email:string }
interface AttSummary   { uuid:string; pulse_code:string; is_open:boolean; pulse_expires_at:string; opened_at:string; closed_at?:string; batch_session?:BatchSession; opener?:UserMini; total_present:number; total_absent:number; total_late:number }
interface AttRecord    { uuid:string; status:string; checked_in_at?:string; marked_by_role:string; note?:string; student?:UserMini; marker?:UserMini }
interface StudentSummaryData { student:UserMini; total_sessions:number; present:number; absent:number; late:number; excused:number; attendance_pct:number }

/* ─────────────── COLOURS ─────────────── */
const C={
  gold:"#ffc933",blue:"#1a96ff",cyan:"#00d4ff",
  green:"#00e5a0",red:"#ff4d6a",purple:"#a78bfa",orange:"#ff8c42",
  surf:"rgba(5,14,32,0.92)", w06:"rgba(255,255,255,0.06)",
  w90:"rgba(255,255,255,0.9)",w80:"rgba(255,255,255,0.8)",
  w70:"rgba(255,255,255,0.7)",w60:"rgba(255,255,255,0.6)",
  w50:"rgba(255,255,255,0.5)",w40:"rgba(255,255,255,0.4)",
  w30:"rgba(255,255,255,0.3)",w20:"rgba(255,255,255,0.2)",
  w15:"rgba(255,255,255,0.15)",w10:"rgba(255,255,255,0.10)",
  w08:"rgba(255,255,255,0.08)",w04:"rgba(255,255,255,0.04)",
}
const STATUS_COL:Record<string,string>={present:C.green,absent:C.red,late:C.orange,excused:C.purple}

function initials(n:string){ return n.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2) }
function fmtDate(s:string){ return new Date(s).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) }
function fmtDateTime(s:string){ return new Date(s).toLocaleString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}) }
function pctColor(p:number){ return p>=75?C.green:p>=50?C.orange:C.red }

/* ─────────────── TOAST ─────────────── */
function useToast(){
  const [toasts,setToasts]=useState<{id:number;msg:string;type:string}[]>([])
  const show=useCallback((msg:string,type="info")=>{
    const id=Date.now();setToasts(t=>[...t,{id,msg,type}])
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3200)
  },[])
  return{toasts,show}
}

/* ─────────────── STAT CARD ─────────────── */
function StatCard({icon,value,label,color}:{icon:string;value:string|number;label:string;color:string}){
  const [hov,setHov]=useState(false)
  return(
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:C.surf,borderRadius:16,padding:"16px 18px",backdropFilter:"blur(24px)",border:`1px solid ${hov?color+"30":color+"16"}`,transition:"all .3s cubic-bezier(.22,1,.36,1)",cursor:"default",transform:hov?"translateY(-3px)":"none",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,left:"8%",right:"8%",height:1,background:`linear-gradient(90deg,transparent,${color}45,transparent)`}}/>
      <div style={{fontSize:18,marginBottom:10}}>{icon}</div>
      <div style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:26,color,lineHeight:1,marginBottom:3}}>{value}</div>
      <div style={{fontFamily:"'Raleway',sans-serif",fontSize:12,color:C.w50}}>{label}</div>
    </div>
  )
}

/* ─────────────── ATTENDANCE SESSION ROW ─────────────── */
function SessionRow({s,onSelect,active}:{s:AttSummary;onSelect:()=>void;active:boolean}){
  const total = s.total_present+s.total_absent+s.total_late
  const pct   = total ? Math.round(((s.total_present+s.total_late)/total)*100) : 0
  return(
    <div onClick={onSelect}
      style={{padding:"13px 16px",borderRadius:13,marginBottom:8,cursor:"pointer",border:`1px solid ${active?"rgba(255,185,0,0.35)":C.w08}`,background:active?"rgba(255,185,0,0.08)":C.w04,transition:"all .2s"}}
      onMouseEnter={e=>{if(!active)e.currentTarget.style.background="rgba(255,185,0,0.05)"}}
      onMouseLeave={e=>{if(!active)e.currentTarget.style.background=C.w04}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
        <span style={{width:6,height:6,borderRadius:"50%",background:s.is_open?C.green:C.w30,boxShadow:s.is_open?`0 0 6px ${C.green}`:"none",display:"inline-block",animation:s.is_open?"lu-pulse 2s ease-in-out infinite":"none"}}/>
        <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:s.is_open?C.green:C.w30,letterSpacing:".5px",textTransform:"uppercase"}}>{s.is_open?"LIVE":"Closed"}</span>
        <span style={{marginLeft:"auto",fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.gold,letterSpacing:"1px"}}>{s.pulse_code}</span>
      </div>
      <div style={{fontFamily:"'Raleway',sans-serif",fontSize:13,fontWeight:600,color:C.w90,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
        {s.batch_session?.title??"Session"}
      </div>
      <div style={{fontFamily:"'Raleway',sans-serif",fontSize:11,color:C.w40,marginBottom:8}}>{fmtDateTime(s.opened_at)}</div>
      {/* Mini bar */}
      <div style={{display:"flex",gap:3,height:4,borderRadius:4,overflow:"hidden",marginBottom:5}}>
        {total>0&&<>
          <div style={{width:`${s.total_present/total*100}%`,background:C.green,borderRadius:4}}/>
          <div style={{width:`${s.total_late/total*100}%`,background:C.orange,borderRadius:4}}/>
          <div style={{width:`${s.total_absent/total*100}%`,background:C.red,borderRadius:4}}/>
        </>}
      </div>
      <div style={{display:"flex",gap:10}}>
        {[{l:"P",v:s.total_present,c:C.green},{l:"L",v:s.total_late,c:C.orange},{l:"A",v:s.total_absent,c:C.red}].map(x=>(
          <span key={x.l} style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:x.c}}>{x.l}:{x.v}</span>
        ))}
        <span style={{marginLeft:"auto",fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:pctColor(pct)}}>{pct}%</span>
      </div>
    </div>
  )
}

/* ─────────────── MANUAL MARK DIALOG ─────────────── */
function ManualMarkDialog({attUUID,onClose,onDone}:{attUUID:string;onClose:()=>void;onDone:()=>void}){
  const {show:toast}=useToast()
  const [stuUUID,setStuUUID]=useState("")
  const [status,setStatus]=useState("present")
  const [note,setNote]=useState("")
  const [loading,setLoading]=useState(false)
  const ADMIN_UUID="admin001"

  const submit=async()=>{
    if(!stuUUID.trim()){toast("Student UUID required","error");return}
    setLoading(true)
    try{
      await axios.post(`${API}/attendance/sessions/${attUUID}/mark?marker_uuid=${ADMIN_UUID}&marker_role=admin`,{student_uuid:stuUUID,status,note})
      toast("Marked!","success"); onDone(); onClose()
    }catch(e:any){ toast(e?.response?.data?.detail??"Failed","error") }
    finally{ setLoading(false) }
  }

  const FIS:React.CSSProperties={background:C.w04,border:"1px solid rgba(255,255,255,0.1)",borderRadius:11,padding:"10px 14px",color:C.w90,fontFamily:"'Raleway',sans-serif",fontSize:13,outline:"none",width:"100%"}

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(2,8,16,0.88)",backdropFilter:"blur(7px)",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:24}} onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div style={{background:"rgba(5,14,32,0.98)",border:"1px solid rgba(255,185,0,0.22)",borderRadius:22,backdropFilter:"blur(48px)",maxWidth:440,width:"100%",boxShadow:"0 32px 90px rgba(0,0,0,0.75)",position:"relative"}}>
        <div style={{position:"absolute",top:0,left:"8%",right:"8%",height:1,background:"linear-gradient(90deg,transparent,rgba(255,185,0,0.55),transparent)"}}/>
        <div style={{padding:"22px 24px 18px",borderBottom:`1px solid ${C.w08}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:18,color:C.w90}}>Manual Mark</div>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:8,border:`1px solid ${C.w10}`,background:C.w04,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:C.w50,fontSize:16}} onMouseEnter={e=>{e.currentTarget.style.color=C.red}} onMouseLeave={e=>{e.currentTarget.style.color=C.w50}}>✕</button>
        </div>
        <div style={{padding:"18px 24px",display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <label style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w40,letterSpacing:"1.5px",textTransform:"uppercase"}}>Student UUID *</label>
            <input style={FIS} value={stuUUID} onChange={e=>setStuUUID(e.target.value)} placeholder="Paste student UUID" onFocus={e=>{e.currentTarget.style.borderColor="rgba(255,185,0,0.45)"}} onBlur={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"}}/>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <label style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w40,letterSpacing:"1.5px",textTransform:"uppercase"}}>Status</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {["present","absent","late","excused"].map(s=>(
                <button key={s} onClick={()=>setStatus(s)} style={{padding:"10px",borderRadius:10,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:11,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",background:status===s?`${STATUS_COL[s]}14`:C.w04,border:`1px solid ${status===s?STATUS_COL[s]+"35":C.w08}`,color:status===s?STATUS_COL[s]:C.w40,transition:"all .2s"}}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <label style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w40,letterSpacing:"1.5px",textTransform:"uppercase"}}>Note (optional)</label>
            <input style={FIS} value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. Technical issue" onFocus={e=>{e.currentTarget.style.borderColor="rgba(255,185,0,0.45)"}} onBlur={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"}}/>
          </div>
        </div>
        <div style={{padding:"14px 24px 20px",borderTop:`1px solid ${C.w08}`,display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{padding:"9px 18px",borderRadius:100,border:`1px solid ${C.w15}`,background:C.w04,color:C.w70,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700}}>Cancel</button>
          <button onClick={submit} disabled={loading} style={{padding:"9px 20px",borderRadius:100,border:"none",background:"linear-gradient(135deg,#ffc933,#ffad00)",color:"#020810",cursor:loading?"not-allowed":"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700,boxShadow:"0 0 20px rgba(255,185,0,0.3)"}}>
            {loading?"Marking…":"Mark Attendance"}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────── MAIN PAGE ─────────────── */
export default function AdminAttendancePage(){
  const {toasts,show:toast} = useToast()

  const [sessions,    setSessions]    = useState<AttSummary[]>([])
  const [activeAtt,   setActiveAtt]   = useState<AttSummary|null>(null)
  const [records,     setRecords]     = useState<AttRecord[]>([])
  const [studentSums, setStudentSums] = useState<StudentSummaryData[]>([])
  const [loading,     setLoading]     = useState(true)
  const [view,        setView]        = useState<"sessions"|"students">("sessions")
  const [showMarkDlg, setShowMarkDlg] = useState(false)
  const [search,      setSearch]      = useState("")
  const [fStatus,     setFStatus]     = useState("")
  const [fOpen,       setFOpen]       = useState<string>("all")

  /* ── Load sessions ── */
  const loadSessions = useCallback(async()=>{
    setLoading(true)
    try{
      const r = await axios.get(`${API}/attendance/sessions${fOpen!=="all"?`?is_open=${fOpen==="open"}`:""}`)
      setSessions(r.data?.data ?? r.data ?? [])
    }catch{
      const now=new Date()
      const yesterday=new Date(now.getTime()-3600*1000*24)
      setSessions([
        {uuid:"as001",pulse_code:"X4P9RK",is_open:true, pulse_expires_at:new Date(now.getTime()+8*60000).toISOString(),opened_at:now.toISOString(),             batch_session:{id:1,uuid:"bs001",title:"Neural Networks Lab",session_number:5,session_date:now.toISOString().split("T")[0]},         opener:{id:3,uuid:"t001",name:"Dr. Arjun V.",email:"arjun@lumina.io"},total_present:8,total_absent:3,total_late:1},
        {uuid:"as002",pulse_code:"M7NWZA",is_open:false,pulse_expires_at:new Date(now.getTime()-30*60000).toISOString(),opened_at:yesterday.toISOString(),closed_at:new Date(now.getTime()-50*60000).toISOString(),batch_session:{id:2,uuid:"bs002",title:"React Workshop #4",session_number:4,session_date:yesterday.toISOString().split("T")[0]},opener:{id:5,uuid:"t002",name:"Priya S.",email:"priya@lumina.io"},total_present:12,total_absent:2,total_late:0},
        {uuid:"as003",pulse_code:"TQ3HXF",is_open:false,pulse_expires_at:new Date(now.getTime()-2*3600*1000).toISOString(),opened_at:new Date(now.getTime()-3*3600*1000).toISOString(),closed_at:new Date(now.getTime()-2.5*3600*1000).toISOString(),batch_session:{id:3,uuid:"bs003",title:"Quantum Circuits",session_number:2,session_date:yesterday.toISOString().split("T")[0]},opener:{id:7,uuid:"t003",name:"Vikram R.",email:"vikram@lumina.io"},total_present:6,total_absent:1,total_late:2},
      ])
    }finally{ setLoading(false) }
  },[fOpen])

  /* ── Load records for selected session ── */
  const loadRecords = useCallback(async(attUUID:string)=>{
    try{
      const r = await axios.get(`${API}/attendance/sessions/${attUUID}/report`)
      setRecords(r.data?.data?.records ?? r.data?.records ?? [])
    }catch{
      setRecords([
        {uuid:"r1",status:"present",checked_in_at:new Date().toISOString(),marked_by_role:"self",  student:{id:1,uuid:"s001",name:"Aryan Kumar",  email:"aryan@example.com"}},
        {uuid:"r2",status:"present",checked_in_at:new Date().toISOString(),marked_by_role:"self",  student:{id:2,uuid:"s002",name:"Priya Sharma", email:"priya@example.com"}},
        {uuid:"r3",status:"absent", checked_in_at:undefined,               marked_by_role:"trainer",student:{id:3,uuid:"s003",name:"Rahul Singh",  email:"rahul@example.com"}},
        {uuid:"r4",status:"late",   checked_in_at:new Date().toISOString(),marked_by_role:"self",  student:{id:4,uuid:"s004",name:"Sneha Patel",   email:"sneha@example.com"}},
        {uuid:"r5",status:"present",checked_in_at:new Date().toISOString(),marked_by_role:"self",  student:{id:5,uuid:"s005",name:"Dev Mehta",     email:"dev@example.com"}},
        {uuid:"r6",status:"excused",checked_in_at:undefined,               marked_by_role:"admin", student:{id:6,uuid:"s006",name:"Nisha Reddy",   email:"nisha@example.com"},note:"Medical leave"},
      ])
    }
  },[])

  /* ── Load student summaries ── */
  const loadStudentSums = useCallback(async()=>{
    // In production you'd loop over all students or use a batch endpoint
    setStudentSums([
      {student:{id:1,uuid:"s001",name:"Aryan Kumar",  email:"aryan@example.com"}, total_sessions:10,present:9,absent:0,late:1,excused:0,attendance_pct:90},
      {student:{id:2,uuid:"s002",name:"Priya Sharma", email:"priya@example.com"}, total_sessions:10,present:7,absent:2,late:1,excused:0,attendance_pct:70},
      {student:{id:3,uuid:"s003",name:"Rahul Singh",  email:"rahul@example.com"}, total_sessions:10,present:5,absent:4,late:0,excused:1,attendance_pct:50},
      {student:{id:4,uuid:"s004",name:"Sneha Patel",  email:"sneha@example.com"}, total_sessions:10,present:10,absent:0,late:0,excused:0,attendance_pct:100},
      {student:{id:5,uuid:"s005",name:"Dev Mehta",    email:"dev@example.com"},   total_sessions:10,present:8,absent:1,late:1,excused:0,attendance_pct:80},
      {student:{id:6,uuid:"s006",name:"Nisha Reddy",  email:"nisha@example.com"}, total_sessions:10,present:6,absent:3,late:0,excused:1,attendance_pct:60},
    ])
  },[])

  useEffect(()=>{ loadSessions() },[loadSessions])
  useEffect(()=>{ if(view==="students")loadStudentSums() },[view,loadStudentSums])

  const selectSession=async(s:AttSummary)=>{ setActiveAtt(s); await loadRecords(s.uuid) }

  /* ── Close pulse ── */
  const closePulse=async(uuid:string)=>{
    try{
      await axios.post(`${API}/attendance/sessions/${uuid}/close`)
      setSessions(s=>s.map(x=>x.uuid===uuid?{...x,is_open:false}:x))
      if(activeAtt?.uuid===uuid)setActiveAtt(a=>a?{...a,is_open:false}:null)
      toast("PULSE closed","info")
    }catch{ toast("Failed to close","error") }
  }

  /* ── Stats from loaded sessions ── */
  const stats = useMemo(()=>[
    {icon:"📅",value:sessions.length,     label:"Total Sessions", color:C.blue  },
    {icon:"●", value:sessions.filter(s=>s.is_open).length, label:"Live Now", color:C.green },
    {icon:"✅",value:sessions.reduce((a,s)=>a+s.total_present,0), label:"Present (total)", color:C.green },
    {icon:"⛔",value:sessions.reduce((a,s)=>a+s.total_absent,0),  label:"Absent (total)",  color:C.red   },
    {icon:"⏰",value:sessions.reduce((a,s)=>a+s.total_late,0),    label:"Late (total)",    color:C.orange},
  ],[sessions])

  /* ── Filtered records ── */
  const filteredRecords = useMemo(()=>{
    const q=search.toLowerCase()
    return records.filter(r=>{
      const mQ = !q || (r.student?.name??"").toLowerCase().includes(q) || (r.student?.email??"").toLowerCase().includes(q)
      const mS = !fStatus || r.status===fStatus
      return mQ&&mS
    })
  },[records,search,fStatus])

  /* ── Filtered students ── */
  const filteredStudents = useMemo(()=>{
    const q=search.toLowerCase()
    return studentSums.filter(s=>{
      const mQ = !q || s.student.name.toLowerCase().includes(q) || s.student.email.toLowerCase().includes(q)
      return mQ
    }).sort((a,b)=>a.attendance_pct-b.attendance_pct)
  },[studentSums,search])

  const selSt:React.CSSProperties={padding:"9px 14px",borderRadius:10,border:"1px solid rgba(255,255,255,0.1)",background:C.w04,color:C.w70,fontFamily:"'Raleway',sans-serif",fontSize:13,outline:"none",cursor:"pointer"}

  return(
    <>
      <LuminaBackground/>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:1}}>
        <div style={{position:"absolute",width:"100%",height:1,background:"linear-gradient(90deg,transparent,rgba(255,185,0,0.05),rgba(255,185,0,0.1),rgba(255,185,0,0.05),transparent)",animation:"lu-scan 18s linear infinite"}}/>
      </div>

      <div style={{display:"flex",height:"100vh",overflow:"hidden",position:"relative",zIndex:2}}>
        <LuminaSideNav role="admin"/>

        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
          <LuminaTopBar role="admin"/>

          <div style={{flex:1,display:"flex",overflow:"hidden"}}>

            {/* ─── LEFT: sessions list ─── */}
            <div style={{width:300,flexShrink:0,borderRight:`1px solid ${C.w08}`,display:"flex",flexDirection:"column",overflow:"hidden",background:"rgba(2,8,20,0.5)"}}>
              <div style={{padding:"16px 14px 12px",borderBottom:`1px solid ${C.w08}`}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <div style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:15,color:C.w90,flex:1}}>PULSE Sessions</div>
                </div>
                <div style={{display:"flex",gap:6}}>
                  {[["all","All"],["open","Live"],["closed","Closed"]].map(([k,l])=>(
                    <button key={k} onClick={()=>setFOpen(k)} style={{flex:1,padding:"6px 0",borderRadius:8,border:`1px solid ${fOpen===k?"rgba(255,185,0,0.35)":C.w08}`,background:fOpen===k?"rgba(255,185,0,0.1)":C.w04,color:fOpen===k?C.gold:C.w40,cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:9,letterSpacing:".5px",textTransform:"uppercase",transition:"all .2s"}}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{flex:1,overflowY:"auto",padding:"10px 12px"}}>
                {loading ? (
                  <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:100}}>
                    <div style={{width:22,height:22,borderRadius:"50%",border:"2px solid rgba(255,185,0,0.2)",borderTopColor:C.gold,animation:"lu-spin .8s linear infinite"}}/>
                  </div>
                ) : sessions.map(s=>(
                  <SessionRow key={s.uuid} s={s} active={activeAtt?.uuid===s.uuid} onSelect={()=>selectSession(s)}/>
                ))}
              </div>
            </div>

            {/* ─── RIGHT ─── */}
            <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

              {/* Sub-header tabs */}
              <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.w08}`,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                <div style={{display:"flex",gap:6}}>
                  {(["sessions","students"] as const).map(v=>(
                    <button key={v} onClick={()=>setView(v)} style={{padding:"7px 16px",borderRadius:100,border:`1px solid ${view===v?"rgba(255,185,0,0.35)":C.w08}`,background:view===v?"rgba(255,185,0,0.1)":C.w04,color:view===v?C.gold:C.w40,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:11,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",transition:"all .2s"}}>
                      {v==="sessions"?"Session Records":"Student Overview"}
                    </button>
                  ))}
                </div>
                <div style={{flex:1,minWidth:160,position:"relative"}}>
                  <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:C.w40,fontSize:13,pointerEvents:"none"}}>🔍</span>
                  <input style={{...selSt,paddingLeft:36,width:"100%"}} placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}/>
                </div>
                {view==="sessions" && (
                  <select style={selSt} value={fStatus} onChange={e=>setFStatus(e.target.value)}>
                    <option value="">All Status</option>
                    {["present","absent","late","excused"].map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                )}
              </div>

              {/* ── Stats row ── */}
              <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.w08}`,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12}}>
                {stats.map((s,i)=><StatCard key={i} {...s}/>)}
              </div>

              {/* ── SESSIONS VIEW ── */}
              {view==="sessions" && (
                <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
                  {activeAtt ? (
                    <>
                      {/* Session header */}
                      <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.w08}`,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                            <span style={{width:7,height:7,borderRadius:"50%",background:activeAtt.is_open?C.green:C.w30,display:"inline-block",boxShadow:activeAtt.is_open?`0 0 8px ${C.green}`:"none",animation:activeAtt.is_open?"lu-pulse 2s ease-in-out infinite":"none"}}/>
                            <span style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:16,color:C.w90}}>{activeAtt.batch_session?.title}</span>
                            <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:C.gold,letterSpacing:"1px",padding:"2px 8px",borderRadius:6,background:"rgba(255,185,0,0.08)",border:"1px solid rgba(255,185,0,0.2)"}}>{activeAtt.pulse_code}</span>
                          </div>
                          <div style={{fontFamily:"'Raleway',sans-serif",fontSize:12,color:C.w40}}>{activeAtt.opener?.name} · {fmtDateTime(activeAtt.opened_at)}</div>
                        </div>
                        <div style={{display:"flex",gap:8,flexShrink:0}}>
                          <button onClick={()=>setShowMarkDlg(true)} style={{padding:"7px 14px",borderRadius:100,border:"1px solid rgba(255,185,0,0.3)",background:"rgba(255,185,0,0.08)",color:C.gold,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:11,fontWeight:700,letterSpacing:".5px"}}>✎ Manual Mark</button>
                          {activeAtt.is_open && <button onClick={()=>closePulse(activeAtt.uuid)} style={{padding:"7px 14px",borderRadius:100,border:"1px solid rgba(255,77,106,0.3)",background:"rgba(255,77,106,0.08)",color:C.red,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:11,fontWeight:700,letterSpacing:".5px"}}>✕ Close PULSE</button>}
                        </div>
                      </div>

                      {/* Records table */}
                      <div style={{flex:1,overflowY:"auto",padding:"14px 20px"}}>
                        {/* Head */}
                        <div style={{display:"grid",gridTemplateColumns:"40px 1fr 100px 100px 90px 90px",gap:12,padding:"8px 12px",fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w30,textTransform:"uppercase",letterSpacing:"1px",borderBottom:`1px solid ${C.w08}`,marginBottom:6}}>
                          <div/><div>Student</div><div>Status</div><div>Checked In</div><div>Marked By</div><div>Note</div>
                        </div>
                        {filteredRecords.length===0 ? (
                          <div style={{textAlign:"center",padding:"50px 20px"}}>
                            <div style={{fontSize:40,opacity:.4,marginBottom:12}}>◎</div>
                            <div style={{fontFamily:"'Raleway',sans-serif",fontSize:14,color:C.w40}}>No records yet</div>
                          </div>
                        ) : filteredRecords.map((r,idx)=>{
                          const sc=STATUS_COL[r.status]??C.w40
                          return(
                            <div key={r.uuid} style={{display:"grid",gridTemplateColumns:"40px 1fr 100px 100px 90px 90px",gap:12,padding:"11px 12px",borderRadius:11,marginBottom:5,background:C.w04,border:`1px solid ${C.w06}`,alignItems:"center",transition:"background .15s"}}
                              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,185,0,0.04)"}
                              onMouseLeave={e=>e.currentTarget.style.background=C.w04}>
                              <div style={{width:36,height:36,borderRadius:10,background:`${sc}12`,border:`1px solid ${sc}25`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:12,color:sc}}>
                                {r.student?initials(r.student.name):"?"}
                              </div>
                              <div style={{minWidth:0}}>
                                <div style={{fontFamily:"'Raleway',sans-serif",fontSize:13,fontWeight:600,color:C.w90,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.student?.name??`Student #${idx+1}`}</div>
                                <div style={{fontFamily:"'Raleway',sans-serif",fontSize:11,color:C.w40,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.student?.email}</div>
                              </div>
                              <span style={{padding:"3px 9px",borderRadius:100,fontFamily:"'Share Tech Mono',monospace",fontSize:9,letterSpacing:".5px",textTransform:"uppercase",background:`${sc}12`,border:`1px solid ${sc}25`,color:sc,textAlign:"center"}}>{r.status}</span>
                              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:C.w40}}>{r.checked_in_at?fmtDateTime(r.checked_in_at):"—"}</div>
                              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w30,textTransform:"uppercase"}}>{r.marked_by_role}</div>
                              <div style={{fontFamily:"'Raleway',sans-serif",fontSize:11,color:C.w30,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.note??""}</div>
                            </div>
                          )
                        })}
                      </div>
                    </>
                  ) : (
                    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:40,textAlign:"center"}}>
                      <div style={{fontSize:52,opacity:.4,marginBottom:16}}>📅</div>
                      <div style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:20,color:C.w50,marginBottom:6}}>Select a session</div>
                      <div style={{fontFamily:"'Raleway',sans-serif",fontSize:14,color:C.w30}}>Click any PULSE session on the left to view its records</div>
                    </div>
                  )}
                </div>
              )}

              {/* ── STUDENTS VIEW ── */}
              {view==="students" && (
                <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
                  {/* Head */}
                  <div style={{display:"grid",gridTemplateColumns:"40px 1fr 70px 70px 70px 70px 90px",gap:12,padding:"8px 12px",fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w30,textTransform:"uppercase",letterSpacing:"1px",borderBottom:`1px solid ${C.w08}`,marginBottom:8}}>
                    <div/><div>Student</div><div>Present</div><div>Absent</div><div>Late</div><div>Excused</div><div>Rate</div>
                  </div>
                  {filteredStudents.map(s=>{
                    const pc=pctColor(s.attendance_pct)
                    const pct=s.attendance_pct
                    return(
                      <div key={s.student.uuid} style={{display:"grid",gridTemplateColumns:"40px 1fr 70px 70px 70px 70px 90px",gap:12,padding:"12px 12px",borderRadius:12,marginBottom:7,background:C.w04,border:`1px solid ${pct<75?"rgba(255,77,106,0.12)":C.w06}`,alignItems:"center",transition:"background .15s"}}
                        onMouseEnter={e=>e.currentTarget.style.background=pct<75?"rgba(255,77,106,0.06)":"rgba(255,185,0,0.04)"}
                        onMouseLeave={e=>e.currentTarget.style.background=C.w04}>
                        <div style={{width:36,height:36,borderRadius:10,background:`${pc}12`,border:`1px solid ${pc}25`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:12,color:pc}}>{initials(s.student.name)}</div>
                        <div>
                          <div style={{fontFamily:"'Raleway',sans-serif",fontSize:13,fontWeight:600,color:C.w90}}>{s.student.name}</div>
                          <div style={{fontFamily:"'Raleway',sans-serif",fontSize:11,color:C.w40}}>{s.student.email}</div>
                        </div>
                        {[{v:s.present,c:C.green},{v:s.absent,c:C.red},{v:s.late,c:C.orange},{v:s.excused,c:C.purple}].map((x,i)=>(
                          <div key={i} style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:15,color:x.c,textAlign:"center"}}>{x.v}</div>
                        ))}
                        <div style={{display:"flex",flexDirection:"column",gap:4}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <span style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:15,color:pc}}>{pct}%</span>
                            {pct<75 && <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:C.red,letterSpacing:".3px"}}>⚠ LOW</span>}
                          </div>
                          <div style={{height:4,borderRadius:4,background:"rgba(255,255,255,0.05)",overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${pct}%`,background:pc,borderRadius:4,transition:"width 1.2s ease"}}/>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MANUAL MARK DIALOG */}
      {showMarkDlg && activeAtt && (
        <ManualMarkDialog attUUID={activeAtt.uuid} onClose={()=>setShowMarkDlg(false)} onDone={()=>loadRecords(activeAtt.uuid)}/>
      )}

      {/* TOASTS */}
      <div style={{position:"fixed",bottom:28,right:28,zIndex:1000,display:"flex",flexDirection:"column",gap:10}}>
        {toasts.map(t=>(
          <div key={t.id} style={{padding:"12px 18px",borderRadius:14,backdropFilter:"blur(24px)",fontFamily:"'Raleway',sans-serif",fontSize:14,fontWeight:500,display:"flex",alignItems:"center",gap:10,minWidth:260,boxShadow:"0 8px 32px rgba(0,0,0,0.5)",background:t.type==="success"?"rgba(0,229,160,0.12)":t.type==="error"?"rgba(255,77,106,0.12)":"rgba(255,185,0,0.1)",border:`1px solid ${t.type==="success"?"rgba(0,229,160,0.3)":t.type==="error"?"rgba(255,77,106,0.3)":"rgba(255,185,0,0.28)"}`,color:t.type==="success"?C.green:t.type==="error"?C.red:C.gold}}>
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
        ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,185,0,0.2);border-radius:4px}
        select option{background:#0a1628;color:rgba(255,255,255,0.9)}
      `}</style>
    </>
  )
}

declare module "react"{ interface CSSProperties{ [key:string]:any } }