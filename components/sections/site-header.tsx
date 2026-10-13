"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BrandLockup } from "@/components/brand/brand-lockup"
import { HeaderCartButton } from "./header-cart-button"
import { cn } from "@/lib/utils"

const NAV = [
  { id: "pizza", label: "البيتزا" },
  { id: "burger", label: "البرجر" },
  { id: "drinks", label: "العصائر" },
  { id: "desserts", label: "الكيك" },
  { id: "menu", label: "المنيو" },
  { id: "contact", label: "تواصل" },
]

export function SiteHeader() {
  const [active, setActive] = useState<string>("")
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const sectionElements = NAV.map((item) => document.getElementById(item.id)).filter(
      (el): el is HTMLElement => el !== null,
    )

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px" },
    )

    sectionElements.forEach((el) => observer.observe(el))
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
    setActive(id)
    try {
      window.history.pushState(null, "", `#${id}`)
    } catch {
      // ignore
    }
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-cream/10 bg-ink/90 shadow-xl shadow-black/30 backdrop-blur-xl"
          : "border-b border-cream/5 bg-ink/70 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 md:px-8">
        <a
          href="#top"
          onClick={(e) => handleNav(e, "top")}
          aria-label="الشامي — العودة للأعلى"
          className="rounded-2xl transition-transform duration-300 hover:scale-[1.02] active:scale-95"
        >
          <BrandLockup />
        </a>

        <nav aria-label="التنقل الرئيسي" className="hidden lg:block">
          <ul className="flex items-center gap-1.5 rounded-full border border-cream/8 bg-cream/[0.03] p-1.5 backdrop-blur-sm">
            {NAV.map((item) => {
              const isActive = active === item.id
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => handleNav(e, item.id)}
                    className={cn(
                      "inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300",
                      isActive
                        ? "border border-neon/25 bg-forest/40 text-neon shadow-[0_0_14px_rgba(124,252,58,0.18)]"
                        : "border border-transparent text-cream/70 hover:bg-cream/[0.06] hover:text-cream",
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/menu"
            className="hidden sm:inline-flex items-center justify-center rounded-full border border-neon/30 bg-neon/10 px-3.5 py-2 text-xs font-semibold text-neon transition-all hover:bg-neon hover:text-ink active:scale-95"
            title="منيو طلب الطاولات والطلب الذاتي"
          >
            منيو الطاولات 🍽️
          </Link>
          <a
            href="#menu"
            onClick={(e) => handleNav(e, "menu")}
            className="flex h-10 items-center justify-center rounded-full bg-copper px-5 text-sm font-semibold text-ink shadow-[0_4px_18px_-4px_rgba(200,115,58,0.5)] transition-all duration-300 ease-out-expo hover:shadow-[0_6px_24px_-4px_rgba(200,115,58,0.7)] active:scale-95 md:hover:-translate-y-0.5"
          >
            اطلب الآن
          </a>
          <HeaderCartButton />
        </div>
      </div>
      <div aria-hidden="true" className="scroll-progress absolute inset-x-0 bottom-0 h-px bg-neon/70" />
    </header>
  )
}
