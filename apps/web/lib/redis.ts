import { Redis } from "@upstash/redis"

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export interface VerifyJob {
  jobId: string
  workspaceId: string
  contactIds: string[]
  total: number
  completed: number
  verified: number
  invalid: number
  risky: number
  unknown: number
  status: "pending" | "running" | "completed" | "failed"
  createdAt: number
  completedAt?: number
}

export async function createVerifyJob(
  workspaceId: string,
  contactIds: string[]
): Promise<string> {
  const jobId = `verify_${Date.now()}_${Math.random().toString(36).slice(2)}`
  const job: VerifyJob = {
    jobId,
    workspaceId,
    contactIds,
    total: contactIds.length,
    completed: 0,
    verified: 0,
    invalid: 0,
    risky: 0,
    unknown: 0,
    status: "pending",
    createdAt: Date.now(),
  }
  await redis.set(`job:${jobId}`, JSON.stringify(job), { ex: 86400 })
  return jobId
}

export async function getVerifyJob(jobId: string): Promise<VerifyJob | null> {
  const raw = await redis.get(`job:${jobId}`)
  if (!raw) return null
  return typeof raw === "string" ? JSON.parse(raw) : (raw as VerifyJob)
}

export async function updateVerifyJob(
  jobId: string,
  updates: Partial<VerifyJob>
): Promise<void> {
  const job = await getVerifyJob(jobId)
  if (!job) return
  const updated = { ...job, ...updates }
  await redis.set(`job:${jobId}`, JSON.stringify(updated), { ex: 86400 })
}
