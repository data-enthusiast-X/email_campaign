import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const workspaceId = (session.user as any).workspaceId as string
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get("filter") || "all"
    const segment = searchParams.get("segment") || "all"

    const where: any = { workspaceId, deletedAt: null }

    if (filter === "subscribed") where.subscriptionStatus = "subscribed"
    if (filter === "verified") where.verificationStatus = "verified"
    if (filter === "invalid") where.verificationStatus = "invalid"

    if (segment === "champions") where.engagementScore = { gte: 80 }
    if (segment === "active") where.engagementScore = { gte: 50, lt: 80 }
    if (segment === "at_risk") where.engagementScore = { gte: 20, lt: 50 }
    if (segment === "cold") where.engagementScore = { lt: 20 }

    const contacts = await prisma.contact.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100
    })

    return NextResponse.json({ contacts })
  } catch (error) {
    console.error("Contacts API error:", error)
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 })
  }
}
