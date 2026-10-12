import { cn } from "@/lib/utils"

export type Tone = "dark" | "light" | "vivid"

const VALUE_TONE: Record<Tone, string> = {
  dark: "text-neon",
  light: "text-forest",
  vivid: "text-cream",
}

const UNIT_TONE: Record<Tone, string> = {
  dark: "text-cream/55",
  light: "text-ink/50",
  vivid: "text-cream/70",
}

export function Price({ value, tone = "dark", className }: { value: number; tone?: Tone; className?: string }) {
  return (
    <p className={cn("flex items-baseline gap-1.5", className)}>
      <span className={cn("font-display text-2xl font-bold tabular-nums", VALUE_TONE[tone])}>{value}</span>
      <span className={cn("text-sm", UNIT_TONE[tone])}>شيكل</span>
    </p>
  )
}
