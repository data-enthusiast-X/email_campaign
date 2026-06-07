"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

const COLOURS = [
  "#E8561A", "#0F6E56", "#185FA5", "#854F0B",
  "#993C1D", "#534AB7", "#D4537E", "#1D9E75",
]

interface Tag {
  id: string
  name: string
  colour: string
  _count: { contacts: number }
}

const pageBg: React.CSSProperties = {
  minHeight: "100vh",
  background: `
    radial-gradient(ellipse at 12% 12%, rgba(255,175,110,0.32) 0%, transparent 45%),
    radial-gradient(ellipse at 88% 80%, rgba(232,86,26,0.10) 0%, transparent 45%),
    radial-gradient(ellipse at 72% 8%,  rgba(255,215,175,0.22) 0%, transparent 42%),
    #FDF5EE
  `,
  padding: "28px 28px",
}

const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.58)",
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
  border: "1px solid rgba(255,255,255,0.88)",
  borderRadius: "20px",
  boxShadow: "0 4px 24px rgba(232,86,26,0.06), 0 1px 6px rgba(0,0,0,0.03)",
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [newColour, setNewColour] = useState("#E8561A")
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { fetchTags() }, [])

  async function fetchTags() {
    const res = await fetch("/api/tags")
    const data = await res.json()
    setTags(data.tags || [])
    setLoading(false)
  }

  async function createTag() {
    if (!newName.trim()) return
    setCreating(true)
    await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, colour: newColour }),
    })
    setNewName("")
    setNewColour("#E8561A")
    setShowForm(false)
    setCreating(false)
    fetchTags()
  }

  async function deleteTag(id: string) {
    if (!confirm("Delete this tag? It will be removed from all contacts.")) return
    await fetch(`/api/tags/${id}`, { method: "DELETE" })
    fetchTags()
  }

  return (
    <div style={pageBg}>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: "20px",
        }}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#130E08", marginBottom: "2px" }}>
              Tags
            </h1>
            <p style={{ fontSize: "12px", color: "#B8A898" }}>
              Organise your contacts with colour-coded labels
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: "9px 18px", borderRadius: "14px", border: "none",
              background: "linear-gradient(135deg, #E8561A, #FF7A3D)",
              fontSize: "13px", fontWeight: 600, color: "#fff",
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 4px 16px rgba(232,86,26,0.32)",
            }}
          >+ New tag</button>
        </div>

        {/* Create form */}
        {showForm && (
          <div style={{ ...glass, padding: "22px 24px", marginBottom: "16px" }}>
            <div style={{
              fontSize: "10px", fontWeight: 700, color: "#B8A898",
              textTransform: "uppercase", letterSpacing: "0.9px", marginBottom: "14px",
            }}>Create new tag</div>

            <div style={{ marginBottom: "14px" }}>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Tag name e.g. VIP, Customer, Lead"
                onKeyDown={e => e.key === "Enter" && createTag()}
                autoFocus
                style={{
                  width: "100%", padding: "10px 13px",
                  background: "rgba(255,255,255,0.65)",
                  border: "1px solid rgba(232,86,26,0.15)", borderRadius: "11px",
                  fontSize: "13px", fontFamily: "inherit", color: "#130E08",
                  outline: "none", boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div style={{
                fontSize: "10px", fontWeight: 700, color: "#B8A898",
                textTransform: "uppercase", letterSpacing: "0.9px", marginBottom: "8px",
              }}>Colour</div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {COLOURS.map(c => (
                  <div
                    key={c}
                    onClick={() => setNewColour(c)}
                    style={{
                      width: "28px", height: "28px", borderRadius: "50%",
                      background: c, cursor: "pointer",
                      border: newColour === c ? "3px solid #130E08" : "3px solid transparent",
                      transition: "all 0.15s",
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{
                display: "inline-flex", alignItems: "center",
                padding: "4px 12px", borderRadius: "20px",
                background: newColour, fontSize: "12px", fontWeight: 600, color: "#fff",
              }}>
                {newName || "Preview"}
              </span>
              <div style={{ flex: 1 }} />
              <button onClick={() => setShowForm(false)} style={{
                padding: "8px 16px", borderRadius: "12px",
                border: "1px solid rgba(232,86,26,0.15)", background: "transparent",
                fontSize: "12px", color: "#6B5040", cursor: "pointer", fontFamily: "inherit",
              }}>Cancel</button>
              <button
                onClick={createTag}
                disabled={!newName.trim() || creating}
                style={{
                  padding: "8px 18px", borderRadius: "12px", border: "none",
                  background: newName.trim() ? "linear-gradient(135deg, #E8561A, #FF7A3D)" : "rgba(184,168,152,0.2)",
                  fontSize: "12px", fontWeight: 600,
                  color: newName.trim() ? "#fff" : "#B8A898",
                  cursor: newName.trim() ? "pointer" : "not-allowed",
                  fontFamily: "inherit",
                  boxShadow: newName.trim() ? "0 4px 14px rgba(232,86,26,0.28)" : "none",
                }}
              >{creating ? "Creating..." : "Create tag"}</button>
            </div>
          </div>
        )}

        {/* Tags list */}
        {loading ? (
          <div style={{ ...glass, padding: "48px", textAlign: "center", color: "#B8A898", fontSize: "13px" }}>
            Loading tags...
          </div>
        ) : tags.length === 0 ? (
          <div style={{ ...glass, padding: "56px 32px", textAlign: "center" }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "16px",
              background: "rgba(232,86,26,0.07)", border: "1px solid rgba(232,86,26,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", fontSize: "24px",
            }}>🏷</div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#130E08", marginBottom: "6px" }}>
              No tags yet
            </div>
            <div style={{ fontSize: "13px", color: "#B8A898" }}>
              Create your first tag to start organising contacts
            </div>
          </div>
        ) : (
          <div style={{ ...glass, overflow: "hidden" }}>
            {tags.map((tag, i) => (
              <div
                key={tag.id}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "14px 20px",
                  borderBottom: i < tags.length - 1 ? "1px solid rgba(232,86,26,0.05)" : "none",
                  transition: "background 0.12s",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(232,86,26,0.025)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
              >
                <div style={{
                  width: "10px", height: "10px", borderRadius: "50%",
                  background: tag.colour, flexShrink: 0,
                }} />
                <span style={{
                  display: "inline-flex", alignItems: "center",
                  padding: "3px 11px", borderRadius: "20px",
                  fontSize: "12px", fontWeight: 600,
                  background: tag.colour + "22", color: tag.colour,
                }}>{tag.name}</span>
                <span style={{ fontSize: "12px", color: "#B8A898" }}>
                  {tag._count.contacts} contact{tag._count.contacts !== 1 ? "s" : ""}
                </span>
                <div style={{ flex: 1 }} />
                <button
                  onClick={() => deleteTag(tag.id)}
                  style={{
                    padding: "5px 12px", borderRadius: "8px",
                    border: "1px solid rgba(153,60,29,0.2)",
                    background: "rgba(153,60,29,0.05)",
                    fontSize: "11px", color: "#993C1D",
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >Delete</button>
              </div>
            ))}
          </div>
        )}

        <div style={{
          marginTop: "16px", padding: "12px 16px",
          background: "rgba(232,86,26,0.05)", borderRadius: "12px",
          border: "1px solid rgba(232,86,26,0.08)",
          fontSize: "12px", color: "#6B5040", lineHeight: "1.6",
        }}>
          💡 To add tags to a contact, open the contact and use the Tags section.{" "}
          <Link href="/contacts" style={{ color: "#E8561A" }}>
            Go to contacts →
          </Link>
        </div>

      </div>
    </div>
  )
}
