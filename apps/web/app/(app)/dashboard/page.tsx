"use client"

import Link from "next/link"

const pageBg: React.CSSProperties = {
  minHeight: "100vh",
  background: `
    radial-gradient(ellipse at 12% 12%, rgba(255,175,110,0.32) 0%, transparent 45%),
    radial-gradient(ellipse at 88% 80%, rgba(232,86,26,0.10) 0%, transparent 45%),
    radial-gradient(ellipse at 72% 8%,  rgba(255,215,175,0.22) 0%, transparent 42%),
    #FDF5EE
  `,
  padding: "28px 28px",
}

const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.58)",
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
  border: "1px solid rgba(255,255,255,0.88)",
  borderRadius: "20px",
  boxShadow: "0 4px 24px rgba(232,86,26,0.06), 0 1px 6px rgba(0,0,0,0.03)",
}

const quickActions = [
  { label: "Import contacts",  sub: "Bulk upload from CSV or Excel", href: "/contacts/import", color: "#E8561A", icon: "↑" },
  { label: "Create campaign",  sub: "Design and send an email",       href: "/campaigns",       color: "#185FA5", icon: "✉" },
  { label: "Verify emails",    sub: "Clean your list before sending", href: "/verification",    color: "#0F6E56", icon: "✓" },
  { label: "Setup domain",     sub: "Connect your sending domain",    href: "/domain",          color: "#854F0B", icon: "◎" },
]

export default function DashboardPage() {
  return (
    <div style={pageBg}>

      {/* Welcome */}
      <div style={{ ...glass, padding: "28px 32px", marginBottom: "16px", overflow: "hidden", position: "relative" }}>
        <div style={{
          position: "absolute", top: "-60px", right: "-60px",
          width: "220px", height: "220px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,86,26,0.08) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />
        <div style={{ fontSize: "22px", fontWeight: 700, color: "#130E08", marginBottom: "5px", letterSpacing: "-0.3px" }}>
          Welcome to Xerebo 👋
        </div>
        <div style={{ fontSize: "13px", color: "#B8A898", marginBottom: "24px" }}>
          Your email marketing platform is ready. Here's what you can do next.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
          {quickActions.map((a, i) => (
            <Link key={i} href={a.href} style={{ textDecoration: "none" }}>
              <div style={{
                ...glass, padding: "16px",
                cursor: "pointer", transition: "all 0.18s",
                borderTop: `3px solid ${a.color}22`
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"
                ;(e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${a.color}18`
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)"
                ;(e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(232,86,26,0.06)"
              }}
              >
                <div style={{
                  width: "36px", height: "36px", borderRadius: "10px",
                  background: `${a.color}12`, border: `1px solid ${a.color}20`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "16px", color: a.color, marginBottom: "10px", fontWeight: 700
                }}>{a.icon}</div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#130E08", marginBottom: "3px" }}>{a.label}</div>
                <div style={{ fontSize: "11px", color: "#B8A898", lineHeight: 1.4 }}>{a.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "16px" }}>
        {[
          { label: "Contacts",       value: "—",   color: "#130E08" },
          { label: "Campaigns sent", value: "0",   color: "#185FA5" },
          { label: "Emails sent",    value: "200", color: "#E8561A" },
          { label: "Open rate",      value: "—",   color: "#0F6E56" },
        ].map((s, i) => (
          <div key={i} style={{ ...glass, padding: "18px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "28px", fontWeight: 700, color: s.color, letterSpacing: "-1px", lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: "10px", color: "#B8A898", marginTop: "6px", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ ...glass, padding: "22px 24px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#B8A898", textTransform: "uppercase", letterSpacing: "0.9px", marginBottom: "16px" }}>
            Recent activity
          </div>
          <div style={{
            padding: "24px", textAlign: "center",
            background: "rgba(232,86,26,0.04)", borderRadius: "12px",
            border: "1px solid rgba(232,86,26,0.07)"
          }}>
            <div style={{ fontSize: "13px", color: "#B8A898" }}>No activity yet</div>
            <div style={{ fontSize: "11px", color: "#C8B8A8", marginTop: "4px" }}>Activity appears here after your first send</div>
          </div>
        </div>
        <div style={{ ...glass, padding: "22px 24px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#B8A898", textTransform: "uppercase", letterSpacing: "0.9px", marginBottom: "16px" }}>
            Platform health
          </div>
          {[
            { label: "API connection",   ok: true },
            { label: "Database",         ok: true },
            { label: "Email service",    ok: false },
            { label: "Domain verified",  ok: false },
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "9px 0", borderBottom: i < 3 ? "1px solid rgba(232,86,26,0.05)" : "none"
            }}>
              <span style={{ fontSize: "12.5px", color: "#6B5040" }}>{item.label}</span>
              <span style={{
                fontSize: "10px", fontWeight: 700, padding: "3px 9px", borderRadius: "20px",
                background: item.ok ? "rgba(15,110,86,0.08)" : "rgba(184,168,152,0.1)",
                color: item.ok ? "#0F6E56" : "#B8A898",
                border: `1px solid ${item.ok ? "rgba(15,110,86,0.18)" : "rgba(184,168,152,0.2)"}`
              }}>{item.ok ? "✓ Active" : "Not set"}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
