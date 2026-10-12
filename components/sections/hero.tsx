import type { CSSProperties } from "react"
import Image from "next/image"
import { ArrowDown, Flame, Leaf, MapPin } from "lucide-react"

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties

const INGREDIENTS = [
  { kind: "olive", className: "top-[4%] left-[8%]" },
  { kind: "leaf", className: "top-[10%] right-[2%]" },
  { kind: "pepper", className: "bottom-[14%] left-[-2%]" },
  { kind: "olive", className: "bottom-[2%] right-[18%]" },
  { kind: "leaf", className: "top-[46%] left-[-6%] hidden md:block" },
] as const

function Ingredient({ kind }: { kind: "olive" | "leaf" | "pepper" }) {
  if (kind === "olive")
    return <span className="block size-6 rounded-full border-[6px] border-[#1f1f19] bg-[#3a3a2e] shadow-lg md:size-8" />
  if (kind === "pepper") return <span className="block size-8 rounded-full border-[5px] border-[#3fae4a] md:size-11" />
  return <Leaf className="size-8 text-[#4caf50] md:size-10" aria-hidden="true" />
}

export function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden bg-ink pt-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_45%_at_50%_72%,rgba(31,90,63,0.5),transparent_75%)] md:bg-[radial-gradient(40%_55%_at_28%_55%,rgba(31,90,63,0.5),transparent_75%)]"
      />

      <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl items-center gap-10 px-5 pt-8 pb-20 md:grid-cols-[1.1fr_1fr] md:gap-8 md:px-8 md:py-16">
        <div className="flex flex-col items-center text-center md:items-start md:text-start">
          <p
            className="intro inline-flex items-center gap-2 rounded-full border border-cream/12 bg-cream/[0.04] px-4 py-1.5 text-sm text-cream/75 backdrop-blur-sm"
            style={delay(0)}
          >
            <MapPin className="size-4 text-copper" aria-hidden="true" />
            دير البلح · غزة
          </p>

          <h1 className="mt-5 md:mt-6">
            <span className="neon-sign block font-display text-[clamp(4.25rem,14vw,8.5rem)] font-black leading-[1.15] text-neon pb-2 md:pb-3">
              الشامي
            </span>
          </h1>

          <p
            className="intro mt-6 text-sm font-medium tracking-wide text-cream/75 md:mt-6 md:text-base"
            style={delay(100)}
          >
            <span className="font-semibold text-neon/90" dir="ltr">Alshami</span>
            <span className="text-cream/40"> — </span>
            <span>مطعم الشامي في دير البلح</span>
          </p>

          <p className="intro mt-5 text-2xl font-bold font-display text-cream md:mt-6 md:text-4xl" style={delay(180)}>
            ضربة ساحقة <span className="text-copper">في عالم الطعم</span>
          </p>
          <p className="intro mt-2.5 md:mt-3 text-base text-cream/65 md:text-lg" style={delay(260)}>
            ملوك الطعم في البيتزا · برجر · عصائر · كيك
          </p>

          <div className="intro mt-8 md:mt-9 flex flex-wrap items-center justify-center gap-3.5 md:justify-start" style={delay(350)}>
            <a
              href="#menu"
              className="inline-flex h-12 items-center justify-center rounded-full bg-copper px-8 font-semibold text-ink shadow-[0_12px_32px_-8px_rgba(200,115,58,0.65)] transition-all duration-300 ease-out-expo hover:shadow-[0_16px_36px_-6px_rgba(200,115,58,0.8)] active:scale-95 md:hover:-translate-y-0.5"
            >
              اطلب الآن
            </a>
            <a
              href="#pizza"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-cream/15 bg-cream/[0.03] px-6 font-medium text-cream backdrop-blur-sm transition-all duration-300 hover:border-cream/40 hover:bg-cream/[0.08] active:scale-95"
            >
              اكتشف
              <ArrowDown className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-[min(78vw,28rem)] md:w-[min(80vw,30rem)]">
          {/* Warm oven ambient backlight glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-8 rounded-full bg-[radial-gradient(circle,rgba(200,115,58,0.25)_0%,rgba(124,252,58,0.06)_45%,transparent_70%)] blur-2xl"
          />

          <div
            aria-hidden="true"
            className="animate-spin-reverse absolute -inset-[7%] rounded-full border border-dashed border-cream/12"
          />
          <div className="hero-pizza-in absolute inset-0">
            <div className="animate-spin-slow absolute inset-0 overflow-hidden rounded-full shadow-[0_40px_90px_-30px_rgba(0,0,0,0.85)] ring-1 ring-cream/10">
              <Image
                src="/images/pizza-supreme-top.webp"
                alt="بيتزا سوبريم من الشامي"
                fill
                priority
                sizes="(max-width: 768px) 80vw, 480px"
                className="object-cover"
              />
            </div>
          </div>

          {INGREDIENTS.map((ing, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={`intro pointer-events-none absolute ${ing.className}`}
              style={delay(500 + i * 90)}
            >
              <span className="animate-float block" style={{ animationDelay: `${i * 0.7}s` }}>
                <Ingredient kind={ing.kind} />
              </span>
            </span>
          ))}

          <p
            className="intro absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-ink/5 bg-cream px-4 py-2 text-sm font-semibold whitespace-nowrap text-ink shadow-xl md:bottom-6 md:left-0 md:translate-x-0"
            style={delay(700)}
          >
            <Flame className="size-4 text-copper" aria-hidden="true" />
            عجينة طازجة كل يوم
          </p>
        </div>
      </div>
    </section>
  )
}
