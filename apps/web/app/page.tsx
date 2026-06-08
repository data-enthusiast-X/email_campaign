import Link from "next/link"

export default function HomePage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0D0905",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      color: "#fff",
      overflowX: "hidden",
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.55; }
          50%       { opacity: 0.85; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        .nav-link { transition: color 0.15s; }
        .nav-link:hover { color: #E8561A !important; }
        .cta-primary { transition: all 0.18s; }
        .cta-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 36px rgba(232,86,26,0.55) !important; }
        .cta-ghost { transition: all 0.18s; }
        .cta-ghost:hover { background: rgba(255,255,255,0.08) !important; border-color: rgba(255,255,255,0.3) !important; }
        .feature-card { transition: all 0.22s cubic-bezier(0.34,1.2,0.64,1); }
        .feature-card:hover { transform: translateY(-4px); border-color: rgba(232,86,26,0.25) !important; box-shadow: 0 20px 60px rgba(232,86,26,0.10) !important; }
        .stat-card { transition: all 0.2s; }
        .stat-card:hover { border-color: rgba(232,86,26,0.2) !important; }
      `}</style>

      {/* ── Ambient background glows ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{
          position: "absolute", top: "-15%", left: "-10%",
          width: "700px", height: "700px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,86,26,0.18) 0%, transparent 65%)",
          animation: "glow 6s ease-in-out infinite"
        }} />
        <div style={{
          position: "absolute", bottom: "-10%", right: "-5%",
          width: "600px", height: "600px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,86,26,0.10) 0%, transparent 65%)",
          animation: "glow 8s ease-in-out infinite reverse"
        }} />
        <div style={{
          position: "absolute", top: "40%", left: "50%", transform: "translateX(-50%)",
          width: "900px", height: "400px", borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(232,86,26,0.06) 0%, transparent 65%)",
        }} />
      </div>

      {/* ── Navbar ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 40px",
        height: "60px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(13,9,5,0.82)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "30px", height: "30px",
            background: "linear-gradient(145deg, #F06828 0%, #C03A10 100%)",
            borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(232,86,26,0.45)"
          }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L14 8L8 14L2 8L8 2Z" fill="rgba(255,255,255,0.9)" />
              <circle cx="8" cy="8" r="2.5" fill="#F06828"/>
            </svg>
          </div>
          <span style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.4px" }}>
            Xere<span style={{ color: "#E8561A" }}>.</span>bo
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          {["Features", "Pricing", "Docs"].map(label => (
            <a key={label} href="#" className="nav-link" style={{
              fontSize: "13.5px", color: "rgba(255,255,255,0.45)",
              textDecoration: "none", fontWeight: 400
            }}>{label}</a>
          ))}
        </div>

        {/* Auth buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link href="/login" className="nav-link" style={{
            fontSize: "13px", color: "rgba(255,255,255,0.5)",
            textDecoration: "none", padding: "7px 16px", fontWeight: 500
          }}>Log in</Link>
          <Link href="/signup" className="cta-primary" style={{
            fontSize: "13px", fontWeight: 600, color: "#fff",
            textDecoration: "none", padding: "8px 20px",
            background: "linear-gradient(135deg, #E8561A, #FF7A3D)",
            borderRadius: "100px",
            boxShadow: "0 4px 16px rgba(232,86,26,0.38)",
            display: "inline-block"
          }}>Get started free</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        position: "relative", zIndex: 1,
        paddingTop: "160px", paddingBottom: "100px",
        textAlign: "center", padding: "160px 24px 100px",
      }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "rgba(232,86,26,0.10)",
          border: "1px solid rgba(232,86,26,0.22)",
          borderRadius: "100px", padding: "6px 16px",
          marginBottom: "32px",
          animation: "fadeIn 0.6s ease both"
        }}>
          <div style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: "#E8561A", boxShadow: "0 0 8px #E8561A"
          }} />
          <span style={{ fontSize: "12px", color: "#E8A07A", fontWeight: 500, letterSpacing: "0.3px" }}>
            Email marketing built for growth
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: "clamp(44px, 6vw, 76px)",
          fontWeight: 800, lineHeight: 1.06,
          letterSpacing: "-2.5px", marginBottom: "24px",
          animation: "fadeUp 0.7s ease 0.1s both"
        }}>
          Send smarter.<br />
          <span style={{
            background: "linear-gradient(135deg, #E8561A 0%, #FF9A6C 50%, #E8561A 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>Grow faster.</span>
        </h1>

        {/* Subheadline */}
        <p style={{
          fontSize: "clamp(16px, 2vw, 19px)",
          color: "rgba(255,255,255,0.42)",
          maxWidth: "560px", margin: "0 auto 44px",
          lineHeight: 1.65, fontWeight: 400,
          animation: "fadeUp 0.7s ease 0.2s both"
        }}>
          The all-in-one email marketing platform with contact management,
          campaign automation, domain warm-up, and real-time analytics.
        </p>

        {/* CTAs */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "12px",
          animation: "fadeUp 0.7s ease 0.3s both"
        }}>
          <Link href="/signup" className="cta-primary" style={{
            padding: "15px 36px", borderRadius: "100px",
            background: "linear-gradient(135deg, #E8561A, #FF7A3D)",
            color: "#fff", fontSize: "15px", fontWeight: 600,
            textDecoration: "none",
            boxShadow: "0 6px 28px rgba(232,86,26,0.45)",
            display: "inline-block", letterSpacing: "0.1px"
          }}>Start for free →</Link>
          <Link href="/login" className="cta-ghost" style={{
            padding: "15px 36px", borderRadius: "100px",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.6)", fontSize: "15px", fontWeight: 500,
            textDecoration: "none", display: "inline-block",
            background: "rgba(255,255,255,0.03)",
            letterSpacing: "0.1px"
          }}>Sign in</Link>
        </div>

        <p style={{
          fontSize: "12px", color: "rgba(255,255,255,0.2)",
          marginTop: "18px", animation: "fadeIn 0.7s ease 0.5s both"
        }}>
          No credit card required · Free plan includes 5,000 emails/month
        </p>

        {/* Dashboard mockup */}
        <div style={{
          maxWidth: "900px", margin: "70px auto 0",
          animation: "fadeUp 0.8s ease 0.4s both"
        }}>
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: "3px",
            boxShadow: "0 40px 120px rgba(0,0,0,0.5), 0 0 0 1px rgba(232,86,26,0.08), inset 0 1px 0 rgba(255,255,255,0.06)"
          }}>
            {/* Fake browser chrome */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              borderRadius: "18px 18px 0 0",
              padding: "12px 16px",
              display: "flex", alignItems: "center", gap: "8px",
              borderBottom: "1px solid rgba(255,255,255,0.05)"
            }}>
              {["#FF5F57", "#FEBC2E", "#28C840"].map(c => (
                <div key={c} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c, opacity: 0.7 }} />
              ))}
              <div style={{
                flex: 1, height: "24px", background: "rgba(255,255,255,0.04)",
                borderRadius: "6px", margin: "0 12px",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>app.xerebo.com/dashboard</span>
              </div>
            </div>

            {/* Dashboard preview */}
            <div style={{
              background: "linear-gradient(180deg, #1A1108 0%, #0D0905 100%)",
              borderRadius: "0 0 16px 16px",
              padding: "24px",
              display: "flex", gap: "16px",
              minHeight: "320px"
            }}>
              {/* Sidebar mini */}
              <div style={{
                width: "44px", background: "rgba(255,255,255,0.03)",
                borderRadius: "12px", padding: "12px 8px",
                display: "flex", flexDirection: "column", gap: "10px", alignItems: "center",
                border: "1px solid rgba(255,255,255,0.05)"
              }}>
                <div style={{ width: "26px", height: "26px", borderRadius: "8px", background: "linear-gradient(145deg, #F06828, #C03A10)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 2L14 8L8 14L2 8L8 2Z" fill="rgba(255,255,255,0.9)"/><circle cx="8" cy="8" r="2.5" fill="#F06828"/></svg>
                </div>
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{ width: "28px", height: "28px", borderRadius: "8px", background: i === 0 ? "rgba(232,86,26,0.15)" : "rgba(255,255,255,0.04)", border: i === 0 ? "1px solid rgba(232,86,26,0.2)" : "none" }} />
                ))}
              </div>

              {/* Main content */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* Stats row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px" }}>
                  {[
                    { label: "Contacts", val: "12,847", up: true },
                    { label: "Delivered", val: "98.4%",  up: true },
                    { label: "Open rate", val: "34.2%",  up: true },
                    { label: "Campaigns", val: "24",     up: false },
                  ].map(s => (
                    <div key={s.label} style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "10px", padding: "12px"
                    }}>
                      <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.8px" }}>{s.label}</div>
                      <div style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>{s.val}</div>
                      <div style={{ fontSize: "9px", color: s.up ? "#4ADE80" : "rgba(255,255,255,0.3)", marginTop: "2px" }}>{s.up ? "↑ 12%" : "→"}</div>
                    </div>
                  ))}
                </div>

                {/* Contact rows */}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", overflow: "hidden" }}>
                  {[
                    { name: "Sarah Chen",    email: "sarah@acme.com",     tag: "subscribed", color: "#0F6E56" },
                    { name: "James Miller",  email: "james@startup.io",   tag: "verified",   color: "#185FA5" },
                    { name: "Priya Sharma",  email: "priya@company.com",  tag: "subscribed", color: "#0F6E56" },
                    { name: "Tom Wilson",    email: "tom@business.co",    tag: "lead",       color: "#854F0B" },
                  ].map((c, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      padding: "9px 12px",
                      borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none"
                    }}>
                      <div style={{
                        width: "26px", height: "26px", borderRadius: "8px", flexShrink: 0,
                        background: `linear-gradient(135deg, #E8561A, #FF8C50)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "10px", fontWeight: 700
                      }}>{c.name[0]}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "11px", fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>{c.name}</div>
                        <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.22)" }}>{c.email}</div>
                      </div>
                      <div style={{
                        fontSize: "9px", fontWeight: 600, padding: "2px 8px", borderRadius: "20px",
                        background: `rgba(${c.color === "#0F6E56" ? "15,110,86" : c.color === "#185FA5" ? "24,95,165" : "133,79,11"},0.15)`,
                        color: c.color, border: `1px solid ${c.color}33`
                      }}>{c.tag}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ position: "relative", zIndex: 1, padding: "60px 40px" }}>
        <div style={{
          maxWidth: "900px", margin: "0 auto",
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px"
        }}>
          {[
            { value: "5,000",  label: "Free emails/month",  sub: "No card needed" },
            { value: "98.4%",  label: "Delivery rate",      sub: "Industry leading" },
            { value: "< 2s",   label: "Send speed",         sub: "Per 1,000 contacts" },
            { value: "365d",   label: "Data retention",     sub: "Full history" },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "18px", padding: "28px 24px",
              transition: "all 0.2s"
            }}>
              <div style={{ fontSize: "36px", fontWeight: 800, color: "#fff", letterSpacing: "-1.5px", marginBottom: "6px" }}>
                {s.value}
              </div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.55)", marginBottom: "4px" }}>{s.label}</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 40px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          {/* Section label */}
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <div style={{
              display: "inline-block", fontSize: "11px", fontWeight: 700,
              color: "#E8561A", letterSpacing: "1.2px", textTransform: "uppercase",
              marginBottom: "14px"
            }}>Everything you need</div>
            <h2 style={{ fontSize: "clamp(30px, 4vw, 46px)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.1, color: "#fff" }}>
              Built for serious senders
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
            {[
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M4 6h14M4 10h14M4 14h8" stroke="#E8561A" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                ),
                title: "Contact management",
                desc: "Import, segment, tag, and manage unlimited contacts with full activity history and lifecycle tracking."
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <rect x="3" y="5" width="16" height="12" rx="2" stroke="#E8561A" strokeWidth="1.8"/>
                    <path d="M3 9l8 5 8-5" stroke="#E8561A" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                ),
                title: "Campaign builder",
                desc: "Create beautiful HTML campaigns with our editor. Schedule sends, preview across clients, and track every open."
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M11 3v4M11 15v4M3 11h4M15 11h4" stroke="#E8561A" strokeWidth="1.8" strokeLinecap="round"/>
                    <circle cx="11" cy="11" r="4" stroke="#E8561A" strokeWidth="1.8"/>
                  </svg>
                ),
                title: "Domain warm-up",
                desc: "Automatically warm up your sending domain with smart daily limits to maximise inbox placement from day one."
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M3 17l5-5 4 4 7-8" stroke="#E8561A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                title: "Real-time analytics",
                desc: "Track opens, clicks, bounces, and unsubscribes live. Segment by engagement to improve every future send."
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M9 12l2 2 4-4" stroke="#E8561A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M11 3a8 8 0 100 16 8 8 0 000-16z" stroke="#E8561A" strokeWidth="1.8"/>
                  </svg>
                ),
                title: "Email verification",
                desc: "Verify every address before sending. Catch invalid, disposable, and risky emails that would hurt your sender score."
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M4 4l6 6M18 4l-6 6M11 10v8" stroke="#E8561A" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M8 18h6" stroke="#E8561A" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                ),
                title: "Automation flows",
                desc: "Build multi-step drip sequences, welcome flows, and behaviour-triggered emails that run while you sleep."
              },
            ].map((f, i) => (
              <div key={i} className="feature-card" style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "20px", padding: "28px 24px",
              }}>
                <div style={{
                  width: "46px", height: "46px", borderRadius: "14px",
                  background: "rgba(232,86,26,0.10)",
                  border: "1px solid rgba(232,86,26,0.16)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "18px"
                }}>{f.icon}</div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "8px", letterSpacing: "-0.3px" }}>
                  {f.title}
                </div>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", lineHeight: 1.65 }}>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 40px 100px" }}>
        <div style={{
          maxWidth: "760px", margin: "0 auto",
          background: "linear-gradient(135deg, rgba(232,86,26,0.14) 0%, rgba(232,86,26,0.06) 100%)",
          border: "1px solid rgba(232,86,26,0.22)",
          borderRadius: "28px", padding: "64px 48px",
          textAlign: "center", position: "relative", overflow: "hidden"
        }}>
          {/* Glow */}
          <div style={{
            position: "absolute", top: "-40%", left: "50%", transform: "translateX(-50%)",
            width: "400px", height: "300px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(232,86,26,0.2) 0%, transparent 70%)",
            pointerEvents: "none"
          }} />

          <div style={{
            display: "inline-block", fontSize: "11px", fontWeight: 700,
            color: "#E8561A", letterSpacing: "1.2px", textTransform: "uppercase",
            marginBottom: "18px"
          }}>Start today</div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-1.5px", marginBottom: "16px", lineHeight: 1.1 }}>
            Ready to grow your audience?
          </h2>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.4)", marginBottom: "36px", lineHeight: 1.6, maxWidth: "440px", margin: "0 auto 36px" }}>
            Join thousands of businesses using Xerebo to send smarter emails, build better lists, and grow faster.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <Link href="/signup" className="cta-primary" style={{
              padding: "15px 40px", borderRadius: "100px",
              background: "linear-gradient(135deg, #E8561A, #FF7A3D)",
              color: "#fff", fontSize: "15px", fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 6px 28px rgba(232,86,26,0.45)",
              display: "inline-block"
            }}>Create free account →</Link>
            <Link href="/login" className="cta-ghost" style={{
              padding: "15px 36px", borderRadius: "100px",
              border: "1px solid rgba(255,255,255,0.14)",
              color: "rgba(255,255,255,0.55)", fontSize: "15px",
              textDecoration: "none", display: "inline-block",
              background: "rgba(255,255,255,0.03)"
            }}>Sign in</Link>
          </div>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", marginTop: "18px" }}>
            Free forever · No credit card · 5,000 emails/month included
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        position: "relative", zIndex: 1,
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "32px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "22px", height: "22px",
            background: "linear-gradient(145deg, #F06828, #C03A10)",
            borderRadius: "6px",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L14 8L8 14L2 8L8 2Z" fill="rgba(255,255,255,0.9)"/>
            </svg>
          </div>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>
            Xere<span style={{ color: "#E8561A" }}>.</span>bo
          </span>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.18)", marginLeft: "8px" }}>
            © 2026
          </span>
        </div>
        <div style={{ display: "flex", gap: "24px" }}>
          {["Privacy", "Terms", "Contact"].map(l => (
            <a key={l} href="#" className="nav-link" style={{
              fontSize: "12px", color: "rgba(255,255,255,0.22)", textDecoration: "none"
            }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}
