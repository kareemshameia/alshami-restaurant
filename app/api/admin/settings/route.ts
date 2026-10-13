import { supabase } from "@/lib/supabase"
import {
  requireAdminAuth,
  parseBody,
  jsonResponse,
  errorResponse,
  OrderError,
} from "@/lib/orders-server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    await requireAdminAuth(request)
    const input = await parseBody(request)

    if (typeof input.orderingOpen !== "boolean") {
      throw new OrderError("الإعداد غير صحيح", 400)
    }

    const { error: upsertErr } = await supabase
      .from("settings")
      .upsert({
        key: "ordering_open",
        value: String(input.orderingOpen),
      })

    if (upsertErr) throw upsertErr

    return jsonResponse({ ok: true, orderingOpen: input.orderingOpen }, 200)
  } catch (e) {
    return errorResponse(e)
  }
}
