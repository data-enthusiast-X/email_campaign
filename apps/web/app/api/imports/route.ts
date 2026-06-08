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

    const imports = await prisma.importLog.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    return NextResponse.json({ imports })
  } catch {
    return NextResponse.json({ error: "Failed to fetch imports" }, { status: 500 })
  }
}
