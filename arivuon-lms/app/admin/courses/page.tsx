// app/admin/courses/page.tsx
"use client"

import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import LuminaBackground from "@/components/background/LuminaBackground"
import LuminaSideNav   from "@/components/layout/LuminaSideNav"
import LuminaTopBar     from "@/components/layout/LuminaTopBar"

/* ════════════════════════════════════════════
   TYPES  (matching your SQLAlchemy models)
════════════════════════════════════════════ */
interface CoursePrice {
  id?:        number
  country:    string
  currency:   string
  price:      number
}

interface Course {
  id:          number
  uuid?:       string
  title:       string
  slug:        string
  description: string
  level:       string         // beginner | intermediate | advanced
  duration:    string
  thumbnail:   string
  category:    string
  is_active:   string         // "true" | "false"
  prices:      CoursePrice[]
}

type CourseCreate = Omit<Course, "id" | "uuid" | "prices"> & { prices: CoursePrice[] }

/* ════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════ */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

const C = {
  gold:   "#ffc933", gold2: "#ffad00",
  blue:   "#1a96ff", cyan:  "#00d4ff",
  green:  "#00e5a0", red:   "#ff4d6a",
  purple: "#a78bfa", orange:"#ff8c42",
  w90: "rgba(255,255,255,0.9)", w80: "rgba(255,255,255,0.8)",
  w70: "rgba(255,255,255,0.7)", w60: "rgba(255,255,255,0.6)",
  w50: "rgba(255,255,255,0.5)", w40: "rgba(255,255,255,0.4)",
  w30: "rgba(255,255,255,0.3)", w20: "rgba(255,255,255,0.2)",
  w15: "rgba(255,255,255,0.15)",w10: "rgba(255,255,255,0.10)",
  w08: "rgba(255,255,255,0.08)",w04: "rgba(255,255,255,0.04)",
  surf: "rgba(5,14,32,0.90)",
}

const CATEGORY_ICONS: Record<string, string> = {
  "AI / Machine Learning":  "🧠",
  "Web Development":         "⚡",
  "Quantum Computing":       "⚛️",
  "Cloud & DevOps":          "☁️",
  "Cybersecurity":           "🔐",
  "XR / Spatial Design":    "🥽",
  "Data Science":            "📊",
}
const CAT_GRADIENTS: Record<string, string> = {
  "AI / Machine Learning":  "linear-gradient(135deg,#030c1a,#062040)",
  "Web Development":         "linear-gradient(135deg,#0a0520,#1a0830)",
  "Quantum Computing":       "linear-gradient(135deg,#030c1a,#051828)",
  "Cloud & DevOps":          "linear-gradient(135deg,#180800,#1e0e00)",
  "Cybersecurity":           "linear-gradient(135deg,#050a1f,#080f28)",
  "XR / Spatial Design":    "linear-gradient(135deg,#120010,#1a0018)",
  "Data Science":            "linear-gradient(135deg,#041520,#082030)",
}
const LEVEL_COLORS: Record<string, string> = {
  beginner:     C.green,
  intermediate: C.blue,
  advanced:     C.gold,
}

function getIcon(cat: string)  { return CATEGORY_ICONS[cat] ?? "📘" }
function getGrad(cat: string)  { return CAT_GRADIENTS[cat]  ?? "linear-gradient(135deg,#030810,#05101e)" }
function getLvlCol(lvl: string){ return LEVEL_COLORS[lvl]   ?? C.w40 }
function capFirst(s: string)   { return s ? s.charAt(0).toUpperCase() + s.slice(1) : "—" }

/* ════════════════════════════════════════════
   API FUNCTIONS
════════════════════════════════════════════ */
const api = {
  getCourses: ()                              => axios.get<Course[]>(`${API_BASE}/courses/`),
  createCourse: (data: CourseCreate)          => axios.post<Course>(`${API_BASE}/courses/`, data),
  // Add your update/delete endpoints when available:
  // updateCourse: (id: number, data: CourseCreate) => axios.put(`${API_BASE}/courses/${id}`, data),
  // deleteCourse: (id: number)                     => axios.delete(`${API_BASE}/courses/${id}`),
}

/* ════════════════════════════════════════════
   REUSABLE SMALL COMPONENTS
════════════════════════════════════════════ */
function Chip({ text, color }: { text: string; color: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 100,
      background: `${color}12`, border: `1px solid ${color}28`,
      fontFamily: "'Share Tech Mono', monospace", fontSize: 10,
      color, letterSpacing: "0.5px", textTransform: "uppercase", flexShrink: 0,
    }}>{text}</span>
  )
}

