import Link from "next/link"

const pageBg: React.CSSProperties = {
  height: "100%",
  background: `
    radial-gradient(ellipse at 12% 12%, rgba(255,175,110,0.32) 0%, transparent 45%),
    radial-gradient(ellipse at 88% 80%, rgba(232,86,26,0.10) 0%, transparent 45%),
    radial-gradient(ellipse at 72% 8%,  rgba(255,215,175,0.22) 0%, transparent 42%),
    #FDF5EE
  `,
  padding: "16px 20px",
  boxSizing: "border-box" as const,
}

const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.58)",
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
  border: "1px solid rgba(255,255,255,0.88)",
  borderRadius: "18px",
  boxShadow: "0 4px 24px rgba(232,86,26,0.06), 0 1px 6px rgba(0,0,0,0.03)",
}

const settingCards = [
  {
    href: "/settings/brand",
    emoji: "◈",
    label: "Brand settings",
    desc: "Logo, colour and unsubscribe page appearance",
    available: true,
  },
  {
    href: "#",
    emoji: "👥",
    label: "Team & members",
    desc: "Invite teammates, manage roles and access",
    available: false,
  },
  {
    href: "#",
    emoji: "💳",
    label: "Billing & plan",
    desc: "Current plan, invoices and upgrade options",
    available: false,
  },
  {
    href: "#",
    emoji: "🔑",
    label: "API keys",
    desc: "Create and manage API keys for integrations",
    available: false,
  },
  {
    href: "#",
    emoji: "🔔",
    label: "Notifications",
    desc: "Alerts for sends, bounces and events",
    available: false,
  },
  {
    href: "#",
    emoji: "🛡️",
    label: "Security",
    desc: "Password, 2FA and session management",
    available: false,
  },
]

export default function SettingsPage() {
  return (
    <div style={pageBg}>
      <style>{`
        .settings-card { transition: all 0.18s cubic-bezier(0.34,1.2,0.64,1); }
        .settings-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(232,86,26,0.11), 0 2px 10px rgba(0,0,0,0.05) !important; border-color: rgba(232,86,26,0.18) !important; }
        .settings-card-disabled { opacity: 0.55; cursor: default; }
      `}</style>

      <div style={{ maxWidth: "640px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {settingCards.map(card => {
            const inner = (
              <div
                className={`settings-card${!card.available ? " settings-card-disabled" : ""}`}
                style={{
                  ...glass,
                  padding: "16px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  cursor: card.available ? "pointer" : "default",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{
                  width: "34px", height: "34px", borderRadius: "11px",
                  background: card.available ? "rgba(232,86,26,0.09)" : "rgba(107,80,64,0.07)",
                  border: `1px solid ${card.available ? "rgba(232,86,26,0.15)" : "rgba(107,80,64,0.12)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "16px", flexShrink: 0
                }}>{card.emoji}</div>

                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#130E08", marginBottom: "3px" }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: "11px", color: "#B8A898", lineHeight: 1.5 }}>
                    {card.desc}
                  </div>
                </div>

                {card.available && (
                  <div style={{ fontSize: "11px", color: "#E8561A", fontWeight: 600 }}>
                    Open →
                  </div>
                )}

                {!card.available && (
                  <div style={{
                    position: "absolute", top: "10px", right: "10px",
                    fontSize: "9px", fontWeight: 700, letterSpacing: "0.7px",
                    textTransform: "uppercase", color: "#6B5040",
                    background: "rgba(107,80,64,0.08)", border: "1px solid rgba(107,80,64,0.14)",
                    padding: "2px 7px", borderRadius: "20px"
                  }}>Soon</div>
                )}
              </div>
            )

            return card.available
              ? <Link key={card.href} href={card.href} style={{ textDecoration: "none" }}>{inner}</Link>
              : <div key={card.label}>{inner}</div>
          })}
        </div>
      </div>
    </div>
  )
}
