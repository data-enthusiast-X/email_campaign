"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Plus, ArrowRight, SendHorizonal, CheckCircle2,
  Clock, FileText, Users, MailOpen,
} from "lucide-react"

const pageBg: React.CSSProperties = {
  minHeight: "100vh",
  background: `
    radial-gradient(ellipse at 12% 12%, rgba(255,175,110,0.28) 0%, transparent 48%),
    radial-gradient(ellipse at 88% 80%, rgba(232,86,26,0.09) 0%, transparent 45%),
    radial-gradient(ellipse at 72% 8%,  rgba(255,215,175,0.20) 0%, transparent 42%),
    radial-gradient(ellipse at 30% 85%, rgba(255,200,150,0.12) 0%, transparent 38%),
    #FDF5EE
  `,
}

const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.62)",
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
  border: "1px solid rgba(255,255,255,0.90)",
  borderRadius: "18px",
  boxShadow: "0 4px 24px rgba(232,86,26,0.06), 0 1px 6px rgba(0,0,0,0.03)",
}

function getStatusStyle(status: string) {
  switch (status) {
    case "sent":      return { color: "#0F6E56", bg: "rgba(15,110,86,0.09)",  border: "rgba(15,110,86,0.18)",  Icon: CheckCircle2,   label: "Sent" }
    case "sending":   return { color: "#E8561A", bg: "rgba(232,86,26,0.09)", border: "rgba(232,86,26,0.18)", Icon: SendHorizonal,  label: "Sending" }
    case "scheduled": return { color: "#C8820A", bg: "rgba(200,130,10,0.09)",border: "rgba(200,130,10,0.18)",Icon: Clock,          label: "Scheduled" }
    default:          return { color: "#8A7A6A", bg: "rgba(138,122,106,0.08)",border: "rgba(184,168,152,0.18)",Icon: FileText,      label: "Draft" }
  }
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    fetch("/api/campaigns")
      .then(r => r.json())
      .then(d => { setCampaigns(d.campaigns || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={pageBg}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .row-hover:hover { background: rgba(253,245,238,0.65) !important; }
        .btn-edit:hover  { background: rgba(232,86,26,0.10) !important; border-color: rgba(232,86,26,0.30) !important; }
      `}</style>

      {/* Action bar — count + CTA, no duplicate title */}
      <div style={{
        background: "rgba(253,245,238,0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(234,224,213,0.7)",
        padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: "12px", color: "#B8A898", fontWeight: 500 }}>
          {loading ? "Loading…" : `${campaigns.length} campaign${campaigns.length !== 1 ? "s" : ""}`}
        </span>
        <Link href="/campaigns/new">
          <button style={{
            padding: "7px 16px", borderRadius: "100px", border: "none",
            background: "linear-gradient(135deg, #E8561A, #FF7A3D)",
            color: "#fff", fontSize: "12px", fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 4px 14px rgba(232,86,26,0.28)",
            display: "flex", alignItems: "center", gap: "5px",
          }}>
            <Plus size={13} strokeWidth={2.5} /> New Campaign
          </button>
        </Link>
      </div>

      <div style={{ padding: "20px 24px" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "100px" }}>
            <div style={{
              width: "26px", height: "26px", borderRadius: "50%",
              border: "2px solid rgba(232,86,26,0.15)", borderTopColor: "#E8561A",
              animation: "spin 0.7s linear infinite",
            }} />
          </div>

        ) : campaigns.length === 0 ? (
          /* ── Empty state ── */
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0" }}>
            <div style={{ ...glass, padding: "52px 48px", textAlign: "center", maxWidth: "440px", width: "100%" }}>
              <div style={{
                width: "56px", height: "56px", borderRadius: "16px", margin: "0 auto 18px",
                background: "linear-gradient(135deg, rgba(232,86,26,0.12), rgba(255,122,61,0.08))",
                border: "1px solid rgba(232,86,26,0.14)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <MailOpen size={24} color="#E8561A" strokeWidth={1.6} />
              </div>

              <div style={{ fontSize: "16px", fontWeight: 700, color: "#130E08", marginBottom: "8px" }}>
                No campaigns yet
              </div>
              <div style={{ fontSize: "12.5px", color: "#B8A898", lineHeight: 1.65, marginBottom: "26px" }}>
                Create your first campaign. The built-in verification gate
                protects your domain reputation before every send.
              </div>

              <Link href="/campaigns/new">
                <button style={{
                  padding: "10px 26px", borderRadius: "100px", border: "none",
                  background: "linear-gradient(135deg, #E8561A, #FF7A3D)",
                  color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer",
                  fontFamily: "inherit", boxShadow: "0 4px 16px rgba(232,86,26,0.32)",
                  display: "inline-flex", alignItems: "center", gap: "6px",
                }}>
                  Create campaign <ArrowRight size={13} />
                </button>
              </Link>
            </div>
          </div>

        ) : (
          /* ── Campaign list ── */
          <div style={{ ...glass, overflow: "hidden" }}>
            {/* Table header */}
            <div style={{
              display: "grid", gridTemplateColumns: "2fr 1.6fr 110px 110px 80px",
              gap: "12px", padding: "10px 20px",
              borderBottom: "1px solid rgba(234,224,213,0.6)",
              background: "rgba(253,245,238,0.4)",
            }}>
              {[
                { label: "Campaign" },
                { label: "Subject" },
                { label: "Recipients", Icon: Users },
                { label: "Status" },
                { label: "" },
              ].map(({ label, Icon }, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: "5px",
                  fontSize: "10px", fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.8px", color: "#B8A898",
                }}>
                  {Icon && <Icon size={10} strokeWidth={2} />}
                  {label}
                </div>
              ))}
            </div>

            {campaigns.map((c, i) => {
              const s = getStatusStyle(c.status)
              const StatusIcon = s.Icon
              return (
                <div
                  key={c.id}
                  className="row-hover"
                  style={{
                    display: "grid", gridTemplateColumns: "2fr 1.6fr 110px 110px 80px",
                    gap: "12px", padding: "14px 20px", alignItems: "center",
                    borderBottom: i < campaigns.length - 1 ? "1px solid rgba(234,224,213,0.5)" : "none",
                    transition: "background 0.15s", background: "transparent",
                  }}
                >
                  {/* Name + date */}
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#130E08", marginBottom: "2px" }}>{c.name}</div>
                    <div style={{ fontSize: "10.5px", color: "#B8A898" }}>
                      {new Date(c.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>

                  {/* Subject */}
                  <div style={{ fontSize: "12.5px", color: "#6B5040", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.subject || <span style={{ color: "#C8B8A8", fontStyle: "italic" }}>No subject</span>}
                  </div>

                  {/* Recipients */}
                  <div style={{ fontSize: "13px", color: "#130E08", fontWeight: 600 }}>
                    {c.recipientCount > 0
                      ? c.recipientCount.toLocaleString()
                      : <span style={{ color: "#C8B8A8" }}>—</span>}
                  </div>

                  {/* Status badge */}
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: "5px",
                    fontSize: "10.5px", fontWeight: 700, padding: "4px 10px",
                    borderRadius: "20px", background: s.bg, color: s.color,
                    border: `1px solid ${s.border}`, width: "fit-content",
                  }}>
                    <StatusIcon size={10} strokeWidth={2.2} />
                    {s.label}
                  </span>

                  {/* Edit button */}
                  <Link href={`/campaigns/new`}>
                    <button className="btn-edit" style={{
                      padding: "6px 12px", borderRadius: "9px",
                      border: "1px solid rgba(232,86,26,0.16)",
                      background: "rgba(232,86,26,0.06)", color: "#E8561A",
                      fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                      display: "flex", alignItems: "center", gap: "4px",
                      transition: "all 0.15s",
                    }}>
                      Edit <ArrowRight size={11} />
                    </button>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
