import { Flame } from "lucide-react"
import { cn } from "@/lib/utils"

const DEFAULT_WORDS = ["بيتزا", "برجر", "موهيتو", "كيك", "كالزوني", "سموثي", "آيس كريم", "قشطوطة"]

const TONES = {
  forest: { wrap: "bg-forest text-cream", icon: "text-neon/80" },
  copper: { wrap: "bg-copper text-ink", icon: "text-cream" },
}

export function Marquee({
  words = DEFAULT_WORDS,
  tone = "forest",
  reverse = false,
}: {
  words?: string[]
  tone?: keyof typeof TONES
  reverse?: boolean
}) {
  const colors = TONES[tone]
  const items = words.length < 6 ? [...words, ...words, ...words, ...words] : [...words, ...words]
  const animClass = reverse ? "animate-marquee-reverse" : "animate-marquee"

  return (
    <div dir="ltr" aria-hidden="true" className={cn("relative overflow-hidden py-4 select-none", colors.wrap)}>
      <div className="flex w-max">
        <div className={cn("flex shrink-0 items-center hover:[animation-play-state:paused]", animClass)}>
          {items.map((word, i) => (
            <span
              key={`t1-${i}`}
              className="flex items-center gap-7 px-7 font-display text-2xl font-bold whitespace-nowrap md:text-4xl"
            >
              {word}
              <Flame className={cn("size-5 md:size-6", colors.icon)} aria-hidden="true" />
            </span>
          ))}
        </div>
        <div className={cn("flex shrink-0 items-center hover:[animation-play-state:paused]", animClass)} aria-hidden="true">
          {items.map((word, i) => (
            <span
              key={`t2-${i}`}
              className="flex items-center gap-7 px-7 font-display text-2xl font-bold whitespace-nowrap md:text-4xl"
            >
              {word}
              <Flame className={cn("size-5 md:size-6", colors.icon)} aria-hidden="true" />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
