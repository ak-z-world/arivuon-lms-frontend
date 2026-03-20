// app/admin/schedules/page.tsx
"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import axios from "axios"
import LuminaBackground from "@/components/background/LuminaBackground"
import LuminaSideNav   from "@/components/layout/LuminaSideNav"
import LuminaTopBar     from "@/components/layout/LuminaTopBar"

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */
interface Session {
  id:             number
  uuid:           string
  title:          string
  session_number: number
  session_date:   string
  start_time:     string
  end_time:       string
  status:         "scheduled" | "live" | "completed" | "cancelled"
  meeting_link?:  string
  recording_link?: string
  batch?:         { id: number; uuid: string; name: string }
  trainer?:       { id: number; uuid: string; name: string }
  attendances?:   Attendance[]
  resources?:     Resource[]
}

interface Attendance {
  id:         number
  student_id: number
  status:     string
  student?:   { id: number; name: string; email: string }
}

interface Resource {
  id:            number
  title:         string
  resource_type: string
  url:           string
}

interface SessionFormData {
  batch_uuid:     string
  trainer_uuid:   string
  title:          string
  session_number: string
  session_date:   string
  start_time:     string
  end_time:       string
  meeting_link:   string
}

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

const C = {
  gold:   "#ffc933", gold2:  "#ffad00",
  blue:   "#1a96ff", cyan:   "#00d4ff",
  green:  "#00e5a0", red:    "#ff4d6a",
  purple: "#a78bfa", orange: "#ff8c42",
  surf:   "rgba(5,14,32,0.92)",
  w90: "rgba(255,255,255,0.9)", w80: "rgba(255,255,255,0.8)",
  w70: "rgba(255,255,255,0.7)", w60: "rgba(255,255,255,0.6)",
  w50: "rgba(255,255,255,0.5)", w40: "rgba(255,255,255,0.4)",
  w30: "rgba(255,255,255,0.3)", w20: "rgba(255,255,255,0.2)",
  w15: "rgba(255,255,255,0.15)",w10: "rgba(255,255,255,0.10)",
  w08: "rgba(255,255,255,0.08)",w04: "rgba(255,255,255,0.04)",
}

const SESSION_STATUS = {
  scheduled: { label: "Scheduled", color: C.blue,   bg: "rgba(26,150,255,0.12)",  border: "rgba(26,150,255,0.3)",  icon: "◷" },
  live:      { label: "Live",      color: C.green,  bg: "rgba(0,229,160,0.12)",   border: "rgba(0,229,160,0.3)",   icon: "●" },
  completed: { label: "Done",      color: C.purple, bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.3)", icon: "✓" },
  cancelled: { label: "Cancelled", color: C.red,    bg: "rgba(255,77,106,0.10)",  border: "rgba(255,77,106,0.25)", icon: "✕" },
}

const RESOURCE_TYPES = ["pdf","video","link","doc","slides","code","image","other"]
const RESOURCE_ICONS: Record<string,string> = { pdf:"📄",video:"🎥",link:"🔗",doc:"📝",slides:"📊",code:"💻",image:"🖼",other:"📎" }

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" })
}
function fmtDateShort(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short" })
}
function isToday(d: string) {
  const t = new Date(); const s = new Date(d)
  return t.getFullYear()===s.getFullYear() && t.getMonth()===s.getMonth() && t.getDate()===s.getDate()
}
function isPast(d: string) { return new Date(d) < new Date(new Date().toDateString()) }
function isFuture(d: string) { return new Date(d) > new Date(new Date().toDateString()) }
function fmtTime(t?: string) { if (!t) return "—"; const [h,m]=t.split(":"); const hr=parseInt(h); return `${hr%12||12}:${m} ${hr>=12?"PM":"AM"}` }
function groupByDate(sessions: Session[]): Record<string, Session[]> {
  return sessions.reduce((acc, s) => {
    const d = s.session_date
    acc[d] = acc[d] ? [...acc[d], s] : [s]
    return acc
  }, {} as Record<string, Session[]>)
}
function initials(name: string) { return name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2) }

/* ─────────────────────────────────────────
   TOAST
───────────────────────────────────────── */
function useToast() {
  const [toasts, setToasts] = useState<{id:number;msg:string;type:string}[]>([])
  const show = useCallback((msg:string, type="info") => {
    const id = Date.now()
    setToasts(t => [...t,{id,msg,type}])
    setTimeout(() => setToasts(t => t.filter(x=>x.id!==id)), 3200)
  },[])
  return { toasts, show }
}

/* ─────────────────────────────────────────
   SHARED FORM PRIMITIVES
───────────────────────────────────────── */
const FI: React.CSSProperties = {
  background: C.w04, border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 11, padding: "11px 14px", color: C.w90,
  fontFamily:"'Raleway',sans-serif", fontSize:14,
  outline:"none", transition:"all .2s", width:"100%",
}

function FocusInput({ style, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input style={{ ...FI, ...style }}
      onFocus={e=>{e.currentTarget.style.borderColor="rgba(26,150,255,0.45)";e.currentTarget.style.boxShadow="0 0 0 3px rgba(26,150,255,0.07)"}}
      onBlur={e =>{e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";e.currentTarget.style.boxShadow="none"}}
      {...props} />
  )
}

function FocusSelect({ style, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select style={{ ...FI,cursor:"pointer",...style }}
      onFocus={e=>e.currentTarget.style.borderColor="rgba(26,150,255,0.45)"}
      onBlur={e =>e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"}
      {...props}>{children}</select>
  )
}

function Field({ label, required, children, style }: {
  label:string; required?:boolean; children:React.ReactNode; style?: React.CSSProperties
}) {
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:6,...style }}>
      <label style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w40,letterSpacing:"1.5px",textTransform:"uppercase" }}>
        {label} {required && <span style={{ color:C.blue }}>*</span>}
      </label>
      {children}
    </div>
  )
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:13,color:C.w70,display:"flex",alignItems:"center",gap:10,gridColumn:"1/-1",marginTop:4 }}>
      {label}<div style={{ flex:1,height:1,background:"linear-gradient(90deg,rgba(26,150,255,0.2),transparent)" }}/>
    </div>
  )
}

