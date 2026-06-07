"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"

const reasons = [
  "I receive too many emails",
  "The content is not relevant to me",
  "I never signed up for this",
  "I prefer another way to get updates",
  "Other"
]

const pageBg: React.CSSProperties = {
  minHeight: "100vh",
  background: `
    radial-gradient(ellipse at 20% 20%, rgba(255,175,110,0.32) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(232,86,26,0.10) 0%, transparent 50%),
    #FDF5EE
  `,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
}

const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.80)",
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
  border: "1px solid rgba(255,255,255,0.95)",
  borderRadius: "24px",
  padding: "44px 40px",
  width: "100%",
  maxWidth: "460px",
  textAlign: "center",
  boxShadow: "0 16px 56px rgba(232,86,26,0.09), 0 4px 16px rgba(0,0,0,0.06)"
}

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [step, setStep] = useState<"confirm" | "reason" | "done" | "error">("confirm")
  const [contact, setContact] = useState<any>(null)
  const [brand, setBrand] = useState<any>(null)
  const [selectedReason, setSelectedReason] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (token) {
      fetchContact()
      fetchBranding()
    } else { setStep("error"); setLoading(false) }
  }, [token])

  async function fetchBranding() {
    try {
      const res = await fetch(`/api/unsubscribe/brand?token=${token}`)
      if (res.ok) setBrand(await res.json())
    } catch {}
  }

  async function fetchContact() {
    try {
      const res = await fetch(`/api/unsubscribe?token=${token}`)
      if (!res.ok) { setStep("error"); setLoading(false); return }
      const data = await res.json()
      setContact(data.contact)
      if (data.contact.subscriptionStatus === "unsubscribed") setStep("done")
      setLoading(false)
    } catch {
      setStep("error")
      setLoading(false)
    }
  }

  async function handleUnsubscribe() {
    setSubmitting(true)
    const res = await fetch(`/api/unsubscribe?token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: selectedReason })
    })
    if (res.ok) setStep("done")
    else setStep("error")
    setSubmitting(false)
  }

  if (loading) return (
    <div style={pageBg}>
      <div style={card}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "50%",
          border: "3px solid rgba(232,86,26,0.15)", borderTopColor: "#E8561A",
          animation: "spin 0.75s linear infinite", margin: "0 auto"
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )

  return (
    <div style={pageBg}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes stepIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .reason-row { transition: all 0.15s; }
        .reason-row:hover { border-color: rgba(232,86,26,0.3) !important; background: rgba(232,86,26,0.03) !important; }
        .unsub-btn { transition: all 0.18s; }
        .unsub-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 22px rgba(232,86,26,0.42) !important; }
        .ghost-btn { transition: all 0.15s; }
        .ghost-btn:hover { background: rgba(232,86,26,0.04) !important; border-color: rgba(232,86,26,0.2) !important; }
      `}</style>

      <div style={{ ...card, animation: "cardIn 0.4s cubic-bezier(0.34,1.3,0.64,1) both" }}>

        {/* Logo mark */}
        {brand?.logo ? (
          <img
            src={brand.logo}
            alt={brand.name}
            style={{ height: "44px", objectFit: "contain", margin: "0 auto 24px", display: "block" }}
          />
        ) : (
          <div style={{
            width: "46px", height: "46px",
            background: `linear-gradient(145deg, ${brand?.colour || "#E8561A"}, ${brand?.colour ? brand.colour + "cc" : "#C03A10"})`,
            borderRadius: "14px",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px",
            boxShadow: `0 6px 18px ${brand?.colour || "#E8561A"}55, inset 0 1px 0 rgba(255,255,255,0.15)`,
            fontSize: "20px", fontWeight: 700, color: "#fff"
          }}>
            {brand?.name ? brand.name[0].toUpperCase() : "✦"}
          </div>
        )}

        {/* ── Error ── */}
        {step === "error" && (
          <div style={{ animation: "stepIn 0.3s ease both" }}>
            <div style={{
              width: "60px", height: "60px", borderRadius: "20px", margin: "0 auto 18px",
              background: "rgba(153,60,29,0.07)", border: "1px solid rgba(153,60,29,0.14)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="11" stroke="#993C1D" strokeWidth="1.8"/>
                <path d="M10 10l8 8M18 10l-8 8" stroke="#993C1D" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#130E08", marginBottom: "8px" }}>
              Invalid link
            </h1>
            <p style={{ fontSize: "13px", color: "#B8A898", lineHeight: 1.6 }}>
              This unsubscribe link is invalid or has expired. Please contact the sender directly.
            </p>
          </div>
        )}

        {/* ── Confirm ── */}
        {step === "confirm" && contact && (
          <div style={{ animation: "stepIn 0.3s ease both" }}>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#130E08", marginBottom: "10px" }}>
              Unsubscribe
            </h1>
            <p style={{ fontSize: "13.5px", color: "#8A7565", marginBottom: "28px", lineHeight: 1.65 }}>
              Unsubscribe <strong style={{ color: "#130E08" }}>{contact.email}</strong> from all future emails?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                className="unsub-btn"
                onClick={() => setStep("reason")}
                style={{
                  padding: "13px", borderRadius: "14px",
                  border: "none",
                  background: "linear-gradient(135deg, #E8561A, #FF7A3D)",
                  fontSize: "14px", fontWeight: 600, color: "#fff",
                  cursor: "pointer", fontFamily: "inherit",
                  boxShadow: "0 4px 16px rgba(232,86,26,0.36)"
                }}
              >Yes, unsubscribe me</button>
              <button
                className="ghost-btn"
                onClick={() => window.close()}
                style={{
                  padding: "13px", borderRadius: "14px",
                  border: "1px solid rgba(184,168,152,0.3)",
                  background: "transparent",
                  fontSize: "14px", fontWeight: 500, color: "#6B5040",
                  cursor: "pointer", fontFamily: "inherit"
                }}
              >No, keep me subscribed</button>
            </div>
          </div>
        )}

        {/* ── Reason ── */}
        {step === "reason" && (
          <div style={{ animation: "stepIn 0.3s ease both" }}>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#130E08", marginBottom: "6px" }}>
              Before you go...
            </h1>
            <p style={{ fontSize: "13px", color: "#B8A898", marginBottom: "20px" }}>
              Why are you unsubscribing? <span style={{ opacity: 0.7 }}>(optional)</span>
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "22px", textAlign: "left" }}>
              {reasons.map(reason => {
                const isActive = selectedReason === reason
                return (
                  <div
                    key={reason}
                    className="reason-row"
                    onClick={() => setSelectedReason(isActive ? "" : reason)}
                    style={{
                      padding: "11px 14px", borderRadius: "12px",
                      border: `1px solid ${isActive ? "#E8561A" : "rgba(184,168,152,0.3)"}`,
                      background: isActive ? "rgba(232,86,26,0.05)" : "rgba(255,255,255,0.6)",
                      cursor: "pointer", display: "flex", alignItems: "center", gap: "12px",
                      fontSize: "13px", color: isActive ? "#E8561A" : "#6B5040",
                      fontWeight: isActive ? 500 : 400,
                    }}
                  >
                    <div style={{
                      width: "18px", height: "18px", borderRadius: "50%", flexShrink: 0,
                      border: `2px solid ${isActive ? "#E8561A" : "rgba(184,168,152,0.45)"}`,
                      background: isActive ? "#E8561A" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "9px", color: "#fff", fontWeight: 700,
                      transition: "all 0.15s cubic-bezier(0.34,1.56,0.64,1)"
                    }}>
                      {isActive ? "✓" : ""}
                    </div>
                    {reason}
                  </div>
                )
              })}
            </div>
            <button
              className="unsub-btn"
              onClick={handleUnsubscribe}
              disabled={submitting}
              style={{
                width: "100%", padding: "13px", borderRadius: "14px",
                border: "none",
                background: submitting
                  ? "rgba(184,168,152,0.3)"
                  : "linear-gradient(135deg, #E8561A, #FF7A3D)",
                fontSize: "14px", fontWeight: 600, color: "#fff",
                cursor: submitting ? "default" : "pointer",
                fontFamily: "inherit",
                boxShadow: submitting ? "none" : "0 4px 16px rgba(232,86,26,0.36)",
                transition: "all 0.2s"
              }}
            >
              {submitting ? "Processing..." : "Confirm unsubscribe"}
            </button>
          </div>
        )}

        {/* ── Done ── */}
        {step === "done" && (
          <div style={{ animation: "stepIn 0.3s ease both" }}>
            <div style={{
              width: "64px", height: "64px", borderRadius: "20px", margin: "0 auto 20px",
              background: "rgba(15,110,86,0.08)", border: "1px solid rgba(15,110,86,0.16)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                <circle cx="15" cy="15" r="12" stroke="#0F6E56" strokeWidth="1.8"/>
                <path d="M9 15.5l4 4 8-8" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#130E08", marginBottom: "10px" }}>
              You're unsubscribed
            </h1>
            <p style={{ fontSize: "13.5px", color: "#8A7565", marginBottom: "8px", lineHeight: 1.65 }}>
              <strong style={{ color: "#130E08" }}>{contact?.email}</strong> has been removed from all future emails.
            </p>
            <p style={{ fontSize: "12px", color: "#B8A898", lineHeight: 1.6 }}>
              Changed your mind? Contact the sender directly to resubscribe.
            </p>
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: "28px", paddingTop: "20px",
          borderTop: "1px solid rgba(184,168,152,0.15)",
          fontSize: "11px", color: "#C8B8A8"
        }}>
          Powered by <span style={{ color: brand?.colour || "#E8561A", fontWeight: 600 }}>Xerebo</span>
        </div>
      </div>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100vh", background: "#FDF5EE",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "50%",
          border: "3px solid rgba(232,86,26,0.15)", borderTopColor: "#E8561A",
        }} />
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  )
}
