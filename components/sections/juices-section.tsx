"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getItem as getStaticItem, type MenuItem } from "@/lib/menu-data"
import { useLiveMenu } from "@/components/menu/menu-provider"
import { PurchaseControls } from "@/components/menu/purchase-controls"
import { SectionHeading } from "@/components/ui-kit/section-heading"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

export type DrinksShowcaseItem = {
  id: string
  bg: string
  slogan: string
  name?: string
  image?: string
  description?: string
}

export type DrinksShowcaseConfig = {
  title: string
  highlight: string
  description: string
  items: DrinksShowcaseItem[]
}

const DEFAULT_CONFIG: DrinksShowcaseConfig = {
  title: "اشرب الشامي",
  highlight: "الشامي",
  description: "موهيتو منعش، عصير الدبدوب، وسموثي بيصحصح… اختار نكهتك.",
  items: [
    { id: "mojito-blue", bg: "#0b3a8c", slogan: "طاقة ما بتخلص" },
    { id: "mojito-purple", bg: "#4b1d7a", slogan: "حيوية بدون حدود" },
    { id: "bear-juice", bg: "#a8481a", slogan: "دبدوب الشامي بثلاث نكهات" },
    { id: "smoothie", bg: "#a12f5d", slogan: "سموثي بيصحصح" },
  ],
}

const BUBBLES = Array.from({ length: 10 }, (_, i) => ({
  left: `${(i * 37 + 7) % 100}%`,
  size: 8 + ((i * 13) % 16),
  duration: 8 + ((i * 7) % 8),
  delay: (i * 0.9) % 7,
}))

