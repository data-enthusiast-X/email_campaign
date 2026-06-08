export interface SyntaxResult {
  valid: boolean
  reason?: string
}

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/

export function checkSyntax(email: string): SyntaxResult {
  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, reason: "Email address has invalid format" }
  }
  return { valid: true }
}
