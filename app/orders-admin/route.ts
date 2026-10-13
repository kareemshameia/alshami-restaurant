import { ADMIN_HTML } from "@/lib/html-templates"

export const dynamic = "force-dynamic"

export async function GET() {
  return new Response(ADMIN_HTML, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "same-origin",
    },
  })
}
