"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

type Role = "student" | "trainer" | "admin"

interface NavItem {
  id: string
  icon: string
  label: string
  href: string
  badge?: string | number
}

const NAV: Record<Role, NavItem[]> = {
  student: [
    { id:"dashboard",    icon:"🌌", label:"Cosmos Hub",      href:"/student/dashboard" },
    { id:"courses",      icon:"🪐", label:"Course Worlds",   href:"/student/courses" },
    { id:"sessions",     icon:"⚡", label:"Live Sessions",   href:"/student/sessions" },
    { id:"assignments",  icon:"📡", label:"Assignments",     href:"/student/assignments" },
    { id:"progress",     icon:"🗺", label:"Progress Map",    href:"/student/progress" },
    { id:"attendance",   icon:"◎",  label:"Attendance",      href:"/student/attendance" },
    { id:"leaderboard",  icon:"🌟", label:"Galaxy Rank",     href:"/student/leaderboard" },
    { id:"ai-tutor",     icon:"◉",  label:"ARIA AI Tutor",   href:"/student/ai-tutor" },
    { id:"profile",      icon:"◈",  label:"Profile",         href:"/student/profile" },
  ],
  trainer: [
    { id:"dashboard",   icon:"⬢",  label:"Command Bridge",  href:"/trainer/dashboard" },
    { id:"sessions",    icon:"⚡",  label:"My Sessions",     href:"/trainer/sessions" },
    { id:"batches",     icon:"👥",  label:"Batches",         href:"/trainer/batches" },
    { id:"attendance",  icon:"◎",   label:"Attendance",      href:"/trainer/attendance" },
    { id:"assignments", icon:"📋",  label:"Assignments",     href:"/trainer/assignments" },
    { id:"analytics",   icon:"📊",  label:"Analytics",       href:"/trainer/analytics" },
    { id:"content",     icon:"🗂",  label:"Content",         href:"/trainer/content" },
    { id:"profile",     icon:"◈",   label:"Profile",         href:"/trainer/profile" },
  ],
  admin: [
    { id:"dashboard",  icon:"◆",  label:"Universe Control", href:"/admin/dashboard" },
    { id:"users",      icon:"👥", label:"User Registry",    href:"/admin/users" },
    { id:"courses",    icon:"🪐", label:"Course Worlds",    href:"/admin/courses" },
    { id:"batches",    icon:"📅", label:"Batch Scheduler",  href:"/admin/batches" },
    { id:"analytics",  icon:"📊", label:"Analytics",        href:"/admin/analytics" },
    { id:"revenue",    icon:"💰", label:"Revenue",          href:"/admin/analytics/revenue" },
    { id:"settings",   icon:"⚙", label:"Settings",         href:"/admin/settings" },
  ],
}

const ACCENT: Record<Role, string> = {
  student: "#00D4FF",
  trainer: "#A78BFA",
  admin:   "#00FFCC",
}

interface Props {
  role: Role
}

export default function ConstellationNav({ role }: Props) {
  const pathname = usePathname()
  const items    = NAV[role]
  const accent   = ACCENT[role]
  const [tooltip, setTooltip] = useState<string | null>(null)

  return (
    <nav style={{
      width: 76,
      height: "100vh",
      background: "rgba(2,4,8,0.96)",
      borderRight: "1px solid rgba(0,212,255,0.07)",
      backdropFilter: "blur(20px)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "14px 0 12px",
      flexShrink: 0,
      position: "relative",
      zIndex: 20,
    }}>

      {/* Logo */}
      <div style={{ position: "relative", marginBottom: 26 }}>
        <div style={{
          position: "absolute", inset: -5, borderRadius: 17,
          border: `1px solid ${accent}15`,
          animation: "orbSpin 12s linear infinite",
        }} />
        <div style={{
          width: 46, height: 46, borderRadius: 14,
          background: `linear-gradient(135deg,${accent}18,${accent}08)`,
          border: `1px solid ${accent}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, color: accent,
          boxShadow: `0 0 22px ${accent}22`,
        }}>⬡</div>
      </div>

      {/* Divider */}
      <div style={{ width: 32, height: 1, background: `linear-gradient(90deg,transparent,${accent}30,transparent)`, marginBottom: 14 }} />

      {/* Nav items */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: "100%" }}>
        {items.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <div key={item.id} style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}
              onMouseEnter={() => setTooltip(item.id)}
              onMouseLeave={() => setTooltip(null)}>
              <Link href={item.href} style={{ textDecoration: "none" }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 16,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 19,
                  background: active ? `${accent}1c` : "transparent",
                  border: `1px solid ${active ? accent + "45" : "transparent"}`,
                  color: active ? accent : "rgba(200,230,240,0.3)",
                  boxShadow: active ? `0 0 18px ${accent}22, inset 0 0 14px ${accent}08` : "none",
                  transform: active ? "scale(1.08)" : "scale(1)",
                  transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                  cursor: "pointer",
                  position: "relative",
                }}>
                  {item.icon}
                  {active && (
                    <div style={{
                      position: "absolute", left: -1, top: "20%", bottom: "20%",
                      width: 2, borderRadius: 1,
                      background: accent,
                      boxShadow: `0 0 8px ${accent}`,
                    }} />
                  )}
                </div>
              </Link>

              {/* Tooltip */}
              {tooltip === item.id && (
                <div style={{
                  position: "absolute", left: "calc(100% + 10px)", top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(3,8,18,0.97)",
                  border: `1px solid ${accent}40`,
                  borderRadius: 10,
                  padding: "7px 13px",
                  whiteSpace: "nowrap",
                  fontSize: 11, fontFamily: "'Exo 2', sans-serif", fontWeight: 600,
                  color: accent, letterSpacing: "0.1em",
                  boxShadow: `0 0 20px ${accent}22`,
                  zIndex: 100,
                  animation: "tooltipIn 0.15s ease both",
                  pointerEvents: "none",
                }}>
                  {item.label}
                  <div style={{
                    position: "absolute", left: -5, top: "50%", transform: "translateY(-50%)",
                    width: 0, height: 0,
                    borderTop: "5px solid transparent",
                    borderBottom: "5px solid transparent",
                    borderRight: `5px solid ${accent}40`,
                  }}/>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom avatar */}
      <div style={{ marginTop: "auto" }}>
        <div style={{ position: "relative" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: `linear-gradient(135deg,${accent},${accent}55)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, color: "#020408", fontWeight: 700,
            boxShadow: `0 0 16px ${accent}40`,
          }}>A</div>
          <div style={{
            position: "absolute", bottom: 0, right: 0,
            width: 9, height: 9, borderRadius: "50%",
            background: "#00FFCC", border: "2px solid #020408",
            boxShadow: "0 0 6px #00FFCC",
          }} />
        </div>
      </div>

      <style>{`
        @keyframes orbSpin { to { transform: rotate(360deg); } }
        @keyframes tooltipIn {
          from { opacity:0; transform:translateY(-50%) translateX(-6px); }
          to   { opacity:1; transform:translateY(-50%) translateX(0); }
        }
      `}</style>
    </nav>
  )
}