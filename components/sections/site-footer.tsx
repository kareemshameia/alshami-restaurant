import { BrandLockup } from "@/components/brand/brand-lockup"

export function SiteFooter() {
  return (
    <footer className="bg-ink pt-14 pb-32 text-cream md:pb-14">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-5 text-center md:px-8">
        <BrandLockup size="lg" />
        <p className="text-sm text-cream/55">حلويات · مخبوزات · عصائر · فاست فود</p>
        <p className="text-xs text-cream/35">© {new Date().getFullYear()} الشامي، جميع الحقوق محفوظة</p>
      </div>
    </footer>
  )
}
