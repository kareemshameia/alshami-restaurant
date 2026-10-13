import { supabase } from "@/lib/supabase"
import {
  parseBody,
  validateOrder,
  getCatalog,
  digest,
  present,
  checkRateLimit,
  jsonResponse,
  errorResponse,
  OrderError,
} from "@/lib/orders-server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const input = await parseBody(request)
    const catalog = getCatalog()
    const order = validateOrder(input, catalog)

    const receiptHash = digest(input.receiptToken)
    const payloadHash = digest(JSON.stringify(order))

    // 1. Idempotency check with requestKey
    const { data: existing } = await supabase
      .from("orders")
      .select("*")
      .eq("request_key", input.requestKey)
      .maybeSingle()

    if (existing) {
      if (existing.receipt_hash !== receiptHash || existing.payload_hash !== payloadHash) {
        throw new OrderError("مفتاح الطلب مستخدم؛ أعد فتح السلة", 409)
      }
      return jsonResponse({ order: present(existing) }, 200)
    }

    // 2. Check if ordering is open
    const { data: setting } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "ordering_open")
      .maybeSingle()

    if (setting?.value === "false") {
      throw new OrderError("استقبال الطلبات متوقف مؤقتًا؛ يرجى مراجعة الكاشير", 503)
    }

    // 3. Rate limiting
    await checkRateLimit(request, "order", 12)

    // 4. Insert new order
    const id = crypto.randomUUID()
    const now = Date.now()
    const record = {
      id,
      request_key: input.requestKey,
      receipt_hash: receiptHash,
      payload_hash: payloadHash,
      table_number: String(order.tableNumber),
      notes: order.notes,
      lines: JSON.stringify(order.lines),
      total: order.total,
      status: "new",
      rejection_reason: "",
      created_at: now,
      updated_at: now,
      version: 1,
    }

    const { error: insertErr } = await supabase.from("orders").insert(record)
    if (insertErr) {
      console.error("Order insertion error:", insertErr)
      throw new OrderError("تعارض في الطلب؛ حاول مجددًا", 409)
    }

    return jsonResponse({ order: present(record) }, 201)
  } catch (e) {
    return errorResponse(e)
  }
}
