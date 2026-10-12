import { cn } from "@/lib/utils"

export function SectionHeading({
  id,
  index,
  label,
  title,
  description,
  tone = "dark",
  align = "start",
  className,
}: {
  id: string
  index: string
  label: string
  title: React.ReactNode
  description?: React.ReactNode
  tone?: "dark" | "light"
  align?: "start" | "center"
  className?: string
}) {
  const dark = tone === "dark"
  return (
    <div
      data-reveal
      className={cn("flex flex-col gap-4", align === "center" ? "items-center text-center" : "items-start", className)}
    >
      <p className={cn("flex items-center gap-3 text-sm font-medium", dark ? "text-cream/60" : "text-ink/55")}>
        <span className="font-display tabular-nums text-copper">{index}</span>
        <span aria-hidden="true" className="h-px w-8 bg-current opacity-40" />
        <span>{label}</span>
      </p>
      <h2
        id={id}
        className={cn("font-display text-4xl font-bold md:text-6xl md:leading-[1.2]", dark ? "text-cream" : "text-ink")}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "max-w-xl text-base leading-relaxed md:text-lg md:leading-relaxed",
            dark ? "text-cream/70" : "text-ink/65",
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}
