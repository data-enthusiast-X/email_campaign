"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "⊞" },
  { href: "/contacts", label: "Contacts", icon: "⊚" },
  { href: "/campaigns", label: "Campaigns", icon: "✉" },
  { href: "/queue", label: "Send queue", icon: "◎" },
  { href: "/automation", label: "Automation", icon: "⟡" },
  { href: "/analytics", label: "Analytics", icon: "⟋" },
]

const toolItems = [
  { href: "/verification", label: "Verification", icon: "✓" },
  { href: "/signature", label: "Signature", icon: "✏" },
  { href: "/templates", label: "Templates", icon: "⊟" },
  { href: "/domain", label: "Domain", icon: "⊕" },
]

const accountItems = [
  { href: "/settings", label: "Settings", icon: "⚙" },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(true)

  const isActive = (href: string) => pathname === href

  const NavItem = ({ href, label, icon }: {
    href: string
    label: string
    icon: string
  }) => {
    const active = isActive(href)
    return (
      <Link href={href} style={{
        display: "flex",
        alignItems: "center",
        gap: expanded ? "10px" : "0px",
        justifyContent: expanded ? "flex-start" : "center",
        padding: expanded ? "9px 12px" : "10px",
        borderRadius: "10px",
        marginBottom: "2px",
        textDecoration: "none",
        fontSize: "13px",
        fontWeight: active ? 500 : 400,
        color: active ? "#fff" : "rgba(255,255,255,0.5)",
        background: active
          ? "linear-gradient(135deg, #E8561A, #F07040)"
          : "transparent",
        transition: "all 0.2s ease",
        position: "relative",
        overflow: "hidden",
        boxShadow: active ? "0 4px 12px rgba(232,86,26,0.35)" : "none",
      }}
      onMouseEnter={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"
          ;(e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)"
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = "transparent"
          ;(e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"
        }
      }}
      >
        {active && (
          <div style={{
            position: "absolute",
            right: "-10px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "4px",
            height: "20px",
            background: "#fff",
            borderRadius: "2px 0 0 2px",
            opacity: 0.4
          }} />
        )}
        <span style={{
          fontSize: "16px",
          width: "20px",
          textAlign: "center",
          flexShrink: 0,
          opacity: active ? 1 : 0.8
        }}>{icon}</span>
        {expanded && (
          <span style={{
            overflow: "hidden",
            whiteSpace: "nowrap",
            transition: "opacity 0.2s"
          }}>{label}</span>
        )}
      </Link>
    )
  }

  const SectionLabel = ({ label }: { label: string }) => expanded ? (
    <div style={{
      fontSize: "9px",
      fontWeight: 700,
      letterSpacing: "2px",
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.18)",
      padding: "14px 12px 5px",
      userSelect: "none"
    }}>{label}</div>
  ) : (
    <div style={{
      height: "1px",
      background: "rgba(255,255,255,0.06)",
      margin: "10px 8px"
    }} />
  )

  return (
    <div style={{
      width: expanded ? "240px" : "64px",
      background: "#0F0B06",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      height: "100vh",
      position: "relative",
      overflow: "hidden",
      transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
      borderRight: "1px solid rgba(255,255,255,0.06)"
    }}>

      {/* Ambient glow */}
      <div style={{
        position: "absolute",
        top: "-100px",
        left: "-60px",
        width: "280px",
        height: "280px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(232,86,26,0.15) 0%, transparent 65%)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      {/* Bottom ambient glow */}
      <div style={{
        position: "absolute",
        bottom: "-80px",
        right: "-80px",
        width: "200px",
        height: "200px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(232,86,26,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      {/* Brand header */}
      <div style={{
        padding: expanded ? "20px 16px 16px" : "18px 12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: expanded ? "space-between" : "center",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        position: "relative",
        zIndex: 1,
        flexShrink: 0
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "34px",
            height: "34px",
            background: "linear-gradient(135deg, #E8561A 0%, #C04010 100%)",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(232,86,26,0.4)",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              position: "absolute",
              top: 0, left: 0, right: 0,
              height: "50%",
              background: "rgba(255,255,255,0.12)",
              borderRadius: "10px 10px 0 0"
            }} />
            <span style={{ position: "relative", zIndex: 1 }}>✦</span>
          </div>
          {expanded && (
            <div style={{
              fontSize: "17px",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.3px",
              lineHeight: 1
            }}>
              Xere<span style={{ color: "#E8561A" }}>.</span>bo
            </div>
          )}
        </div>

        {expanded && (
          <button
            onClick={() => setExpanded(false)}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "7px",
              width: "26px",
              height: "26px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "rgba(255,255,255,0.3)",
              fontSize: "12px",
              flexShrink: 0,
              transition: "all 0.15s"
            }}
          >‹</button>
        )}

        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            style={{
              position: "absolute",
              bottom: "-14px",
              right: "-14px",
              background: "#1A1208",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "rgba(255,255,255,0.4)",
              fontSize: "12px",
              zIndex: 10
            }}
          >›</button>
        )}
      </div>

      {/* Search — only when expanded */}
      {expanded && (
        <div style={{ padding: "12px 14px 6px", position: "relative", zIndex: 1, flexShrink: 0 }}>
          <div style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "10px",
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            transition: "border-color 0.15s"
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)"
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"
          }}
          >
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px" }}>⌕</span>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px", flex: 1 }}>Search...</span>
            <span style={{
              fontSize: "9px",
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.2)",
              padding: "2px 5px",
              borderRadius: "4px",
              border: "1px solid rgba(255,255,255,0.08)"
            }}>⌘K</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <div style={{
        padding: expanded ? "4px 10px" : "8px 8px",
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        position: "relative",
        zIndex: 1,
        scrollbarWidth: "none"
      }}>
        <SectionLabel label="Main" />
        {navItems.map(item => <NavItem key={item.href} {...item} />)}

        <SectionLabel label="Tools" />
        {toolItems.map(item => <NavItem key={item.href} {...item} />)}

        <SectionLabel label="Account" />
        {accountItems.map(item => <NavItem key={item.href} {...item} />)}
      </div>

      {/* Footer */}
      <div style={{
        padding: expanded ? "10px 10px 14px" : "10px 8px 14px",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        position: "relative",
        zIndex: 1,
        flexShrink: 0
      }}>

        {expanded && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "9px 10px",
            background: "rgba(232,86,26,0.08)",
            borderRadius: "10px",
            marginBottom: "8px",
            border: "1px solid rgba(232,86,26,0.15)"
          }}>
            <div style={{
              width: "24px", height: "24px", borderRadius: "7px",
              background: "rgba(232,86,26,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "12px", flexShrink: 0
            }}>⚡</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>Free plan</span>
                <span style={{ fontSize: "10px", color: "#E8561A", fontWeight: 600, cursor: "pointer" }}>Upgrade</span>
              </div>
              <div style={{
                height: "3px", background: "rgba(255,255,255,0.08)",
                borderRadius: "100px", overflow: "hidden"
              }}>
                <div style={{
                  height: "100%", width: "4%",
                  background: "linear-gradient(90deg, #E8561A, #F07040)",
                  borderRadius: "100px"
                }} />
              </div>
              <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)", marginTop: "3px" }}>
                200 / 5,000 emails
              </div>
            </div>
          </div>
        )}

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: expanded ? "9px" : "0",
          justifyContent: expanded ? "flex-start" : "center",
          padding: expanded ? "8px 10px" : "8px",
          borderRadius: "10px",
          cursor: "pointer",
          transition: "background 0.15s"
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = "transparent"
        }}
        >
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            background: "linear-gradient(135deg, #E8561A 0%, #FF8C50 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "12px", fontWeight: 700, color: "#fff", flexShrink: 0,
            boxShadow: "0 2px 8px rgba(232,86,26,0.3)"
          }}>X</div>
          {expanded && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: "12.5px", fontWeight: 500,
                color: "rgba(255,255,255,0.8)",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
              }}>Xerebo User</div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)" }}>Admin · Free plan</div>
            </div>
          )}
          {expanded && (
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px" }}>⋮</span>
          )}
        </div>
      </div>
    </div>
  )
}
