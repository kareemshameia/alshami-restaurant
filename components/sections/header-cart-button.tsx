"use client"

import { ShoppingBag } from "lucide-react"
import { useCart } from "@/components/cart/cart-provider"

export function HeaderCartButton() {
  const { count, open } = useCart()

  return (
    <button
      type="button"
      onClick={open}
      className="relative hidden size-10 items-center justify-center rounded-full border border-cream/12 text-cream transition-colors duration-300 hover:border-cream/30 md:flex"
      aria-label={`السلة، ${count} أصناف`}
    >
      <ShoppingBag className="size-[18px]" aria-hidden="true" />
      {count > 0 && (
        <span
          key={count}
          className="animate-badge-pop absolute -top-1 -left-1 flex size-5 items-center justify-center rounded-full bg-neon text-[11px] font-bold text-ink tabular-nums"
        >
          {count}
        </span>
      )}
    </button>
  )
}
