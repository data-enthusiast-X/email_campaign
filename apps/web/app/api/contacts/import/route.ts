import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { contacts } = await request.json()

    let added = 0
    let skipped = 0

    for (const contact of contacts) {
      if (!contact.email || !contact.email.includes("@")) {
        skipped++
        continue
      }

      const existing = await prisma.contact.findFirst({
        where: {
          workspaceId: user.workspaceId,
          email: contact.email.toLowerCase().trim()
        }
      })

      if (existing) {
        skipped++
        continue
      }

      await prisma.contact.create({
        data: {
          workspaceId: user.workspaceId,
          email: contact.email.toLowerCase().trim(),
          firstName: contact.firstName || null,
          lastName: contact.lastName || null,
          company: contact.company || null,
          subscriptionStatus: "subscribed",
          verificationStatus: "unverified",
          engagementScore: 0,
          lifecycleStage: "lead",
          source: "csv_import"
        }
      })
      added++
    }

    return NextResponse.json({ added, skipped })
  } catch (error) {
    console.error("Import error:", error)
    return NextResponse.json({ error: "Import failed" }, { status: 500 })
  }
}
