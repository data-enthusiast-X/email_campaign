"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

const pageBg: React.CSSProperties = {
  minHeight: "100vh",
  background: `
    radial-gradient(ellipse at 12% 12%, rgba(255,175,110,0.38) 0%, transparent 45%),
    radial-gradient(ellipse at 88% 80%, rgba(232,86,26,0.13) 0%, transparent 45%),
    radial-gradient(ellipse at 72% 8%,  rgba(255,215,175,0.28) 0%, transparent 42%),
    #FDF5EE
  `,
  padding: "28px",
}

const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.62)",
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
  border: "1px solid rgba(255,255,255,0.92)",
  borderRadius: "20px",
  boxShadow: "0 8px 40px rgba(232,86,26,0.07), 0 2px 12px rgba(0,0,0,0.04)",
}

const PRESET_COLOURS = [
  { name: "Xerebo Orange", value: "#E8561A" },
  { name: "Ocean Blue",    value: "#185FA5" },
  { name: "Forest Green",  value: "#0F6E56" },
  { name: "Royal Purple",  value: "#534AB7" },
  { name: "Deep Red",      value: "#993C1D" },
  { name: "Midnight",      value: "#130E08" },
  { name: "Rose Pink",     value: "#D4537E" },
  { name: "Golden",        value: "#854F0B" },
]

