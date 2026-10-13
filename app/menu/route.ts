import { MENU_HTML } from "@/lib/html-templates"
import { getCatalog } from "@/lib/orders-server"

export const dynamic = "force-dynamic"

export async function GET() {
  const catalog = await getCatalog()
  const scriptTag = `<script>window.MENU_ITEMS = ${JSON.stringify(catalog).replace(/</g, "\\u003c")};</script>`
  const html = MENU_HTML.replace(
    '<script src="catalog.js"></script>',
    `${scriptTag}<script src="catalog.js"></script>`
  )

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "same-origin",
    },
  })
}