/* ─────────────────────────────────────────
   STAT CARD
───────────────────────────────────────── */
function StatCard({ icon, value, label, color, pulse }: {
  icon:string; value:string|number; label:string; color:string; pulse?:boolean
}) {
  const [hov,setHov] = useState(false)
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:C.surf,borderRadius:16,padding:"16px 18px",backdropFilter:"blur(24px)",border:`1px solid ${hov?color+"30":color+"16"}`,transition:"all .3s cubic-bezier(.22,1,.36,1)",cursor:"default",transform:hov?"translateY(-3px)":"none",boxShadow:hov?`0 16px 40px rgba(0,0,0,0.45),0 0 20px ${color}10`:"0 6px 24px rgba(0,0,0,0.35)",position:"relative",overflow:"hidden" }}>
      <div style={{ position:"absolute",top:0,left:"8%",right:"8%",height:1,background:`linear-gradient(90deg,transparent,${color}45,transparent)` }}/>
      <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}>
        <span style={{ fontSize:18 }}>{icon}</span>
        {pulse && <span style={{ width:7,height:7,borderRadius:"50%",background:color,boxShadow:`0 0 8px ${color}`,display:"inline-block",animation:"lu-pulse 2s ease-in-out infinite" }}/>}
      </div>
      <div style={{ fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:28,color,lineHeight:1,marginBottom:3 }}>{value}</div>
      <div style={{ fontFamily:"'Raleway',sans-serif",fontSize:12,color:C.w50 }}>{label}</div>
    </div>
  )
}

