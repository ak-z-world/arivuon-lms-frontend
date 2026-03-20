// app/trainer/dashboard/page.tsx
"use client"

import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import LuminaBackground from "@/components/background/LuminaBackground"
import LuminaSideNav    from "@/components/layout/LuminaSideNav"
import LuminaTopBar     from "@/components/layout/LuminaTopBar"

/* ──────────────────────────────────────────
   TYPES
─────────────────────────────────────────── */
interface CourseMini  { id:number; uuid:string; title:string; level?:string }
interface BatchMini   { id:number; uuid:string; name:string; status:string; start_date?:string; end_date?:string; course?:CourseMini }
interface UpcomingSession { uuid:string; title:string; session_number:number; session_date:string; start_time?:string; end_time?:string; status:string; meeting_link?:string; batch_name?:string; course_title?:string }
interface AttStat     { total:number; present:number; absent:number; late:number; pct:number }
interface BatchSummary{ batch:BatchMini; student_count:number; session_count:number; completed_sessions:number; progress_pct:number; attendance_avg:number }
interface TrainerData {
  trainer:           { name:string; email:string; uuid:string }
  total_batches:     number; active_batches:number
  total_students:    number; total_sessions:number; sessions_today:number
  upcoming_sessions: UpcomingSession[]
  batch_summaries:   BatchSummary[]
  overall_attendance:AttStat
  recent_sessions:   UpcomingSession[]
}

/* ──────────────────────────────────────────
   CONSTANTS
─────────────────────────────────────────── */
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

const C = {
  gold:"#ffc933", gold2:"#ffad00", blue:"#1a96ff", cyan:"#00d4ff",
  green:"#00e5a0", red:"#ff4d6a", purple:"#a78bfa", orange:"#ff8c42",
  surf:"rgba(5,14,32,0.92)", w06:"rgba(255,255,255,0.06)",
  w90:"rgba(255,255,255,0.9)", w80:"rgba(255,255,255,0.8)",
  w70:"rgba(255,255,255,0.7)", w60:"rgba(255,255,255,0.6)",
  w50:"rgba(255,255,255,0.5)", w40:"rgba(255,255,255,0.4)",
  w30:"rgba(255,255,255,0.3)", w20:"rgba(255,255,255,0.2)",
  w15:"rgba(255,255,255,0.15)",w10:"rgba(255,255,255,0.10)",
  w08:"rgba(255,255,255,0.08)",w04:"rgba(255,255,255,0.04)",
}

const STATUS_MAP:{[k:string]:{label:string;color:string;bg:string;border:string}} = {
  upcoming:  { label:"Upcoming",  color:C.blue,   bg:"rgba(26,150,255,0.12)",  border:"rgba(26,150,255,0.3)"  },
  active:    { label:"Active",    color:C.green,  bg:"rgba(0,229,160,0.12)",   border:"rgba(0,229,160,0.3)"   },
  completed: { label:"Done",      color:C.purple, bg:"rgba(167,139,250,0.12)", border:"rgba(167,139,250,0.3)" },
  cancelled: { label:"Cancelled", color:C.red,    bg:"rgba(255,77,106,0.10)",  border:"rgba(255,77,106,0.25)" },
  live:      { label:"LIVE",      color:C.green,  bg:"rgba(0,229,160,0.14)",   border:"rgba(0,229,160,0.35)"  },
  scheduled: { label:"Scheduled", color:C.blue,   bg:"rgba(26,150,255,0.1)",   border:"rgba(26,150,255,0.22)" },
}

function fmtTime(t?:string){ if(!t)return"—"; const [h,m]=t.split(":"); const hr=parseInt(h); return`${hr%12||12}:${m}${hr>=12?"PM":"AM"}` }
function fmtDate(d:string){ return new Date(d).toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"}) }
function isToday(d:string){ const t=new Date();const s=new Date(d); return t.getFullYear()===s.getFullYear()&&t.getMonth()===s.getMonth()&&t.getDate()===s.getDate() }
function initials(n:string){ return n.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2) }

