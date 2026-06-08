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

    const tags = await prisma.tag.findMany({
      where: { workspaceId },
      include: { _count: { select: { contacts: true } } },
      orderBy: { name: "asc" },
    })
    return NextResponse.json({ tags })
  } catch {
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const workspaceId = (session.user as any).workspaceId as string

    const { name, colour } = await request.json()
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 })

    const tag = await prisma.tag.create({
      data: {
        workspaceId,
        name: name.trim(),
        colour: colour || "#E8561A",
      },
    })
    return NextResponse.json({ tag })
  } catch {
    return NextResponse.json({ error: "Failed to create tag" }, { status: 500 })
  }
}