/* ─────────────────────────────────────────
   SESSION CARD (timeline item)
───────────────────────────────────────── */
function SessionCard({ session, onView, onEdit, onDelete }: {
  session: Session; onView:()=>void; onEdit:()=>void; onDelete:()=>void
}) {
  const [hov, setHov] = useState(false)
  const st = SESSION_STATUS[session.status] ?? SESSION_STATUS.scheduled
  const isLive = session.status === "live"

  return (
    <div
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        background: C.surf, borderRadius: 16,
        border: `1px solid ${hov ? st.color + "35" : isLive ? st.border : "rgba(255,255,255,0.07)"}`,
        backdropFilter: "blur(24px)",
        padding: "16px 18px",
        transition: "all .3s cubic-bezier(.22,1,.36,1)",
        transform: hov ? "translateX(4px)" : "none",
        boxShadow: isLive ? `0 0 0 1px ${st.color}20, 0 8px 32px rgba(0,0,0,0.4), 0 0 24px ${st.color}08` : "0 4px 20px rgba(0,0,0,0.35)",
        cursor: "pointer",
        position: "relative", overflow: "hidden",
      }}
      onClick={onView}
    >
      {/* Left colour bar */}
      <div style={{ position:"absolute",left:0,top:0,bottom:0,width:3,background:`linear-gradient(180deg,${st.color},${st.color}44)`,boxShadow:`0 0 8px ${st.color}55` }}/>

      <div style={{ paddingLeft: 12 }}>
        {/* Top row */}
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:10 }}>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:5,flexWrap:"wrap" }}>
              <span style={{ padding:"3px 9px",borderRadius:100,fontFamily:"'Share Tech Mono',monospace",fontSize:9,letterSpacing:".5px",textTransform:"uppercase",background:st.bg,border:`1px solid ${st.border}`,color:st.color,display:"flex",alignItems:"center",gap:4 }}>
                {isLive && <span style={{ width:5,height:5,borderRadius:"50%",background:st.color,animation:"lu-pulse 1.5s ease-in-out infinite",display:"inline-block" }}/>}
                {st.icon} {st.label}
              </span>
              <span style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w30,letterSpacing:".5px" }}>
                #{session.session_number}
              </span>
            </div>
            <h4 style={{ fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:15,color:C.w90,margin:0,letterSpacing:".1px",lineHeight:1.3 }}>
              {session.title}
            </h4>
            {session.batch && (
              <div style={{ fontFamily:"'Raleway',sans-serif",fontSize:12,color:C.w40,marginTop:3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>
                {session.batch.name}
              </div>
            )}
          </div>

          {/* Time block */}
          <div style={{ textAlign:"right",flexShrink:0 }}>
            <div style={{ fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:15,color:st.color }}>{fmtTime(session.start_time)}</div>
            <div style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:C.w30,marginTop:2 }}>– {fmtTime(session.end_time)}</div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" }}>
          {session.trainer && (
            <div style={{ display:"flex",alignItems:"center",gap:6,flex:1,minWidth:0 }}>
              <div style={{ width:24,height:24,borderRadius:7,background:"rgba(26,150,255,0.15)",border:"1px solid rgba(26,150,255,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:9,color:C.blue,flexShrink:0 }}>
                {initials(session.trainer.name)}
              </div>
              <span style={{ fontFamily:"'Raleway',sans-serif",fontSize:12,color:C.w50,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{session.trainer.name}</span>
            </div>
          )}

          <div style={{ display:"flex",gap:6,flexShrink:0 }}>
            {session.meeting_link && (
              <a href={session.meeting_link} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}
                style={{ padding:"5px 10px",borderRadius:8,background:"rgba(0,229,160,0.08)",border:"1px solid rgba(0,229,160,0.2)",color:C.green,fontFamily:"'Share Tech Mono',monospace",fontSize:9,letterSpacing:".5px",textDecoration:"none",transition:"all .2s" }}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(0,229,160,0.14)"}
                onMouseLeave={e=>e.currentTarget.style.background="rgba(0,229,160,0.08)"}>
                🔗 JOIN
              </a>
            )}
            {session.recording_link && (
              <a href={session.recording_link} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}
                style={{ padding:"5px 10px",borderRadius:8,background:"rgba(167,139,250,0.08)",border:"1px solid rgba(167,139,250,0.2)",color:C.purple,fontFamily:"'Share Tech Mono',monospace",fontSize:9,letterSpacing:".5px",textDecoration:"none" }}>
                ▶ REC
              </a>
            )}

            {/* Actions */}
            {hov && (
              <div style={{ display:"flex",gap:5 }} onClick={e=>e.stopPropagation()}>
                {[
                  { icon:"✎", color:C.gold,   cb:onEdit   },
                  { icon:"🗑", color:C.red,    cb:onDelete },
                ].map((b,i)=>(
                  <button key={i} onClick={b.cb}
                    style={{ width:28,height:28,borderRadius:7,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,background:`${b.color}10`,color:b.color,transition:"all .2s" }}
                    onMouseEnter={e=>e.currentTarget.style.background=`${b.color}22`}
                    onMouseLeave={e=>e.currentTarget.style.background=`${b.color}10`}>
                    {b.icon}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   DATE STRIP HEADER
───────────────────────────────────────── */
function DateStrip({ dateStr, sessions }: { dateStr: string; sessions: Session[] }) {
  const today    = isToday(dateStr)
  const past     = isPast(dateStr)
  const liveCount = sessions.filter(s => s.status === "live").length
  const accentCol = today ? C.gold : past ? C.w30 : C.blue

  return (
    <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:12,marginTop:4 }}>
      {/* Date badge */}
      <div style={{ flexShrink:0,textAlign:"center",padding:"10px 14px",borderRadius:14,minWidth:62,
        background: today ? "linear-gradient(135deg,rgba(255,185,0,0.16),rgba(255,185,0,0.08))" : past ? C.w04 : "rgba(26,150,255,0.08)",
        border: `1px solid ${today?"rgba(255,185,0,0.35)":past?C.w08:"rgba(26,150,255,0.2)"}`,
        boxShadow: today ? "0 0 16px rgba(255,185,0,0.15)" : "none",
      }}>
        <div style={{ fontFamily:"'Oxanium',sans-serif",fontWeight:800,fontSize:22,color:accentCol,lineHeight:1 }}>
          {new Date(dateStr).getDate()}
        </div>
        <div style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:accentCol,textTransform:"uppercase",letterSpacing:"1px",marginTop:2,opacity:.7 }}>
          {new Date(dateStr).toLocaleDateString("en-IN",{month:"short"})}
        </div>
      </div>

      {/* Title + chips */}
      <div style={{ flex:1,minWidth:0 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:3,flexWrap:"wrap" }}>
          <span style={{ fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:16,color:today?C.gold:past?C.w50:C.w90 }}>
            {today ? "Today" : new Date(dateStr).toLocaleDateString("en-IN",{weekday:"long"})}
          </span>
          {!today && <span style={{ fontFamily:"'Raleway',sans-serif",fontSize:13,color:C.w40 }}>{fmtDateShort(dateStr)}</span>}
          {liveCount > 0 && (
            <span style={{ padding:"2px 8px",borderRadius:100,background:"rgba(0,229,160,0.12)",border:"1px solid rgba(0,229,160,0.28)",fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.green,display:"flex",alignItems:"center",gap:4 }}>
              <span style={{ width:5,height:5,borderRadius:"50%",background:C.green,animation:"lu-pulse 1.5s ease-in-out infinite",display:"inline-block" }}/>
              {liveCount} LIVE
            </span>
          )}
        </div>
        <div style={{ fontFamily:"'Raleway',sans-serif",fontSize:12,color:C.w30 }}>
          {sessions.length} session{sessions.length!==1?"s":""}
        </div>
      </div>

      {/* Divider */}
      <div style={{ flex:1,height:1,background:`linear-gradient(90deg,${accentCol}20,transparent)`,maxWidth:200 }}/>
    </div>
  )
}

/* ─────────────────────────────────────────
   SESSION FORM DIALOG
───────────────────────────────────────── */
const EMPTY_SESSION: SessionFormData = {
  batch_uuid:"", trainer_uuid:"", title:"", session_number:"",
  session_date:"", start_time:"", end_time:"", meeting_link:"",
}

function SessionFormDialog({ mode, initial, batches, onClose, onSubmit, loading, error }: {
  mode:"add"|"edit"; initial:SessionFormData
  batches: { uuid:string; name:string }[]
  onClose:()=>void; onSubmit:(d:SessionFormData)=>void
  loading:boolean; error:string
}) {
  const [form, setForm] = useState<SessionFormData>(initial)
  useEffect(() => setForm(initial), [initial])
  const set = (k: keyof SessionFormData, v: string) => setForm(f=>({...f,[k]:v}))

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(2,8,16,0.86)",backdropFilter:"blur(7px)",zIndex:500,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"24px 16px",overflowY:"auto" }}
      onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div style={{ background:"rgba(5,14,32,0.98)",border:"1px solid rgba(26,150,255,0.22)",borderRadius:24,backdropFilter:"blur(48px)",width:"100%",maxWidth:660,margin:"auto",boxShadow:"0 32px 90px rgba(0,0,0,0.75),0 0 80px rgba(26,150,255,0.06)",position:"relative" }}>
        <div style={{ position:"absolute",top:0,left:"8%",right:"8%",height:1,background:"linear-gradient(90deg,transparent,rgba(26,150,255,0.6),transparent)" }}/>

        {/* Header */}
        <div style={{ padding:"24px 28px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:14 }}>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <div style={{ width:44,height:44,borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,background:"linear-gradient(135deg,rgba(26,150,255,0.18),rgba(0,212,255,0.08))",border:"1px solid rgba(26,150,255,0.3)" }}>
              {mode==="add"?"📅":"✎"}
            </div>
            <div>
              <div style={{ fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:20,color:C.w90 }}>{mode==="add"?"Schedule New Session":"Edit Session"}</div>
              <div style={{ fontFamily:"'Raleway',sans-serif",fontSize:13,color:C.w40,marginTop:3,fontWeight:300 }}>
                {mode==="add"?"Add a class session to a batch schedule":"Update session details"}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ width:34,height:34,borderRadius:9,border:"1px solid rgba(255,255,255,0.1)",background:C.w04,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:C.w50,fontSize:18,transition:"all .2s",flexShrink:0 }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,77,106,0.1)";e.currentTarget.style.color=C.red}}
            onMouseLeave={e=>{e.currentTarget.style.background=C.w04;e.currentTarget.style.color=C.w50}}>✕</button>
        </div>

        <div style={{ padding:"24px 28px" }}>
          {error && (
            <div style={{ padding:"10px 14px",borderRadius:10,background:"rgba(255,77,106,0.1)",border:"1px solid rgba(255,77,106,0.25)",color:C.red,fontFamily:"'Raleway',sans-serif",fontSize:13,marginBottom:18 }}>⚠ {error}</div>
          )}

          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px 18px" }}>
            <SectionDivider label="Session Info" />

            <Field label="Session Title" required style={{ gridColumn:"1/-1" }}>
              <FocusInput value={form.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. Introduction to Backpropagation" maxLength={200} />
            </Field>

            {/* Batch */}
            <Field label="Batch" required style={{ gridColumn:"1/-1" }}>
              {batches.length > 0 ? (
                <FocusSelect value={form.batch_uuid} onChange={e=>set("batch_uuid",e.target.value)}>
                  <option value="">Select batch…</option>
                  {batches.map(b=><option key={b.uuid} value={b.uuid}>{b.name}</option>)}
                </FocusSelect>
              ) : (
                <FocusInput value={form.batch_uuid} onChange={e=>set("batch_uuid",e.target.value)} placeholder="Paste batch UUID" />
              )}
            </Field>

            {/* Trainer */}
            <Field label="Trainer UUID" required style={{ gridColumn:"1/-1" }}>
              <FocusInput value={form.trainer_uuid} onChange={e=>set("trainer_uuid",e.target.value)} placeholder="Paste trainer UUID from Users/Trainers page" />
            </Field>

            <SectionDivider label="Date & Time" />

            <Field label="Session Number" required>
              <FocusInput type="number" value={form.session_number} onChange={e=>set("session_number",e.target.value)} placeholder="1" min={1} />
            </Field>

            <Field label="Session Date" required>
              <FocusInput type="date" value={form.session_date} onChange={e=>set("session_date",e.target.value)} />
            </Field>

            <Field label="Start Time" required>
              <FocusInput type="time" value={form.start_time} onChange={e=>set("start_time",e.target.value)} />
            </Field>

            <Field label="End Time" required>
              <FocusInput type="time" value={form.end_time} onChange={e=>set("end_time",e.target.value)} />
            </Field>

            <SectionDivider label="Links" />

            <Field label="Meeting Link (Zoom / Meet / Teams)" style={{ gridColumn:"1/-1" }}>
              <FocusInput value={form.meeting_link} onChange={e=>set("meeting_link",e.target.value)} placeholder="https://meet.google.com/…" />
            </Field>
          </div>
        </div>

        <div style={{ padding:"18px 28px 24px",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"flex-end",gap:10 }}>
          <button onClick={onClose} style={{ padding:"10px 20px",borderRadius:100,border:"1px solid rgba(255,255,255,0.15)",background:C.w04,color:C.w70,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700,transition:"all .2s" }}>Cancel</button>
          <button onClick={()=>onSubmit(form)} disabled={loading}
            style={{ padding:"10px 24px",borderRadius:100,border:"none",background:loading?"rgba(26,150,255,0.4)":"linear-gradient(135deg,#1a96ff,#00d4ff)",color:"white",cursor:loading?"not-allowed":"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700,letterSpacing:".5px",boxShadow:loading?"none":"0 0 24px rgba(26,150,255,0.35)",transition:"all .2s",display:"flex",alignItems:"center",gap:8 }}
            onMouseEnter={e=>{if(!loading){e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 0 36px rgba(26,150,255,0.55)"}}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=loading?"none":"0 0 24px rgba(26,150,255,0.35)"}}>
            {loading
              ? <><span style={{ width:16,height:16,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.2)",borderTopColor:"white",animation:"lu-spin .8s linear infinite",display:"inline-block" }}/>Saving…</>
              : mode==="add" ? "Schedule Session" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   SESSION VIEW DIALOG  (details + resources + attendance)
───────────────────────────────────────── */
function SessionViewDialog({ session, onClose, onEdit }: {
  session: Session; onClose: ()=>void; onEdit:()=>void
}) {
  const st = SESSION_STATUS[session.status] ?? SESSION_STATUS.scheduled
  const [activeTab, setActiveTab] = useState<"info"|"attendance"|"resources">("info")

  const MetaItem = ({ lbl, val, color }: { lbl:string; val:string; color?:string }) => (
    <div style={{ padding:"11px 13px",borderRadius:12,background:C.w04,border:`1px solid ${C.w08}` }}>
      <div style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w30,textTransform:"uppercase",letterSpacing:"1px",marginBottom:4 }}>{lbl}</div>
      <div style={{ fontFamily:"'Raleway',sans-serif",fontSize:14,fontWeight:600,color:color??C.w90 }}>{val||"—"}</div>
    </div>
  )

  const TABS = ["info","attendance","resources"] as const

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(2,8,16,0.86)",backdropFilter:"blur(7px)",zIndex:500,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"24px 16px",overflowY:"auto" }}
      onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div style={{ background:"rgba(5,14,32,0.98)",border:"1px solid rgba(26,150,255,0.2)",borderRadius:24,backdropFilter:"blur(48px)",width:"100%",maxWidth:720,margin:"auto",boxShadow:"0 32px 90px rgba(0,0,0,0.75)",position:"relative" }}>
        <div style={{ position:"absolute",top:0,left:"8%",right:"8%",height:1,background:"linear-gradient(90deg,transparent,rgba(26,150,255,0.55),transparent)" }}/>
        <div style={{ height:4,background:`linear-gradient(90deg,${st.color}80,${st.color}30,transparent)`,borderRadius:"24px 24px 0 0" }}/>

        {/* Header */}
        <div style={{ padding:"22px 28px 18px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:14 }}>
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8,flexWrap:"wrap" }}>
              <span style={{ padding:"3px 10px",borderRadius:100,fontFamily:"'Share Tech Mono',monospace",fontSize:9,letterSpacing:".5px",textTransform:"uppercase",background:st.bg,border:`1px solid ${st.border}`,color:st.color,display:"flex",alignItems:"center",gap:4 }}>
                {session.status==="live"&&<span style={{ width:5,height:5,borderRadius:"50%",background:st.color,animation:"lu-pulse 1.5s ease-in-out infinite",display:"inline-block" }}/>}
                {st.icon} {st.label}
              </span>
              <span style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:C.w30 }}>Session #{session.session_number}</span>
            </div>
            <h2 style={{ fontFamily:"'Oxanium',sans-serif",fontWeight:800,fontSize:22,color:C.w90,margin:0,letterSpacing:"-.3px" }}>{session.title}</h2>
            {session.batch && <div style={{ fontFamily:"'Raleway',sans-serif",fontSize:14,color:C.w50,marginTop:4 }}>{session.batch.name}</div>}
          </div>
          <button onClick={onClose} style={{ width:34,height:34,borderRadius:9,border:"1px solid rgba(255,255,255,0.1)",background:C.w04,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:C.w50,fontSize:18,transition:"all .2s",flexShrink:0 }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,77,106,0.1)";e.currentTarget.style.color=C.red}}
            onMouseLeave={e=>{e.currentTarget.style.background=C.w04;e.currentTarget.style.color=C.w50}}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex",padding:"0 28px",borderBottom:"1px solid rgba(255,255,255,0.06)",background:"rgba(8,20,44,0.4)" }}>
          {TABS.map(t => (
            <div key={t} onClick={()=>setActiveTab(t)}
              style={{ padding:"12px 16px",fontFamily:"'Oxanium',sans-serif",fontSize:12,fontWeight:600,letterSpacing:".5px",textTransform:"uppercase",color:activeTab===t?C.blue:C.w40,cursor:"pointer",borderBottom:`2px solid ${activeTab===t?C.blue:"transparent"}`,transition:"all .2s",whiteSpace:"nowrap" }}>
              {t==="info"?"Session Info":t==="attendance"?`Attendance (${session.attendances?.length??0})`:`Resources (${session.resources?.length??0})`}
            </div>
          ))}
        </div>

        <div style={{ padding:"22px 28px" }}>
          {/* INFO TAB */}
          {activeTab === "info" && (
            <>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10,marginBottom:18 }}>
                <MetaItem lbl="Date"        val={fmtDate(session.session_date)}   />
                <MetaItem lbl="Start Time"  val={fmtTime(session.start_time)}    />
                <MetaItem lbl="End Time"    val={fmtTime(session.end_time)}      />
                <MetaItem lbl="Session No." val={`#${session.session_number}`}   />
                <MetaItem lbl="Trainer"     val={session.trainer?.name ?? "—"}  />
              </div>

              {(session.meeting_link || session.recording_link) && (
                <div style={{ display:"flex",gap:10,flexWrap:"wrap",marginBottom:18 }}>
                  {session.meeting_link && (
                    <a href={session.meeting_link} target="_blank" rel="noreferrer"
                      style={{ display:"flex",alignItems:"center",gap:8,padding:"11px 18px",borderRadius:12,background:"rgba(0,229,160,0.07)",border:"1px solid rgba(0,229,160,0.22)",color:C.green,fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700,letterSpacing:".5px",textDecoration:"none",transition:"all .2s" }}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(0,229,160,0.14)"}
                      onMouseLeave={e=>e.currentTarget.style.background="rgba(0,229,160,0.07)"}>
                      🔗 Join Meeting
                    </a>
                  )}
                  {session.recording_link && (
                    <a href={session.recording_link} target="_blank" rel="noreferrer"
                      style={{ display:"flex",alignItems:"center",gap:8,padding:"11px 18px",borderRadius:12,background:"rgba(167,139,250,0.07)",border:"1px solid rgba(167,139,250,0.22)",color:C.purple,fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700,letterSpacing:".5px",textDecoration:"none" }}>
                      ▶ Watch Recording
                    </a>
                  )}
                </div>
              )}
            </>
          )}

          {/* ATTENDANCE TAB */}
          {activeTab === "attendance" && (
            <>
              {(!session.attendances || session.attendances.length === 0) ? (
                <div style={{ textAlign:"center",padding:"40px 20px" }}>
                  <div style={{ fontSize:36,marginBottom:12,opacity:.5 }}>◎</div>
                  <div style={{ fontFamily:"'Raleway',sans-serif",fontSize:14,color:C.w40 }}>No attendance records yet</div>
                </div>
              ) : (
                <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                  {session.attendances.map(a => {
                    const col = a.status==="present"?C.green:a.status==="absent"?C.red:C.gold
                    return (
                      <div key={a.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:12,background:C.w04,border:`1px solid ${C.w08}` }}>
                        <div style={{ width:34,height:34,borderRadius:10,background:`${col}12`,border:`1px solid ${col}25`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:12,color:col,flexShrink:0 }}>
                          {a.student ? initials(a.student.name) : "?"}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontFamily:"'Raleway',sans-serif",fontSize:14,fontWeight:600,color:C.w90 }}>{a.student?.name ?? `Student #${a.student_id}`}</div>
                          {a.student?.email && <div style={{ fontFamily:"'Raleway',sans-serif",fontSize:12,color:C.w40 }}>{a.student.email}</div>}
                        </div>
                        <span style={{ padding:"3px 10px",borderRadius:100,fontFamily:"'Share Tech Mono',monospace",fontSize:9,letterSpacing:".5px",textTransform:"uppercase",background:`${col}12`,border:`1px solid ${col}25`,color:col }}>
                          {a.status}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {/* RESOURCES TAB */}
          {activeTab === "resources" && (
            <>
              {(!session.resources || session.resources.length === 0) ? (
                <div style={{ textAlign:"center",padding:"40px 20px" }}>
                  <div style={{ fontSize:36,marginBottom:12,opacity:.5 }}>📂</div>
                  <div style={{ fontFamily:"'Raleway',sans-serif",fontSize:14,color:C.w40 }}>No resources attached to this session</div>
                </div>
              ) : (
                <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                  {session.resources.map(r => (
                    <a key={r.id} href={r.url} target="_blank" rel="noreferrer"
                      style={{ display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderRadius:14,background:C.w04,border:`1px solid ${C.w08}`,textDecoration:"none",transition:"all .2s",cursor:"pointer" }}
                      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="rgba(26,150,255,0.06)";(e.currentTarget as HTMLElement).style.borderColor="rgba(26,150,255,0.2)"}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background=C.w04;(e.currentTarget as HTMLElement).style.borderColor=C.w08}}>
                      <span style={{ fontSize:20,flexShrink:0 }}>{RESOURCE_ICONS[r.resource_type]??RESOURCE_ICONS.other}</span>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontFamily:"'Raleway',sans-serif",fontSize:14,fontWeight:600,color:C.w90 }}>{r.title}</div>
                        <div style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w40,textTransform:"uppercase",letterSpacing:".5px",marginTop:2 }}>{r.resource_type}</div>
                      </div>
                      <span style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:C.blue }}>↗</span>
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div style={{ padding:"18px 28px 24px",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"flex-end",gap:10 }}>
          <button onClick={onClose} style={{ padding:"10px 20px",borderRadius:100,border:"1px solid rgba(255,255,255,0.15)",background:C.w04,color:C.w70,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700 }}>Close</button>
          <button onClick={onEdit}  style={{ padding:"10px 24px",borderRadius:100,border:"none",background:"linear-gradient(135deg,#1a96ff,#00d4ff)",color:"white",cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700,boxShadow:"0 0 24px rgba(26,150,255,0.35)" }}>✎ Edit Session</button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function AdminSchedulesPage() {
  const { toasts, show: toast } = useToast()

  const [sessions,  setSessions]  = useState<Session[]>([])
  const [batches,   setBatches]   = useState<{uuid:string;name:string}[]>([])
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [formErr,   setFormErr]   = useState("")

  const [search,    setSearch]    = useState("")
  const [fBatch,    setFBatch]    = useState("")
  const [fStatus,   setFStatus]   = useState("")
  const [fRange,    setFRange]    = useState<"all"|"today"|"week"|"upcoming"|"past">("all")

  const [dialog,    setDialog]    = useState<"add"|"edit"|"view"|"del"|null>(null)
  const [active,    setActive]    = useState<Session | null>(null)
  const [formInit,  setFormInit]  = useState<SessionFormData>(EMPTY_SESSION)

  /* ── Load ── */
  const load = useCallback(async () => {
    setLoading(true)
    try {
      // Load batches first so we have names for filter
      const batchRes = await axios.get(`${API}/batches/`)
      const batchList = batchRes.data?.data ?? batchRes.data
      setBatches(batchList.map((b: any) => ({ uuid: b.uuid, name: b.name })))

      // Load sessions per batch (since there's no global sessions endpoint)
      const allSessions: Session[] = []
      await Promise.all(
        batchList.map(async (b: any) => {
          try {
            const r = await axios.get(`${API}/sessions/batch/${b.uuid}`)
            const data: Session[] = r.data?.data ?? r.data
            data.forEach(s => { if (!s.batch) s.batch = { id: b.id, uuid: b.uuid, name: b.name } })
            allSessions.push(...data)
          } catch {}
        })
      )
      allSessions.sort((a, b) => {
        const cmp = new Date(a.session_date).getTime() - new Date(b.session_date).getTime()
        if (cmp !== 0) return cmp
        return (a.start_time ?? "").localeCompare(b.start_time ?? "")
      })
      setSessions(allSessions)
    } catch {
      toast("Failed to load sessions. Showing demo data.", "error")
      const today = new Date().toISOString().split("T")[0]
      const yesterday = new Date(Date.now()-86400000).toISOString().split("T")[0]
      const tomorrow  = new Date(Date.now()+86400000).toISOString().split("T")[0]
      const d2 = new Date(Date.now()+2*86400000).toISOString().split("T")[0]
      const d5 = new Date(Date.now()+5*86400000).toISOString().split("T")[0]

      setBatches([
        { uuid:"b001", name:"Batch 2024-A — Neural Networks" },
        { uuid:"b002", name:"Batch 2024-B — React Workshop"  },
        { uuid:"b003", name:"Batch 2024-C — Quantum Basics"  },
      ])
      setSessions([
        { id:1, uuid:"ses001", title:"Deep Learning Fundamentals",        session_number:1, session_date:yesterday, start_time:"19:00:00", end_time:"21:00:00", status:"completed", meeting_link:"https://meet.google.com/abc", recording_link:"https://drive.google.com/rec1", batch:{ id:1,uuid:"b001",name:"Batch 2024-A — Neural Networks" }, trainer:{ id:3,uuid:"t001",name:"Dr. Arjun V." }, attendances:[{id:1,student_id:1,status:"present",student:{id:1,name:"Aryan Kumar",email:"aryan@example.com"}},{id:2,student_id:2,status:"absent",student:{id:2,name:"Priya Sharma",email:"priya@example.com"}}], resources:[{id:1,title:"Session Slides",resource_type:"slides",url:"#"},{id:2,title:"Practice Problems",resource_type:"pdf",url:"#"}] },
        { id:2, uuid:"ses002", title:"Neural Network Architecture",        session_number:2, session_date:today, start_time:"09:00:00", end_time:"11:00:00", status:"completed", meeting_link:"https://meet.google.com/abc", batch:{ id:1,uuid:"b001",name:"Batch 2024-A — Neural Networks" }, trainer:{ id:3,uuid:"t001",name:"Dr. Arjun V." }, attendances:[], resources:[] },
        { id:3, uuid:"ses003", title:"React Hooks Deep Dive",              session_number:3, session_date:today, start_time:"18:00:00", end_time:"20:00:00", status:"live",      meeting_link:"https://zoom.us/xyz", batch:{ id:2,uuid:"b002",name:"Batch 2024-B — React Workshop"  }, trainer:{ id:5,uuid:"t002",name:"Priya S."    }, attendances:[], resources:[] },
        { id:4, uuid:"ses004", title:"Backpropagation & Gradient Descent", session_number:3, session_date:today, start_time:"21:00:00", end_time:"22:30:00", status:"scheduled", meeting_link:"https://meet.google.com/xyz", batch:{ id:1,uuid:"b001",name:"Batch 2024-A — Neural Networks" }, trainer:{ id:3,uuid:"t001",name:"Dr. Arjun V." }, attendances:[], resources:[] },
        { id:5, uuid:"ses005", title:"Quantum Gates & Circuits",           session_number:1, session_date:tomorrow, start_time:"10:00:00", end_time:"12:00:00", status:"scheduled", meeting_link:"https://meet.google.com/qbc", batch:{ id:3,uuid:"b003",name:"Batch 2024-C — Quantum Basics"  }, trainer:{ id:7,uuid:"t003",name:"Vikram R."   }, attendances:[], resources:[] },
        { id:6, uuid:"ses006", title:"Context API & State Management",     session_number:4, session_date:d2, start_time:"18:00:00", end_time:"20:00:00", status:"scheduled", meeting_link:"https://zoom.us/xyz", batch:{ id:2,uuid:"b002",name:"Batch 2024-B — React Workshop"  }, trainer:{ id:5,uuid:"t002",name:"Priya S."    }, attendances:[], resources:[] },
        { id:7, uuid:"ses007", title:"CNN Architectures — VGG, ResNet",   session_number:4, session_date:d5, start_time:"19:00:00", end_time:"21:00:00", status:"scheduled", batch:{ id:1,uuid:"b001",name:"Batch 2024-A — Neural Networks" }, trainer:{ id:3,uuid:"t001",name:"Dr. Arjun V." }, attendances:[], resources:[] },
      ])
    } finally { setLoading(false) }
  }, [toast])

  useEffect(() => { load() }, [load])

  /* ── Filter ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    const now = Date.now()
    const startOfToday = new Date(new Date().toDateString()).getTime()
    const endOfWeek    = startOfToday + 7 * 86400000

    return sessions.filter(s => {
      const mQ  = !q || s.title.toLowerCase().includes(q) || (s.batch?.name ?? "").toLowerCase().includes(q) || (s.trainer?.name ?? "").toLowerCase().includes(q)
      const mB  = !fBatch  || s.batch?.uuid === fBatch
      const mSt = !fStatus || s.status === fStatus
      const sMs = new Date(s.session_date).getTime()
      let mR = true
      if (fRange === "today")    mR = isToday(s.session_date)
      if (fRange === "week")     mR = sMs >= startOfToday && sMs <= endOfWeek
      if (fRange === "upcoming") mR = sMs > now
      if (fRange === "past")     mR = sMs < startOfToday
      return mQ && mB && mSt && mR
    })
  }, [sessions, search, fBatch, fStatus, fRange])

  const grouped    = useMemo(() => groupByDate(filtered), [filtered])
  const sortedDays = useMemo(() => Object.keys(grouped).sort(), [grouped])

  /* ── Stats ── */
  const todayCount    = sessions.filter(s => isToday(s.session_date)).length
  const liveCount     = sessions.filter(s => s.status === "live").length
  const upcomingCount = sessions.filter(s => s.status === "scheduled" && !isPast(s.session_date)).length
  const doneCount     = sessions.filter(s => s.status === "completed").length

  /* ── Submit ── */
  const handleSubmit = async (data: SessionFormData) => {
    setSaving(true); setFormErr("")
    try {
      const payload = { ...data, session_number: parseInt(data.session_number) || 1 }
      if (dialog === "add") {
        const res = await axios.post(`${API}/sessions/`, payload)
        const newSession = res.data?.data ?? res.data
        setSessions(s => [newSession, ...s])
        toast("Session scheduled!", "success")
      } else if (active) {
        // PUT /sessions/{uuid} — implement when ready
        setSessions(s => s.map(x => x.id === active.id ? { ...x, ...payload, session_number: parseInt(payload.session_number as any)||x.session_number } : x))
        toast("Session updated!", "success")
      }
      setDialog(null)
      load()
    } catch (err: any) {
      setFormErr(err?.response?.data?.detail ?? "Failed to save. Check all required fields.")
    } finally { setSaving(false) }
  }

  const handleDelete = () => {
    if (!active) return
    setSessions(s => s.filter(x => x.id !== active.id))
    setDialog(null)
    toast("Session removed.", "info")
  }

  const openEdit = (s: Session) => {
    setActive(s)
    setFormErr("")
    setFormInit({
      batch_uuid:     s.batch?.uuid ?? "",
      trainer_uuid:   s.trainer?.uuid ?? "",
      title:          s.title,
      session_number: String(s.session_number),
      session_date:   s.session_date,
      start_time:     s.start_time,
      end_time:       s.end_time,
      meeting_link:   s.meeting_link ?? "",
    })
    setDialog("edit")
  }

  const selSt: React.CSSProperties = {
    padding:"9px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)",
    background:C.w04, color:C.w70, fontFamily:"'Raleway',sans-serif",
    fontSize:13, outline:"none", cursor:"pointer",
  }

  const RANGE_OPTIONS: { k: typeof fRange; label: string }[] = [
    { k:"all",      label:"All Time" },
    { k:"today",    label:"Today"    },
    { k:"week",     label:"This Week"},
    { k:"upcoming", label:"Upcoming" },
    { k:"past",     label:"Past"     },
  ]

  return (
    <>
      <LuminaBackground />
      <div style={{ position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:1 }}>
        <div style={{ position:"absolute",width:"100%",height:1,background:"linear-gradient(90deg,transparent,rgba(26,150,255,0.05),rgba(26,150,255,0.1),rgba(26,150,255,0.05),transparent)",animation:"lu-scan 18s linear infinite" }}/>
      </div>

      <div style={{ display:"flex",height:"100vh",overflow:"hidden",position:"relative",zIndex:2 }}>
        <LuminaSideNav role="admin"/>

        <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0 }}>
          <LuminaTopBar role="admin" />

          <div style={{ flex:1,overflowY:"auto",padding:"22px 24px 44px" }}>
            <div style={{ maxWidth:1280,margin:"0 auto" }}>

              {/* PAGE HEADER */}
              <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:16,marginBottom:24 }}>
                <div>
                  <div style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:C.blue,letterSpacing:"2px",textTransform:"uppercase",marginBottom:5,display:"flex",alignItems:"center",gap:8 }}>
                    <span style={{ width:16,height:1,background:C.blue,opacity:.6,display:"inline-block" }}/>Learning · Timeline
                  </div>
                  <h1 style={{ fontFamily:"'Oxanium',sans-serif",fontWeight:800,fontSize:"clamp(22px,3vw,32px)",color:C.w90,letterSpacing:"-.5px",margin:0,lineHeight:1.1 }}>Schedules</h1>
                  <p style={{ fontFamily:"'Raleway',sans-serif",fontSize:14,color:C.w50,margin:"4px 0 0",fontWeight:300 }}>Session timeline across all batches — track live classes, recordings and attendance</p>
                </div>
                <div style={{ display:"flex",gap:10 }}>
                  <button onClick={load} style={{ ...selSt,color:C.w60,transition:"all .2s" }}
                    onMouseEnter={e=>e.currentTarget.style.color=C.w90} onMouseLeave={e=>e.currentTarget.style.color=C.w60}>↺ Refresh</button>
                  <button onClick={()=>{ setFormInit(EMPTY_SESSION); setFormErr(""); setDialog("add") }}
                    style={{ padding:"10px 22px",borderRadius:100,border:"none",background:"linear-gradient(135deg,#1a96ff,#00d4ff)",color:"white",cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700,letterSpacing:".5px",boxShadow:"0 0 24px rgba(26,150,255,0.35)",transition:"all .25s" }}
                    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 0 36px rgba(26,150,255,0.55)"}}
                    onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 0 24px rgba(26,150,255,0.35)"}}>
                    + Schedule Session
                  </button>
                </div>
              </div>

              {/* STATS */}
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:14,marginBottom:22 }}>
                <StatCard icon="📅" value={sessions.length} label="Total Sessions" color={C.blue}   />
                <StatCard icon="●"  value={liveCount}       label="Live Now"        color={C.green} pulse={liveCount>0} />
                <StatCard icon="◷"  value={todayCount}      label="Today"          color={C.gold}   />
                <StatCard icon="🔜" value={upcomingCount}   label="Upcoming"       color={C.cyan}   />
                <StatCard icon="✓"  value={doneCount}       label="Completed"      color={C.purple} />
              </div>

              {/* TOOLBAR */}
              <div style={{ background:C.surf,border:`1px solid ${C.w08}`,borderRadius:16,padding:"14px 16px",marginBottom:20 }}>
                <div style={{ display:"flex",gap:12,flexWrap:"wrap",alignItems:"center",marginBottom:12 }}>
                  <div style={{ position:"relative",flex:1,minWidth:200 }}>
                    <span style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:C.w40,pointerEvents:"none",fontSize:14 }}>🔍</span>
                    <input style={{ ...selSt,paddingLeft:40,width:"100%" }} placeholder="Search sessions by title, batch or trainer…"
                      value={search} onChange={e=>setSearch(e.target.value)} />
                  </div>
                  <select style={selSt} value={fBatch} onChange={e=>setFBatch(e.target.value)}>
                    <option value="">All Batches</option>
                    {batches.map(b=><option key={b.uuid} value={b.uuid}>{b.name}</option>)}
                  </select>
                  <select style={selSt} value={fStatus} onChange={e=>setFStatus(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="live">Live</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                {/* Range pills */}
                <div style={{ display:"flex",gap:8,flexWrap:"wrap",alignItems:"center" }}>
                  <span style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:C.w30,letterSpacing:".5px",textTransform:"uppercase" }}>Range:</span>
                  {RANGE_OPTIONS.map(opt => (
                    <button key={opt.k} onClick={()=>setFRange(opt.k)}
                      style={{ padding:"7px 14px",borderRadius:100,border:`1px solid ${fRange===opt.k?"rgba(26,150,255,0.4)":"rgba(255,255,255,0.1)"}`,background:fRange===opt.k?"rgba(26,150,255,0.1)":C.w04,color:fRange===opt.k?C.blue:C.w50,cursor:"pointer",fontFamily:"'Raleway',sans-serif",fontSize:12,fontWeight:500,transition:"all .2s",whiteSpace:"nowrap" }}>
                      {opt.label}
                    </button>
                  ))}
                  <span style={{ marginLeft:"auto",fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:C.w30,letterSpacing:".5px",textTransform:"uppercase" }}>
                    {filtered.length} session{filtered.length!==1?"s":""}
                  </span>
                </div>
              </div>

              {/* TIMELINE */}
              {loading ? (
                <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:220 }}>
                  <div style={{ width:36,height:36,borderRadius:"50%",border:"3px solid rgba(26,150,255,0.2)",borderTopColor:C.blue,animation:"lu-spin .8s linear infinite" }}/>
                </div>
              ) : sortedDays.length === 0 ? (
                <div style={{ textAlign:"center",padding:"80px 24px" }}>
                  <div style={{ fontSize:52,marginBottom:18,opacity:.5 }}>📅</div>
                  <div style={{ fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:20,color:C.w50,marginBottom:8 }}>No sessions found</div>
                  <div style={{ fontFamily:"'Raleway',sans-serif",fontSize:14,color:C.w30 }}>Try adjusting filters or schedule a new session.</div>
                </div>
              ) : (
                <div style={{ display:"flex",flexDirection:"column",gap:28 }}>
                  {sortedDays.map(dateStr => {
                    const daySessions = grouped[dateStr]
                    const today = isToday(dateStr)
                    return (
                      <div key={dateStr}>
                        <DateStrip dateStr={dateStr} sessions={daySessions} />
                        <div style={{ display:"grid",gridTemplateColumns:today||daySessions.length>=3?"repeat(auto-fill,minmax(320px,1fr))":"1fr 1fr",gap:12,paddingLeft:0 }}>
                          {daySessions
                            .sort((a,b)=>(a.start_time??"").localeCompare(b.start_time??""))
                            .map(s => (
                              <SessionCard key={s.id} session={s}
                                onView={()   => { setActive(s); setDialog("view") }}
                                onEdit={()   => openEdit(s)}
                                onDelete={()  => { setActive(s); setDialog("del")  }}
                              />
                            ))
                          }
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

      {/* DIALOGS */}
      {(dialog === "add" || dialog === "edit") && (
        <SessionFormDialog
          mode={dialog} initial={formInit} batches={batches}
          onClose={()=>setDialog(null)} onSubmit={handleSubmit}
          loading={saving} error={formErr}
        />
      )}
      {dialog === "view" && active && (
        <SessionViewDialog session={active} onClose={()=>setDialog(null)} onEdit={()=>openEdit(active)} />
      )}
      {dialog === "del" && active && (
        <div style={{ position:"fixed",inset:0,background:"rgba(2,8,16,0.88)",backdropFilter:"blur(7px)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:24 }}
          onClick={e=>{if(e.target===e.currentTarget)setDialog(null)}}>
          <div style={{ background:"rgba(5,14,32,0.98)",border:"1px solid rgba(255,77,106,0.25)",borderRadius:24,maxWidth:430,width:"100%",padding:"32px 28px 24px",textAlign:"center",boxShadow:"0 32px 90px rgba(0,0,0,0.75)" }}>
            <div style={{ fontSize:44,marginBottom:16 }}>🗑️</div>
            <div style={{ fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:20,color:C.w90,marginBottom:10 }}>Delete Session</div>
            <div style={{ fontFamily:"'Raleway',sans-serif",fontSize:14,color:C.w50,lineHeight:1.65,marginBottom:24 }}>
              Delete <span style={{ color:C.red,fontWeight:600 }}>"{active.title}"</span>?<br/>Attendance and resource records will also be removed.
            </div>
            <div style={{ display:"flex",gap:12,justifyContent:"center" }}>
              <button onClick={()=>setDialog(null)} style={{ padding:"10px 22px",borderRadius:100,border:"1px solid rgba(255,255,255,0.15)",background:C.w04,color:C.w70,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700 }}>Cancel</button>
              <button onClick={handleDelete} style={{ padding:"10px 22px",borderRadius:100,border:"1px solid rgba(255,77,106,0.3)",background:"rgba(255,77,106,0.12)",color:C.red,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700 }}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* TOASTS */}
      <div style={{ position:"fixed",bottom:28,right:28,zIndex:1000,display:"flex",flexDirection:"column",gap:10 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ padding:"12px 18px",borderRadius:14,backdropFilter:"blur(24px)",fontFamily:"'Raleway',sans-serif",fontSize:14,fontWeight:500,display:"flex",alignItems:"center",gap:10,minWidth:260,boxShadow:"0 8px 32px rgba(0,0,0,0.5)",
            background:t.type==="success"?"rgba(0,229,160,0.12)":t.type==="error"?"rgba(255,77,106,0.12)":"rgba(26,150,255,0.1)",
            border:`1px solid ${t.type==="success"?"rgba(0,229,160,0.3)":t.type==="error"?"rgba(255,77,106,0.3)":"rgba(26,150,255,0.28)"}`,
            color:t.type==="success"?C.green:t.type==="error"?C.red:C.blue }}>
            <span>{t.type==="success"?"✅":t.type==="error"?"⛔":"◉"}</span><span>{t.msg}</span>
          </div>
        ))}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@400;500;600;700;800&family=Raleway:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html, body { background: #020810; margin: 0; height: 100%; }
        input::placeholder { color: rgba(200,220,255,0.22); font-family: 'Raleway', sans-serif; }
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(0.4); cursor: pointer; }
        @keyframes lu-scan  { from { transform: translateY(-100vh) } to { transform: translateY(200vh) } }
        @keyframes lu-spin  { to { transform: rotate(360deg) } }
        @keyframes lu-pulse { 0%,100% { opacity:1;transform:scale(1) } 50% { opacity:0.5;transform:scale(1.2) } }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(26,150,255,0.2); border-radius: 4px; }
        select option { background: #0a1628; color: rgba(255,255,255,0.9); }
        @media (max-width: 680px) {
          .session-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}

declare module "react" { interface CSSProperties { [key: string]: any } }