"use client"

import { usePathname } from "next/navigation"
import { Search, Bell } from "lucide-react"

const pageTitles: Record<string, { title: string; sub: string; emoji: string }> = {
  "/dashboard":       { title: "Dashboard",      sub: "Platform is healthy and ready",           emoji: "⊞" },
  "/contacts":        { title: "Contacts",        sub: "Manage and verify your contact list",     emoji: "◉" },
  "/contacts/new":    { title: "Add contact",     sub: "Manually add a single contact",           emoji: "+" },
  "/contacts/import": { title: "Import contacts", sub: "Upload a file to bulk import",            emoji: "↑" },
  "/contacts/bin":    { title: "Recycle Bin",     sub: "Deleted contacts — restored within 7 days", emoji: "🗑" },
  "/campaigns":       { title: "Campaigns",       sub: "Create and send email campaigns",         emoji: "✉" },
  "/queue":           { title: "Send queue",      sub: "Live monitor for active sends",           emoji: "→" },
  "/automation":      { title: "Automation",      sub: "Build automated email flows",             emoji: "⚡" },
  "/analytics":       { title: "Analytics",       sub: "Track your campaign performance",         emoji: "↗" },
  "/verification":    { title: "Verification",    sub: "Verify emails before you send",           emoji: "✓" },
  "/signature":       { title: "Signature",       sub: "Build your email signature",              emoji: "✏" },
  "/templates":       { title: "Templates",       sub: "Browse and manage email templates",       emoji: "⊟" },
  "/domain":          { title: "Domain setup",    sub: "Connect and warm up your sending domain", emoji: "◎" },
  "/settings":        { title: "Settings",        sub: "Manage your workspace and account",       emoji: "⚙" },
  "/settings/brand":  { title: "Brand settings",  sub: "Customise your brand appearance",          emoji: "◈" },
}

export default function Topbar() {
  const pathname = usePathname()

  // match exact or prefix (e.g. /contacts/some-id → contacts)
  const page =
    pageTitles[pathname] ??
    Object.entries(pageTitles).find(([k]) => pathname.startsWith(k + "/"))?.[1] ??
    { title: "Xerebo", sub: "", emoji: "✦" }

  return (
    <div style={{
      height: "56px",
      background: "rgba(253,247,241,0.88)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(234,224,213,0.55)",
      padding: "0 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: 0,
      gap: "16px",
      position: "sticky",
      top: 0,
      zIndex: 20,
    }}>

      {/* ── Left: page identity ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div>
          <div style={{
            fontSize: "14.5px",
            fontWeight: 600,
            color: "#130E08",
            lineHeight: 1.2,
            letterSpacing: "-0.2px"
          }}>{page.title}</div>
          <div style={{
            fontSize: "11px",
            color: "#C0A898",
            marginTop: "1px",
            fontWeight: 400
          }}>{page.sub}</div>
        </div>
      </div>

      {/* ── Right: actions ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

        {/* Search pill */}
        <div style={{
          display: "flex", alignItems: "center", gap: "7px",
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.95)",
          borderRadius: "11px",
          padding: "7px 13px",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          transition: "all 0.15s"
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 14px rgba(232,86,26,0.1)"
          ;(e.currentTarget as HTMLElement).style.borderColor = "rgba(232,86,26,0.2)"
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"
          ;(e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.95)"
        }}
        >
          <Search size={13} color="#C0A898" strokeWidth={2} />
          <span style={{ fontSize: "12px", color: "#C0A898", userSelect: "none" }}>Search</span>
          <span style={{
            fontSize: "9px",
            background: "rgba(232,86,26,0.07)",
            color: "#B8956A",
            padding: "2px 6px",
            borderRadius: "5px",
            border: "1px solid rgba(232,86,26,0.1)",
            letterSpacing: "0.3px",
            fontWeight: 600
          }}>⌘K</span>
        </div>

        {/* Bell */}
        <div style={{
          width: "36px", height: "36px", borderRadius: "11px",
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.95)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          position: "relative",
          transition: "all 0.15s",
          flexShrink: 0
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 14px rgba(232,86,26,0.1)"
          ;(e.currentTarget as HTMLElement).style.borderColor = "rgba(232,86,26,0.2)"
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"
          ;(e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.95)"
        }}
        >
          <Bell size={15} color="#A8927E" strokeWidth={1.8} />
          {/* Notification dot */}
          <div style={{
            position: "absolute", top: "8px", right: "8px",
            width: "7px", height: "7px", borderRadius: "50%",
            background: "linear-gradient(135deg, #E8561A, #FF7A3D)",
            border: "1.5px solid rgba(253,247,241,0.9)",
            boxShadow: "0 0 6px rgba(232,86,26,0.5)"
          }} />
        </div>

      </div>
    </div>
  )
}
