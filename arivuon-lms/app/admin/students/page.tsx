// app/admin/students/page.tsx
"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import axios from "axios"
import LuminaBackground from "@/components/background/LuminaBackground"
import LuminaSideNav   from "@/components/layout/LuminaSideNav"
import LuminaTopBar     from "@/components/layout/LuminaTopBar"

/* ════════════════════════════════════════════
   TYPES
════════════════════════════════════════════ */
interface StudentProfile {
  id?:                    number
  uuid?:                  string
  user_id?:               number
  dob?:                   string
  gender?:                string
  whatsapp?:              string
  address?:               string
  city?:                  string
  state?:                 string
  country?:               string
  pincode?:               string
  highest_qualification?: string
  degree?:                string
  college?:               string
  yop?:                   number
  technical_background?:  string
  technologies_known?:    string
  course_selection?:      string
  training_mode?:         string
  course_fee?:            number
  amount_paid?:           number
  notes?:                 string
}

interface Student {
  id:          number
  uuid:        string
  name:        string
  email:       string
  phone?:      string
  role:        string
  is_active:   boolean
  is_verified: boolean
  profile:     StudentProfile
  _color?:     string            // UI-only avatar colour
}

/* ════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════ */
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

const C = {
  blue:   "#1a96ff", cyan:  "#00d4ff", gold:   "#ffc933",
  green:  "#00e5a0", red:   "#ff4d6a", purple: "#a78bfa", orange: "#ff8c42",
  surf:   "rgba(5,14,32,0.92)", w06: "rgba(255,255,255,0.6)",
  w90: "rgba(255,255,255,0.9)", w80: "rgba(255,255,255,0.8)",
  w70: "rgba(255,255,255,0.7)", w60: "rgba(255,255,255,0.6)",
  w50: "rgba(255,255,255,0.5)", w40: "rgba(255,255,255,0.4)",
  w30: "rgba(255,255,255,0.3)", w20: "rgba(255,255,255,0.2)",
  w15: "rgba(255,255,255,0.15)",w10: "rgba(255,255,255,0.10)",
  w08: "rgba(255,255,255,0.08)",w04: "rgba(255,255,255,0.04)",
}

const AVATAR_COLORS = ["#1a96ff","#00d4ff","#a78bfa","#00e5a0","#ffc933","#ff8c42","#ff4d6a"]
const rndColor = () => AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
const initials = (name: string) => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
const capFirst  = (s?: string)  => s ? s.charAt(0).toUpperCase() + s.slice(1) : "—"

const PER_PAGE = 10

/* ════════════════════════════════════════════
   API HELPERS
════════════════════════════════════════════ */
const api = {
  getUsers:             ()                          => axios.get(`${API}/users/`),
  getStudentProfile:    (uuid: string)              => axios.get(`${API}/users/${uuid}/student-profile`),
  createUser:           (data: object)              => axios.post(`${API}/users/`, data),
  createStudentProfile: (uuid: string, fd: FormData) =>
    axios.post(`${API}/users/${uuid}/student-profile`, fd, { headers: { "Content-Type": "multipart/form-data" } }),
  // PUT /users/{uuid}                             (add when ready)
  // DELETE /users/{uuid}                          (add when ready)
}

/* ════════════════════════════════════════════
   TOAST HOOK
════════════════════════════════════════════ */
function useToast() {
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([])
  const show = useCallback((msg: string, type = "info") => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200)
  }, [])
  return { toasts, show }
}

/* ════════════════════════════════════════════
   SMALL COMPONENTS
════════════════════════════════════════════ */
function Chip({ text, color }: { text: string; color: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px",
      borderRadius: 100, fontFamily: "'Share Tech Mono', monospace", fontSize: 9,
      letterSpacing: ".5px", textTransform: "uppercase", flexShrink: 0, whiteSpace: "nowrap",
      background: `${color}12`, border: `1px solid ${color}28`, color,
    }}>{text}</span>
  )
}

