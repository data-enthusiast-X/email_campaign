import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const { contacts, fileName } = await request.json()

    if (!contacts || contacts.length === 0) {
      return NextResponse.json({ added: 0, skipped: 0 })
    }

    const existingContacts = await prisma.contact.findMany({
      where: { workspaceId: user.workspaceId },
      select: { email: true },
    })
    const existingEmails = new Set(existingContacts.map(c => c.email.toLowerCase()))

    const toInsert = contacts
      .filter((c: any) => {
        const email = (c.email || "").toLowerCase().trim()
        return email && email.includes("@") && !existingEmails.has(email)
      })
      .map((c: any) => ({
        workspaceId: user.workspaceId,
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

    const skipped = contacts.length - toInsert.length

    if (toInsert.length > 0) {
      await prisma.contact.createMany({ data: toInsert, skipDuplicates: true })
    }

    const safeFileName = fileName || "Unknown file"

    await prisma.importLog.create({
      data: {
        workspaceId: user.workspaceId,
        userId: user.id,
        userEmail: user.email,
        fileName: safeFileName,
        added: toInsert.length,
        skipped,
        totalRows: contacts.length,
      },
    })

    await prisma.activityLog.create({
      data: {
        workspaceId: user.workspaceId,
        userId: user.id,
        userEmail: user.email,
        action: "contacts_imported",
        details: {
          fileName: safeFileName,
          added: toInsert.length,
          skipped,
          totalRows: contacts.length,
        },
      },
    })

    return NextResponse.json({ added: toInsert.length, skipped })
  } catch (error) {
    console.error("Import error:", error)
    return NextResponse.json({ error: "Import failed" }, { status: 500 })
  }
}
