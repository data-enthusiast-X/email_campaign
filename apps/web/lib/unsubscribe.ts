import jwt from "jsonwebtoken"

export function generateUnsubscribeToken(contactId: string, workspaceId: string): string {
  return jwt.sign(
    { contactId, workspaceId },
    process.env.NEXTAUTH_SECRET!,
    { expiresIn: "365d" }
  )
}

export function generateUnsubscribeUrl(contactId: string, workspaceId: string): string {
  const token = generateUnsubscribeToken(contactId, workspaceId)
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  return `${baseUrl}/unsubscribe?token=${token}`
}
