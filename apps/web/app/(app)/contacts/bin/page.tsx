"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"

interface DeletedContact {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  company: string | null
  deletedAt: string
  deletedBy: string | null
}

const pageBg: React.CSSProperties = {
  minHeight: "100vh",
  background: `
    radial-gradient(ellipse at 12% 12%, rgba(255,175,110,0.38) 0%, transparent 45%),
    radial-gradient(ellipse at 88% 80%, rgba(232,86,26,0.13) 0%, transparent 45%),
    radial-gradient(ellipse at 72% 8%,  rgba(255,215,175,0.28) 0%, transparent 42%),
    radial-gradient(ellipse at 30% 85%, rgba(255,200,150,0.18) 0%, transparent 38%),
    #FDF5EE
  `,
  padding: "28px",
}

const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.58)",
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
  border: "1px solid rgba(255,255,255,0.88)",
  borderRadius: "20px",
  boxShadow: "0 8px 40px rgba(232,86,26,0.07), 0 2px 12px rgba(0,0,0,0.04)",
}

export default function RecycleBinPage() {
  type RowPhase = { action: "restore" | "delete"; phase: "flash" | "exit" }

  const [contacts, setContacts] = useState<DeletedContact[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])
  const [rowPhase, setRowPhase] = useState<Record<string, RowPhase>>({})
  const [working, setWorking] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: "green" | "red" } | null>(null)
  const [confirmModal, setConfirmModal] = useState<{ ids: string[]; mode: "delete" | "empty" } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { fetchBin() }, [])

  function showToast(msg: string, type: "green" | "red") {
    setToast({ msg, type })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3200)
  }

  async function fetchBin() {
    setLoading(true)
    const res = await fetch("/api/contacts/bin")
    const data = await res.json()
    setContacts(data.contacts || [])
    setSelected([])
    setRowPhase({})
    setLoading(false)
  }

  function getDaysLeft(deletedAt: string): number {
    const expires = new Date(deletedAt)
    expires.setDate(expires.getDate() + 7)
    return Math.max(0, Math.ceil((expires.getTime() - Date.now()) / 86400000))
  }

  function getTimeAgo(date: string): string {
    const diff = Date.now() - new Date(date).getTime()
    const m = Math.floor(diff / 60000)
    const h = Math.floor(diff / 3600000)
    const d = Math.floor(diff / 86400000)
    if (m < 60) return `${m}m ago`
    if (h < 24) return `${h}h ago`
    return `${d}d ago`
  }

  function toggleOne(id: string) {
    setSelected(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id])
  }
  function toggleAll() {
    setSelected(selected.length === contacts.length ? [] : contacts.map(c => c.id))
  }

  async function animateRows(ids: string[], action: "restore" | "delete") {
    // Phase 1: Flash (immediate color wash)
    setRowPhase(p => {
      const n = { ...p }
      ids.forEach(id => { n[id] = { action, phase: "flash" } })
      return n
    })
    await new Promise(r => setTimeout(r, 200))
    // Phase 2: Exit transition
    setRowPhase(p => {
      const n = { ...p }
      ids.forEach(id => { n[id] = { action, phase: "exit" } })
      return n
    })
    await new Promise(r => setTimeout(r, 550))
  }

  async function restore(ids: string[]) {
    setWorking(true)
    await animateRows(ids, "restore")
    await fetch("/api/contacts/bin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "restore", ids })
    })
    setContacts(p => p.filter(c => !ids.includes(c.id)))
    setSelected(p => p.filter(id => !ids.includes(id)))
    setRowPhase(p => { const n = { ...p }; ids.forEach(id => delete n[id]); return n })
    showToast(`${ids.length} contact${ids.length > 1 ? "s" : ""} restored successfully`, "green")
    setWorking(false)
  }

  async function permanentDelete(ids: string[]) {
    setConfirmModal({ ids, mode: "delete" })
  }

  async function executePermanentDelete(ids: string[]) {
    setConfirmModal(null)
    setWorking(true)
    await animateRows(ids, "delete")
    await fetch("/api/contacts/bin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "permanent_delete", ids })
    })
    setContacts(p => p.filter(c => !ids.includes(c.id)))
    setSelected(p => p.filter(id => !ids.includes(id)))
    setRowPhase(p => { const n = { ...p }; ids.forEach(id => delete n[id]); return n })
    showToast(`${ids.length} contact${ids.length > 1 ? "s" : ""} permanently deleted`, "red")
    setWorking(false)
  }

  async function emptyBin() {
    setConfirmModal({ ids: [], mode: "empty" })
  }

  async function executeEmptyBin() {
    setConfirmModal(null)
    setWorking(true)
    const allIds = contacts.map(c => c.id)
    await animateRows(allIds, "delete")
    await fetch("/api/contacts/bin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "empty_bin", ids: [] })
    })
    setContacts([])
    setSelected([])
    setRowPhase({})
    showToast("Recycle bin emptied", "red")
    setWorking(false)
  }

  const allSelected = contacts.length > 0 && selected.length === contacts.length
  const someSelected = selected.length > 0

  return (
    <div style={pageBg}>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(18px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes bulkIn {
          from { opacity: 0; transform: translateX(-50%) translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(14px) scale(0.94); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.88) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .bin-row:hover { background: rgba(232,86,26,0.025) !important; }
        .restore-btn { transition: all 0.18s; }
        .restore-btn:hover {
          background: rgba(15,110,86,0.14) !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(15,110,86,0.2);
        }
        .delete-btn-row { transition: all 0.18s; }
        .delete-btn-row:hover {
          background: rgba(153,60,29,0.12) !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(153,60,29,0.15);
        }
        .empty-btn { transition: all 0.18s; }
        .empty-btn:hover {
          background: rgba(153,60,29,0.12) !important;
          border-color: rgba(153,60,29,0.35) !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(153,60,29,0.15);
        }
        .checkbox { transition: all 0.15s cubic-bezier(0.34,1.56,0.64,1); }
        .checkbox:hover { transform: scale(1.15); }
      `}</style>

      <div style={{ maxWidth: "920px", margin: "0 auto" }}>

        {/* Top bar — back button + actions only (title handled by Topbar) */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: "24px", animation: "fadeSlideIn 0.4s ease both"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link href="/contacts">
              <button style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "0", background: "transparent", border: "none",
                fontSize: "13px", fontWeight: 500, color: "#B8A898",
                cursor: "pointer", fontFamily: "inherit", transition: "color 0.2s"
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = "#130E08"
                  e.currentTarget.style.transform = "translateX(-2px)"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = "#B8A898"
                  e.currentTarget.style.transform = "translateX(0)"
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 13L5 8L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back to contacts
              </button>
            </Link>

            {contacts.length > 0 && (
              <span style={{
                fontSize: "11.5px", fontWeight: 600, color: "#8A7565",
                background: "rgba(184,168,152,0.12)", border: "1px solid rgba(184,168,152,0.22)",
                padding: "2px 10px", borderRadius: "20px"
              }}>{contacts.length} contacts</span>
            )}
          </div>

          {contacts.length > 0 && (
            <button
              className="empty-btn"
              onClick={emptyBin}
              disabled={working}
              style={{
                padding: "9px 20px", borderRadius: "14px",
                border: "1px solid rgba(153,60,29,0.18)",
                background: "rgba(153,60,29,0.05)",
                backdropFilter: "blur(14px)",
                fontSize: "12.5px", fontWeight: 500,
                color: "#993C1D", cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <span style={{ marginRight: "6px", opacity: 0.7 }}>🗑</span>
              Empty bin
            </button>
          )}
        </div>

        {/* Warning banner */}
        <div style={{
          ...glass,
          padding: "14px 20px", marginBottom: "16px",
          display: "flex", alignItems: "center", gap: "12px",
          borderLeft: "3px solid #E8561A",
          borderRadius: "14px",
          animation: "fadeSlideIn 0.5s 0.05s ease both"
        }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "10px", flexShrink: 0,
            background: "rgba(232,86,26,0.08)", border: "1px solid rgba(232,86,26,0.14)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px"
          }}>⏱</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#130E08", marginBottom: "1px" }}>
              Auto-deletion after 7 days
            </div>
            <div style={{ fontSize: "11.5px", color: "#8A7565" }}>
              Contacts are permanently deleted 7 days after being moved to the bin. Restore them before they expire.
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ ...glass, padding: "72px", textAlign: "center", animation: "fadeSlideIn 0.4s ease both" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%",
              border: "3px solid rgba(232,86,26,0.12)", borderTopColor: "#E8561A",
              animation: "spin 0.75s linear infinite", margin: "0 auto 14px"
            }} />
            <div style={{ fontSize: "13px", color: "#B8A898" }}>Loading recycle bin...</div>
          </div>
        ) : contacts.length === 0 ? (
          <div style={{
            ...glass, padding: "72px 40px", textAlign: "center",
            animation: "fadeSlideIn 0.5s 0.1s ease both"
          }}>
            <div style={{
              width: "80px", height: "80px", borderRadius: "24px", margin: "0 auto 22px",
              background: "linear-gradient(145deg, rgba(232,86,26,0.10), rgba(255,154,92,0.06))",
              border: "1px solid rgba(232,86,26,0.14)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 20px rgba(232,86,26,0.08), inset 0 1px 0 rgba(255,255,255,0.6)"
            }}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path d="M6 9h24" stroke="url(#tg1)" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M15 9V7a1 1 0 011-1h4a1 1 0 011 1v2" stroke="url(#tg2)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 9l1.8 18.1A2 2 0 0011.8 29h12.4a2 2 0 002-1.9L28 9" stroke="url(#tg3)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 15v8M18 14v9M22 15v8" stroke="url(#tg4)" strokeWidth="1.8" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="tg1" x1="6" y1="9" x2="30" y2="9" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#E8561A"/><stop offset="1" stopColor="#FF9A5C"/>
                  </linearGradient>
                  <linearGradient id="tg2" x1="15" y1="6" x2="21" y2="9" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#E8561A"/><stop offset="1" stopColor="#FF9A5C"/>
                  </linearGradient>
                  <linearGradient id="tg3" x1="8" y1="9" x2="28" y2="29" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#E8561A"/><stop offset="1" stopColor="#FF9A5C"/>
                  </linearGradient>
                  <linearGradient id="tg4" x1="14" y1="14" x2="22" y2="23" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#E8561A" stopOpacity="0.6"/><stop offset="1" stopColor="#FF9A5C" stopOpacity="0.4"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div style={{ fontSize: "17px", fontWeight: 700, color: "#130E08", marginBottom: "6px" }}>
              Recycle bin is empty
            </div>
            <div style={{ fontSize: "13px", color: "#B8A898", marginBottom: "28px", lineHeight: 1.6 }}>
              Deleted contacts will appear here for 7 days<br />before being permanently removed
            </div>
            <Link href="/contacts">
              <button style={{
                padding: "10px 24px",
                background: "linear-gradient(135deg, #E8561A, #FF7A3D)",
                color: "#fff", border: "none", borderRadius: "14px",
                fontSize: "13px", fontWeight: 600, cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 4px 18px rgba(232,86,26,0.35)",
                transition: "all 0.18s"
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-2px)"
                  e.currentTarget.style.boxShadow = "0 6px 24px rgba(232,86,26,0.42)"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.boxShadow = "0 4px 18px rgba(232,86,26,0.35)"
                }}
              >← Back to contacts</button>
            </Link>
          </div>
        ) : (
          <div style={{
            ...glass, overflow: "hidden",
            animation: "fadeSlideIn 0.5s 0.1s ease both"
          }}>
            {/* Gradient accent */}
            <div style={{ height: "3px", background: "linear-gradient(90deg, #E8561A, #FF9A5C, #FFCFA0)" }} />

            {/* Table header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "48px 1fr 160px 130px 88px 180px",
              gap: "8px", padding: "12px 22px",
              borderBottom: "1px solid rgba(232,86,26,0.07)",
              alignItems: "center",
              background: "rgba(253,245,238,0.5)"
            }}>
              <div
                className="checkbox"
                onClick={toggleAll}
                style={{
                  width: "18px", height: "18px", borderRadius: "6px",
                  border: `2px solid ${allSelected ? "#E8561A" : "rgba(184,168,152,0.4)"}`,
                  background: allSelected
                    ? "linear-gradient(135deg, #E8561A, #FF7A3D)"
                    : "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "10px", color: "#fff", fontWeight: 700,
                  boxShadow: allSelected ? "0 2px 8px rgba(232,86,26,0.3)" : "none"
                }}
              >{allSelected ? "✓" : ""}</div>
              {["Contact", "Company", "Deleted by", "Deleted", "Expires in"].map((h, i) => (
                <div key={i} style={{
                  fontSize: "10px", fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.9px", color: "#B8A898"
                }}>{h}</div>
              ))}
            </div>

            {/* Rows */}
            {contacts.map((contact, i) => {
              const isSelected = selected.includes(contact.id)
              const rp = rowPhase[contact.id]
              const isFlash = rp?.phase === "flash"
              const isExit = rp?.phase === "exit"
              const isRestore = rp?.action === "restore"
              const isDelete = rp?.action === "delete"
              const daysLeft = getDaysLeft(contact.deletedAt)
              const isExpiringSoon = daysLeft <= 1

              const rowBg = isFlash && isRestore
                ? "rgba(15,110,86,0.14)"
                : isFlash && isDelete
                ? "rgba(153,60,29,0.12)"
                : isSelected ? "rgba(232,86,26,0.03)" : "transparent"

              return (
                <div
                  key={contact.id}
                  className={!rp ? "bin-row" : ""}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "48px 1fr 160px 130px 88px 180px",
                    gap: "8px", padding: "14px 22px",
                    borderBottom: i < contacts.length - 1 ? "1px solid rgba(232,86,26,0.05)" : "none",
                    alignItems: "center",
                    background: rowBg,
                    opacity: isExit ? 0 : 1,
                    transform: isExit
                      ? isRestore
                        ? "translateX(56px) scale(0.96)"
                        : "translateX(-12px) scale(0.94)"
                      : "none",
                    filter: isExit ? "blur(4px)" : "none",
                    maxHeight: isExit && isDelete ? "0px" : "120px",
                    paddingTop: isExit && isDelete ? "0" : undefined,
                    paddingBottom: isExit && isDelete ? "0" : undefined,
                    overflow: "hidden",
                    transition: isExit
                      ? "opacity 0.52s ease, transform 0.52s cubic-bezier(0.4,0,0.2,1), filter 0.52s ease, max-height 0.52s ease, padding 0.52s ease"
                      : isFlash
                      ? "background 0.12s ease"
                      : "background 0.15s"
                  }}
                >
                  <div
                    className="checkbox"
                    onClick={() => toggleOne(contact.id)}
                    style={{
                      width: "18px", height: "18px", borderRadius: "6px",
                      border: `2px solid ${isSelected ? "#E8561A" : "rgba(184,168,152,0.35)"}`,
                      background: isSelected
                        ? "linear-gradient(135deg, #E8561A, #FF7A3D)"
                        : "rgba(255,255,255,0.6)",
                      cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "10px", color: "#fff", fontWeight: 700,
                      boxShadow: isSelected ? "0 2px 8px rgba(232,86,26,0.28)" : "none"
                    }}
                  >{isSelected ? "✓" : ""}</div>

                  <div>
                    <div style={{
                      fontSize: "13px", fontWeight: 500, color: "#8A7565",
                      textDecoration: "line-through", marginBottom: "2px",
                      opacity: 0.85
                    }}>
                      {contact.firstName || ""} {contact.lastName || ""}
                      {!contact.firstName && !contact.lastName ? contact.email.split("@")[0] : ""}
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#B8A898" }}>{contact.email}</div>
                  </div>

                  <div style={{ fontSize: "12.5px", color: "#B8A898" }}>
                    {contact.company || <span style={{ color: "#D0C4B8" }}>—</span>}
                  </div>

                  <div style={{
                    fontSize: "12px", color: "#B8A898",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                  }}>
                    {contact.deletedBy || "Unknown"}
                  </div>

                  <div style={{ fontSize: "12px", color: "#B8A898" }}>
                    {getTimeAgo(contact.deletedAt)}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                    <span style={{
                      fontSize: "11px", fontWeight: 600,
                      padding: "3px 9px", borderRadius: "20px",
                      background: isExpiringSoon
                        ? "rgba(153,60,29,0.08)"
                        : "rgba(184,168,152,0.1)",
                      color: isExpiringSoon ? "#993C1D" : "#6B5040",
                      border: `1px solid ${isExpiringSoon ? "rgba(153,60,29,0.18)" : "rgba(184,168,152,0.2)"}`,
                      whiteSpace: "nowrap"
                    }}>
                      {daysLeft === 0 ? "Today" : `${daysLeft}d`}
                    </span>
                    <button
                      className="restore-btn"
                      onClick={() => restore([contact.id])}
                      disabled={working}
                      style={{
                        padding: "5px 12px", borderRadius: "9px",
                        border: "1px solid rgba(15,110,86,0.2)",
                        background: "rgba(15,110,86,0.06)",
                        fontSize: "11.5px", fontWeight: 600, color: "#0F6E56",
                        cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
                        display: "flex", alignItems: "center", gap: "4px"
                      }}
                    >
                      <span>↩</span> Restore
                    </button>
                    <button
                      className="delete-btn-row"
                      onClick={() => permanentDelete([contact.id])}
                      disabled={working}
                      style={{
                        width: "28px", height: "28px", borderRadius: "8px",
                        border: "1px solid rgba(153,60,29,0.15)",
                        background: "rgba(153,60,29,0.05)",
                        fontSize: "13px", color: "#993C1D",
                        cursor: "pointer", fontFamily: "inherit",
                        display: "flex", alignItems: "center", justifyContent: "center"
                      }}
                      title="Delete permanently"
                    >×</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Confirm modal (permanent delete / empty) ── */}
      {confirmModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 300,
          background: "rgba(19,14,8,0.6)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }} onClick={() => setConfirmModal(null)}>
          <div style={{
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
            border: "1px solid rgba(255,255,255,0.95)",
            borderRadius: "24px",
            padding: "32px 36px",
            width: "380px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.1)",
            animation: "modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both",
            textAlign: "center"
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              width: "58px", height: "58px", borderRadius: "18px", margin: "0 auto 18px",
              background: "rgba(153,60,29,0.07)", border: "1px solid rgba(153,60,29,0.16)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 9v6M14 18.5v.5" stroke="#993C1D" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M11.6 4.5a2.7 2.7 0 014.8 0l8 14A2.7 2.7 0 0122 23H6a2.7 2.7 0 01-2.4-4.5l8-14z" stroke="#993C1D" strokeWidth="1.9" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ fontSize: "17px", fontWeight: 700, color: "#130E08", marginBottom: "8px" }}>
              {confirmModal.mode === "empty" ? "Empty recycle bin?" : `Permanently delete ${confirmModal.ids.length} contact${confirmModal.ids.length > 1 ? "s" : ""}?`}
            </div>
            <div style={{ fontSize: "13px", color: "#8A7565", lineHeight: 1.65, marginBottom: "26px" }}>
              {confirmModal.mode === "empty"
                ? "All contacts in the bin will be permanently deleted. This cannot be undone."
                : "These contacts will be permanently removed and cannot be recovered."}
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setConfirmModal(null)}
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
                onClick={() => confirmModal.mode === "empty" ? executeEmptyBin() : executePermanentDelete(confirmModal.ids)}
                style={{
                  flex: 1, padding: "11px 0", borderRadius: "14px",
                  border: "none",
                  background: "linear-gradient(135deg, #993C1D, #C04A22)",
                  fontSize: "13px", fontWeight: 600, color: "#fff",
                  cursor: "pointer", fontFamily: "inherit",
                  boxShadow: "0 4px 16px rgba(153,60,29,0.4)",
                  transition: "all 0.15s"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-1px)"
                  e.currentTarget.style.boxShadow = "0 6px 22px rgba(153,60,29,0.5)"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(153,60,29,0.4)"
                }}
              >Delete permanently</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk action bar */}
      {someSelected && (
        <div style={{
          position: "fixed", bottom: "28px", left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(19,14,8,0.94)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "20px",
          padding: "14px 22px",
          display: "flex", alignItems: "center", gap: "10px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.32), 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)",
          zIndex: 100, whiteSpace: "nowrap",
          border: "1px solid rgba(255,255,255,0.07)",
          animation: "bulkIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both"
        }}>
          <div style={{
            background: "linear-gradient(135deg, #E8561A, #FF7A3D)",
            borderRadius: "10px", padding: "4px 10px",
            fontSize: "11.5px", fontWeight: 700, color: "#fff",
            boxShadow: "0 2px 8px rgba(232,86,26,0.4)"
          }}>{selected.length}</div>
          <span style={{ fontSize: "12.5px", fontWeight: 400, color: "rgba(255,255,255,0.5)" }}>
            selected
          </span>

          <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.08)", margin: "0 4px" }} />

          <button
            onClick={() => restore(selected)}
            disabled={working}
            style={{
              padding: "8px 18px", borderRadius: "12px",
              border: "1px solid rgba(15,110,86,0.4)",
              background: "rgba(15,110,86,0.2)",
              fontSize: "12.5px", fontWeight: 600, color: "#4ADE80",
              cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: "6px",
              transition: "all 0.18s"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(15,110,86,0.35)"
              e.currentTarget.style.transform = "translateY(-1px)"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(15,110,86,0.2)"
              e.currentTarget.style.transform = "translateY(0)"
            }}
          >
            <span style={{ fontSize: "14px" }}>↩</span>
            Restore all
          </button>

          <button
            onClick={() => permanentDelete(selected)}
            disabled={working}
            style={{
              padding: "8px 18px", borderRadius: "12px",
              border: "1px solid rgba(153,60,29,0.35)",
              background: "rgba(153,60,29,0.18)",
              fontSize: "12.5px", fontWeight: 600, color: "#F87171",
              cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: "6px",
              transition: "all 0.18s"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(153,60,29,0.32)"
              e.currentTarget.style.transform = "translateY(-1px)"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(153,60,29,0.18)"
              e.currentTarget.style.transform = "translateY(0)"
            }}
          >
            <span style={{ fontSize: "13px" }}>🗑</span>
            Delete permanently
          </button>

          <button
            onClick={() => setSelected([])}
            style={{
              padding: "8px 14px", borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.07)",
              background: "transparent",
              fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,0.28)",
              cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.15s"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = "rgba(255,255,255,0.55)"
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = "rgba(255,255,255,0.28)"
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"
            }}
          >Cancel</button>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: "fixed", bottom: someSelected ? "100px" : "28px", right: "28px",
          background: toast.type === "green"
            ? "rgba(15,110,86,0.95)"
            : "rgba(153,60,29,0.95)",
          backdropFilter: "blur(16px)",
          borderRadius: "14px",
          padding: "12px 20px",
          display: "flex", alignItems: "center", gap: "10px",
          boxShadow: `0 8px 28px ${toast.type === "green" ? "rgba(15,110,86,0.3)" : "rgba(153,60,29,0.3)"}`,
          zIndex: 200,
          border: `1px solid ${toast.type === "green" ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}`,
          animation: "toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both"
        }}>
          <span style={{ fontSize: "16px" }}>{toast.type === "green" ? "✓" : "🗑"}</span>
          <span style={{ fontSize: "12.5px", fontWeight: 500, color: "#fff" }}>{toast.msg}</span>
        </div>
      )}
    </div>
  )
}
