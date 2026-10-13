import { supabase } from "@/lib/supabase"
import { digest, present, jsonResponse, errorResponse } from "@/lib/orders-server"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authHeader = request.headers.get("authorization") || ""
    const token = authHeader.replace(/^Bearer\s+/i, "").trim()

    if (!token || !/^[-_a-zA-Z0-9]{32,64}$/.test(token)) {
      return jsonResponse({ error: "الطلب غير موجود" }, 404)
    }

    const tokenHash = digest(token)

    const { data: row } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .eq("receipt_hash", tokenHash)
      .maybeSingle()

    if (!row) {
      return jsonResponse({ error: "الطلب غير موجود" }, 404)
    }

    return jsonResponse({ order: present(row) }, 200)
  } catch (e) {
    return errorResponse(e)
  }
}
