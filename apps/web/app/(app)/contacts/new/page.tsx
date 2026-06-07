"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const pageBg: React.CSSProperties = {
  minHeight: "100vh",
  background: `
    radial-gradient(ellipse at 12% 12%, rgba(255,175,110,0.32) 0%, transparent 45%),
    radial-gradient(ellipse at 88% 80%, rgba(232,86,26,0.10) 0%, transparent 45%),
    radial-gradient(ellipse at 72% 8%,  rgba(255,215,175,0.22) 0%, transparent 42%),
    #FDF5EE
  `,
  padding: "28px 24px",
}

const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.58)",
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
  border: "1px solid rgba(255,255,255,0.88)",
  borderRadius: "20px",
  boxShadow: "0 4px 24px rgba(232,86,26,0.06), 0 1px 6px rgba(0,0,0,0.03)",
}

const glassInput: React.CSSProperties = {
  width: "100%", padding: "10px 13px",
  background: "rgba(255,255,255,0.65)", backdropFilter: "blur(10px)",
  border: "1px solid rgba(232,86,26,0.13)", borderRadius: "11px",
  fontSize: "13px", fontFamily: "inherit", color: "#130E08",
  outline: "none", boxSizing: "border-box", display: "block"
}

const lbl: React.CSSProperties = {
  display: "block", fontSize: "10px", fontWeight: 700,
  color: "#B8A898", textTransform: "uppercase",
  letterSpacing: "0.9px", marginBottom: "6px"
}

export default function NewContactPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail]         = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName]   = useState("")
  const [phone, setPhone]         = useState("")
  const [company, setCompany]     = useState("")
  const [jobTitle, setJobTitle]   = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError("")
    const res = await fetch("/api/contacts/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, firstName, lastName, phone, company, jobTitle })
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || "Something went wrong"); setLoading(false); return }
    router.push("/contacts")
  }

  return (
    <div style={pageBg}>
      <div style={{ maxWidth: "540px", margin: "0 auto" }}>

        {/* Back link */}
        <Link href="/contacts" style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          fontSize: "13px", color: "#B8A898", textDecoration: "none",
          marginBottom: "20px", fontWeight: 500
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "#130E08")}
        onMouseLeave={e => (e.currentTarget.style.color = "#B8A898")}
        >
          ← Back to contacts
        </Link>

        <div style={{ ...glass, padding: "28px 28px" }}>

          <div style={{ marginBottom: "22px" }}>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#130E08", marginBottom: "3px" }}>
              Add contact
            </div>
            <div style={{ fontSize: "12px", color: "#B8A898" }}>
              Manually add a single contact to your list
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
              <div>
                <label style={lbl}>First name</label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Sarah" style={glassInput} />
              </div>
              <div>
                <label style={lbl}>Last name</label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Mitchell" style={glassInput} />
              </div>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={lbl}>Email address <span style={{ color: "#E8561A" }}>*</span></label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@company.com" required style={glassInput} />
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={lbl}>Company</label>
              <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="TechCorp Inc" style={glassInput} />
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={lbl}>Job title</label>
              <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Marketing Manager" style={glassInput} />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={lbl}>Phone</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+971 50 123 4567" style={glassInput} />
            </div>

            <div style={{
              background: "rgba(232,86,26,0.05)", border: "1px solid rgba(232,86,26,0.1)",
              borderRadius: "11px", padding: "11px 14px", marginBottom: "18px",
              fontSize: "12px", color: "#7A3010", lineHeight: 1.6
            }}>
              ✦ Added as <strong>Unverified</strong> — go to Verification to check before sending.
            </div>

            {error && (
              <div style={{
                background: "rgba(153,60,29,0.07)", border: "1px solid rgba(153,60,29,0.18)",
                borderRadius: "10px", padding: "10px 14px",
                color: "#993C1D", fontSize: "12.5px", marginBottom: "16px"
              }}>{error}</div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <Link href="/contacts" style={{ flex: 1 }}>
                <button type="button" style={{
                  width: "100%", padding: "11px", borderRadius: "12px",
                  background: "rgba(255,255,255,0.7)", backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.95)",
                  fontSize: "13px", fontWeight: 500, color: "#6B5040",
                  cursor: "pointer", fontFamily: "inherit",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                }}>Cancel</button>
              </Link>
              <button type="submit" disabled={loading || !email} style={{
                flex: 2, padding: "11px", borderRadius: "12px", border: "none",
                background: email ? "linear-gradient(135deg, #E8561A, #FF7A3D)" : "rgba(184,168,152,0.15)",
                fontSize: "13px", fontWeight: 600,
                color: email ? "#fff" : "#B8A898",
                cursor: email ? "pointer" : "not-allowed",
                fontFamily: "inherit",
                boxShadow: email ? "0 4px 16px rgba(232,86,26,0.32)" : "none"
              }}>
                {loading ? "Adding..." : "Add contact →"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}
