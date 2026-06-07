"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ImportPage() {
  const router = useRouter()
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && f.name.endsWith(".csv")) setFile(f)
  }

  async function handleImport() {
    if (!file) return
    setLoading(true)
    const text = await file.text()
    const lines = text.split("\n").filter(l => l.trim())
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""))

    const emailIdx = headers.findIndex(h => h.includes("email"))
    const firstIdx = headers.findIndex(h => h.includes("first") || h === "name")
    const lastIdx = headers.findIndex(h => h.includes("last"))
    const companyIdx = headers.findIndex(h => h.includes("company") || h.includes("org"))

    const contacts = lines.slice(1).map(line => {
      const cols = line.split(",").map(c => c.trim().replace(/"/g, ""))
      return {
        email: emailIdx >= 0 ? cols[emailIdx] : "",
        firstName: firstIdx >= 0 ? cols[firstIdx] : "",
        lastName: lastIdx >= 0 ? cols[lastIdx] : "",
        company: companyIdx >= 0 ? cols[companyIdx] : "",
      }
    }).filter(c => c.email && c.email.includes("@"))

    const res = await fetch("/api/contacts/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contacts })
    })

    const data = await res.json()
    setResult(data)
    setLoading(false)
  }

  return (
    <div style={{ padding: "24px", maxWidth: "600px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#130E08", marginBottom: "4px" }}>
          Import contacts
        </h1>
        <p style={{ fontSize: "13px", color: "#B8A898" }}>
          Upload a CSV file. We will map the columns automatically.
        </p>
      </div>

      {!result ? (
        <>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("fileInput")?.click()}
            style={{
              border: `2px dashed ${dragging ? "#E8561A" : file ? "#0F6E56" : "#EAE0D5"}`,
              borderRadius: "16px",
              padding: "48px 24px",
              textAlign: "center",
              cursor: "pointer",
              background: dragging ? "#FFF0E8" : file ? "#E1F5EE" : "#FDFAF5",
              transition: "all 0.2s",
              marginBottom: "16px"
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>
              {file ? "✅" : "📂"}
            </div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#130E08", marginBottom: "6px" }}>
              {file ? file.name : "Drop your CSV file here"}
            </div>
            <div style={{ fontSize: "12px", color: "#B8A898" }}>
              {file ? `${(file.size / 1024).toFixed(1)} KB · Ready to import` : "or click to browse · CSV files only"}
            </div>
            <input
              id="fileInput"
              type="file"
              accept=".csv"
              style={{ display: "none" }}
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <div style={{
            background: "#F5EEE6",
            borderRadius: "10px",
            padding: "12px 14px",
            fontSize: "12px",
            color: "#6B5040",
            marginBottom: "16px",
            lineHeight: "1.6"
          }}>
            <strong>CSV format:</strong> Your file should have column headers in the first row.
            We automatically detect: email, first name, last name, company.
            Example: <code>email,first_name,last_name,company</code>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => router.back()} style={{
              padding: "10px 20px", borderRadius: "100px",
              border: "1px solid #EAE0D5", background: "transparent",
              fontSize: "13px", fontWeight: 500, color: "#6B5040",
              cursor: "pointer", fontFamily: "inherit"
            }}>← Back</button>
            <button
              onClick={handleImport}
              disabled={!file || loading}
              style={{
                flex: 1, padding: "10px 20px", borderRadius: "100px",
                border: "none", background: file ? "#E8561A" : "#EAE0D5",
                fontSize: "13px", fontWeight: 600,
                color: file ? "#fff" : "#B8A898",
                cursor: file ? "pointer" : "not-allowed",
                fontFamily: "inherit"
              }}
            >
              {loading ? "Importing..." : `Import ${file ? "contacts" : ""}`}
            </button>
          </div>
        </>
      ) : (
        <div style={{
          background: "#fff",
          border: "1px solid #EAE0D5",
          borderRadius: "16px",
          padding: "32px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#130E08", marginBottom: "8px" }}>
            Import complete
          </h2>
          <p style={{ fontSize: "13px", color: "#B8A898", marginBottom: "20px" }}>
            {result.added} contacts added · {result.skipped} duplicates skipped
          </p>
          <button onClick={() => router.push("/contacts")} style={{
            padding: "10px 24px", borderRadius: "100px",
            border: "none", background: "#E8561A",
            fontSize: "13px", fontWeight: 600, color: "#fff",
            cursor: "pointer", fontFamily: "inherit"
          }}>View contacts →</button>
        </div>
      )}
    </div>
  )
}
