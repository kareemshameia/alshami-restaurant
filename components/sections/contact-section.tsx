import { Clock, MapPin, MessageCircle, Phone } from "lucide-react"
import { FacebookIcon, InstagramIcon } from "@/components/brand/social-icons"
import { FACEBOOK_URL, INSTAGRAM_URL, PHONE_DISPLAY, WHATSAPP_NUMBER, whatsappUrl } from "@/lib/whatsapp"
import { SectionHeading } from "@/components/ui-kit/section-heading"

const socialClass =
  "flex size-12 items-center justify-center rounded-full border border-cream/20 transition-colors duration-300 hover:border-cream/50"

export function ContactSection() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="bg-forest py-16 text-cream md:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-2 md:px-8">
        <div className="flex flex-col gap-8">
          <SectionHeading
            id="contact-title"
            index="06"
            label="زورنا"
            title={
              <>
                تعال جرّب <span className="text-copper">بنفسك</span>
              </>
            }
          />
          <ul data-reveal className="flex flex-col gap-5 text-lg">
            <li className="flex items-start gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cream/8">
                <MapPin className="size-5 text-neon" aria-hidden="true" />
              </span>
              <span className="pt-1.5">دير البلح – غزة، مقابل المدفع · النصيرات</span>
            </li>
            <li className="flex items-center gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cream/8">
                <Phone className="size-5 text-neon" aria-hidden="true" />
              </span>
              <a href={`tel:+${WHATSAPP_NUMBER}`} className="transition-colors hover:text-neon" dir="ltr">
                {PHONE_DISPLAY}
              </a>
            </li>
            <li className="flex items-center gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cream/8">
                <Clock className="size-5 text-neon" aria-hidden="true" />
              </span>
              <span>يومياً، من الصبح لآخر الليل</span>
            </li>
          </ul>
          <div data-reveal className="flex flex-wrap items-center gap-3">
            <a
              href={whatsappUrl("مرحبا الشامي، عندي استفسار")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-cream px-6 font-semibold text-ink transition-transform duration-300 ease-out-expo active:scale-95 md:hover:-translate-y-0.5"
            >
              <MessageCircle className="size-5" aria-hidden="true" />
              راسلنا على واتساب
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="إنستغرام الشامي" className={socialClass}>
              <InstagramIcon className="size-5" />
            </a>
            <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" aria-label="فيسبوك الشامي" className={socialClass}>
              <FacebookIcon className="size-5" />
            </a>
          </div>
        </div>
        <div data-reveal="clip" className="min-h-80 overflow-hidden rounded-[2rem] ring-1 ring-cream/15">
          <iframe
            title="موقع مطعم الشامي على الخريطة - دير البلح"
            src="https://www.google.com/maps?q=Deir%20al-Balah%2C%20Gaza&z=14&output=embed"
            className="size-full min-h-80 grayscale-[30%]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  )
}
