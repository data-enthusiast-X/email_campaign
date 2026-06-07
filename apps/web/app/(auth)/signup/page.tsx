"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      setError(data.error || "Something went wrong")
      setLoading(false)
      return
    }

    const { signIn } = await import("next-auth/react")
    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/dashboard",
    })
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F5EEE6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        background: "#FDFAF5",
        border: "1px solid #EAE0D5",
        borderRadius: "20px",
        padding: "40px",
        width: "100%",
        maxWidth: "400px",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "40px", height: "40px",
            background: "#E8561A",
            borderRadius: "12px",
            margin: "0 auto 12px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontSize: "18px" }}>✦</span>
          </div>
          <h1 style={{
            fontSize: "24px", fontWeight: "700",
            color: "#130E08", margin: "0 0 4px",
          }}>
            Create your Xerebo account
          </h1>
          <p style={{ color: "#A8927E", fontSize: "14px", margin: 0 }}>
            Start sending smarter emails today with Xerebo
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{
              display: "block", fontSize: "12px",
              fontWeight: "600", color: "#5E4E42",
              marginBottom: "6px", textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              Full name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Amir Khan"
              style={{
                width: "100%", padding: "10px 14px",
                border: "1px solid #EAE0D5",
                borderRadius: "10px", fontSize: "14px",
                background: "#F5EEE6", outline: "none",
                color: "#130E08", boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{
              display: "block", fontSize: "12px",
              fontWeight: "600", color: "#5E4E42",
              marginBottom: "6px", textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
              style={{
                width: "100%", padding: "10px 14px",
                border: "1px solid #EAE0D5",
                borderRadius: "10px", fontSize: "14px",
                background: "#F5EEE6", outline: "none",
                color: "#130E08", boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "block", fontSize: "12px",
              fontWeight: "600", color: "#5E4E42",
              marginBottom: "6px", textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Min 8 characters"
              minLength={8}
              style={{
                width: "100%", padding: "10px 14px",
                border: "1px solid #EAE0D5",
                borderRadius: "10px", fontSize: "14px",
                background: "#F5EEE6", outline: "none",
                color: "#130E08", boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <div style={{
              background: "#FAE8E3", border: "1px solid #EE8D72",
              borderRadius: "8px", padding: "10px 14px",
              color: "#8F2D12", fontSize: "13px", marginBottom: "16px",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "12px",
              background: "#E8561A", color: "#fff",
              border: "none", borderRadius: "100px",
              fontSize: "14px", fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Creating account..." : "Create free account"}
          </button>
        </form>

        <p style={{
          textAlign: "center", marginTop: "24px",
          fontSize: "13px", color: "#A8927E",
        }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#E8561A", fontWeight: "600" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
