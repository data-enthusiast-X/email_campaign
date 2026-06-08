"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface ColumnMapping {
  email: string
  firstName: string
  lastName: string
  fullName: string
  company: string
  phone: string
  jobTitle: string
}

interface ParsedRow {
  [key: string]: string
}

const STEPS = ["Upload", "Map columns", "Importing", "Done"]

function StepBar({ current }: { current: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "32px" }}>
      {STEPS.map((label, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <div style={{
              width: "34px", height: "34px", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: i <= current
                ? "linear-gradient(135deg, #E8561A, #FF7A3D)"
                : "rgba(255,255,255,0.5)",
              border: i <= current ? "none" : "1.5px solid rgba(232,86,26,0.2)",
              fontSize: "12px", fontWeight: 700,
              color: i <= current ? "#fff" : "#B8A898",
              backdropFilter: "blur(8px)",
              boxShadow: i === current ? "0 0 20px rgba(232,86,26,0.45)" : "none",
              transition: "all 0.3s"
            }}>
              {i < current ? "✓" : i + 1}
            </div>
            <span style={{
              fontSize: "10px", fontWeight: i === current ? 700 : 400,
              color: i <= current ? "#E8561A" : "#B8A898",
              whiteSpace: "nowrap", letterSpacing: "0.3px"
            }}>{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{
              width: "64px", height: "1.5px", marginBottom: "18px", marginLeft: "0", marginRight: "0",
              background: i < current
                ? "linear-gradient(90deg, #E8561A, #FF7A3D)"
                : "rgba(232,86,26,0.12)"
            }} />
          )}
        </div>
      ))}
    </div>
  )
}

const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.58)",
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
  border: "1px solid rgba(255,255,255,0.88)",
  borderRadius: "24px",
  boxShadow: "0 8px 40px rgba(232,86,26,0.07), 0 2px 12px rgba(0,0,0,0.04)",
}

const pageBg: React.CSSProperties = {
  minHeight: "100vh",
  background: `
    radial-gradient(ellipse at 12% 12%, rgba(255,175,110,0.38) 0%, transparent 45%),
    radial-gradient(ellipse at 88% 80%, rgba(232,86,26,0.13) 0%, transparent 45%),
    radial-gradient(ellipse at 72% 8%, rgba(255,215,175,0.28) 0%, transparent 42%),
    radial-gradient(ellipse at 30% 85%, rgba(255,200,150,0.18) 0%, transparent 38%),
    #FDF5EE
  `,
  padding: "32px 24px",
}

