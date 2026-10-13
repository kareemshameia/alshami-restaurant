import {
  parseBody,
  checkAdminPassword,
  createSessionToken,
  buildSessionCookieHeader,
  buildClearCookieHeader,
  checkRateLimit,
  jsonResponse,
  errorResponse,
  OrderError,
} from "@/lib/orders-server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const input = await parseBody(request)
    await checkRateLimit(request, "admin_login", 8)

    if (!checkAdminPassword(input.password)) {
      throw new OrderError("كلمة السر غير صحيحة", 401)
    }

    const token = createSessionToken()
    const isProduction = process.env.NODE_ENV === "production" && !request.url.includes("localhost")
    const cookieHeader = buildSessionCookieHeader(token, isProduction)

    return jsonResponse({ ok: true }, 200, { "Set-Cookie": cookieHeader })
  } catch (e) {
    return errorResponse(e)
  }
}

export async function DELETE(request: Request) {
  try {
    const isProduction = process.env.NODE_ENV === "production" && !request.url.includes("localhost")
    const cookieHeader = buildClearCookieHeader(isProduction)
    return jsonResponse({ ok: true }, 200, { "Set-Cookie": cookieHeader })
  } catch (e) {
    return errorResponse(e)
  }
}
