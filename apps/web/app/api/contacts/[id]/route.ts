import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const { id } = await params

    const contact = await prisma.contact.findFirst({
      where: { id, workspaceId: user.workspaceId, deletedAt: null }
    })

    if (!contact) return NextResponse.json({ error: "Contact not found" }, { status: 404 })

    return NextResponse.json({ contact })
  } catch {
    return NextResponse.json({ error: "Failed to fetch contact" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const { id } = await params
    const body = await request.json()

    const contact = await prisma.contact.update({
      where: { id, workspaceId: user.workspaceId },
      data: {
        firstName: body.firstName || null,
        lastName:  body.lastName  || null,
        phone:     body.phone     || null,
        company:   body.company   || null,
        jobTitle:  body.jobTitle  || null,
        ...(body.subscriptionStatus ? { subscriptionStatus: body.subscriptionStatus, subscriptionUpdatedAt: new Date() } : {}),
      }
    })

    await prisma.activityLog.create({
      data: {
        workspaceId: user.workspaceId,
        contactId: id,
        userId: user.id,
        userEmail: user.email,
        action: "contact_edited",
        details: { changes: body },
      },
    })

    return NextResponse.json({ contact })
  } catch {
    return NextResponse.json({ error: "Failed to update contact" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const { id } = await params

    await prisma.contact.update({
      where: { id, workspaceId: user.workspaceId },
      data: { deletedAt: new Date(), deletedBy: user.email }
    })

    await prisma.activityLog.create({
      data: {
        workspaceId: user.workspaceId,
        contactId: id,
        userId: user.id,
        userEmail: user.email,
        action: "contact_deleted",
        details: { method: "individual" }
      }
    })

    return NextResponse.json({ message: "Contact moved to recycle bin" })
  } catch {
    return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 })
  }
}
