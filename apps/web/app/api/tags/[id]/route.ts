import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    await prisma.tag.delete({ where: { id, workspaceId: user.workspaceId } })
    return NextResponse.json({ message: "Tag deleted" })
  } catch {
    return NextResponse.json({ error: "Failed to delete tag" }, { status: 500 })
  }
}
