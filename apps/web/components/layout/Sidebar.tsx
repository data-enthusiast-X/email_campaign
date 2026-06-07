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

const accountItems = [
  { href: "/settings", label: "Settings", Icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(true)

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  return (
    <div style={{
      width: expanded ? "236px" : "62px",
      background: "#0D0905",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      height: "100vh",
      position: "relative",
      overflow: "hidden",
      transition: "width 0.28s cubic-bezier(0.4,0,0.2,1)",
      borderRight: "1px solid rgba(255,255,255,0.05)"
    }}>

      {/* Ambient glow top */}
      <div style={{
        position: "absolute", top: "-80px", left: "-40px",
        width: "240px", height: "240px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(232,86,26,0.18) 0%, transparent 65%)",
        pointerEvents: "none", zIndex: 0
      }} />

      {/* ── Brand header ── */}
      <div style={{
        padding: expanded ? "18px 14px 14px" : "16px 10px 14px",
        display: "flex", alignItems: "center",
        justifyContent: expanded ? "space-between" : "center",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        position: "relative", zIndex: 1, flexShrink: 0
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Logo mark */}
          <div style={{
            width: "32px", height: "32px",
            background: "linear-gradient(145deg, #F06828 0%, #C03A10 100%)",
            borderRadius: "9px",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 4px 14px rgba(232,86,26,0.45), inset 0 1px 0 rgba(255,255,255,0.15)"
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L14 8L8 14L2 8L8 2Z" fill="rgba(255,255,255,0.9)" />
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

        {/* Collapse toggle */}
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "7px",
            width: "24px", height: "24px",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "rgba(255,255,255,0.3)",
            flexShrink: 0, transition: "all 0.15s",
            ...(expanded ? {} : { position: "absolute" as const, bottom: "-12px", right: "-12px", borderRadius: "50%", width: "26px", height: "26px" })
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"
            ;(e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)"
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"
            ;(e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.3)"
          }}
        >
          {expanded
            ? <ChevronLeft size={13} strokeWidth={2} />
            : <ChevronRight size={13} strokeWidth={2} />
          }
        </button>
      </div>

      {/* ── Search ── */}
      {expanded && (
        <div style={{ padding: "6px 12px 2px", position: "relative", zIndex: 1, flexShrink: 0 }}>
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "9px", padding: "7px 10px",
            display: "flex", alignItems: "center", gap: "8px",
            cursor: "pointer", transition: "border-color 0.15s"
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.13)" }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)" }}
          >
            <Search size={13} color="rgba(255,255,255,0.2)" strokeWidth={2} />
            <span style={{ color: "rgba(255,255,255,0.18)", fontSize: "12px", flex: 1 }}>Search...</span>
            <span style={{
              fontSize: "9px", background: "rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.18)", padding: "2px 5px",
              borderRadius: "4px", border: "1px solid rgba(255,255,255,0.07)",
              letterSpacing: "0.3px"
            }}>⌘K</span>
          </div>
        </div>
      )}

      {/* ── Nav ── */}
      <nav style={{
        padding: expanded ? "4px 10px" : "6px 8px",
        flex: 1, overflowY: "auto", overflowX: "hidden",
        position: "relative", zIndex: 1, scrollbarWidth: "none",
        msOverflowStyle: "none"
      }}>

        <NavGroup label="Main" expanded={expanded} />
        {navItems.map(item => (
          <NavItem key={item.href} {...item} active={isActive(item.href)} expanded={expanded} />
        ))}

        <Divider expanded={expanded} />

        <NavGroup label="Tools" expanded={expanded} />
        {toolItems.map(item => (
          <NavItem key={item.href} {...item} active={isActive(item.href)} expanded={expanded} />
        ))}

      </nav>

      {/* ── Footer ── */}
      <div style={{
        padding: expanded ? "8px 10px 14px" : "8px 8px 14px",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        position: "relative", zIndex: 1, flexShrink: 0
      }}>

        {/* Settings link — always visible */}
        <NavItem href="/settings" label="Settings" Icon={Settings} active={isActive("/settings")} expanded={expanded} />

        {/* Plan bar */}
        {expanded && (
          <div style={{
            padding: "9px 11px",
            background: "rgba(232,86,26,0.07)",
            border: "1px solid rgba(232,86,26,0.12)",
            borderRadius: "10px", marginBottom: "6px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
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
            <div style={{ fontSize: "9.5px", color: "rgba(255,255,255,0.18)", marginTop: "4px" }}>
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
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)" }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
        >
          <div style={{
            width: "30px", height: "30px", borderRadius: "8px", flexShrink: 0,
            background: "linear-gradient(135deg, #E8561A, #FF8C50)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "12px", fontWeight: 700, color: "#fff",
            boxShadow: "0 2px 8px rgba(232,86,26,0.3)"
          }}>X</div>
          {expanded && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: "12px", fontWeight: 500,
                  color: "rgba(255,255,255,0.75)",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                }}>Xerebo User</div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.22)" }}>Admin · Free plan</div>
              </div>
              <MoreHorizontal size={14} color="rgba(255,255,255,0.2)" strokeWidth={1.8} />
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

  return (
    <Link
      href={href}
      title={!expanded ? label : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center",
        gap: expanded ? "10px" : "0",
        justifyContent: expanded ? "flex-start" : "center",
        padding: expanded ? "6px 10px" : "7px",
        borderRadius: "9px",
        marginBottom: "1px",
        textDecoration: "none",
        fontSize: "13px",
        fontWeight: active ? 500 : 400,
        color: active ? "#fff" : hovered ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.38)",
        background: active
          ? "rgba(232,86,26,0.13)"
          : hovered
          ? "rgba(255,255,255,0.05)"
          : "transparent",
        borderLeft: expanded
          ? active ? "2px solid #E8561A" : "2px solid transparent"
          : "none",
        marginLeft: expanded ? "-2px" : "0",
        paddingLeft: expanded ? "12px" : "9px",
        transition: "all 0.17s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Active glow */}
      {active && (
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: "60px",
          background: "linear-gradient(90deg, rgba(232,86,26,0.12), transparent)",
          pointerEvents: "none"
        }} />
      )}
      <Icon
        size={15}
        strokeWidth={active ? 2.2 : 1.8}
        color={active ? "#E8561A" : hovered ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.3)"}
      />
      {expanded && (
        <span style={{
          overflow: "hidden", whiteSpace: "nowrap",
          transition: "opacity 0.2s", letterSpacing: "0.1px"
        }}>{label}</span>
      )}
    </Link>
  )
}

function NavGroup({ label, expanded }: { label: string; expanded: boolean }) {
  if (!expanded) return null
  return (
    <div style={{
      fontSize: "9px", fontWeight: 700, letterSpacing: "1.5px",
      textTransform: "uppercase", color: "rgba(255,255,255,0.14)",
      padding: "8px 10px 3px", userSelect: "none"
    }}>{label}</div>
  )
}

function Divider({ expanded }: { expanded: boolean }) {
  return (
    <div style={{
      height: "1px",
      background: "rgba(255,255,255,0.05)",
      margin: expanded ? "5px 2px" : "5px 6px"
    }} />
  )
}
