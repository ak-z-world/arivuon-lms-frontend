// app/admin/batches/page.tsx
"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import axios from "axios"
import LuminaBackground from "@/components/background/LuminaBackground"
import LuminaSideNav   from "@/components/layout/LuminaSideNav"
import LuminaTopBar     from "@/components/layout/LuminaTopBar"

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */
interface BatchStudent {
  id: number
  uuid: string
  name: string
  email: string
}

interface Batch {
  id:         number
  uuid:       string
  name:       string
  start_date: string
  end_date:   string
  schedule:   string
  timezone?:  string
  status:     "upcoming" | "active" | "completed" | "cancelled"
  course?:    { id: number; uuid: string; title: string; category?: string }
  trainer?:   { id: number; uuid: string; name: string; email?: string }
  students?:  BatchStudent[]
  _studentCount?: number
}

type BatchStatus = "upcoming" | "active" | "completed" | "cancelled"

interface BatchFormData {
  name: string
  course_uuid: string
  trainer_uuid: string
  start_date: string
  end_date: string
  schedule: string
  timezone: string
  status: BatchStatus
}

/* ─────────────────────────────────────────
   CONSTANTS & HELPERS
───────────────────────────────────────── */
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

const C = {
  gold:   "#ffc933", gold2:  "#ffad00",
  blue:   "#1a96ff", cyan:   "#00d4ff",
  green:  "#00e5a0", red:    "#ff4d6a",
  purple: "#a78bfa", orange: "#ff8c42",
  surf:   "rgba(5,14,32,0.92)", w06: "rgba(255,255,255,0.06)",
  w90: "rgba(255,255,255,0.9)", w80: "rgba(255,255,255,0.8)",
  w70: "rgba(255,255,255,0.7)", w60: "rgba(255,255,255,0.6)",
  w50: "rgba(255,255,255,0.5)", w40: "rgba(255,255,255,0.4)",
  w30: "rgba(255,255,255,0.3)", w20: "rgba(255,255,255,0.2)",
  w15: "rgba(255,255,255,0.15)",w10: "rgba(255,255,255,0.10)",
  w08: "rgba(255,255,255,0.08)",w04: "rgba(255,255,255,0.04)",
}

const STATUS_MAP = {
  upcoming:  { label: "Upcoming",  color: C.blue,   bg: "rgba(26,150,255,0.12)",   border: "rgba(26,150,255,0.3)"   },
  active:    { label: "Active",    color: C.green,  bg: "rgba(0,229,160,0.12)",    border: "rgba(0,229,160,0.3)"    },
  completed: { label: "Completed", color: C.purple, bg: "rgba(167,139,250,0.12)",  border: "rgba(167,139,250,0.3)"  },
  cancelled: { label: "Cancelled", color: C.red,    bg: "rgba(255,77,106,0.10)",   border: "rgba(255,77,106,0.25)"  },
}

const TIMEZONES = [
  "Asia/Kolkata","Asia/Colombo","Asia/Dubai","Asia/Singapore",
  "Europe/London","Europe/Paris","America/New_York","America/Los_Angeles",
  "Australia/Sydney","Pacific/Auckland",
]

function dateProgress(start: string, end: string): number {
  const now = Date.now()
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  if (now <= s) return 0
  if (now >= e) return 100
  return Math.round(((now - s) / (e - s)) * 100)
}

function fmtDate(d?: string) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

function daysBetween(start: string, end: string) {
  return Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000)
}

function daysLeft(end: string) {
  const d = Math.ceil((new Date(end).getTime() - Date.now()) / 86400000)
  return d > 0 ? d : 0
}

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
}

const TRAINER_COLORS = [C.blue, C.cyan, C.purple, C.gold, C.orange, C.green]
function trainerColor(id?: number) {
  return TRAINER_COLORS[(id ?? 0) % TRAINER_COLORS.length]
}

/* ─────────────────────────────────────────
   TOAST
───────────────────────────────────────── */
function useToast() {
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([])
  const show = useCallback((msg: string, type = "info") => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200)
  }, [])
  return { toasts, show }
}

/* ─────────────────────────────────────────
   SHARED PRIMITIVES
───────────────────────────────────────── */
const FI: React.CSSProperties = {
  background: C.w04, border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 11, padding: "11px 14px", color: C.w90,
  fontFamily: "'Raleway',sans-serif", fontSize: 14,
  outline: "none", transition: "all .2s", width: "100%",
}

function FocusInput({ style, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      style={{ ...FI, ...style }}
      onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,185,0,0.45)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,185,0,0.07)" }}
      onBlur={e  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none" }}
      {...props}
    />
  )
}

function FocusSelect({ style, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      style={{ ...FI, cursor: "pointer", ...style }}
      onFocus={e => e.currentTarget.style.borderColor = "rgba(255,185,0,0.45)"}
      onBlur={e  => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
      {...props}
    >
      {children}
    </select>
  )
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: C.w40, letterSpacing: "1.5px", textTransform: "uppercase" }}>
      {children} {required && <span style={{ color: C.gold }}>*</span>}
    </label>
  )
}

function Field({ label, required, children, style }: { label: string; required?: boolean; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      <Label required={required}>{label}</Label>
      {children}
    </div>
  )
}

function Chip({ text, color }: { text: string; color: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 100,
      fontFamily: "'Share Tech Mono',monospace", fontSize: 9, letterSpacing: ".5px",
      textTransform: "uppercase", flexShrink: 0, whiteSpace: "nowrap",
      background: `${color}12`, border: `1px solid ${color}28`, color,
    }}>{text}</span>
  )
}

