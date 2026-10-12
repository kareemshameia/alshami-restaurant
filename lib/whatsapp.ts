export const WHATSAPP_NUMBER = "970595346213"
export const PHONE_DISPLAY = "059-534-6213"
export const INSTAGRAM_URL = "https://www.instagram.com/alshamico_"
export const FACEBOOK_URL = "https://www.facebook.com/share/1DfPhBBprd/"

export function whatsappUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export function openWhatsApp(message: string) {
  const url = whatsappUrl(message)
  const inIframe = typeof window !== "undefined" && window.self !== window.top
  if (inIframe) {
    window.open(url, "_blank", "noopener,noreferrer")
  } else {
    window.location.href = url
  }
}

export function formatPrice(value: number) {
  return `${value} شيكل`
}

export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
}
