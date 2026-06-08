export interface GibberishResult {
  isGibberish: boolean
}

export function checkGibberish(email: string): GibberishResult {
  const localPart = email.split("@")[0] ?? ""
  if (localPart.length < 8) return { isGibberish: false }
  return { isGibberish: /[bcdfghjklmnpqrstvwxyz]{6,}/i.test(localPart) }
}
