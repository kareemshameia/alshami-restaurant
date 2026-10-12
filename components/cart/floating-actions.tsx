"use client"

import { MessageCircle, ShoppingBag } from "lucide-react"
import { useCart } from "./cart-provider"
import { formatPrice, whatsappUrl } from "@/lib/whatsapp"
import { cn } from "@/lib/utils"

export function FloatingActions() {
  const { count, total, open } = useCart()

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] hidden items-end justify-between px-8 md:flex">
      <button
        type="button"
        onClick={open}
        tabIndex={count > 0 ? 0 : -1}
        aria-hidden={count === 0}
        className={cn(
          "flex items-center gap-3 rounded-full bg-copper py-2 pr-2 pl-5 font-semibold text-ink shadow-[0_16px_40px_-12px_rgba(0,0,0,0.55)] transition-all duration-500 ease-out-expo hover:-translate-y-0.5",
          count > 0 ? "pointer-events-auto translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        )}
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-ink text-neon">
          <ShoppingBag className="size-5" aria-hidden="true" />
        </span>
        <span className="text-sm tabular-nums">
          {count} أصناف · {formatPrice(total)}
        </span>
      </button>
      <a
        href={whatsappUrl("مرحبا الشامي")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="تواصل معنا على واتساب"
        className="pointer-events-auto flex size-14 items-center justify-center rounded-full bg-[#25d366] text-ink shadow-[0_16px_40px_-12px_rgba(0,0,0,0.55)] transition-transform duration-300 ease-out-expo hover:-translate-y-0.5"
      >
        <MessageCircle className="size-6" aria-hidden="true" />
      </a>
    </div>
  )
}
