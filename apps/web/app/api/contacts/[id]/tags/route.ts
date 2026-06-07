import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tags = await prisma.contactTag.findMany({
      where: { contactId: id },
      include: { tag: true },
    })
    return NextResponse.json({ tags })
  } catch {
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { tagId } = await request.json()

    await prisma.contactTag.create({ data: { contactId: id, tagId } })

    const [tag, contact] = await Promise.all([
      prisma.tag.findUnique({ where: { id: tagId } }),
      prisma.contact.findUnique({ where: { id }, select: { workspaceId: true } }),
    ])

    if (contact?.workspaceId) {
      await prisma.activityLog.create({
        data: {
          workspaceId: contact.workspaceId,
          contactId: id,
          userEmail: session.user.email,
          action: "tag_added",
          details: { tagName: tag?.name || tagId },
        },
      })
    }

    return NextResponse.json({ message: "Tag added" })
  } catch {
    return NextResponse.json({ error: "Failed to add tag" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { tagId } = await request.json()

    const [tag, contact] = await Promise.all([
      prisma.tag.findUnique({ where: { id: tagId } }),
      prisma.contact.findUnique({ where: { id }, select: { workspaceId: true } }),
    ])

    await prisma.contactTag.delete({
      where: { contactId_tagId: { contactId: id, tagId } },
    })

    if (contact?.workspaceId) {
      await prisma.activityLog.create({
        data: {
          workspaceId: contact.workspaceId,
          contactId: id,
          userEmail: session.user.email,
          action: "tag_removed",
          details: { tagName: tag?.name || tagId },
        },
      })
    }

    return NextResponse.json({ message: "Tag removed" })
  } catch {
    return NextResponse.json({ error: "Failed to remove tag" }, { status: 500 })
  }
}
