import { checkSyntax } from "./checks/syntax"
import { checkGibberish } from "./checks/gibberish"
import { checkDisposable } from "./checks/disposable"
import { checkWebmail } from "./checks/webmail"
import { checkMXRecord } from "./checks/mx-record"
import { checkSMTP } from "./checks/smtp"
import { resolveCatchAll } from "./checks/catch-all"

export interface VerificationResult {
  email: string
  status: "valid" | "invalid" | "risky" | "unknown"
  score: number
  checks: {
    syntax: boolean
    gibberish: boolean
    disposable: boolean
    webmail: boolean
    hasMX: boolean
    serverType: string | null
    smtpConnects: boolean
    smtpAccepts: boolean | null
    catchAll: boolean
    smtpBanner: string
    serverResponse: string
    catchAllResolved: boolean
    catchAllConfidence: number
  }
  reason: string
  detail: string
  duration: number
}

export async function verifyEmail(email: string): Promise<VerificationResult> {
  const startTime = Date.now()
  const normalizedEmail = email.toLowerCase().trim()

  const emptyChecks = {
    syntax: false, gibberish: false, disposable: false, webmail: false,
    hasMX: false, serverType: null, smtpConnects: false, smtpAccepts: null,
    catchAll: false, smtpBanner: "", serverResponse: "",
    catchAllResolved: false, catchAllConfidence: 0,
  }

  // CHECK 1 — Syntax
  const syntaxResult = checkSyntax(normalizedEmail)
  if (!syntaxResult.valid) {
    return {
      email: normalizedEmail, status: "invalid", score: 0,
      checks: emptyChecks,
      reason: "invalid_syntax",
      detail: syntaxResult.reason ?? "Email format is invalid",
      duration: Date.now() - startTime,
    }
  }

  // CHECK 2 — Gibberish
  const gibberishResult = checkGibberish(normalizedEmail)

  // CHECK 3 — Disposable
  const disposableResult = await checkDisposable(normalizedEmail)
  if (disposableResult.isDisposable) {
    return {
      email: normalizedEmail, status: "risky", score: 10,
      checks: { ...emptyChecks, syntax: true, gibberish: gibberishResult.isGibberish, disposable: true },
      reason: "disposable_email",
      detail: `Disposable email provider (detected via ${disposableResult.method})`,
      duration: Date.now() - startTime,
    }
  }

  // CHECK 4 — Webmail
  const webmailResult = checkWebmail(normalizedEmail)

  // CHECK 5 — MX record (cached)
  const mxResult = await checkMXRecord(normalizedEmail)
  if (!mxResult.hasMX) {
    return {
      email: normalizedEmail, status: "invalid", score: 5,
      checks: {
        ...emptyChecks, syntax: true, gibberish: gibberishResult.isGibberish,
        disposable: false, webmail: webmailResult.isWebmail,
      },
      reason: mxResult.reason === "domain_not_found" ? "domain_not_found" : "no_mx_record",
      detail: "Domain has no mail server — emails cannot be received",
      duration: Date.now() - startTime,
    }
  }

  // Gibberish but has MX → risky
  if (gibberishResult.isGibberish) {
    return {
      email: normalizedEmail, status: "risky", score: 20,
      checks: {
        ...emptyChecks, syntax: true, gibberish: true,
        webmail: webmailResult.isWebmail, hasMX: true,
        serverType: mxResult.serverType || null,
      },
      reason: "gibberish_address",
      detail: "Email address looks randomly generated",
      duration: Date.now() - startTime,
    }
  }

  // CHECKS 6 + 7 — SMTP connection + tickling
  const smtpResult = await checkSMTP(normalizedEmail, mxResult.primaryMX)

  let status: "valid" | "invalid" | "risky" | "unknown"
  let score: number
  let reason: string
  let detail: string
  let catchAllResolved = false
  let catchAllConfidence = 0

  if (!smtpResult.smtpConnects) {
    status = "unknown"
    score = 40
    reason = smtpResult.reason
    detail = smtpResult.reason === "smtp_timeout"
      ? "Mail server did not respond in time — try again later"
      : "Could not connect to mail server"
  } else if (smtpResult.smtpAccepts === false) {
    status = "invalid"
    score = 2
    reason = "smtp_rejected"
    detail = "Mail server confirmed this address does not exist"
  } else if (smtpResult.isCatchAll) {
    // CHECK 8 — Catch-all timing attack resolution
    const resolution = await resolveCatchAll(normalizedEmail, mxResult.primaryMX)

    catchAllResolved = resolution.resolved
    catchAllConfidence = resolution.confidence

    if (resolution.resolved && resolution.likelyValid === true) {
      status = "valid"
      score = Math.round(45 + (resolution.confidence * 0.4))
      reason = "catch_all_resolved_valid"
      detail = `Catch-all server — timing analysis suggests mailbox likely exists (${resolution.confidence}% confidence)`
    } else if (resolution.resolved && resolution.likelyValid === false) {
      status = "invalid"
      score = 5
      reason = "catch_all_resolved_invalid"
      detail = "Catch-all server — timing analysis suggests mailbox likely does not exist"
    } else {
      status = "risky"
      score = 45
      reason = "catch_all_unresolved"
      detail = "Server accepts all addresses — cannot confirm specific mailbox exists"
    }
  } else if (smtpResult.smtpAccepts === true) {
    status = "valid"
    score = webmailResult.isWebmail ? 82 : 95
    reason = "smtp_accepted"
    detail = `Mail server confirmed this mailbox exists (${mxResult.serverType || "mail server"})`
  } else {
    status = "unknown"
    score = 35
    reason = "smtp_unknown"
    detail = "Could not determine if mailbox exists"
  }

  return {
    email: normalizedEmail, status, score,
    checks: {
      syntax: true,
      gibberish: false,
      disposable: false,
      webmail: webmailResult.isWebmail,
      hasMX: true,
      serverType: mxResult.serverType || null,
      smtpConnects: smtpResult.smtpConnects,
      smtpAccepts: smtpResult.smtpAccepts,
      catchAll: smtpResult.isCatchAll,
      smtpBanner: smtpResult.smtpBanner,
      serverResponse: smtpResult.serverResponse,
      catchAllResolved,
      catchAllConfidence,
    },
    reason, detail,
    duration: Date.now() - startTime,
  }
}

export { checkDisposable } from "./checks/disposable"
export { checkMXRecord, getMXCacheStats } from "./checks/mx-record"
export type { DisposableResult } from "./checks/disposable"
export type { MXResult } from "./checks/mx-record"
export type { SMTPResult } from "./checks/smtp"
export type { CatchAllResolutionResult } from "./checks/catch-all"
