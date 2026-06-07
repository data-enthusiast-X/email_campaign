"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Tag as TagIcon } from "lucide-react"

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

const pageBg: React.CSSProperties = {
  minHeight: "100vh",
  background: `
    radial-gradient(ellipse at 12% 12%, rgba(255,175,110,0.32) 0%, transparent 45%),
    radial-gradient(ellipse at 88% 80%, rgba(232,86,26,0.10) 0%, transparent 45%),
    radial-gradient(ellipse at 72% 8%,  rgba(255,215,175,0.22) 0%, transparent 42%),
    radial-gradient(ellipse at 30% 85%, rgba(255,200,150,0.14) 0%, transparent 38%),
    #FDF5EE
  `,
  position: "relative"
}

const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.58)",
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
  border: "1px solid rgba(255,255,255,0.88)",
  borderRadius: "16px",
  boxShadow: "0 4px 24px rgba(232,86,26,0.06), 0 1px 6px rgba(0,0,0,0.03)",
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [segment, setSegment] = useState("all")
  const [selected, setSelected] = useState<string[]>([])
  const [bulkLoading, setBulkLoading] = useState(false)
  const [showBulkTagPicker, setShowBulkTagPicker] = useState(false)
  const [allTags, setAllTags] = useState<any[]>([])
  const [activeTip, setActiveTip] = useState<string | null>(null)
  const [tipPos, setTipPos] = useState({ x: 0, y: 0 })
  const tipTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [deleteModal, setDeleteModal] = useState<string[] | null>(null)
  const [deletingIds, setDeletingIds] = useState<string[]>([])

  useEffect(() => { fetchContacts(); fetchAllTags() }, [filter, segment])

  async function fetchContacts() {
    setLoading(true)
    try {
      const res = await fetch(`/api/contacts?filter=${filter}&segment=${segment}`)
      const data = await res.json()
      setContacts(data.contacts || [])
      setSelected([])
    } catch {
      setContacts([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchAllTags() {
    const res = await fetch("/api/tags")
    const data = await res.json()
    setAllTags(data.tags || [])
  }

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase()
    return `${c.firstName || ""} ${c.lastName || ""} ${c.email} ${c.company || ""}`.toLowerCase().includes(q)
  })

  const stats = {
    total: contacts.length,
    verified: contacts.filter(c => c.verificationStatus === "verified").length,
    invalid: contacts.filter(c => c.verificationStatus === "invalid").length,
    unverified: contacts.filter(c => c.verificationStatus === "unverified" || c.verificationStatus === "risky").length,
    unsubscribed: contacts.filter(c => c.subscriptionStatus === "unsubscribed").length,
  }

  function toggleOne(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }
  function toggleAll() {
    setSelected(selected.length === filtered.length ? [] : filtered.map(c => c.id))
  }

  async function bulkDelete() {
    setDeleteModal(selected)
  }

  async function confirmBulkDelete(ids: string[]) {
    setDeleteModal(null)
    setBulkLoading(true)
    setDeletingIds(ids)
    await new Promise(r => setTimeout(r, 480))
    await fetch("/api/contacts/bulk", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids })
    })
    setDeletingIds([])
    await fetchContacts()
    setSelected([])
    setBulkLoading(false)
  }

  async function bulkVerify() {
    setBulkLoading(true)
    await fetch("/api/contacts/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected, action: "verify" })
    })
    await fetchContacts()
    setBulkLoading(false)
  }

  async function bulkAddTag(tagId: string) {
    setBulkLoading(true)
    await Promise.all(
      selected.map(id =>
        fetch(`/api/contacts/${id}/tags`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tagId }),
        })
      )
    )
    setShowBulkTagPicker(false)
    await fetchContacts()
    setBulkLoading(false)
  }

  function verifBadge(s: string) {
    if (s === "verified") return { label: "✓ Verified",   bg: "rgba(15,110,86,0.08)",  color: "#0F6E56",  border: "rgba(15,110,86,0.18)" }
    if (s === "invalid")  return { label: "✗ Invalid",   bg: "rgba(153,60,29,0.08)",  color: "#993C1D",  border: "rgba(153,60,29,0.18)" }
    if (s === "risky")    return { label: "⚠ Risky",     bg: "rgba(133,79,11,0.08)",  color: "#854F0B",  border: "rgba(133,79,11,0.18)" }
    return                       { label: "◌ Unverified", bg: "rgba(184,168,152,0.1)", color: "#8A7565",  border: "rgba(184,168,152,0.22)" }
  }

  function subBadge(s: string) {
    if (s === "subscribed")   return { label: "Subscribed",   bg: "rgba(15,110,86,0.08)",  color: "#0F6E56", border: "rgba(15,110,86,0.18)" }
    if (s === "unsubscribed") return { label: "Unsubscribed", bg: "rgba(153,60,29,0.08)",  color: "#993C1D", border: "rgba(153,60,29,0.18)" }
    return                           { label: s,              bg: "rgba(184,168,152,0.1)", color: "#8A7565", border: "rgba(184,168,152,0.22)" }
  }

  function engLabel(score: number) {
    if (score >= 80) return { label: "Champion", color: "#0F6E56", bar: "#0F6E56" }
    if (score >= 50) return { label: "Active",   color: "#854F0B", bar: "#FAC775" }
    if (score >= 20) return { label: "At risk",  color: "#993C1D", bar: "#F09080" }
    return                  { label: "Cold",     color: "#B8A898", bar: "#D8CCc4" }
  }

  const segments = [
    {
      id: "all",
      label: "All contacts",
      color: "#E8561A",
      score: null as [number,number] | null,
      tip: null as string | null,
      action: null as string | null,
    },
    {
      id: "champions",
      label: "Champions",
      color: "#0F6E56",
      score: [80, 100] as [number, number],
      tip: "Highly engaged contacts who open almost every email. Your best audience.",
      action: "Send to these first — highest open and click rates",
    },
    {
      id: "active",
      label: "Active 30d",
      color: "#185FA5",
      score: [50, 79] as [number, number],
      tip: "Opened at least one email in the last 30 days. Still warm and responsive.",
      action: "Ideal for regular newsletters and product updates",
    },
    {
      id: "at_risk",
      label: "At risk",
      color: "#854F0B",
      score: [20, 49] as [number, number],
      tip: "No opens in 90–180 days. Losing interest but still recoverable.",
      action: "Send a re-engagement campaign before they go cold",
    },
    {
      id: "cold",
      label: "Cold 90d+",
      color: "#B8A898",
      score: [0, 19] as [number, number],
      tip: "No opens in 180+ days. Sending to this group risks hurting your domain reputation.",
      action: "Verify and clean before sending to protect deliverability",
    },
  ]

  const allSelected = filtered.length > 0 && selected.length === filtered.length
  const someSelected = selected.length > 0

  const GlassBtn = ({ children, onClick, style }: { children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties }) => (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: "6px",
      padding: "9px 18px", borderRadius: "12px",
      background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)",
      border: "1px solid rgba(255,255,255,0.95)",
      fontSize: "12.5px", fontWeight: 500, color: "#130E08",
      cursor: "pointer", fontFamily: "inherit",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      whiteSpace: "nowrap" as const,
      ...style
    }}>{children}</button>
  )

  return (
    <div style={pageBg}>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes tipIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-6px) scale(0.96); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0)     scale(1); }
        }
        .view-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 13px;
          border-radius: 10px;
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid rgba(232,86,26,0.18);
          background: rgba(232,86,26,0.06);
          color: #E8561A;
          font-family: inherit;
          transition: all 0.2s cubic-bezier(0.34,1.3,0.64,1);
          white-space: nowrap;
        }
        .view-btn:hover {
          background: linear-gradient(135deg, #E8561A, #FF7A3D);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 4px 18px rgba(232,86,26,0.35);
          transform: translateY(-1px);
        }
        .view-btn .arr {
          display: inline-block;
          transition: transform 0.2s ease;
        }
        .view-btn:hover .arr {
          transform: translateX(3px);
        }
      `}</style>

      {/* ── Action bar ── */}
      <div style={{
        background: "rgba(253,245,238,0.85)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(234,224,213,0.6)",
        padding: "10px 24px",
        display: "flex", alignItems: "center", gap: "8px",
        position: "sticky", top: 0, zIndex: 10
      }}>
        <span style={{ fontSize: "12px", color: "#B8A898", marginRight: "auto", fontWeight: 500 }}>
          {stats.total.toLocaleString()} total · {stats.verified.toLocaleString()} verified
        </span>
        <Link href="/contacts/bin">
          <GlassBtn>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2 3h9M4.5 3V2a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1M5 5.5v4M8 5.5v4M3 3l.5 7A1 1 0 004.5 11h4a1 1 0 001-1L10 3" stroke="#6B5040" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Bin
          </GlassBtn>
        </Link>
        <GlassBtn>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 9.5v1.5a.5.5 0 00.5.5h8a.5.5 0 00.5-.5V9.5M6.5 1.5v7M4 6l2.5 2.5L9 6" stroke="#6B5040" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Export CSV
        </GlassBtn>
        <GlassBtn>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 7l3.5 3.5 5.5-6" stroke="#0F6E56" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ color: "#0F6E56" }}>Verify all</span>
        </GlassBtn>
        <Link href="/contacts/new">
          <GlassBtn>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 2v9M2 6.5h9" stroke="#6B5040" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            Add contact
          </GlassBtn>
        </Link>
        <Link href="/contacts/import">
          <button style={{
            display: "flex", alignItems: "center", gap: "7px",
            padding: "9px 20px", borderRadius: "12px", border: "none",
            background: "linear-gradient(135deg, #E8561A, #FF7A3D)",
            fontSize: "12.5px", fontWeight: 600, color: "#fff",
            cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 4px 16px rgba(232,86,26,0.32)", whiteSpace: "nowrap"
          }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 2v7M4 7l2.5 2.5L9 7" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 10.5h9" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            Import contacts
          </button>
        </Link>
      </div>

      <div style={{ padding: "20px 24px" }}>

        {/* ── Stats row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "10px", marginBottom: "18px" }}>
          {[
            { n: stats.total,       l: "Total",       color: "#130E08", accent: "rgba(19,14,8,0.07)" },
            { n: stats.verified,    l: "Verified",     color: "#0F6E56", accent: "rgba(15,110,86,0.08)" },
            { n: stats.invalid,     l: "Invalid",      color: "#993C1D", accent: "rgba(153,60,29,0.07)" },
            { n: stats.unverified,  l: "Unverified",   color: "#854F0B", accent: "rgba(133,79,11,0.07)" },
            { n: stats.unsubscribed,l: "Unsubscribed", color: "#B8A898", accent: "rgba(184,168,152,0.1)" },
          ].map((s, i) => (
            <div key={i} style={{
              ...glass, padding: "14px 16px", textAlign: "center",
              borderTop: `3px solid ${s.color}20`
            }}>
              <div style={{ fontSize: "26px", fontWeight: 700, color: s.color, letterSpacing: "-1px", lineHeight: 1 }}>
                {s.n.toLocaleString()}
              </div>
              <div style={{ fontSize: "10px", color: "#B8A898", marginTop: "5px", textTransform: "uppercase", letterSpacing: "0.7px", fontWeight: 600 }}>
                {s.l}
              </div>
            </div>
          ))}
        </div>

        {/* ── Search + filters ── */}
        <div style={{ ...glass, padding: "12px 16px", marginBottom: "12px" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
              <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="4" stroke="#B8A898" strokeWidth="1.5"/>
                <path d="M10 10l2 2" stroke="#B8A898" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, email, company..."
                style={{
                  width: "100%", padding: "9px 12px 9px 34px",
                  background: "rgba(255,255,255,0.7)", backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.95)", borderRadius: "10px",
                  fontSize: "12.5px", fontFamily: "inherit", color: "#130E08",
                  outline: "none", boxSizing: "border-box"
                }}
              />
            </div>

            {/* Filter pills */}
            <div style={{ display: "flex", gap: "6px" }}>
              {[
                { val: "all",        label: "All" },
                { val: "subscribed", label: "Subscribed" },
                { val: "verified",   label: "Verified" },
                { val: "invalid",    label: "Invalid" },
              ].map(f => (
                <button key={f.val} onClick={() => setFilter(f.val)} style={{
                  padding: "7px 14px", borderRadius: "10px",
                  fontSize: "12px", fontWeight: 500, cursor: "pointer",
                  border: "none", fontFamily: "inherit",
                  background: filter === f.val
                    ? "linear-gradient(135deg, #E8561A, #FF7A3D)"
                    : "rgba(255,255,255,0.7)",
                  color: filter === f.val ? "#fff" : "#6B5040",
                  boxShadow: filter === f.val ? "0 3px 12px rgba(232,86,26,0.28)" : "none",
                  backdropFilter: "blur(8px)"
                }}>{f.label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Segment pills ── */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "14px", flexWrap: "wrap" }}>
          {segments.map(s => (
            <button
              key={s.id}
              onClick={() => setSegment(s.id)}
              onMouseEnter={e => {
                if (!s.tip) return
                const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
                tipTimer.current = setTimeout(() => {
                  setTipPos({ x: r.left + r.width / 2, y: r.bottom })
                  setActiveTip(s.id)
                }, 350)
              }}
              onMouseLeave={() => {
                if (tipTimer.current) clearTimeout(tipTimer.current)
                setActiveTip(null)
              }}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "6px 13px", borderRadius: "10px",
                fontSize: "12px", fontWeight: 500, cursor: "pointer",
                border: segment === s.id ? `1.5px solid ${s.color}55` : "1px solid rgba(234,224,213,0.9)",
                background: segment === s.id
                  ? `linear-gradient(135deg, ${s.color}12, ${s.color}06)`
                  : "rgba(255,255,255,0.7)",
                color: segment === s.id ? s.color : "#8A7565",
                whiteSpace: "nowrap", fontFamily: "inherit",
                backdropFilter: "blur(10px)",
                boxShadow: segment === s.id ? `0 2px 12px ${s.color}20` : "0 1px 4px rgba(0,0,0,0.04)",
                transition: "all 0.18s ease",
              }}
            >
              <div style={{
                width: "7px", height: "7px", borderRadius: "50%",
                background: s.color, flexShrink: 0,
                boxShadow: segment === s.id ? `0 0 6px ${s.color}80` : "none",
                transition: "box-shadow 0.18s"
              }} />
              {s.label}
            </button>
          ))}
        </div>

        {/* Minimal premium tooltip */}
        {activeTip && (() => {
          const seg = segments.find(s => s.id === activeTip)
          if (!seg?.tip) return null
          return (
            <div style={{
              position: "fixed",
              top: tipPos.y + 10,
              left: tipPos.x,
              transform: "translateX(-50%)",
              width: "192px",
              zIndex: 9999,
              pointerEvents: "none",
              animation: "tipIn 0.15s cubic-bezier(0.34,1.2,0.64,1)",
              background: "rgba(255,253,250,0.98)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: "10px",
              borderLeft: `3px solid ${seg.color}`,
              border: `1px solid rgba(234,224,213,0.7)`,
              borderLeftWidth: "3px",
              borderLeftColor: seg.color,
              padding: "10px 12px 11px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
            }}>
              {/* Arrow */}
              <div style={{
                position: "absolute", top: "-5px", left: "50%",
                transform: "translateX(-50%) rotate(45deg)",
                width: "8px", height: "8px",
                background: "rgba(255,253,250,0.98)",
                border: "1px solid rgba(234,224,213,0.7)",
                borderBottom: "none", borderRight: "none",
                borderRadius: "1px",
              }} />

              {/* Header row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: seg.color, flexShrink: 0 }} />
                  <span style={{ fontSize: "10px", fontWeight: 700, color: seg.color, textTransform: "uppercase", letterSpacing: "0.7px" }}>
                    {seg.label}
                  </span>
                </div>
                {seg.score && (
                  <span style={{
                    fontSize: "9px", fontWeight: 600,
                    color: seg.color,
                    background: `${seg.color}12`,
                    padding: "2px 6px", borderRadius: "5px",
                  }}>{seg.score[0]}–{seg.score[1]}</span>
                )}
              </div>

              {/* Description */}
              <p style={{ fontSize: "11.5px", color: "#5A4030", lineHeight: "1.5", margin: "0 0 7px" }}>
                {seg.tip}
              </p>

              {/* Action */}
              {seg.action && (
                <p style={{ fontSize: "10.5px", color: seg.color, lineHeight: "1.4", margin: 0, opacity: 0.8 }}>
                  {seg.action}
                </p>
              )}
            </div>
          )
        })()}

        {/* ── Table ── */}
        <div style={{ ...glass, overflow: "hidden" }}>

          {/* Table header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "44px 2fr 1.4fr 120px 128px 100px 72px",
            gap: "8px", padding: "10px 16px",
            background: "rgba(232,86,26,0.04)",
            borderBottom: "1px solid rgba(232,86,26,0.07)",
            alignItems: "center"
          }}>
            <div
              onClick={toggleAll}
              style={{
                width: "17px", height: "17px", borderRadius: "5px",
                border: `2px solid ${allSelected ? "#E8561A" : "rgba(184,168,152,0.5)"}`,
                background: allSelected ? "#E8561A" : "rgba(255,255,255,0.7)",
                cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "10px", color: "#fff", flexShrink: 0
              }}
            >{allSelected ? "✓" : someSelected ? "—" : ""}</div>

            {["Contact", "Company", "Verification", "Subscription", "Engagement", ""].map((h, i) => (
              <div key={i} style={{
                fontSize: "10px", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.9px", color: "#B8A898"
              }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {loading ? (
            <div style={{ padding: "60px", textAlign: "center" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                border: "3px solid rgba(232,86,26,0.1)", borderTopColor: "#E8561A",
                animation: "spin 0.75s linear infinite", margin: "0 auto 12px"
              }} />
              <div style={{ fontSize: "13px", color: "#B8A898" }}>Loading contacts...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "72px 40px", textAlign: "center" }}>
              <div style={{ fontSize: "40px", marginBottom: "14px" }}>📭</div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#130E08", marginBottom: "7px" }}>
                No contacts yet
              </div>
              <div style={{ fontSize: "13px", color: "#B8A898", marginBottom: "20px" }}>
                Import your first contact list to get started
              </div>
              <Link href="/contacts/import">
                <button style={{
                  padding: "10px 24px",
                  background: "linear-gradient(135deg, #E8561A, #FF7A3D)",
                  color: "#fff", border: "none", borderRadius: "12px",
                  fontSize: "13px", fontWeight: 600, cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(232,86,26,0.32)"
                }}>Import contacts →</button>
              </Link>
            </div>
          ) : (
            filtered.map((contact, idx) => {
              const isSelected = selected.includes(contact.id)
              const v = verifBadge(contact.verificationStatus)
              const s = subBadge(contact.subscriptionStatus)
              const e = engLabel(contact.engagementScore)
              const initial = (contact.firstName?.[0] ?? contact.email?.[0] ?? "?").toUpperCase()
              const isDeleting = deletingIds.includes(contact.id)
              return (
                <div key={contact.id} style={{
                  display: "grid",
                  gridTemplateColumns: "44px 2fr 1.4fr 120px 128px 100px 72px",
                  gap: "8px", padding: "11px 16px",
                  borderBottom: idx < filtered.length - 1 ? "1px solid rgba(232,86,26,0.05)" : "none",
                  alignItems: "center",
                  background: isDeleting
                    ? "rgba(232,86,26,0.07)"
                    : isSelected ? "rgba(232,86,26,0.04)" : "transparent",
                  opacity: isDeleting ? 0 : 1,
                  transform: isDeleting ? "translateX(-30px) scale(0.97)" : "none",
                  filter: isDeleting ? "blur(3px)" : "none",
                  transition: isDeleting
                    ? "all 0.45s cubic-bezier(0.4,0,0.2,1)"
                    : "background 0.15s"
                }}
                onMouseEnter={e => { if (!isSelected && !isDeleting) (e.currentTarget as HTMLElement).style.background = "rgba(253,245,238,0.7)" }}
                onMouseLeave={e => { if (!isSelected && !isDeleting) (e.currentTarget as HTMLElement).style.background = "transparent" }}
                >
                  {/* Checkbox */}
                  <div
                    onClick={() => toggleOne(contact.id)}
                    style={{
                      width: "17px", height: "17px", borderRadius: "5px",
                      border: `2px solid ${isSelected ? "#E8561A" : "rgba(184,168,152,0.45)"}`,
                      background: isSelected ? "#E8561A" : "rgba(255,255,255,0.7)",
                      cursor: "pointer", display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "10px", color: "#fff", flexShrink: 0
                    }}
                  >{isSelected ? "✓" : ""}</div>

                  {/* Contact */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "34px", height: "34px", borderRadius: "10px", flexShrink: 0,
                      background: "linear-gradient(135deg, #E8561A, #FF9060)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "13px", fontWeight: 700, color: "#fff",
                      boxShadow: "0 2px 8px rgba(232,86,26,0.25)"
                    }}>{initial}</div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 500, color: "#130E08", lineHeight: 1.2 }}>
                        {[contact.firstName, contact.lastName].filter(Boolean).join(" ") || contact.email.split("@")[0]}
                      </div>
                      <div style={{ fontSize: "11px", color: "#B8A898", marginTop: "2px" }}>{contact.email}</div>
                    </div>
                  </div>

                  {/* Company */}
                  <div style={{ fontSize: "12.5px", color: "#6B5040", fontWeight: 400 }}>
                    {contact.company || <span style={{ color: "#C8B8A8" }}>—</span>}
                  </div>

                  {/* Verification badge */}
                  <div>
                    <span style={{
                      fontSize: "10.5px", fontWeight: 600, padding: "4px 10px",
                      borderRadius: "20px", background: v.bg, color: v.color,
                      border: `1px solid ${v.border}`, display: "inline-block"
                    }}>{v.label}</span>
                  </div>

                  {/* Subscription badge */}
                  <div>
                    <span style={{
                      fontSize: "10.5px", fontWeight: 600, padding: "4px 10px",
                      borderRadius: "20px", background: s.bg, color: s.color,
                      border: `1px solid ${s.border}`, display: "inline-block"
                    }}>{s.label}</span>
                  </div>

                  {/* Engagement bar */}
                  <div>
                    <div style={{
                      height: "4px", background: "rgba(184,168,152,0.2)",
                      borderRadius: "2px", width: "64px", overflow: "hidden", marginBottom: "4px"
                    }}>
                      <div style={{
                        height: "100%", borderRadius: "2px",
                        width: `${contact.engagementScore}%`,
                        background: e.bar
                      }} />
                    </div>
                    <div style={{ fontSize: "10px", color: e.color, fontWeight: 600 }}>{e.label}</div>
                  </div>

                  {/* View button */}
                  <div>
                    <Link href={`/contacts/${contact.id}`}>
                      <button className="view-btn">
                        View <span className="arr">→</span>
                      </button>
                    </Link>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ── Custom delete confirmation modal ── */}
      {deleteModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(19,14,8,0.55)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={() => setDeleteModal(null)}>
          <div style={{
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
            border: "1px solid rgba(255,255,255,0.95)",
            borderRadius: "24px",
            padding: "32px 36px",
            width: "360px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
            animation: "modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both",
            textAlign: "center"
          }} onClick={e => e.stopPropagation()}>
            <style>{`
              @keyframes modalIn {
                from { opacity: 0; transform: scale(0.88) translateY(16px); }
                to   { opacity: 1; transform: scale(1) translateY(0); }
              }
            `}</style>
            <div style={{
              width: "58px", height: "58px", borderRadius: "18px", margin: "0 auto 18px",
              background: "rgba(232,86,26,0.08)", border: "1px solid rgba(232,86,26,0.16)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M4.5 7h19M11 7V5a1 1 0 011-1h4a1 1 0 011 1v2" stroke="#E8561A" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 7l1.3 15A2 2 0 009.3 24h9.4a2 2 0 002-1.9L22 7" stroke="#E8561A" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M11 12v6M14 11.5v7M17 12v6" stroke="#E8561A" strokeWidth="1.7" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ fontSize: "17px", fontWeight: 700, color: "#130E08", marginBottom: "8px" }}>
              Move to recycle bin?
            </div>
            <div style={{ fontSize: "13px", color: "#8A7565", lineHeight: 1.65, marginBottom: "26px" }}>
              <strong style={{ color: "#130E08" }}>{deleteModal.length} contact{deleteModal.length > 1 ? "s" : ""}</strong> will be moved to the recycle bin.<br />
              You can restore them within 7 days.
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setDeleteModal(null)}
                style={{
                  flex: 1, padding: "11px 0", borderRadius: "14px",
                  border: "1px solid rgba(184,168,152,0.3)",
                  background: "rgba(255,255,255,0.7)",
                  fontSize: "13px", fontWeight: 500, color: "#6B5040",
                  cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s"
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.95)" }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.7)" }}
              >Cancel</button>
              <button
                onClick={() => confirmBulkDelete(deleteModal)}
                style={{
                  flex: 1, padding: "11px 0", borderRadius: "14px",
                  border: "none",
                  background: "linear-gradient(135deg, #E8561A, #FF7A3D)",
                  fontSize: "13px", fontWeight: 600, color: "#fff",
                  cursor: "pointer", fontFamily: "inherit",
                  boxShadow: "0 4px 16px rgba(232,86,26,0.38)",
                  transition: "all 0.18s"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-1px)"
                  e.currentTarget.style.boxShadow = "0 6px 24px rgba(232,86,26,0.48)"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(232,86,26,0.38)"
                }}
              >Move to bin</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk action bar ── */}
      {someSelected && (
        <div style={{
          position: "fixed", bottom: "24px", left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(19,14,8,0.92)", backdropFilter: "blur(20px)",
          borderRadius: "16px", padding: "12px 20px",
          display: "flex", alignItems: "center", gap: "10px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.28)",
          zIndex: 100, animation: "slideUp 0.2s ease",
          border: "1px solid rgba(255,255,255,0.07)"
        }}>
          <span style={{ fontSize: "12.5px", fontWeight: 500, color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>
            {selected.length} selected
          </span>
          <div style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.1)" }} />
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowBulkTagPicker(!showBulkTagPicker)}
              disabled={bulkLoading}
              style={{
                padding: "7px 16px", borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.15)",
                background: showBulkTagPicker ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)",
                fontSize: "12px", fontWeight: 600,
                color: "rgba(255,255,255,0.8)",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <TagIcon size={12} strokeWidth={2} style={{ display: "inline", verticalAlign: "middle", marginRight: "5px" }} />
              Add tag
            </button>

            {showBulkTagPicker && (
              <div style={{
                position: "absolute",
                bottom: "44px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "#fff",
                border: "1px solid rgba(234,224,213,0.8)",
                borderRadius: "14px",
                padding: "12px",
                minWidth: "210px",
                boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
                zIndex: 200,
              }}>
                <div style={{
                  fontSize: "10px", fontWeight: 700,
                  color: "#B8A898", textTransform: "uppercase",
                  letterSpacing: "1px", marginBottom: "8px",
                }}>Select tag to add</div>
                {allTags.length === 0 ? (
                  <div style={{ fontSize: "12px", color: "#B8A898", padding: "8px 0" }}>
                    No tags yet — create tags first
                  </div>
                ) : (
                  allTags.map(tag => (
                    <div
                      key={tag.id}
                      onClick={() => bulkAddTag(tag.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: "7px 8px", borderRadius: "8px",
                        cursor: "pointer", transition: "background 0.12s",
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#FFF5EE"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    >
                      <div style={{
                        width: "8px", height: "8px",
                        borderRadius: "50%", background: tag.colour, flexShrink: 0,
                      }} />
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "#130E08" }}>
                        {tag.name}
                      </span>
                      <span style={{ fontSize: "10px", color: "#B8A898", marginLeft: "auto" }}>
                        {tag._count?.contacts || 0}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <button onClick={bulkVerify} disabled={bulkLoading} style={{
            padding: "7px 16px", borderRadius: "10px", border: "none",
            background: "linear-gradient(135deg, #E8561A, #FF7A3D)",
            fontSize: "12px", fontWeight: 600, color: "#fff",
            cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 3px 12px rgba(232,86,26,0.4)"
          }}>✓ Verify</button>
          <button onClick={bulkDelete} disabled={bulkLoading} style={{
            padding: "7px 16px", borderRadius: "10px",
            border: "1px solid rgba(240,100,80,0.3)",
            background: "transparent",
            fontSize: "12px", fontWeight: 600, color: "#F07060",
            cursor: "pointer", fontFamily: "inherit"
          }}>🗑 Delete</button>
          <button onClick={() => setSelected([])} style={{
            padding: "7px 14px", borderRadius: "10px",
            border: "none", background: "transparent",
            fontSize: "12px", fontWeight: 400, color: "rgba(255,255,255,0.25)",
            cursor: "pointer", fontFamily: "inherit"
          }}>Cancel</button>
        </div>
      )}
    </div>
  )
}
