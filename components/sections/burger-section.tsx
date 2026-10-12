"use client"

import type { CSSProperties } from "react"
import Image from "next/image"
import { Check } from "lucide-react"
import { getItem as getStaticItem } from "@/lib/menu-data"
import { useLiveMenu } from "@/components/menu/menu-provider"
import { PurchaseControls } from "@/components/menu/purchase-controls"
import { SectionHeading } from "@/components/ui-kit/section-heading"

const CALLOUTS = ["جبنة شيدر سايحة", "لحمة طازجة يومياً", "خبز بريوش محمّص"]

export function BurgerSection() {
  const { getItem } = useLiveMenu()
  const burger = getItem("burger-cheese") || getStaticItem("burger-cheese")!
  const sides = [
    getItem("calzone") || getStaticItem("calzone")!,
    getItem("fries") || getStaticItem("fries")!,
  ]

  return (
    <section id="burger" aria-labelledby="burger-title" className="relative overflow-hidden bg-ink py-16 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading
          id="burger-title"
          index="02"
          label="البرجر والفاست فود"
          align="center"
          title={
            <>
              التشيز بول <span className="text-copper">الأسطوري</span>
            </>
          }
          description="برجر بالجبنة السايحة، كالزوني، وبطاطا مقرمشة… كل لقمة إلها طعم."
        />

        <div className="mt-12 grid items-center gap-10 md:mt-16 md:grid-cols-2 md:gap-16">
          <div className="relative">
            <p
              aria-hidden="true"
              className="drift text-outline pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-display text-[10rem] leading-none font-black whitespace-nowrap md:text-[15rem]"
            >
              برجر
            </p>
            <div data-reveal="scale" className="relative mx-auto aspect-square w-[min(86vw,32rem)]">
              <div className="animate-float absolute inset-0">
                <Image
                  src={burger.image || "/placeholder.svg"}
                  alt={burger.name}
                  fill
                  sizes="(max-width: 768px) 86vw, 512px"
                  className="mask-fade object-cover"
                />
              </div>
            </div>
          </div>

          <div data-reveal className="flex flex-col gap-6">
            <div>
              {burger.tag && <p className="text-sm font-medium text-copper">{burger.tag}</p>}
              <h3 className="mt-1 font-display text-3xl font-bold text-cream md:text-4xl">{burger.name}</h3>
              <p className="mt-2 leading-relaxed text-cream/65">{burger.description}</p>
            </div>
            <ul className="flex flex-col gap-3">
              {CALLOUTS.map((callout) => (
                <li key={callout} className="flex items-center gap-3 text-cream/85">
                  <span className="flex size-7 items-center justify-center rounded-full bg-neon/10 text-neon">
                    <Check className="size-4" aria-hidden="true" />
                  </span>
                  {callout}
                </li>
              ))}
            </ul>
            <PurchaseControls item={burger} tone="dark" className="border-t border-cream/10 pt-6" />
          </div>
        </div>

        <div className="mt-20 md:mt-28">
          <p data-reveal className="text-center font-display text-2xl font-bold text-cream md:text-3xl">
            كالزوني… <span className="text-copper">الدلع إله عنوان</span>
          </p>
          <ul className="mt-8 grid gap-4 md:grid-cols-2 md:gap-6">
            {sides.map((item, i) => (
              <li
                key={item.id}
                data-reveal
                style={{ "--delay": `${i * 120}ms` } as CSSProperties}
                className="flex gap-4 rounded-3xl bg-ink-soft p-3 ring-1 ring-cream/8 md:p-4"
              >
                <div className="relative size-28 shrink-0 overflow-hidden rounded-2xl md:size-36">
                  <Image src={item.image || "/placeholder.svg"} alt={item.name} fill sizes="144px" className="object-cover" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 py-1">
                  <div>
                    <h4 className="font-display text-xl font-bold text-cream">{item.name}</h4>
                    <p className="line-clamp-2 text-sm text-cream/60">{item.description}</p>
                  </div>
                  <PurchaseControls item={item} tone="dark" buttonLabel="أضف" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
