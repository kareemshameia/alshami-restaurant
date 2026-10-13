import { getCatalog } from "@/lib/orders-server"

export const dynamic = "force-dynamic"

export async function GET() {
  const items = await getCatalog()
  return Response.json(items, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "CDN-Cache-Control": "no-store",
    },
  })
}