export default function BrandSettingsPage() {
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const [brandName, setBrandName]   = useState("")
  const [brandColour, setBrandColour] = useState("#E8561A")
  const [brandLogo, setBrandLogo]   = useState("")
  const [brandWebsite, setBrandWebsite] = useState("")

  useEffect(() => { fetchBrand() }, [])

  async function fetchBrand() {
    const res = await fetch("/api/workspace/brand")
    const data = await res.json()
    if (data.workspace) {
      setBrandName(data.workspace.brandName || "")
      setBrandColour(data.workspace.brandColour || "#E8561A")
      setBrandLogo(data.workspace.brandLogo || "")
      setBrandWebsite(data.workspace.brandWebsite || "")
    }
    setLoading(false)
  }

  async function handleSave() {
    setSaving(true)
    await fetch("/api/workspace/brand", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandName, brandColour, brandLogo, brandWebsite })
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const glassInput: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    background: "rgba(255,255,255,0.65)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(232,86,26,0.15)",
    borderRadius: "11px",
    fontSize: "13px",
    fontFamily: "inherit",
    color: "#130E08",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s"
  }

  const lbl: React.CSSProperties = {
    display: "block",
    fontSize: "10px", fontWeight: 700,
    color: "#B8A898",
    textTransform: "uppercase",
    letterSpacing: "0.9px",
    marginBottom: "6px"
  }

  if (loading) return (
    <div style={{ ...pageBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ ...glass, padding: "48px 64px", textAlign: "center" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <div style={{
          width: "36px", height: "36px", borderRadius: "50%",
          border: "3px solid rgba(232,86,26,0.12)", borderTopColor: "#E8561A",
          animation: "spin 0.75s linear infinite", margin: "0 auto 14px"
        }} />
        <div style={{ fontSize: "13px", color: "#B8A898" }}>Loading brand settings...</div>
      </div>
    </div>
  )

  return (
    <div style={pageBg}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes savedIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .glass-input:focus { border-color: rgba(232,86,26,0.4) !important; box-shadow: 0 0 0 3px rgba(232,86,26,0.08); }
        .colour-swatch { transition: all 0.15s cubic-bezier(0.34,1.56,0.64,1); }
        .colour-swatch:hover { transform: scale(1.18); }
        .save-btn { transition: all 0.18s; }
        .save-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(232,86,26,0.45) !important; }
      `}</style>

      <div style={{ maxWidth: "620px", margin: "0 auto" }}>

        {/* Back button */}
        <Link href="/settings" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "18px", fontSize: "12.5px", color: "#8A7565", fontWeight: 500 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Settings
        </Link>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* Identity card */}
          <div style={{ ...glass, padding: "24px 26px" }}>
            <div style={{
              fontSize: "11px", fontWeight: 700, color: "#B8A898",
              textTransform: "uppercase", letterSpacing: "0.9px", marginBottom: "18px"
            }}>Identity</div>

            <div style={{ marginBottom: "16px" }}>
              <label style={lbl}>Brand / Company name</label>
              <input
                className="glass-input"
                type="text"
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
                placeholder="Best Solution"
                style={glassInput}
              />
              <div style={{ fontSize: "11px", color: "#C8B8A8", marginTop: "5px" }}>
                Shown on the unsubscribe page and email footers instead of "Xerebo"
              </div>
            </div>

            <div>
              <label style={lbl}>Website</label>
              <input
                className="glass-input"
                type="url"
                value={brandWebsite}
                onChange={e => setBrandWebsite(e.target.value)}
                placeholder="https://yourdomain.com"
                style={glassInput}
              />
            </div>
          </div>

          {/* Colour card */}
          <div style={{ ...glass, padding: "24px 26px" }}>
            <div style={{
              fontSize: "11px", fontWeight: 700, color: "#B8A898",
              textTransform: "uppercase", letterSpacing: "0.9px", marginBottom: "18px"
            }}>Brand colour</div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "9px", marginBottom: "16px" }}>
              {PRESET_COLOURS.map(c => (
                <div
                  key={c.value}
                  className="colour-swatch"
                  onClick={() => setBrandColour(c.value)}
                  title={c.name}
                  style={{
                    width: "34px", height: "34px", borderRadius: "50%",
                    background: c.value, cursor: "pointer",
                    border: brandColour === c.value
                      ? "3px solid #130E08"
                      : "3px solid rgba(255,255,255,0)",
                    boxShadow: brandColour === c.value
                      ? `0 0 0 1px ${c.value}` : "0 2px 6px rgba(0,0,0,0.12)"
                  }}
                />
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="color"
                value={brandColour}
                onChange={e => setBrandColour(e.target.value)}
                style={{
                  width: "42px", height: "42px", borderRadius: "10px",
                  border: "1px solid rgba(232,86,26,0.2)",
                  cursor: "pointer", padding: "3px",
                  background: "rgba(255,255,255,0.7)"
                }}
              />
              <input
                className="glass-input"
                type="text"
                value={brandColour}
                onChange={e => setBrandColour(e.target.value)}
                placeholder="#E8561A"
                style={{ ...glassInput, width: "130px" }}
              />
              <span style={{ fontSize: "12px", color: "#B8A898" }}>Custom hex</span>
            </div>
          </div>

          {/* Logo card */}
          <div style={{ ...glass, padding: "24px 26px" }}>
            <div style={{
              fontSize: "11px", fontWeight: 700, color: "#B8A898",
              textTransform: "uppercase", letterSpacing: "0.9px", marginBottom: "18px"
            }}>Logo</div>

            <input
              className="glass-input"
              type="url"
              value={brandLogo}
              onChange={e => setBrandLogo(e.target.value)}
              placeholder="https://yoursite.com/logo.png"
              style={glassInput}
            />
            <div style={{ fontSize: "11px", color: "#C8B8A8", marginTop: "5px" }}>
              Paste a direct URL to your logo. Leave empty to use your brand initial.
            </div>
          </div>

          {/* Live preview */}
          <div style={{ ...glass, padding: "24px 26px" }}>
            <div style={{
              fontSize: "11px", fontWeight: 700, color: "#B8A898",
              textTransform: "uppercase", letterSpacing: "0.9px", marginBottom: "16px"
            }}>Live preview</div>

            <div style={{
              background: `
                radial-gradient(ellipse at 20% 20%, rgba(255,175,110,0.22) 0%, transparent 50%),
                #FDF5EE
              `,
              borderRadius: "14px",
              padding: "28px 24px",
              textAlign: "center",
              border: "1px solid rgba(232,86,26,0.08)"
            }}>
              {/* Mini glass card */}
              <div style={{
                background: "rgba(255,255,255,0.75)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.95)",
                borderRadius: "16px",
                padding: "24px 20px",
                maxWidth: "280px",
                margin: "0 auto",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
              }}>
                {brandLogo ? (
                  <img
                    src={brandLogo}
                    alt={brandName}
                    style={{ height: "38px", objectFit: "contain", margin: "0 auto 12px", display: "block" }}
                    onError={e => { e.currentTarget.style.display = "none" }}
                  />
                ) : (
                  <div style={{
                    width: "44px", height: "44px",
                    background: `linear-gradient(145deg, ${brandColour}, ${brandColour}cc)`,
                    borderRadius: "13px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "19px", fontWeight: 700, color: "#fff",
                    margin: "0 auto 12px",
                    boxShadow: `0 4px 14px ${brandColour}55`
                  }}>
                    {brandName ? (brandName[0] ?? "").toUpperCase() : "✦"}
                  </div>
                )}
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#130E08", marginBottom: "4px" }}>
                  {brandName || "Your Company"}
                </div>
                <div style={{ fontSize: "11.5px", color: "#B8A898", marginBottom: "14px" }}>
                  You've been unsubscribed
                </div>
                <div style={{
                  fontSize: "10px", color: "#C8B8A8",
                  borderTop: "1px solid rgba(184,168,152,0.15)",
                  paddingTop: "10px"
                }}>
                  Powered by <span style={{ color: brandColour, fontWeight: 600 }}>Xerebo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Save button */}
          <button
            className="save-btn"
            onClick={handleSave}
            disabled={saving}
            style={{
              width: "100%", padding: "13px", borderRadius: "14px", border: "none",
              background: saved
                ? "linear-gradient(135deg, #0F6E56, #1A9070)"
                : `linear-gradient(135deg, ${brandColour}, ${brandColour}cc)`,
              fontSize: "13.5px", fontWeight: 600, color: "#fff",
              cursor: saving ? "default" : "pointer",
              fontFamily: "inherit",
              boxShadow: saved
                ? "0 4px 18px rgba(15,110,86,0.38)"
                : `0 4px 18px ${brandColour}55`,
              transition: "background 0.3s, box-shadow 0.3s",
              opacity: saving ? 0.75 : 1,
            }}
          >
            {saving ? "Saving..." : saved ? "✓ Saved!" : "Save brand settings"}
          </button>
        </div>
      </div>
    </div>
  )
}
