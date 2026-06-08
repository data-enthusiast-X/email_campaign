import * as net from "net"

export interface CatchAllResolutionResult {
  resolved: boolean
  likelyValid: boolean | null
  confidence: number
  timingMs: number
  reason: string
}

const SMTP_TIMEOUT = 8000
const SMTP_PORT = 25
const TIMING_SAMPLES = 3
const VALID_THRESHOLD_MS = 800

function smtpRCPTTime(
  host: string,
  email: string,
  fromDomain: string
): Promise<number> {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket()
    let stage = 0
    const start = Date.now()

    const timer = setTimeout(() => {
      socket.destroy()
      reject(new Error("TIMEOUT"))
    }, SMTP_TIMEOUT)

    function send(cmd: string) {
      socket.write(cmd + "\r\n")
    }

    socket.on("data", (data) => {
      const line = data.toString().trim()

      if (stage === 0 && line.startsWith("220")) {
        stage = 1
        send(`EHLO verify.${fromDomain}`)
      } else if (stage === 1 && line.match(/^250/)) {
        stage = 2
        send(`MAIL FROM:<verify@${fromDomain}>`)
      } else if (stage === 2 && line.startsWith("250")) {
        stage = 3
        send(`RCPT TO:<${email}>`)
      } else if (stage === 3) {
        const elapsed = Date.now() - start
        clearTimeout(timer)
        send("QUIT")
        setTimeout(() => socket.destroy(), 300)
        resolve(elapsed)
      }
    })

    socket.on("error", (err) => {
      clearTimeout(timer)
      reject(err)
    })

    socket.setTimeout(SMTP_TIMEOUT)
    socket.connect(SMTP_PORT, host)
  })
}

function randomLocalPart(length = 16): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  return Array.from({ length }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("")
}

async function averageTiming(
  host: string,
  email: string,
  fromDomain: string,
  samples: number
): Promise<number> {
  const times: number[] = []
  for (let i = 0; i < samples; i++) {
    try {
      const t = await smtpRCPTTime(host, email, fromDomain)
      times.push(t)
      await new Promise(r => setTimeout(r, 200))
    } catch {
      // skip failed sample
    }
  }
  if (times.length === 0) return -1
  return Math.round(times.reduce((a, b) => a + b, 0) / times.length)
}

const resolutionCache = new Map<string, { result: CatchAllResolutionResult; cachedAt: number }>()
const CACHE_TTL = 6 * 60 * 60 * 1000

export async function resolveCatchAll(
  email: string,
  mxHost: string
): Promise<CatchAllResolutionResult> {
  const domain = email.split("@")[1] ?? ""
  const fromDomain = "xerebo.com"
  const cacheKey = email.toLowerCase()

  const cached = resolutionCache.get(cacheKey)
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
    return cached.result
  }

  try {
    const realTiming = await averageTiming(mxHost, email, fromDomain, TIMING_SAMPLES)

    if (realTiming < 0) {
      return { resolved: false, likelyValid: null, confidence: 0, timingMs: -1, reason: "timing_failed" }
    }

    const fakeEmail = `${randomLocalPart()}@${domain}`
    const fakeTiming = await averageTiming(mxHost, fakeEmail, fromDomain, TIMING_SAMPLES)

    if (fakeTiming < 0) {
      return { resolved: false, likelyValid: null, confidence: 0, timingMs: realTiming, reason: "baseline_failed" }
    }

    const diff = fakeTiming - realTiming
    const diffPercent = fakeTiming > 0 ? Math.round((diff / fakeTiming) * 100) : 0

    let likelyValid: boolean | null = null
    let confidence = 0
    let reason = "timing_inconclusive"

    if (diff > VALID_THRESHOLD_MS && diffPercent > 25) {
      likelyValid = true
      confidence = Math.min(70, 40 + diffPercent)
      reason = "timing_faster_than_baseline"
    } else if (diff < -200 && diffPercent < -15) {
      likelyValid = false
      confidence = Math.min(65, 35 + Math.abs(diffPercent))
      reason = "timing_slower_than_baseline"
    }

    const result: CatchAllResolutionResult = {
      resolved: likelyValid !== null,
      likelyValid,
      confidence,
      timingMs: realTiming,
      reason,
    }

    resolutionCache.set(cacheKey, { result, cachedAt: Date.now() })
    return result

  } catch {
    return { resolved: false, likelyValid: null, confidence: 0, timingMs: -1, reason: "resolution_error" }
  }
}
