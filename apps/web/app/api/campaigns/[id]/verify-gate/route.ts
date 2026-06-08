import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const workspaceId = (session.user as any).workspaceId as string
    await params // resolve the promise (Next.js 16 dynamic params)

    const where = (verificationStatus?: string) => ({
      workspaceId,
      deletedAt: null,
      subscriptionStatus: "subscribed",
      ...(verificationStatus ? { verificationStatus } : {}),
    })

    const [total, verified, invalid, risky, unknown, unverified] = await Promise.all([
      prisma.contact.count({ where: where() }),
      prisma.contact.count({ where: where("valid") }),
      prisma.contact.count({ where: where("invalid") }),
      prisma.contact.count({ where: where("risky") }),
      prisma.contact.count({ where: where("unknown") }),
      prisma.contact.count({ where: where("unverified") }),
    ])

    const badCount = invalid + risky
    const estimatedBounceRateAll =
      total > 0 ? Math.round((badCount / total) * 100 * 10) / 10 : 0
    const estimatedBounceRateClean =
      total > 0 ? Math.round(((unknown * 0.15) / total) * 100 * 10) / 10 : 0

    return NextResponse.json({
      total,
      verified,
      invalid,
      risky,
      unknown,
      unverified,
      estimatedBounceRateAll,
      estimatedBounceRateClean,
      safeToSend: verified,
      recommendation: badCount > 0 ? "remove_invalid_risky" : "send_ready",
    })
  } catch (error) {
    console.error("Verify gate error:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
