"use client"

import { useState } from "react"

const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.72)",
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
  border: "1px solid rgba(255,255,255,0.9)",
  borderRadius: "16px",
  boxShadow: "0 4px 24px rgba(232,86,26,0.06), 0 1px 6px rgba(0,0,0,0.03)",
}

interface GateData {
  total: number
  verified: number
  invalid: number
  risky: number
  unknown: number
  unverified: number
  estimatedBounceRateAll: number
  estimatedBounceRateClean: number
  safeToSend: number
  recommendation: string
}

const STEPS = ["Setup", "Design", "Recipients", "Review & Send"]

export default function NewCampaignPage() {
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [loadingGate, setLoadingGate] = useState(false)
  const [gateData, setGateData] = useState<GateData | null>(null)
  const [campaignId, setCampaignId] = useState<string | null>(null)

  const [name, setName]           = useState("")
  const [subject, setSubject]     = useState("")
  const [fromName, setFromName]   = useState("")
  const [fromEmail, setFromEmail] = useState("")

  async function saveAndNext() {
    if (step === 1) {
      if (!name || !subject || !fromName || !fromEmail) return
      setSaving(true)
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, subject, fromName, fromEmail }),
      })
      const data = await res.json()
      setCampaignId(data.campaign.id)
      setSaving(false)
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    } else if (step === 3) {
      setLoadingGate(true)
      setStep(4)
      const id = campaignId || "new"
      const res = await fetch(`/api/campaigns/${id}/verify-gate`)
      const data = await res.json()
      setGateData(data)
      setLoadingGate(false)
    }
  }

  const step1Ready = name && subject && fromName && fromEmail

  return (
    <div style={{
      minHeight: "100vh",
      background: `
        radial-gradient(ellipse at 12% 12%, rgba(255,175,110,0.32) 0%, transparent 45%),
        radial-gradient(ellipse at 88% 80%, rgba(232,86,26,0.10) 0%, transparent 45%),
        #FDF5EE
      `,
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        .field-input:focus { outline: none; border-color: #E8561A !important; box-shadow: 0 0 0 3px rgba(232,86,26,0.10); }
      `}</style>

      {/* Sub-header */}
      <div style={{
        background: "rgba(253,245,238,0.85)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(234,224,213,0.6)",
        padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#130E08" }}>New Campaign</div>
          <div style={{ fontSize: "11px", color: "#B8A898", marginTop: "2px" }}>
            Step {step} of 4 — {STEPS[step - 1]}
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {step > 1 && step < 5 && (
            <button onClick={() => setStep(step - 1)} style={{
              padding: "8px 16px", borderRadius: "100px",
              border: "1px solid rgba(234,224,213,0.8)", background: "rgba(255,255,255,0.7)",
              fontSize: "12px", color: "#6B5040", cursor: "pointer", fontFamily: "inherit",
            }}>← Back</button>
          )}
          {step < 4 && (
            <button
              onClick={saveAndNext}
              disabled={saving || (step === 1 && !step1Ready)}
              style={{
                padding: "8px 18px", borderRadius: "100px", border: "none",
                background: step === 1 && !step1Ready ? "#EAE0D5" : "linear-gradient(135deg, #E8561A, #FF7A3D)",
                color: step === 1 && !step1Ready ? "#B8A898" : "#fff",
                fontSize: "12px", fontWeight: 600, cursor: step === 1 && !step1Ready ? "not-allowed" : "pointer",
                fontFamily: "inherit", boxShadow: step === 1 && !step1Ready ? "none" : "0 4px 14px rgba(232,86,26,0.32)",
                transition: "all 0.15s",
              }}
            >
              {saving ? "Saving..." : step === 3 ? "Verify & Review →" : "Next →"}
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: "20px 24px" }}>

        {/* Step pills */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "24px" }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{
              padding: "6px 14px", borderRadius: "100px", fontSize: "12px", fontWeight: 500,
              background: i + 1 === step ? "#FDF0E8" : i + 1 < step ? "#E1F5EE" : "rgba(255,255,255,0.6)",
              color: i + 1 === step ? "#E8561A" : i + 1 < step ? "#0F6E56" : "#B8A898",
              border: i + 1 === step ? "1px solid rgba(232,86,26,0.2)" : "1px solid rgba(234,224,213,0.5)",
              transition: "all 0.2s",
            }}>
              {i + 1 < step ? "✓ " : ""}{s}
            </div>
          ))}
        </div>

        {/* ── STEP 1: Setup ── */}
        {step === 1 && (
          <div style={{ ...glass, padding: "28px", maxWidth: "520px", animation: "fadeUp 0.2s ease" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#130E08", marginBottom: "20px" }}>
              Campaign details
            </div>
            {[
              { label: "Campaign name",  value: name,      setter: setName,      placeholder: "e.g. Summer Sale Launch",        type: "text" },
              { label: "Subject line",   value: subject,   setter: setSubject,   placeholder: "e.g. Your exclusive offer inside", type: "text" },
              { label: "From name",      value: fromName,  setter: setFromName,  placeholder: "e.g. Amir from Xerebo",           type: "text" },
              { label: "From email",     value: fromEmail, setter: setFromEmail, placeholder: "e.g. hello@xerebo.com",           type: "email" },
            ].map((field, i) => (
              <div key={i} style={{ marginBottom: "16px" }}>
                <div style={{
                  fontSize: "11px", fontWeight: 700, color: "#B8A898",
                  textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "6px",
                }}>{field.label}</div>
                <input
                  className="field-input"
                  type={field.type}
                  value={field.value}
                  onChange={e => field.setter(e.target.value)}
                  placeholder={field.placeholder}
                  style={{
                    width: "100%", padding: "10px 13px",
                    border: "1px solid rgba(234,224,213,0.8)", borderRadius: "10px",
                    fontSize: "13px", fontFamily: "inherit", color: "#130E08",
                    background: "#FDFAF5", boxSizing: "border-box", transition: "all 0.15s",
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── STEP 2: Design placeholder ── */}
        {step === 2 && (
          <div style={{ ...glass, padding: "56px", textAlign: "center", maxWidth: "520px", animation: "fadeUp 0.2s ease" }}>
            <div style={{ fontSize: "32px", marginBottom: "14px" }}>🎨</div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#130E08", marginBottom: "6px" }}>
              Email editor
            </div>
            <div style={{ fontSize: "13px", color: "#B8A898", lineHeight: 1.6 }}>
              Drag-and-drop editor coming in Week 4.<br />
              Click Next to continue to recipients.
            </div>
          </div>
        )}

        {/* ── STEP 3: Recipients placeholder ── */}
        {step === 3 && (
          <div style={{ ...glass, padding: "56px", textAlign: "center", maxWidth: "520px", animation: "fadeUp 0.2s ease" }}>
            <div style={{ fontSize: "32px", marginBottom: "14px" }}>👥</div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#130E08", marginBottom: "6px" }}>
              Choose recipients
            </div>
            <div style={{ fontSize: "13px", color: "#B8A898", lineHeight: 1.6 }}>
              Click "Verify & Review" to run the pre-send<br />
              verification gate on all your subscribed contacts.
            </div>
          </div>
        )}

        {/* ── STEP 4: Verification gate ── */}
        {step === 4 && (
          <div style={{ maxWidth: "640px", animation: "fadeUp 0.2s ease" }}>
            {loadingGate ? (
              <div style={{ ...glass, padding: "56px", textAlign: "center" }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  border: "2px solid rgba(232,86,26,0.15)", borderTopColor: "#E8561A",
                  animation: "spin 0.7s linear infinite", margin: "0 auto 14px",
                }} />
                <div style={{ fontSize: "13px", color: "#B8A898" }}>Running verification check...</div>
              </div>
            ) : gateData && (
              <>
                {/* Recommendation card */}
                <div style={{
                  background: gateData.recommendation === "send_ready" ? "#E1F5EE" : "#FDF0E8",
                  border: `1px solid ${gateData.recommendation === "send_ready" ? "#9FE1CB" : "#FAD0B8"}`,
                  borderRadius: "12px", padding: "14px 16px", marginBottom: "16px",
                  display: "flex", gap: "12px", alignItems: "flex-start",
                }}>
                  <div style={{
                    width: "30px", height: "30px", flexShrink: 0,
                    background: gateData.recommendation === "send_ready" ? "#0F6E56" : "#E8561A",
                    borderRadius: "9px", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "15px",
                  }}>
                    {gateData.recommendation === "send_ready" ? "✓" : "🛡️"}
                  </div>
                  <div style={{
                    fontSize: "12.5px", lineHeight: 1.6,
                    color: gateData.recommendation === "send_ready" ? "#0F4D3C" : "#7A3010",
                  }}>
                    {gateData.recommendation === "send_ready"
                      ? "Your list looks clean. All subscribed contacts are verified and safe to send."
                      : `We found ${(gateData.invalid + gateData.risky).toLocaleString()} contacts that could bounce. Remove them before sending to protect your domain reputation.`
                    }
                  </div>
                </div>

                {/* Gate card */}
                <div style={{ background: "#fff", border: "1px solid #EAE0D5", borderRadius: "16px", overflow: "hidden" }}>
                  <div style={{
                    background: "linear-gradient(135deg, #E8561A, #FF7A3D)",
                    padding: "16px 20px", display: "flex", alignItems: "center",
                  }}>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>
                      Verification gate
                    </div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", marginLeft: "auto" }}>
                      {gateData.total.toLocaleString()} subscribed recipients
                    </div>
                  </div>

                  <div style={{ padding: "20px" }}>
                    {/* 4 stat cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px", marginBottom: "16px" }}>
                      {[
                        { n: gateData.verified,  label: "✓ Verified", bg: "#E1F5EE", color: "#0F6E56" },
                        { n: gateData.invalid,   label: "✗ Invalid",  bg: "#FAECE7", color: "#993C1D" },
                        { n: gateData.risky,     label: "⚠ Risky",   bg: "#FFF0E8", color: "#854F0B" },
                        { n: gateData.unknown,   label: "? Unknown",  bg: "#F5EEE6", color: "#B8A898" },
                      ].map((s, i) => (
                        <div key={i} style={{ background: s.bg, borderRadius: "10px", padding: "13px", textAlign: "center" }}>
                          <div style={{ fontSize: "24px", fontWeight: 700, color: s.color, letterSpacing: "-0.5px" }}>
                            {s.n.toLocaleString()}
                          </div>
                          <div style={{ fontSize: "10px", fontWeight: 600, color: s.color, marginTop: "3px" }}>
                            {s.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Segmented progress bar */}
                    {gateData.total > 0 && (
                      <div style={{
                        height: "8px", background: "#F5EEE6", borderRadius: "100px",
                        overflow: "hidden", display: "flex", marginBottom: "16px",
                      }}>
                        {[
                          { v: gateData.verified, c: "#0F6E56" },
                          { v: gateData.invalid,  c: "#993C1D" },
                          { v: gateData.risky,    c: "#C8820A" },
                          { v: gateData.unknown,  c: "#B8A898" },
                        ].map((s, i) => (
                          <div key={i} style={{
                            width: `${(s.v / gateData.total) * 100}%`,
                            background: s.c, height: "100%",
                          }} />
                        ))}
                      </div>
                    )}

                    {/* Bounce rate comparison */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "18px" }}>
                      <div style={{ background: "#FDF5EE", borderRadius: "10px", padding: "13px" }}>
                        <div style={{ fontSize: "11px", color: "#6B5040", marginBottom: "4px" }}>
                          If you send to all {gateData.total.toLocaleString()}:
                        </div>
                        <div style={{ fontSize: "15px", fontWeight: 700, color: "#993C1D" }}>
                          ~{gateData.estimatedBounceRateAll}% bounce rate
                        </div>
                        {gateData.estimatedBounceRateAll > 2 && (
                          <div style={{ fontSize: "10px", color: "#993C1D", marginTop: "3px" }}>
                            ⚠ Exceeds 2% safe threshold
                          </div>
                        )}
                      </div>
                      <div style={{ background: "#E1F5EE", border: "1px solid rgba(15,110,86,0.18)", borderRadius: "10px", padding: "13px" }}>
                        <div style={{ fontSize: "11px", color: "#0F6E56", marginBottom: "4px" }}>
                          After removing invalid + risky:
                        </div>
                        <div style={{ fontSize: "15px", fontWeight: 700, color: "#0F6E56" }}>
                          ~{gateData.estimatedBounceRateClean}% bounce rate
                        </div>
                        <div style={{ fontSize: "10px", color: "#0F6E56", marginTop: "3px" }}>✓ Domain reputation safe</div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button style={{
                        flex: 2, padding: "12px", borderRadius: "10px", border: "none",
                        background: "linear-gradient(135deg, #E8561A, #FF7A3D)",
                        color: "#fff", fontSize: "12px", fontWeight: 600,
                        cursor: "pointer", fontFamily: "inherit",
                        boxShadow: "0 4px 16px rgba(232,86,26,0.32)",
                      }}>
                        ✓ Remove invalid & risky — Send to {gateData.verified.toLocaleString()}
                      </button>
                      <button style={{
                        flex: 1, padding: "12px", borderRadius: "10px",
                        border: "1px solid rgba(234,224,213,0.8)",
                        background: "#F5EEE6", color: "#6B5040",
                        fontSize: "12px", fontWeight: 500,
                        cursor: "pointer", fontFamily: "inherit",
                      }}>
                        Verified only
                      </button>
                      <button style={{
                        flex: 1, padding: "12px", borderRadius: "10px",
                        border: "1px solid rgba(184,168,152,0.3)",
                        background: "transparent", color: "#B8A898",
                        fontSize: "12px", cursor: "pointer", fontFamily: "inherit",
                      }}>
                        Send to all ⚠
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
