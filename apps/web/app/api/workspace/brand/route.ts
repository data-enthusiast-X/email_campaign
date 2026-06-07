import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { workspace: true }
    })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    return NextResponse.json({ workspace: user.workspace })
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
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const { brandName, brandColour, brandLogo, brandWebsite } = await request.json()

    const workspace = await prisma.workspace.update({
      where: { id: user.workspaceId },
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
