"use client"

import type { CSSProperties } from "react"
import Image from "next/image"
import { MessageCircle } from "lucide-react"
import { MENU as STATIC_MENU, getItem as getStaticItem } from "@/lib/menu-data"
import { useLiveMenu } from "@/components/menu/menu-provider"
import { whatsappUrl } from "@/lib/whatsapp"
import { AddToCartButton } from "@/components/cart/add-to-cart-button"
import { Price } from "@/components/menu/price"
import { SectionHeading } from "@/components/ui-kit/section-heading"

export function DessertsSection() {
  const { items, getItem } = useLiveMenu()
  const cakes = items.filter((item) => item.category === "desserts" && item.id !== "cake-wedding")
  const displayedCakes = cakes.length > 0 ? cakes : STATIC_MENU.filter((item) => item.category === "desserts" && item.id !== "cake-wedding")
  const wedding = getItem("cake-wedding") || getStaticItem("cake-wedding")!

  return (
    <section id="desserts" aria-labelledby="desserts-title" className="bg-cream py-16 text-ink md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading
          id="desserts-title"
          index="04"
          label="الحلويات"
          tone="light"
          title={
            <>
              كيك <span className="text-forest">الشامي</span>
            </>
          }
          description="نكهات بتحبها، وجودة بتستاهل تجربها. كيك طازج، كاسات تحلية، وآيس كريم لكل الأوقات."
        />

        <ul className="mt-10 grid grid-cols-2 gap-3 md:mt-14 md:grid-cols-3 md:gap-6">
          {displayedCakes.map((cake, i) => (
            <li
              key={cake.id}
              data-reveal
              style={{ "--delay": `${(i % 3) * 90}ms` } as CSSProperties}
              className="group flex flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-ink/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/10"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={cake.image || "/placeholder.svg"}
                  alt={cake.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-1000 ease-out-expo md:group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-3 md:p-5">
                <div className="flex flex-col gap-1">
                  <h3 className="font-display text-lg font-bold md:text-2xl">{cake.name}</h3>
                  <p className="hidden text-sm text-ink/60 md:block">{cake.description}</p>
                </div>
                <div className="mt-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <Price value={cake.price} tone="light" />
                  <AddToCartButton id={cake.id} label="أضف" className="w-full md:w-auto" />
                </div>
              </div>
            </li>
          ))}
        </ul>

        <article
          data-reveal="clip"
          aria-labelledby="wedding-title"
          className="relative mt-16 overflow-hidden rounded-[2rem] bg-ink text-cream md:mt-24"
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="parallax absolute inset-0">
              <Image
                src={wedding.image || "/placeholder.svg"}
                alt={wedding.name}
                fill
                sizes="(max-width: 1152px) 100vw, 1152px"
                className="object-cover opacity-60"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/10 md:bg-gradient-to-l md:from-ink md:via-ink/75 md:to-transparent" />
          </div>
          <div className="relative flex min-h-[26rem] flex-col justify-end gap-4 p-6 md:min-h-[32rem] md:max-w-xl md:justify-center md:p-14">
            <p className="text-sm font-medium text-neon">بالطلب المسبق</p>
            <h3 id="wedding-title" className="font-display text-4xl font-bold md:text-6xl md:leading-[1.2]">
              {wedding.name}
            </h3>
            <p className="leading-relaxed text-cream/80">
              بكل لحظة تفاصيل أجمل. كيك أفراح مزيّن بالورد حسب طلبك، يبدأ من {wedding.price} شيكل.
            </p>
            <a
              href={whatsappUrl("مرحبا الشامي، بدي أحجز كيكة عرسان. ممكن تفاصيل الأحجام والأسعار؟")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex h-12 items-center gap-2 self-start rounded-full bg-cream px-6 font-semibold text-ink transition-transform duration-300 ease-out-expo active:scale-95 md:hover:-translate-y-0.5"
            >
              <MessageCircle className="size-5" aria-hidden="true" />
              احجز على واتساب
            </a>
          </div>
        </article>
      </div>
    </section>
  )
}
