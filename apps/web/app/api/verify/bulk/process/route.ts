import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getVerifyJob, updateVerifyJob } from "@/lib/redis"
import { verifyEmail } from "@repo/verification"

export async function POST(request: Request) {
  try {
    const { jobId, workspaceId } = await request.json()

    const job = await getVerifyJob(jobId)
    if (!job || job.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    await updateVerifyJob(jobId, { status: "running" })

    let completed = 0
    let verified = 0
    let invalid = 0
    let risky = 0
    let unknown = 0

    for (const contactId of job.contactIds) {
      try {
        const contact = await prisma.contact.findUnique({
          where: { id: contactId, workspaceId },
          select: { id: true, email: true },
        })

        if (!contact) { completed++; continue }

        const result = await verifyEmail(contact.email)

        await Promise.all([
          prisma.contact.update({
            where: { id: contactId },
            data: { verificationStatus: result.status, verificationCheckedAt: new Date() },
          }),
          prisma.verificationLog.create({
            data: {
              workspaceId,
              contactId,
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
          }),
        ])

        if (result.status === "valid") verified++
        else if (result.status === "invalid") invalid++
        else if (result.status === "risky") risky++
        else unknown++

        completed++

        // Flush progress to Redis every 5 contacts
        if (completed % 5 === 0) {
          await updateVerifyJob(jobId, { completed, verified, invalid, risky, unknown })
        }

        // 150ms throttle between checks
        await new Promise(r => setTimeout(r, 150))

      } catch (err) {
        console.error(`Failed to verify contact ${contactId}:`, err)
        completed++
        unknown++
      }
    }

    await updateVerifyJob(jobId, {
      status: "completed",
      completed,
      verified,
      invalid,
      risky,
      unknown,
      completedAt: Date.now(),
    })

    return NextResponse.json({ success: true, completed, verified, invalid, risky, unknown })
  } catch (error) {
    console.error("Process job error:", error)
    return NextResponse.json({ error: "Processing failed" }, { status: 500 })
  }
}