function ProgressBar({ pct, color = C.gold }: { pct: number; color?: string }) {
  const [w, setW] = useState(0)
  useEffect(() => { const t = setTimeout(() => setW(pct), 220); return () => clearTimeout(t) }, [pct])
  return (
    <div style={{ height: 4, borderRadius: 4, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${w}%`, borderRadius: 4, background: `linear-gradient(90deg,${color}80,${color})`, transition: "width 1.3s cubic-bezier(.22,1,.36,1)" }} />
    </div>
  )
}

function Card({ children, accent = C.gold, style = {}, noHover = false }: {
  children: React.ReactNode; accent?: string; style?: React.CSSProperties; noHover?: boolean
}) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => !noHover && setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background:     C.surf,
        border:         `1px solid ${hov ? accent + "35" : accent + "14"}`,
        borderRadius:   20,
        backdropFilter: "blur(28px) saturate(155%)",
        position:       "relative",
        overflow:       "hidden",
        transition:     "all .35s cubic-bezier(.22,1,.36,1)",
        transform:      hov && !noHover ? "translateY(-3px)" : "none",
        boxShadow:      hov && !noHover ? `0 20px 60px rgba(0,0,0,0.55), 0 0 28px ${accent}10` : "0 8px 40px rgba(0,0,0,0.45)",
        ...style,
      }}
    >
      <div style={{ position:"absolute",top:0,left:"8%",right:"8%",height:1,background:`linear-gradient(90deg,transparent,${accent}50,transparent)` }}/>
      {children}
    </div>
  )
}

/* ════════════════════════════════════════════
   FORM INPUT COMPONENTS
════════════════════════════════════════════ */
const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 11, padding: "11px 14px", color: C.w90,
  fontFamily: "'Raleway', sans-serif", fontSize: 14, outline: "none",
  transition: "all .2s", width: "100%",
}

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <label style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: C.w40, letterSpacing: "1.5px", textTransform: "uppercase" }}>
        {label} {required && <span style={{ color: C.gold }}>*</span>}
      </label>
      {children}
      {hint && <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: C.w30 }}>{hint}</div>}
    </div>
  )
}

/* ════════════════════════════════════════════
   PRICE ROW COMPONENT
════════════════════════════════════════════ */
function PriceRow({
  price, index, onChange, onRemove,
}: {
  price: CoursePrice; index: number
  onChange: (i: number, field: keyof CoursePrice, val: string) => void
  onRemove:  (i: number) => void
}) {
  const inp: React.CSSProperties = { ...inputStyle, padding: "8px 10px", fontSize: 13 }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 40px", gap: 10, padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>
      <input style={inp} placeholder="e.g. India"  value={price.country}  onChange={e => onChange(index, "country",  e.target.value)} />
      <input style={inp} placeholder="INR" maxLength={10} value={price.currency} onChange={e => onChange(index, "currency", e.target.value)} />
      <input style={inp} type="number" placeholder="0.00" min={0} step={0.01} value={price.price || ""} onChange={e => onChange(index, "price", e.target.value)} />
      <button
        onClick={() => onRemove(index)}
        style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(255,77,106,0.2)", background: "rgba(255,77,106,0.07)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.red, fontSize: 14, transition: "all .2s" }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,77,106,0.15)"; e.currentTarget.style.borderColor = "rgba(255,77,106,0.4)" }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,77,106,0.07)"; e.currentTarget.style.borderColor = "rgba(255,77,106,0.2)" }}
      >✕</button>
    </div>
  )
}

/* ════════════════════════════════════════════
   COURSE CARD (GRID)
════════════════════════════════════════════ */
function CourseCard({ course, onView, onEdit, onDelete }: {
  course: Course
  onView:   () => void
  onEdit:   () => void
  onDelete: () => void
}) {
  const isActive = course.is_active === "true"
  const lvlCol   = getLvlCol(course.level)
  const [hov, setHov] = useState(false)

  const actionBtn: React.CSSProperties = {
    flex: 1, padding: "8px 0", borderRadius: 10, border: "none", cursor: "pointer",
    fontFamily: "'Oxanium', sans-serif", fontSize: 12, fontWeight: 600,
    letterSpacing: "0.5px", transition: "all .25s", display: "flex",
    alignItems: "center", justifyContent: "center", gap: 6,
  }

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.surf, borderRadius: 20, overflow: "hidden",
        backdropFilter: "blur(28px)", border: `1px solid ${hov ? "rgba(255,185,0,0.28)" : "rgba(255,255,255,0.07)"}`,
        boxShadow: hov ? "0 24px 70px rgba(0,0,0,0.55), 0 0 28px rgba(255,185,0,0.08)" : "0 8px 40px rgba(0,0,0,0.4)",
        transition: "all .4s cubic-bezier(.22,1,.36,1)",
        transform: hov ? "translateY(-6px) scale(1.008)" : "none",
        cursor: "pointer",
      }}
    >
      {/* Thumbnail */}
      <div style={{ height: 155, background: getGrad(course.category), position: "relative", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, overflow: "hidden" }}>
        {course.thumbnail
          ? <img src={course.thumbnail} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ position: "relative", zIndex: 1 }}>{getIcon(course.category)}</span>
        }
        <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.06) 3px,rgba(0,0,0,0.06) 4px)" }} />

        {/* Status badge */}
        <div style={{
          position: "absolute", top: 12, right: 12, padding: "4px 11px", borderRadius: 100,
          fontFamily: "'Share Tech Mono', monospace", fontSize: 9, letterSpacing: ".8px", textTransform: "uppercase",
          backdropFilter: "blur(8px)",
          background: isActive ? "rgba(0,229,160,0.15)" : "rgba(255,77,106,0.12)",
          border: `1px solid ${isActive ? "rgba(0,229,160,0.3)" : "rgba(255,77,106,0.25)"}`,
          color: isActive ? C.green : C.red,
        }}>{isActive ? "Active" : "Inactive"}</div>

        {/* Level badge */}
        {course.level && (
          <div style={{
            position: "absolute", top: 12, left: 12, padding: "4px 10px", borderRadius: 100,
            fontFamily: "'Share Tech Mono', monospace", fontSize: 9, letterSpacing: ".8px", textTransform: "uppercase",
            backdropFilter: "blur(8px)",
            background: `${lvlCol}18`, border: `1px solid ${lvlCol}35`, color: lvlCol,
          }}>{capFirst(course.level)}</div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: 18 }}>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: lvlCol, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
          {course.category || "Uncategorized"}
        </div>
        <div style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 700, fontSize: 16, color: C.w90, lineHeight: 1.3, marginBottom: 6 }}>
          {course.title}
        </div>
        <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: 12, color: C.w40, lineHeight: 1.6, marginBottom: 14, fontWeight: 300, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {course.description || "No description provided."}
        </div>

        {/* Meta */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
          {course.duration && <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: 12, color: C.w40, display: "flex", alignItems: "center", gap: 5 }}>⏱ {course.duration}</span>}
          <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: 12, color: C.w40 }}>💰 {course.prices.length} price{course.prices.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Prices */}
        {course.prices.length > 0 ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {course.prices.slice(0, 3).map((p, i) => (
              <span key={i} style={{ padding: "4px 10px", borderRadius: 8, fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: C.gold, background: "rgba(255,185,0,0.08)", border: "1px solid rgba(255,185,0,0.18)" }}>
                {p.currency} {Number(p.price).toLocaleString()}
              </span>
            ))}
            {course.prices.length > 3 && <span style={{ padding: "4px 10px", borderRadius: 8, fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: C.gold, background: "rgba(255,185,0,0.08)", border: "1px solid rgba(255,185,0,0.18)" }}>+{course.prices.length - 3}</span>}
          </div>
        ) : (
          <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: 12, color: C.w30, marginBottom: 14 }}>No pricing set</div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={(e) => { e.stopPropagation(); onView() }}
            style={{ ...actionBtn, flex: 1, background: C.w04, border: `1px solid ${C.w10}`, color: C.w60 }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(26,150,255,0.12)"; e.currentTarget.style.borderColor = "rgba(26,150,255,0.3)"; e.currentTarget.style.color = C.blue }}
            onMouseLeave={e => { e.currentTarget.style.background = C.w04; e.currentTarget.style.borderColor = C.w10; e.currentTarget.style.color = C.w60 }}
          >👁 View</button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit() }}
            style={{ ...actionBtn, flex: 1, background: "rgba(255,185,0,0.08)", border: "1px solid rgba(255,185,0,0.2)", color: C.gold }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,185,0,0.16)"; e.currentTarget.style.borderColor = "rgba(255,185,0,0.4)" }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,185,0,0.08)"; e.currentTarget.style.borderColor = "rgba(255,185,0,0.2)" }}
          >✎ Edit</button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            style={{ ...actionBtn, width: 36, flex: "none", background: "rgba(255,77,106,0.07)", border: "1px solid rgba(255,77,106,0.18)", color: C.red }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,77,106,0.15)"; e.currentTarget.style.borderColor = "rgba(255,77,106,0.35)" }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,77,106,0.07)"; e.currentTarget.style.borderColor = "rgba(255,77,106,0.18)" }}
          >🗑</button>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   FORM DIALOG  (Add + Edit)
════════════════════════════════════════════ */
const EMPTY_FORM: CourseCreate = {
  title: "", slug: "", description: "", level: "", duration: "",
  thumbnail: "", category: "", is_active: "true", prices: [],
}

function CourseFormDialog({ mode, initial, onClose, onSubmit, loading }: {
  mode:     "add" | "edit"
  initial:  CourseCreate
  onClose:  () => void
  onSubmit: (data: CourseCreate) => void
  loading:  boolean
}) {
  const [form,   setForm]   = useState<CourseCreate>(initial)
  const [prices, setPrices] = useState<CoursePrice[]>(initial.prices ?? [])
  const [err,    setErr]    = useState("")

  useEffect(() => { setForm(initial); setPrices(initial.prices ?? []) }, [initial])

  const set = (k: keyof CourseCreate, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    if (k === "title" && mode === "add") {
      setForm(f => ({
        ...f,
        slug: v.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-"),
      }))
    }
  }

  const updatePrice = (i: number, field: keyof CoursePrice, val: string) => {
    setPrices(p => p.map((row, idx) => idx === i ? { ...row, [field]: field === "price" ? parseFloat(val) || 0 : val } : row))
  }
  const addPrice    = () => setPrices(p => [...p, { country: "", currency: "", price: 0 }])
  const removePrice = (i: number) => setPrices(p => p.filter((_, idx) => idx !== i))

  const submit = () => {
    setErr("")
    if (!form.title.trim()) { setErr("Course title is required"); return }
    if (!form.slug.trim())  { setErr("Slug is required"); return }
    if (!form.level)        { setErr("Please select a level"); return }
    onSubmit({ ...form, prices })
  }

  const labelStyle: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: C.w40, letterSpacing: "1.5px", textTransform: "uppercase" }
  const sectionTitle = (t: string) => (
    <div style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 700, fontSize: 14, color: C.w80, display: "flex", alignItems: "center", gap: 10, marginTop: 20, marginBottom: 14 }}>
      {t}
      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(255,255,255,0.1),transparent)" }} />
    </div>
  )

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(2,8,16,0.82)", backdropFilter: "blur(6px)", zIndex: 500, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px", overflowY: "auto" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: "rgba(5,14,32,0.97)", border: "1px solid rgba(255,185,0,0.18)", borderRadius: 24, backdropFilter: "blur(48px)", width: "100%", maxWidth: 760, position: "relative", margin: "auto", boxShadow: "0 32px 90px rgba(0,0,0,0.75), 0 0 80px rgba(255,185,0,0.05)" }}>
        {/* Top sheen */}
        <div style={{ position: "absolute", top: 0, left: "8%", right: "8%", height: 1, background: "linear-gradient(90deg,transparent,rgba(255,185,0,0.55),transparent)" }} />

        {/* Header */}
        <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, background: "linear-gradient(135deg,rgba(255,185,0,0.18),rgba(255,185,0,0.08))", border: "1px solid rgba(255,185,0,0.3)" }}>
              {mode === "add" ? "✚" : "✎"}
            </div>
            <div>
              <div style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 700, fontSize: 20, color: C.w90 }}>{mode === "add" ? "Add New Course" : "Edit Course"}</div>
              <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: 13, color: C.w40, marginTop: 3, fontWeight: 300 }}>
                {mode === "add" ? "Fill in all fields to create a new course" : `Editing: ${initial.title}`}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 9, border: `1px solid ${C.w10}`, background: C.w04, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.w50, fontSize: 18, transition: "all .2s", flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,77,106,0.1)"; e.currentTarget.style.borderColor = "rgba(255,77,106,0.3)"; e.currentTarget.style.color = C.red }}
            onMouseLeave={e => { e.currentTarget.style.background = C.w04; e.currentTarget.style.borderColor = C.w10; e.currentTarget.style.color = C.w50 }}
          >✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 28px" }}>
          {err && (
            <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,77,106,0.1)", border: "1px solid rgba(255,77,106,0.25)", color: C.red, fontFamily: "'Raleway', sans-serif", fontSize: 13, marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
              ⚠ {err}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 18px" }}>
            {/* Title */}
            <div style={{ gridColumn: "1/-1" }}>
              <Field label="Course Title" required hint="Max 200 characters · Auto-generates slug">
                <input style={inputStyle} value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Advanced Neural Networks" maxLength={200}
                  onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,185,0,0.45)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,185,0,0.07)" }}
                  onBlur={e  => { e.currentTarget.style.borderColor = C.w10; e.currentTarget.style.boxShadow = "none" }} />
              </Field>
            </div>

            {/* Slug */}
            <Field label="Slug" required>
              <input style={inputStyle} value={form.slug} onChange={e => set("slug", e.target.value)} placeholder="advanced-neural-networks" maxLength={200}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,185,0,0.45)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,185,0,0.07)" }}
                onBlur={e  => { e.currentTarget.style.borderColor = C.w10; e.currentTarget.style.boxShadow = "none" }} />
            </Field>

            {/* Category */}
            <Field label="Category" required>
              <input style={inputStyle} value={form.category} onChange={e => set("category", e.target.value)} placeholder="e.g. AI / Machine Learning" list="cat-options" maxLength={100}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,185,0,0.45)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,185,0,0.07)" }}
                onBlur={e  => { e.currentTarget.style.borderColor = C.w10; e.currentTarget.style.boxShadow = "none" }} />
              <datalist id="cat-options">
                {Object.keys(CATEGORY_ICONS).map(c => <option key={c} value={c} />)}
              </datalist>
            </Field>

            {/* Level */}
            <Field label="Level" required>
              <select style={{ ...inputStyle, cursor: "pointer" }} value={form.level} onChange={e => set("level", e.target.value)}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,185,0,0.45)" }}
                onBlur={e  => { e.currentTarget.style.borderColor = C.w10 }}>
                <option value="">Select level…</option>
                <option value="beginner">🌱 Beginner</option>
                <option value="intermediate">⚡ Intermediate</option>
                <option value="advanced">🔥 Advanced</option>
              </select>
            </Field>

            {/* Duration */}
            <Field label="Duration">
              <input style={inputStyle} value={form.duration} onChange={e => set("duration", e.target.value)} placeholder="e.g. 24 hours, 8 weeks" maxLength={50}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,185,0,0.45)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,185,0,0.07)" }}
                onBlur={e  => { e.currentTarget.style.borderColor = C.w10; e.currentTarget.style.boxShadow = "none" }} />
            </Field>

            {/* Thumbnail */}
            <div style={{ gridColumn: "1/-1" }}>
              <Field label="Thumbnail URL" hint="Paste image URL or leave blank for default emoji thumbnail">
                <input style={inputStyle} value={form.thumbnail} onChange={e => set("thumbnail", e.target.value)} placeholder="https://cdn.lumina.io/thumbs/course.png" maxLength={300}
                  onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,185,0,0.45)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,185,0,0.07)" }}
                  onBlur={e  => { e.currentTarget.style.borderColor = C.w10; e.currentTarget.style.boxShadow = "none" }} />
              </Field>
            </div>

            {/* Description */}
            <div style={{ gridColumn: "1/-1" }}>
              <Field label="Description">
                <textarea style={{ ...inputStyle, minHeight: 88, resize: "vertical", lineHeight: 1.6 }}
                  value={form.description} onChange={e => set("description", e.target.value)}
                  placeholder="Write a clear, engaging description of what students will learn…"
                  maxLength={2000}
                  onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,185,0,0.45)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,185,0,0.07)" }}
                  onBlur={e  => { e.currentTarget.style.borderColor = C.w10; e.currentTarget.style.boxShadow = "none" }} />
              </Field>
            </div>

            {/* Active toggle */}
            <div style={{ gridColumn: "1/-1" }}>
              <Field label="Visibility">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 12, background: C.w04, border: `1px solid ${C.w08}` }}>
                  <div>
                    <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: 14, fontWeight: 500, color: C.w80 }}>Course is Active</div>
                    <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: 12, color: C.w40 }}>Active courses are visible and enrollable by students</div>
                  </div>
                  <label style={{ position: "relative", width: 44, height: 24, cursor: "pointer", flexShrink: 0 }}>
                    <input type="checkbox" checked={form.is_active === "true"} onChange={e => set("is_active", e.target.checked ? "true" : "false")} style={{ opacity: 0, width: 0, height: 0 }} />
                    <div style={{ position: "absolute", inset: 0, borderRadius: 12, background: form.is_active === "true" ? C.gold : "rgba(255,255,255,0.1)", transition: "background .25s" }} />
                    <div style={{ position: "absolute", top: 3, left: 3, width: 18, height: 18, borderRadius: "50%", background: "white", transition: "transform .25s, box-shadow .25s", transform: form.is_active === "true" ? "translateX(20px)" : "none", boxShadow: form.is_active === "true" ? "0 0 8px rgba(255,185,0,0.5)" : "0 2px 4px rgba(0,0,0,0.3)" }} />
                  </label>
                </div>
              </Field>
            </div>
          </div>

          {/* Prices */}
          {sectionTitle("💰 Pricing by Country")}
          <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden", marginBottom: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 40px", gap: 10, padding: "10px 14px", background: C.w04, borderBottom: "1px solid rgba(255,255,255,0.08)", fontFamily: "'Share Tech Mono', monospace", fontSize: 9, color: C.w30, textTransform: "uppercase", letterSpacing: "1px" }}>
              <div>Country</div><div>Currency</div><div>Price</div><div />
            </div>
            {prices.length > 0
              ? prices.map((p, i) => <PriceRow key={i} price={p} index={i} onChange={updatePrice} onRemove={removePrice} />)
              : <div style={{ padding: "20px", textAlign: "center", fontFamily: "'Raleway', sans-serif", fontSize: 13, color: C.w30 }}>No prices added yet</div>
            }
          </div>
          <button onClick={addPrice} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 10, border: "1px dashed rgba(255,185,0,0.25)", background: "rgba(255,185,0,0.03)", color: C.gold, fontFamily: "'Raleway', sans-serif", fontSize: 13, cursor: "pointer", transition: "all .2s", width: "100%", justifyContent: "center" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,185,0,0.08)"; e.currentTarget.style.borderColor = "rgba(255,185,0,0.4)" }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,185,0,0.03)"; e.currentTarget.style.borderColor = "rgba(255,185,0,0.25)" }}
          >+ Add Country Price</button>
        </div>

        {/* Footer */}
        <div style={{ padding: "18px 28px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 100, border: `1px solid ${C.w15}`, background: C.w04, color: C.w70, cursor: "pointer", fontFamily: "'Oxanium', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: ".5px", transition: "all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = C.w08; e.currentTarget.style.color = C.w90 }}
            onMouseLeave={e => { e.currentTarget.style.background = C.w04; e.currentTarget.style.color = C.w70 }}
          >Cancel</button>
          <button onClick={submit} disabled={loading} style={{ padding: "10px 24px", borderRadius: 100, border: "none", background: loading ? "rgba(255,185,0,0.4)" : "linear-gradient(135deg,#ffc933,#ffad00)", color: "#020810", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Oxanium', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: ".5px", boxShadow: loading ? "none" : "0 0 24px rgba(255,185,0,0.35)", transition: "all .2s", display: "flex", alignItems: "center", gap: 8 }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 36px rgba(255,185,0,0.55)" } }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = loading ? "none" : "0 0 24px rgba(255,185,0,0.35)" }}
          >
            {loading ? <><span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#020810", animation: "lu-spin .8s linear infinite", display: "inline-block" }} />Saving…</> : mode === "add" ? "Create Course" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   VIEW DIALOG
════════════════════════════════════════════ */
function ViewDialog({ course, onClose, onEdit }: { course: Course; onClose: () => void; onEdit: () => void }) {
  const isActive = course.is_active === "true"
  const lvlCol   = getLvlCol(course.level)

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(2,8,16,0.82)", backdropFilter: "blur(6px)", zIndex: 500, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px", overflowY: "auto" }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: "rgba(5,14,32,0.97)", border: "1px solid rgba(255,185,0,0.18)", borderRadius: 24, backdropFilter: "blur(48px)", width: "100%", maxWidth: 760, position: "relative", margin: "auto", boxShadow: "0 32px 90px rgba(0,0,0,0.75)" }}>
        <div style={{ position: "absolute", top: 0, left: "8%", right: "8%", height: 1, background: "linear-gradient(90deg,transparent,rgba(255,185,0,0.55),transparent)" }} />

        {/* Header */}
        <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, background: "rgba(255,185,0,0.1)", border: "1px solid rgba(255,185,0,0.25)" }}>👁</div>
            <div>
              <div style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 700, fontSize: 20, color: C.w90 }}>Course Details</div>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: C.w40, marginTop: 3, letterSpacing: "0.5px" }}>{course.slug}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 9, border: `1px solid ${C.w10}`, background: C.w04, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.w50, fontSize: 18, transition: "all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,77,106,0.1)"; e.currentTarget.style.color = C.red }}
            onMouseLeave={e => { e.currentTarget.style.background = C.w04; e.currentTarget.style.color = C.w50 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 28px" }}>
          {/* Thumb */}
          <div style={{ height: 180, background: getGrad(course.category), borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 68, marginBottom: 20, position: "relative", overflow: "hidden" }}>
            {course.thumbnail ? <img src={course.thumbnail} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ position: "relative", zIndex: 1 }}>{getIcon(course.category)}</span>}
            <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.06) 3px,rgba(0,0,0,0.06) 4px)" }} />
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            <Chip text={course.category || "Uncategorized"} color={C.gold} />
            {course.level && <Chip text={capFirst(course.level)} color={lvlCol} />}
            <Chip text={isActive ? "Active" : "Inactive"} color={isActive ? C.green : C.red} />
          </div>

          <div style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 800, fontSize: 22, color: C.w90, marginBottom: 12, letterSpacing: "-.3px" }}>{course.title}</div>
          {course.description && <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: 14, color: C.w60, lineHeight: 1.75, padding: 14, borderRadius: 12, background: C.w04, border: `1px solid ${C.w08}`, marginBottom: 20, fontWeight: 300 }}>{course.description}</div>}

          {/* Meta grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12, marginBottom: 20 }}>
            {[
              { lbl: "Slug",     val: course.slug,     style: { fontFamily: "'Share Tech Mono', monospace", fontSize: 12, color: C.gold } },
              { lbl: "Duration", val: course.duration || "—" },
              { lbl: "Level",    val: capFirst(course.level) || "—", style: { color: lvlCol } },
              { lbl: "Status",   val: isActive ? "Active" : "Inactive", style: { color: isActive ? C.green : C.red } },
              { lbl: "UUID",     val: course.uuid || String(course.id), style: { fontFamily: "'Share Tech Mono', monospace", fontSize: 11, wordBreak: "break-all" as const } },
              { lbl: "Thumbnail", val: course.thumbnail || "Default", style: { fontSize: 12, color: C.w40, wordBreak: "break-all" as const } },
            ].map((m, i) => (
              <div key={i} style={{ padding: "12px 14px", borderRadius: 12, background: C.w04, border: `1px solid ${C.w08}` }}>
                <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, color: C.w30, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 5 }}>{m.lbl}</div>
                <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: 14, fontWeight: 600, color: C.w90, ...m.style }}>{m.val}</div>
              </div>
            ))}
          </div>

          {/* Prices */}
          {course.prices.length > 0 && (
            <>
              <div style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 700, fontSize: 14, color: C.w80, display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                💰 Pricing
                <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(255,255,255,0.1),transparent)" }} />
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {course.prices.map((p, i) => (
                  <div key={i} style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(255,185,0,0.07)", border: "1px solid rgba(255,185,0,0.18)", minWidth: 120 }}>
                    <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, color: "rgba(255,185,0,0.5)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 5 }}>{p.country}</div>
                    <div style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 700, fontSize: 20, color: C.gold }}>{p.currency} {Number(p.price).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "18px 28px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 100, border: `1px solid ${C.w15}`, background: C.w04, color: C.w70, cursor: "pointer", fontFamily: "'Oxanium', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: ".5px", transition: "all .2s" }}>Close</button>
          <button onClick={onEdit}  style={{ padding: "10px 24px", borderRadius: 100, border: "none", background: "linear-gradient(135deg,#ffc933,#ffad00)", color: "#020810", cursor: "pointer", fontFamily: "'Oxanium', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: ".5px", boxShadow: "0 0 24px rgba(255,185,0,0.35)", transition: "all .2s" }}>✎ Edit This Course</button>
        </div>
      </div>
    </div>
  )
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
   MAIN PAGE
════════════════════════════════════════════ */
export default function AdminCoursesPage() {
  const { toasts, show: showToast } = useToast()

  const [courses,  setCourses]  = useState<Course[]>([])
  const [filtered, setFiltered] = useState<Course[]>([])
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [view,     setView]     = useState<"grid"|"list">("grid")

  const [search,    setSearch]    = useState("")
  const [filterLvl, setFilterLvl] = useState("")
  const [filterSta, setFilterSta] = useState("")
  const [filterCat, setFilterCat] = useState("")

  const [dialog,      setDialog]      = useState<"add"|"edit"|"view"|"del"|null>(null)
  const [activeCourse, setActiveCourse] = useState<Course | null>(null)

  /* ── Load courses ── */
  const loadCourses = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.getCourses()
      setCourses(res.data)
    } catch {
      showToast("Failed to load courses. Showing demo data.", "error")
      // Fallback demo data
      setCourses([
        { id:1, uuid:"c1", title:"Neural Networks & Deep Learning", slug:"neural-networks-deep-learning", description:"A comprehensive deep learning course.", level:"advanced", duration:"48 hours", thumbnail:"", category:"AI / Machine Learning", is_active:"true", prices:[{country:"India",currency:"INR",price:4999},{country:"USA",currency:"USD",price:79}] },
        { id:2, uuid:"c2", title:"Full-Stack Web Development",       slug:"fullstack-web-dev",            description:"Master React, Node.js, PostgreSQL.",       level:"intermediate", duration:"36 hours", thumbnail:"", category:"Web Development", is_active:"true", prices:[{country:"India",currency:"INR",price:3499}] },
        { id:3, uuid:"c3", title:"Cloud Infrastructure & DevOps",    slug:"cloud-devops",                 description:"AWS, Docker, Kubernetes and CI/CD.",       level:"intermediate", duration:"30 hours", thumbnail:"", category:"Cloud & DevOps",  is_active:"false", prices:[] },
      ])
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { loadCourses() }, [loadCourses])

  /* ── Filter ── */
  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(courses.filter(c => {
      const mQ   = !q   || c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q) || (c.category||"").toLowerCase().includes(q)
      const mLvl = !filterLvl || c.level     === filterLvl
      const mSta = !filterSta || c.is_active === filterSta
      const mCat = !filterCat || c.category  === filterCat
      return mQ && mLvl && mSta && mCat
    }))
  }, [courses, search, filterLvl, filterSta, filterCat])

  const categories = [...new Set(courses.map(c => c.category))].sort()

  /* ── Submit ── */
  const handleSubmit = async (data: CourseCreate) => {
    setSaving(true)
    try {
      if (dialog === "add") {
        const res = await api.createCourse(data)
        setCourses(c => [...c, res.data])
        showToast("Course created successfully!", "success")
      } else {
        // PUT /courses/{id} — plug in your update endpoint
        setCourses(c => c.map(x => x.id === activeCourse?.id ? { ...x, ...data } : x))
        showToast("Course updated successfully!", "success")
      }
      setDialog(null)
    } catch {
      showToast("Failed to save course. Please try again.", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = () => {
    if (!activeCourse) return
    // DELETE /courses/{activeCourse.id}
    setCourses(c => c.filter(x => x.id !== activeCourse.id))
    setDialog(null)
    showToast("Course deleted.", "info")
  }

  /* ── Stats ── */
  const stats = [
    { icon:"📘", val: courses.length,                              label:"Total Courses",  color: C.blue   },
    { icon:"✅", val: courses.filter(c=>c.is_active==="true").length, label:"Active",      color: C.green  },
    { icon:"🚫", val: courses.filter(c=>c.is_active!=="true").length, label:"Inactive",    color: C.red    },
    { icon:"🏷️", val: categories.length,                           label:"Categories",     color: C.gold   },
    { icon:"💰", val: courses.filter(c=>c.prices.length>0).length,   label:"With Pricing",color: C.purple },
  ]

  /* ── Form initial ── */
  const formInitial: CourseCreate = dialog === "edit" && activeCourse
    ? { title: activeCourse.title, slug: activeCourse.slug, description: activeCourse.description, level: activeCourse.level, duration: activeCourse.duration, thumbnail: activeCourse.thumbnail, category: activeCourse.category, is_active: activeCourse.is_active, prices: activeCourse.prices }
    : EMPTY_FORM

  const inputStyle2: React.CSSProperties = { background: "rgba(5,14,32,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "9px 14px", color: C.w90, fontFamily: "'Raleway', sans-serif", fontSize: 13, outline: "none", transition: "all .2s" }
  const selStyle: React.CSSProperties   = { ...inputStyle2, cursor: "pointer" }

  return (
    <>
      <LuminaBackground />
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 1 }}>
        <div style={{ position: "absolute", width: "100%", height: 1, background: "linear-gradient(90deg,transparent,rgba(255,185,0,0.05),rgba(255,185,0,0.1),rgba(255,185,0,0.05),transparent)", animation: "lu-scan 18s linear infinite" }} />
      </div>

      <div style={{ display: "flex", height: "100vh", overflow: "hidden", position: "relative", zIndex: 2 }}>
        <LuminaSideNav role="admin"/>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          <LuminaTopBar role="admin" />

          <div style={{ flex: 1, overflowY: "auto", padding: "22px 24px 44px" }}>
            <div style={{ maxWidth: 1440, margin: "0 auto" }}>

              {/* PAGE HEADER */}
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
                <div>
                  <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: C.gold, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 16, height: 1, background: C.gold, opacity: .6, display: "inline-block" }} />
                    Learning · Catalogue
                  </div>
                  <h1 style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 800, fontSize: "clamp(22px,3vw,32px)", color: C.w90, letterSpacing: "-.5px", margin: 0, lineHeight: 1.1 }}>Courses</h1>
                  <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: 14, color: C.w50, margin: "5px 0 0", fontWeight: 300 }}>Manage all learning content — create, edit and publish courses</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={loadCourses} style={{ padding: "9px 16px", borderRadius: 100, border: `1px solid ${C.w15}`, background: C.w04, color: C.w60, cursor: "pointer", fontFamily: "'Oxanium', sans-serif", fontSize: 12, fontWeight: 600, transition: "all .2s" }}
                    onMouseEnter={e => e.currentTarget.style.color = C.w90} onMouseLeave={e => e.currentTarget.style.color = C.w60}>↺ Refresh</button>
                  <button onClick={() => { setActiveCourse(null); setDialog("add") }} style={{ padding: "10px 22px", borderRadius: 100, border: "none", background: "linear-gradient(135deg,#ffc933,#ffad00)", color: "#020810", cursor: "pointer", fontFamily: "'Oxanium', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: ".5px", boxShadow: "0 0 24px rgba(255,185,0,0.35)", transition: "all .25s" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 36px rgba(255,185,0,0.55)" }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 0 24px rgba(255,185,0,0.35)" }}>+ Add Course</button>
                </div>
              </div>

              {/* STATS ROW */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))", gap: 14, marginBottom: 22 }}>
                {stats.map((s, i) => (
                  <div key={i} style={{ background: C.surf, borderRadius: 16, padding: "16px 18px", backdropFilter: "blur(24px)", border: `1px solid ${s.color}18`, transition: "all .3s cubic-bezier(.22,1,.36,1)", cursor: "default" }}>
                    <div style={{ fontSize: 18, marginBottom: 10 }}>{s.icon}</div>
                    <div style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 700, fontSize: 26, color: s.color, lineHeight: 1, marginBottom: 3 }}>{s.val}</div>
                    <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: 12, color: C.w50 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* TOOLBAR */}
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: C.w40, pointerEvents: "none" }}>🔍</span>
                  <input style={{ ...inputStyle2, paddingLeft: 40, width: "100%" }} placeholder="Search by title, category, slug…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select style={selStyle} value={filterLvl} onChange={e => setFilterLvl(e.target.value)}>
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <select style={selStyle} value={filterSta} onChange={e => setFilterSta(e.target.value)}>
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                <select style={selStyle} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {/* View toggle */}
                <div style={{ display: "flex", border: `1px solid ${C.w10}`, borderRadius: 10, overflow: "hidden", background: C.surf }}>
                  {(["grid","list"] as const).map(v => (
                    <button key={v} onClick={() => setView(v)} style={{ padding: "9px 13px", fontSize: 16, cursor: "pointer", background: view === v ? "rgba(255,185,0,0.12)" : "transparent", border: "none", color: view === v ? C.gold : C.w40, transition: "all .2s" }}>
                      {v === "grid" ? "⊞" : "☰"}
                    </button>
                  ))}
                </div>
              </div>

              {/* RESULT COUNT */}
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: C.w30, letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 16 }}>
                {loading ? "Loading…" : `${filtered.length} course${filtered.length !== 1 ? "s" : ""} found`}
              </div>

              {/* COURSES */}
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid rgba(255,185,0,0.2)", borderTopColor: C.gold, animation: "lu-spin .8s linear infinite" }} />
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 24px", textAlign: "center" }}>
                  <div style={{ fontSize: 56, marginBottom: 20, opacity: .6 }}>◈</div>
                  <div style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 700, fontSize: 20, color: C.w60, marginBottom: 8 }}>No courses found</div>
                  <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: 14, color: C.w30, maxWidth: 320 }}>Try adjusting your search or filters, or add a new course.</div>
                </div>
              ) : view === "grid" ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 18 }}>
                  {filtered.map(c => (
                    <CourseCard
                      key={c.id} course={c}
                      onView={()   => { setActiveCourse(c); setDialog("view") }}
                      onEdit={()   => { setActiveCourse(c); setDialog("edit") }}
                      onDelete={()  => { setActiveCourse(c); setDialog("del")  }}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {filtered.map(c => {
                    const lvlCol = getLvlCol(c.level); const isActive = c.is_active === "true"
                    return (
                      <div key={c.id} style={{ background: C.surf, borderRadius: 16, border: `1px solid ${C.w08}`, backdropFilter: "blur(24px)", display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", transition: "all .25s", cursor: "pointer", flexWrap: "wrap" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,185,0,0.22)"; e.currentTarget.style.transform = "translateX(3px)" }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = C.w08; e.currentTarget.style.transform = "none" }}
                      >
                        <div style={{ width: 58, height: 58, borderRadius: 12, background: getGrad(c.category), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{getIcon(c.category)}</div>
                        <div style={{ flex: 1, minWidth: 160 }}>
                          <div style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 700, fontSize: 15, color: C.w90, marginBottom: 3 }}>{c.title}</div>
                          <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: 12, color: C.w40, marginBottom: 6 }}>{c.slug}</div>
                          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                            <Chip text={capFirst(c.level) || "—"}          color={lvlCol} />
                            <Chip text={c.category || "—"}                  color={C.gold} />
                            <Chip text={isActive ? "Active" : "Inactive"}   color={isActive ? C.green : C.red} />
                          </div>
                        </div>
                        <div style={{ textAlign: "center", minWidth: 70 }}>
                          <div style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 700, fontSize: 15, color: C.w90 }}>{c.duration || "—"}</div>
                          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, color: C.w30, textTransform: "uppercase", letterSpacing: ".5px" }}>Duration</div>
                        </div>
                        <div style={{ textAlign: "center", minWidth: 60 }}>
                          <div style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 700, fontSize: 15, color: C.w90 }}>{c.prices.length}</div>
                          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, color: C.w30, textTransform: "uppercase", letterSpacing: ".5px" }}>Prices</div>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                          <button onClick={() => { setActiveCourse(c); setDialog("view") }} style={{ padding: "7px 14px", borderRadius: 10, border: `1px solid ${C.w10}`, background: C.w04, color: C.w60, cursor: "pointer", fontFamily: "'Oxanium', sans-serif", fontSize: 12, fontWeight: 600, transition: "all .2s" }}>👁 View</button>
                          <button onClick={() => { setActiveCourse(c); setDialog("edit") }} style={{ padding: "7px 14px", borderRadius: 10, border: "1px solid rgba(255,185,0,0.2)", background: "rgba(255,185,0,0.08)", color: C.gold, cursor: "pointer", fontFamily: "'Oxanium', sans-serif", fontSize: 12, fontWeight: 600, transition: "all .2s" }}>✎ Edit</button>
                          <button onClick={() => { setActiveCourse(c); setDialog("del") }} style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid rgba(255,77,106,0.18)", background: "rgba(255,77,106,0.07)", color: C.red, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}>🗑</button>
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
        <CourseFormDialog
          mode={dialog}
          initial={formInitial}
          onClose={() => setDialog(null)}
          onSubmit={handleSubmit}
          loading={saving}
        />
      )}
      {dialog === "view" && activeCourse && (
        <ViewDialog
          course={activeCourse}
          onClose={() => setDialog(null)}
          onEdit={() => setDialog("edit")}
        />
      )}
      {dialog === "del" && activeCourse && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(2,8,16,0.82)", backdropFilter: "blur(6px)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={e => { if (e.target === e.currentTarget) setDialog(null) }}>
          <div style={{ background: "rgba(5,14,32,0.97)", border: "1px solid rgba(255,77,106,0.25)", borderRadius: 24, backdropFilter: "blur(48px)", maxWidth: 420, width: "100%", padding: "32px 28px 24px", textAlign: "center", boxShadow: "0 32px 90px rgba(0,0,0,0.75)" }}>
            <div style={{ fontSize: 44, marginBottom: 16 }}>🗑️</div>
            <div style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 700, fontSize: 20, color: C.w90, marginBottom: 10 }}>Delete Course</div>
            <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: 14, color: C.w50, lineHeight: 1.65, fontWeight: 300, marginBottom: 24 }}>
              Are you sure you want to delete <span style={{ color: C.red, fontWeight: 600 }}>"{activeCourse.title}"</span>?<br />This action cannot be undone.
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => setDialog(null)} style={{ padding: "10px 22px", borderRadius: 100, border: `1px solid ${C.w15}`, background: C.w04, color: C.w70, cursor: "pointer", fontFamily: "'Oxanium', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: ".5px", transition: "all .2s" }}>Cancel</button>
              <button onClick={handleDelete} style={{ padding: "10px 22px", borderRadius: 100, border: "1px solid rgba(255,77,106,0.3)", background: "rgba(255,77,106,0.12)", color: C.red, cursor: "pointer", fontFamily: "'Oxanium', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: ".5px", transition: "all .2s" }}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* TOASTS */}
      <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 1000, display: "flex", flexDirection: "column", gap: 10 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            padding: "12px 18px", borderRadius: 14, backdropFilter: "blur(24px)",
            fontFamily: "'Raleway', sans-serif", fontSize: 14, fontWeight: 500,
            display: "flex", alignItems: "center", gap: 10, minWidth: 280,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            background:   t.type==="success" ? "rgba(0,229,160,0.12)" : t.type==="error" ? "rgba(255,77,106,0.12)" : "rgba(255,185,0,0.1)",
            border:       t.type==="success" ? "1px solid rgba(0,229,160,0.3)" : t.type==="error" ? "1px solid rgba(255,77,106,0.3)" : "1px solid rgba(255,185,0,0.28)",
            color:        t.type==="success" ? C.green : t.type==="error" ? C.red : C.gold,
          }}>
            <span>{t.type==="success"?"✅":t.type==="error"?"⛔":"◉"}</span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@400;500;600;700;800&family=Raleway:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap');
        *, *::before, *::after { box-sizing:border-box; }
        html, body { background:#020810; margin:0; height:100%; }
        input::placeholder, textarea::placeholder { color:rgba(200,220,255,0.22); font-family:'Raleway',sans-serif; }
        input:-webkit-autofill { -webkit-box-shadow:0 0 0 100px #050d1e inset !important; -webkit-text-fill-color:#e8f4ff !important; }
        @keyframes lu-scan  { from{transform:translateY(-100vh)} to{transform:translateY(200vh)} }
        @keyframes lu-spin  { to{transform:rotate(360deg)} }
        @keyframes lu-reveal{ from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        ::-webkit-scrollbar       { width:4px;height:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(255,185,0,0.2);border-radius:4px; }
        @media (max-width:600px) { .hide-mobile { display:none !important; } }
      `}</style>
    </>
  )
}

declare module "react" { interface CSSProperties { [key: string]: any } }