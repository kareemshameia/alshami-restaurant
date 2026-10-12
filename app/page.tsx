import { MenuProvider } from "@/components/menu/menu-provider"
import { CartProvider } from "@/components/cart/cart-provider"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { FloatingActions } from "@/components/cart/floating-actions"
import { MobileDock } from "@/components/cart/mobile-dock"
import { RevealObserver } from "@/components/motion/reveal-observer"
import { Preloader } from "@/components/sections/preloader"
import { SiteHeader } from "@/components/sections/site-header"
import { Hero } from "@/components/sections/hero"
import { Marquee } from "@/components/sections/marquee"
import { PizzaWheel } from "@/components/sections/pizza-wheel"
import { BurgerSection } from "@/components/sections/burger-section"
import { JuicesSection } from "@/components/sections/juices-section"
import { DessertsSection } from "@/components/sections/desserts-section"
import { MenuSection } from "@/components/sections/menu-section"
import { SocialProof } from "@/components/sections/social-proof"
import { ContactSection } from "@/components/sections/contact-section"
import { SiteFooter } from "@/components/sections/site-footer"

export default function Home() {
  return (
    <MenuProvider>
      <CartProvider>
        <Preloader />
        <SiteHeader />
        <main>
          <Hero />
          <Marquee />
          <PizzaWheel />
          <BurgerSection />
          <JuicesSection />
          <DessertsSection />
          <Marquee tone="copper" reverse words={["طاقة ما بتخلص", "حيوية بدون حدود", "ضربة ساحقة في عالم الطعم", "الشامي وبس"]} />
          <MenuSection />
          <SocialProof />
          <ContactSection />
        </main>
        <SiteFooter />
        <FloatingActions />
        <MobileDock />
        <CartDrawer />
        <RevealObserver />
      </CartProvider>
    </MenuProvider>
  )
}