export default function ImportPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [headers, setHeaders] = useState<string[]>([])
  const [preview, setPreview] = useState<ParsedRow[]>([])
  const [mapping, setMapping] = useState<ColumnMapping>({
    email: "", firstName: "", lastName: "",
    fullName: "", company: "", phone: "", jobTitle: ""
  })
  const [result, setResult] = useState<{ added: number; skipped: number } | null>(null)
  const [allRows, setAllRows] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState("")
  const [imports, setImports] = useState<any[]>([])
  const [loadingImports, setLoadingImports] = useState(true)

  useEffect(() => { fetchImports() }, [])

  async function fetchImports() {
    try {
      const res = await fetch("/api/imports")
      const data = await res.json()
      setImports(data.imports || [])
    } finally {
      setLoadingImports(false)
    }
  }

  function smartDetect(cols: string[]): ColumnMapping {
    const normalize = (s: string) => s.toLowerCase().replace(/[\s_\-\.]/g, "")

    const exactMatch = (keywords: string[]) =>
      cols.find(c => keywords.includes(normalize(c))) || ""

    const partialMatch = (keywords: string[]) =>
      cols.find(c => keywords.some(k => normalize(c).includes(k))) || ""

    // Detect full name FIRST before first/last name
    const fullName = exactMatch([
      "fullname", "contactname", "name",
      "clientname", "customername", "leadname"
    ]) || partialMatch(["fullname", "contactname"])

    // Only detect first/last if fullName is not found
    const firstName = fullName ? "" : (
      exactMatch(["firstname", "fname", "first"]) ||
      partialMatch(["firstname", "fname"])
    )

    const lastName = fullName ? "" : (
      exactMatch(["lastname", "lname", "surname", "last"]) ||
      partialMatch(["lastname", "lname", "surname"])
    )

    return {
      email: exactMatch(["email", "emailaddress", "mail", "workemail", "emailid"]) ||
             partialMatch(["email", "mail"]),
      fullName,
      firstName,
      lastName,
      company: exactMatch(["company", "organisation", "organization", "org", "companyname", "employer"]) ||
               partialMatch(["company", "organisation", "organization", "companyname"]),
      phone: exactMatch(["phone", "mobile", "tel", "phonenumber", "mobilenumber", "contactnumber"]) ||
             partialMatch(["phone", "mobile", "mobilenumber", "phonenumber"]),
      jobTitle: exactMatch(["jobtitle", "title", "position", "role", "designation", "occupation"]) ||
                partialMatch(["jobtitle", "designation", "position"]),
    }
  }

  // Derive name mode directly from mapping — no separate state needed
  const nameMode = mapping.fullName ? "full" : "split"

  function splitFullName(fullName: string) {
    const parts = (fullName || "").trim().split(" ")
    return { first: parts[0] || "", last: parts.slice(1).join(" ") || "" }
  }

  async function parseFile(f: File) {
    setFileName(f.name)
    const ext = f.name.split(".").pop()?.toLowerCase()
    if (ext === "csv" || ext === "txt") {
      const text = await f.text()
      const lines = text.split("\n").filter(l => l.trim())
      if (!lines.length) return
      const parseCSVLine = (line: string) => {
        const result: string[] = []
        let current = "", inQuotes = false
        for (const char of line) {
          if (char === '"') { inQuotes = !inQuotes }
          else if (char === "," && !inQuotes) { result.push(current.trim()); current = "" }
          else { current += char }
        }
        result.push(current.trim())
        return result
      }
      const cols = parseCSVLine(lines[0] ?? "")
      const rows = lines.slice(1).map(line => {
        const vals = parseCSVLine(line)
        const row: ParsedRow = {}
        cols.forEach((col, i) => { row[col] = vals[i] || "" })
        return row
      }).filter(r => Object.values(r).some(v => v))
      setHeaders(cols); setPreview(rows.slice(0, 5)); setAllRows(rows)
      setMapping(smartDetect(cols)); setStep(1)
    } else if (ext === "xlsx" || ext === "xls") {
      const ExcelJS = (await import("exceljs")).default
      const buffer = await f.arrayBuffer()
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(buffer)
      const sheet = workbook.worksheets[0]
      if (!sheet) return
      const data: string[][] = []
      sheet.eachRow(row => {
        const values = (row.values as any[]).slice(1).map(v => String(v ?? ""))
        data.push(values)
      })
      if (!data.length) return
      const cols = (data[0] ?? []).map(c => String(c || ""))
      const rows = data.slice(1).map(row => {
        const r: ParsedRow = {}
        cols.forEach((col, i) => { r[col] = String(row[i] || "") })
        return r
      }).filter(r => Object.values(r).some(v => v && v !== "undefined"))
      setHeaders(cols); setPreview(rows.slice(0, 5)); setAllRows(rows)
      setMapping(smartDetect(cols)); setStep(1)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) parseFile(f)
  }

  async function handleImport() {
    setStep(2)
    const contacts = allRows.map(row => {
      let firstName = row[mapping.firstName] || ""
      let lastName = row[mapping.lastName] || ""
      if (!firstName && !lastName && mapping.fullName && row[mapping.fullName]) {
        const s = splitFullName(row[mapping.fullName] ?? "")
        firstName = s.first; lastName = s.last
      }
      return {
        email: (row[mapping.email] || "").toLowerCase().trim(),
        firstName: firstName.trim() || null,
        lastName: lastName.trim() || null,
        company: (row[mapping.company] || "").trim() || null,
        phone: (row[mapping.phone] || "").trim() || null,
        jobTitle: (row[mapping.jobTitle] || "").trim() || null,
      }
    }).filter(c => c.email && c.email.includes("@"))

    const res = await fetch("/api/contacts/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contacts, fileName: fileName || "Unknown file" })
    })
    setResult(await res.json())
    setStep(3)
  }

  // ── Done ───────────────────────────────────────────
  if (step === 3 && result) {
    return (
      <div style={pageBg}>
        <StepBar current={3} />
        <div style={{ maxWidth: "460px", margin: "0 auto" }}>
          <div style={{ ...glass, padding: "52px 40px", textAlign: "center" }}>
            <div style={{
              width: "72px", height: "72px", borderRadius: "22px",
              background: "linear-gradient(135deg, #E8561A, #FF8A50)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px", fontSize: "34px",
              boxShadow: "0 8px 28px rgba(232,86,26,0.38)"
            }}>🎉</div>
            <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#130E08", marginBottom: "6px" }}>
              Import complete!
            </h2>
            <p style={{ fontSize: "13px", color: "#B8A898", marginBottom: "28px" }}>
              Contacts added as Unverified — verify before sending campaigns.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginBottom: "28px" }}>
              <div style={{
                background: "rgba(15,110,86,0.07)", border: "1px solid rgba(15,110,86,0.18)",
                borderRadius: "16px", padding: "16px 32px", backdropFilter: "blur(8px)"
              }}>
                <div style={{ fontSize: "34px", fontWeight: 700, color: "#0F6E56" }}>{result.added}</div>
                <div style={{ fontSize: "11px", color: "#0F6E56", marginTop: "2px", fontWeight: 600 }}>Added</div>
              </div>
              <div style={{
                background: "rgba(184,168,152,0.08)", border: "1px solid rgba(184,168,152,0.2)",
                borderRadius: "16px", padding: "16px 32px", backdropFilter: "blur(8px)"
              }}>
                <div style={{ fontSize: "34px", fontWeight: 700, color: "#B8A898" }}>{result.skipped}</div>
                <div style={{ fontSize: "11px", color: "#B8A898", marginTop: "2px", fontWeight: 600 }}>Skipped</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button onClick={() => router.push("/contacts")} style={{
                padding: "12px 28px",
                background: "linear-gradient(135deg, #E8561A, #FF7A3D)",
                color: "#fff", border: "none", borderRadius: "100px",
                fontSize: "13px", fontWeight: 600, cursor: "pointer",
                boxShadow: "0 4px 18px rgba(232,86,26,0.35)", fontFamily: "inherit"
              }}>View contacts →</button>
              <button onClick={() => { setStep(0); setResult(null) }} style={{
                padding: "12px 24px",
                background: "rgba(255,255,255,0.6)", backdropFilter: "blur(10px)",
                color: "#6B5040", border: "1px solid rgba(255,255,255,0.9)", borderRadius: "100px",
                fontSize: "13px", cursor: "pointer", fontFamily: "inherit"
              }}>Import another</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Importing ──────────────────────────────────────
  if (step === 2) {
    return (
      <div style={pageBg}>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <StepBar current={2} />
        <div style={{ maxWidth: "460px", margin: "0 auto" }}>
          <div style={{ ...glass, padding: "68px 40px", textAlign: "center" }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "50%",
              border: "3px solid rgba(232,86,26,0.12)",
              borderTopColor: "#E8561A",
              animation: "spin 0.75s linear infinite",
              margin: "0 auto 22px"
            }} />
            <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#130E08", marginBottom: "8px" }}>
              Importing contacts...
            </h2>
            <p style={{ fontSize: "13px", color: "#B8A898" }}>
              Processing <strong style={{ color: "#E8561A" }}>{allRows.length}</strong> rows
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Mapping ────────────────────────────────────────
  if (step === 1) {
    const sel: React.CSSProperties = {
      width: "100%", padding: "8px 10px",
      border: "1px solid rgba(232,86,26,0.14)", borderRadius: "10px",
      fontSize: "12.5px", fontFamily: "inherit", color: "#130E08",
      background: "rgba(255,255,255,0.65)", outline: "none", cursor: "pointer"
    }
    const lbl: React.CSSProperties = {
      fontSize: "10px", fontWeight: 700, color: "#6B5040",
      textTransform: "uppercase", letterSpacing: "0.8px",
      marginBottom: "5px", display: "block"
    }
    return (
      <div style={pageBg}>
        <StepBar current={1} />
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <div style={{ ...glass, padding: "28px 32px" }}>
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "17px", fontWeight: 700, color: "#130E08", marginBottom: "3px" }}>
                Map your columns
              </div>
              <div style={{ fontSize: "12px", color: "#B8A898" }}>
                Auto-detected from your file — confirm before importing
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
              {[
                { key: "email",     label: "Email address *" },
                { key: "fullName",  label: "Full name (auto-split into first + last)" },
                { key: "firstName", label: "First name" },
                { key: "lastName",  label: "Last name" },
                { key: "company",   label: "Company" },
                { key: "phone",     label: "Phone" },
                { key: "jobTitle",  label: "Job title" },
              ]
              .filter(field =>
                field.key === "email" ||
                field.key === "company" ||
                field.key === "phone" ||
                field.key === "jobTitle" ||
                (field.key === "fullName"  && nameMode === "full") ||
                (field.key === "firstName" && nameMode === "split") ||
                (field.key === "lastName"  && nameMode === "split")
              )
              .map(field => (
                <div key={field.key} style={{
                  background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.9)",
                  borderRadius: "12px", padding: "12px", backdropFilter: "blur(8px)"
                }}>
                  <label style={lbl}>{field.label}</label>
                  <select
                    value={(mapping as any)[field.key]}
                    onChange={e => setMapping(m => ({ ...m, [field.key]: e.target.value }))}
                    style={sel}
                  >
                    <option value="">— Not mapped —</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  {field.key === "fullName" && (mapping as any)[field.key] && (
                    <div style={{
                      fontSize: "11px", color: "#0F6E56",
                      marginTop: "5px", display: "flex", alignItems: "center", gap: "4px"
                    }}>
                      ✓ Will be automatically split into first name + last name
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{
              background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.9)",
              borderRadius: "14px", overflow: "hidden", marginBottom: "16px"
            }}>
              <div style={{
                padding: "10px 14px", background: "rgba(232,86,26,0.05)",
                borderBottom: "1px solid rgba(232,86,26,0.07)",
                fontSize: "11px", fontWeight: 600, color: "#6B5040",
                textTransform: "uppercase", letterSpacing: "0.8px",
                display: "flex", alignItems: "center", justifyContent: "space-between"
              }}>
                <span>Preview — how contacts will be saved</span>
                <span style={{ color: "#B8A898", fontWeight: 400 }}>First 5 rows</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                  <thead>
                    <tr style={{ background: "rgba(253,250,245,0.8)" }}>
                      {["First name", "Last name", "Email", "Company", "Phone", "Job title"].map(h => (
                        <th key={h} style={{
                          padding: "8px 12px", textAlign: "left",
                          color: "#0F6E56", fontWeight: 600,
                          borderBottom: "1px solid rgba(232,86,26,0.06)",
                          whiteSpace: "nowrap", fontSize: "11px",
                          textTransform: "uppercase", letterSpacing: "0.5px"
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => {
                      let firstName = row[mapping.firstName] || ""
                      let lastName  = row[mapping.lastName]  || ""
                      if (!firstName && !lastName && mapping.fullName && row[mapping.fullName]) {
                        const parts = (row[mapping.fullName] || "").trim().split(" ")
                        firstName = parts[0] || ""
                        lastName  = parts.slice(1).join(" ") || ""
                      }
                      const email    = row[mapping.email]    || ""
                      const company  = row[mapping.company]  || ""
                      const phone    = row[mapping.phone]    || ""
                      const jobTitle = row[mapping.jobTitle] || ""
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid rgba(232,86,26,0.04)" }}>
                          {[firstName, lastName, email, company, phone, jobTitle].map((val, ci) => (
                            <td key={ci} style={{
                              padding: "9px 12px",
                              color: val ? "#130E08" : "#D8C8B8",
                              whiteSpace: "nowrap", maxWidth: "160px",
                              overflow: "hidden", textOverflow: "ellipsis",
                              fontSize: "12.5px"
                            }}>{val || "—"}</td>
                          ))}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{
              background: "rgba(232,86,26,0.05)", borderRadius: "10px",
              padding: "10px 14px", fontSize: "12px", color: "#7A3010", marginBottom: "18px",
              border: "1px solid rgba(232,86,26,0.1)"
            }}>
              ✦ <strong>{allRows.length} rows</strong> found in your file.
              {mapping.fullName && !mapping.firstName && " Full name will be split into first + last automatically."}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setStep(0)} style={{
                padding: "11px 22px", borderRadius: "100px",
                background: "rgba(255,255,255,0.6)", backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.9)",
                fontSize: "13px", color: "#6B5040", cursor: "pointer", fontFamily: "inherit"
              }}>← Back</button>
              <button onClick={handleImport} disabled={!mapping.email} style={{
                flex: 1, padding: "11px", borderRadius: "100px", border: "none",
                background: mapping.email
                  ? "linear-gradient(135deg, #E8561A, #FF7A3D)"
                  : "rgba(184,168,152,0.15)",
                fontSize: "13px", fontWeight: 600,
                color: mapping.email ? "#fff" : "#B8A898",
                cursor: mapping.email ? "pointer" : "not-allowed",
                fontFamily: "inherit",
                boxShadow: mapping.email ? "0 4px 18px rgba(232,86,26,0.32)" : "none"
              }}>
                Import {allRows.length} contacts →
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Upload ─────────────────────────────────────────
  return (
    <div style={pageBg}>
      <div style={{ maxWidth: "520px", margin: "0 auto 20px" }}>
        <button
          onClick={() => router.push("/contacts")}
          style={{
            display: "flex", alignItems: "center", gap: "7px",
            padding: "0", background: "transparent", border: "none",
            fontSize: "13px", fontWeight: 500, color: "#B8A898",
            cursor: "pointer", fontFamily: "inherit", transition: "color 0.2s"
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "#130E08")}
          onMouseLeave={e => (e.currentTarget.style.color = "#B8A898")}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 13L5 8L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to contacts
        </button>
      </div>
      <StepBar current={0} />
      <div style={{ maxWidth: "520px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "14px" }}>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("fileInput")?.click()}
          style={{
            ...glass,
            padding: "56px 40px", textAlign: "center", cursor: "pointer",
            border: dragging ? "1.5px solid rgba(232,86,26,0.55)" : "1px solid rgba(255,255,255,0.88)",
            background: dragging ? "rgba(232,86,26,0.04)" : "rgba(255,255,255,0.58)",
            boxShadow: dragging
              ? "0 0 0 4px rgba(232,86,26,0.08), 0 8px 40px rgba(232,86,26,0.12)"
              : "0 8px 40px rgba(232,86,26,0.07), 0 2px 12px rgba(0,0,0,0.04)",
            transition: "all 0.2s"
          }}
        >
          {/* Cloud upload icon */}
          <div style={{
            width: "76px", height: "76px", borderRadius: "22px",
            background: "rgba(232,86,26,0.07)",
            border: "1px solid rgba(232,86,26,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 22px",
            boxShadow: "0 4px 20px rgba(232,86,26,0.1)"
          }}>
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
              <path d="M17 24V14M17 14L12 19M17 14L22 19" stroke="#E8561A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 24.5C5.07 23.45 4 21.3 4 19a7 7 0 017-7c.35 0 .7.03 1.04.08A9 9 0 0130 16a6 6 0 01-1.5 11.5" stroke="#E8561A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <h2 style={{ fontSize: "21px", fontWeight: 700, color: "#130E08", marginBottom: "7px" }}>
            Drop your file here
          </h2>
          <p style={{ fontSize: "13px", color: "#B8A898", marginBottom: "22px", lineHeight: 1.5 }}>
            Drag & drop your CSV or Excel file,<br />or click to browse your computer
          </p>

          <button
            onClick={e => { e.stopPropagation(); document.getElementById("fileInput")?.click() }}
            style={{
              padding: "12px 32px",
              background: "linear-gradient(135deg, #E8561A, #FF7A3D)",
              color: "#fff", border: "none", borderRadius: "100px",
              fontSize: "13px", fontWeight: 600, cursor: "pointer",
              boxShadow: "0 4px 20px rgba(232,86,26,0.38)",
              marginBottom: "22px", fontFamily: "inherit",
              letterSpacing: "0.2px"
            }}
          >Choose a file</button>

          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
            {["CSV", "Excel"].map(label => (
              <span key={label} style={{
                padding: "4px 16px", borderRadius: "20px",
                background: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(255,255,255,0.95)",
                color: "#6B5040", fontSize: "11px", fontWeight: 600,
                backdropFilter: "blur(10px)", letterSpacing: "0.3px"
              }}>{label}</span>
            ))}
          </div>

          <input
            id="fileInput" type="file" accept=".csv,.xlsx,.xls,.txt"
            style={{ display: "none" }}
            onChange={e => { const f = e.target.files?.[0]; if (f) parseFile(f) }}
          />
        </div>

        {/* How it works */}
        <div style={{ ...glass, padding: "20px 24px" }}>
          <div style={{
            fontSize: "10px", fontWeight: 700, color: "#B8A898",
            textTransform: "uppercase", letterSpacing: "1px", marginBottom: "14px"
          }}>How it works</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
            {[
              "We read your file and detect all column names",
              "You confirm which column is email, name, etc.",
              "Preview 5 rows before committing",
              "Duplicates skipped — no data overwritten",
            ].map((text, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #E8561A, #FF7A3D)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "10px", fontWeight: 700, color: "#fff",
                  boxShadow: "0 2px 8px rgba(232,86,26,0.28)"
                }}>{i + 1}</div>
                <span style={{ fontSize: "12.5px", color: "#6B5040", lineHeight: 1.4 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Import history */}
        <div style={{ ...glass, padding: "20px 24px" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: "14px"
          }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#130E08" }}>Import history</div>
            <span style={{ fontSize: "11px", color: "#B8A898" }}>Last 20 imports</span>
          </div>

          {loadingImports ? (
            <div style={{ padding: "16px 0", textAlign: "center", color: "#B8A898", fontSize: "13px" }}>
              Loading history...
            </div>
          ) : imports.length === 0 ? (
            <div style={{
              padding: "20px", textAlign: "center",
              background: "rgba(232,86,26,0.03)", borderRadius: "10px",
              border: "1px solid rgba(232,86,26,0.07)",
              color: "#B8A898", fontSize: "12.5px"
            }}>
              No imports yet — your import history will appear here
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {imports.map((imp, i) => (
                <div key={imp.id} style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "11px 0",
                  borderBottom: i < imports.length - 1 ? "1px solid rgba(232,86,26,0.06)" : "none"
                }}>
                  <div style={{
                    width: "34px", height: "34px", borderRadius: "10px",
                    background: "rgba(15,110,86,0.08)",
                    border: "1px solid rgba(15,110,86,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "15px", flexShrink: 0
                  }}>📥</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: "12.5px", fontWeight: 500, color: "#130E08",
                      marginBottom: "2px", overflow: "hidden",
                      textOverflow: "ellipsis", whiteSpace: "nowrap"
                    }}>{imp.fileName}</div>
                    <div style={{ fontSize: "11px", color: "#B8A898" }}>
                      {imp.userEmail} · {new Date(imp.createdAt).toLocaleDateString()} {new Date(imp.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#0F6E56" }}>+{imp.added} added</div>
                    <div style={{ fontSize: "11px", color: "#B8A898" }}>{imp.skipped} skipped</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
