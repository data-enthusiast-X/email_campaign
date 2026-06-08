import { promises as dns } from "dns"

export interface MXResult {
  hasMX: boolean
  mxRecords: Array<{ exchange: string; priority: number }>
  primaryMX: string
  serverType: string
  reason: string
  cached: boolean
}

function detectServerType(mxRecord: string): string {
  const mx = mxRecord.toLowerCase()
  if (mx.includes("google") || mx.includes("gmail") || mx.includes("googlemail")) return "Google Workspace"
  if (mx.includes("outlook") || mx.includes("microsoft") || mx.includes("protection.outlook")) return "Microsoft Exchange/O365"
  if (mx.includes("yahoo")) return "Yahoo Mail"
  if (mx.includes("amazonses") || mx.includes("amazonaws")) return "Amazon SES"
  if (mx.includes("mailchimp") || mx.includes("mandrill")) return "Mailchimp/Mandrill"
  if (mx.includes("sendgrid")) return "SendGrid"
  if (mx.includes("zoho")) return "Zoho Mail"
  if (mx.includes("fastmail")) return "Fastmail"
  if (mx.includes("protonmail")) return "ProtonMail"
  if (mx.includes("mimecast")) return "Mimecast"
  if (mx.includes("pphosted")) return "Proofpoint"
  if (mx.includes("barracuda")) return "Barracuda"
  return "Custom Mail Server"
}

// In-memory cache: key = domain, value = { result, expiresAt }
const mxCache = new Map<string, { result: MXResult; expiresAt: number }>()
const CACHE_TTL = 24 * 60 * 60 * 1000      // 24 hours for successful lookups
const FAIL_TTL  =       60 * 60 * 1000      // 1 hour for failures

export async function checkMXRecord(email: string): Promise<MXResult> {
  const domain = email.split("@")[1]?.toLowerCase()

  if (!domain) {
    return { hasMX: false, mxRecords: [], primaryMX: "", serverType: "", reason: "no_domain", cached: false }
  }

  // Serve from cache if still fresh
  const cached = mxCache.get(domain)
  if (cached && cached.expiresAt > Date.now()) {
    return { ...cached.result, cached: true }
  }

  try {
    const records = await dns.resolveMx(domain)

    if (!records || records.length === 0) {
      const result: MXResult = { hasMX: false, mxRecords: [], primaryMX: "", serverType: "", reason: "no_mx_records", cached: false }
      mxCache.set(domain, { result, expiresAt: Date.now() + CACHE_TTL })
      return result
    }

    const sorted = records.sort((a, b) => a.priority - b.priority)
    const primaryMX = sorted[0]?.exchange ?? ""
    const serverType = detectServerType(primaryMX)

    const result: MXResult = {
      hasMX: true,
      mxRecords: sorted.map(r => ({ exchange: r.exchange, priority: r.priority })),
      primaryMX,
      serverType,
      reason: "mx_found",
      cached: false,
    }

    mxCache.set(domain, { result, expiresAt: Date.now() + CACHE_TTL })
    return result

  } catch (error: any) {
    const result: MXResult = {
      hasMX: false, mxRecords: [], primaryMX: "", serverType: "",
      reason: error.code === "ENOTFOUND" ? "domain_not_found" : "dns_lookup_failed",
      cached: false,
    }
    mxCache.set(domain, { result, expiresAt: Date.now() + FAIL_TTL })
    return result
  }
}

export function getMXCacheStats() {
  return { size: mxCache.size, domains: Array.from(mxCache.keys()) }
}
