import type { Metadata, Viewport } from "next"
import { Alexandria, Readex_Pro } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const heading = Alexandria({ subsets: ["arabic", "latin"], variable: "--font-heading", display: "swap" })
const body = Readex_Pro({ subsets: ["arabic", "latin"], variable: "--font-body", display: "swap" })

const title = "الشامي | Alshami — بيتزا، برجر، عصائر وحلويات في دير البلح"
const description =
  "مطعم الشامي في دير البلح – غزة: ملوك الطعم في البيتزا، برجر بالجبنة السايحة، موهيتو، عصائر وكيك. تصفّح المنيو والأسعار واطلب مباشرة عبر واتساب."

export const metadata: Metadata = {
  metadataBase: new URL("https://alshami-restaurant.com"),
  title,
  description,
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }], apple: "/apple-icon.png" },
  openGraph: {
    title,
    description,
    type: "website",
    locale: "ar_PS",
    images: [{ url: "/images/og.jpg", width: 1200, height: 630, alt: "بيتزا الشامي" }],
  },
}

export const viewport: Viewport = {
  themeColor: "#0e1a14",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

const restaurantSchema = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "مطعم الشامي | Alshami",
  image: "/images/hero-pizza.webp",
  telephone: "+970595346213",
  address: {
    "@type": "PostalAddress",
    streetAddress: "مقابل المدفع · النصيرات",
    addressLocality: "دير البلح",
    addressRegion: "غزة",
    addressCountry: "PS",
  },
  servesCuisine: ["Pizza", "Burgers", "Fast Food", "Desserts", "Beverages"],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={`${heading.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
        />
      </head>
      <body>
        {children}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
