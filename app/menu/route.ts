import { MENU_HTML } from "@/lib/html-templates"

export const dynamic = "force-dynamic"

export async function GET() {
  return new Response(MENU_HTML, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "same-origin",
    },
  })
}
