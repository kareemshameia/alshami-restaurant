import {
  extractSessionCookie,
  verifySessionToken,
  jsonResponse,
  errorResponse,
} from "@/lib/orders-server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const token = extractSessionCookie(request)
    const authorized = verifySessionToken(token)
    return jsonResponse({ authorized })
  } catch (e) {
    return errorResponse(e)
  }
}