/* ──────────────────────────────────────────
   ARC RING
─────────────────────────────────────────── */
function ArcRing({pct,size=72,color=C.gold,value,label}:{pct:number;size:number;color:string;value:string;label:string}){
  const r=(size-8)/2, circ=2*Math.PI*r
  const [p,setP]=useState(0)
  useEffect(()=>{const t=setTimeout(()=>setP(pct),280);return()=>clearTimeout(t)},[pct])
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      <div style={{position:"relative",width:size,height:size}}>
        <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${color}15`} strokeWidth={6}/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ*(1-p/100)}
            style={{filter:`drop-shadow(0 0 5px ${color})`,transition:"stroke-dashoffset 1.4s ease"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:size*.2,color,lineHeight:1}}>{value}</span>
        </div>
      </div>
      <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w30,textTransform:"uppercase",letterSpacing:".8px",textAlign:"center",lineHeight:1.3}}>{label}</span>
    </div>
  )
}

/* ──────────────────────────────────────────
   PROGRESS BAR
─────────────────────────────────────────── */
function ProgressBar({pct,color=C.gold,h=5}:{pct:number;color?:string;h?:number}){
  const [w,setW]=useState(0)
  useEffect(()=>{const t=setTimeout(()=>setW(pct),250);return()=>clearTimeout(t)},[pct])
  return(
    <div style={{height:h,borderRadius:h,background:"rgba(255,255,255,0.05)",overflow:"hidden"}}>
      <div style={{height:"100%",width:`${w}%`,borderRadius:h,background:`linear-gradient(90deg,${color}80,${color})`,boxShadow:`0 0 6px ${color}55`,transition:"width 1.3s cubic-bezier(.22,1,.36,1)"}}/>
    </div>
  )
}

/* ──────────────────────────────────────────
   GLASS CARD
─────────────────────────────────────────── */
function Card({children,accent=C.gold,style={},noHover=false}:{children:React.ReactNode;accent?:string;style?:React.CSSProperties;noHover?:boolean}){
  const [hov,setHov]=useState(false)
  return(
    <div onMouseEnter={()=>!noHover&&setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:C.surf,border:`1px solid ${hov?accent+"32":accent+"14"}`,borderRadius:20,backdropFilter:"blur(28px)",position:"relative",overflow:"hidden",transition:"all .35s cubic-bezier(.22,1,.36,1)",transform:hov&&!noHover?"translateY(-3px)":"none",boxShadow:hov&&!noHover?`0 20px 60px rgba(0,0,0,0.55),0 0 28px ${accent}10`:"0 8px 40px rgba(0,0,0,0.42)",...style}}>
      <div style={{position:"absolute",top:0,left:"8%",right:"8%",height:1,background:`linear-gradient(90deg,transparent,${accent}50,transparent)`}}/>
      {children}
    </div>
  )
}

/* ──────────────────────────────────────────
   STAT CARD
─────────────────────────────────────────── */
function StatCard({icon,value,label,sub,color,delay=0}:{icon:string;value:string|number;label:string;sub?:string;color:string;delay?:number}){
  const [hov,setHov]=useState(false)
  return(
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:C.surf,borderRadius:16,padding:"18px 20px",backdropFilter:"blur(24px)",border:`1px solid ${hov?color+"30":color+"16"}`,transition:"all .3s cubic-bezier(.22,1,.36,1)",cursor:"default",transform:hov?"translateY(-3px)":"none",boxShadow:hov?`0 16px 40px rgba(0,0,0,0.45),0 0 20px ${color}10`:"0 6px 24px rgba(0,0,0,0.35)",position:"relative",overflow:"hidden",animation:`lu-reveal .5s ${delay}s both`}}>
      <div style={{position:"absolute",top:0,left:"8%",right:"8%",height:1,background:`linear-gradient(90deg,transparent,${color}45,transparent)`}}/>
      <div style={{fontSize:20,marginBottom:12}}>{icon}</div>
      <div style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:30,color,lineHeight:1,marginBottom:3}}>{value}</div>
      {sub&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:`${color}70`,letterSpacing:".5px",marginBottom:3}}>{sub}</div>}
      <div style={{fontFamily:"'Raleway',sans-serif",fontSize:12,color:C.w50}}>{label}</div>
    </div>
  )
}

/* ──────────────────────────────────────────
   SESSION TIMELINE ITEM
─────────────────────────────────────────── */
function SessionItem({session,showDate=false}:{session:UpcomingSession;showDate?:boolean}){
  const [hov,setHov]=useState(false)
  const st=STATUS_MAP[session.status]??STATUS_MAP.scheduled
  const todayFlag=isToday(session.session_date)
  return(
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{display:"flex",alignItems:"flex-start",gap:14,padding:"14px 16px",borderRadius:14,background:hov?`${st.color}08`:C.w04,border:`1px solid ${hov?st.color+"30":todayFlag?st.color+"20":C.w08}`,transition:"all .25s",cursor:"pointer",marginBottom:8,position:"relative",overflow:"hidden"}}>
      {/* Left colour bar */}
      <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:`linear-gradient(180deg,${st.color},${st.color}44)`,boxShadow:`0 0 6px ${st.color}55`}}/>
      {/* Time column */}
      <div style={{paddingLeft:6,minWidth:50,flexShrink:0,textAlign:"center"}}>
        <div style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:14,color:st.color,lineHeight:1}}>{fmtTime(session.start_time)}</div>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w30,marginTop:2}}>{fmtTime(session.end_time)}</div>
      </div>
      {/* Divider */}
      <div style={{width:1,alignSelf:"stretch",background:`${st.color}25`,flexShrink:0}}/>
      {/* Content */}
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3,flexWrap:"wrap"}}>
          <span style={{fontFamily:"'Raleway',sans-serif",fontSize:14,fontWeight:600,color:C.w90,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{session.title}</span>
          <span style={{padding:"2px 8px",borderRadius:100,fontFamily:"'Share Tech Mono',monospace",fontSize:8,letterSpacing:".5px",textTransform:"uppercase",background:st.bg,border:`1px solid ${st.border}`,color:st.color,flexShrink:0,display:"flex",alignItems:"center",gap:3}}>
            {session.status==="live"&&<span style={{width:4,height:4,borderRadius:"50%",background:st.color,animation:"lu-pulse 1.5s ease-in-out infinite",display:"inline-block"}}/>}
            {st.label}
          </span>
        </div>
        <div style={{fontFamily:"'Raleway',sans-serif",fontSize:12,color:C.w40,marginBottom:3}}>
          {session.batch_name} {session.course_title&&`· ${session.course_title}`}
        </div>
        {showDate&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:todayFlag?C.gold:C.w30,letterSpacing:".3px"}}>{todayFlag?"Today — ":""}{fmtDate(session.session_date)}</div>}
      </div>
      {/* Join button */}
      {session.meeting_link&&session.status!=="completed"&&(
        <a href={session.meeting_link} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}
          style={{padding:"6px 12px",borderRadius:9,background:"rgba(0,229,160,0.1)",border:"1px solid rgba(0,229,160,0.28)",color:C.green,fontFamily:"'Share Tech Mono',monospace",fontSize:9,letterSpacing:".5px",textDecoration:"none",flexShrink:0,transition:"all .2s"}}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(0,229,160,0.18)"}
          onMouseLeave={e=>e.currentTarget.style.background="rgba(0,229,160,0.1)"}>
          ▶ JOIN
        </a>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────
   BATCH CARD
─────────────────────────────────────────── */
function BatchCard({summary}:{summary:BatchSummary}){
  const [hov,setHov]=useState(false)
  const st=STATUS_MAP[summary.batch.status]??STATUS_MAP.upcoming
  const attColor=summary.attendance_avg>=75?C.green:summary.attendance_avg>=50?C.orange:C.red
  return(
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:C.surf,borderRadius:18,border:`1px solid ${hov?"rgba(255,185,0,0.28)":"rgba(255,255,255,0.07)"}`,backdropFilter:"blur(24px)",padding:"18px 20px",transition:"all .35s cubic-bezier(.22,1,.36,1)",transform:hov?"translateY(-4px)":"none",boxShadow:hov?"0 20px 56px rgba(0,0,0,0.5),0 0 24px rgba(255,185,0,0.07)":"0 6px 28px rgba(0,0,0,0.38)",cursor:"pointer",position:"relative",overflow:"hidden"}}>
      {/* Status band */}
      <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${st.color}80,${st.color}30,transparent)`}}/>
      {/* Header */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:14}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5,flexWrap:"wrap"}}>
            <span style={{padding:"2px 9px",borderRadius:100,fontFamily:"'Share Tech Mono',monospace",fontSize:9,letterSpacing:".5px",textTransform:"uppercase",background:st.bg,border:`1px solid ${st.border}`,color:st.color}}>{st.label}</span>
            {summary.batch.course?.level&&<span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w30,textTransform:"uppercase",letterSpacing:".5px"}}>{summary.batch.course.level}</span>}
          </div>
          <h3 style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:16,color:C.w90,margin:0,lineHeight:1.25,letterSpacing:".1px"}}>{summary.batch.name}</h3>
          {summary.batch.course&&<div style={{fontFamily:"'Raleway',sans-serif",fontSize:12,color:C.w40,marginTop:3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{summary.batch.course.title}</div>}
        </div>
        <ArcRing pct={summary.progress_pct} size={60} color={st.color} value={`${Math.round(summary.progress_pct)}%`} label="Progress"/>
      </div>

      {/* Stats row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
        {[{v:summary.student_count,l:"Students",c:C.gold},{v:`${summary.completed_sessions}/${summary.session_count}`,l:"Sessions",c:C.blue},{v:`${summary.attendance_avg}%`,l:"Attendance",c:attColor}].map((s,i)=>(
          <div key={i} style={{padding:"8px 10px",borderRadius:10,background:`${s.c}08`,border:`1px solid ${s.c}16`,textAlign:"center"}}>
            <div style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:15,color:s.c,lineHeight:1}}>{s.v}</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:C.w30,textTransform:"uppercase",letterSpacing:".5px",marginTop:3}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w30,letterSpacing:".5px",textTransform:"uppercase"}}>Course Progress</span>
          {summary.batch.start_date&&<span style={{fontFamily:"'Raleway',sans-serif",fontSize:11,color:C.w40}}>{summary.batch.start_date} → {summary.batch.end_date}</span>}
        </div>
        <ProgressBar pct={summary.progress_pct} color={st.color} h={5}/>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────
   SKELETON LOADER
─────────────────────────────────────────── */
function Skeleton({w="100%",h=18,radius=8,style={}}:{w?:string;h?:number;radius?:number;style?:React.CSSProperties}){
  return<div style={{width:w,height:h,borderRadius:radius,background:"rgba(255,255,255,0.05)",animation:"lu-shimmer 1.6s ease-in-out infinite",...style}}/>
}

/* ──────────────────────────────────────────
   MAIN PAGE
─────────────────────────────────────────── */
export default function TrainerDashboardPage(){

  // In production get from auth context / JWT
  const TRAINER_UUID = process.env.NEXT_PUBLIC_TRAINER_UUID ?? "t001"

  const [data,    setData]    = useState<TrainerData|null>(null)
  const [loading, setLoading] = useState(true)
  const [ready,   setReady]   = useState(false)
  const [clock,   setClock]   = useState("")

  /* ── Clock ── */
  useEffect(()=>{
    const tick=()=>setClock(new Date().toLocaleTimeString("en-IN",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"}))
    tick(); const t=setInterval(tick,1000); return()=>clearInterval(t)
  },[])

  /* ── Load dashboard ── */
  const load=useCallback(async()=>{
    setLoading(true)
    try{
      const r=await axios.get(`${API}/analytics/dashboard/trainer/${TRAINER_UUID}`)
      setData(r.data?.data??r.data)
    }catch{
      // Demo fallback
      const today=new Date().toISOString().split("T")[0]
      setData({
        trainer:{name:"Dr. Arjun Venkataraman",email:"arjun@lumina.io",uuid:"t001"},
        total_batches:4, active_batches:2, total_students:38, total_sessions:42, sessions_today:2,
        overall_attendance:{total:320,present:260,absent:40,late:20,pct:87.5},
        upcoming_sessions:[
          {uuid:"s1",title:"Backpropagation & Gradient Descent",session_number:7,session_date:today,start_time:"19:00:00",end_time:"21:00:00",status:"scheduled",meeting_link:"https://meet.google.com/abc",batch_name:"Batch 2024-A",course_title:"Neural Networks & Deep Learning"},
          {uuid:"s2",title:"Convolutional Neural Networks",      session_number:8,session_date:today,start_time:"21:00:00",end_time:"22:30:00",status:"live",     meeting_link:"https://meet.google.com/def",batch_name:"Batch 2024-B",course_title:"Computer Vision"},
          {uuid:"s3",title:"React Hooks Deep Dive",             session_number:4,session_date:new Date(Date.now()+86400000).toISOString().split("T")[0],start_time:"18:00:00",end_time:"20:00:00",status:"scheduled",meeting_link:"https://zoom.us/xyz",batch_name:"Batch 2024-C",course_title:"Full-Stack Dev"},
        ],
        batch_summaries:[
          {batch:{id:1,uuid:"b1",name:"Batch 2024-A — Neural Networks",status:"active",start_date:"2025-01-10",end_date:"2025-04-10",course:{id:1,uuid:"c1",title:"Neural Networks & Deep Learning",level:"advanced"}}, student_count:12,session_count:10,completed_sessions:7,progress_pct:70,attendance_avg:88},
          {batch:{id:2,uuid:"b2",name:"Batch 2024-B — Computer Vision",status:"active",start_date:"2025-02-01",end_date:"2025-05-01",course:{id:2,uuid:"c2",title:"Computer Vision with PyTorch",level:"intermediate"}}, student_count:10,session_count:8,completed_sessions:4,progress_pct:50,attendance_avg:76},
          {batch:{id:3,uuid:"b3",name:"Batch 2024-C — Full-Stack Dev",status:"upcoming",start_date:"2025-03-15",end_date:"2025-06-15",course:{id:3,uuid:"c3",title:"Full-Stack Web Development",level:"beginner"}},student_count:16,session_count:6,completed_sessions:1,progress_pct:16,attendance_avg:100},
          {batch:{id:4,uuid:"b4",name:"Batch 2023-Z — Deep Learning",status:"completed",start_date:"2024-06-01",end_date:"2024-11-30",course:{id:1,uuid:"c1",title:"Neural Networks & Deep Learning",level:"advanced"}},student_count:14,session_count:24,completed_sessions:24,progress_pct:100,attendance_avg:84},
        ],
        recent_sessions:[
          {uuid:"r1",title:"Activation Functions & Loss",session_number:6,session_date:new Date(Date.now()-86400000).toISOString().split("T")[0],start_time:"19:00:00",end_time:"21:00:00",status:"completed",batch_name:"Batch 2024-A",course_title:"Neural Networks"},
          {uuid:"r2",title:"Feature Extraction with CNN",       session_number:3,session_date:new Date(Date.now()-2*86400000).toISOString().split("T")[0],start_time:"19:00:00",end_time:"21:00:00",status:"completed",batch_name:"Batch 2024-B",course_title:"Computer Vision"},
        ],
      })
    }finally{
      setLoading(false)
      setTimeout(()=>setReady(true),80)
    }
  },[TRAINER_UUID])

  useEffect(()=>{ load() },[load])

  const D=(s:number)=>ready?`lu-reveal .5s ${s}s both`:"none"

  if(loading||!data){
    return(
      <div style={{display:"flex",height:"100vh",overflow:"hidden",background:"#020810"}}>
        <LuminaSideNav role="trainer"/>
        <div style={{flex:1,display:"flex",flexDirection:"column"}}>
          <LuminaTopBar role="trainer"/>
          <div style={{flex:1,padding:"22px 24px",display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:14,alignContent:"start"}}>
            {Array.from({length:5}).map((_,i)=><Skeleton key={i} h={110} radius={16}/>)}
            <div style={{gridColumn:"1/-1",display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              {Array.from({length:4}).map((_,i)=><Skeleton key={i} h={200} radius={20}/>)}
            </div>
          </div>
        </div>
        <style>{`@keyframes lu-shimmer{0%,100%{opacity:.5}50%{opacity:1}} *{box-sizing:border-box}`}</style>
      </div>
    )
  }

  const todaySessions  = data.upcoming_sessions.filter(s=>isToday(s.session_date))
  const futureSessions = data.upcoming_sessions.filter(s=>!isToday(s.session_date))
  const att            = data.overall_attendance
  const attColor       = att.pct>=75?C.green:att.pct>=50?C.orange:C.red

  const greetHour = new Date().getHours()
  const greeting  = greetHour<12?"Good morning":greetHour<17?"Good afternoon":"Good evening"

  return(
    <>
      <LuminaBackground/>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:1}}>
        <div style={{position:"absolute",width:"100%",height:1,background:"linear-gradient(90deg,transparent,rgba(255,185,0,0.05),rgba(255,185,0,0.1),rgba(255,185,0,0.05),transparent)",animation:"lu-scan 18s linear infinite"}}/>
      </div>

      <div style={{display:"flex",height:"100vh",overflow:"hidden",position:"relative",zIndex:2}}>
        <LuminaSideNav role="trainer"/>

        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
          <LuminaTopBar role="trainer"/>

          <div style={{flex:1,overflowY:"auto",padding:"22px 24px 44px"}}>
            <div style={{maxWidth:1440,margin:"0 auto"}}>

              {/* ── PAGE HEADER ── */}
              <div style={{marginBottom:26,animation:D(0)}}>
                {/* Eyebrow */}
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:C.gold,letterSpacing:"2px",textTransform:"uppercase",marginBottom:5,display:"flex",alignItems:"center",gap:8}}>
                  <span style={{width:16,height:1,background:C.gold,opacity:.6,display:"inline-block"}}/>
                  {new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
                </div>

                <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
                  <div>
                    <h1 style={{fontFamily:"'Oxanium',sans-serif",fontWeight:800,fontSize:"clamp(22px,3vw,34px)",color:C.w90,letterSpacing:"-.5px",margin:0,lineHeight:1.1}}>
                      {greeting}, {data.trainer.name.split(" ")[0]} 👋
                    </h1>
                    <p style={{fontFamily:"'Raleway',sans-serif",fontSize:15,color:C.w50,margin:"6px 0 0",fontWeight:300}}>
                      You have <span style={{color:C.gold,fontWeight:600}}>{data.sessions_today} session{data.sessions_today!==1?"s":""}</span> today · {data.active_batches} active batch{data.active_batches!==1?"es":""}
                    </p>
                  </div>

                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    {/* Live clock */}
                    <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:16,color:C.gold,letterSpacing:".2em",padding:"6px 16px",borderRadius:10,background:"rgba(255,185,0,0.07)",border:"1px solid rgba(255,185,0,0.2)"}}>
                      {clock}
                    </div>
                    <button onClick={load} style={{padding:"9px 16px",borderRadius:100,border:"1px solid rgba(255,255,255,0.15)",background:C.w04,color:C.w60,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:12,fontWeight:700,transition:"all .2s"}}
                      onMouseEnter={e=>{e.currentTarget.style.color=C.w90}} onMouseLeave={e=>{e.currentTarget.style.color=C.w60}}>
                      ↺
                    </button>
                  </div>
                </div>
              </div>

              {/* ── STAT CARDS ── */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14,marginBottom:24,animation:D(.06)}}>
                <StatCard icon="🗂"  value={data.total_batches}    label="Total Batches"       color={C.gold}   delay={0}   />
                <StatCard icon="▶"   value={data.active_batches}   label="Active Batches"      color={C.green}  delay={.04} />
                <StatCard icon="🎓"  value={data.total_students}   label="Students Enrolled"   color={C.blue}   delay={.08} />
                <StatCard icon="📅"  value={data.total_sessions}   label="Sessions Total"      color={C.cyan}   delay={.12} />
                <StatCard icon="🔥"  value={data.sessions_today}   label="Sessions Today"      color={C.orange} delay={.16} sub={`${todaySessions.filter(s=>s.status==="live").length} live now`}/>
                <StatCard icon="📊"  value={`${att.pct}%`}        label="Attendance Rate"     color={attColor} delay={.20} sub={`${att.present} present / ${att.total} total`}/>
              </div>

              {/* ── MAIN GRID ── */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 380px",gap:22,alignItems:"start"}}>

                {/* LEFT COLUMN */}
                <div style={{display:"flex",flexDirection:"column",gap:22}}>

                  {/* TODAY'S SESSIONS */}
                  {todaySessions.length>0&&(
                    <Card accent={C.gold} noHover style={{padding:"22px",animation:D(.12)}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <h2 style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:17,color:C.w90,margin:0}}>Today's Sessions</h2>
                          {todaySessions.some(s=>s.status==="live")&&(
                            <span style={{padding:"3px 10px",borderRadius:100,fontFamily:"'Share Tech Mono',monospace",fontSize:9,letterSpacing:".5px",textTransform:"uppercase",background:"rgba(0,229,160,0.12)",border:"1px solid rgba(0,229,160,0.3)",color:C.green,display:"flex",alignItems:"center",gap:4}}>
                              <span style={{width:5,height:5,borderRadius:"50%",background:C.green,animation:"lu-pulse 1.5s ease-in-out infinite",display:"inline-block"}}/>LIVE NOW
                            </span>
                          )}
                        </div>
                        <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:C.w30,letterSpacing:".3px"}}>{todaySessions.length} scheduled</span>
                      </div>
                      {todaySessions.map(s=><SessionItem key={s.uuid} session={s}/>)}
                    </Card>
                  )}

                  {/* BATCH OVERVIEW */}
                  <div style={{animation:D(.16)}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                      <h2 style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:17,color:C.w90,margin:0}}>My Batches</h2>
                      <a href="/trainer/batches" style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:C.gold,letterSpacing:".5px",textTransform:"uppercase",textDecoration:"none",transition:"color .2s"}}
                        onMouseEnter={e=>e.currentTarget.style.color=C.w90} onMouseLeave={e=>e.currentTarget.style.color=C.gold}>
                        Manage all →
                      </a>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16}}>
                      {data.batch_summaries.map(s=><BatchCard key={s.batch.uuid} summary={s}/>)}
                    </div>
                  </div>

                  {/* ATTENDANCE OVERVIEW */}
                  <Card accent={C.green} noHover style={{padding:"22px",animation:D(.2)}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
                      <h2 style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:17,color:C.w90,margin:0}}>Attendance Overview</h2>
                      <a href="/trainer/attendance" style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:C.gold,letterSpacing:".5px",textTransform:"uppercase",textDecoration:"none"}}>Open PULSE →</a>
                    </div>

                    <div style={{display:"flex",alignItems:"center",gap:28,flexWrap:"wrap"}}>
                      {/* Rings */}
                      <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
                        <ArcRing pct={att.pct} size={88} color={attColor} value={`${att.pct}%`} label="Overall Rate"/>
                        <ArcRing pct={att.total?Math.round(att.present/att.total*100):0} size={72} color={C.green} value={String(att.present)} label="Present"/>
                        <ArcRing pct={att.total?Math.round(att.late/att.total*100):0} size={72} color={C.orange} value={String(att.late)} label="Late"/>
                        <ArcRing pct={att.total?Math.round(att.absent/att.total*100):0} size={72} color={C.red} value={String(att.absent)} label="Absent"/>
                      </div>

                      {/* Per-batch attendance bars */}
                      <div style={{flex:1,minWidth:200,display:"flex",flexDirection:"column",gap:12}}>
                        {data.batch_summaries.filter(s=>s.batch.status!=="completed").map(s=>{
                          const c=s.attendance_avg>=75?C.green:s.attendance_avg>=50?C.orange:C.red
                          return(
                            <div key={s.batch.uuid}>
                              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                                <span style={{fontFamily:"'Raleway',sans-serif",fontSize:13,color:C.w70,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",flex:1}}>{s.batch.name}</span>
                                <span style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:13,color:c,marginLeft:10,flexShrink:0}}>{s.attendance_avg}%</span>
                              </div>
                              <ProgressBar pct={s.attendance_avg} color={c} h={5}/>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </Card>

                </div>

                {/* RIGHT COLUMN */}
                <div style={{display:"flex",flexDirection:"column",gap:22}}>

                  {/* TRAINER IDENTITY CARD */}
                  <Card accent={C.gold} noHover style={{padding:"22px",animation:D(.1)}}>
                    <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:18}}>
                      {/* Avatar */}
                      <div style={{position:"relative",flexShrink:0}}>
                        <div style={{width:52,height:52,borderRadius:"50%",background:"linear-gradient(135deg,#ffc933,#ffad00)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Oxanium',sans-serif",fontWeight:800,fontSize:18,color:"#020810",border:"2px solid rgba(255,185,0,0.4)",boxShadow:"0 0 20px rgba(255,185,0,0.3)"}}>
                          {initials(data.trainer.name)}
                        </div>
                        <div style={{position:"absolute",bottom:-1,right:-1,width:13,height:13,borderRadius:"50%",background:C.green,border:"2px solid #020810",boxShadow:`0 0 6px ${C.green}`}}/>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:15,color:C.w90,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{data.trainer.name}</div>
                        <div style={{fontFamily:"'Raleway',sans-serif",fontSize:12,color:C.w40,marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{data.trainer.email}</div>
                        <div style={{display:"flex",alignItems:"center",gap:5,marginTop:5}}>
                          <span style={{width:5,height:5,borderRadius:"50%",background:C.green,boxShadow:`0 0 6px ${C.green}`,display:"inline-block",animation:"lu-pulse 2s ease-in-out infinite"}}/>
                          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.green,textTransform:"uppercase",letterSpacing:".5px"}}>Online · Trainer</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick numbers */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                      {[{v:data.total_batches,l:"Batches",c:C.gold},{v:data.active_batches,l:"Active",c:C.green},{v:data.total_students,l:"Students",c:C.blue},{v:data.total_sessions,l:"Sessions",c:C.cyan}].map((s,i)=>(
                        <div key={i} style={{padding:"10px 12px",borderRadius:11,background:`${s.c}08`,border:`1px solid ${s.c}18`}}>
                          <div style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:20,color:s.c}}>{s.v}</div>
                          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w30,textTransform:"uppercase",letterSpacing:".5px",marginTop:2}}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* UPCOMING (non-today) */}
                  {futureSessions.length>0&&(
                    <Card accent={C.blue} noHover style={{padding:"22px",animation:D(.15)}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
                        <h2 style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:16,color:C.w90,margin:0}}>Upcoming</h2>
                        <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w30,letterSpacing:".5px"}}>{futureSessions.length} scheduled</span>
                      </div>
                      {futureSessions.map(s=><SessionItem key={s.uuid} session={s} showDate/>)}
                    </Card>
                  )}

                  {/* RECENT SESSIONS */}
                  {data.recent_sessions.length>0&&(
                    <Card accent={C.purple} noHover style={{padding:"22px",animation:D(.2)}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
                        <h2 style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:16,color:C.w90,margin:0}}>Recently Taught</h2>
                        <a href="/trainer/sessions" style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:C.gold,letterSpacing:".5px",textTransform:"uppercase",textDecoration:"none"}}>View all →</a>
                      </div>
                      {data.recent_sessions.map(s=>(
                        <div key={s.uuid} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderBottom:`1px solid ${C.w06}`}}>
                          <div style={{width:8,height:8,borderRadius:"50%",background:C.purple,boxShadow:`0 0 6px ${C.purple}`,flexShrink:0}}/>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontFamily:"'Raleway',sans-serif",fontSize:13,fontWeight:600,color:C.w80,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.title}</div>
                            <div style={{fontFamily:"'Raleway',sans-serif",fontSize:11,color:C.w40,marginTop:2}}>{s.batch_name}</div>
                          </div>
                          <div style={{flexShrink:0,textAlign:"right"}}>
                            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:C.w30}}>{fmtDate(s.session_date)}</div>
                            <span style={{padding:"2px 7px",borderRadius:100,fontFamily:"'Share Tech Mono',monospace",fontSize:8,letterSpacing:".3px",background:"rgba(167,139,250,0.1)",border:"1px solid rgba(167,139,250,0.22)",color:C.purple}}>Done</span>
                          </div>
                        </div>
                      ))}
                    </Card>
                  )}

                  {/* QUICK ACTIONS */}
                  <Card accent={C.gold} noHover style={{padding:"22px",animation:D(.24)}}>
                    <h2 style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:16,color:C.w90,margin:"0 0 14px"}}>Quick Actions</h2>
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      {[
                        {icon:"◎",label:"Open PULSE Attendance",    href:"/trainer/attendance", color:C.green},
                        {icon:"📅",label:"View My Schedule",         href:"/trainer/sessions",   color:C.blue},
                        {icon:"📘",label:"Course Materials",         href:"/trainer/content",    color:C.cyan},
                        {icon:"✎",label:"Grade Assignments",         href:"/trainer/assignments",color:C.gold},
                        {icon:"👤",label:"My Profile",               href:"/trainer/profile",    color:C.purple},
                      ].map(a=>(
                        <a key={a.href} href={a.href} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:12,background:C.w04,border:`1px solid ${C.w08}`,textDecoration:"none",transition:"all .25s",cursor:"pointer"}}
                          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=`${a.color}0e`;(e.currentTarget as HTMLElement).style.borderColor=`${a.color}28`;(e.currentTarget as HTMLElement).style.transform="translateX(4px)"}}
                          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background=C.w04;(e.currentTarget as HTMLElement).style.borderColor=C.w08;(e.currentTarget as HTMLElement).style.transform="none"}}>
                          <div style={{width:32,height:32,borderRadius:9,background:`${a.color}10`,border:`1px solid ${a.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{a.icon}</div>
                          <span style={{fontFamily:"'Raleway',sans-serif",fontSize:13,fontWeight:600,color:C.w80,transition:"color .2s"}}>{a.label}</span>
                          <span style={{marginLeft:"auto",fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:C.w30}}>→</span>
                        </a>
                      ))}
                    </div>
                  </Card>

                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@400;500;600;700;800&family=Raleway:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap');
        *,*::before,*::after{box-sizing:border-box}html,body{background:#020810;margin:0;height:100%}
        @keyframes lu-scan   {from{transform:translateY(-100vh)}to{transform:translateY(200vh)}}
        @keyframes lu-reveal {from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
        @keyframes lu-pulse  {0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.2)}}
        @keyframes lu-shimmer{0%,100%{opacity:.5}50%{opacity:1}}
        @keyframes lu-spin   {to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,185,0,0.2);border-radius:4px}
        @media(max-width:1024px){
          .dash-grid{grid-template-columns:1fr!important}
        }
        @media(max-width:640px){
          h1{font-size:22px!important}
        }
      `}</style>
    </>
  )
}

declare module "react"{ interface CSSProperties{ [key:string]:any } }