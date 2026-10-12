"use client"

import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react"
import Image from "next/image"
import { CATEGORIES, MENU, type CategoryId, type MenuItem } from "@/lib/menu-data"
import { useLiveMenu } from "@/components/menu/menu-provider"
import { PurchaseControls } from "@/components/menu/purchase-controls"
import { SectionHeading } from "@/components/ui-kit/section-heading"
import { cn } from "@/lib/utils"

function MenuCard({ item, index }: { item: MenuItem; index: number }) {
  return (
    <li
      className="animate-swap group flex gap-4 rounded-3xl bg-white p-3 ring-1 ring-ink/5 transition-all duration-300 hover:ring-forest/20 hover:shadow-xl hover:shadow-ink/5 md:flex-col md:p-4"
      style={{ "--delay": `${index * 60}ms` } as CSSProperties}
    >
      <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-cream md:aspect-[4/3] md:size-auto md:w-full">
        <Image
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 96px, 25vw"
          className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
        />
        {item.tag && (
          <span className="absolute top-2 right-2 rounded-full bg-ink/85 px-2.5 py-0.5 text-[11px] font-medium text-cream shadow-sm">
            {item.tag}
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-ink md:text-xl">{item.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-ink/60">{item.description}</p>
        </div>
        <PurchaseControls item={item} tone="light" buttonLabel="أضف" className="mt-auto" />
      </div>
    </li>
  )
}

export function MenuSection() {
  const [active, setActive] = useState<CategoryId>("pizza")
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const { items: liveItems } = useLiveMenu()
  const items = liveItems.filter((item) => item.category === active)

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const dir = e.key === "ArrowLeft" ? 1 : e.key === "ArrowRight" ? -1 : 0
    if (!dir) return
    e.preventDefault()
    const next = (index + dir + CATEGORIES.length) % CATEGORIES.length
    setActive(CATEGORIES[next].id)
    tabs.current[next]?.focus()
  }

  return (
    <section id="menu" aria-labelledby="menu-title" className="bg-sand py-16 text-ink md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            id="menu-title"
            index="05"
            label="المنيو الكامل"
            tone="light"
            title={
              <>
                شو <span className="text-forest">بتشتهي</span> اليوم؟
              </>
            }
          />
          <p data-reveal className="max-w-sm text-sm leading-relaxed text-ink/60">
            اختار أصنافك، ضيفها للسلة، وابعت طلبك على واتساب بكبسة وحدة.
          </p>
        </div>

        <div className="sticky top-16 z-30 -mx-5 mt-6 border-y border-ink/5 bg-sand/90 px-5 py-3 backdrop-blur-md md:mx-0 md:border-none md:px-0">
          <div role="tablist" aria-label="أقسام المنيو" className="no-scrollbar flex gap-2 overflow-x-auto">
            {CATEGORIES.map((c, i) => (
              <button
                key={c.id}
                ref={(el) => {
                  tabs.current[i] = el
                }}
                type="button"
                role="tab"
                id={`tab-${c.id}`}
                aria-selected={active === c.id}
                aria-controls="menu-panel"
                tabIndex={active === c.id ? 0 : -1}
                onClick={() => setActive(c.id)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={cn(
                  "h-11 shrink-0 rounded-full px-5 text-sm font-medium whitespace-nowrap transition-colors duration-300",
                  active === c.id ? "bg-ink text-cream" : "bg-white text-ink/65 hover:text-ink",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <ul
          key={active}
          id="menu-panel"
          role="tabpanel"
          aria-labelledby={`tab-${active}`}
          className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-5 lg:grid-cols-4"
        >
          {items.map((item, i) => (
            <MenuCard key={item.id} item={item} index={i} />
          ))}
        </ul>
        <p className="mt-8 text-center text-xs text-ink/45">الأسعار بالشيكل، وقابلة للتغيير.</p>
      </div>
    </section>
  )
}
