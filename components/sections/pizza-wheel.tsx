"use client"

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import Image from "next/image"
import { ArrowLeft, ArrowRight, Hand } from "lucide-react"
import { MENU } from "@/lib/menu-data"
import { useLiveMenu } from "@/components/menu/menu-provider"
import { PurchaseControls } from "@/components/menu/purchase-controls"
import { SectionHeading } from "@/components/ui-kit/section-heading"
import { cn } from "@/lib/utils"

const SLOTS = 8
const STEP = 360 / SLOTS
const PX_PER_STEP = 90
const MAX_DRAG = STEP * 2.4

const mod = (n: number, m: number) => ((n % m) + m) % m
const pad = (n: number) => String(n).padStart(2, "0")

function shortestDelta(target: number, current: number, size: number) {
  const d = mod(target - current, size)
  return d > size / 2 ? d - size : d
}

type DragState = { id: number; x: number; y: number; type: string; deg: number; active: boolean }

export function PizzaWheel() {
  const { items } = useLiveMenu()
  const PIZZAS = items.filter((item) => item.category === "pizza").length > 0
    ? items.filter((item) => item.category === "pizza")
    : MENU.filter((item) => item.category === "pizza")

  const [step, setStep] = useState(0)
  const rotorRef = useRef<HTMLDivElement>(null)
  const drag = useRef<DragState | null>(null)
  const didDrag = useRef(false)

  const activeIndex = mod(step, PIZZAS.length)
  const pizza = PIZZAS[activeIndex] || PIZZAS[0]
  const rotation = step * STEP

  const shift = (delta: number) => setStep((s) => s + delta)
  const selectSlot = (slot: number) => shift(shortestDelta(slot, step, SLOTS))
  const selectPizza = (index: number) => shift(shortestDelta(index, activeIndex, PIZZAS.length))

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return
    didDrag.current = false
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, type: e.pointerType, deg: 0, active: false }
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    const horizontal = Math.abs(dx) >= Math.abs(dy)

    if (!d.active) {
      if (Math.hypot(dx, dy) < 8) return
      // On touch, vertical intent belongs to page scrolling
      if (d.type !== "mouse" && !horizontal) {
        drag.current = null
        return
      }
      d.active = true
      didDrag.current = true
      e.currentTarget.setPointerCapture(e.pointerId)
      rotorRef.current?.setAttribute("data-dragging", "")
    }

    const distance = d.type !== "mouse" || horizontal ? dx : dy
    d.deg = Math.max(-MAX_DRAG, Math.min(MAX_DRAG, (-distance / PX_PER_STEP) * STEP))
    if (rotorRef.current) rotorRef.current.style.transform = `rotate(${rotation + d.deg}deg)`
  }

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    drag.current = null
    if (!d.active) return

    const rotor = rotorRef.current
    rotor?.removeAttribute("data-dragging")
    const magnitude = Math.abs(d.deg)
    const steps =
      e.type === "pointercancel" || magnitude < STEP * 0.22
        ? 0
        : Math.sign(d.deg) * Math.max(1, Math.round(magnitude / STEP))
    if (steps) shift(steps)
    else if (rotor) rotor.style.transform = `rotate(${rotation}deg)`
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault()
      shift(1)
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault()
      shift(-1)
    }
  }

  return (
    <section
      id="pizza"
      aria-labelledby="pizza-title"
      className="relative overflow-hidden bg-cream py-16 text-ink md:py-24"
    >
      <div className="grid md:grid-cols-[1fr_1.1fr] md:grid-rows-[1fr_auto_auto_1fr]">
        <div className="px-5 md:col-start-2 md:row-start-2 md:px-12 lg:px-20">
          <SectionHeading
            id="pizza-title"
            index="01"
            label="البيتزا"
            tone="light"
            title={
              <>
                ملوك الطعم <span className="text-copper">في البيتزا</span>
              </>
            }
            description="رقم واحد في العالم… بيتزا الشامي وبس. عجينة طازجة كل يوم، وجبنة بتمطّ لآخر لقمة."
          />
        </div>

        <div
          data-reveal="wheel"
          role="group"
          aria-roledescription="عجلة اختيار"
          aria-label="اختر البيتزا"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={onKeyDown}
          className="wheel-stage relative mt-10 cursor-grab overflow-hidden select-none active:cursor-grabbing md:col-start-1 md:row-span-4 md:row-start-1 md:mt-0"
        >
          <div className="wheel-hub">
            <div className="wheel-disc" />
            <div ref={rotorRef} className="wheel-rotor" style={{ transform: `rotate(${rotation}deg)` }}>
              <div className="wheel-ring" />
              {Array.from({ length: SLOTS }, (_, slot) => {
                const item = PIZZAS[slot % PIZZAS.length]
                const offset = shortestDelta(slot, step, SLOTS)
                const isActive = offset === 0
                const hidden = Math.abs(offset) > 2
                return (
                  <div
                    key={slot}
                    className="wheel-slot"
                    style={{ transform: `rotate(${180 - slot * STEP}deg) translateX(var(--orbit))` }}
                  >
                    <button
                      type="button"
                      className="wheel-plate"
                      data-active={isActive || undefined}
                      data-hidden={hidden || undefined}
                      tabIndex={hidden ? -1 : 0}
                      aria-hidden={hidden || undefined}
                      aria-current={isActive || undefined}
                      aria-label={isActive ? `${item.name}، البيتزا المختارة` : `اختر ${item.name}`}
                      onClick={() => {
                        if (!didDrag.current) selectSlot(slot)
                      }}
                    >
                      <Image
                        src={item.topImage ?? item.image}
                        alt=""
                        fill
                        draggable={false}
                        sizes="(max-width: 768px) 38vw, 13rem"
                        className="object-cover"
                      />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="wheel-pill absolute top-1/2 right-0 z-10 flex h-12 items-center justify-center rounded-l-full bg-cream text-sm font-semibold text-ink shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
            اختر بيتزتك
          </div>
        </div>

        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-ink/45 md:hidden">
          <Hand className="size-4" aria-hidden="true" />
          اسحب لتدوير العجلة، أو اضغط على أي بيتزا
        </p>

        <div className="px-5 pt-8 md:col-start-2 md:row-start-3 md:px-12 md:pt-10 lg:px-20">
          <div aria-live="polite" className="max-w-md">
            <div key={pizza.id} className="animate-swap">
              <div className="flex items-center gap-3 text-sm">
                <span className="font-display font-semibold tabular-nums text-ink/40">
                  {pad(activeIndex + 1)} / {pad(PIZZAS.length)}
                </span>
                {pizza.tag && (
                  <span className="rounded-full bg-copper/12 px-3 py-0.5 text-xs font-semibold text-copper">
                    {pizza.tag}
                  </span>
                )}
              </div>
              <h3 className="mt-2 font-display text-3xl font-bold md:text-5xl md:leading-[1.25]">{pizza.name}</h3>
              <p className="mt-2 leading-relaxed text-ink/65">{pizza.description}</p>
              <PurchaseControls key={pizza.id} item={pizza} tone="light" className="mt-6" />
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <button
              type="button"
              onClick={() => shift(-1)}
              aria-label="البيتزا السابقة"
              className="flex size-12 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors duration-300 hover:border-ink/40 active:scale-95"
            >
              <ArrowRight className="size-5" aria-hidden="true" />
            </button>
            <div className="flex items-center" role="group" aria-label="اختيار البيتزا">
              {PIZZAS.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectPizza(i)}
                  aria-label={p.name}
                  aria-current={i === activeIndex || undefined}
                  className="flex h-8 w-6 items-center justify-center"
                >
                  <span
                    className={cn(
                      "h-2 rounded-full transition-all duration-500 ease-out-expo",
                      i === activeIndex ? "w-6 bg-copper" : "w-2 bg-ink/20",
                    )}
                  />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => shift(1)}
              aria-label="البيتزا التالية"
              className="flex size-12 items-center justify-center rounded-full bg-ink text-cream transition-transform duration-300 active:scale-95"
            >
              <ArrowLeft className="size-5" aria-hidden="true" />
            </button>
            <p className="hidden items-center gap-2 text-xs text-ink/45 md:flex">
              <Hand className="size-4" aria-hidden="true" />
              اسحب العجلة أو استخدم الأسهم
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
