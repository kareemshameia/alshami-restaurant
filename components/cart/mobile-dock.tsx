"use client"

import { useEffect, useState } from "react"
import { House, MessageCircle, Pizza, ShoppingBag, UtensilsCrossed } from "lucide-react"
import { useCart } from "./cart-provider"
import { whatsappUrl } from "@/lib/whatsapp"
import { cn } from "@/lib/utils"

const TRACKED_SECTIONS = ["top", "pizza", "burger", "drinks", "desserts", "menu", "contact"]

const itemClass =
  "flex h-14 w-full flex-col items-center justify-center gap-1 rounded-full text-[11px] font-medium transition-colors duration-300"

export function MobileDock() {
  const { count, open, isOpen } = useCart()
  const [current, setCurrent] = useState("top")

  useEffect(() => {
    const sections = TRACKED_SECTIONS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    )
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setCurrent(entry.target.id)
      },
      { rootMargin: "-45% 0px -50% 0px" },
    )
    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    if (id === "top") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    } else {
      const el = document.getElementById(id)
      if (el) {
        const headerOffset = 64
        const elementPosition = el.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: "smooth",
        })
      }
    }
    setCurrent(id)
    try {
      window.history.pushState(null, "", `#${id}`)
    } catch {
      // ignore
    }
  }

  const linkTone = (id: string) =>
    current === id
      ? "text-neon font-semibold scale-105"
      : "text-cream/60 hover:text-cream active:scale-95"

  return (
    <nav
      aria-label="تنقل سريع"
      className={cn(
        "fixed inset-x-0 bottom-0 z-[60] px-3.5 pb-[max(0.85rem,env(safe-area-inset-bottom))] transition-all duration-500 ease-out-expo md:hidden",
        isOpen ? "pointer-events-none translate-y-28 opacity-0" : "pointer-events-auto translate-y-0 opacity-100",
      )}
    >
      <ul className="mx-auto grid max-w-md grid-cols-5 items-center rounded-full border border-cream/10 bg-ink/90 p-1.5 shadow-[0_18px_45px_-10px_rgba(0,0,0,0.7)] backdrop-blur-xl">
        <li>
          <a
            href="#top"
            onClick={(e) => handleNav(e, "top")}
            className={cn(itemClass, linkTone("top"))}
            aria-current={current === "top" ? "true" : undefined}
          >
            <House className="size-5 transition-transform" aria-hidden="true" />
            الرئيسية
          </a>
        </li>
        <li>
          <a
            href="#pizza"
            onClick={(e) => handleNav(e, "pizza")}
            className={cn(itemClass, linkTone("pizza"))}
            aria-current={current === "pizza" ? "true" : undefined}
          >
            <Pizza className="size-5" aria-hidden="true" />
            البيتزا
          </a>
        </li>
        <li className="flex justify-center">
          <button
            type="button"
            onClick={open}
            aria-label={`السلة، ${count} أصناف`}
            className="relative flex size-14 items-center justify-center rounded-full bg-copper text-ink shadow-[0_8px_24px_-6px_rgba(200,115,58,0.7)] transition-transform duration-300 active:scale-90"
          >
            <ShoppingBag className="size-6" aria-hidden="true" />
            {count > 0 && (
              <span
                key={count}
                className="animate-badge-pop absolute -top-0.5 -left-0.5 flex size-5 items-center justify-center rounded-full bg-neon text-[11px] font-bold text-ink tabular-nums ring-2 ring-ink"
              >
                {count}
              </span>
            )}
          </button>
        </li>
        <li>
          <a
            href="#menu"
            onClick={(e) => handleNav(e, "menu")}
            className={cn(itemClass, linkTone("menu"))}
            aria-current={current === "menu" ? "true" : undefined}
          >
            <UtensilsCrossed className="size-5" aria-hidden="true" />
            المنيو
          </a>
        </li>
        <li>
          <a
            href={whatsappUrl("مرحبا الشامي")}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(itemClass, "text-[#25d366]")}
          >
            <MessageCircle className="size-5" aria-hidden="true" />
            واتساب
          </a>
        </li>
      </ul>
    </nav>
  )
}
