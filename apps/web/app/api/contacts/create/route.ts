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

    const { email, firstName, lastName, phone, company, jobTitle } = await request.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    const existing = await prisma.contact.findFirst({
      where: { workspaceId, email: email.toLowerCase().trim() }
    })

    if (existing) {
      return NextResponse.json(
        { error: "This email already exists in your contacts" },
        { status: 400 }
      )
    }

    const contact = await prisma.contact.create({
      data: {
        workspaceId,
        email: email.toLowerCase().trim(),
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
        company: company || null,
        jobTitle: jobTitle || null,
        subscriptionStatus: "subscribed",
        verificationStatus: "unverified",
        engagementScore: 0,
        lifecycleStage: "lead",
        source: "manual"
      }
    })

    await prisma.activityLog.create({
      data: {
        workspaceId,
        contactId: contact.id,
        userId,
        userEmail,
        action: "contact_created",
        details: { source: "manual" },
      },
    })

    return NextResponse.json({ contact, message: "Contact added successfully" })
  } catch (error) {
    console.error("Create contact error:", error)
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 })
  }
}
