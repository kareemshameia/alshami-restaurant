"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { getItem as getStaticItem } from "@/lib/menu-data"
import { useLiveMenu } from "@/components/menu/menu-provider"
import { PurchaseControls } from "@/components/menu/purchase-controls"
import { SectionHeading } from "@/components/ui-kit/section-heading"
import { cn } from "@/lib/utils"

const DRINKS_CONFIG = [
  { id: "mojito-blue", bg: "#0b3a8c", slogan: "طاقة ما بتخلص" },
  { id: "mojito-purple", bg: "#4b1d7a", slogan: "حيوية بدون حدود" },
  { id: "bear-juice", bg: "#a8481a", slogan: "دبدوب الشامي بثلاث نكهات" },
  { id: "smoothie", bg: "#a12f5d", slogan: "سموثي بيصحصح" },
]

const BUBBLES = Array.from({ length: 10 }, (_, i) => ({
  left: `${(i * 37 + 7) % 100}%`,
  size: 8 + ((i * 13) % 16),
  duration: 8 + ((i * 7) % 8),
  delay: (i * 0.9) % 7,
}))

export function JuicesSection() {
  const { getItem } = useLiveMenu()
  const drinks = DRINKS_CONFIG.map((d) => ({
    ...d,
    item: getItem(d.id) || getStaticItem(d.id)!,
  }))
  const [active, setActive] = useState(0)
  const scroller = useRef<HTMLDivElement>(null)
  const slides = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const root = scroller.current
    if (!root) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index))
        }
      },
      { root, threshold: 0.6 },
    )
    slides.current.forEach((slide) => slide && observer.observe(slide))
    return () => observer.disconnect()
  }, [])

  const goTo = (index: number) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    slides.current[index]?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest", inline: "center" })
  }

  const activeDrink = drinks[active] || drinks[0]

  return (
    <section
      id="drinks"
      aria-labelledby="drinks-title"
      className="relative overflow-hidden py-16 transition-colors duration-700 md:py-28"
      style={{ backgroundColor: activeDrink.bg }}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {BUBBLES.map((b, i) => (
          <span
            key={i}
            className="animate-rise absolute -bottom-6 rounded-full border border-white/30 bg-white/10"
            style={{
              left: b.left,
              width: b.size,
              height: b.size,
              animationDuration: `${b.duration}s`,
              animationDelay: `${b.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading
          id="drinks-title"
          index="03"
          label="العصائر"
          align="center"
          title={
            <>
              اشرب <span className="text-mint">الشامي</span>
            </>
          }
          description="موهيتو منعش، عصير الدبدوب، وسموثي بيصحصح… اختار نكهتك."
        />
      </div>

      <div
        ref={scroller}
        className="no-scrollbar relative mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-[7vw] md:mt-14 md:px-[max(2rem,calc(50vw-30rem))]"
      >
        {drinks.map(({ id, slogan, item }, i) => (
          <article
            key={id}
            ref={(el) => {
              slides.current[i] = el
            }}
            data-index={i}
            aria-roledescription="شريحة"
            aria-label={`${i + 1} من ${drinks.length}: ${item.name}`}
            className={cn(
              "grid w-[86vw] max-w-[60rem] shrink-0 snap-center items-center gap-4 transition-opacity duration-500 md:grid-cols-2 md:gap-12",
              active === i ? "opacity-100" : "opacity-40",
            )}
          >
            <div className="relative mx-auto aspect-square w-[min(68vw,26rem)]">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                fill
                sizes="(max-width: 768px) 68vw, 416px"
                className="mask-fade object-cover"
              />
            </div>
            <div className="flex flex-col items-center gap-2 text-center md:items-start md:text-start">
              <p className="font-display text-lg text-cream/70 md:text-xl">{slogan}</p>
              <h3 className="font-display text-3xl font-bold text-cream md:text-5xl md:leading-[1.25]">{item.name}</h3>
              <p className="text-cream/75">{item.description}</p>
              <PurchaseControls item={item} tone="vivid" className="mt-4 w-full max-w-sm" />
            </div>
          </article>
        ))}
      </div>

      <div className="relative mt-10 flex justify-center gap-3" role="group" aria-label="اختر المشروب">
        {drinks.map(({ id, item }, i) => (
          <button
            key={id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={item.name}
            aria-current={active === i || undefined}
            className={cn(
              "relative size-14 overflow-hidden rounded-full ring-2 transition-all duration-500 ease-out-expo",
              active === i ? "scale-100 ring-cream" : "scale-90 opacity-60 ring-cream/25",
            )}
          >
            <Image src={item.image || "/placeholder.svg"} alt="" fill sizes="56px" className="object-cover" />
          </button>
        ))}
      </div>
    </section>
  )
}
