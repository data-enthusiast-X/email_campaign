export interface WebmailResult {
  isWebmail: boolean
}

const WEBMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com",
  "yahoo.com", "yahoo.co.uk", "yahoo.co.in",
  "hotmail.com", "hotmail.co.uk",
  "outlook.com", "live.com", "msn.com",
  "icloud.com", "me.com", "mac.com",
  "aol.com", "protonmail.com", "pm.me",
  "tutanota.com", "tutamail.com",
  "zoho.com", "yandex.com", "yandex.ru",
  "mail.com", "gmx.com", "gmx.net",
  "fastmail.com", "hey.com", "rediffmail.com",
])

export function checkWebmail(email: string): WebmailResult {
  const domain = email.split("@")[1]?.toLowerCase() ?? ""
  return { isWebmail: WEBMAIL_DOMAINS.has(domain) }
}
