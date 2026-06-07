import Link from "next/link"
const pageBg: React.CSSProperties = {
  minHeight: "100vh",
  background: `radial-gradient(ellipse at 12% 12%, rgba(255,175,110,0.32) 0%, transparent 45%), radial-gradient(ellipse at 88% 80%, rgba(232,86,26,0.10) 0%, transparent 45%), radial-gradient(ellipse at 72% 8%, rgba(255,215,175,0.22) 0%, transparent 42%), #FDF5EE`,
  padding: "28px 28px",
}
const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.58)", backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)", border: "1px solid rgba(255,255,255,0.88)",
  borderRadius: "20px", boxShadow: "0 4px 24px rgba(232,86,26,0.06), 0 1px 6px rgba(0,0,0,0.03)",
}
export default function VerificationPage() {
  return (
    <div style={pageBg}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ ...glass, padding: "56px 40px", textAlign: "center" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "18px", background: "rgba(15,110,86,0.08)", border: "1px solid rgba(15,110,86,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "28px" }}>✓</div>
          <div style={{ display: "inline-block", fontSize: "10px", fontWeight: 700, color: "#0F6E56", background: "rgba(15,110,86,0.08)", border: "1px solid rgba(15,110,86,0.15)", padding: "4px 12px", borderRadius: "20px", letterSpacing: "1px", textTransform: "uppercase" as const, marginBottom: "14px" }}>Coming soon</div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#130E08", marginBottom: "8px" }}>Verification</div>
          <div style={{ fontSize: "13px", color: "#B8A898", lineHeight: 1.6, marginBottom: "24px" }}>Verify email addresses before sending campaigns.<br />Remove invalid, risky, and catch-all emails automatically.</div>
          <Link href="/contacts"><button style={{ padding: "11px 28px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #0F6E56, #1A9E80)", fontSize: "13px", fontWeight: 600, color: "#fff", cursor: "pointer", boxShadow: "0 4px 16px rgba(15,110,86,0.28)" }}>Go to contacts →</button></Link>
        </div>
      </div>
    </div>
  )
}
