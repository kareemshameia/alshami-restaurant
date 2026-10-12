"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { getItem } from "@/lib/menu-data"
import { useLiveMenu } from "@/components/menu/menu-provider"

export type CartLine = {
  key: string
  id: string
  size?: string
  quantity: number
}

type CartContextValue = {
  lines: CartLine[]
  count: number
  total: number
  isOpen: boolean
  open: () => void
  close: () => void
  add: (id: string, size?: string) => void
  setQuantity: (key: string, quantity: number) => void
  remove: (key: string) => void
  clear: () => void
  priceOf: (line: CartLine) => number
}

const CartContext = createContext<CartContextValue | null>(null)
const STORAGE_KEY = "alshami-cart"
const MAX_QTY = 50

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { getItem: getLiveItem } = useLiveMenu()
  const [lines, setLines] = useState<CartLine[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  const linePrice = (line: CartLine) => {
    const item = getLiveItem(line.id) || getItem(line.id)
    if (!item) return 0
    const size = item.sizes?.find((s) => s.label === line.size)
    return size ? size.price : item.price
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[]
        setLines(
          parsed
            .filter((l) => getItem(l.id) && Number.isInteger(l.quantity) && l.quantity > 0)
            .map((l) => ({ ...l, quantity: Math.min(MAX_QTY, l.quantity) })),
        )
      }
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  }, [lines, hydrated])

  const add = useCallback((id: string, size?: string) => {
    const key = size ? `${id}::${size}` : id
    setLines((prev) => {
      const existing = prev.find((l) => l.key === key)
      if (existing) {
        return prev.map((l) => (l.key === key ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + 1) } : l))
      }
      return [...prev, { key, id, size, quantity: 1 }]
    })
  }, [])

  const setQuantity = useCallback((key: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.key !== key)
        : prev.map((l) => (l.key === key ? { ...l, quantity: Math.min(MAX_QTY, Math.floor(quantity)) } : l)),
    )
  }, [])

  const remove = useCallback((key: string) => setLines((prev) => prev.filter((l) => l.key !== key)), [])
  const clear = useCallback(() => setLines([]), [])
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, l) => sum + l.quantity, 0)
    const total = lines.reduce((sum, l) => sum + linePrice(l) * l.quantity, 0)
    return { lines, count, total, isOpen, open, close, add, setQuantity, remove, clear, priceOf: linePrice }
  }, [lines, isOpen, open, close, add, setQuantity, remove, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
