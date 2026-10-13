import { supabase } from "@/lib/supabase"
import {
  requireAdminAuth,
  present,
  jsonResponse,
  errorResponse,
} from "@/lib/orders-server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    await requireAdminAuth(request)

    // Fetch latest active and recent orders
    const { data: orders, error: ordersErr } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)

    if (ordersErr) throw ordersErr

    const { data: setting } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "ordering_open")
      .maybeSingle()

    const orderingOpen = setting?.value !== "false"

    return jsonResponse({
      orders: (orders || []).map(present),
      orderingOpen,
      serverTime: Date.now(),
    })
  } catch (e) {
    return errorResponse(e)
  }
}
