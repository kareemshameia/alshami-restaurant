"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { MENU as INITIAL_MENU, type MenuItem } from "@/lib/menu-data"
import { dbToMenuItem, supabase, type DBMenuItem } from "@/lib/supabase"

type MenuContextValue = {
  items: MenuItem[]
  getItem: (id: string) => MenuItem | undefined
  isRealtimeActive: boolean
}

const MenuContext = createContext<MenuContextValue>({
  items: INITIAL_MENU,
  getItem: (id: string) => INITIAL_MENU.find((item) => item.id === id),
  isRealtimeActive: false,
})

export function MenuProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<MenuItem[]>(INITIAL_MENU)
  const [isRealtimeActive, setIsRealtimeActive] = useState(false)

  useEffect(() => {
    // 1. Initial fetch from Supabase
    async function loadMenu() {
      try {
        const { data, error } = await supabase
          .from("menu_items")
          .select("*")
          .eq("available", true)
          .order("sort_order", { ascending: true })

        if (!error && data && data.length > 0) {
          const mapped = (data as DBMenuItem[]).map(dbToMenuItem)
          setItems(mapped)
        }
      } catch (err) {
        console.warn("Failed to fetch menu from Supabase, using local fallback", err)
      }
    }

    loadMenu()

    // 2. Realtime WebSocket subscription for live synchronization
    const channel = supabase
      .channel("realtime:menu_items")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu_items" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newItem = dbToMenuItem(payload.new as DBMenuItem)
            if (payload.new.available !== false) {
              setItems((prev) => [...prev.filter((i) => i.id !== newItem.id), newItem])
            }
          } else if (payload.eventType === "UPDATE") {
            const updated = dbToMenuItem(payload.new as DBMenuItem)
            setItems((prev) => {
              if (payload.new.available === false) {
                return prev.filter((i) => i.id !== updated.id)
              }
              const exists = prev.some((i) => i.id === updated.id)
              if (exists) {
                return prev.map((i) => (i.id === updated.id ? updated : i))
              }
              return [...prev, updated]
            })
          } else if (payload.eventType === "DELETE") {
            setItems((prev) => prev.filter((i) => i.id !== payload.old.id))
          }
        },
      )
      .subscribe((status) => {
        setIsRealtimeActive(status === "SUBSCRIBED")
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const getItem = (id: string) => items.find((item) => item.id === id)

  return (
    <MenuContext.Provider value={{ items, getItem, isRealtimeActive }}>
      {children}
    </MenuContext.Provider>
  )
}

export function useLiveMenu() {
  return useContext(MenuContext)
}
