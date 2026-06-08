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

    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } })
    return NextResponse.json({ workspace })
  } catch {
    return NextResponse.json({ error: "Failed to fetch brand" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const workspaceId = (session.user as any).workspaceId as string
    const { brandName, brandColour, brandLogo, brandWebsite } = await request.json()

    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        brandName: brandName || null,
        brandColour: brandColour || "#E8561A",
        brandLogo: brandLogo || null,
        brandWebsite: brandWebsite || null,
      }
    })

    return NextResponse.json({ workspace })
  } catch {
    return NextResponse.json({ error: "Failed to update brand" }, { status: 500 })
  }
}
