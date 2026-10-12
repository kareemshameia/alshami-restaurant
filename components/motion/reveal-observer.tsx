"use client"

import { useEffect } from "react"

export function RevealObserver() {
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-visible])")
    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.setAttribute("data-visible", ""))
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.setAttribute("data-visible", "")
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0 },
    )
    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return null
}
