import { supabase } from "@/lib/supabase"
import {
  requireAdminAuth,
  parseBody,
  present,
  assertTransition,
  jsonResponse,
  errorResponse,
  OrderError,
} from "@/lib/orders-server"

export const dynamic = "force-dynamic"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth(request)
    const { id } = await params
    const input = await parseBody(request)

    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (!order) {
      throw new OrderError("الطلب غير موجود", 404)
    }

    if (!Number.isInteger(input.version) || input.version !== order.version) {
      throw new OrderError("الطلب تغيّر على جهاز آخر؛ حدّث القائمة", 409)
    }

    assertTransition(order.status, input.status)

    const reason = input.status === "rejected" ? String(input.reason || "").trim() : ""
    if (reason.length > 200) {
      throw new OrderError("سبب الرفض طويل جدًا", 400)
    }

    const nextVersion = order.version + 1
    const now = Date.now()

    const { data: updated, error: updateErr } = await supabase
      .from("orders")
      .update({
        status: input.status,
        rejection_reason: reason,
        updated_at: now,
        version: nextVersion,
      })
      .eq("id", id)
      .eq("version", order.version)
      .select()
      .maybeSingle()

    if (updateErr || !updated) {
      throw new OrderError("تغيّرت حالة الطلب؛ حدّث القائمة", 409)
    }

    return jsonResponse({ order: present(updated) }, 200)
  } catch (e) {
    return errorResponse(e)
  }
}