/* ─────────────────────────────────────────
   ARC PROGRESS RING
───────────────────────────────────────── */
function ArcProgress({ pct, size = 60, color = C.gold, label, value }: {
  pct: number; size?: number; color?: string; label: string; value: string
}) {
  const r = (size - 8) / 2
  const c = 2 * Math.PI * r
  const [p, setP] = useState(0)
  useEffect(() => { const t = setTimeout(() => setP(pct), 200); return () => clearTimeout(t) }, [pct])
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}14`} strokeWidth={5} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5}
            strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - p / 100)}
            style={{ filter: `drop-shadow(0 0 4px ${color})`, transition: "stroke-dashoffset 1.4s ease" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "'Oxanium',sans-serif", fontWeight: 700, fontSize: size * 0.22, color, lineHeight: 1 }}>{value}</span>
        </div>
      </div>
      <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: C.w30, textTransform: "uppercase", letterSpacing: ".8px", textAlign: "center" }}>{label}</span>
    </div>
  )
}

/* ─────────────────────────────────────────
   STAT CARD
───────────────────────────────────────── */
function StatCard({ icon, value, label, color, sub }: {
  icon: string; value: string | number; label: string; color: string; sub?: string
}) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: C.surf, borderRadius: 16, padding: "16px 18px",
        backdropFilter: "blur(24px)", border: `1px solid ${hov ? color + "30" : color + "16"}`,
        transition: "all .3s cubic-bezier(.22,1,.36,1)", cursor: "default",
        transform: hov ? "translateY(-3px)" : "none",
        boxShadow: hov ? `0 16px 40px rgba(0,0,0,0.45),0 0 20px ${color}10` : "0 6px 24px rgba(0,0,0,0.35)",
        position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: "8%", right: "8%", height: 1, background: `linear-gradient(90deg,transparent,${color}45,transparent)` }} />
      <div style={{ fontSize: 18, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontFamily: "'Oxanium',sans-serif", fontWeight: 700, fontSize: 28, color, lineHeight: 1, marginBottom: 3 }}>{value}</div>
      {sub && <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: `${color}70`, letterSpacing: ".5px", marginBottom: 3 }}>{sub}</div>}
      <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: C.w50 }}>{label}</div>
    </div>
  )
}

/* ─────────────────────────────────────────
   BATCH CARD
───────────────────────────────────────── */
function BatchCard({ batch, onView, onEdit, onDelete }: {
  batch: Batch
  onView:   () => void
  onEdit:   () => void
  onDelete: () => void
}) {
  const [hov, setHov] = useState(false)
  const st = STATUS_MAP[batch.status] ?? STATUS_MAP.upcoming
  const pct = dateProgress(batch.start_date, batch.end_date)
  const tc  = trainerColor(batch.trainer?.id)
  const totalDays  = daysBetween(batch.start_date, batch.end_date)
  const remaining  = daysLeft(batch.end_date)
  const studentCount = batch._studentCount ?? batch.students?.length ?? 0

  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={onView}
      style={{
        background: C.surf, borderRadius: 22, overflow: "hidden",
        border: `1px solid ${hov ? "rgba(255,185,0,0.28)" : "rgba(255,255,255,0.07)"}`,
        backdropFilter: "blur(28px)", cursor: "pointer",
        transition: "all .4s cubic-bezier(.22,1,.36,1)",
        transform: hov ? "translateY(-5px)" : "none",
        boxShadow: hov ? "0 24px 64px rgba(0,0,0,0.55),0 0 28px rgba(255,185,0,0.07)" : "0 8px 32px rgba(0,0,0,0.4)",
        position: "relative",
      }}
    >
      {/* Header band */}
      <div style={{
        height: 6,
        background: `linear-gradient(90deg,${st.color}70,${st.color}30,transparent)`,
      }} />

      <div style={{ padding: "20px 22px 0" }}>
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
              <span style={{
                padding: "3px 10px", borderRadius: 100, fontFamily: "'Share Tech Mono',monospace",
                fontSize: 9, letterSpacing: ".5px", textTransform: "uppercase",
                background: st.bg, border: `1px solid ${st.border}`, color: st.color,
              }}>{st.label}</span>
              {batch.course?.category && <Chip text={batch.course.category} color={C.blue} />}
            </div>
            <h3 style={{ fontFamily: "'Oxanium',sans-serif", fontWeight: 800, fontSize: 18, color: C.w90, margin: 0, letterSpacing: "-.2px", lineHeight: 1.2 }}>
              {batch.name}
            </h3>
            {batch.course && (
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: C.w40, marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {batch.course.title}
              </div>
            )}
          </div>

          {/* Progress ring */}
          <ArcProgress pct={pct} size={58} color={st.color} value={`${pct}%`} label="Progress" />
        </div>

        {/* Dates strip */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          {[
            { lbl: "Start", val: fmtDate(batch.start_date) },
            { lbl: "End",   val: fmtDate(batch.end_date)   },
            { lbl: "Days",  val: `${totalDays}d total`      },
          ].map((d, i) => (
            <div key={i} style={{ flex: 1, padding: "9px 10px", borderRadius: 10, background: C.w04, border: `1px solid ${C.w08}` }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: C.w30, textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 3 }}>{d.lbl}</div>
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, fontWeight: 600, color: C.w80 }}>{d.val}</div>
            </div>
          ))}
        </div>

        {/* Timeline bar */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: C.w30, letterSpacing: ".5px" }}>TIMELINE</span>
            {batch.status === "active" && (
              <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: st.color }}>{remaining}d left</span>
            )}
          </div>
          <div style={{ height: 4, borderRadius: 4, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 4,
              width: `${pct}%`,
              background: `linear-gradient(90deg,${st.color}80,${st.color})`,
              boxShadow: `0 0 8px ${st.color}55`,
              transition: "width 1.3s cubic-bezier(.22,1,.36,1)",
            }} />
          </div>
        </div>

        {/* Trainer + students */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 16 }}>
          {batch.trainer && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: `${tc}18`, border: `1px solid ${tc}30`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Oxanium',sans-serif", fontWeight: 700, fontSize: 11, color: tc, flexShrink: 0 }}>
                {initials(batch.trainer.name)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, fontWeight: 600, color: C.w80, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{batch.trainer.name}</div>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: C.w30, textTransform: "uppercase", letterSpacing: ".5px" }}>Trainer</div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <div style={{ fontFamily: "'Oxanium',sans-serif", fontWeight: 700, fontSize: 18, color: C.gold }}>{studentCount}</div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: C.w30, textTransform: "uppercase", letterSpacing: ".5px", lineHeight: 1.3 }}>Students</div>
          </div>

          {batch.schedule && (
            <div style={{ flexShrink: 0 }}>
              <Chip text={batch.schedule} color={C.gold} />
            </div>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div style={{
        display: "flex", borderTop: `1px solid ${C.w06}`,
        opacity: hov ? 1 : 0,
        transition: "opacity .25s",
      }}>
        {[
          { label: "View Details", color: C.blue,  cb: (e: React.MouseEvent) => { e.stopPropagation(); onView() } },
          { label: "Edit",         color: C.gold,  cb: (e: React.MouseEvent) => { e.stopPropagation(); onEdit() } },
          { label: "Delete",       color: C.red,   cb: (e: React.MouseEvent) => { e.stopPropagation(); onDelete() } },
        ].map((a, i) => (
          <button key={i} onClick={a.cb}
            style={{
              flex: 1, padding: "12px 0", border: "none", background: "transparent",
              color: a.color, cursor: "pointer", fontFamily: "'Oxanium',sans-serif",
              fontSize: 11, fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase",
              borderRight: i < 2 ? `1px solid ${C.w06}` : "none",
              transition: "background .2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = `${a.color}10`}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >{a.label}</button>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   BATCH FORM DIALOG
───────────────────────────────────────── */
const EMPTY_FORM: BatchFormData = {
  name: "", course_uuid: "", trainer_uuid: "",
  start_date: "", end_date: "", schedule: "", timezone: "Asia/Kolkata", status: "upcoming",
}

function BatchFormDialog({ mode, initial, onClose, onSubmit, loading, error }: {
  mode:     "add" | "edit"
  initial:  BatchFormData
  onClose:  () => void
  onSubmit: (data: BatchFormData) => void
  loading:  boolean
  error:    string
}) {
  const [form, setForm] = useState<BatchFormData>(initial)
  useEffect(() => setForm(initial), [initial])
  const set = (k: keyof BatchFormData, v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(2,8,16,0.86)",backdropFilter:"blur(7px)",zIndex:500,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"24px 16px",overflowY:"auto" }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background:"rgba(5,14,32,0.98)",border:"1px solid rgba(255,185,0,0.2)",borderRadius:24,backdropFilter:"blur(48px)",width:"100%",maxWidth:640,margin:"auto",boxShadow:"0 32px 90px rgba(0,0,0,0.75),0 0 80px rgba(255,185,0,0.06)",position:"relative" }}>
        <div style={{ position:"absolute",top:0,left:"8%",right:"8%",height:1,background:"linear-gradient(90deg,transparent,rgba(255,185,0,0.6),transparent)" }} />

        {/* Header */}
        <div style={{ padding:"24px 28px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:14 }}>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <div style={{ width:44,height:44,borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,background:"linear-gradient(135deg,rgba(255,185,0,0.18),rgba(255,185,0,0.08))",border:"1px solid rgba(255,185,0,0.3)" }}>
              {mode === "add" ? "⊞" : "✎"}
            </div>
            <div>
              <div style={{ fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:20,color:C.w90 }}>{mode === "add" ? "Create New Batch" : "Edit Batch"}</div>
              <div style={{ fontFamily:"'Raleway',sans-serif",fontSize:13,color:C.w40,marginTop:3,fontWeight:300 }}>
                {mode === "add" ? "Set up a new student batch with course and trainer" : `Editing: ${initial.name}`}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ width:34,height:34,borderRadius:9,border:"1px solid rgba(255,255,255,0.1)",background:C.w04,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:C.w50,fontSize:18,transition:"all .2s",flexShrink:0 }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,77,106,0.1)";e.currentTarget.style.color=C.red}}
            onMouseLeave={e=>{e.currentTarget.style.background=C.w04;e.currentTarget.style.color=C.w50}}>✕</button>
        </div>

        <div style={{ padding:"24px 28px" }}>
          {error && (
            <div style={{ padding:"10px 14px",borderRadius:10,background:"rgba(255,77,106,0.1)",border:"1px solid rgba(255,77,106,0.25)",color:C.red,fontFamily:"'Raleway',sans-serif",fontSize:13,marginBottom:18,display:"flex",gap:8,alignItems:"center" }}>
              ⚠ {error}
            </div>
          )}

          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px 18px" }}>
            {/* Batch Name */}
            <Field label="Batch Name" required style={{ gridColumn:"1/-1" }}>
              <FocusInput value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Batch 2024-A — Neural Networks" maxLength={120} />
            </Field>

            {/* Course UUID */}
            <Field label="Course UUID" required style={{ gridColumn:"1/-1" }}>
              <FocusInput value={form.course_uuid} onChange={e => set("course_uuid", e.target.value)} placeholder="Paste course UUID from Courses page" />
              <div style={{ fontFamily:"'Raleway',sans-serif",fontSize:11,color:C.w30,marginTop:2 }}>Get this from Admin → Courses → Copy UUID</div>
            </Field>

            {/* Trainer UUID */}
            <Field label="Trainer UUID" required style={{ gridColumn:"1/-1" }}>
              <FocusInput value={form.trainer_uuid} onChange={e => set("trainer_uuid", e.target.value)} placeholder="Paste trainer user UUID from Students/Trainers page" />
            </Field>

            {/* Start date */}
            <Field label="Start Date" required>
              <FocusInput type="date" value={form.start_date} onChange={e => set("start_date", e.target.value)} />
            </Field>

            {/* End date */}
            <Field label="End Date" required>
              <FocusInput type="date" value={form.end_date} onChange={e => set("end_date", e.target.value)} />
            </Field>

            {/* Schedule */}
            <Field label="Schedule / Frequency" required>
              <FocusInput value={form.schedule} onChange={e => set("schedule", e.target.value)} placeholder="e.g. Mon-Wed-Fri 7PM" maxLength={100} />
            </Field>

            {/* Timezone */}
            <Field label="Timezone">
              <FocusSelect value={form.timezone} onChange={e => set("timezone", e.target.value)}>
                {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </FocusSelect>
            </Field>

            {/* Status */}
            <Field label="Status" style={{ gridColumn:"1/-1" }}>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8 }}>
                {(["upcoming","active","completed","cancelled"] as const).map(s => {
                  const m = STATUS_MAP[s]
                  const active = form.status === s
                  return (
                    <button key={s} type="button" onClick={() => set("status", s)}
                      style={{ padding:"10px 0",borderRadius:10,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:11,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",transition:"all .2s",
                        background: active ? m.bg : C.w04,
                        border: `1px solid ${active ? m.border : "rgba(255,255,255,0.1)"}`,
                        color: active ? m.color : C.w40,
                        boxShadow: active ? `0 0 12px ${m.color}18` : "none",
                      }}>
                      {m.label}
                    </button>
                  )
                })}
              </div>
            </Field>
          </div>
        </div>

        <div style={{ padding:"18px 28px 24px",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"flex-end",gap:10 }}>
          <button onClick={onClose} style={{ padding:"10px 20px",borderRadius:100,border:"1px solid rgba(255,255,255,0.15)",background:C.w04,color:C.w70,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700,letterSpacing:".5px",transition:"all .2s" }}>Cancel</button>
          <button onClick={() => onSubmit(form)} disabled={loading}
            style={{ padding:"10px 24px",borderRadius:100,border:"none",background:loading?"rgba(255,185,0,0.4)":"linear-gradient(135deg,#ffc933,#ffad00)",color:"#020810",cursor:loading?"not-allowed":"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700,letterSpacing:".5px",boxShadow:loading?"none":"0 0 24px rgba(255,185,0,0.35)",transition:"all .2s",display:"flex",alignItems:"center",gap:8 }}
            onMouseEnter={e=>{if(!loading){e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 0 36px rgba(255,185,0,0.55)"}}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=loading?"none":"0 0 24px rgba(255,185,0,0.35)"}}>
            {loading
              ? <><span style={{ width:16,height:16,borderRadius:"50%",border:"2px solid rgba(0,0,0,0.2)",borderTopColor:"#020810",animation:"lu-spin .8s linear infinite",display:"inline-block" }}/>Saving…</>
              : mode === "add" ? "Create Batch" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   VIEW DIALOG
───────────────────────────────────────── */
function BatchViewDialog({ batch, onClose, onEdit }: {
  batch: Batch; onClose: () => void; onEdit: () => void
}) {
  const st  = STATUS_MAP[batch.status] ?? STATUS_MAP.upcoming
  const pct = dateProgress(batch.start_date, batch.end_date)
  const tc  = trainerColor(batch.trainer?.id)
  const students = batch.students ?? []

  const MetaItem = ({ lbl, val, color }: { lbl: string; val: string; color?: string }) => (
    <div style={{ padding:"11px 13px",borderRadius:12,background:C.w04,border:`1px solid ${C.w08}` }}>
      <div style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w30,textTransform:"uppercase",letterSpacing:"1px",marginBottom:4 }}>{lbl}</div>
      <div style={{ fontFamily:"'Raleway',sans-serif",fontSize:14,fontWeight:600,color:color??C.w90 }}>{val || "—"}</div>
    </div>
  )

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(2,8,16,0.86)",backdropFilter:"blur(7px)",zIndex:500,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"24px 16px",overflowY:"auto" }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background:"rgba(5,14,32,0.98)",border:"1px solid rgba(255,185,0,0.2)",borderRadius:24,backdropFilter:"blur(48px)",width:"100%",maxWidth:760,margin:"auto",boxShadow:"0 32px 90px rgba(0,0,0,0.75)",position:"relative" }}>
        <div style={{ position:"absolute",top:0,left:"8%",right:"8%",height:1,background:"linear-gradient(90deg,transparent,rgba(255,185,0,0.6),transparent)" }} />
        <div style={{ height:6,background:`linear-gradient(90deg,${st.color}70,${st.color}30,transparent)`,borderRadius:"24px 24px 0 0" }} />

        {/* Header */}
        <div style={{ padding:"22px 28px 18px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:14 }}>
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8,flexWrap:"wrap" }}>
              <span style={{ padding:"3px 10px",borderRadius:100,fontFamily:"'Share Tech Mono',monospace",fontSize:9,letterSpacing:".5px",textTransform:"uppercase",background:st.bg,border:`1px solid ${st.border}`,color:st.color }}>{st.label}</span>
              {batch.course?.category && <Chip text={batch.course.category} color={C.blue} />}
            </div>
            <h2 style={{ fontFamily:"'Oxanium',sans-serif",fontWeight:800,fontSize:22,color:C.w90,margin:0,letterSpacing:"-.3px" }}>{batch.name}</h2>
            {batch.course && <div style={{ fontFamily:"'Raleway',sans-serif",fontSize:14,color:C.w50,marginTop:4 }}>{batch.course.title}</div>}
          </div>
          <button onClick={onClose} style={{ width:34,height:34,borderRadius:9,border:"1px solid rgba(255,255,255,0.1)",background:C.w04,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:C.w50,fontSize:18,transition:"all .2s",flexShrink:0 }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,77,106,0.1)";e.currentTarget.style.color=C.red}}
            onMouseLeave={e=>{e.currentTarget.style.background=C.w04;e.currentTarget.style.color=C.w50}}>✕</button>
        </div>

        <div style={{ padding:"22px 28px" }}>
          {/* Progress + Rings */}
          <div style={{ display:"flex",alignItems:"center",gap:24,padding:"18px 20px",borderRadius:16,background:"rgba(255,185,0,0.04)",border:"1px solid rgba(255,185,0,0.12)",marginBottom:20,flexWrap:"wrap" }}>
            <ArcProgress pct={pct} size={72} color={st.color} value={`${pct}%`} label="Progress" />
            <ArcProgress pct={Math.round((students.length / Math.max(students.length,1)) * 100)} size={72} color={C.gold} value={String(students.length)} label="Students" />
            <div style={{ flex:1,minWidth:160 }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                <span style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:C.w30,letterSpacing:".5px" }}>TIMELINE</span>
                <span style={{ fontFamily:"'Raleway',sans-serif",fontSize:12,color:st.color }}>{daysLeft(batch.end_date)}d remaining</span>
              </div>
              <div style={{ height:6,borderRadius:6,background:"rgba(255,255,255,0.05)",overflow:"hidden" }}>
                <div style={{ height:"100%",borderRadius:6,width:`${pct}%`,background:`linear-gradient(90deg,${st.color}80,${st.color})`,transition:"width 1.3s ease" }}/>
              </div>
              <div style={{ display:"flex",justifyContent:"space-between",marginTop:6 }}>
                <span style={{ fontFamily:"'Raleway',sans-serif",fontSize:11,color:C.w40 }}>{fmtDate(batch.start_date)}</span>
                <span style={{ fontFamily:"'Raleway',sans-serif",fontSize:11,color:C.w40 }}>{fmtDate(batch.end_date)}</span>
              </div>
            </div>
          </div>

          {/* Meta grid */}
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10,marginBottom:20 }}>
            <MetaItem lbl="Schedule" val={batch.schedule} />
            <MetaItem lbl="Timezone" val={batch.timezone ?? ""} />
            <MetaItem lbl="Duration" val={`${daysBetween(batch.start_date,batch.end_date)} days`} />
            <MetaItem lbl="UUID" val={batch.uuid} color={C.gold} />
          </div>

          {/* Trainer */}
          {batch.trainer && (
            <>
              <div style={{ fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:14,color:C.w70,display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
                Trainer <div style={{ flex:1,height:1,background:"linear-gradient(90deg,rgba(255,255,255,0.1),transparent)" }}/>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderRadius:14,background:C.w04,border:`1px solid ${C.w08}`,marginBottom:20 }}>
                <div style={{ width:42,height:42,borderRadius:12,background:`${tc}18`,border:`1px solid ${tc}30`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:15,color:tc,flexShrink:0 }}>{initials(batch.trainer.name)}</div>
                <div>
                  <div style={{ fontFamily:"'Raleway',sans-serif",fontSize:15,fontWeight:600,color:C.w90 }}>{batch.trainer.name}</div>
                  <div style={{ fontFamily:"'Raleway',sans-serif",fontSize:12,color:C.w40 }}>{batch.trainer.email}</div>
                </div>
              </div>
            </>
          )}

          {/* Students */}
          {students.length > 0 && (
            <>
              <div style={{ fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:14,color:C.w70,display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
                Enrolled Students ({students.length})
                <div style={{ flex:1,height:1,background:"linear-gradient(90deg,rgba(255,255,255,0.1),transparent)" }}/>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:8 }}>
                {students.map(s => (
                  <div key={s.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:11,background:C.w04,border:`1px solid ${C.w08}` }}>
                    <div style={{ width:32,height:32,borderRadius:9,background:`${C.blue}18`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:11,color:C.blue,flexShrink:0 }}>{initials(s.name)}</div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontFamily:"'Raleway',sans-serif",fontSize:13,fontWeight:600,color:C.w90,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{s.name}</div>
                      <div style={{ fontFamily:"'Raleway',sans-serif",fontSize:11,color:C.w40,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{s.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div style={{ padding:"18px 28px 24px",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"flex-end",gap:10 }}>
          <button onClick={onClose} style={{ padding:"10px 20px",borderRadius:100,border:"1px solid rgba(255,255,255,0.15)",background:C.w04,color:C.w70,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700 }}>Close</button>
          <button onClick={onEdit}  style={{ padding:"10px 24px",borderRadius:100,border:"none",background:"linear-gradient(135deg,#ffc933,#ffad00)",color:"#020810",cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700,boxShadow:"0 0 24px rgba(255,185,0,0.35)" }}>✎ Edit Batch</button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   ADD STUDENT DIALOG
───────────────────────────────────────── */
function AddStudentDialog({ batchName, onClose, onSubmit, loading }: {
  batchName: string; onClose: () => void; onSubmit: (uuid: string) => void; loading: boolean
}) {
  const [uuid, setUuid] = useState("")
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(2,8,16,0.88)",backdropFilter:"blur(7px)",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:24 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background:"rgba(5,14,32,0.98)",border:"1px solid rgba(26,150,255,0.22)",borderRadius:20,backdropFilter:"blur(48px)",maxWidth:440,width:"100%",padding:"28px",boxShadow:"0 24px 80px rgba(0,0,0,0.7)",position:"relative" }}>
        <div style={{ position:"absolute",top:0,left:"8%",right:"8%",height:1,background:"linear-gradient(90deg,transparent,rgba(26,150,255,0.55),transparent)" }} />
        <div style={{ fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:18,color:C.w90,marginBottom:4 }}>Add Student to Batch</div>
        <div style={{ fontFamily:"'Raleway',sans-serif",fontSize:13,color:C.w40,marginBottom:20,fontWeight:300 }}>{batchName}</div>
        <Field label="Student UUID" required>
          <FocusInput value={uuid} onChange={e => setUuid(e.target.value)} placeholder="Paste student UUID from Students page" />
          <div style={{ fontFamily:"'Raleway',sans-serif",fontSize:11,color:C.w30,marginTop:2 }}>Get from Admin → Students → copy UUID from the row</div>
        </Field>
        <div style={{ display:"flex",gap:10,justifyContent:"flex-end",marginTop:20 }}>
          <button onClick={onClose} style={{ padding:"9px 18px",borderRadius:100,border:"1px solid rgba(255,255,255,0.15)",background:C.w04,color:C.w70,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700 }}>Cancel</button>
          <button onClick={() => onSubmit(uuid)} disabled={loading||!uuid.trim()}
            style={{ padding:"9px 20px",borderRadius:100,border:"none",background:loading||!uuid.trim()?"rgba(26,150,255,0.3)":"linear-gradient(135deg,#1a96ff,#00d4ff)",color:"white",cursor:loading||!uuid.trim()?"not-allowed":"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700,boxShadow:"0 0 20px rgba(26,150,255,0.3)" }}>
            {loading ? "Adding…" : "Add to Batch"}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function AdminBatchesPage() {
  const { toasts, show: toast } = useToast()

  const [batches,   setBatches]   = useState<Batch[]>([])
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [formErr,   setFormErr]   = useState("")

  const [search,    setSearch]    = useState("")
  const [fStatus,   setFStatus]   = useState("")

  const [dialog,    setDialog]    = useState<"add"|"edit"|"view"|"del"|"addStudent"|null>(null)
  const [active,    setActive]    = useState<Batch | null>(null)
  const [formInit,  setFormInit]  = useState<BatchFormData>(EMPTY_FORM)

  /* ── Load ── */
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await axios.get(`${API}/batches/`)
      const data: Batch[] = res.data?.data ?? res.data
      const enriched = await Promise.all(
        data.map(async b => {
          try {
            const sr = await axios.get(`${API}/batches/${b.uuid}/students`)
            const students: BatchStudent[] = sr.data?.data ?? sr.data
            return { ...b, students, _studentCount: students.length }
          } catch {
            return { ...b, students: [], _studentCount: 0 }
          }
        })
      )
      setBatches(enriched)
    } catch {
      toast("Failed to load batches. Showing demo data.", "error")
      setBatches([
        { id:1, uuid:"b001", name:"Batch 2024-A — Neural Networks", start_date:"2024-01-10", end_date:"2024-04-10", schedule:"Mon-Wed-Fri 7PM", timezone:"Asia/Kolkata", status:"completed", course:{ id:1,uuid:"c001",title:"Neural Networks & Deep Learning",category:"AI / ML" }, trainer:{ id:3,uuid:"t001",name:"Dr. Arjun V.",email:"arjun@lumina.io" }, students:[{id:1,uuid:"s001",name:"Aryan Kumar",email:"aryan@example.com"},{id:2,uuid:"s002",name:"Priya Sharma",email:"priya@example.com"}], _studentCount:2 },
        { id:2, uuid:"b002", name:"Batch 2024-B — React Workshop", start_date:"2025-02-01", end_date:"2025-04-30", schedule:"Tue-Thu 6PM",      timezone:"Asia/Kolkata", status:"active",    course:{ id:2,uuid:"c002",title:"Full-Stack Web Development",category:"Engineering" }, trainer:{ id:5,uuid:"t002",name:"Priya S.",email:"priya@lumina.io"     }, students:[{id:3,uuid:"s003",name:"Rahul Singh",email:"rahul@example.com"},{id:4,uuid:"s004",name:"Sneha Patel",email:"sneha@example.com"},{id:5,uuid:"s005",name:"Dev Mehta",email:"dev@example.com"}], _studentCount:3 },
        { id:3, uuid:"b003", name:"Batch 2024-C — Quantum Basics",  start_date:"2025-03-01", end_date:"2025-06-30", schedule:"Sat-Sun 10AM",     timezone:"Asia/Kolkata", status:"active",    course:{ id:3,uuid:"c003",title:"Quantum Computing",category:"CS" },                   trainer:{ id:7,uuid:"t003",name:"Vikram R.",email:"vikram@lumina.io"    }, students:[{id:6,uuid:"s006",name:"Nisha Reddy",email:"nisha@example.com"}], _studentCount:1 },
        { id:4, uuid:"b004", name:"Batch 2024-D — Cloud DevOps",    start_date:"2025-06-01", end_date:"2025-09-30", schedule:"Mon-Wed 8PM",      timezone:"Asia/Kolkata", status:"upcoming",  course:{ id:4,uuid:"c004",title:"Cloud & DevOps",category:"Cloud" },                    trainer:{ id:8,uuid:"t004",name:"Lena M.",email:"lena@lumina.io"        }, students:[], _studentCount:0 },
      ])
    } finally { setLoading(false) }
  }, [toast])

  useEffect(() => { load() }, [load])

  /* ── Filter ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return batches.filter(b => {
      const mQ  = !q || b.name.toLowerCase().includes(q) || (b.course?.title ?? "").toLowerCase().includes(q) || (b.trainer?.name ?? "").toLowerCase().includes(q)
      const mSt = !fStatus || b.status === fStatus
      return mQ && mSt
    })
  }, [batches, search, fStatus])

  /* ── Stats ── */
  const stats = useMemo(() => [
    { icon:"⊞", value: batches.length,                                         label:"Total Batches",   color: C.gold   },
    { icon:"▶", value: batches.filter(b=>b.status==="active").length,           label:"Active",          color: C.green  },
    { icon:"◷", value: batches.filter(b=>b.status==="upcoming").length,         label:"Upcoming",        color: C.blue   },
    { icon:"✓", value: batches.filter(b=>b.status==="completed").length,        label:"Completed",       color: C.purple },
    { icon:"◎", value: batches.reduce((a,b)=>a+(b._studentCount??0), 0),        label:"Total Students",  color: C.cyan   },
  ], [batches])

  /* ── Submit ── */
  const handleSubmit = async (data: BatchFormData) => {
    setSaving(true); setFormErr("")
    try {
      if (dialog === "add") {
        const res = await axios.post(`${API}/batches/`, data)
        const newBatch = res.data?.data ?? res.data
        setBatches(b => [{ ...newBatch, students: [], _studentCount: 0 }, ...b])
        toast("Batch created!", "success")
      } else if (active) {
        // PUT /batches/{uuid} — implement when endpoint ready
        setBatches(b => b.map(x => x.id === active.id ? { ...x, ...data } : x))
        toast("Batch updated!", "success")
      }
      setDialog(null)
    } catch (err: any) {
      setFormErr(err?.response?.data?.detail ?? "Failed to save. Check all required fields.")
    } finally { setSaving(false) }
  }

  const handleAddStudent = async (studentUuid: string) => {
    if (!active) return
    setSaving(true)
    try {
      await axios.post(`${API}/batches/${active.uuid}/students`, { student_uuid: studentUuid })
      toast("Student added to batch!", "success")
      setDialog(null)
      load()
    } catch (err: any) {
      toast(err?.response?.data?.detail ?? "Failed to add student.", "error")
    } finally { setSaving(false) }
  }

  const handleDelete = () => {
    if (!active) return
    // DELETE /batches/{uuid} — implement when endpoint ready
    setBatches(b => b.filter(x => x.id !== active.id))
    setDialog(null)
    toast("Batch removed.", "info")
  }

  const openEdit = (b: Batch) => {
    setActive(b)
    setFormErr("")
    setFormInit({
      name: b.name, course_uuid: b.course?.uuid ?? "",
      trainer_uuid: b.trainer?.uuid ?? "",
      start_date: b.start_date, end_date: b.end_date,
      schedule: b.schedule, timezone: b.timezone ?? "Asia/Kolkata", status: b.status,
    })
    setDialog("edit")
  }

  const selSt: React.CSSProperties = {
    padding:"9px 14px",borderRadius:10,border:"1px solid rgba(255,255,255,0.1)",
    background:C.w04,color:C.w70,fontFamily:"'Raleway',sans-serif",
    fontSize:13,outline:"none",cursor:"pointer",
  }

  return (
    <>
      <LuminaBackground />
      <div style={{ position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:1 }}>
        <div style={{ position:"absolute",width:"100%",height:1,background:"linear-gradient(90deg,transparent,rgba(255,185,0,0.05),rgba(255,185,0,0.1),rgba(255,185,0,0.05),transparent)",animation:"lu-scan 18s linear infinite" }} />
      </div>

      <div style={{ display:"flex",height:"100vh",overflow:"hidden",position:"relative",zIndex:2 }}>
        <LuminaSideNav role="admin"/>

        <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0 }}>
          <LuminaTopBar role="admin" />

          <div style={{ flex:1,overflowY:"auto",padding:"22px 24px 44px" }}>
            <div style={{ maxWidth:1440,margin:"0 auto" }}>

              {/* PAGE HEADER */}
              <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:16,marginBottom:24 }}>
                <div>
                  <div style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:C.gold,letterSpacing:"2px",textTransform:"uppercase",marginBottom:5,display:"flex",alignItems:"center",gap:8 }}>
                    <span style={{ width:16,height:1,background:C.gold,opacity:.6,display:"inline-block" }}/>Learning · Groups
                  </div>
                  <h1 style={{ fontFamily:"'Oxanium',sans-serif",fontWeight:800,fontSize:"clamp(22px,3vw,32px)",color:C.w90,letterSpacing:"-.5px",margin:0,lineHeight:1.1 }}>Batches</h1>
                  <p style={{ fontFamily:"'Raleway',sans-serif",fontSize:14,color:C.w50,margin:"4px 0 0",fontWeight:300 }}>Organise students and trainers into cohorts — track progress, enrolment and schedule</p>
                </div>
                <div style={{ display:"flex",gap:10 }}>
                  <button onClick={load} style={{ ...selSt,color:C.w60,transition:"all .2s" }}
                    onMouseEnter={e=>e.currentTarget.style.color=C.w90} onMouseLeave={e=>e.currentTarget.style.color=C.w60}>↺ Refresh</button>
                  <button onClick={() => { setFormInit(EMPTY_FORM); setFormErr(""); setDialog("add") }}
                    style={{ padding:"10px 22px",borderRadius:100,border:"none",background:"linear-gradient(135deg,#ffc933,#ffad00)",color:"#020810",cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700,letterSpacing:".5px",boxShadow:"0 0 24px rgba(255,185,0,0.35)",transition:"all .25s" }}
                    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 0 36px rgba(255,185,0,0.55)"}}
                    onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 0 24px rgba(255,185,0,0.35)"}}>
                    + Create Batch
                  </button>
                </div>
              </div>

              {/* STATS */}
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:14,marginBottom:22 }}>
                {stats.map((s, i) => <StatCard key={i} {...s} />)}
              </div>

              {/* TOOLBAR */}
              <div style={{ display:"flex",gap:12,alignItems:"center",marginBottom:20,flexWrap:"wrap" }}>
                <div style={{ position:"relative",flex:1,minWidth:220 }}>
                  <span style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:C.w40,pointerEvents:"none",fontSize:14 }}>🔍</span>
                  <input style={{ ...selSt,paddingLeft:40,width:"100%" }} placeholder="Search by batch name, course or trainer…"
                    value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select style={selSt} value={fStatus} onChange={e => setFStatus(e.target.value)}>
                  <option value="">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <span style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:C.w30,letterSpacing:".5px",textTransform:"uppercase",flexShrink:0 }}>
                  {filtered.length} batch{filtered.length !== 1 ? "es" : ""}
                </span>
              </div>

              {/* GRID */}
              {loading ? (
                <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:220 }}>
                  <div style={{ width:36,height:36,borderRadius:"50%",border:"3px solid rgba(255,185,0,0.2)",borderTopColor:C.gold,animation:"lu-spin .8s linear infinite" }} />
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign:"center",padding:"80px 24px" }}>
                  <div style={{ fontSize:52,marginBottom:18,opacity:.5 }}>⊞</div>
                  <div style={{ fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:20,color:C.w50,marginBottom:8 }}>No batches found</div>
                  <div style={{ fontFamily:"'Raleway',sans-serif",fontSize:14,color:C.w30 }}>Try adjusting your search or create a new batch.</div>
                </div>
              ) : (
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:20 }}>
                  {filtered.map(b => (
                    <BatchCard key={b.id} batch={b}
                      onView={()   => { setActive(b); setDialog("view") }}
                      onEdit={()   => openEdit(b)}
                      onDelete={()  => { setActive(b); setDialog("del") }}
                    />
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* DIALOGS */}
      {(dialog === "add" || dialog === "edit") && (
        <BatchFormDialog mode={dialog} initial={formInit} onClose={() => setDialog(null)} onSubmit={handleSubmit} loading={saving} error={formErr} />
      )}
      {dialog === "view" && active && (
        <BatchViewDialog batch={active} onClose={() => setDialog(null)}
          onEdit={() => { openEdit(active); }}
        />
      )}
      {dialog === "addStudent" && active && (
        <AddStudentDialog batchName={active.name} onClose={() => setDialog(null)} onSubmit={handleAddStudent} loading={saving} />
      )}
      {dialog === "del" && active && (
        <div style={{ position:"fixed",inset:0,background:"rgba(2,8,16,0.88)",backdropFilter:"blur(7px)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:24 }}
          onClick={e => { if (e.target === e.currentTarget) setDialog(null) }}>
          <div style={{ background:"rgba(5,14,32,0.98)",border:"1px solid rgba(255,77,106,0.25)",borderRadius:24,maxWidth:430,width:"100%",padding:"32px 28px 24px",textAlign:"center",boxShadow:"0 32px 90px rgba(0,0,0,0.75)" }}>
            <div style={{ fontSize:44,marginBottom:16 }}>🗑️</div>
            <div style={{ fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:20,color:C.w90,marginBottom:10 }}>Delete Batch</div>
            <div style={{ fontFamily:"'Raleway',sans-serif",fontSize:14,color:C.w50,lineHeight:1.65,marginBottom:24 }}>
              Delete <span style={{ color:C.red,fontWeight:600 }}>"{active.name}"</span>?<br/>All enrolled students and sessions will be unlinked.
            </div>
            <div style={{ display:"flex",gap:12,justifyContent:"center" }}>
              <button onClick={() => setDialog(null)} style={{ padding:"10px 22px",borderRadius:100,border:"1px solid rgba(255,255,255,0.15)",background:C.w04,color:C.w70,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700 }}>Cancel</button>
              <button onClick={handleDelete} style={{ padding:"10px 22px",borderRadius:100,border:"1px solid rgba(255,77,106,0.3)",background:"rgba(255,77,106,0.12)",color:C.red,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700 }}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* TOASTS */}
      <div style={{ position:"fixed",bottom:28,right:28,zIndex:1000,display:"flex",flexDirection:"column",gap:10 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ padding:"12px 18px",borderRadius:14,backdropFilter:"blur(24px)",fontFamily:"'Raleway',sans-serif",fontSize:14,fontWeight:500,display:"flex",alignItems:"center",gap:10,minWidth:260,boxShadow:"0 8px 32px rgba(0,0,0,0.5)",
            background: t.type==="success"?"rgba(0,229,160,0.12)":t.type==="error"?"rgba(255,77,106,0.12)":"rgba(255,185,0,0.1)",
            border:     `1px solid ${t.type==="success"?"rgba(0,229,160,0.3)":t.type==="error"?"rgba(255,77,106,0.3)":"rgba(255,185,0,0.28)"}`,
            color:      t.type==="success"?C.green:t.type==="error"?C.red:C.gold }}>
            <span>{t.type==="success"?"✅":t.type==="error"?"⛔":"◉"}</span><span>{t.msg}</span>
          </div>
        ))}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@400;500;600;700;800&family=Raleway:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html, body { background: #020810; margin: 0; height: 100%; }
        input::placeholder { color: rgba(200,220,255,0.22); font-family: 'Raleway', sans-serif; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.4); cursor: pointer; }
        @keyframes lu-scan { from { transform: translateY(-100vh) } to { transform: translateY(200vh) } }
        @keyframes lu-spin  { to { transform: rotate(360deg) } }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,185,0,0.2); border-radius: 4px; }
        select option { background: #0a1628; color: rgba(255,255,255,0.9); }
        @media (max-width: 640px) {
          .batch-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}

declare module "react" { interface CSSProperties { [key: string]: any } }