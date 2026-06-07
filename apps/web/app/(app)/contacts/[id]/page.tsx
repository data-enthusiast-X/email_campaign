"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

interface Contact {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  company: string | null
  jobTitle: string | null
  subscriptionStatus: string
  verificationStatus: string
  engagementScore: number
  lifecycleStage: string
  source: string | null
  createdAt: string
  country: string | null
  city: string | null
  timezone: string | null
  lastSeenDevice: string | null
  lastSeenClient: string | null
  lastSeenAt: string | null
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
  padding: "28px 28px",
}

const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.58)",
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
  border: "1px solid rgba(255,255,255,0.88)",
  borderRadius: "24px",
  boxShadow: "0 8px 40px rgba(232,86,26,0.07), 0 2px 12px rgba(0,0,0,0.04)",
}

const glassInput: React.CSSProperties = {
  width: "100%",
  padding: "10px 13px",
  background: "rgba(255,255,255,0.65)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(232,86,26,0.15)",
  borderRadius: "11px",
  fontSize: "13px",
  fontFamily: "inherit",
  color: "#130E08",
  outline: "none",
  boxSizing: "border-box",
}

const lbl: React.CSSProperties = {
  fontSize: "10px", fontWeight: 700, color: "#B8A898",
  textTransform: "uppercase", letterSpacing: "0.9px",
  marginBottom: "5px", display: "block"
}

