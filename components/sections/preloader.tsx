import { LogoMark } from "@/components/brand/logo-mark"

export function Preloader() {
  return (
    <div aria-hidden="true" className="preloader fixed inset-0 z-[100] flex items-center justify-center bg-cream">
      <div className="flex flex-col items-center gap-5">
        <LogoMark className="w-20 md:w-24" title="" />
        <p className="preloader-word font-display text-3xl font-bold text-forest md:text-4xl">الشامي</p>
      </div>
    </div>
  )
}
