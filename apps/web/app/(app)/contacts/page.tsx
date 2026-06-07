"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface Contact {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  company: string | null
  subscriptionStatus: string
  verificationStatus: string
  engagementScore: number
  lifecycleStage: string
  createdAt: string
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [segment, setSegment] = useState("all")

  useEffect(() => {
    fetchContacts()
  }, [filter, segment])

  async function fetchContacts() {
    setLoading(true)
    const res = await fetch(`/api/contacts?filter=${filter}&segment=${segment}`)
    const data = await res.json()
    setContacts(data.contacts || [])
    setLoading(false)
  }

  const filtered = contacts.filter(c => {
    const name = `${c.firstName || ""} ${c.lastName || ""}`.toLowerCase()
    const email = c.email.toLowerCase()
    const company = (c.company || "").toLowerCase()
    const q = search.toLowerCase()
    return name.includes(q) || email.includes(q) || company.includes(q)
  })

  const stats = {
    total: contacts.length,
    verified: contacts.filter(c => c.verificationStatus === "verified").length,
    invalid: contacts.filter(c => c.verificationStatus === "invalid").length,
    unverified: contacts.filter(c => c.verificationStatus === "unverified").length,
    unsubscribed: contacts.filter(c => c.subscriptionStatus === "unsubscribed").length,
  }

  function getVerifBadge(status: string) {
    switch(status) {
      case "verified": return { label: "✓ Verified", bg: "#E1F5EE", color: "#0F6E56" }
      case "invalid": return { label: "✗ Invalid", bg: "#FAECE7", color: "#993C1D" }
      case "risky": return { label: "⚠ Risky", bg: "#FAEEDA", color: "#854F0B" }
      default: return { label: "⬜ Unverified", bg: "#F5EEE6", color: "#B8A898" }
    }
  }

  function getSubBadge(status: string) {
    if (status === "subscribed") return { label: "Subscribed", bg: "#E1F5EE", color: "#0F6E56" }
    if (status === "unsubscribed") return { label: "Unsubscribed", bg: "#FAECE7", color: "#993C1D" }
    if (status === "bounced") return { label: "Bounced", bg: "#FAEEDA", color: "#854F0B" }
    return { label: status, bg: "#F5EEE6", color: "#B8A898" }
  }

  function getEngLabel(score: number) {
    if (score >= 80) return { label: "Champion", color: "#0F6E56" }
    if (score >= 50) return { label: "Active", color: "#854F0B" }
    if (score >= 20) return { label: "At risk", color: "#993C1D" }
    return { label: "Cold", color: "#B8A898" }
  }

  const segments = [
    { id: "all", label: "All contacts", color: "#E8561A" },
    { id: "champions", label: "Champions", color: "#0F6E56" },
    { id: "active", label: "Active 30d", color: "#185FA5" },
    { id: "at_risk", label: "At risk", color: "#854F0B" },
    { id: "cold", label: "Cold 90d+", color: "#B8A898" },
  ]

  return (
    <div style={{ padding: "0" }}>

      {/* Topbar */}
      <div style={{
        background: "#FDFAF5",
        borderBottom: "1px solid #EAE0D5",
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#130E08" }}>Contacts</div>
          <div style={{ fontSize: "11px", color: "#B8A898", marginTop: "2px" }}>
            {stats.total.toLocaleString()} total · unlimited storage · {stats.verified.toLocaleString()} verified
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button style={{
            padding: "7px 14px", borderRadius: "100px",
            border: "1px solid #EAE0D5", background: "transparent",
            fontSize: "12px", fontWeight: 500, color: "#6B5040", cursor: "pointer"
          }}>Export CSV</button>
          <button style={{
            padding: "7px 14px", borderRadius: "100px",
            border: "1px solid #EAE0D5", background: "transparent",
            fontSize: "12px", fontWeight: 500, color: "#6B5040", cursor: "pointer"
          }}>✓ Verify all</button>
          <Link href="/contacts/import">
            <button style={{
              padding: "7px 16px", borderRadius: "100px",
              border: "none", background: "#E8561A",
              fontSize: "12px", fontWeight: 600, color: "#fff",
              cursor: "pointer", boxShadow: "0 2px 8px rgba(232,86,26,0.3)"
            }}>+ Import contacts</button>
          </Link>
        </div>
      </div>

      <div style={{ padding: "20px 24px" }}>

        {/* Stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,1fr)",
          gap: "8px",
          marginBottom: "16px"
        }}>
          {[
            { n: stats.total, l: "Total", color: "#130E08" },
            { n: stats.verified, l: "✓ Verified", color: "#0F6E56" },
            { n: stats.invalid, l: "✗ Invalid", color: "#993C1D" },
            { n: stats.unverified, l: "⚠ Unverified", color: "#854F0B" },
            { n: stats.unsubscribed, l: "Unsubscribed", color: "#B8A898" },
          ].map((s, i) => (
            <div key={i} style={{
              background: "#fff",
              border: "1px solid #EAE0D5",
              borderRadius: "12px",
              padding: "12px 14px",
              textAlign: "center"
            }}>
              <div style={{
                fontSize: "22px", fontWeight: 700,
                color: s.color, letterSpacing: "-0.5px"
              }}>{s.n.toLocaleString()}</div>
              <div style={{
                fontSize: "10px", color: "#B8A898",
                marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.5px"
              }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div style={{
          display: "flex", gap: "8px",
          marginBottom: "12px", flexWrap: "wrap", alignItems: "center"
        }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍  Search by name, email, company..."
            style={{
              flex: 1, minWidth: "200px",
              background: "#fff", border: "1px solid #EAE0D5",
              borderRadius: "100px", padding: "8px 14px",
              fontSize: "12.5px", fontFamily: "inherit",
              color: "#130E08", outline: "none"
            }}
          />
          {["all", "subscribed", "verified", "invalid"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "6px 13px", borderRadius: "100px",
              fontSize: "11.5px", fontWeight: 500, cursor: "pointer",
              border: filter === f ? "none" : "1px solid #EAE0D5",
              background: filter === f ? "#E8561A" : "#fff",
              color: filter === f ? "#fff" : "#6B5040",
              fontFamily: "inherit"
            }}>
              {f === "all" ? "All" : f === "subscribed" ? "Subscribed" : f === "verified" ? "Verified ✓" : "Invalid ✗"}
            </button>
          ))}
        </div>

        {/* Segment pills */}
        <div style={{
          display: "flex", gap: "6px",
          marginBottom: "14px", overflowX: "auto", paddingBottom: "2px"
        }}>
          {segments.map(s => (
            <button key={s.id} onClick={() => setSegment(s.id)} style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "5px 12px", borderRadius: "8px",
              fontSize: "11.5px", fontWeight: 500, cursor: "pointer",
              border: segment === s.id ? `1px solid ${s.color}` : "1px solid #EAE0D5",
              background: segment === s.id ? "#FFF0E8" : "#fff",
              color: segment === s.id ? s.color : "#6B5040",
              whiteSpace: "nowrap", fontFamily: "inherit"
            }}>
              <div style={{
                width: "7px", height: "7px",
                borderRadius: "50%", background: s.color
              }} />
              {s.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{
          background: "#fff",
          border: "1px solid #EAE0D5",
          borderRadius: "14px",
          overflow: "hidden"
        }}>
          {/* Header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "32px 2fr 1.5fr 110px 120px 100px 80px",
            gap: "10px", padding: "10px 16px",
            background: "#F5EEE6", borderBottom: "1px solid #EAE0D5"
          }}>
            {["", "Contact", "Company", "Verification", "Subscription", "Engagement", ""].map((h, i) => (
              <div key={i} style={{
                fontSize: "10px", fontWeight: 600,
                textTransform: "uppercase", letterSpacing: "1px", color: "#B8A898"
              }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#B8A898" }}>
              Loading contacts...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "60px 40px", textAlign: "center" }}>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>📭</div>
              <div style={{ fontSize: "15px", fontWeight: 600, color: "#130E08", marginBottom: "6px" }}>
                No contacts yet
              </div>
              <div style={{ fontSize: "13px", color: "#B8A898", marginBottom: "16px" }}>
                Import your first contact list to get started
              </div>
              <Link href="/contacts/import">
                <button style={{
                  padding: "9px 20px", background: "#E8561A",
                  color: "#fff", border: "none", borderRadius: "100px",
                  fontSize: "13px", fontWeight: 600, cursor: "pointer"
                }}>Import contacts →</button>
              </Link>
            </div>
          ) : (
            filtered.map(contact => {
              const verif = getVerifBadge(contact.verificationStatus)
              const sub = getSubBadge(contact.subscriptionStatus)
              const eng = getEngLabel(contact.engagementScore)
              return (
                <div key={contact.id} style={{
                  display: "grid",
                  gridTemplateColumns: "32px 2fr 1.5fr 110px 120px 100px 80px",
                  gap: "10px", padding: "11px 16px",
                  borderBottom: "1px solid #F5EEE6",
                  alignItems: "center", cursor: "pointer",
                  transition: "background 0.1s"
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#FFFAF6"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                >
                  <div style={{
                    width: "15px", height: "15px",
                    borderRadius: "4px", border: "1.5px solid #EAE0D5"
                  }} />
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 500, color: "#130E08" }}>
                      {contact.firstName || ""} {contact.lastName || ""}
                      {!contact.firstName && !contact.lastName && contact.email.split("@")[0]}
                    </div>
                    <div style={{ fontSize: "11px", color: "#B8A898", marginTop: "1px" }}>
                      {contact.email}
                    </div>
                  </div>
                  <div style={{ fontSize: "12.5px", color: "#6B5040" }}>
                    {contact.company || "—"}
                  </div>
                  <div>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: "3px",
                      fontSize: "10px", fontWeight: 600, padding: "3px 8px",
                      borderRadius: "20px", background: verif.bg, color: verif.color
                    }}>{verif.label}</span>
                  </div>
                  <div>
                    <span style={{
                      display: "inline-flex", alignItems: "center",
                      fontSize: "10px", fontWeight: 600, padding: "3px 8px",
                      borderRadius: "20px", background: sub.bg, color: sub.color
                    }}>{sub.label}</span>
                  </div>
                  <div>
                    <div style={{
                      height: "4px", background: "#EAE0D5",
                      borderRadius: "2px", width: "60px", overflow: "hidden",
                      marginBottom: "3px"
                    }}>
                      <div style={{
                        height: "100%", borderRadius: "2px",
                        width: `${contact.engagementScore}%`,
                        background: contact.engagementScore >= 80 ? "#0F6E56" :
                                    contact.engagementScore >= 50 ? "#FAC775" : "#993C1D"
                      }} />
                    </div>
                    <div style={{ fontSize: "9px", color: eng.color }}>{eng.label}</div>
                  </div>
                  <div>
                    <Link href={`/contacts/${contact.id}`}>
                      <button style={{
                        padding: "4px 10px", borderRadius: "6px",
                        fontSize: "11px", cursor: "pointer",
                        border: "1px solid #EAE0D5", background: "#fff",
                        color: "#6B5040", fontFamily: "inherit"
                      }}>View</button>
                    </Link>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
