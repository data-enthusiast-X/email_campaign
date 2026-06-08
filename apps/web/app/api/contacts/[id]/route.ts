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

    const workspaceId = (session.user as any).workspaceId as string
    const { id } = await params

    const contact = await prisma.contact.findFirst({
      where: { id, workspaceId, deletedAt: null }
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

    const workspaceId = (session.user as any).workspaceId as string
    const userId = session.user.id as string
    const userEmail = session.user.email

    const { id } = await params
    const body = await request.json()

    const contact = await prisma.contact.update({
      where: { id, workspaceId },
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
        workspaceId,
        contactId: id,
        userId,
        userEmail,
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

    const workspaceId = (session.user as any).workspaceId as string
    const userId = session.user.id as string
    const userEmail = session.user.email

    const { id } = await params

    await prisma.contact.update({
      where: { id, workspaceId },
      data: { deletedAt: new Date(), deletedBy: userEmail }
    })

    await prisma.activityLog.create({
      data: {
        workspaceId,
        contactId: id,
        userId,
        userEmail,
        action: "contact_deleted",
        details: { method: "individual" }
      }
    })

    return NextResponse.json({ message: "Contact moved to recycle bin" })
  } catch {
    return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 })
  }
}
