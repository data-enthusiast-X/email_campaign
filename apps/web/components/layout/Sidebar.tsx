"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  Users,
  Mail,
  Send,
  Zap,
  BarChart3,
  ShieldCheck,
  PenLine,
  FileText,
  Globe,
  Settings,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Tag,
  Trash2,
} from "lucide-react"

const navItems = [
  { href: "/dashboard",  label: "Dashboard",  Icon: LayoutDashboard },
  { href: "/contacts",   label: "Contacts",   Icon: Users },
  { href: "/campaigns",  label: "Campaigns",  Icon: Mail },
  { href: "/queue",      label: "Send queue", Icon: Send },
  { href: "/automation", label: "Automation", Icon: Zap },
  { href: "/analytics",  label: "Analytics",  Icon: BarChart3 },
]

const toolItems = [
  { href: "/contacts/tags", label: "Tags",         Icon: Tag },
  { href: "/verification",  label: "Verification", Icon: ShieldCheck },
  { href: "/signature",     label: "Signature",    Icon: PenLine },
  { href: "/templates",     label: "Templates",    Icon: FileText },
  { href: "/domain",        label: "Domain",       Icon: Globe },
  { href: "/contacts/bin",  label: "Recycle Bin",  Icon: Trash2 },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(true)

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  return (
    <div style={{
      width: expanded ? "230px" : "64px",
      background: "linear-gradient(180deg, #120A04 0%, #0D0905 100%)",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      height: "100vh",
      position: "relative",
      overflow: "hidden",
      transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
      borderRight: "1px solid rgba(255,255,255,0.06)",
    }}>

      {/* Top ambient glow */}
      <div style={{
        position: "absolute", top: "-60px", left: "-30px",
        width: "200px", height: "200px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(232,86,26,0.22) 0%, transparent 65%)",
        pointerEvents: "none", zIndex: 0
      }} />

      {/* Bottom ambient glow */}
      <div style={{
        position: "absolute", bottom: "0px", right: "-40px",
        width: "160px", height: "160px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(232,86,26,0.08) 0%, transparent 65%)",
        pointerEvents: "none", zIndex: 0
      }} />

      {/* ── Side tab handle (collapsed: right edge) ── */}
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          style={{
            position: "absolute", right: "-1px", top: "50%", transform: "translateY(-50%)",
            width: "18px", height: "48px",
            background: "linear-gradient(180deg, rgba(232,86,26,0.18), rgba(232,86,26,0.08))",
            border: "1px solid rgba(232,86,26,0.22)",
            borderLeft: "none",
            borderRadius: "0 10px 10px 0",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "rgba(255,255,255,0.45)",
            zIndex: 20, transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "linear-gradient(180deg, rgba(232,86,26,0.35), rgba(232,86,26,0.18))"
            ;(e.currentTarget as HTMLElement).style.color = "#FF7040"
            ;(e.currentTarget as HTMLElement).style.width = "22px"
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "linear-gradient(180deg, rgba(232,86,26,0.18), rgba(232,86,26,0.08))"
            ;(e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)"
            ;(e.currentTarget as HTMLElement).style.width = "18px"
          }}
        >
          <ChevronRight size={11} strokeWidth={2.5} />
        </button>
      )}

      {/* ── Brand header ── */}
      <div style={{
        padding: expanded ? "16px 14px 13px" : "14px 0",
        display: "flex", alignItems: "center",
        justifyContent: expanded ? "space-between" : "center",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        position: "relative", zIndex: 1, flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          {/* Logo mark */}
          <div style={{
            width: "34px", height: "34px",
            background: "linear-gradient(145deg, #F06828 0%, #C03A10 100%)",
            borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 4px 16px rgba(232,86,26,0.5), inset 0 1px 0 rgba(255,255,255,0.18)"
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L14 8L8 14L2 8L8 2Z" fill="rgba(255,255,255,0.92)" />
              <circle cx="8" cy="8" r="2.5" fill="#F06828"/>
            </svg>
          </div>
          {expanded && (
            <span style={{
              fontSize: "16px", fontWeight: 700, color: "#fff",
              letterSpacing: "-0.4px", lineHeight: 1
            }}>
              Xere<span style={{ color: "#E8561A" }}>.</span>bo
            </span>
          )}
        </div>

        {/* Collapse toggle (expanded only, in header) */}
        {expanded && (
          <button
            onClick={() => setExpanded(false)}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: "8px",
              width: "26px", height: "26px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "rgba(255,255,255,0.35)",
              flexShrink: 0, transition: "all 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"
              ;(e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)"
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"
              ;(e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)"
            }}
          >
            <ChevronLeft size={13} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* ── Search (expanded only) ── */}
      {expanded && (
        <div style={{ padding: "10px 12px 4px", position: "relative", zIndex: 1, flexShrink: 0 }}>
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "10px", padding: "7px 10px",
            display: "flex", alignItems: "center", gap: "8px",
            cursor: "pointer", transition: "all 0.15s"
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)"
            ;(e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"
            ;(e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"
          }}
          >
            <Search size={13} color="rgba(255,255,255,0.25)" strokeWidth={2} />
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px", flex: 1 }}>Search...</span>
            <span style={{
              fontSize: "9px", background: "rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.2)", padding: "2px 5px",
              borderRadius: "4px", border: "1px solid rgba(255,255,255,0.08)",
              letterSpacing: "0.3px"
            }}>⌘K</span>
          </div>
        </div>
      )}

      {/* ── Nav ── */}
      <nav style={{
        padding: expanded ? "6px 10px" : "10px 10px",
        flex: 1, overflowY: "auto", overflowX: "hidden",
        position: "relative", zIndex: 1, scrollbarWidth: "none",
        msOverflowStyle: "none" as "none",
      }}>

        {expanded && <NavGroup label="Main" />}
        {navItems.map(item => (
          <NavItem key={item.href} {...item} active={isActive(item.href)} expanded={expanded} />
        ))}

        <Divider expanded={expanded} />

        {expanded && <NavGroup label="Tools" />}
        {toolItems.map(item => (
          <NavItem key={item.href} {...item} active={isActive(item.href)} expanded={expanded} />
        ))}

      </nav>

      {/* ── Footer ── */}
      <div style={{
        padding: expanded ? "8px 10px 14px" : "8px 10px 14px",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        position: "relative", zIndex: 1, flexShrink: 0
      }}>

        {/* Settings */}
        <NavItem href="/settings" label="Settings" Icon={Settings} active={isActive("/settings")} expanded={expanded} />

        {/* Plan bar (expanded only) */}
        {expanded && (
          <div style={{
            padding: "10px 12px",
            background: "rgba(232,86,26,0.08)",
            border: "1px solid rgba(232,86,26,0.14)",
            borderRadius: "11px", marginBottom: "7px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Zap size={11} color="#E8561A" strokeWidth={2.5} />
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>Free plan</span>
              </div>
              <span style={{
                fontSize: "10px", color: "#E8561A", fontWeight: 600, cursor: "pointer",
                letterSpacing: "0.2px"
              }}>Upgrade →</span>
            </div>
            <div style={{ height: "3px", background: "rgba(255,255,255,0.07)", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: "4%",
                background: "linear-gradient(90deg, #E8561A, #FF7A3D)",
                borderRadius: "2px"
              }} />
            </div>
            <div style={{ fontSize: "9.5px", color: "rgba(255,255,255,0.2)", marginTop: "5px" }}>
              200 / 5,000 emails sent
            </div>
          </div>
        )}

        {/* User row */}
        <div style={{
          display: "flex", alignItems: "center",
          gap: expanded ? "9px" : "0",
          justifyContent: expanded ? "flex-start" : "center",
          padding: expanded ? "7px 9px" : "7px",
          borderRadius: "10px", cursor: "pointer",
          transition: "background 0.15s"
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)" }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
        >
          <div style={{
            width: "30px", height: "30px", borderRadius: "9px", flexShrink: 0,
            background: "linear-gradient(135deg, #E8561A, #FF8C50)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "12px", fontWeight: 700, color: "#fff",
            boxShadow: "0 2px 10px rgba(232,86,26,0.4)"
          }}>X</div>
          {expanded && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: "12px", fontWeight: 500,
                  color: "rgba(255,255,255,0.8)",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                }}>Xerebo User</div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)" }}>Admin · Free plan</div>
              </div>
              <MoreHorizontal size={14} color="rgba(255,255,255,0.22)" strokeWidth={1.8} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function NavItem({
  href, label, Icon, active, expanded
}: {
  href: string
  label: string
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>
  active: boolean
  expanded: boolean
}) {
  const [hovered, setHovered] = useState(false)

  if (!expanded) {
    // Collapsed: icon-only pill style
    return (
      <Link
        href={href}
        title={label}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "44px", height: "40px",
          margin: "0 auto 2px",
          borderRadius: "12px",
          textDecoration: "none",
          position: "relative",
          background: active
            ? "linear-gradient(135deg, rgba(232,86,26,0.28), rgba(232,86,26,0.14))"
            : hovered
            ? "rgba(255,255,255,0.07)"
            : "transparent",
          border: active
            ? "1px solid rgba(232,86,26,0.35)"
            : "1px solid transparent",
          boxShadow: active ? "0 2px 14px rgba(232,86,26,0.2)" : "none",
          transition: "all 0.18s ease",
        }}
      >
        {/* Active dot */}
        {active && (
          <div style={{
            position: "absolute", right: "5px", top: "5px",
            width: "5px", height: "5px", borderRadius: "50%",
            background: "#E8561A",
            boxShadow: "0 0 6px rgba(232,86,26,0.8)",
          }} />
        )}
        <Icon
          size={17}
          strokeWidth={active ? 2.2 : 1.8}
          color={active ? "#FF7040" : hovered ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.38)"}
        />
      </Link>
    )
  }

  // Expanded: full row
  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center",
        gap: "10px",
        padding: "7px 10px",
        borderRadius: "10px",
        marginBottom: "1px",
        textDecoration: "none",
        fontSize: "13px",
        fontWeight: active ? 500 : 400,
        color: active ? "#fff" : hovered ? "rgba(255,255,255,0.78)" : "rgba(255,255,255,0.42)",
        background: active
          ? "linear-gradient(90deg, rgba(232,86,26,0.18), rgba(232,86,26,0.06))"
          : hovered
          ? "rgba(255,255,255,0.05)"
          : "transparent",
        borderLeft: active ? "2px solid #E8561A" : "2px solid transparent",
        marginLeft: "-2px",
        paddingLeft: "12px",
        transition: "all 0.17s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {active && (
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: "56px",
          background: "linear-gradient(90deg, rgba(232,86,26,0.14), transparent)",
          pointerEvents: "none"
        }} />
      )}
      <Icon
        size={15}
        strokeWidth={active ? 2.2 : 1.8}
        color={active ? "#FF7040" : hovered ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)"}
      />
      <span style={{
        overflow: "hidden", whiteSpace: "nowrap",
        letterSpacing: "0.1px"
      }}>{label}</span>
    </Link>
  )
}

function NavGroup({ label }: { label: string }) {
  return (
    <div style={{
      fontSize: "9px", fontWeight: 700, letterSpacing: "1.4px",
      textTransform: "uppercase", color: "rgba(255,255,255,0.18)",
      padding: "8px 10px 3px", userSelect: "none"
    }}>{label}</div>
  )
}

function Divider({ expanded }: { expanded: boolean }) {
  return (
    <div style={{
      height: "1px",
      background: "rgba(255,255,255,0.05)",
      margin: expanded ? "6px 2px" : "8px 0"
    }} />
  )
}
