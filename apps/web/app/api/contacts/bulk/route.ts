import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function DELETE(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const workspaceId = (session.user as any).workspaceId as string
    const userId = session.user.id as string
    const userEmail = session.user.email

    const { ids } = await request.json()

    await prisma.contact.updateMany({
      where: { id: { in: ids }, workspaceId },
      data: { deletedAt: new Date(), deletedBy: userEmail }
    })

    await prisma.activityLog.create({
      data: {
        workspaceId,
        userId,
        userEmail,
        action: "contacts_bulk_deleted",
        details: { count: ids.length, ids }
      }
    })

    return NextResponse.json({ message: `${ids.length} contacts moved to recycle bin` })
  } catch {
    return NextResponse.json({ error: "Bulk delete failed" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { ids, action } = await request.json()

    if (action === "verify") {
      return NextResponse.json({
        message: `${ids.length} contacts queued for verification`,
        note: "Verification engine connects in Week 3"
      })
    }

    return NextResponse.json({ message: "Action completed" })
  } catch {
    return NextResponse.json({ error: "Bulk action failed" }, { status: 500 })
  }
}
