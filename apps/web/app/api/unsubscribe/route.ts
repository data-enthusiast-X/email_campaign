import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 })
    }

    const decoded = jwt.verify(token, process.env.UNSUBSCRIBE_SECRET!) as {
      contactId: string
      workspaceId: string
    }

    const contact = await prisma.contact.findFirst({
      where: {
        id: decoded.contactId,
        workspaceId: decoded.workspaceId
      }
    })

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }

    return NextResponse.json({
      contact: {
        email: contact.email,
        firstName: contact.firstName,
        subscriptionStatus: contact.subscriptionStatus
      }
    })
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 })
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 })
    }

    const decoded = jwt.verify(token, process.env.UNSUBSCRIBE_SECRET!) as {
      contactId: string
      workspaceId: string
    }

    const { reason } = await request.json().catch(() => ({ reason: null }))

    await prisma.contact.update({
      where: {
        id: decoded.contactId,
        workspaceId: decoded.workspaceId
      },
      data: {
        subscriptionStatus: "unsubscribed",
        subscriptionUpdatedAt: new Date(),
        unsubscribeReason: reason || null
      }
    })

    await prisma.activityLog.create({
      data: {
        workspaceId: decoded.workspaceId,
        contactId: decoded.contactId,
        action: "contact_unsubscribed",
        details: { reason: reason || "No reason given" }
      }
    })

    return NextResponse.json({ message: "Unsubscribed successfully" })
  } catch {
    return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 400 })
  }
}
