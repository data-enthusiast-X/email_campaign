import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { createVerifyJob } from "@/lib/redis"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const workspaceId = (session.user as any).workspaceId as string
    const { contactIds } = await request.json()

    if (!contactIds || contactIds.length === 0) {
      return NextResponse.json({ error: "No contacts provided" }, { status: 400 })
    }

    // Validate contacts belong to this workspace
    const contacts = await prisma.contact.findMany({
      where: { id: { in: contactIds }, workspaceId, deletedAt: null },
      select: { id: true },
    })

    if (contacts.length === 0) {
      return NextResponse.json({ error: "No valid contacts found" }, { status: 400 })
    }

    const validIds = contacts.map(c => c.id)
    const jobId = await createVerifyJob(workspaceId, validIds)

    // Fire-and-forget: trigger background processor
    const origin = new URL(request.url).origin
    fetch(`${origin}/api/verify/bulk/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, workspaceId }),
    }).catch(() => {})

    return NextResponse.json({ jobId, total: validIds.length })
  } catch (error) {
    console.error("Bulk verify error:", error)
    return NextResponse.json({ error: "Failed to start verification" }, { status: 500 })
  }
}
