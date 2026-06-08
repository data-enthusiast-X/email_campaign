import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { verifyEmail } from "@repo/verification"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const workspaceId = (session.user as any).workspaceId as string
    const userId = session.user.id as string
    const userEmail = session.user.email

    const { email, contactId } = await request.json()
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const result = await verifyEmail(email.trim())

    await prisma.verificationLog.create({
      data: {
        workspaceId,
        contactId: contactId || null,
        email: result.email,
        status: result.status,
        score: result.score,
        syntaxPass:    result.checks.syntax,
        gibberishPass: !result.checks.gibberish,
        isDisposable:  result.checks.disposable,
        isWebmail:     result.checks.webmail,
        hasMX:         result.checks.hasMX,
        serverType:    result.checks.serverType || null,
        smtpConnects:  result.checks.smtpConnects,
        smtpAccepts:   result.checks.smtpAccepts ?? false,
        isCatchAll:    result.checks.catchAll,
        responseTime:  result.duration,
        reason:        result.reason,
        detail:        result.detail,
      },
    })

    if (contactId) {
      await prisma.contact.update({
        where: { id: contactId, workspaceId },
        data: { verificationStatus: result.status, verificationCheckedAt: new Date() },
      })

      await prisma.activityLog.create({
        data: {
          workspaceId, contactId, userId, userEmail,
          action: "email_verified",
          details: { status: result.status, score: result.score, reason: result.reason, serverType: result.checks.serverType, duration: result.duration },
        },
      })
    }

    return NextResponse.json({ result })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
