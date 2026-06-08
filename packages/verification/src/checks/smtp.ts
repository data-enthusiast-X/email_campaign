import * as net from "net"

export interface SMTPResult {
  smtpConnects: boolean
  smtpAccepts: boolean | null
  isCatchAll: boolean
  responseTime: number
  smtpBanner: string
  serverResponse: string
  reason: string
}

const SMTP_TIMEOUT = 8000
const SMTP_PORT = 25

function smtpConversation(
  host: string,
  email: string,
  fromDomain: string,
  timeout: number
): Promise<{ accepted: boolean; banner: string; response: string }> {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket()
    let banner = ""
    let lastResponse = ""
    let stage = 0

    const timer = setTimeout(() => {
      socket.destroy()
      reject(new Error("SMTP_TIMEOUT"))
    }, timeout)

    function send(cmd: string) {
      socket.write(cmd + "\r\n")
    }

    function done(accepted: boolean) {
      clearTimeout(timer)
      send("QUIT")
      setTimeout(() => socket.destroy(), 500)
      resolve({ accepted, banner, response: lastResponse })
    }

    socket.on("data", (data) => {
      const line = data.toString().trim()
      lastResponse = line

      if (stage === 0) {
        banner = line
        if (line.startsWith("220")) {
          stage = 1
          send(`EHLO verify.${fromDomain}`)
        } else {
          reject(new Error("SMTP_NO_BANNER"))
        }
      } else if (stage === 1) {
        if (line.match(/^250/)) {
          stage = 2
          send(`MAIL FROM:<verify@${fromDomain}>`)
        } else {
          reject(new Error("SMTP_EHLO_FAILED"))
        }
      } else if (stage === 2) {
        if (line.startsWith("250")) {
          stage = 3
          send(`RCPT TO:<${email}>`)
        } else {
          reject(new Error("SMTP_MAILFROM_REJECTED"))
        }
      } else if (stage === 3) {
        if (line.startsWith("250") || line.startsWith("251")) {
          done(true)
        } else {
          done(false)
        }
      }
    })

    socket.on("error", (err) => {
      clearTimeout(timer)
      reject(err)
    })

    socket.on("timeout", () => {
      clearTimeout(timer)
      socket.destroy()
      reject(new Error("SMTP_TIMEOUT"))
    })

    socket.setTimeout(timeout)
    socket.connect(SMTP_PORT, host)
  })
}

function randomLocalPart(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  return Array.from({ length: 16 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("")
}

const catchAllCache = new Map<string, { isCatchAll: boolean; checkedAt: number }>()
const CATCH_ALL_TTL = 12 * 60 * 60 * 1000

export async function checkSMTP(
  email: string,
  mxHost: string
): Promise<SMTPResult> {
  const startTime = Date.now()
  const domain = email.split("@")[1] ?? ""
  const fromDomain = "xerebo.com"

  let smtpConnects = false
  let smtpAccepts: boolean | null = null
  let banner = ""
  let serverResponse = ""

  try {
    const result = await smtpConversation(mxHost, email, fromDomain, SMTP_TIMEOUT)
    smtpConnects = true
    smtpAccepts = result.accepted
    banner = result.banner
    serverResponse = result.response
  } catch (err: any) {
    const msg = (err?.message as string) || ""
    if (
      msg === "SMTP_TIMEOUT" ||
      msg.includes("ECONNREFUSED") ||
      msg.includes("ENOTFOUND") ||
      msg.includes("ETIMEDOUT")
    ) {
      return {
        smtpConnects: false,
        smtpAccepts: null,
        isCatchAll: false,
        responseTime: Date.now() - startTime,
        smtpBanner: "",
        serverResponse: "",
        reason: msg === "SMTP_TIMEOUT" ? "smtp_timeout" : "smtp_unreachable",
      }
    }
    smtpConnects = true
    smtpAccepts = null
  }

  let isCatchAll = false
  if (smtpAccepts === true) {
    const cached = catchAllCache.get(domain)
    if (cached && Date.now() - cached.checkedAt < CATCH_ALL_TTL) {
      isCatchAll = cached.isCatchAll
    } else {
      try {
        const fakeEmail = `${randomLocalPart()}@${domain}`
        const catchAllResult = await smtpConversation(mxHost, fakeEmail, fromDomain, SMTP_TIMEOUT)
        isCatchAll = catchAllResult.accepted
        catchAllCache.set(domain, { isCatchAll, checkedAt: Date.now() })
      } catch {
        isCatchAll = false
      }
    }
  }

  return {
    smtpConnects,
    smtpAccepts,
    isCatchAll,
    responseTime: Date.now() - startTime,
    smtpBanner: banner,
    serverResponse,
    reason:
      smtpAccepts === true && !isCatchAll
        ? "smtp_accepted"
        : smtpAccepts === true && isCatchAll
        ? "catch_all_server"
        : smtpAccepts === false
        ? "smtp_rejected"
        : "smtp_unknown",
  }
}
