import { LogoMark } from "./logo-mark"
import { cn } from "@/lib/utils"

export function BrandLockup({ className, size = "md" }: { className?: string; size?: "md" | "lg" }) {
  const large = size === "lg"
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-2xl bg-cream shadow-[inset_0_0_0_1px_rgba(14,26,20,0.06)]",
          large ? "size-16 p-2.5" : "size-10 p-1.5",
        )}
      >
        <LogoMark className="h-full w-auto" title="" />
      </span>
      <span className="flex flex-col">
        <span className={cn("font-display font-bold leading-tight text-cream", large ? "text-3xl" : "text-xl")}>
          الشامي
        </span>
        <span
          className={cn(
            "font-sans font-semibold leading-none tracking-[0.32em] text-neon/90",
            large ? "mt-1 text-xs" : "text-[9px]",
          )}
        >
          ALSHAMI
        </span>
      </span>
    </span>
  )
}
