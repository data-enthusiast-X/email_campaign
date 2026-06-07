import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function DELETE(request: Request) {
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

    const { ids } = await request.json()

    await prisma.contact.updateMany({
      where: { id: { in: ids }, workspaceId: user.workspaceId },
      data: { deletedAt: new Date(), deletedBy: user.email }
    })

    await prisma.activityLog.create({
      data: {
        workspaceId: user.workspaceId,
        userId: user.id,
        userEmail: user.email,
        action: "contacts_bulk_deleted",
        details: { count: ids.length, ids }
      }
    })

    return NextResponse.json({ message: `${ids.length} contacts moved to recycle bin` })
  } catch (error) {
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
  } catch (error) {
    return NextResponse.json({ error: "Bulk action failed" }, { status: 500 })
  }
}
