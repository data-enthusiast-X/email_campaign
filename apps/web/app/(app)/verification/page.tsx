"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  CheckCircle2, XCircle, AlertTriangle, HelpCircle,
  Check, X, Zap, Bot, ShieldOff, Mail, Globe, Server,
  Target, Sparkles, BarChart2, MailX, ArrowRight,
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
    case "valid":   return { bg: "rgba(15,110,86,0.08)",   border: "rgba(15,110,86,0.18)",   color: "#0F6E56", label: "Valid",   Icon: CheckCircle2 }
    case "invalid": return { bg: "rgba(153,60,29,0.08)",   border: "rgba(153,60,29,0.18)",   color: "#993C1D", label: "Invalid", Icon: XCircle }
    case "risky":   return { bg: "rgba(133,79,11,0.08)",   border: "rgba(133,79,11,0.18)",   color: "#854F0B", label: "Risky",   Icon: AlertTriangle }
    default:        return { bg: "rgba(184,168,152,0.10)", border: "rgba(184,168,152,0.20)", color: "#8A7A6A", label: "Unknown", Icon: HelpCircle }
  }
}

interface VerifResult {
  status: string; score: number; duration: number; detail: string; reason: string
  checks: {
    syntax: boolean; gibberish: boolean; disposable: boolean; webmail: boolean
    hasMX: boolean; serverType: string; smtpConnects: boolean
    smtpAccepts: boolean | null; catchAll: boolean
    catchAllResolved: boolean; catchAllConfidence: number
  }
}

interface Stats {
  contacts: { total: number; verified: number; invalid: number; risky: number; unknown: number; unverified: number }
  verificationRate: number; avgScore: number; recentLogs: any[]
}

const WHAT_CHECKS = [
  { Icon: Zap,      text: "Syntax & format validation" },
  { Icon: Bot,      text: "Gibberish & bot detection" },
  { Icon: ShieldOff,text: "100,000+ disposable domains" },
  { Icon: Mail,     text: "Webmail provider detection" },
  { Icon: Globe,    text: "DNS MX record lookup" },
  { Icon: Server,   text: "SMTP mailbox verification" },
  { Icon: Target,   text: "Catch-all server detection" },
]

const LAYERS = [
  { num: 1, name: "Instant checks",      sub: "Syntax · Gibberish · Disposable · Webmail",  Icon: Zap,       status: "active",  day: "Day 1" },
  { num: 2, name: "DNS checks",           sub: "MX record · Server type · Fingerprinting",   Icon: Globe,     status: "active",  day: "Day 1" },
  { num: 3, name: "SMTP verification",    sub: "Connection · Tickling · Response time",       Icon: Server,    status: "active",  day: "Day 2" },
  { num: 4, name: "Catch-all resolution", sub: "Timing attack · Pattern match · Confidence", Icon: Target,    status: "active",  day: "Day 3" },
  { num: 5, name: "AI scoring",           sub: "Confidence model · Spam trap · Domain rep",  Icon: Sparkles,  status: "planned", day: "Week 6" },
  { num: 6, name: "Engagement data",      sub: "Bounce feedback · Opens · Clicks",           Icon: BarChart2, status: "planned", day: "Week 7" },
]

