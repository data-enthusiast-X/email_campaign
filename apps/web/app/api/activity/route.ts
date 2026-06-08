import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const workspaceId = (session.user as any).workspaceId as string
    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get("contactId")

    const where: any = { workspaceId }
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

    const workspaceId = (session.user as any).workspaceId as string
    const userId = session.user.id as string
    const userEmail = session.user.email

    const { contactId, action, details } = await request.json()

    const log = await prisma.activityLog.create({
      data: {
        workspaceId,
        contactId: contactId || null,
        userId,
        userEmail,
        action,
        details: details || {},
      },
    })

    return NextResponse.json({ log })
  } catch {
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 })
  }
}
