import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get("contactId")

    const where: any = { workspaceId: user.workspaceId }
    if (contactId) where.contactId = contactId

    const logs = await prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json({ logs })
  } catch {
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 })
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

    const { contactId, action, details } = await request.json()

    const log = await prisma.activityLog.create({
      data: {
        workspaceId: user.workspaceId,
        contactId: contactId || null,
        userId: user.id,
        userEmail: user.email,
        action,
        details: details || {},
      },
    })

    return NextResponse.json({ log })
  } catch {
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 })
  }
}
