export interface DisposableResult {
  isDisposable: boolean
  domain: string
  reason: string
  method: string
}

// Pattern-based detection for new domains not in the list yet
const DISPOSABLE_PATTERNS = new RegExp(
  [
    "^temp", "^trash", "^spam", "^fake",
    "^throwaway", "^discard", "^burner",
    "^guerrilla", "^mailinator", "^yopmail",
    "\\d+min(ute)?mail", "^10min", "^tmpmail",
    "^disposable", "^noreply", "^no-reply",
    "^throwam", "^tempr\\.", "^spamgourmet"
  ].join("|"),
  "i"
)

let disposableSet: Set<string> | null = null

async function getDisposableSet(): Promise<Set<string>> {
  if (disposableSet) return disposableSet

  try {
    const domains = await import("disposable-email-domains")
    disposableSet = new Set(
      (domains.default || domains) as string[]
    )
    return disposableSet
  } catch {
    console.warn("Could not load disposable-email-domains package")
    disposableSet = new Set()
    return disposableSet
  }
}

export async function checkDisposable(
  email: string
): Promise<DisposableResult> {
  const domain = email.split("@")[1]?.toLowerCase()

  if (!domain) {
    return {
      isDisposable: false,
      domain: "",
      reason: "no_domain",
      method: "none"
    }
  }

  // Check 1 — npm package database (100k+ domains)
  const domainSet = await getDisposableSet()
  if (domainSet.has(domain)) {
    return {
      isDisposable: true,
      domain,
      reason: "found_in_database",
      method: "database"
    }
  }

  // Check 2 — Pattern matching for new providers
  if (DISPOSABLE_PATTERNS.test(domain)) {
    return {
      isDisposable: true,
      domain,
      reason: "matches_disposable_pattern",
      method: "pattern"
    }
  }

  // Check 3 — Subdomain check (e.g. mail.mailinator.com)
  const parts = domain.split(".")
  if (parts.length > 2) {
    const rootDomain = parts.slice(-2).join(".")
    if (domainSet.has(rootDomain)) {
      return {
        isDisposable: true,
        domain,
        reason: "subdomain_of_disposable",
        method: "subdomain_check"
      }
    }
  }

  return {
    isDisposable: false,
    domain,
    reason: "not_disposable",
    method: "all_checks_passed"
  }
}
