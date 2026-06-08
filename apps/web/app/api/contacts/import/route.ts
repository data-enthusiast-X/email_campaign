import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const workspaceId = (session.user as any).workspaceId as string
    const userId = session.user.id as string
    const userEmail = session.user.email

    const { contacts, fileName } = await request.json()

    if (!contacts || contacts.length === 0) {
      return NextResponse.json({ added: 0, skipped: 0 })
    }

    const toInsert = contacts
      .filter((c: any) => {
        const email = (c.email || "").toLowerCase().trim()
        return email && email.includes("@")
      })
      .map((c: any) => ({
        workspaceId,
        email: c.email.toLowerCase().trim(),
        firstName: c.firstName || null,
        lastName: c.lastName || null,
        company: c.company || null,
        phone: c.phone || null,
        jobTitle: c.jobTitle || null,
        subscriptionStatus: "subscribed",
        verificationStatus: "unverified",
        engagementScore: 0,
        lifecycleStage: "lead",
        source: "csv_import",
      }))

    let added = 0
    if (toInsert.length > 0) {
      const result = await prisma.contact.createMany({ data: toInsert, skipDuplicates: true })
      added = result.count
    }

    const skipped = contacts.length - added
    const safeFileName = fileName || "Unknown file"

    await prisma.importLog.create({
      data: {
        workspaceId,
        userId,
        userEmail,
        fileName: safeFileName,
        added,
        skipped,
        totalRows: contacts.length,
      },
    })

    await prisma.activityLog.create({
      data: {
        workspaceId,
        userId,
        userEmail,
        action: "contacts_imported",
        details: { fileName: safeFileName, added, skipped, totalRows: contacts.length },
      },
    })

    return NextResponse.json({ added, skipped })
  } catch (error) {
    console.error("Import error:", error)
    return NextResponse.json({ error: "Import failed" }, { status: 500 })
  }
}
