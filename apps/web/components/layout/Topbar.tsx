"use client"

import { usePathname } from "next/navigation"

const pageTitles: Record<string, { title: string; sub: string }> = {
  "/dashboard": { title: "Dashboard", sub: "Good morning — your platform is healthy" },
  "/contacts": { title: "Contacts", sub: "Manage and verify your contact list" },
  "/campaigns": { title: "Campaigns", sub: "Create and send email campaigns" },
  "/queue": { title: "Send queue", sub: "Live monitor for active sends" },
  "/automation": { title: "Automation", sub: "Build automated email flows" },
  "/analytics": { title: "Analytics", sub: "Track your campaign performance" },
  "/verification": { title: "Verification", sub: "Verify emails before you send" },
  "/signature": { title: "Signature", sub: "Build your email signature and footer" },
  "/templates": { title: "Templates", sub: "Browse and manage email templates" },
  "/domain": { title: "Domain setup", sub: "Connect and warm up your sending domain" },
  "/settings": { title: "Settings", sub: "Manage your workspace and account" },
}

export default function Topbar() {
  const pathname = usePathname()
  const page = pageTitles[pathname] || { title: "Xerebo", sub: "" }

  return (
    <div style={{
      height: "58px",
      background: "#FDFAF5",
      borderBottom: "1px solid #EAE0D5",
      padding: "0 28px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: 0,
      gap: "16px"
    }}>

      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div>
          <div style={{
            fontSize: "15px", fontWeight: 600,
            color: "#130E08", lineHeight: 1.2
          }}>{page.title}</div>
          <div style={{
            fontSize: "11px", color: "#B8A898", marginTop: "1px"
          }}>{page.sub}</div>
        </div>
      </div>

      {/* Right */}
      <div style={{
        display: "flex", alignItems: "center",
        gap: "8px", flexShrink: 0
      }}>

        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center", gap: "6px",
          background: "#F5EEE6",
          border: "1px solid #EAE0D5",
          borderRadius: "100px",
          padding: "6px 12px",
          cursor: "pointer",
          fontSize: "12px", color: "#B8A898"
        }}>
          <span>⌕</span>
          <span>Search</span>
          <span style={{
            fontSize: "9px", background: "#EAE0D5",
            padding: "1px 5px", borderRadius: "4px", color: "#A8927E"
          }}>⌘K</span>
        </div>

        {/* Divider */}
        <div style={{ width: "1px", height: "20px", background: "#EAE0D5" }} />

        {/* Notification bell */}
        <div style={{
          width: "34px", height: "34px", borderRadius: "9px",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", fontSize: "15px",
          border: "1px solid #EAE0D5", background: "#FDFAF5",
          color: "#A8927E", position: "relative", transition: "all 0.15s"
        }}>
          🔔
          <div style={{
            position: "absolute", top: "6px", right: "6px",
            width: "7px", height: "7px", borderRadius: "50%",
            background: "#E8561A", border: "1.5px solid #FDFAF5"
          }} />
        </div>

        {/* Import button */}
        <button style={{
          display: "flex", alignItems: "center", gap: "5px",
          padding: "7px 14px",
          background: "transparent", color: "#6B5040",
          border: "1px solid #EAE0D5", borderRadius: "100px",
          fontSize: "12px", fontWeight: 500, cursor: "pointer"
        }}>
          ↑ Import
        </button>

        {/* New campaign button */}
        <button style={{
          display: "flex", alignItems: "center", gap: "5px",
          padding: "7px 16px",
          background: "#E8561A", color: "#fff",
          border: "none", borderRadius: "100px",
          fontSize: "12px", fontWeight: 600, cursor: "pointer",
          boxShadow: "0 2px 8px rgba(232,86,26,0.3)"
        }}>
          + New campaign
        </button>
      </div>
    </div>
  )
}
