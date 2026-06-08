"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

const pageBg: React.CSSProperties = {
  minHeight: "100vh",
  background: `
    radial-gradient(ellipse at 12% 12%, rgba(255,175,110,0.32) 0%, transparent 45%),
    radial-gradient(ellipse at 88% 80%, rgba(232,86,26,0.10) 0%, transparent 45%),
    radial-gradient(ellipse at 72% 8%,  rgba(255,215,175,0.22) 0%, transparent 42%),
    radial-gradient(ellipse at 30% 85%, rgba(255,200,150,0.14) 0%, transparent 38%),
    #FDF5EE
  `,
}

const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.58)",
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
  border: "1px solid rgba(255,255,255,0.88)",
  borderRadius: "16px",
  boxShadow: "0 4px 24px rgba(232,86,26,0.06), 0 1px 6px rgba(0,0,0,0.03)",
}

function statusColor(status: string) {
  switch (status) {
    case "sent":      return "#0F6E56"
    case "sending":   return "#E8561A"
    case "scheduled": return "#C8820A"
    default:          return "#B8A898"
  }
}

function statusBg(status: string) {
  switch (status) {
    case "sent":      return "#E1F5EE"
    case "sending":   return "#FDF0E8"
    case "scheduled": return "#FAEEDA"
    default:          return "#F5EEE6"
  }
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/campaigns")
      .then(r => r.json())
      .then(d => { setCampaigns(d.campaigns || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={pageBg}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* Sub-header */}
      <div style={{
        background: "rgba(253,245,238,0.85)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(234,224,213,0.6)",
        padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#130E08" }}>Campaigns</div>
          <div style={{ fontSize: "11px", color: "#B8A898", marginTop: "2px" }}>
            {loading ? "Loading..." : `${campaigns.length} total`}
          </div>
        </div>
        <Link href="/campaigns/new">
          <button style={{
            padding: "8px 18px", borderRadius: "100px", border: "none",
            background: "linear-gradient(135deg, #E8561A, #FF7A3D)",
            color: "#fff", fontSize: "12px", fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 4px 14px rgba(232,86,26,0.32)",
          }}>+ New Campaign</button>
        </Link>
      </div>

      <div style={{ padding: "20px 24px" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px" }}>
            <div style={{
              width: "24px", height: "24px", borderRadius: "50%",
              border: "2px solid rgba(232,86,26,0.15)", borderTopColor: "#E8561A",
              animation: "spin 0.7s linear infinite",
            }} />
          </div>
        ) : campaigns.length === 0 ? (
          <div style={{ ...glass, padding: "56px", textAlign: "center", maxWidth: "480px", margin: "0 auto" }}>
            <div style={{ fontSize: "36px", marginBottom: "14px" }}>✉️</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#130E08", marginBottom: "6px" }}>
              No campaigns yet
            </div>
            <div style={{ fontSize: "13px", color: "#B8A898", lineHeight: 1.6, marginBottom: "22px" }}>
              Create your first campaign. The verification gate will<br />
              protect your domain reputation before every send.
            </div>
            <Link href="/campaigns/new">
              <button style={{
                padding: "10px 28px", borderRadius: "100px", border: "none",
                background: "linear-gradient(135deg, #E8561A, #FF7A3D)",
                color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer",
                fontFamily: "inherit", boxShadow: "0 4px 16px rgba(232,86,26,0.32)",
              }}>Create campaign →</button>
            </Link>
          </div>
        ) : (
          <div style={{ ...glass, overflow: "hidden" }}>
            {/* Header */}
            <div style={{
              display: "grid", gridTemplateColumns: "2fr 1.5fr 100px 80px 80px",
              gap: "12px", padding: "10px 18px",
              background: "rgba(232,86,26,0.04)",
              borderBottom: "1px solid rgba(232,86,26,0.07)",
            }}>
              {["Campaign", "Subject", "Recipients", "Status", ""].map((h, i) => (
                <div key={i} style={{
                  fontSize: "10px", fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.9px", color: "#B8A898",
                }}>{h}</div>
              ))}
            </div>

            {campaigns.map((c, i) => (
              <div key={c.id} style={{
                display: "grid", gridTemplateColumns: "2fr 1.5fr 100px 80px 80px",
                gap: "12px", padding: "13px 18px", alignItems: "center",
                borderBottom: i < campaigns.length - 1 ? "1px solid rgba(232,86,26,0.05)" : "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(253,245,238,0.6)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
              >
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#130E08" }}>{c.name}</div>
                  <div style={{ fontSize: "11px", color: "#B8A898", marginTop: "2px" }}>
                    {new Date(c.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
                <div style={{ fontSize: "12.5px", color: "#6B5040", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.subject || <span style={{ color: "#C8B8A8" }}>No subject</span>}
                </div>
                <div style={{ fontSize: "13px", color: "#130E08", fontWeight: 500 }}>
                  {c.recipientCount > 0 ? c.recipientCount.toLocaleString() : <span style={{ color: "#C8B8A8" }}>—</span>}
                </div>
                <span style={{
                  fontSize: "10px", fontWeight: 600, padding: "3px 10px",
                  borderRadius: "20px", background: statusBg(c.status),
                  color: statusColor(c.status), textTransform: "capitalize",
                  display: "inline-block",
                }}>{c.status}</span>
                <Link href={`/campaigns/new`}>
                  <button style={{
                    padding: "5px 12px", borderRadius: "8px",
                    border: "1px solid rgba(232,86,26,0.18)",
                    background: "rgba(232,86,26,0.06)", color: "#E8561A",
                    fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                  }}>Edit →</button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
