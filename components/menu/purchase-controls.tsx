"use client"

import { useState } from "react"
import type { MenuItem } from "@/lib/menu-data"
import { AddToCartButton } from "@/components/cart/add-to-cart-button"
import { Price, type Tone } from "./price"
import { cn } from "@/lib/utils"

const CHIP_TONE: Record<Tone, { on: string; off: string }> = {
  dark: { on: "border-cream bg-cream text-ink", off: "border-cream/15 text-cream/75 hover:border-cream/40" },
  vivid: { on: "border-cream bg-cream text-ink", off: "border-cream/30 text-cream/85 hover:border-cream/60" },
  light: { on: "border-ink bg-ink text-cream", off: "border-ink/15 text-ink/70 hover:border-ink/40" },
}

export function PurchaseControls({
  item,
  tone = "dark",
  buttonLabel,
  className,
}: {
  item: MenuItem
  tone?: Tone
  buttonLabel?: string
  className?: string
}) {
  const [size, setSize] = useState(item.sizes?.[0].label)
  const price = item.sizes?.find((s) => s.label === size)?.price ?? item.price

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {item.sizes && (
        <div role="radiogroup" aria-label={`اختر الحجم لـ ${item.name}`} className="flex flex-wrap gap-2">
          {item.sizes.map((s) => {
            const selected = s.label === size
            return (
              <button
                key={s.label}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setSize(s.label)}
                className={cn(
                  "h-9 rounded-full border px-4 text-sm font-medium transition-colors duration-300",
                  selected ? CHIP_TONE[tone].on : CHIP_TONE[tone].off,
                )}
              >
                {s.label}
              </button>
            )
          })}
        </div>
      )}
      <div className="flex items-center justify-between gap-4">
        <Price value={price} tone={tone} />
        <AddToCartButton
          id={item.id}
          size={size}
          label={buttonLabel}
          variant={tone === "vivid" ? "cream" : "copper"}
        />
      </div>
    </div>
  )
}
