import type { CSSProperties } from "react"
import Image from "next/image"
import { Quote } from "lucide-react"
import { InstagramIcon } from "@/components/brand/social-icons"
import { CountUp } from "@/components/motion/count-up"
import { INSTAGRAM_URL } from "@/lib/whatsapp"

const STATS = [
  { value: 683, suffix: "+", label: "متابع على إنستغرام" },
  { value: 18, suffix: "+", label: "صنف بالمنيو" },
  { value: 100, suffix: "%", label: "طازج كل يوم" },
]

const QUOTES = [
  "البيتزا عندهم ولا غلطة، الجبنة بتمطّ لآخر لقمة.",
  "الموهيتو الأزرق صار إدماني كل يوم بعد الدوام.",
  "كيكة اللوتس كانت أحلى إشي بعيد الميلاد.",
  "البرجر بالجبنة السايحة… ضربة ساحقة فعلاً.",
]

export function SocialProof() {
  return (
    <section aria-labelledby="proof-title" className="bg-ink py-16 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div data-reveal>
            <p className="text-sm font-medium tracking-wide text-neon" dir="ltr">
              Alshami is back
            </p>
            <h2 id="proof-title" className="mt-3 font-display text-4xl font-bold text-cream md:text-6xl md:leading-[1.2]">
              شباب دير البلح
              <br />
              <span className="text-copper">بحبّوا الشامي</span>
            </h2>
            <dl className="mt-10 grid grid-cols-3 gap-4 border-y border-cream/10 py-6">
              {STATS.map((s) => (
                <div key={s.label} className="flex flex-col gap-1">
                  <dt className="order-2 text-xs text-cream/55 md:text-sm">{s.label}</dt>
                  <dd className="order-1 font-display text-3xl font-bold text-neon md:text-5xl" dir="ltr">
                    <CountUp value={s.value} />
                    {s.suffix}
                  </dd>
                </div>
              ))}
            </dl>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-full border border-cream/15 px-6 font-medium text-cream transition-colors duration-300 hover:border-cream/40"
            >
              <InstagramIcon className="size-5" />
              تابعنا <span dir="ltr">@alshamico_</span>
            </a>
          </div>

          <div
            data-reveal="clip"
            className="relative aspect-[4/5] overflow-hidden rounded-[2rem] ring-1 ring-cream/10 md:aspect-square"
          >
            <div className="parallax absolute inset-0">
              <Image
                src="/images/store-sign.webp"
                alt="لافتة النيون الخضراء لمطعم الشامي من داخل المحل"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-[50%_45%]"
              />
            </div>
          </div>
        </div>

        <ul className="no-scrollbar -mx-5 mt-14 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
          {QUOTES.map((q, i) => (
            <li
              key={q}
              data-reveal
              style={{ "--delay": `${i * 90}ms` } as CSSProperties}
              className="flex w-[78vw] shrink-0 snap-center flex-col gap-4 rounded-3xl bg-ink-soft p-6 ring-1 ring-cream/8 md:w-auto"
            >
              <Quote className="size-5 text-copper" aria-hidden="true" />
              <p className="leading-relaxed text-cream/85">{q}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
