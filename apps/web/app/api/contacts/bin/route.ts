import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const contacts = await prisma.contact.findMany({
      where: { workspaceId: user.workspaceId, deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" }
    })

    return NextResponse.json({ contacts })
  } catch {
    return NextResponse.json({ error: "Failed to fetch bin" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const { action, ids } = await request.json()

    if (action === "restore") {
      await prisma.contact.updateMany({
        where: { id: { in: ids }, workspaceId: user.workspaceId },
        data: { deletedAt: null, deletedBy: null }
      })

      await prisma.activityLog.createMany({
        data: ids.map((id: string) => ({
          workspaceId: user.workspaceId,
          contactId: id,
          userId: user.id,
          userEmail: user.email,
          action: "contact_restored",
          details: {}
        }))
      })

      return NextResponse.json({ message: `${ids.length} contacts restored` })
    }

    if (action === "permanent_delete") {
      await prisma.contact.deleteMany({
        where: { id: { in: ids }, workspaceId: user.workspaceId, deletedAt: { not: null } }
      })
      return NextResponse.json({ message: `${ids.length} contacts permanently deleted` })
    }

    if (action === "empty_bin") {
      await prisma.contact.deleteMany({
        where: { workspaceId: user.workspaceId, deletedAt: { not: null } }
      })
      return NextResponse.json({ message: "Recycle bin emptied" })
    }

    if (action === "auto_cleanup") {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      await prisma.contact.deleteMany({
        where: { workspaceId: user.workspaceId, deletedAt: { lt: sevenDaysAgo } }
      })
      return NextResponse.json({ message: "Auto cleanup done" })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch {
    return NextResponse.json({ error: "Action failed" }, { status: 500 })
  }
}