function PayBar({ paid, total }: { paid: number; total: number }) {
  const pct  = total > 0 ? Math.round((paid / total) * 100) : 0
  const col  = pct >= 100 ? C.green : pct >= 50 ? C.blue : C.red
  const [w, setW] = useState(0)
  useEffect(() => { const t = setTimeout(() => setW(pct), 220); return () => clearTimeout(t) }, [pct])
  return (
    <div style={{ minWidth: 90 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontFamily: "'Oxanium',sans-serif", fontSize: 12, fontWeight: 700, color: col }}>₹{paid.toLocaleString("en-IN")}</span>
        <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: C.w30 }}>/₹{total.toLocaleString("en-IN")}</span>
      </div>
      <div style={{ height: 4, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${w}%`, borderRadius: 4, background: col, transition: "width 1.3s cubic-bezier(.22,1,.36,1)" }} />
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   FIELD COMPONENT
════════════════════════════════════════════ */
const FI: React.CSSProperties = {
  background: C.w04, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 11,
  padding: "11px 14px", color: C.w90, fontFamily: "'Raleway',sans-serif",
  fontSize: 14, outline: "none", transition: "all .2s", width: "100%",
}

function Field({ label, required, hint, full, children }: {
  label: string; required?: boolean; hint?: string; full?: boolean; children: React.ReactNode
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...(full ? { gridColumn: "1/-1" } : {}) }}>
      <label style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: C.w40, letterSpacing: "1.5px", textTransform: "uppercase" }}>
        {label} {required && <span style={{ color: C.blue }}>*</span>}
      </label>
      {children}
      {hint && <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: C.w30 }}>{hint}</div>}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'Oxanium',sans-serif", fontWeight: 700, fontSize: 14, color: C.w80, display: "flex", alignItems: "center", gap: 10, marginBottom: 14, marginTop: 4, gridColumn: "1/-1" }}>
      {children}
      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(26,150,255,0.2),transparent)" }} />
    </div>
  )
}

function Toggle({ label, sub, checked, onChange }: { label: string; sub: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 13px", borderRadius: 11, background: C.w04, border: `1px solid ${C.w08}`, gridColumn: "1/-1" }}>
      <div>
        <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 14, fontWeight: 500, color: C.w80 }}>{label}</div>
        <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: C.w40 }}>{sub}</div>
      </div>
      <label style={{ position: "relative", width: 44, height: 24, cursor: "pointer", flexShrink: 0 }}>
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: 12, background: checked ? C.blue : "rgba(255,255,255,0.1)", transition: "background .25s" }} />
        <div style={{ position: "absolute", top: 3, left: 3, width: 18, height: 18, borderRadius: "50%", background: "white", transition: "transform .25s", transform: checked ? "translateX(20px)" : "none" }} />
      </label>
    </div>
  )
}

function FileZone({ label, sub, icon, accept, onFile }: {
  label: string; sub: string; icon: string; accept: string; onFile: (f: File) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const pick = (f: File) => { setFile(f); onFile(f) }
  return (
    <div>
      <div
        onClick={() => ref.current?.click()}
        style={{ border: "1px dashed rgba(26,150,255,0.3)", borderRadius: 12, padding: 18, textAlign: "center", cursor: "pointer", transition: "all .2s", background: "rgba(26,150,255,0.03)" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(26,150,255,0.55)"; e.currentTarget.style.background = "rgba(26,150,255,0.07)" }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(26,150,255,0.3)"; e.currentTarget.style.background = "rgba(26,150,255,0.03)" }}
      >
        <div style={{ fontSize: 26, marginBottom: 6 }}>{icon}</div>
        <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: C.blue, fontWeight: 500 }}>{label}</div>
        <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: C.w30, marginTop: 2 }}>{sub}</div>
      </div>
      <input ref={ref} type="file" accept={accept} style={{ display: "none" }} onChange={e => e.target.files?.[0] && pick(e.target.files[0])} />
      {file && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, background: "rgba(26,150,255,0.06)", border: "1px solid rgba(26,150,255,0.18)", marginTop: 8 }}>
          <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: C.blue, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
          <span onClick={() => { setFile(null); if (ref.current) ref.current.value = "" }} style={{ cursor: "pointer", color: C.red, fontSize: 14 }}>✕</span>
        </div>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════
   EMPTY FORM STATE
════════════════════════════════════════════ */
const EMPTY: { user: any; profile: StudentProfile; files: Record<string, File | null> } = {
  user: { name: "", email: "", phone: "", role: "student", is_active: true, is_verified: false, password: "" },
  profile: {
    dob: "", gender: "", whatsapp: "", address: "", city: "", state: "", country: "India", pincode: "",
    highest_qualification: "", degree: "", college: "", yop: undefined, technical_background: "",
    technologies_known: "", course_selection: "", training_mode: "", course_fee: 0, amount_paid: 0, notes: "",
  },
  files: { photo: null, resume: null, marks: null, id: null },
}

/* ════════════════════════════════════════════
   STUDENT FORM DIALOG  (Add + Edit)
════════════════════════════════════════════ */
function StudentFormDialog({ mode, initial, onClose, onSubmit, loading, error }: {
  mode:     "add" | "edit"
  initial:  typeof EMPTY
  onClose:  () => void
  onSubmit: (user: any, profile: StudentProfile, files: Record<string, File | null>) => void
  loading:  boolean
  error:    string
}) {
  const [tab,     setTab]     = useState(0)
  const [user,    setUser]    = useState(initial.user)
  const [profile, setProfile] = useState(initial.profile)
  const [files,   setFiles]   = useState<Record<string, File | null>>(initial.files)

  useEffect(() => { setUser(initial.user); setProfile(initial.profile); setFiles(initial.files); setTab(0) }, [initial])

  const su = (k: string, v: any) => setUser((u: any) => ({ ...u, [k]: v }))
  const sp = (k: keyof StudentProfile, v: any) => setProfile(p => ({ ...p, [k]: v }))

  const pct   = (profile.course_fee ?? 0) > 0 ? Math.round(((profile.amount_paid ?? 0) / (profile.course_fee ?? 1)) * 100) : 0
  const bal   = Math.max(0, (profile.course_fee ?? 0) - (profile.amount_paid ?? 0))
  const payCol = pct >= 100 ? C.green : pct >= 50 ? C.blue : C.red

  const TAB_NAMES = ["👤 Personal", "🎓 Academic", "📘 Course & Payment", "📁 Files & Notes"]

  const validate = () => {
    if (tab === 0) {
      if (!user.name.trim()) return "Full name is required"
      if (!user.email.trim()) return "Email is required"
      if (mode === "add" && !user.password) return "Password is required for new students"
    }
    return ""
  }

  const next = () => {
    const e = validate(); if (e) return
    if (tab < 3) setTab(t => t + 1)
  }
  const submit = () => {
    const e = validate(); if (e) return
    onSubmit(user, profile, files)
  }

  const selStyle: React.CSSProperties = { ...FI, cursor: "pointer" }
  const taStyle:  React.CSSProperties = { ...FI, minHeight: 80, resize: "vertical" as const, lineHeight: "1.6" }

  const inp = (id: string, value: string, onChange: (v: string) => void, opts?: object) => (
    <input style={FI} value={value} onChange={e => onChange(e.target.value)}
      onFocus={e => { e.currentTarget.style.borderColor = "rgba(26,150,255,0.45)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,150,255,0.07)" }}
      onBlur={e  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none" }}
      {...opts}
    />
  )

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(2,8,16,0.85)", backdropFilter: "blur(6px)", zIndex: 500, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "20px 16px", overflowY: "auto" }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: "rgba(5,14,32,0.98)", border: "1px solid rgba(26,150,255,0.2)", borderRadius: 24, backdropFilter: "blur(48px)", width: "100%", maxWidth: 820, margin: "auto", boxShadow: "0 32px 90px rgba(0,0,0,0.75), 0 0 80px rgba(26,150,255,0.06)", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: "8%", right: "8%", height: 1, background: "linear-gradient(90deg,transparent,rgba(26,150,255,0.55),transparent)" }} />

        {/* Header */}
        <div style={{ padding: "22px 26px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, background: "linear-gradient(135deg,rgba(26,150,255,0.18),rgba(0,212,255,0.08))", border: "1px solid rgba(26,150,255,0.3)" }}>
              {mode === "add" ? "✚" : "✎"}
            </div>
            <div>
              <div style={{ fontFamily: "'Oxanium',sans-serif", fontWeight: 700, fontSize: 20, color: C.w90 }}>{mode === "add" ? "Add New Student" : "Edit Student"}</div>
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: C.w40, marginTop: 3, fontWeight: 300 }}>
                {mode === "add" ? "Complete all tabs to add the student" : `Editing: ${initial.user.name}`}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)", background: C.w04, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.w50, fontSize: 18, transition: "all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,77,106,0.1)"; e.currentTarget.style.color = C.red }}
            onMouseLeave={e => { e.currentTarget.style.background = C.w04; e.currentTarget.style.color = C.w50 }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", padding: "0 26px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(8,20,44,0.4)", overflowX: "auto", gap: 4 }}>
          {TAB_NAMES.map((t, i) => (
            <div key={i} onClick={() => setTab(i)} style={{ padding: "12px 16px", fontFamily: "'Oxanium',sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: ".5px", textTransform: "uppercase", color: tab === i ? C.blue : C.w40, cursor: "pointer", borderBottom: `2px solid ${tab === i ? C.blue : "transparent"}`, transition: "all .2s", whiteSpace: "nowrap", flexShrink: 0 }}>{t}</div>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: "22px 26px" }}>
          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,77,106,0.1)", border: "1px solid rgba(255,77,106,0.25)", color: C.red, fontFamily: "'Raleway',sans-serif", fontSize: 13, marginBottom: 16 }}>
              ⚠ {error}
            </div>
          )}

          {/* ── TAB 0: Personal ── */}
          {tab === 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 18px" }}>
              <SectionTitle>Basic Information</SectionTitle>
              <Field label="Full Name" required full>
                {inp("name", user.name, v => su("name", v), { placeholder: "e.g. Aryan Kumar", maxLength: 120 })}
              </Field>
              <Field label="Email Address" required>
                {inp("email", user.email, v => su("email", v), { type: "email", placeholder: "aryan@example.com" })}
              </Field>
              <Field label="Phone" required>
                {inp("phone", user.phone, v => su("phone", v), { placeholder: "+91 9876543210", maxLength: 20 })}
              </Field>
              <Field label="WhatsApp" hint="Leave blank if same as phone">
                {inp("whatsapp", profile.whatsapp ?? "", v => sp("whatsapp", v), { placeholder: "+91 9876543210", maxLength: 20 })}
              </Field>
              <Field label="Date of Birth">
                <input style={FI} type="date" value={profile.dob ?? ""} onChange={e => sp("dob", e.target.value)} />
              </Field>
              <Field label="Gender">
                <select style={selStyle} value={profile.gender ?? ""} onChange={e => sp("gender", e.target.value)}>
                  <option value="">Select…</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not">Prefer not to say</option>
                </select>
              </Field>

              <SectionTitle>Address</SectionTitle>
              <Field label="Full Address" full>
                <textarea style={taStyle} value={profile.address ?? ""} onChange={e => sp("address", e.target.value)} placeholder="Door no., Street, Area…" rows={2} maxLength={500} />
              </Field>
              <Field label="City">{inp("city", profile.city ?? "", v => sp("city", v), { placeholder: "Chennai", maxLength: 100 })}</Field>
              <Field label="State">{inp("state", profile.state ?? "", v => sp("state", v), { placeholder: "Tamil Nadu", maxLength: 100 })}</Field>
              <Field label="Country">{inp("country", profile.country ?? "India", v => sp("country", v), { placeholder: "India", maxLength: 100 })}</Field>
              <Field label="PIN Code">{inp("pincode", profile.pincode ?? "", v => sp("pincode", v), { placeholder: "600001", maxLength: 20 })}</Field>

              <SectionTitle>Account</SectionTitle>
              <Field label="Password" required={mode === "add"} hint={mode === "edit" ? "Leave blank to keep current password" : undefined}>
                <input style={FI} type="password" value={user.password} onChange={e => su("password", e.target.value)} placeholder={mode === "add" ? "Min 6 characters" : "Leave blank to keep password"} maxLength={72}
                  onFocus={e => { e.currentTarget.style.borderColor = "rgba(26,150,255,0.45)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,150,255,0.07)" }}
                  onBlur={e  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none" }} />
              </Field>
              <Field label="Role">
                <select style={selStyle} value={user.role} onChange={e => su("role", e.target.value)}>
                  <option value="student">Student</option>
                  <option value="trainer">Trainer</option>
                  <option value="admin">Admin</option>
                </select>
              </Field>
              <Toggle label="Account Active" sub="Inactive students cannot log in" checked={user.is_active} onChange={v => su("is_active", v)} />
              <Toggle label="Email Verified" sub="Mark if manually verified or skipping verification" checked={user.is_verified} onChange={v => su("is_verified", v)} />
            </div>
          )}

          {/* ── TAB 1: Academic ── */}
          {tab === 1 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 18px" }}>
              <SectionTitle>Education Background</SectionTitle>
              <Field label="Highest Qualification">
                <select style={selStyle} value={profile.highest_qualification ?? ""} onChange={e => sp("highest_qualification", e.target.value)}>
                  <option value="">Select…</option>
                  <option value="10th">10th Standard</option>
                  <option value="12th">12th Standard</option>
                  <option value="diploma">Diploma</option>
                  <option value="ug">Under Graduate (UG)</option>
                  <option value="pg">Post Graduate (PG)</option>
                  <option value="phd">PhD</option>
                  <option value="other">Other</option>
                </select>
              </Field>
              <Field label="Degree / Specialisation">
                {inp("degree", profile.degree ?? "", v => sp("degree", v), { placeholder: "e.g. B.E Computer Science", maxLength: 100 })}
              </Field>
              <Field label="College / University" full>
                {inp("college", profile.college ?? "", v => sp("college", v), { placeholder: "e.g. Anna University, Chennai", maxLength: 200 })}
              </Field>
              <Field label="Year of Passing (YOP)">
                <input style={FI} type="number" value={profile.yop ?? ""} onChange={e => sp("yop", parseInt(e.target.value) || undefined)} placeholder="2024" min={1990} max={2030} />
              </Field>

              <SectionTitle>Technical Skills</SectionTitle>
              <Field label="Technical Background" full>
                {inp("techbg", profile.technical_background ?? "", v => sp("technical_background", v), { placeholder: "e.g. 2 years at Infosys as developer", maxLength: 200 })}
              </Field>
              <Field label="Technologies Known" hint="Separate with commas" full>
                <textarea style={taStyle} value={profile.technologies_known ?? ""} onChange={e => sp("technologies_known", e.target.value)} placeholder="Python, Java, React, SQL, AWS…" rows={3} maxLength={500} />
              </Field>
            </div>
          )}

          {/* ── TAB 2: Course & Payment ── */}
          {tab === 2 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 18px" }}>
              <SectionTitle>Enrolment</SectionTitle>
              <Field label="Course Selected" full>
                <input style={FI} value={profile.course_selection ?? ""} onChange={e => sp("course_selection", e.target.value)} placeholder="e.g. Full Stack Web Development" maxLength={200} list="course-options"
                  onFocus={e => { e.currentTarget.style.borderColor = "rgba(26,150,255,0.45)" }}
                  onBlur={e  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)" }} />
                <datalist id="course-options">
                  {["Neural Networks & Deep Learning","Full-Stack Web Development","Quantum Computing","Cloud & DevOps","Cybersecurity","Data Science"].map(c => <option key={c} value={c} />)}
                </datalist>
              </Field>
              <Field label="Training Mode">
                <select style={selStyle} value={profile.training_mode ?? ""} onChange={e => sp("training_mode", e.target.value)}>
                  <option value="">Select…</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </Field>

              <SectionTitle>Payment</SectionTitle>
              <Field label="Total Course Fee (₹)">
                <input style={FI} type="number" value={profile.course_fee || ""} onChange={e => sp("course_fee", parseFloat(e.target.value) || 0)} placeholder="25000" min={0} step={0.01} />
              </Field>
              <Field label="Amount Paid (₹)">
                <input style={FI} type="number" value={profile.amount_paid || ""} onChange={e => sp("amount_paid", parseFloat(e.target.value) || 0)} placeholder="10000" min={0} step={0.01} />
              </Field>

              {(profile.course_fee ?? 0) > 0 && (
                <div style={{ gridColumn: "1/-1", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, padding: 14, borderRadius: 12, background: "rgba(0,229,160,0.05)", border: "1px solid rgba(0,229,160,0.15)" }}>
                  {[
                    { val: `₹${(profile.amount_paid ?? 0).toLocaleString("en-IN")}`, lbl: "Paid",        color: C.green  },
                    { val: `₹${bal.toLocaleString("en-IN")}`,                        lbl: "Balance Due",  color: bal > 0 ? C.red : C.green },
                    { val: `${pct}%`,                                                  lbl: "Paid %",       color: payCol   },
                    { val: `₹${(profile.course_fee ?? 0).toLocaleString("en-IN")}`,   lbl: "Total Fee",    color: C.gold   },
                  ].map((s, i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'Oxanium',sans-serif", fontWeight: 700, fontSize: 18, color: s.color, marginBottom: 3 }}>{s.val}</div>
                      <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: C.w30, textTransform: "uppercase", letterSpacing: ".8px" }}>{s.lbl}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 3: Files & Notes ── */}
          {tab === 3 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 18px" }}>
              <SectionTitle>Documents (FormData upload)</SectionTitle>
              <Field label="Profile Photo">
                <FileZone label="Click to upload photo" sub="JPG, PNG up to 5 MB" icon="📸" accept="image/*" onFile={f => setFiles(x => ({ ...x, photo: f }))} />
              </Field>
              <Field label="Resume / CV">
                <FileZone label="Click to upload resume" sub="PDF, DOC up to 5 MB" icon="📄" accept=".pdf,.doc,.docx" onFile={f => setFiles(x => ({ ...x, resume: f }))} />
              </Field>
              <Field label="Mark Sheet / Certificate">
                <FileZone label="Click to upload marksheet" sub="PDF, JPG, PNG up to 10 MB" icon="🎓" accept=".pdf,image/*" onFile={f => setFiles(x => ({ ...x, marks: f }))} />
              </Field>
              <Field label="ID Proof">
                <FileZone label="Click to upload ID proof" sub="Aadhaar, PAN, Passport" icon="🪪" accept=".pdf,image/*" onFile={f => setFiles(x => ({ ...x, id: f }))} />
              </Field>

              <SectionTitle>Admin Notes</SectionTitle>
              <Field label="Notes (Admin only)" full hint="These notes are only visible to admins">
                <textarea style={{ ...FI, minHeight: 88, resize: "vertical" as const, lineHeight: "1.6" }}
                  value={profile.notes ?? ""} onChange={e => sp("notes", e.target.value)}
                  placeholder="Any special requirements, follow-ups, remarks…" maxLength={1000} />
              </Field>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 26px 22px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "flex-end", gap: 10, alignItems: "center" }}>
          <div style={{ flex: 1, fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: C.w30, letterSpacing: ".5px" }}>
            Step {tab + 1}/4 · {["Personal","Academic","Course & Payment","Files & Notes"][tab]}
          </div>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 100, border: `1px solid ${C.w15}`, background: C.w04, color: C.w70, cursor: "pointer", fontFamily: "'Oxanium',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: ".5px", transition: "all .2s" }}>Cancel</button>
          {tab > 0 && <button onClick={() => setTab(t => t - 1)} style={{ padding: "8px 16px", borderRadius: 100, border: `1px solid ${C.w15}`, background: C.w04, color: C.w60, cursor: "pointer", fontFamily: "'Oxanium',sans-serif", fontSize: 12, fontWeight: 700 }}>← Back</button>}
          {tab < 3 && <button onClick={next} style={{ padding: "10px 24px", borderRadius: 100, border: "none", background: `linear-gradient(135deg,${C.blue},${C.cyan})`, color: "white", cursor: "pointer", fontFamily: "'Oxanium',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: ".5px", boxShadow: "0 0 24px rgba(26,150,255,0.35)", transition: "all .2s" }}>Next →</button>}
          {tab === 3 && (
            <button onClick={submit} disabled={loading} style={{ padding: "10px 24px", borderRadius: 100, border: "none", background: loading ? "rgba(26,150,255,0.4)" : `linear-gradient(135deg,${C.blue},${C.cyan})`, color: "white", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Oxanium',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: ".5px", boxShadow: loading ? "none" : "0 0 24px rgba(26,150,255,0.35)", display: "flex", alignItems: "center", gap: 8 }}>
              {loading ? <><span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "white", animation: "lu-spin .8s linear infinite", display: "inline-block" }} />Saving…</> : mode === "add" ? "Add Student" : "Save Changes"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   VIEW DIALOG
════════════════════════════════════════════ */
function ViewDialog({ student, onClose, onEdit }: { student: Student; onClose: () => void; onEdit: () => void }) {
  const s = student; const p = s.profile
  const pct = (p.course_fee ?? 0) > 0 ? Math.round(((p.amount_paid ?? 0) / (p.course_fee ?? 1)) * 100) : 0
  const bal = Math.max(0, (p.course_fee ?? 0) - (p.amount_paid ?? 0))
  const payCol = pct >= 100 ? C.green : pct >= 50 ? C.blue : C.red
  const col = s._color ?? C.blue

  const MetaItem = ({ lbl, val, col: c }: { lbl: string; val: string; col?: string }) => (
    <div style={{ padding: "11px 13px", borderRadius: 12, background: C.w04, border: `1px solid ${C.w08}` }}>
      <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: C.w30, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>{lbl}</div>
      <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 14, fontWeight: 600, color: c ?? C.w90 }}>{val || "—"}</div>
    </div>
  )
  const ViewSec = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontFamily: "'Oxanium',sans-serif", fontWeight: 700, fontSize: 14, color: C.w70, display: "flex", alignItems: "center", gap: 10, marginBottom: 12, marginTop: 18 }}>
      {children}<div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(255,255,255,0.1),transparent)" }} />
    </div>
  )

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(2,8,16,0.85)", backdropFilter: "blur(6px)", zIndex: 500, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "20px 16px", overflowY: "auto" }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: "rgba(5,14,32,0.98)", border: "1px solid rgba(26,150,255,0.2)", borderRadius: 24, backdropFilter: "blur(48px)", width: "100%", maxWidth: 820, margin: "auto", boxShadow: "0 32px 90px rgba(0,0,0,0.75)", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: "8%", right: "8%", height: 1, background: "linear-gradient(90deg,transparent,rgba(26,150,255,0.55),transparent)" }} />

        {/* Header */}
        <div style={{ padding: "22px 26px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, background: `${col}18`, border: `1px solid ${col}30` }}>👁</div>
            <div>
              <div style={{ fontFamily: "'Oxanium',sans-serif", fontWeight: 700, fontSize: 20, color: C.w90 }}>Student Profile</div>
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: C.w40, marginTop: 3 }}>{s.email}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)", background: C.w04, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.w50, fontSize: 18 }}>✕</button>
        </div>

        <div style={{ padding: "22px 26px" }}>
          {/* Hero */}
          <div style={{ display: "flex", alignItems: "center", gap: 18, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 20, flexWrap: "wrap" }}>
            <div style={{ width: 72, height: 72, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Oxanium',sans-serif", fontWeight: 800, fontSize: 26, flexShrink: 0, position: "relative", background: `${col}18`, border: `2px solid ${col}30` }}>
              <span style={{ color: col }}>{initials(s.name)}</span>
              <div style={{ position: "absolute", bottom: -3, right: -3, width: 16, height: 16, borderRadius: "50%", background: s.is_active ? C.green : C.red, border: "3px solid #050e20" }} />
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontFamily: "'Oxanium',sans-serif", fontWeight: 800, fontSize: 22, color: C.w90, marginBottom: 5 }}>{s.name}</div>
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 14, color: C.w50, marginBottom: 10 }}>{s.email} · {s.phone || "—"}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Chip text={s.is_active ? "Active" : "Inactive"} color={s.is_active ? C.green : C.red} />
                <Chip text={s.is_verified ? "✓ Verified" : "Unverified"} color={s.is_verified ? C.blue : C.gold} />
                <Chip text={capFirst(s.role)} color={col} />
                {p.training_mode && <Chip text={capFirst(p.training_mode)} color={C.purple} />}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontFamily: "'Oxanium',sans-serif", fontWeight: 700, fontSize: 22, color: payCol }}>₹{(p.amount_paid ?? 0).toLocaleString("en-IN")}</div>
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: C.w30 }}>of ₹{(p.course_fee ?? 0).toLocaleString("en-IN")} paid</div>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: payCol, marginTop: 3 }}>{pct}% paid</div>
            </div>
          </div>

          <ViewSec>📘 Course</ViewSec>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10, marginBottom: 8 }}>
            <MetaItem lbl="Course" val={p.course_selection ?? ""} />
            <MetaItem lbl="Training Mode" val={capFirst(p.training_mode)} />
            <MetaItem lbl="Total Fee" val={`₹${(p.course_fee ?? 0).toLocaleString("en-IN")}`} col={C.gold} />
            <MetaItem lbl="Amount Paid" val={`₹${(p.amount_paid ?? 0).toLocaleString("en-IN")}`} col={C.green} />
            <MetaItem lbl="Balance Due" val={`₹${bal.toLocaleString("en-IN")}`} col={bal > 0 ? C.red : C.green} />
          </div>

          <ViewSec>👤 Personal</ViewSec>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10, marginBottom: 8 }}>
            <MetaItem lbl="Date of Birth" val={p.dob ?? ""} />
            <MetaItem lbl="Gender" val={capFirst(p.gender)} />
            <MetaItem lbl="WhatsApp" val={p.whatsapp ?? ""} />
            <MetaItem lbl="City" val={p.city ?? ""} />
            <MetaItem lbl="State" val={p.state ?? ""} />
            <MetaItem lbl="Country" val={p.country ?? ""} />
          </div>

          <ViewSec>🎓 Academic</ViewSec>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10, marginBottom: 8 }}>
            <MetaItem lbl="Qualification" val={capFirst(p.highest_qualification)} />
            <MetaItem lbl="Degree" val={p.degree ?? ""} />
            <MetaItem lbl="College" val={p.college ?? ""} />
            <MetaItem lbl="Year of Passing" val={String(p.yop ?? "")} />
          </div>
          {p.technologies_known && (
            <div style={{ padding: "12px 14px", borderRadius: 12, background: C.w04, border: `1px solid ${C.w08}`, marginBottom: 12, fontFamily: "'Raleway',sans-serif", fontSize: 13, color: C.w60, lineHeight: 1.7 }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: C.w30, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 5 }}>Technologies Known</div>
              {p.technologies_known}
            </div>
          )}
          {p.notes && (
            <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(255,185,0,0.05)", border: "1px solid rgba(255,185,0,0.15)", fontFamily: "'Raleway',sans-serif", fontSize: 13, color: C.w60, lineHeight: 1.7 }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "rgba(255,185,0,0.5)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 5 }}>📋 Admin Notes</div>
              {p.notes}
            </div>
          )}
        </div>

        <div style={{ padding: "16px 26px 22px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 100, border: `1px solid ${C.w15}`, background: C.w04, color: C.w70, cursor: "pointer", fontFamily: "'Oxanium',sans-serif", fontSize: 13, fontWeight: 700 }}>Close</button>
          <button onClick={onEdit}  style={{ padding: "10px 24px", borderRadius: 100, border: "none", background: `linear-gradient(135deg,${C.blue},${C.cyan})`, color: "white", cursor: "pointer", fontFamily: "'Oxanium',sans-serif", fontSize: 13, fontWeight: 700, boxShadow: "0 0 24px rgba(26,150,255,0.35)" }}>✎ Edit Student</button>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════ */
export default function AdminStudentsPage() {
  const { toasts, show: toast } = useToast()

  const [students,  setStudents]  = useState<Student[]>([])
  const [filtered,  setFiltered]  = useState<Student[]>([])
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [formError, setFormError] = useState("")

  const [search,    setSearch]    = useState("")
  const [fTraining, setFTraining] = useState("")
  const [fCity,     setFCity]     = useState("")
  const [fCourse,   setFCourse]   = useState("")
  const [fStatus,   setFStatus]   = useState("")
  const [page,      setPage]      = useState(1)

  const [selected,  setSelected]  = useState<Set<number>>(new Set())
  const [dialog,    setDialog]    = useState<"add"|"edit"|"view"|"del"|null>(null)
  const [active,    setActive]    = useState<Student | null>(null)
  const [formInit,  setFormInit]  = useState(EMPTY)

  /* ── Load ── */
  const loadStudents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.getUsers()
      const users: any[] = res.data?.data ?? res.data
      const studentUsers = users.filter((u: any) => u.role === "student")
      const enriched: Student[] = await Promise.all(
        studentUsers.map(async (u: any) => {
          let profile: StudentProfile = {}
          try { const pr = await api.getStudentProfile(u.uuid); profile = pr.data?.data ?? pr.data ?? {} } catch {}
          return { ...u, profile, _color: AVATAR_COLORS[u.id % AVATAR_COLORS.length] }
        })
      )
      setStudents(enriched)
    } catch {
      toast("Failed to load students. Showing demo data.", "error")
      setStudents([
        { id:1, uuid:"s001", name:"Aryan Kumar",  email:"aryan@example.com",  phone:"+91 9876543210", role:"student", is_active:true,  is_verified:true,  _color:"#1a96ff", profile:{city:"Chennai",    course_selection:"Deep Learning",     training_mode:"online",  course_fee:25000, amount_paid:25000} },
        { id:2, uuid:"s002", name:"Priya Sharma", email:"priya@example.com",  phone:"+91 8765432109", role:"student", is_active:true,  is_verified:true,  _color:"#a78bfa", profile:{city:"Bangalore",  course_selection:"Web Development",    training_mode:"hybrid",  course_fee:20000, amount_paid:10000} },
        { id:3, uuid:"s003", name:"Rahul Singh",  email:"rahul@example.com",  phone:"+91 7654321098", role:"student", is_active:true,  is_verified:false, _color:"#00e5a0", profile:{city:"Hyderabad", course_selection:"Cloud & DevOps",     training_mode:"online",  course_fee:18000, amount_paid:5000 } },
        { id:4, uuid:"s004", name:"Sneha Patel",  email:"sneha@example.com",  phone:"+91 6543210987", role:"student", is_active:false, is_verified:true,  _color:"#ffc933", profile:{city:"Ahmedabad", course_selection:"Data Science",       training_mode:"offline", course_fee:22000, amount_paid:22000} },
        { id:5, uuid:"s005", name:"Dev Mehta",    email:"dev@example.com",    phone:"+91 5432109876", role:"student", is_active:true,  is_verified:true,  _color:"#ff8c42", profile:{city:"Mumbai",    course_selection:"Quantum Computing",  training_mode:"online",  course_fee:30000, amount_paid:15000} },
      ])
    } finally { setLoading(false) }
  }, [toast])

  useEffect(() => { loadStudents() }, [loadStudents])

  /* ── Filter ── */
  useEffect(() => {
    const q = search.toLowerCase()
    let out = students.filter(s => {
      const mQ   = !q   || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || (s.phone ?? "").includes(q) || (s.profile.course_selection ?? "").toLowerCase().includes(q)
      const mTr  = !fTraining || s.profile.training_mode === fTraining
      const mCi  = !fCity    || s.profile.city === fCity
      const mCo  = !fCourse  || s.profile.course_selection === fCourse
      let mSt = true
      if (fStatus === "active")    mSt = s.is_active
      if (fStatus === "inactive")  mSt = !s.is_active
      if (fStatus === "unverified")mSt = !s.is_verified
      if (fStatus === "pending")   mSt = (s.profile.amount_paid ?? 0) < (s.profile.course_fee ?? 0)
      return mQ && mTr && mCi && mCo && mSt
    })
    setFiltered(out); setPage(1)
  }, [students, search, fTraining, fCity, fCourse, fStatus])

  const cities   = [...new Set(students.map(s => s.profile.city).filter(Boolean))].sort()
  const courses  = [...new Set(students.map(s => s.profile.course_selection).filter(Boolean))].sort()
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const pageStudents = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE)

  /* ── Stats ── */
  const stats = [
    { icon:"🎓", val: students.length, lbl:"Total",    color: C.blue   },
    { icon:"✅", val: students.filter(s=>s.is_active).length, lbl:"Active", color: C.green  },
    { icon:"🚫", val: students.filter(s=>!s.is_active).length, lbl:"Inactive", color: C.red },
    { icon:"📧", val: students.filter(s=>!s.is_verified).length, lbl:"Unverified", color: C.gold },
    { icon:"💳", val: students.filter(s=>(s.profile.amount_paid??0)<(s.profile.course_fee??0)).length, lbl:"Payment Pending", color: C.orange },
    { icon:"💰", val: "₹"+students.reduce((a,s)=>a+(s.profile.amount_paid??0),0).toLocaleString("en-IN"), lbl:"Revenue", color: C.purple },
  ]

  /* ── Submit form ── */
  const handleSubmit = async (user: any, profile: StudentProfile, files: Record<string, File|null>) => {
    setSaving(true); setFormError("")
    try {
      if (dialog === "add") {
        const { data: newUserResp } = await api.createUser({ name: user.name, email: user.email, phone: user.phone, role: user.role, password: user.password })
        const newUser = newUserResp?.data ?? newUserResp
        const fd = new FormData()
        Object.entries(profile).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== "") fd.append(k, String(v)) })
        if (files.photo)  fd.append("photo",  files.photo)
        if (files.resume) fd.append("resume", files.resume)
        if (files.marks)  fd.append("marks",  files.marks)
        if (files.id)     fd.append("id_proof", files.id)
        await api.createStudentProfile(newUser.uuid, fd)
        toast("Student added successfully!", "success")
      } else if (active) {
        // PUT endpoint — use FormData similarly
        setStudents(ss => ss.map(s => s.id === active.id ? { ...s, ...user, profile: { ...s.profile, ...profile } } : s))
        toast("Student updated successfully!", "success")
      }
      setDialog(null)
      loadStudents()
    } catch (err: any) {
      setFormError(err?.response?.data?.detail ?? "Failed to save. Please check all fields.")
    } finally { setSaving(false) }
  }

  const handleDelete = () => {
    if (!active) return
    setStudents(ss => ss.filter(s => s.id !== active.id))
    setDialog(null)
    toast("Student removed.", "info")
  }

  const openAdd  = () => { setFormInit(EMPTY); setActive(null); setFormError(""); setDialog("add") }
  const openEdit = (s: Student) => {
    setActive(s)
    setFormError("")
    setFormInit({
      user:    { name: s.name, email: s.email, phone: s.phone ?? "", role: s.role, is_active: s.is_active, is_verified: s.is_verified, password: "" },
      profile: { ...s.profile },
      files:   { photo: null, resume: null, marks: null, id: null },
    })
    setDialog("edit")
  }

  const toggleSel = (id: number) => {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const selStyle: React.CSSProperties = {
    padding: "9px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)",
    background: C.w04, color: C.w70, fontFamily: "'Raleway',sans-serif",
    fontSize: 13, outline: "none", cursor: "pointer",
  }

  return (
    <>
      <LuminaBackground />
      <div style={{ position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:1 }}>
        <div style={{ position:"absolute",width:"100%",height:1,background:"linear-gradient(90deg,transparent,rgba(26,150,255,0.05),rgba(26,150,255,0.1),rgba(26,150,255,0.05),transparent)",animation:"lu-scan 18s linear infinite" }} />
      </div>

      <div style={{ display:"flex",height:"100vh",overflow:"hidden",position:"relative",zIndex:2 }}>
        <LuminaSideNav role="admin"/>

        <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0 }}>
          <LuminaTopBar role="admin" />

          <div style={{ flex:1,overflowY:"auto",padding:"22px 24px 44px" }}>
            <div style={{ maxWidth:1500,margin:"0 auto" }}>

              {/* PAGE HEADER */}
              <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:16,marginBottom:22 }}>
                <div>
                  <div style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:C.blue,letterSpacing:"2px",textTransform:"uppercase",marginBottom:5,display:"flex",alignItems:"center",gap:8 }}>
                    <span style={{ width:16,height:1,background:C.blue,opacity:.6,display:"inline-block" }}/>People · Learners
                  </div>
                  <h1 style={{ fontFamily:"'Oxanium',sans-serif",fontWeight:800,fontSize:"clamp(22px,3vw,32px)",color:C.w90,letterSpacing:"-.5px",margin:0 }}>Students</h1>
                  <p style={{ fontFamily:"'Raleway',sans-serif",fontSize:14,color:C.w50,margin:"4px 0 0",fontWeight:300 }}>Manage all enrolled students — view profiles, track payments and course progress</p>
                </div>
                <div style={{ display:"flex",gap:10 }}>
                  <button onClick={loadStudents} style={{ ...selStyle, border:"1px solid rgba(255,255,255,0.15)",color:C.w60 }}>↺ Refresh</button>
                  <button onClick={openAdd} style={{ padding:"10px 22px",borderRadius:100,border:"none",background:`linear-gradient(135deg,${C.blue},${C.cyan})`,color:"white",cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700,letterSpacing:".5px",boxShadow:"0 0 24px rgba(26,150,255,0.35)",transition:"all .25s" }}
                    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 0 36px rgba(26,150,255,0.55)"}}
                    onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 0 24px rgba(26,150,255,0.35)"}}>+ Add Student</button>
                </div>
              </div>

              {/* STATS */}
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:14,marginBottom:22 }}>
                {stats.map((s,i)=>(
                  <div key={i} style={{ background:C.surf,borderRadius:16,padding:"16px 18px",backdropFilter:"blur(24px)",border:`1px solid ${s.color}18`,transition:"transform .3s cubic-bezier(.22,1,.36,1)",cursor:"default" }}
                    onMouseEnter={e=>e.currentTarget.style.transform="translateY(-3px)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}>
                    <div style={{ fontSize:18,marginBottom:10 }}>{s.icon}</div>
                    <div style={{ fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:26,color:s.color,lineHeight:1,marginBottom:3 }}>{s.val}</div>
                    <div style={{ fontFamily:"'Raleway',sans-serif",fontSize:12,color:C.w50 }}>{s.lbl}</div>
                  </div>
                ))}
              </div>

              {/* TOOLBAR */}
              <div style={{ background:C.surf,border:`1px solid ${C.w08}`,borderRadius:16,padding:"14px 16px",marginBottom:16 }}>
                <div style={{ display:"flex",gap:12,flexWrap:"wrap",alignItems:"center",marginBottom:12 }}>
                  <div style={{ position:"relative",flex:1,minWidth:220 }}>
                    <span style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:C.w40,pointerEvents:"none" }}>🔍</span>
                    <input style={{ ...selStyle,paddingLeft:40,width:"100%" }} placeholder="Search by name, email, phone, course…" value={search} onChange={e=>setSearch(e.target.value)} />
                  </div>
                  <select style={selStyle} value={fTraining} onChange={e=>setFTraining(e.target.value)}>
                    <option value="">All Training Modes</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                  <select style={selStyle} value={fCity} onChange={e=>setFCity(e.target.value)}>
                    <option value="">All Cities</option>
                    {cities.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                  <select style={selStyle} value={fCourse} onChange={e=>setFCourse(e.target.value)}>
                    <option value="">All Courses</option>
                    {courses.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ display:"flex",gap:8,flexWrap:"wrap",alignItems:"center" }}>
                  <span style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:C.w30,letterSpacing:".5px",textTransform:"uppercase" }}>Status:</span>
                  {["","active","inactive","unverified","pending"].map(s=>(
                    <button key={s} onClick={()=>setFStatus(s)} style={{ padding:"7px 14px",borderRadius:100,border:`1px solid ${fStatus===s?"rgba(26,150,255,0.4)":"rgba(255,255,255,0.1)"}`,background:fStatus===s?"rgba(26,150,255,0.1)":C.w04,color:fStatus===s?C.blue:C.w50,cursor:"pointer",fontFamily:"'Raleway',sans-serif",fontSize:12,fontWeight:500,transition:"all .2s",whiteSpace:"nowrap" }}>
                      {s===""?"All":s==="unverified"?"Unverified":s==="pending"?"Payment Pending":s.charAt(0).toUpperCase()+s.slice(1)}
                    </button>
                  ))}
                  <span style={{ marginLeft:"auto",fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:C.w30,letterSpacing:".5px",textTransform:"uppercase" }}>
                    {filtered.length} student{filtered.length!==1?"s":""} found
                  </span>
                </div>
                {selected.size > 0 && (
                  <div style={{ display:"flex",gap:12,alignItems:"center",paddingTop:12,borderTop:`1px solid ${C.w06}`,marginTop:12,flexWrap:"wrap" }}>
                    <span style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:12,color:C.blue }}>{selected.size} selected</span>
                    <button style={{ padding:"7px 14px",borderRadius:100,border:"1px solid rgba(255,77,106,0.3)",background:"rgba(255,77,106,0.1)",color:C.red,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:12,fontWeight:700 }} onClick={()=>{setStudents(s=>s.filter(x=>!selected.has(x.id)));setSelected(new Set());toast("Deleted selected students.","info")}}>🗑 Delete Selected</button>
                    <button style={{ padding:"7px 14px",borderRadius:100,border:`1px solid ${C.w15}`,background:C.w04,color:C.w60,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:12,fontWeight:700,marginLeft:"auto" }} onClick={()=>setSelected(new Set())}>✕ Clear</button>
                  </div>
                )}
              </div>

              {/* TABLE */}
              <div style={{ background:C.surf,border:`1px solid ${C.w08}`,borderRadius:18,overflow:"hidden" }}>
                {/* Head */}
                <div style={{ display:"grid",gridTemplateColumns:"18px 40px 1fr 120px 100px 88px 115px 95px 100px",alignItems:"center",padding:"11px 16px",background:"rgba(8,20,44,0.6)",borderBottom:`1px solid ${C.w08}`,fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w30,textTransform:"uppercase",letterSpacing:"1px",gap:12 }}>
                  <div/><div/>
                  <div>Name / Email</div><div>Course</div><div>City</div><div>Mode</div><div>Payment</div><div>Status</div><div>Actions</div>
                </div>

                {/* Body */}
                {loading ? (
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:200 }}>
                    <div style={{ width:32,height:32,borderRadius:"50%",border:"3px solid rgba(26,150,255,0.2)",borderTopColor:C.blue,animation:"lu-spin .8s linear infinite" }} />
                  </div>
                ) : pageStudents.length === 0 ? (
                  <div style={{ padding:"80px 24px",textAlign:"center" }}>
                    <div style={{ fontSize:52,marginBottom:18,opacity:.5 }}>◎</div>
                    <div style={{ fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:20,color:C.w50,marginBottom:8 }}>No students found</div>
                    <div style={{ fontFamily:"'Raleway',sans-serif",fontSize:14,color:C.w30 }}>Try adjusting your filters or search terms</div>
                  </div>
                ) : pageStudents.map((s,idx)=>{
                  const col = s._color ?? C.blue
                  const isSel = selected.has(s.id)
                  return (
                    <div key={s.id}
                      onClick={()=>{ setActive(s); setDialog("view") }}
                      style={{ display:"grid",gridTemplateColumns:"18px 40px 1fr 120px 100px 88px 115px 95px 100px",alignItems:"center",padding:"13px 16px",gap:12,borderBottom:`1px solid ${C.w06}`,cursor:"pointer",transition:"background .2s",background:isSel?"rgba(26,150,255,0.07)":"transparent" }}
                      onMouseEnter={e=>{ if(!isSel)e.currentTarget.style.background="rgba(26,150,255,0.04)" }}
                      onMouseLeave={e=>{ if(!isSel)e.currentTarget.style.background="transparent" }}
                    >
                      {/* Checkbox */}
                      <div onClick={e=>{e.stopPropagation();toggleSel(s.id)}} style={{ width:18,height:18,borderRadius:5,border:`1px solid ${isSel?"rgba(26,150,255,0.6)":"rgba(255,255,255,0.15)"}`,background:isSel?"rgba(26,150,255,0.15)":C.w04,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0 }}>
                        {isSel && <span style={{ fontSize:11,color:C.blue }}>✓</span>}
                      </div>

                      {/* Avatar */}
                      <div style={{ width:38,height:38,borderRadius:10,background:`${col}18`,border:`1px solid ${col}30`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:13,color:col,position:"relative",flexShrink:0 }}>
                        {initials(s.name)}
                        <div style={{ position:"absolute",bottom:-2,right:-2,width:9,height:9,borderRadius:"50%",background:s.is_active?C.green:C.red,border:`2px solid rgba(5,14,32,0.9)` }} />
                      </div>

                      {/* Name */}
                      <div style={{ minWidth:0 }}>
                        <div style={{ fontFamily:"'Raleway',sans-serif",fontSize:14,fontWeight:600,color:C.w90,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{s.name}</div>
                        <div style={{ fontFamily:"'Raleway',sans-serif",fontSize:12,color:C.w40,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{s.email}</div>
                      </div>

                      <div style={{ fontFamily:"'Raleway',sans-serif",fontSize:12,color:C.w60,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{s.profile.course_selection || "—"}</div>
                      <div style={{ fontFamily:"'Raleway',sans-serif",fontSize:12,color:C.w50 }}>{s.profile.city || "—"}</div>
                      <div>{s.profile.training_mode ? <Chip text={capFirst(s.profile.training_mode)} color={C.blue} /> : <span style={{ color:C.w30,fontSize:12 }}>—</span>}</div>
                      <PayBar paid={s.profile.amount_paid ?? 0} total={s.profile.course_fee ?? 0} />
                      <div><Chip text={s.is_active?"Active":"Inactive"} color={s.is_active?C.green:C.red} /></div>

                      {/* Actions */}
                      <div style={{ display:"flex",gap:6 }} onClick={e=>e.stopPropagation()}>
                        {[
                          {icon:"👁",col:C.blue,  cb:()=>{setActive(s);setDialog("view")}},
                          {icon:"✎",col:C.gold,  cb:()=>openEdit(s)},
                          {icon:"🗑",col:C.red,   cb:()=>{setActive(s);setDialog("del")}},
                        ].map((b,i)=>(
                          <button key={i} onClick={b.cb} style={{ width:30,height:30,borderRadius:8,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,background:`${b.col}0e`,color:b.col,transition:"all .2s" }}
                            onMouseEnter={e=>{e.currentTarget.style.background=`${b.col}22`;e.currentTarget.style.transform="scale(1.1)"}}
                            onMouseLeave={e=>{e.currentTarget.style.background=`${b.col}0e`;e.currentTarget.style.transform="none"}}
                          >{b.icon}</button>
                        ))}
                      </div>
                    </div>
                  )
                })}

                {/* Pagination */}
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px",borderTop:`1px solid ${C.w06}`,flexWrap:"wrap",gap:10 }}>
                  <span style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:C.w30,letterSpacing:".5px",textTransform:"uppercase" }}>
                    {filtered.length ? `Showing ${(page-1)*PER_PAGE+1}–${Math.min(page*PER_PAGE,filtered.length)} of ${filtered.length} students` : "No students"}
                  </span>
                  <div style={{ display:"flex",gap:6 }}>
                    <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{ width:32,height:32,borderRadius:8,border:"1px solid rgba(255,255,255,0.1)",background:C.w04,color:C.w50,cursor:page===1?"not-allowed":"pointer",opacity:page===1?.35:1,fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center" }}>‹</button>
                    {Array.from({length:Math.min(5,totalPages)},(_,i)=>{const p=Math.max(1,Math.min(totalPages-4,page-2))+i;return(
                      <button key={p} onClick={()=>setPage(p)} style={{ width:32,height:32,borderRadius:8,border:`1px solid ${p===page?"rgba(26,150,255,0.4)":"rgba(255,255,255,0.1)"}`,background:p===page?"rgba(26,150,255,0.14)":C.w04,color:p===page?C.blue:C.w50,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center" }}>{p}</button>
                    )})}
                    <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages||totalPages===0} style={{ width:32,height:32,borderRadius:8,border:"1px solid rgba(255,255,255,0.1)",background:C.w04,color:C.w50,cursor:page===totalPages?"not-allowed":"pointer",opacity:page===totalPages?.35:1,fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center" }}>›</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DIALOGS */}
      {(dialog==="add"||dialog==="edit") && (
        <StudentFormDialog mode={dialog} initial={formInit} onClose={()=>setDialog(null)} onSubmit={handleSubmit} loading={saving} error={formError} />
      )}
      {dialog==="view" && active && (
        <ViewDialog student={active} onClose={()=>setDialog(null)} onEdit={()=>{openEdit(active);setDialog("edit")}} />
      )}
      {dialog==="del" && active && (
        <div style={{ position:"fixed",inset:0,background:"rgba(2,8,16,0.85)",backdropFilter:"blur(6px)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:24 }}
          onClick={e=>{if(e.target===e.currentTarget)setDialog(null)}}>
          <div style={{ background:"rgba(5,14,32,0.98)",border:"1px solid rgba(255,77,106,0.25)",borderRadius:24,backdropFilter:"blur(48px)",maxWidth:430,width:"100%",padding:"32px 28px 24px",textAlign:"center",boxShadow:"0 32px 90px rgba(0,0,0,0.75)" }}>
            <div style={{ fontSize:44,marginBottom:16 }}>🗑️</div>
            <div style={{ fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:20,color:C.w90,marginBottom:10 }}>Delete Student</div>
            <div style={{ fontFamily:"'Raleway',sans-serif",fontSize:14,color:C.w50,lineHeight:1.65,marginBottom:24 }}>
              Are you sure you want to remove <span style={{ color:C.red,fontWeight:600 }}>"{active.name}"</span>?<br/>All their profile data will be permanently deleted.
            </div>
            <div style={{ display:"flex",gap:12,justifyContent:"center" }}>
              <button onClick={()=>setDialog(null)} style={{ padding:"10px 22px",borderRadius:100,border:`1px solid ${C.w15}`,background:C.w04,color:C.w70,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700 }}>Cancel</button>
              <button onClick={handleDelete} style={{ padding:"10px 22px",borderRadius:100,border:"1px solid rgba(255,77,106,0.3)",background:"rgba(255,77,106,0.12)",color:C.red,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700 }}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* TOASTS */}
      <div style={{ position:"fixed",bottom:28,right:28,zIndex:1000,display:"flex",flexDirection:"column",gap:10 }}>
        {toasts.map(t=>(
          <div key={t.id} style={{ padding:"12px 18px",borderRadius:14,backdropFilter:"blur(24px)",fontFamily:"'Raleway',sans-serif",fontSize:14,fontWeight:500,display:"flex",alignItems:"center",gap:10,minWidth:260,boxShadow:"0 8px 32px rgba(0,0,0,0.5)",background:t.type==="success"?"rgba(0,229,160,0.12)":t.type==="error"?"rgba(255,77,106,0.12)":"rgba(26,150,255,0.1)",border:`1px solid ${t.type==="success"?"rgba(0,229,160,0.3)":t.type==="error"?"rgba(255,77,106,0.3)":"rgba(26,150,255,0.28)"}`,color:t.type==="success"?C.green:t.type==="error"?C.red:C.blue }}>
            <span>{t.type==="success"?"✅":t.type==="error"?"⛔":"◉"}</span><span>{t.msg}</span>
          </div>
        ))}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@400;500;600;700;800&family=Raleway:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap');
        *, *::before, *::after { box-sizing:border-box; }
        html, body { background:#020810; margin:0; height:100%; }
        input::placeholder, textarea::placeholder { color:rgba(200,220,255,0.22); font-family:'Raleway',sans-serif; }
        input:-webkit-autofill { -webkit-box-shadow:0 0 0 100px #050d1e inset !important; -webkit-text-fill-color:#e8f4ff !important; }
        @keyframes lu-scan { from{transform:translateY(-100vh)} to{transform:translateY(200vh)} }
        @keyframes lu-spin  { to{transform:rotate(360deg)} }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(26,150,255,0.2); border-radius:4px; }
      `}</style>
    </>
  )
}

declare module "react" { interface CSSProperties { [key:string]:any } }