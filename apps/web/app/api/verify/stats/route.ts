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

    const [total, verified, invalid, risky, unknown, unverified, recentLogs, avgScore] = await Promise.all([
      prisma.contact.count({ where: { workspaceId, deletedAt: null } }),
      prisma.contact.count({ where: { workspaceId, deletedAt: null, verificationStatus: "valid" } }),
      prisma.contact.count({ where: { workspaceId, deletedAt: null, verificationStatus: "invalid" } }),
      prisma.contact.count({ where: { workspaceId, deletedAt: null, verificationStatus: "risky" } }),
      prisma.contact.count({ where: { workspaceId, deletedAt: null, verificationStatus: "unknown" } }),
      prisma.contact.count({ where: { workspaceId, deletedAt: null, verificationStatus: "unverified" } }),
      prisma.verificationLog.findMany({
        where: { workspaceId },
        orderBy: { checkedAt: "desc" },
        take: 10,
      }),
      prisma.verificationLog.aggregate({
        where: { workspaceId },
        _avg: { score: true },
      }),
    ])

    return NextResponse.json({
      contacts: { total, verified, invalid, risky, unknown, unverified },
      verificationRate: total > 0 ? Math.round(((verified + invalid + risky + unknown) / total) * 100) : 0,
      avgScore: Math.round(avgScore._avg.score ?? 0),
      recentLogs,
    })
  } catch (error) {
    console.error("Verification stats error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
