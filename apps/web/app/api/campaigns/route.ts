import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const workspaceId = (session.user as any).workspaceId as string

    const campaigns = await prisma.campaign.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error("Campaigns GET error:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const workspaceId = (session.user as any).workspaceId as string

    const body = await request.json()
    const campaign = await prisma.campaign.create({
      data: {
        workspaceId,
        name: body.name || "Untitled Campaign",
        subject: body.subject || "",
        fromName: body.fromName || "",
        fromEmail: body.fromEmail || "",
        htmlContent: body.htmlContent || "",
        status: "draft",
      },
    })

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error("Campaigns POST error:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
