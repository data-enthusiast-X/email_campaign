import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const workspace = await prisma.workspace.create({
      data: {
        name: `${name}'s Workspace`,
        plan: "free",
      },
    })

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        workspaceId: workspace.id,
        role: "admin",
      },
    })

    return NextResponse.json({
      message: "Account created successfully",
      userId: user.id,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