export function JuicesSection() {
  const { getItem } = useLiveMenu()
  const [config, setConfig] = useState<DrinksShowcaseConfig>(DEFAULT_CONFIG)
  const [active, setActive] = useState(0)
  const scroller = useRef<HTMLDivElement>(null)
  const slides = useRef<(HTMLElement | null)[]>([])

  // Load config from Supabase settings
  useEffect(() => {
    async function loadConfig() {
      try {
        const { data, error } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "drinks_showcase")
          .single()

        if (!error && data && data.value) {
          const parsed = typeof data.value === "string" ? JSON.parse(data.value) : data.value
          if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
            setConfig(parsed)
          }
        }
      } catch (err) {
        console.warn("Failed to load drinks_showcase settings, using default", err)
      }
    }

    loadConfig()

    const onFocus = () => loadConfig()
    window.addEventListener("focus", onFocus)
    const onVisibility = () => {
      if (!document.hidden) loadConfig()
    }
    document.addEventListener("visibilitychange", onVisibility)

    // Realtime subscription for instant sync from Admin
    const channel = supabase
      .channel("realtime:drinks_showcase_section")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "settings",
          filter: "key=eq.drinks_showcase",
        },
        (payload) => {
          if (payload.new && (payload.new as any).value) {
            try {
              const val = (payload.new as any).value
              const parsed = typeof val === "string" ? JSON.parse(val) : val
              if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
                setConfig(parsed)
              }
            } catch (err) {
              console.error("Failed to parse drinks_showcase realtime payload", err)
            }
          }
        }
      )
      .subscribe()

    return () => {
      window.removeEventListener("focus", onFocus)
      document.removeEventListener("visibilitychange", onVisibility)
      supabase.removeChannel(channel)
    }
  }, [])

  const drinks = (config.items || []).map((d) => {
    const live = getItem(d.id)
    const fallbackStatic = getStaticItem(d.id)
    const baseItem: MenuItem = live || fallbackStatic || {
      id: d.id,
      name: d.name || "مشروب الشامي",
      description: d.description || "طبيعي ومنعش بألذ نكهة",
      category: "drinks",
      price: 15,
      image: d.image || "/placeholder.svg",
    }

    return {
      id: d.id,
      bg: d.bg || "#0b3a8c",
      slogan: d.slogan || "طاقة وانتعاش",
      item: {
        ...baseItem,
        ...(d.name ? { name: d.name } : {}),
        ...(d.image ? { image: d.image } : {}),
        ...(d.description ? { description: d.description } : {}),
      },
    }
  })

  // Observe active slide while scrolling
  useEffect(() => {
    const root = scroller.current
    if (!root) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.index)
            if (!isNaN(idx)) setActive(idx)
          }
        }
      },
      { root, threshold: 0.6 },
    )
    slides.current.forEach((slide) => slide && observer.observe(slide))
    return () => observer.disconnect()
  }, [drinks.length])

  const goTo = (index: number) => {
    const targetIdx = Math.max(0, Math.min(drinks.length - 1, index))
    setActive(targetIdx)
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    slides.current[targetIdx]?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    })
  }

  const handlePrev = () => {
    const newIdx = (active - 1 + drinks.length) % drinks.length
    goTo(newIdx)
  }

  const handleNext = () => {
    const newIdx = (active + 1) % drinks.length
    goTo(newIdx)
  }

  const activeDrink = drinks[active] || drinks[0] || { bg: "#0b3a8c" }

  return (
    <section
      id="drinks"
      aria-labelledby="drinks-title"
      className="relative overflow-hidden py-16 transition-colors duration-700 md:py-28"
      style={{ backgroundColor: activeDrink.bg }}
    >
      {/* Background Animated Bubbles */}
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

      {/* Section Heading */}
      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading
          id="drinks-title"
          index="03"
          label="العصائر"
          align="center"
          title={
            config.highlight && config.title.includes(config.highlight) ? (
              <>
                {config.title.split(config.highlight)[0]}
                <span className="text-mint">{config.highlight}</span>
                {config.title.split(config.highlight)[1]}
              </>
            ) : (
              config.title || (
                <>
                  اشرب <span className="text-mint">الشامي</span>
                </>
              )
            )
          }
          description={config.description || "موهيتو منعش، عصير الدبدوب، وسموثي بيصحصح… اختار نكهتك."}
        />
      </div>

      {/* Carousel Container with Left & Right Navigation Arrows */}
      <div className="relative mt-10 md:mt-14">
        {/* Right Arrow (in RTL: previous slide / scroll towards right) */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="المشروب السابق"
          title="المشروب السابق"
          className="group absolute right-2 sm:right-4 md:right-8 lg:right-12 top-1/2 -translate-y-1/2 z-20 flex size-11 sm:size-12 md:size-14 items-center justify-center rounded-full border border-cream/25 bg-ink/75 text-cream shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-cream/50 hover:bg-ink/95 active:scale-90"
        >
          <ChevronRight className="size-6 md:size-7 transition-transform group-hover:scale-110" />
        </button>

        {/* Left Arrow (in RTL: next slide / scroll towards left) */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="المشروب التالي"
          title="المشروب التالي"
          className="group absolute left-2 sm:left-4 md:left-8 lg:left-12 top-1/2 -translate-y-1/2 z-20 flex size-11 sm:size-12 md:size-14 items-center justify-center rounded-full border border-cream/25 bg-ink/75 text-cream shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-cream/50 hover:bg-ink/95 active:scale-90"
        >
          <ChevronLeft className="size-6 md:size-7 transition-transform group-hover:scale-110" />
        </button>

        {/* Horizontal Snap Slides */}
        <div
          ref={scroller}
          className="no-scrollbar relative flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-[7vw] md:px-[max(2rem,calc(50vw-30rem))]"
        >
          {drinks.map(({ id, slogan, item }, i) => (
            <article
              key={`${id}-${i}`}
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
      </div>

      {/* Thumbnails Navigation Row */}
      <div className="relative mt-10 flex justify-center gap-3 px-4" role="group" aria-label="اختر المشروب">
        {drinks.map(({ id, item }, i) => (
          <button
            key={`${id}-${i}`}
            type="button"
            onClick={() => goTo(i)}
            aria-label={item.name}
            aria-current={active === i || undefined}
            className={cn(
              "relative size-12 sm:size-14 overflow-hidden rounded-full ring-2 transition-all duration-500 ease-out-expo shrink-0",
              active === i ? "scale-100 ring-cream shadow-lg" : "scale-90 opacity-60 ring-cream/25 hover:opacity-90",
            )}
          >
            <Image src={item.image || "/placeholder.svg"} alt="" fill sizes="56px" className="object-cover" />
          </button>
        ))}
      </div>
    </section>
  )
}
