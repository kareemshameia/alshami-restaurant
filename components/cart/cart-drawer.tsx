"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { MessageCircle, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react"
import { useCart } from "./cart-provider"
import { getItem } from "@/lib/menu-data"
import { useLiveMenu } from "@/components/menu/menu-provider"
import { formatPrice, openWhatsApp, scrollToSection } from "@/lib/whatsapp"
import { cn } from "@/lib/utils"

const inputClass =
  "h-11 rounded-xl border border-ink/12 bg-cream px-3 text-base font-normal text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-forest"

export function CartDrawer() {
  const { lines, total, count, isOpen, close, setQuantity, remove, clear, priceOf } = useCart()
  const { getItem: getLiveItem } = useLiveMenu()
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [notes, setNotes] = useState("")
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const previousFocus = document.activeElement as HTMLElement | null
    const root = document.documentElement
    const previousOverflow = root.style.overflow
    root.style.overflow = "hidden"
    panel.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      root.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKey)
      previousFocus?.focus?.()
    }
  }, [isOpen, close])

  const sendOrder = () => {
    const rows = lines.map((l) => {
      const item = getLiveItem(l.id) || getItem(l.id)!
      const label = l.size ? `${item.name} (${l.size})` : item.name
      return `• ${l.quantity} × ${label} — ${formatPrice(priceOf(l) * l.quantity)}`
    })
    const message = [
      "مرحبا الشامي، بدي أطلب:",
      "",
      ...rows,
      "",
      `المجموع: ${formatPrice(total)}`,
      "",
      `الاسم: ${name.trim() || "-"}`,
      `العنوان: ${address.trim() || "-"}`,
      notes.trim() ? `ملاحظات: ${notes.trim()}` : "",
    ]
      .filter((line, i, arr) => !(line === "" && i === arr.length - 1))
      .join("\n")
    openWhatsApp(message)
  }

  return (
    <div className={cn("fixed inset-0 z-[80]", !isOpen && "pointer-events-none")} inert={!isOpen}>
      <div
        className={cn(
          "absolute inset-0 bg-ink/60 backdrop-blur-[2px] transition-opacity duration-500",
          isOpen ? "opacity-100" : "opacity-0",
        )}
        onClick={close}
        aria-hidden="true"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        tabIndex={-1}
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-cream text-ink shadow-2xl outline-none transition-transform duration-700 ease-out-expo",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <h2 id="cart-title" className="font-display text-2xl font-bold">
            طلبك <span className="text-forest tabular-nums">({count})</span>
          </h2>
          <button
            type="button"
            onClick={close}
            className="flex size-11 items-center justify-center rounded-full transition-colors hover:bg-ink/5"
            aria-label="إغلاق السلة"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <span className="flex size-20 items-center justify-center rounded-full bg-ink/5">
              <ShoppingBag className="size-8 text-ink/30" aria-hidden="true" />
            </span>
            <p className="font-display text-2xl font-bold">السلة فاضية</p>
            <p className="text-sm text-ink/60">أضف أصنافاً من المنيو، وابعت طلبك على واتساب.</p>
            <button
              type="button"
              onClick={() => {
                close()
                window.setTimeout(() => scrollToSection("menu"), 350)
              }}
              className="mt-2 h-12 rounded-full bg-ink px-7 font-semibold text-cream transition-transform active:scale-95"
            >
              تصفّح المنيو
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto overscroll-contain px-5 py-2">
              {lines.map((l) => {
                const item = getLiveItem(l.id) || getItem(l.id)!
                return (
                  <li key={l.key} className="flex items-center gap-3 border-b border-ink/8 py-4 last:border-0">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-ink/5">
                      <Image src={item.image || "/placeholder.svg"} alt="" fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{item.name}</p>
                      {l.size && <p className="text-xs text-ink/55">{l.size}</p>}
                      <p className="text-sm font-semibold text-forest tabular-nums">
                        {formatPrice(priceOf(l) * l.quantity)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-white p-1 ring-1 ring-ink/10">
                      <button
                        type="button"
                        onClick={() => setQuantity(l.key, l.quantity + 1)}
                        className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-ink/5"
                        aria-label={`زيادة ${item.name}`}
                      >
                        <Plus className="size-3.5" aria-hidden="true" />
                      </button>
                      <span className="w-5 text-center text-sm font-semibold tabular-nums">{l.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(l.key, l.quantity - 1)}
                        className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-ink/5"
                        aria-label={`إنقاص ${item.name}`}
                      >
                        <Minus className="size-3.5" aria-hidden="true" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(l.key)}
                      className="flex size-9 items-center justify-center rounded-full text-ink/45 transition-colors hover:text-destructive"
                      aria-label={`حذف ${item.name}`}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </li>
                )
              })}
            </ul>

            <div className="flex flex-col gap-3 border-t border-ink/10 bg-white px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink/65">
                  الاسم
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={60}
                    autoComplete="name"
                    className={inputClass}
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink/65">
                  العنوان
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    maxLength={120}
                    autoComplete="street-address"
                    className={inputClass}
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink/65">
                ملاحظات (اختياري)
                <input value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={200} className={inputClass} />
              </label>
              <div className="flex items-center justify-between pt-1">
                <button type="button" onClick={clear} className="text-sm text-ink/50 underline-offset-4 hover:underline">
                  تفريغ السلة
                </button>
                <p className="font-display text-xl font-bold">
                  المجموع: <span className="text-forest tabular-nums">{formatPrice(total)}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={sendOrder}
                className="flex h-14 items-center justify-center gap-2 rounded-full bg-[#25d366] text-lg font-semibold text-ink transition-transform duration-300 ease-out-expo active:scale-[0.97]"
              >
                <MessageCircle className="size-5" aria-hidden="true" />
                أرسل الطلب على واتساب
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
