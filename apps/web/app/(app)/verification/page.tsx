"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

function getStatusStyle(status: string) {
  switch (status) {
    case "valid":   return { bg: "#E1F5EE", color: "#0F6E56", icon: "✓" }
    case "invalid": return { bg: "#FAECE7", color: "#993C1D", icon: "✗" }
    case "risky":   return { bg: "#FFF0E8", color: "#854F0B", icon: "⚠" }
    default:        return { bg: "#F5EEE6", color: "#B8A898", icon: "?" }
  }
}

interface VerifResult {
  status: string
  score: number
  duration: number
  detail: string
  reason: string
  checks: {
    syntax: boolean
    gibberish: boolean
    disposable: boolean
    webmail: boolean
    hasMX: boolean
    serverType: string
    smtpConnects: boolean
    smtpAccepts: boolean | null
    catchAll: boolean
    catchAllResolved: boolean
    catchAllConfidence: number
  }
}

interface Stats {
  contacts: { total: number; verified: number; invalid: number; risky: number; unknown: number; unverified: number }
  verificationRate: number
  avgScore: number
  recentLogs: any[]
}

export default function VerificationPage() {
  const [stats, setStats]         = useState<Stats | null>(null)
  const [loading, setLoading]     = useState(true)
  const [testEmail, setTestEmail] = useState("")
  const [testing, setTesting]     = useState(false)
  const [testResult, setTestResult] = useState<VerifResult | null>(null)

  useEffect(() => { fetchStats() }, [])

  async function fetchStats() {
    try {
      const res = await fetch("/api/verify/stats")
      const data = await res.json()
      setStats(data)
    } finally {
      setLoading(false)
    }
  }

  async function handleTest() {
    if (!testEmail.trim()) return
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail.trim() }),
      })
      const data = await res.json()
      setTestResult(data.result)
      // Refresh stats after each test
      fetchStats()
    } finally {
      setTesting(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FDFAF5" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: translateY(0) } }
        .test-input:focus { outline: none; border-color: #E8561A !important; box-shadow: 0 0 0 3px rgba(232,86,26,0.1); }
      `}</style>

      {/* Sub-header */}
      <div style={{
        background: "#FDFAF5", borderBottom: "1px solid #EAE0D5",
        padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#130E08" }}>Verification engine</div>
          <div style={{ fontSize: "11px", color: "#B8A898", marginTop: "2px" }}>
            6-layer email verification — built in-house
          </div>
        </div>
        <Link href="/contacts">
          <button style={{
            padding: "7px 16px", borderRadius: "100px", border: "none",
            background: "#E8561A", fontSize: "12px", fontWeight: 600,
            color: "#fff", cursor: "pointer",
          }}>Verify all contacts →</button>
        </Link>
      </div>

      <div style={{ padding: "20px 24px" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px" }}>
            <div style={{
              width: "24px", height: "24px", borderRadius: "50%",
              border: "2px solid rgba(232,86,26,0.15)", borderTopColor: "#E8561A",
              animation: "spin 0.7s linear infinite",
            }} />
          </div>
        ) : stats && (
          <>
            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: "8px", marginBottom: "20px" }}>
              {[
                { label: "Total",      value: stats.contacts.total,      color: "#130E08" },
                { label: "✓ Valid",    value: stats.contacts.verified,   color: "#0F6E56" },
                { label: "✗ Invalid",  value: stats.contacts.invalid,    color: "#993C1D" },
                { label: "⚠ Risky",   value: stats.contacts.risky,      color: "#854F0B" },
                { label: "? Unknown",  value: stats.contacts.unknown,    color: "#B8A898" },
                { label: "⬜ Not yet", value: stats.contacts.unverified, color: "#B8A898" },
              ].map((s, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #EAE0D5", borderRadius: "12px", padding: "12px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: "22px", fontWeight: 700, color: s.color, letterSpacing: "-0.5px" }}>{s.value.toLocaleString()}</div>
                  <div style={{ fontSize: "10px", color: "#B8A898", marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>

              {/* Test panel */}
              <div style={{ background: "#fff", border: "1px solid #EAE0D5", borderRadius: "16px", padding: "20px" }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#130E08", marginBottom: "14px" }}>Test a single email</div>

                <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                  <input
                    className="test-input"
                    type="email"
                    value={testEmail}
                    onChange={e => setTestEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleTest()}
                    placeholder="test@company.com"
                    style={{
                      flex: 1, padding: "9px 12px",
                      border: "1px solid #EAE0D5", borderRadius: "9px",
                      fontSize: "13px", fontFamily: "inherit",
                      color: "#130E08", background: "#FDFAF5",
                      transition: "all 0.15s",
                    }}
                  />
                  <button
                    onClick={handleTest}
                    disabled={!testEmail.trim() || testing}
                    style={{
                      padding: "9px 16px", borderRadius: "9px", border: "none",
                      background: testEmail.trim() ? "#E8561A" : "#EAE0D5",
                      fontSize: "12px", fontWeight: 600,
                      color: testEmail.trim() ? "#fff" : "#B8A898",
                      cursor: testEmail.trim() && !testing ? "pointer" : "not-allowed",
                      fontFamily: "inherit", flexShrink: 0, transition: "all 0.15s",
                    }}
                  >
                    {testing ? (
                      <div style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
                    ) : "Verify"}
                  </button>
                </div>

                {testResult ? (() => {
                  const s = getStatusStyle(testResult.status)
                  return (
                    <div style={{ background: s.bg, borderRadius: "10px", padding: "14px", animation: "fadeUp 0.2s ease" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                        <span style={{ fontSize: "20px", fontWeight: 700, color: s.color }}>{s.icon}</span>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: 700, color: s.color, textTransform: "capitalize" }}>{testResult.status}</div>
                          <div style={{ fontSize: "11px", color: s.color, opacity: 0.75 }}>Score: {testResult.score}/100 · {testResult.duration}ms</div>
                        </div>
                      </div>
                      <div style={{ fontSize: "12px", color: s.color, marginBottom: "10px", lineHeight: 1.5 }}>{testResult.detail}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                        {[
                          { label: "Syntax valid",         pass: testResult.checks.syntax },
                          { label: "Not gibberish",        pass: !testResult.checks.gibberish },
                          { label: "Not disposable",       pass: !testResult.checks.disposable },
                          { label: "Has MX record",        pass: testResult.checks.hasMX },
                          { label: "SMTP connects",        pass: testResult.checks.smtpConnects },
                          { label: "SMTP accepts mailbox", pass: testResult.checks.smtpAccepts === true },
                          { label: "Not catch-all",        pass: !testResult.checks.catchAll },
                        ].map((c, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: s.color, opacity: 0.85 }}>
                            <span style={{ fontWeight: 700 }}>{c.pass ? "✓" : "✗"}</span>
                            {c.label}
                          </div>
                        ))}
                      </div>
                      {testResult.checks.serverType && (
                        <div style={{ marginTop: "8px", fontSize: "11px", color: s.color, opacity: 0.7 }}>
                          Mail server: {testResult.checks.serverType}
                        </div>
                      )}
                      {testResult.checks.webmail && (
                        <div style={{ fontSize: "11px", color: s.color, opacity: 0.7 }}>Type: Personal / Webmail</div>
                      )}
                    </div>
                  )
                })() : (
                  <div style={{ background: "#F5EEE6", borderRadius: "10px", padding: "14px", fontSize: "12px", color: "#6B5040", lineHeight: 1.65 }}>
                    <div style={{ fontWeight: 600, marginBottom: "6px" }}>What gets checked:</div>
                    <div>✓ Email syntax and format</div>
                    <div>✓ Gibberish and bot detection</div>
                    <div>✓ 100,000+ disposable domains</div>
                    <div>✓ Webmail provider detection</div>
                    <div>✓ DNS MX record lookup</div>
                    <div>✓ Mail server fingerprinting</div>
                    <div style={{ color: "#B8A898", marginTop: "5px" }}>Coming: catch-all resolution (Day 3)</div>
                  </div>
                )}
              </div>

              {/* Recent logs */}
              <div style={{ background: "#fff", border: "1px solid #EAE0D5", borderRadius: "16px", padding: "20px" }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#130E08", marginBottom: "14px" }}>Recent verifications</div>

                {stats.recentLogs.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "28px", color: "#B8A898", fontSize: "13px" }}>
                    No verifications yet — test an email above
                  </div>
                ) : (
                  stats.recentLogs.map((log: any, i: number) => {
                    const s = getStatusStyle(log.status)
                    return (
                      <div key={log.id} style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        padding: "8px 0",
                        borderBottom: i < stats.recentLogs.length - 1 ? "1px solid #F5EEE6" : "none",
                      }}>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: s.color, width: "16px", textAlign: "center", flexShrink: 0 }}>{s.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "12.5px", fontWeight: 500, color: "#130E08", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.email}</div>
                          <div style={{ fontSize: "10.5px", color: "#B8A898" }}>
                            Score: {log.score}/100 · {log.serverType || "Unknown server"} · {log.responseTime}ms
                          </div>
                        </div>
                        <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "20px", background: s.bg, color: s.color, flexShrink: 0 }}>{log.status}</span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Engine layers */}
            <div style={{ background: "#fff", border: "1px solid #EAE0D5", borderRadius: "16px", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#130E08" }}>Verification engine status</div>
                <span style={{ fontSize: "11px", fontWeight: 500, padding: "3px 10px", borderRadius: "20px", background: "#E1F5EE", color: "#0F6E56" }}>● Active</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px" }}>
                {[
                  { layer: "Layer 1", name: "Instant checks",      checks: "Syntax · Gibberish · Disposable · Webmail",   status: "active",   day: "Day 1 ✅" },
                  { layer: "Layer 2", name: "DNS checks",           checks: "MX record · Server type · Domain age",        status: "active",   day: "Day 1 ✅" },
                  { layer: "Layer 3", name: "SMTP verification",    checks: "Connection · Tickling · Response time",        status: "active",   day: "Day 2 ✅" },
                  { layer: "Layer 4", name: "Catch-all resolution", checks: "Timing attack · Pattern match · Retry",        status: "active",   day: "Day 3 ✅" },
                  { layer: "Layer 5", name: "AI scoring",           checks: "Confidence model · Spam trap · Domain rep",   status: "planned",  day: "Week 6 📅" },
                  { layer: "Layer 6", name: "Engagement data",      checks: "Bounce feedback · Opens · Clicks",            status: "planned",  day: "Week 5 📅" },
                ].map((layer, i) => {
                  const bg = layer.status === "active" ? "#E1F5EE" : layer.status === "building" ? "#FFF0E8" : "#F5EEE6"
                  const color = layer.status === "active" ? "#0F6E56" : layer.status === "building" ? "#854F0B" : "#B8A898"
                  return (
                    <div key={i} style={{ background: bg, borderRadius: "10px", padding: "12px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ fontSize: "10px", fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.5px" }}>{layer.layer}</span>
                        <span style={{ fontSize: "10px", color }}>{layer.day}</span>
                      </div>
                      <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#130E08", marginBottom: "3px" }}>{layer.name}</div>
                      <div style={{ fontSize: "11px", color: "#6B5040" }}>{layer.checks}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
