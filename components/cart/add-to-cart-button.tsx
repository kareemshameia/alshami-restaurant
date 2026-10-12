"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Plus } from "lucide-react"
import { useCart } from "./cart-provider"
import { cn } from "@/lib/utils"

export function AddToCartButton({
  id,
  size,
  label = "أضف للطلب",
  variant = "copper",
  className,
}: {
  id: string
  size?: string
  label?: string
  variant?: "copper" | "cream"
  className?: string
}) {
  const { add } = useCart()
  const [added, setAdded] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <button
      type="button"
      onClick={() => {
        add(id, size)
        setAdded(true)
        window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => setAdded(false), 1400)
      }}
      className={cn(
        "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-ink transition-[background-color,transform] duration-300 ease-out-expo active:scale-95 md:hover:-translate-y-0.5",
        added ? "bg-neon" : variant === "cream" ? "bg-cream" : "bg-copper",
        className,
      )}
    >
      {added ? <Check className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
      <span aria-live="polite">{added ? "تمت الإضافة" : label}</span>
    </button>
  )
}
