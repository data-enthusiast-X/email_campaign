import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")
    if (!token) return NextResponse.json({ name: "Xerebo", colour: "#E8561A", logo: null })

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as {
      workspaceId: string
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: decoded.workspaceId },
      select: {
        name: true,
        brandName: true,
        brandColour: true,
        brandLogo: true,
        brandWebsite: true
      }
    })

    return NextResponse.json({
      name: workspace?.brandName || workspace?.name || "Xerebo",
      colour: workspace?.brandColour || "#E8561A",
      logo: workspace?.brandLogo || null,
      website: workspace?.brandWebsite || null
    })
  } catch {
    return NextResponse.json({ name: "Xerebo", colour: "#E8561A", logo: null })
  }
}