export default function VerificationPage() {
  const [stats, setStats]           = useState<Stats | null>(null)
  const [loading, setLoading]       = useState(true)
  const [testEmail, setTestEmail]   = useState("")
  const [testing, setTesting]       = useState(false)
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
    setTesting(true); setTestResult(null)
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail.trim() }),
      })
      const data = await res.json()
      setTestResult(data.result)
      fetchStats()
    } finally {
      setTesting(false)
    }
  }

  return (
    <div style={pageBg}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse   { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        .verif-input:focus { outline:none; border-color:rgba(232,86,26,0.5) !important; box-shadow:0 0 0 3px rgba(232,86,26,0.10); }
        .stat-card:hover   { transform:translateY(-2px); box-shadow:0 8px 28px rgba(232,86,26,0.10), 0 2px 8px rgba(0,0,0,0.04) !important; }
        .log-row:hover     { background:rgba(253,245,238,0.7) !important; }
        .layer-card:hover  { transform:translateY(-1px); }
      `}</style>

      {/* Action bar */}
      <div style={{
        background: "rgba(253,245,238,0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(234,224,213,0.7)",
        padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            fontSize: "10px", fontWeight: 700, padding: "3px 9px", borderRadius: "20px",
            background: "rgba(15,110,86,0.10)", color: "#0F6E56", letterSpacing: "0.5px",
            display: "flex", alignItems: "center", gap: "5px",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0F6E56", display: "inline-block", animation: "pulse 2s ease-in-out infinite" }} />
            4 / 6 layers active
          </span>
          <span style={{ fontSize: "11px", color: "#C8B8A8" }}>·</span>
          <span style={{ fontSize: "11px", color: "#B8A898" }}>Built in-house · 7 checks per email</span>
        </div>
        <Link href="/contacts">
          <button style={{
            padding: "7px 16px", borderRadius: "100px", border: "none",
            background: "linear-gradient(135deg, #E8561A, #FF7A3D)",
            color: "#fff", fontSize: "12px", fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 4px 14px rgba(232,86,26,0.28)",
            display: "flex", alignItems: "center", gap: "5px",
          }}>
            Verify all contacts <ArrowRight size={12} />
          </button>
        </Link>
      </div>

      <div style={{ padding: "20px 24px" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%",
              border: "2px solid rgba(232,86,26,0.15)", borderTopColor: "#E8561A",
              animation: "spin 0.7s linear infinite",
            }} />
          </div>
        ) : stats && (
          <>
            {/* ── Stat Cards ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: "10px", marginBottom: "18px" }}>
              {[
                { label: "Total",   value: stats.contacts.total,      color: "#130E08", bar: "#C8B8A8" },
                { label: "Valid",   value: stats.contacts.verified,   color: "#0F6E56", bar: "#0F6E56" },
                { label: "Invalid", value: stats.contacts.invalid,    color: "#993C1D", bar: "#993C1D" },
                { label: "Risky",   value: stats.contacts.risky,      color: "#854F0B", bar: "#C8820A" },
                { label: "Unknown", value: stats.contacts.unknown,    color: "#8A7A6A", bar: "#B8A898" },
                { label: "Not yet", value: stats.contacts.unverified, color: "#B8A898", bar: "#D8C8B8" },
              ].map((s, i) => (
                <div key={i} className="stat-card" style={{
                  ...glass, padding: "14px 16px", textAlign: "center",
                  transition: "all 0.2s", cursor: "default", position: "relative", overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: "3px",
                    background: s.bar, borderRadius: "18px 18px 0 0", opacity: 0.7,
                  }} />
                  <div style={{ fontSize: "24px", fontWeight: 800, color: s.color, letterSpacing: "-1px", lineHeight: 1.1, marginTop: "4px" }}>
                    {s.value.toLocaleString()}
                  </div>
                  <div style={{ fontSize: "10px", color: "#B8A898", marginTop: "5px", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Two-column: Test + Recent ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>

              {/* Test panel */}
              <div style={{ ...glass, padding: "22px" }}>
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#130E08", marginBottom: "2px" }}>Test a single email</div>
                  <div style={{ fontSize: "11px", color: "#B8A898" }}>Run all 7 checks instantly and see a detailed breakdown</div>
                </div>

                <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                  <input
                    className="verif-input"
                    type="email"
                    value={testEmail}
                    onChange={e => setTestEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleTest()}
                    placeholder="test@company.com"
                    style={{
                      flex: 1, padding: "10px 13px",
                      border: "1.5px solid rgba(234,224,213,0.9)",
                      borderRadius: "10px", fontSize: "13px", fontFamily: "inherit",
                      color: "#130E08", background: "rgba(255,255,255,0.7)",
                      transition: "all 0.15s",
                    }}
                  />
                  <button
                    onClick={handleTest}
                    disabled={!testEmail.trim() || testing}
                    style={{
                      padding: "10px 18px", borderRadius: "10px", border: "none",
                      background: testEmail.trim() && !testing
                        ? "linear-gradient(135deg, #E8561A, #FF7A3D)"
                        : "rgba(234,224,213,0.7)",
                      fontSize: "12px", fontWeight: 600,
                      color: testEmail.trim() && !testing ? "#fff" : "#B8A898",
                      cursor: testEmail.trim() && !testing ? "pointer" : "not-allowed",
                      fontFamily: "inherit", flexShrink: 0, transition: "all 0.15s",
                      boxShadow: testEmail.trim() && !testing ? "0 4px 12px rgba(232,86,26,0.28)" : "none",
                      minWidth: "76px", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
                    }}
                  >
                    {testing ? (
                      <div style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
                    ) : <><span>Verify</span><ArrowRight size={12} /></>}
                  </button>
                </div>

                {testResult ? (() => {
                  const s = getStatusStyle(testResult.status)
                  const StatusIcon = s.Icon
                  const checks = [
                    { label: "Syntax valid",         pass: testResult.checks.syntax },
                    { label: "Not gibberish",         pass: !testResult.checks.gibberish },
                    { label: "Not disposable",        pass: !testResult.checks.disposable },
                    { label: "Has MX record",         pass: testResult.checks.hasMX },
                    { label: "SMTP connects",         pass: testResult.checks.smtpConnects },
                    { label: "SMTP accepts mailbox",  pass: testResult.checks.smtpAccepts === true },
                    { label: "Not catch-all",         pass: !testResult.checks.catchAll },
                  ]
                  return (
                    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: "12px", padding: "16px", animation: "fadeUp 0.2s ease" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{
                            width: "34px", height: "34px", borderRadius: "50%",
                            background: s.border, display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <StatusIcon size={16} color={s.color} strokeWidth={2.2} />
                          </div>
                          <div>
                            <div style={{ fontSize: "14px", fontWeight: 700, color: s.color, textTransform: "capitalize" }}>{testResult.status}</div>
                            <div style={{ fontSize: "11px", color: s.color, opacity: 0.7 }}>
                              {testResult.checks.serverType || "Unknown provider"}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "20px", fontWeight: 800, color: s.color, lineHeight: 1 }}>{testResult.score}</div>
                          <div style={{ fontSize: "10px", color: s.color, opacity: 0.6, letterSpacing: "0.3px" }}>/ 100 · {testResult.duration}ms</div>
                        </div>
                      </div>

                      <div style={{ fontSize: "12px", color: s.color, marginBottom: "12px", lineHeight: 1.55, opacity: 0.85 }}>
                        {testResult.detail}
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
                        {checks.map((c, i) => (
                          <div key={i} style={{
                            display: "flex", alignItems: "center", gap: "6px",
                            fontSize: "11.5px", color: s.color, opacity: c.pass ? 0.9 : 0.5,
                          }}>
                            <div style={{
                              width: "16px", height: "16px", borderRadius: "50%", flexShrink: 0,
                              background: c.pass ? "rgba(15,110,86,0.15)" : "rgba(153,60,29,0.12)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              {c.pass
                                ? <Check size={9} color="#0F6E56" strokeWidth={3} />
                                : <X size={9} color="#993C1D" strokeWidth={3} />
                              }
                            </div>
                            {c.label}
                          </div>
                        ))}
                      </div>

                      {testResult.checks.webmail && (
                        <div style={{ marginTop: "10px", fontSize: "11px", color: s.color, opacity: 0.65, display: "flex", alignItems: "center", gap: "5px" }}>
                          <Mail size={11} color={s.color} />
                          Personal / Webmail address
                        </div>
                      )}
                    </div>
                  )
                })() : (
                  <div style={{
                    background: "rgba(253,245,238,0.8)",
                    border: "1px solid rgba(232,86,26,0.10)",
                    borderRadius: "12px", padding: "16px",
                  }}>
                    <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#B8A898", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                      What gets checked
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {WHAT_CHECKS.map(({ Icon, text }, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{
                            width: "26px", height: "26px", borderRadius: "7px", flexShrink: 0,
                            background: "rgba(232,86,26,0.08)", border: "1px solid rgba(232,86,26,0.10)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <Icon size={13} color="#E8561A" strokeWidth={1.8} />
                          </div>
                          <span style={{ fontSize: "12px", color: "#6B5040", fontWeight: 500 }}>{text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Recent verifications */}
              <div style={{ ...glass, padding: "22px", display: "flex", flexDirection: "column" }}>
                <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#130E08", marginBottom: "2px" }}>Recent verifications</div>
                    <div style={{ fontSize: "11px", color: "#B8A898" }}>Last {stats.recentLogs.length} checks</div>
                  </div>
                  {stats.contacts.total > 0 && (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "18px", fontWeight: 800, color: "#E8561A", lineHeight: 1 }}>
                        {Math.round(stats.verificationRate)}%
                      </div>
                      <div style={{ fontSize: "10px", color: "#B8A898", letterSpacing: "0.3px" }}>verified</div>
                    </div>
                  )}
                </div>

                {stats.contacts.total > 0 && (() => {
                  const t = stats.contacts.total
                  const segs = [
                    { w: (stats.contacts.verified / t) * 100, c: "#0F6E56" },
                    { w: (stats.contacts.risky    / t) * 100, c: "#C8820A" },
                    { w: (stats.contacts.invalid  / t) * 100, c: "#993C1D" },
                    { w: (stats.contacts.unknown  / t) * 100, c: "#B8A898" },
                  ]
                  return (
                    <div style={{ height: "5px", borderRadius: "10px", overflow: "hidden", background: "rgba(234,224,213,0.5)", marginBottom: "14px", display: "flex" }}>
                      {segs.map((seg, i) => seg.w > 0 && (
                        <div key={i} style={{ width: `${seg.w}%`, background: seg.c, transition: "width 0.5s" }} />
                      ))}
                    </div>
                  )
                })()}

                <div style={{ flex: 1, overflowY: "auto" }}>
                  {stats.recentLogs.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 20px", color: "#B8A898" }}>
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                        <MailX size={32} color="#D8C8B8" strokeWidth={1.5} />
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#B8A898" }}>No verifications yet</div>
                      <div style={{ fontSize: "11px", marginTop: "4px", color: "#C8B8A8" }}>Test an email on the left to get started</div>
                    </div>
                  ) : (
                    stats.recentLogs.map((log: any, i: number) => {
                      const s = getStatusStyle(log.status)
                      const LogIcon = s.Icon
                      return (
                        <div key={log.id} className="log-row" style={{
                          display: "flex", alignItems: "center", gap: "10px",
                          padding: "9px 8px", borderRadius: "8px", cursor: "default",
                          borderBottom: i < stats.recentLogs.length - 1 ? "1px solid rgba(234,224,213,0.5)" : "none",
                          transition: "background 0.12s",
                        }}>
                          <div style={{
                            width: "30px", height: "30px", borderRadius: "50%", flexShrink: 0,
                            background: s.bg, border: `1px solid ${s.border}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <LogIcon size={14} color={s.color} strokeWidth={2} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#130E08", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {log.email}
                            </div>
                            <div style={{ fontSize: "10.5px", color: "#B8A898", marginTop: "1px" }}>
                              Score {log.score}/100 · {log.serverType || "—"} · {log.responseTime}ms
                            </div>
                          </div>
                          <span style={{
                            fontSize: "10px", fontWeight: 700, padding: "3px 9px",
                            borderRadius: "20px", background: s.bg, color: s.color,
                            border: `1px solid ${s.border}`, flexShrink: 0, letterSpacing: "0.3px",
                          }}>{s.label}</span>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            {/* ── Engine layers ── */}
            <div style={{ ...glass, padding: "22px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#130E08", marginBottom: "2px" }}>Engine layers</div>
                  <div style={{ fontSize: "11px", color: "#B8A898" }}>4 active · 2 on roadmap</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  {LAYERS.map((l, i) => (
                    <div key={i} style={{
                      width: "28px", height: "5px", borderRadius: "10px",
                      background: l.status === "active" ? "#0F6E56" : "rgba(184,168,152,0.25)",
                    }} />
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: "10px" }}>
                {LAYERS.map((layer, i) => {
                  const active = layer.status === "active"
                  const LayerIcon = layer.Icon
                  return (
                    <div key={i} className="layer-card" style={{
                      borderRadius: "12px", padding: "14px",
                      background: active ? "rgba(15,110,86,0.07)" : "rgba(234,224,213,0.30)",
                      border: active ? "1px solid rgba(15,110,86,0.18)" : "1px solid rgba(234,224,213,0.6)",
                      position: "relative", overflow: "hidden", transition: "all 0.2s", cursor: "default",
                    }}>
                      {active && (
                        <div style={{
                          position: "absolute", top: 0, left: 0, right: 0, height: "2px",
                          background: "linear-gradient(90deg, #0F6E56, #1AA07A)",
                        }} />
                      )}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                        <div style={{
                          width: "28px", height: "28px", borderRadius: "8px",
                          background: active ? "rgba(15,110,86,0.12)" : "rgba(184,168,152,0.14)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <LayerIcon size={14} color={active ? "#0F6E56" : "#B8A898"} strokeWidth={1.8} />
                        </div>
                        <span style={{
                          fontSize: "9px", fontWeight: 700, padding: "2px 7px", borderRadius: "10px",
                          background: active ? "rgba(15,110,86,0.10)" : "rgba(184,168,152,0.15)",
                          color: active ? "#0F6E56" : "#B8A898", letterSpacing: "0.3px",
                        }}>{layer.day}</span>
                      </div>
                      <div style={{
                        fontSize: "9px", fontWeight: 700, color: active ? "#0F6E56" : "#B8A898",
                        textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: "4px",
                      }}>Layer {layer.num}</div>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: active ? "#130E08" : "#B8A898", marginBottom: "5px", lineHeight: 1.25 }}>
                        {layer.name}
                      </div>
                      <div style={{ fontSize: "10.5px", color: active ? "#6B5040" : "#C8B8A8", lineHeight: 1.45 }}>
                        {layer.sub}
                      </div>
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
