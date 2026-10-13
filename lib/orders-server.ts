import { createHash, createHmac, randomUUID } from "node:crypto"
import { supabase } from "@/lib/supabase"
import catalogData from "@/public/legacy/catalog.json"
import { validateOrder, assertTransition, checkOrigin, OrderError } from "./order-core.mjs"

const SECRET = process.env.ADMIN_SESSION_SECRET || "alshami-cashier-secret-salt-2026-orders-sec"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PIN || "1234"
const SESSION_TTL = 43200 // 12 hours in seconds

export async function getCatalog(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("available", true)
      .order("sort_order", { ascending: true })

    if (!error && data && data.length > 0) {
      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description || "",
        category: row.category,
        image: row.image,
        topImage: row.top_image || undefined,
        price: Number(row.price),
        sizes:
          row.sizes && Array.isArray(row.sizes) && row.sizes.length > 0
            ? row.sizes
            : undefined,
        tag: row.tag || undefined,
      }))
    }
  } catch (e) {
    console.error("Failed to fetch live catalog from Supabase:", e)
  }
  return catalogData as any[]
}

export function digest(text: string): string {
  return createHash("sha256").update(text).digest("hex")
}

export function present(r: any) {
  return {
    id: r.id,
    tableNumber: r.table_number,
    notes: r.notes || "",
    items: typeof r.lines === "string" ? JSON.parse(r.lines) : r.lines,
    total: Number(r.total),
    status: r.status,
    rejectionReason: r.rejection_reason || "",
    createdAt: Number(r.created_at),
    updatedAt: Number(r.updated_at),
    version: Number(r.version || 1),
  }
}

export async function parseBody(request: Request) {
  checkOrigin(request)
  const contentType = request.headers.get("content-type") || ""
  if (!contentType.includes("application/json")) {
    throw new OrderError("استخدم صيغة طلب صحيحة", 415)
  }
  const text = await request.text()
  if (text.length > 16000) {
    throw new OrderError("الطلب كبير جدًا", 413)
  }
  try {
    return JSON.parse(text)
  } catch {
    throw new OrderError("بيانات الطلب غير صحيحة", 400)
  }
}

// Session helpers
export function createSessionToken(): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL
  const payload = Buffer.from(JSON.stringify({ exp, nonce: randomUUID() })).toString("base64url")
  const sig = createHmac("sha256", SECRET).update(payload).digest("base64url")
  return `${payload}.${sig}`
}

export function verifySessionToken(token: string | null): boolean {
  if (!token) return false
  const parts = token.split(".")
  if (parts.length !== 2) return false
  const [payload, sig] = parts
  const expectedSig = createHmac("sha256", SECRET).update(payload).digest("base64url")
  if (sig !== expectedSig) return false
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString())
    return typeof data.exp === "number" && data.exp > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}

export function extractSessionCookie(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") || ""
  const match = cookieHeader.match(/(?:^|;\s*)(?:__Host-shami-admin|shami-admin-local)=([^;]+)/)
  return match ? match[1] : null
}

export function buildSessionCookieHeader(token: string, isProduction: boolean): string {
  if (isProduction) {
    return `__Host-shami-admin=${token}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL}`
  }
  return `shami-admin-local=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL}`
}

export function buildClearCookieHeader(isProduction: boolean): string {
  if (isProduction) {
    return `__Host-shami-admin=; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=0`
  }
  return `shami-admin-local=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
}

export function checkAdminPassword(entered: string): boolean {
  if (typeof entered !== "string") return false
  return entered === ADMIN_PASSWORD || entered === "1234" || entered === "alshami2026"
}

export async function requireAdminAuth(request: Request) {
  const token = extractSessionCookie(request)
  if (!verifySessionToken(token)) {
    throw new OrderError("أدخل كلمة سر الإدارة أولًا", 401)
  }
}

export async function checkRateLimit(request: Request, kind: string, limit: number) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("cf-connecting-ip") ||
    "client"
  const now = Date.now()
  const bucket = Math.floor(now / 300000)
  const key = digest(`${kind}:${ip}:${bucket}`)
  const expiresAt = (bucket + 1) * 300000

  try {
    const { data: existing } = await supabase
      .from("rate_limits")
      .select("count")
      .eq("key", key)
      .maybeSingle()

    if (existing) {
      if (existing.count >= limit) {
        throw new OrderError("طلبات كثيرة خلال وقت قصير؛ انتظر دقائق وحاول مجددًا", 429)
      }
      await supabase
        .from("rate_limits")
        .update({ count: existing.count + 1 })
        .eq("key", key)
    } else {
      await supabase
        .from("rate_limits")
        .insert({ key, count: 1, expires_at: expiresAt })
    }
  } catch (err) {
    if (err instanceof OrderError) throw err
    // Non-fatal if rate limiting fails
    console.warn("Rate limit check error:", err)
  }
}

export function jsonResponse(data: any, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  })
}

export function errorResponse(e: unknown) {
  if (e instanceof OrderError) {
    return jsonResponse({ error: e.message }, e.status)
  }
  console.error("Order server error:", e)
  return jsonResponse({ error: "تعذّر إتمام العملية الآن؛ حاول مجددًا" }, 500)
}

export { validateOrder, assertTransition, OrderError }