export default function ContactDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", company: "", jobTitle: "" })
  const [contactTags, setContactTags] = useState<any[]>([])
  const [allTags, setAllTags] = useState<any[]>([])
  const [showTagPicker, setShowTagPicker] = useState(false)
  const [activities, setActivities] = useState<any[]>([])

  useEffect(() => { fetchContact(); fetchTags(); fetchActivity() }, [id])

  async function fetchActivity() {
    try {
      const res = await fetch(`/api/activity?contactId=${id}`)
      if (res.ok) {
        const data = await res.json()
        setActivities(data.logs || [])
      }
    } catch { /* silent */ }
  }

  async function fetchContact() {
    try {
      const res = await fetch(`/api/contacts/${id}`)
      if (!res.ok) { router.push("/contacts"); return }
      const data = await res.json()
      setContact(data.contact)
      setForm({
        firstName: data.contact.firstName || "",
        lastName: data.contact.lastName || "",
        phone: data.contact.phone || "",
        company: data.contact.company || "",
        jobTitle: data.contact.jobTitle || "",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    const res = await fetch(`/api/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
    if (res.ok) { await fetchContact(); setEditing(false) }
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm("Delete this contact? This cannot be undone.")) return
    setDeleting(true)
    await fetch(`/api/contacts/${id}`, { method: "DELETE" })
    router.push("/contacts")
  }

  async function fetchTags() {
    const [contactRes, allRes] = await Promise.all([
      fetch(`/api/contacts/${id}/tags`),
      fetch("/api/tags"),
    ])
    const contactData = await contactRes.json()
    const allData = await allRes.json()
    setContactTags(contactData.tags || [])
    setAllTags(allData.tags || [])
  }

  async function addTag(tagId: string) {
    await fetch(`/api/contacts/${id}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagId }),
    })
    setShowTagPicker(false)
    fetchTags()
  }

  async function removeTag(tagId: string) {
    await fetch(`/api/contacts/${id}/tags`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagId }),
    })
    fetchTags()
  }

  function verifBadge(s: string) {
    if (s === "verified")   return { label: "✓ Verified",   bg: "rgba(15,110,86,0.08)",   color: "#0F6E56",  border: "rgba(15,110,86,0.2)" }
    if (s === "invalid")    return { label: "✗ Invalid",    bg: "rgba(153,60,29,0.08)",   color: "#993C1D",  border: "rgba(153,60,29,0.2)" }
    if (s === "risky")      return { label: "⚠ Risky",      bg: "rgba(133,79,11,0.08)",   color: "#854F0B",  border: "rgba(133,79,11,0.2)" }
    return                         { label: "◌ Unverified", bg: "rgba(184,168,152,0.1)",  color: "#8A7565",  border: "rgba(184,168,152,0.25)" }
  }

  function subBadge(s: string) {
    if (s === "subscribed")   return { label: "Subscribed",   bg: "rgba(15,110,86,0.08)",  color: "#0F6E56", border: "rgba(15,110,86,0.2)" }
    if (s === "unsubscribed") return { label: "Unsubscribed", bg: "rgba(153,60,29,0.08)",  color: "#993C1D", border: "rgba(153,60,29,0.2)" }
    return                           { label: s,              bg: "rgba(184,168,152,0.1)", color: "#8A7565", border: "rgba(184,168,152,0.25)" }
  }

  if (loading) return (
    <div style={{ ...pageBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ ...glass, padding: "48px 64px", textAlign: "center" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <div style={{
          width: "40px", height: "40px", borderRadius: "50%",
          border: "3px solid rgba(232,86,26,0.12)", borderTopColor: "#E8561A",
          animation: "spin 0.75s linear infinite", margin: "0 auto 14px"
        }} />
        <div style={{ fontSize: "13px", color: "#B8A898" }}>Loading contact...</div>
      </div>
    </div>
  )

  if (!contact) return null

  const v = verifBadge(contact.verificationStatus)
  const s = subBadge(contact.subscriptionStatus)
  const initial = (contact.firstName?.[0] || contact.email[0]).toUpperCase()
  const displayName = [contact.firstName, contact.lastName].filter(Boolean).join(" ") || contact.email.split("@")[0]
  const score = contact.engagementScore

  const Badge = ({ label, bg, color, border }: { label: string; bg: string; color: string; border: string }) => (
    <span style={{
      padding: "5px 13px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
      background: bg, color, border: `1px solid ${border}`,
      backdropFilter: "blur(8px)"
    }}>{label}</span>
  )

  return (
    <div style={pageBg}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* ── Top bar ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <Link href="/contacts">
            <button style={{
              display: "flex", alignItems: "center", gap: "7px",
              padding: "0", background: "transparent", border: "none",
              fontSize: "13px", fontWeight: 500, color: "#B8A898",
              cursor: "pointer", fontFamily: "inherit",
              transition: "color 0.2s"
            }}
              onMouseEnter={e => (e.currentTarget.style.color = "#130E08")}
              onMouseLeave={e => (e.currentTarget.style.color = "#B8A898")}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 13L5 8L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to contacts
            </button>
          </Link>
          <div style={{ display: "flex", gap: "8px" }}>
            {!editing ? (
              <>
                <button onClick={() => setEditing(true)} style={{
                  display: "flex", alignItems: "center", gap: "7px",
                  padding: "9px 20px", borderRadius: "14px",
                  background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)",
                  border: "1px solid rgba(255,255,255,0.95)",
                  fontSize: "13px", fontWeight: 500, color: "#130E08",
                  cursor: "pointer", fontFamily: "inherit",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.06)"
                }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="#6B5040" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Edit contact
                </button>
                <button onClick={handleDelete} disabled={deleting} style={{
                  display: "flex", alignItems: "center", gap: "7px",
                  padding: "9px 20px", borderRadius: "14px",
                  background: "rgba(153,60,29,0.06)", backdropFilter: "blur(14px)",
                  border: "1px solid rgba(153,60,29,0.14)",
                  fontSize: "13px", fontWeight: 500, color: "#993C1D",
                  cursor: "pointer", fontFamily: "inherit",
                  boxShadow: "0 2px 10px rgba(153,60,29,0.08)"
                }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 3.5h10M5 3.5V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1M5.5 6v4M8.5 6v4M3 3.5l.667 7.5A1 1 0 004.66 12h4.68a1 1 0 00.993-.9L11 3.5" stroke="#993C1D" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {deleting ? "Moving to bin..." : "🗑 Move to bin"}
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(false)} style={{
                  display: "flex", alignItems: "center", gap: "7px",
                  padding: "9px 20px", borderRadius: "14px",
                  background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)",
                  border: "1px solid rgba(255,255,255,0.95)",
                  fontSize: "13px", fontWeight: 500, color: "#6B5040",
                  cursor: "pointer", fontFamily: "inherit",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.06)"
                }}>Cancel</button>
                <button onClick={handleSave} disabled={saving} style={{
                  display: "flex", alignItems: "center", gap: "7px",
                  padding: "9px 22px", borderRadius: "14px",
                  background: "linear-gradient(135deg, #E8561A, #FF7A3D)",
                  border: "none", fontSize: "13px", fontWeight: 600, color: "#fff",
                  cursor: "pointer", fontFamily: "inherit",
                  boxShadow: "0 4px 18px rgba(232,86,26,0.38)"
                }}>
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Profile card ── */}
        <div style={{ ...glass, overflow: "hidden", marginBottom: "14px" }}>
          {/* Gradient accent strip */}
          <div style={{ height: "6px", background: "linear-gradient(90deg, #E8561A, #FF9A5C, #FFCFA0)" }} />
          <div style={{ padding: "24px 28px", display: "flex", gap: "22px", alignItems: "flex-start" }}>
            {/* Avatar */}
            <div style={{
              width: "80px", height: "80px", borderRadius: "24px", flexShrink: 0,
              background: "linear-gradient(135deg, #E8561A, #FF9060)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "30px", fontWeight: 700, color: "#fff",
              boxShadow: "0 8px 28px rgba(232,86,26,0.38)"
            }}>{initial}</div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: "23px", fontWeight: 700, color: "#130E08", marginBottom: "3px", lineHeight: 1.2 }}>
                {displayName}
              </h1>
              <div style={{ fontSize: "13px", color: "#B8A898", marginBottom: "14px" }}>
                {contact.email}
              </div>
              <div style={{ display: "flex", gap: "7px", flexWrap: "wrap", alignItems: "center" }}>
                <Badge {...v} />
                <Badge {...s} />
                <span style={{
                  padding: "5px 13px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
                  background: "rgba(232,86,26,0.07)", color: "#7A3010",
                  border: "1px solid rgba(232,86,26,0.15)"
                }}>◆ {contact.lifecycleStage}</span>
                {contact.subscriptionStatus === "unsubscribed" && (
                  <button
                    onClick={async () => {
                      await fetch(`/api/contacts/${contact.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ subscriptionStatus: "subscribed" })
                      })
                      fetchContact()
                    }}
                    style={{
                      padding: "5px 13px", borderRadius: "20px",
                      border: "1px solid rgba(15,110,86,0.25)",
                      background: "rgba(15,110,86,0.07)",
                      fontSize: "11px", fontWeight: 600, color: "#0F6E56",
                      cursor: "pointer", fontFamily: "inherit",
                      transition: "all 0.15s"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "rgba(15,110,86,0.14)"
                      e.currentTarget.style.transform = "translateY(-1px)"
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "rgba(15,110,86,0.07)"
                      e.currentTarget.style.transform = "translateY(0)"
                    }}
                  >↩ Resubscribe</button>
                )}
              </div>

              {/* Auto-detected info */}
              {(contact.country || contact.lastSeenDevice) ? (
                <div style={{
                  display: "flex", flexWrap: "wrap", gap: "10px",
                  marginTop: "12px", paddingTop: "12px",
                  borderTop: "1px solid rgba(232,86,26,0.07)"
                }}>
                  {contact.country && (
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#6B5040" }}>
                      <span>📍</span>
                      {contact.city ? `${contact.city}, ` : ""}{contact.country}
                    </span>
                  )}
                  {contact.timezone && (
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#6B5040" }}>
                      <span>🕐</span>{contact.timezone}
                    </span>
                  )}
                  {contact.lastSeenDevice && (
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#6B5040" }}>
                      <span>📱</span>{contact.lastSeenDevice}
                    </span>
                  )}
                  {contact.lastSeenClient && (
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#6B5040" }}>
                      <span>📧</span>{contact.lastSeenClient}
                    </span>
                  )}
                  {contact.lastSeenAt && (
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#6B5040" }}>
                      <span>🟢</span>Last seen {new Date(contact.lastSeenAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              ) : (
                <div style={{
                  marginTop: "12px", paddingTop: "12px",
                  borderTop: "1px solid rgba(232,86,26,0.07)",
                  fontSize: "11.5px", color: "#C8B8A8",
                  display: "flex", alignItems: "center", gap: "6px"
                }}>
                  <span>📍</span>
                  Location and device info will appear automatically after this contact opens their first email
                </div>
              )}
            </div>

            {/* Engagement score */}
            <div style={{
              ...glass,
              padding: "14px 18px", minWidth: "130px", textAlign: "center",
              flexShrink: 0
            }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#B8A898", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>
                Engagement
              </div>
              <div style={{ fontSize: "28px", fontWeight: 700, color: "#E8561A", marginBottom: "8px", lineHeight: 1 }}>
                {score}
                <span style={{ fontSize: "13px", color: "#B8A898", fontWeight: 400 }}>/100</span>
              </div>
              <div style={{ height: "5px", borderRadius: "3px", background: "rgba(232,86,26,0.1)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: "3px",
                  width: `${score}%`,
                  background: "linear-gradient(90deg, #E8561A, #FF7A3D)"
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Two column row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>

          {/* Contact details */}
          <div style={{ ...glass, padding: "22px 24px" }}>
            <div style={{
              fontSize: "11px", fontWeight: 700, color: "#B8A898",
              textTransform: "uppercase", letterSpacing: "0.9px", marginBottom: "16px"
            }}>Contact details</div>

            {editing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={lbl}>First name</label>
                    <input style={glassInput} value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
                  </div>
                  <div>
                    <label style={lbl}>Last name</label>
                    <input style={glassInput} value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label style={lbl}>Company</label>
                  <input style={glassInput} value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
                </div>
                <div>
                  <label style={lbl}>Job title</label>
                  <input style={glassInput} value={form.jobTitle} onChange={e => setForm(f => ({ ...f, jobTitle: e.target.value }))} />
                </div>
                <div>
                  <label style={lbl}>Phone</label>
                  <input style={glassInput} type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {[
                  { label: "First name", value: contact.firstName },
                  { label: "Last name",  value: contact.lastName },
                  { label: "Company",    value: contact.company },
                  { label: "Job title",  value: contact.jobTitle },
                  { label: "Phone",      value: contact.phone },
                ].map((field, i, arr) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 0",
                    borderBottom: i < arr.length - 1 ? "1px solid rgba(232,86,26,0.06)" : "none"
                  }}>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "#B8A898", textTransform: "uppercase", letterSpacing: "0.7px" }}>
                      {field.label}
                    </span>
                    <span style={{ fontSize: "13px", color: field.value ? "#130E08" : "#C8B8A8", fontWeight: field.value ? 500 : 400 }}>
                      {field.value || "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Meta info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ ...glass, padding: "22px 24px", flex: 1 }}>
              <div style={{
                fontSize: "11px", fontWeight: 700, color: "#B8A898",
                textTransform: "uppercase", letterSpacing: "0.9px", marginBottom: "16px"
              }}>Account info</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {[
                  { label: "Source",    value: contact.source },
                  { label: "Lifecycle", value: contact.lifecycleStage },
                  { label: "Added",     value: new Date(contact.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) },
                ].map((field, i, arr) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 0",
                    borderBottom: i < arr.length - 1 ? "1px solid rgba(232,86,26,0.06)" : "none"
                  }}>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "#B8A898", textTransform: "uppercase", letterSpacing: "0.7px" }}>
                      {field.label}
                    </span>
                    <span style={{ fontSize: "13px", color: field.value ? "#130E08" : "#C8B8A8", fontWeight: 500 }}>
                      {field.value || "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick action */}
            <div style={{ ...glass, padding: "16px 20px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#B8A898", textTransform: "uppercase", letterSpacing: "0.9px", marginBottom: "12px" }}>
                Quick actions
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <button style={{
                  padding: "9px 14px", borderRadius: "12px", border: "none", textAlign: "left",
                  background: "rgba(232,86,26,0.06)", color: "#7A3010",
                  fontSize: "12px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit"
                }}>📧 Send campaign to this contact</button>
                <button style={{
                  padding: "9px 14px", borderRadius: "12px", border: "none", textAlign: "left",
                  background: "rgba(15,110,86,0.06)", color: "#0F6E56",
                  fontSize: "12px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit"
                }}>✓ Verify email address</button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tags card ── */}
        <div style={{ ...glass, padding: "22px 24px", marginBottom: "14px" }}>
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", marginBottom: "14px",
          }}>
            <div style={{
              fontSize: "11px", fontWeight: 700, color: "#B8A898",
              textTransform: "uppercase", letterSpacing: "0.9px",
            }}>Tags</div>
            <button
              onClick={() => setShowTagPicker(!showTagPicker)}
              style={{
                padding: "5px 14px", borderRadius: "12px",
                border: "1px solid rgba(232,86,26,0.2)",
                background: "rgba(232,86,26,0.06)",
                fontSize: "11.5px", fontWeight: 500, color: "#7A3010",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >+ Add tag</button>
          </div>

          {contactTags.length === 0 && !showTagPicker && (
            <div style={{ fontSize: "12px", color: "#B8A898" }}>
              No tags yet — click Add tag to label this contact
            </div>
          )}

          {contactTags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: showTagPicker ? "12px" : "0" }}>
              {contactTags.map(ct => (
                <span
                  key={ct.tag.id}
                  onClick={() => removeTag(ct.tag.id)}
                  title="Click to remove"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "5px",
                    padding: "4px 10px", borderRadius: "20px",
                    fontSize: "12px", fontWeight: 600,
                    background: ct.tag.colour + "22", color: ct.tag.colour,
                    cursor: "pointer", transition: "opacity 0.15s",
                    border: `1px solid ${ct.tag.colour}33`,
                  }}
                >
                  {ct.tag.name} <span style={{ opacity: 0.6 }}>×</span>
                </span>
              ))}
            </div>
          )}

          {showTagPicker && (
            <div style={{
              background: "rgba(232,86,26,0.04)", borderRadius: "12px",
              border: "1px solid rgba(232,86,26,0.08)",
              padding: "12px", marginTop: contactTags.length > 0 ? "12px" : "0",
            }}>
              <div style={{ fontSize: "11px", color: "#B8A898", marginBottom: "8px" }}>
                Select a tag to add:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {allTags.filter(t => !contactTags.find(ct => ct.tag.id === t.id)).map(tag => (
                  <span
                    key={tag.id}
                    onClick={() => addTag(tag.id)}
                    style={{
                      display: "inline-flex", alignItems: "center",
                      padding: "4px 11px", borderRadius: "20px",
                      fontSize: "12px", fontWeight: 600,
                      background: tag.colour + "22", color: tag.colour,
                      cursor: "pointer", border: `1px solid ${tag.colour}44`,
                      transition: "opacity 0.15s",
                    }}
                  >{tag.name}</span>
                ))}
                {allTags.filter(t => !contactTags.find(ct => ct.tag.id === t.id)).length === 0 && (
                  <div style={{ fontSize: "12px", color: "#B8A898" }}>
                    All tags already added.{" "}
                    <Link href="/contacts/tags" style={{ color: "#E8561A" }}>
                      Create new tags →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Activity card ── */}
        <div style={{ ...glass, padding: "22px 28px" }}>
          <div style={{
            fontSize: "11px", fontWeight: 700, color: "#B8A898",
            textTransform: "uppercase", letterSpacing: "0.9px", marginBottom: "20px"
          }}>Activity</div>

          {activities.length === 0 ? (
            <div>
              {/* Contact created baseline event */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    background: "rgba(232,86,26,0.08)", border: "1px solid rgba(232,86,26,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px"
                  }}>✦</div>
                </div>
                <div style={{ paddingTop: "6px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "#130E08", marginBottom: "2px" }}>
                    Contact added {contact.source ? `via ${contact.source}` : ""}
                  </div>
                  <div style={{ fontSize: "11px", color: "#B8A898" }}>
                    {new Date(contact.createdAt).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </div>
                </div>
              </div>
              <div style={{
                padding: "16px 20px",
                background: "rgba(232,86,26,0.04)", borderRadius: "14px",
                border: "1px solid rgba(232,86,26,0.08)",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "13px", color: "#B8A898", lineHeight: 1.6 }}>
                  Campaign opens, clicks, and replies will appear here<br />
                  <span style={{ fontSize: "12px" }}>once you send campaigns to this contact</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {activities.map((log, i) => {
                const isLast = i === activities.length - 1
                const icon = log.action === "contact_created" ? "✦"
                  : log.action === "contact_edited" ? "✎"
                  : log.action === "tag_added" ? "#"
                  : log.action === "tag_removed" ? "#"
                  : "·"
                const iconColor = log.action === "contact_created" ? "rgba(232,86,26,0.08)"
                  : log.action === "contact_edited" ? "rgba(15,110,86,0.08)"
                  : log.action === "tag_added" ? "rgba(15,110,86,0.08)"
                  : log.action === "tag_removed" ? "rgba(153,60,29,0.08)"
                  : "rgba(184,168,152,0.1)"
                const iconBorder = log.action === "contact_created" ? "rgba(232,86,26,0.15)"
                  : log.action === "contact_edited" ? "rgba(15,110,86,0.2)"
                  : log.action === "tag_added" ? "rgba(15,110,86,0.2)"
                  : log.action === "tag_removed" ? "rgba(153,60,29,0.2)"
                  : "rgba(184,168,152,0.2)"
                const label = log.action === "contact_created" ? "Contact created"
                  : log.action === "contact_edited" ? "Contact details edited"
                  : log.action === "tag_added" ? `Tag added: ${(log.details as any)?.tagName || ""}`
                  : log.action === "tag_removed" ? `Tag removed: ${(log.details as any)?.tagName || ""}`
                  : log.action

                return (
                  <div key={log.id} style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                      <div style={{
                        width: "32px", height: "32px", borderRadius: "50%",
                        background: iconColor, border: `1px solid ${iconBorder}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "13px", fontWeight: 600, color: "#5A3C28"
                      }}>{icon}</div>
                      {!isLast && (
                        <div style={{ width: "1.5px", flex: 1, minHeight: "24px", background: "rgba(232,86,26,0.07)", marginTop: "4px", marginBottom: "4px" }} />
                      )}
                    </div>
                    <div style={{ paddingTop: "7px", paddingBottom: isLast ? 0 : "18px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 500, color: "#130E08", marginBottom: "2px" }}>
                        {label}
                      </div>
                      <div style={{ fontSize: "11px", color: "#B8A898" }}>
                        {log.userEmail && <span style={{ marginRight: "6px" }}>{log.userEmail} ·</span>}
                        {new Date(log.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}{" "}
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
