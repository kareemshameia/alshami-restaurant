import { createClient } from "@supabase/supabase-js"
import type { MenuItem } from "./menu-data"

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://winbfjzjdkzzvonjkbxn.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpbmJmanpqZGt6enZvbmprYnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NDU2NjUsImV4cCI6MjEwNzAyMTY2NX0.biWTmAXSNxrzw-w3sPc_PfcITX7xmvNz7hrXl_FLoAA"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type DBMenuItem = {
  id: string
  name: string
  description: string
  category: "pizza" | "fastfood" | "drinks" | "desserts"
  image: string
  top_image?: string | null
  price: number
  sizes?: { label: string; price: number }[]
  tag?: string | null
  available?: boolean
  sort_order?: number
  created_at?: string
  updated_at?: string
}

export function dbToMenuItem(row: DBMenuItem): MenuItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    category: row.category,
    image: row.image,
    topImage: row.top_image || undefined,
    price: Number(row.price),
    sizes: row.sizes && row.sizes.length > 0 ? row.sizes : undefined,
    tag: row.tag || undefined,
  }
}
