"use client"

import { useEffect, useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  DollarSign,
  Edit3,
  Eye,
  EyeOff,
  Flame,
  Lock,
  LogOut,
  Package,
  Palette,
  Plus,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  Trash2,
  Utensils,
  X,
  ExternalLink,
  AlertTriangle,
  SlidersHorizontal,
} from "lucide-react"
import { supabase, type DBMenuItem } from "@/lib/supabase"
import { ImageUploader } from "@/components/admin/image-uploader"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  { id: "all", label: "الكل", emoji: "🍽️" },
  { id: "pizza", label: "بيتزا", emoji: "🍕" },
  { id: "fastfood", label: "برجر وفاست فود", emoji: "🍔" },
  { id: "drinks", label: "عصائر ومشروبات", emoji: "🍹" },
  { id: "desserts", label: "حلويات وكيك", emoji: "🍰" },
]

const COLOR_PRESETS = [
  { name: "أزرق ملكي", hex: "#0b3a8c" },
  { name: "بنفسجي ليلي", hex: "#4b1d7a" },
  { name: "برتقالي شمسي", hex: "#a8481a" },
  { name: "توتي وزهري", hex: "#a12f5d" },
  { name: "زمردي فاخر", hex: "#165b33" },
  { name: "فيروزي عميق", hex: "#0d5c75" },
  { name: "أحمر قرمزي", hex: "#7c1a22" },
  { name: "كلاسيكي داكن", hex: "#111827" },
]

function QuickSizePriceInput({
  label,
  price,
  onSave,
}: {
  label: string
  price: number
  onSave: (val: number) => Promise<void>
}) {
  const [val, setVal] = useState(String(price))
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle")

  useEffect(() => {
    setVal(String(price))
  }, [price])

  const commit = async () => {
    const num = parseFloat(val)
    if (isNaN(num) || num <= 0 || num === Number(price)) {
      setVal(String(price))
      return
    }
    setStatus("saving")
    await onSave(num)
    setStatus("saved")
    setTimeout(() => setStatus("idle"), 2500)
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-xl border bg-ink px-2.5 py-1 text-xs transition-all duration-200",
        status === "saved"
          ? "border-neon bg-forest/25 text-neon shadow-[0_0_10px_rgba(124,252,58,0.25)]"
          : status === "saving"
          ? "border-copper/60 bg-copper/10"
          : "border-cream/15 focus-within:border-neon focus-within:ring-1 focus-within:ring-neon/30"
      )}
    >
      <span className="font-semibold text-cream/70">{label}:</span>
      <input
        type="number"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur()
          }
        }}
        className="w-12 bg-transparent text-center font-display text-sm font-bold text-neon outline-none"
      />
      <span className="text-[10px] text-cream/50">₪</span>
      {status === "saved" && (
        <span className="text-[10px] font-bold text-neon animate-in fade-in">✓</span>
      )}
    </div>
  )
}

function QuickPriceInput({
  item,
  onSave,
}: {
  item: DBMenuItem
  onSave: (val: number) => Promise<void>
}) {
  const [val, setVal] = useState(String(item.price))
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle")

  useEffect(() => {
    setVal(String(item.price))
  }, [item.price])

  const commit = async () => {
    const num = parseFloat(val)
    if (isNaN(num) || num <= 0 || num === Number(item.price)) {
      setVal(String(item.price))
      return
    }
    setStatus("saving")
    await onSave(num)
    setStatus("saved")
    setTimeout(() => setStatus("idle"), 2500)
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-cream/50">
        {item.sizes && item.sizes.length > 0 ? "السعر يبدأ من:" : "السعر:"}
      </span>
      <div
        className={cn(
          "flex items-center rounded-xl border bg-ink px-2.5 py-1 transition-all duration-200",
          status === "saved"
            ? "border-neon bg-forest/20 text-neon shadow-[0_0_10px_rgba(124,252,58,0.2)]"
            : status === "saving"
            ? "border-copper/60 bg-copper/10"
            : "border-cream/15 focus-within:border-neon focus-within:ring-1 focus-within:ring-neon/30"
        )}
      >
        <input
          type="number"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur()
            }
          }}
          className="w-14 bg-transparent font-display text-sm font-bold text-neon outline-none"
        />
        <span className="text-xs font-semibold text-cream/50">₪</span>
      </div>
      {status === "saved" && (
        <span className="text-[10px] font-bold text-neon animate-in fade-in zoom-in-75">
          ✓ تم
        </span>
      )}
    </div>
  )
}

export default function AdminPage() {
  // Authentication State
  const [pin, setPin] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState("")

  // Data State
  const [items, setItems] = useState<DBMenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [search, setSearch] = useState("")
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("")

  // View Mode: 'menu' (Default Menu Manager) | 'showcase' (Drinks Showcase Control)
  const [viewMode, setViewMode] = useState<"menu" | "showcase">("menu")

  // Showcase Configuration State
  const [showcaseConfig, setShowcaseConfig] = useState<{
    title: string
    highlight: string
    description: string
    items: {
      id: string
      bg: string
      slogan: string
      name?: string
      image?: string
      description?: string
    }[]
  }>({
    title: "اشرب الشامي",
    highlight: "الشامي",
    description: "موهيتو منعش، عصير الدبدوب، وسموثي بيصحصح… اختار نكهتك.",
    items: [
      { id: "mojito-blue", bg: "#0b3a8c", slogan: "طاقة ما بتخلص" },
      { id: "mojito-purple", bg: "#4b1d7a", slogan: "حيوية بدون حدود" },
      { id: "bear-juice", bg: "#a8481a", slogan: "دبدوب الشامي بثلاث نكهات" },
      { id: "smoothie", bg: "#a12f5d", slogan: "سموثي بيصحصح" },
    ],
  })
  const [loadingShowcase, setLoadingShowcase] = useState(false)
  const [savingShowcase, setSavingShowcase] = useState(false)

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<DBMenuItem | null>(null)

  // Form Controlled States
  const [formName, setFormName] = useState("")
  const [formCategory, setFormCategory] = useState<"pizza" | "fastfood" | "drinks" | "desserts">("pizza")
  const [formDescription, setFormDescription] = useState("")
  const [formPrice, setFormPrice] = useState("")
  const [formTag, setFormTag] = useState("")
  const [formImage, setFormImage] = useState("")
  const [hasSizes, setHasSizes] = useState(false)
  const [sizesList, setSizesList] = useState<{ label: string; price: number }[]>([])
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [isPending, startTransition] = useTransition()

  // 1. Check stored auth
  useEffect(() => {
    const saved = sessionStorage.getItem("alshami_admin_auth")
    if (saved === "true") {
      setIsAuthenticated(true)
    }
  }, [])

  // 2. Fetch all menu items from Supabase
  const fetchItems = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("sort_order", { ascending: true })

    if (!error && data) {
      setItems(data as DBMenuItem[])
    }
    setLoading(false)
  }

  // 3. Fetch Drinks Showcase config from Supabase settings
  const fetchShowcase = async () => {
    setLoadingShowcase(true)
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "drinks_showcase")
        .single()
      if (!error && data && data.value) {
        const parsed = typeof data.value === "string" ? JSON.parse(data.value) : data.value
        if (parsed && Array.isArray(parsed.items)) {
          setShowcaseConfig(parsed)
        }
      }
    } catch (e) {
      console.warn("Failed to fetch showcase config", e)
    } finally {
      setLoadingShowcase(false)
    }
  }

  // 4. Save Drinks Showcase config to Supabase settings
  const saveShowcase = async () => {
    setSavingShowcase(true)
    try {
      const jsonString = JSON.stringify(showcaseConfig)
      const { error } = await supabase
        .from("settings")
        .upsert({
          key: "drinks_showcase",
          value: jsonString,
        })
      if (error) {
        console.error("Failed to save showcase settings:", error)
        showNotification("❌ تعذر حفظ إعدادات السلايدر")
      } else {
        showNotification("⚡ تم حفظ وتحديث سلايدر العصائر في الموقع فوراً!")
      }
    } catch (e) {
      console.error("Error saving showcase:", e)
      showNotification("❌ حدث خطأ أثناء الحفظ")
    } finally {
      setSavingShowcase(false)
    }
  }

  const handleAddShowcaseItem = () => {
    const availableDrinks = items.filter((i) => i.category === "drinks")
    const unusedDrink = availableDrinks.find(
      (d) => !showcaseConfig.items.some((item) => item.id === d.id)
    )
    const newId = unusedDrink ? unusedDrink.id : availableDrinks[0]?.id || "mojito-blue"
    const newName = unusedDrink ? unusedDrink.name : availableDrinks[0]?.name || "مشروب منعش"
    const newImage = unusedDrink ? unusedDrink.image : availableDrinks[0]?.image || "/placeholder.svg"

    setShowcaseConfig((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: newId,
          name: newName,
          image: newImage,
          bg: "#165b33",
          slogan: "انتعاش ولذة طبيعية",
        },
      ],
    }))
  }

  const handleUpdateShowcaseItem = (
    index: number,
    patch: Partial<{ id: string; bg: string; slogan: string; name?: string; image?: string; description?: string }>
  ) => {
    setShowcaseConfig((prev) => {
      const newItems = [...prev.items]
      newItems[index] = { ...newItems[index], ...patch }
      return { ...prev, items: newItems }
    })
  }

  const handleRemoveShowcaseItem = (index: number) => {
    if (showcaseConfig.items.length <= 1) {
      showNotification("⚠️ يجب أن يحتوي السلايدر على مشروب واحد على الأقل")
      return
    }
    setShowcaseConfig((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  const handleMoveShowcaseItem = (index: number, direction: "up" | "down") => {
    setShowcaseConfig((prev) => {
      const newItems = [...prev.items]
      const targetIndex = direction === "up" ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= newItems.length) return prev
      const temp = newItems[index]
      newItems[index] = newItems[targetIndex]
      newItems[targetIndex] = temp
      return { ...prev, items: newItems }
    })
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchItems()
      fetchShowcase()
    }
  }, [isAuthenticated])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (pin === "1234" || pin === "alshami2026") {
      sessionStorage.setItem("alshami_admin_auth", "true")
      setIsAuthenticated(true)
      setAuthError("")
    } else {
      setAuthError("رمز المرور غير صحيح. الرمز الافتراضي هو: 1234")
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("alshami_admin_auth")
    setIsAuthenticated(false)
  }

  const showNotification = (msg: string) => {
    setSaveSuccessMsg(msg)
    setTimeout(() => setSaveSuccessMsg(""), 4000)
  }

  // Quick Price update directly from the card
  const handleQuickPriceChange = async (id: string, newPrice: number) => {
    if (isNaN(newPrice) || newPrice <= 0) return

    const targetItem = items.find((i) => i.id === id)
    if (!targetItem || targetItem.price === newPrice) return

    // If item has sizes, sync the base size price as well
    let updatedSizes = targetItem.sizes
    if (Array.isArray(updatedSizes) && updatedSizes.length > 0) {
      updatedSizes = updatedSizes.map((s, idx) => (idx === 0 ? { ...s, price: newPrice } : s))
    }

    // Optimistic instant state update
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, price: newPrice, sizes: updatedSizes } : item
      )
    )

    try {
      const updatePayload: any = {
        price: newPrice,
        updated_at: new Date().toISOString(),
      }
      if (updatedSizes) {
        updatePayload.sizes = updatedSizes
      }

      const { error } = await supabase
        .from("menu_items")
        .update(updatePayload)
        .eq("id", id)

      if (error) {
        console.error("Price update error:", error)
        showNotification("❌ تعذر تحديث السعر في قاعدة البيانات")
        fetchItems()
      } else {
        showNotification(`⚡ تم تحديث سعر (${targetItem.name}) إلى ${newPrice}₪ فوراً!`)
      }
    } catch (err) {
      console.error("Price update error:", err)
      fetchItems()
    }
  }

  // Quick Size Price update directly from the card
  const handleQuickSizePriceChange = async (
    id: string,
    sizeIndex: number,
    newSizePrice: number
  ) => {
    if (isNaN(newSizePrice) || newSizePrice <= 0) return

    const targetItem = items.find((i) => i.id === id)
    if (!targetItem || !Array.isArray(targetItem.sizes)) return

    const currentSize = targetItem.sizes[sizeIndex]
    if (!currentSize || Number(currentSize.price) === newSizePrice) return

    const updatedSizes = targetItem.sizes.map((s, idx) =>
      idx === sizeIndex ? { ...s, price: newSizePrice } : s
    )

    // If changing the first size, sync base price too
    const updatedBasePrice = sizeIndex === 0 ? newSizePrice : Number(targetItem.price)

    // Instant optimistic update on UI
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, price: updatedBasePrice, sizes: updatedSizes }
          : item
      )
    )

    try {
      const updatePayload: any = {
        price: updatedBasePrice,
        sizes: updatedSizes,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from("menu_items")
        .update(updatePayload)
        .eq("id", id)

      if (error) {
        console.error("Size price update error:", error)
        showNotification("❌ تعذر حفظ السعر في قاعدة البيانات")
        fetchItems()
      } else {
        showNotification(
          `⚡ تم تحديث سعر (${targetItem.name} — ${currentSize.label}) إلى ${newSizePrice}₪ فوراً!`
        )
      }
    } catch (err) {
      console.error("Size price update error:", err)
      fetchItems()
    }
  }

  // Toggle availability (In stock / Out of stock)
  const toggleAvailable = async (id: string, current: boolean) => {
    startTransition(async () => {
      const next = !current
      const { error } = await supabase
        .from("menu_items")
        .update({ available: next, updated_at: new Date().toISOString() })
        .eq("id", id)

      if (!error) {
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, available: next } : item)))
        showNotification(next ? "✅ تم تفعيل الصنف للزبائن" : "⚠️ تم إيقاف الصنف مؤقتاً (نفدت الكمية)")
      }
    })
  }

  // Delete item
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف (${name}) نهائياً من قائمة الطعام؟`)) return
    startTransition(async () => {
      const { error } = await supabase.from("menu_items").delete().eq("id", id)
      if (!error) {
        setItems((prev) => prev.filter((item) => item.id !== id))
        showNotification(`تم حذف (${name}) بنجاح`)
      }
    })
  }

  // Open Modal for adding new item
  const openNewItemModal = () => {
    setEditingItem(null)
    setFormName("")
    setFormCategory("pizza")
    setFormDescription("")
    setFormPrice("")
    setFormTag("")
    setFormImage("/images/hero-pizza.webp")
    setHasSizes(false)
    setSizesList([
      { label: "صغير", price: 20 },
      { label: "وسط", price: 30 },
      { label: "كبير", price: 40 },
    ])
    setFormError(null)
    setIsModalOpen(true)
  }

  // Open Modal for editing existing item
  const openEditItemModal = (item: DBMenuItem) => {
    setEditingItem(item)
    setFormName(item.name || "")
    setFormCategory(item.category || "pizza")
    setFormDescription(item.description || "")
    setFormPrice(item.price ? String(item.price) : "")
    setFormTag(item.tag || "")
    setFormImage(item.image || "/images/hero-pizza.webp")

    const existingSizes = item.sizes && Array.isArray(item.sizes) && item.sizes.length > 0
    setHasSizes(existingSizes)
    if (existingSizes) {
      setSizesList(item.sizes as { label: string; price: number }[])
    } else {
      setSizesList([
        { label: "صغير", price: Number(item.price) || 20 },
        { label: "وسط", price: Number(item.price) ? Number(item.price) + 10 : 30 },
        { label: "كبير", price: Number(item.price) ? Number(item.price) + 20 : 40 },
      ])
    }
    setFormError(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormError(null)
  }

  // Handle Save (Add or Update)
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const cleanName = formName.trim()
    if (!cleanName) {
      setFormError("يرجى كتابة اسم الوجبة أولاً")
      return
    }

    const numPrice = parseFloat(formPrice)
    if (isNaN(numPrice) || numPrice <= 0) {
      setFormError("يرجى إدخال سعر صحيح للوجبة")
      return
    }

    setIsSaving(true)

    try {
      const finalSizes =
        hasSizes && sizesList.length > 0
          ? sizesList.map((s, idx) => (idx === 0 ? { ...s, price: numPrice } : s))
          : []

      const payload = {
        name: cleanName,
        category: formCategory,
        description: formDescription.trim(),
        price: numPrice,
        tag: formTag.trim() || null,
        image: finalImage,
        sizes: finalSizes,
        updated_at: new Date().toISOString(),
      }

      if (editingItem) {
        // UPDATE existing
        const { error } = await supabase
          .from("menu_items")
          .update(payload)
          .eq("id", editingItem.id)

        if (error) throw error

        setItems((prev) =>
          prev.map((item) => (item.id === editingItem.id ? { ...item, ...payload } : item))
        )
        closeModal()
        showNotification(`✅ تم تحديث (${cleanName}) بنجاح!`)
      } else {
        // INSERT new
        const autoId = `item-${Date.now()}`
        const newRecord: DBMenuItem = {
          ...payload,
          id: autoId,
          available: true,
          sort_order: items.length + 1,
        }

        const { error } = await supabase.from("menu_items").insert(newRecord)
        if (error) throw error

        setItems((prev) => [...prev, newRecord])
        closeModal()
        showNotification(`🎉 تمت إضافة (${cleanName}) إلى المنيو بنجاح!`)
      }
    } catch (err: any) {
      console.error("Save error:", err)
      setFormError(err.message || "حدث خطأ أثناء الحفظ في قاعدة البيانات. يرجى المحاولة ثانية.")
    } finally {
      setIsSaving(false)
    }
  }

  // Sizes List helpers
  const handleSizeChange = (index: number, field: "label" | "price", val: any) => {
    setSizesList((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: field === "price" ? parseFloat(val) || 0 : val }
      return copy
    })
  }

  const handleAddSizeRow = () => {
    setSizesList((prev) => [...prev, { label: "حجم جديد", price: 25 }])
  }

  const handleRemoveSizeRow = (index: number) => {
    setSizesList((prev) => prev.filter((_, i) => i !== index))
  }

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCategory = activeTab === "all" || item.category === activeTab
    const matchesSearch =
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  // Quick stats
  const totalCount = items.length
  const availableCount = items.filter((i) => i.available !== false).length
  const outOfStockCount = totalCount - availableCount

  // Login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink p-4 font-sans text-cream">
        <div className="w-full max-w-sm rounded-3xl border border-cream/15 bg-ink-soft p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-copper/15 text-copper">
              <Lock className="size-7" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold text-cream">لوحة تحكم مطعم الشامي</h1>
            <p className="mt-1 text-xs text-cream/60">أدخل رمز الدخول (PIN) للتحكم في الموقع</p>
          </div>

          <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-4">
            <div>
              <input
                type="password"
                maxLength={12}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="الرمز الافتراضي: 1234"
                className="h-12 w-full text-center tracking-widest text-lg font-bold rounded-xl border border-cream/20 bg-ink px-4 text-cream focus:border-neon focus:outline-none"
                autoFocus
              />
              {authError && <p className="mt-2 text-center text-xs font-medium text-red-400">{authError}</p>}
            </div>

            <button
              type="submit"
              className="h-12 rounded-xl bg-copper font-display text-sm font-bold text-ink shadow-lg transition-transform active:scale-95"
            >
              دخول للوحة التحكم
            </button>

            <Link
              href="/"
              className="mt-2 flex items-center justify-center gap-1.5 text-xs text-cream/50 hover:text-cream transition-colors"
            >
              <span>العودة للموقع الرئيسي</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink text-cream selection:bg-neon selection:text-ink">
      {/* Toast Notification */}
      {saveSuccessMsg && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2.5 rounded-2xl border border-neon/40 bg-ink/95 px-5 py-3.5 text-sm font-bold text-neon shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="size-5 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-cream/10 bg-ink/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="group flex items-center gap-2" title="الرجوع للموقع">
              <span className="flex size-9 items-center justify-center rounded-xl bg-copper/20 text-copper font-bold group-hover:scale-105 transition-transform">
                ش
              </span>
              <div>
                <h1 className="font-display text-base font-bold text-cream flex items-center gap-1.5">
                  لوحة تحكم الشامي
                  <span className="rounded-full bg-neon/15 px-2 py-0.5 text-[10px] font-bold text-neon">
                    مزامنة فورية
                  </span>
                </h1>
                <p className="text-[11px] text-cream/50">إدارة الوجبات والأسعار والصور</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/orders-admin"
              className="flex items-center gap-1.5 rounded-xl border border-neon/30 bg-neon/10 px-3 py-2 text-xs font-semibold text-neon hover:bg-neon/20 transition-colors"
            >
              <span>🧾 كاشير الطلبات</span>
            </Link>

            <Link
              href="/menu"
              target="_blank"
              className="hidden md:flex items-center gap-1.5 rounded-xl border border-copper/30 bg-copper/10 px-3 py-2 text-xs font-semibold text-copper hover:bg-copper/20 transition-colors"
            >
              <span>🍽️ منيو الطاولات</span>
              <ExternalLink className="size-3.5" />
            </Link>

            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-cream/15 px-3 py-2 text-xs font-semibold text-cream/80 hover:bg-cream/5 hover:text-cream transition-colors"
            >
              <span>عرض الموقع</span>
              <ExternalLink className="size-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-cream/15 px-3 py-2 text-xs font-semibold text-cream/70 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Top View Selector: Menu Items vs Drinks Showcase */}
        <div className="flex flex-wrap items-center gap-2.5 mb-6 border-b border-cream/10 pb-4">
          <button
            type="button"
            onClick={() => setViewMode("menu")}
            className={cn(
              "flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs sm:text-sm font-bold transition-all",
              viewMode === "menu"
                ? "bg-copper text-ink shadow-lg shadow-copper/25"
                : "border border-cream/15 bg-ink-soft text-cream/70 hover:bg-cream/5 hover:text-cream"
            )}
          >
            <Utensils className="size-4" />
            <span>📋 إدارة وجبات وأسعار المنيو</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-bold",
                viewMode === "menu" ? "bg-ink/25 text-ink" : "bg-cream/10 text-cream/70"
              )}
            >
              {totalCount} صنف
            </span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("showcase")}
            className={cn(
              "flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs sm:text-sm font-bold transition-all",
              viewMode === "showcase"
                ? "bg-neon text-ink shadow-lg shadow-neon/25"
                : "border border-cream/15 bg-ink-soft text-cream/70 hover:bg-cream/5 hover:text-cream"
            )}
          >
            <Sparkles className="size-4" />
            <span>🍹 سلايدر العصائر والمشروبات المميزة</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-bold",
                viewMode === "showcase" ? "bg-forest/30 text-ink" : "bg-neon/15 text-neon"
              )}
            >
              {showcaseConfig.items.length} شرائح
            </span>
          </button>
        </div>

        {viewMode === "showcase" ? (
          <div className="flex flex-col gap-6">
            {/* Top Control Bar */}
            <div className="flex flex-col gap-4 rounded-3xl border border-cream/15 bg-ink-soft p-5 sm:p-7 md:flex-row md:items-center md:justify-between shadow-xl">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-neon/15 text-neon font-bold text-lg">
                    🍹
                  </span>
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-cream">
                      إدارة سلايدر العصائر (اشرب الشامي)
                    </h2>
                    <p className="mt-1 text-xs text-cream/60">
                      تحكم كامل بالألوان الخلفية لكل مشروب، العبارات الدعائية، الترتيب، وإضافة أي مشروب جديد.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={saveShowcase}
                  disabled={savingShowcase}
                  className="flex items-center gap-2 rounded-2xl bg-neon px-6 py-3 font-display text-sm font-bold text-ink shadow-[0_4px_20px_rgba(124,252,58,0.3)] transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <Save className="size-4" />
                  <span>{savingShowcase ? "جاري الحفظ..." : "حفظ التعديلات فوراً 💾"}</span>
                </button>
              </div>
            </div>

            {/* General Section Heading Settings */}
            <div className="rounded-3xl border border-cream/15 bg-ink-soft p-5 sm:p-6 shadow-xl">
              <h3 className="font-display text-base font-bold text-cream flex items-center gap-2 border-b border-cream/10 pb-3">
                <SlidersHorizontal className="size-4 text-copper" />
                <span>نصوص عنوان القسم الترويجي</span>
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-bold text-cream/70 block mb-1.5">العنوان الرئيسي</label>
                  <input
                    type="text"
                    value={showcaseConfig.title}
                    onChange={(e) => setShowcaseConfig((prev) => ({ ...prev, title: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-cream/15 bg-ink px-3.5 text-xs text-cream focus:border-neon focus:outline-none"
                    placeholder="اشرب الشامي"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-cream/70 block mb-1.5">الكلمة الملونة بالأخضر النعناعي</label>
                  <input
                    type="text"
                    value={showcaseConfig.highlight}
                    onChange={(e) => setShowcaseConfig((prev) => ({ ...prev, highlight: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-cream/15 bg-ink px-3.5 text-xs text-cream focus:border-neon focus:outline-none"
                    placeholder="الشامي"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-cream/70 block mb-1.5">الوصف التعريفي</label>
                  <input
                    type="text"
                    value={showcaseConfig.description}
                    onChange={(e) => setShowcaseConfig((prev) => ({ ...prev, description: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-cream/15 bg-ink px-3.5 text-xs text-cream focus:border-neon focus:outline-none"
                    placeholder="موهيتو منعش، عصير الدبدوب، وسموثي بيصحصح… اختار نكهتك."
                  />
                </div>
              </div>
            </div>

            {/* Drinks Slides Header & Add Button */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-cream flex items-center gap-2">
                  <Palette className="size-5 text-neon" />
                  <span>شرائح المشروبات المعروضة في السلايدر ({showcaseConfig.items.length})</span>
                </h3>
                <p className="text-xs text-cream/50 mt-0.5">
                  كل شريحة يمكنك تحديد المشروب، العبارة، ولون خلفية القسم الخاص بها
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddShowcaseItem}
                className="flex items-center gap-1.5 rounded-xl bg-copper px-4 py-2.5 text-xs font-bold text-ink shadow-[0_4px_16px_rgba(200,115,58,0.25)] hover:scale-105 active:scale-95 transition-all"
              >
                <Plus className="size-4" />
                <span>إضافة مشروب جديد للسلايدر</span>
              </button>
            </div>

            {/* Slides Cards List */}
            <div className="flex flex-col gap-5">
              {showcaseConfig.items.map((slide, index) => {
                const matchedItem = items.find((i) => i.id === slide.id)
                const drinkImage = slide.image || matchedItem?.image || "/placeholder.svg"
                const drinkName = slide.name || matchedItem?.name || slide.id
                const availableDrinks = items.filter((i) => i.category === "drinks")

                return (
                  <div
                    key={`${slide.id}-${index}`}
                    className="group relative flex flex-col gap-5 rounded-3xl border border-cream/15 bg-ink-soft p-5 sm:p-6 transition-all duration-300 hover:border-cream/30 shadow-xl"
                    style={{
                      borderRightWidth: "6px",
                      borderRightColor: slide.bg,
                    }}
                  >
                    {/* Slide Header: Index, Title, Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream/10 pb-4">
                      <div className="flex items-center gap-3">
                        <span className="flex size-8 items-center justify-center rounded-xl bg-cream/10 font-display text-xs font-bold text-neon">
                          #{index + 1}
                        </span>
                        <div className="relative size-12 overflow-hidden rounded-xl border border-cream/15 bg-ink">
                          <Image
                            src={drinkImage}
                            alt={drinkName}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-display text-base font-bold text-cream">
                            {drinkName}
                          </h4>
                          <span className="text-xs text-cream/50">
                            معرّف المشروب: {slide.id}
                          </span>
                        </div>
                      </div>

                      {/* Order and Delete Controls */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleMoveShowcaseItem(index, "up")}
                          disabled={index === 0}
                          title="تحريك لأعلى"
                          className="flex size-9 items-center justify-center rounded-xl border border-cream/10 bg-ink text-cream/70 hover:bg-cream/10 hover:text-cream disabled:opacity-30 disabled:hover:bg-ink transition-colors"
                        >
                          <ArrowUp className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveShowcaseItem(index, "down")}
                          disabled={index === showcaseConfig.items.length - 1}
                          title="تحريك لأسفل"
                          className="flex size-9 items-center justify-center rounded-xl border border-cream/10 bg-ink text-cream/70 hover:bg-cream/10 hover:text-cream disabled:opacity-30 disabled:hover:bg-ink transition-colors"
                        >
                          <ArrowDown className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveShowcaseItem(index)}
                          title="حذف الشريحة"
                          className="flex size-9 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>

                    {/* Inputs Row */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {/* 1. Select Drink from menu */}
                      <div>
                        <label className="text-xs font-bold text-cream/70 block mb-1.5">
                          المشروب المربوط من القائمة
                        </label>
                        <select
                          value={slide.id}
                          onChange={(e) => {
                            const selectedId = e.target.value
                            const found = items.find((i) => i.id === selectedId)
                            if (found) {
                              handleUpdateShowcaseItem(index, {
                                id: found.id,
                                name: found.name,
                                image: found.image,
                              })
                            } else {
                              handleUpdateShowcaseItem(index, { id: selectedId })
                            }
                          }}
                          className="h-11 w-full rounded-xl border border-cream/15 bg-ink px-3 text-xs text-cream outline-none focus:border-neon"
                        >
                          {availableDrinks.map((d) => (
                            <option key={d.id} value={d.id}>
                              🍹 {d.name} ({d.price}₪)
                            </option>
                          ))}
                          {!availableDrinks.some((d) => d.id === slide.id) && (
                            <option value={slide.id}>{slide.name || slide.id}</option>
                          )}
                        </select>
                      </div>

                      {/* 2. Slogan */}
                      <div>
                        <label className="text-xs font-bold text-cream/70 block mb-1.5">
                          العبارة التسويقية فوق المشروب
                        </label>
                        <input
                          type="text"
                          value={slide.slogan}
                          onChange={(e) => handleUpdateShowcaseItem(index, { slogan: e.target.value })}
                          placeholder="مثال: طاقة ما بتخلص، حيوية بدون حدود"
                          className="h-11 w-full rounded-xl border border-cream/15 bg-ink px-3.5 text-xs text-cream outline-none focus:border-neon"
                        />
                      </div>
                    </div>

                    {/* 3. Image Upload from Device for this Slide */}
                    <div className="rounded-2xl border border-cream/10 bg-ink/50 p-4">
                      <ImageUploader
                        value={slide.image || ""}
                        onChange={(newUrl) => handleUpdateShowcaseItem(index, { image: newUrl })}
                        label="صورة المشروب في السلايدر (رفع صورة من جهازك)"
                        placeholder="اتركه فارغاً لاعتماد صورة المشروب الأصلية"
                      />
                    </div>

                    {/* Color Customization Row */}
                    <div className="rounded-2xl border border-cream/10 bg-ink/60 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                        <label className="text-xs font-bold text-cream flex items-center gap-2">
                          <Palette className="size-4 text-neon" />
                          <span>لون خلفية السلايدر عند ظهور هذا المشروب:</span>
                        </label>

                        {/* Interactive Color Picker Box */}
                        <div className="flex items-center gap-3">
                          <label className="relative flex items-center gap-2.5 cursor-pointer rounded-xl border border-cream/20 bg-ink px-3 py-1.5 hover:border-neon transition-colors">
                            <span
                              className="size-6 rounded-lg border border-white/30 shadow-inner"
                              style={{ backgroundColor: slide.bg }}
                            />
                            <span className="font-mono text-xs font-bold text-cream uppercase">
                              {slide.bg}
                            </span>
                            <input
                              type="color"
                              value={slide.bg}
                              onChange={(e) => handleUpdateShowcaseItem(index, { bg: e.target.value })}
                              className="sr-only"
                            />
                          </label>

                          <input
                            type="text"
                            maxLength={7}
                            value={slide.bg}
                            onChange={(e) => handleUpdateShowcaseItem(index, { bg: e.target.value })}
                            className="w-24 h-9 rounded-xl border border-cream/15 bg-ink px-2.5 text-xs font-mono text-center text-cream uppercase focus:border-neon outline-none"
                            placeholder="#0B3A8C"
                          />
                        </div>
                      </div>

                      {/* Color Preset Palette Buttons */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-cream/10">
                        <span className="text-[11px] text-cream/50">ألوان سريعة جاهزة:</span>
                        {COLOR_PRESETS.map((preset) => (
                          <button
                            key={preset.hex}
                            type="button"
                            onClick={() => handleUpdateShowcaseItem(index, { bg: preset.hex })}
                            className={cn(
                              "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all hover:scale-105 active:scale-95",
                              slide.bg.toLowerCase() === preset.hex.toLowerCase()
                                ? "border-neon bg-forest/30 text-neon ring-1 ring-neon"
                                : "border-cream/10 bg-ink text-cream/70 hover:border-cream/30"
                            )}
                          >
                            <span
                              className="size-3 rounded-full border border-white/20"
                              style={{ backgroundColor: preset.hex }}
                            />
                            <span>{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Live Slide Preview Banner */}
                    <div
                      className="relative overflow-hidden rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors duration-500"
                      style={{ backgroundColor: slide.bg }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative size-16 sm:size-20 shrink-0">
                          <Image
                            src={drinkImage}
                            alt={drinkName}
                            fill
                            sizes="80px"
                            className="object-contain drop-shadow-xl"
                          />
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-cream/70 block">
                            {slide.slogan}
                          </span>
                          <h4 className="font-display text-lg sm:text-xl font-bold text-cream drop-shadow">
                            {drinkName}
                          </h4>
                          <span className="text-[11px] text-cream/60">
                            {matchedItem?.description || "منعش ولذيذ"}
                          </span>
                        </div>
                      </div>

                      <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                        <span className="rounded-full bg-cream/20 px-3 py-1 text-xs font-bold text-cream backdrop-blur-sm">
                          معاينة حية للشريحة
                        </span>
                        <span className="font-mono text-[10px] text-cream/70">
                          الخلفية: {slide.bg}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Bottom Floating Save Bar */}
            <div className="sticky bottom-6 z-20 flex items-center justify-between rounded-2xl border border-neon/30 bg-ink/95 p-4 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-neon" />
                <span className="text-xs sm:text-sm font-semibold text-cream">
                  لديك {showcaseConfig.items.length} مشروبات جاهزة في السلايدر
                </span>
              </div>

              <button
                type="button"
                onClick={saveShowcase}
                disabled={savingShowcase}
                className="flex items-center gap-2 rounded-xl bg-neon px-5 py-2.5 font-display text-xs sm:text-sm font-bold text-ink shadow-[0_4px_16px_rgba(124,252,58,0.3)] transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <Save className="size-4" />
                <span>{savingShowcase ? "جاري الحفظ..." : "حفظ التغييرات الآن 💾"}</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Quick Stats Bar */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
              <div className="rounded-2xl border border-cream/10 bg-ink-soft p-3.5 sm:p-4 flex flex-col justify-between">
                <span className="text-[11px] sm:text-xs text-cream/50">إجمالي الأصناف</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-2xl sm:text-3xl font-bold text-cream">{totalCount}</span>
                  <span className="text-[11px] text-cream/40">صنف</span>
                </div>
              </div>
              <div className="rounded-2xl border border-cream/10 bg-ink-soft p-3.5 sm:p-4 flex flex-col justify-between">
                <span className="text-[11px] sm:text-xs text-cream/50">متوفر للطلب</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-2xl sm:text-3xl font-bold text-neon">{availableCount}</span>
                  <span className="text-[11px] text-neon/70">جاهز</span>
                </div>
              </div>
              <div className="rounded-2xl border border-cream/10 bg-ink-soft p-3.5 sm:p-4 flex flex-col justify-between">
                <span className="text-[11px] sm:text-xs text-cream/50">نفدت الكمية</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-2xl sm:text-3xl font-bold text-red-400">{outOfStockCount}</span>
                  <span className="text-[11px] text-red-400/70">موقوف</span>
                </div>
              </div>
            </div>

        {/* Action & Filter Toolbar */}
        <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
          {/* Categories Tab */}
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto rounded-2xl border border-cream/10 bg-ink-soft p-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={cn(
                  "flex items-center gap-1.5 shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all",
                  activeTab === cat.id
                    ? "bg-copper text-ink shadow-md"
                    : "text-cream/60 hover:bg-cream/5 hover:text-cream"
                )}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Search & Add button */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-cream/40" />
              <input
                type="text"
                placeholder="بحث عن وجبة..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-xl border border-cream/10 bg-ink-soft pr-10 pl-4 text-xs text-cream placeholder:text-cream/40 focus:border-neon focus:outline-none"
              />
            </div>

            <button
              onClick={openNewItemModal}
              className="flex h-10 items-center gap-1.5 rounded-xl bg-neon px-4 text-xs font-bold text-ink shadow-[0_4px_16px_rgba(124,252,58,0.25)] transition-transform hover:scale-[1.02] active:scale-95 shrink-0"
            >
              <Plus className="size-4" />
              <span>إضافة صنف جديد</span>
            </button>
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="mt-20 flex flex-col items-center justify-center gap-3 text-cream/50">
            <RefreshCw className="size-8 animate-spin text-copper" />
            <p className="text-sm">جاري تحميل قائمة الوجبات...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="mt-20 flex flex-col items-center justify-center gap-3 text-cream/50">
            <Utensils className="size-10 text-cream/20" />
            <p className="text-sm">لا توجد وجبات تطابق بحثك حالياً</p>
            <button
              onClick={openNewItemModal}
              className="mt-2 rounded-xl bg-cream/10 px-4 py-2 text-xs font-bold text-cream hover:bg-cream/20"
            >
              أضف أول صنف الآن
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300",
                  item.available !== false
                    ? "border-cream/15 bg-ink-soft hover:border-cream/30"
                    : "border-red-500/20 bg-ink-soft/60 opacity-80"
                )}
              >
                {/* Image & Status Badge */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink">
                  <Image
                    src={item.image || "/images/hero-pizza.webp"}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized={item.image?.startsWith("http")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-black/20" />

                  {/* Top Badges */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                    <span className="rounded-lg bg-ink/80 px-2 py-0.5 text-[10px] font-bold text-copper backdrop-blur-md">
                      {item.category === "pizza"
                        ? "🍕 بيتزا"
                        : item.category === "fastfood"
                        ? "🍔 فاست فود"
                        : item.category === "drinks"
                        ? "🍹 عصائر"
                        : "🍰 حلويات"}
                    </span>

                    {item.tag && (
                      <span className="rounded-lg bg-copper/90 px-2 py-0.5 text-[10px] font-bold text-ink shadow">
                        {item.tag}
                      </span>
                    )}
                  </div>

                  {/* Out of stock overlay */}
                  {item.available === false && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                      <span className="rounded-full border border-red-500/40 bg-red-500/20 px-3 py-1 text-xs font-bold text-red-400">
                        نفدت الكمية (موقوف)
                      </span>
                    </div>
                  )}
                </div>

                {/* Info & Controls */}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-display text-base font-bold text-cream">{item.name}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-cream/55 leading-relaxed">
                    {item.description || "بدون وصف"}
                  </p>

                  {/* Editable Sizes Pills right on the card */}
                  {item.sizes && item.sizes.length > 0 && (
                    <div className="mt-3 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-cream/65">
                          تعديل أسعار الأحجام مباشرة:
                        </span>
                        <span className="text-[10px] text-cream/40">حفظ فوري ⚡</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.sizes.map((s, idx) => (
                          <QuickSizePriceInput
                            key={s.label}
                            label={s.label}
                            price={Number(s.price)}
                            onSave={(newSizePrice) =>
                              handleQuickSizePriceChange(item.id, idx, newSizePrice)
                            }
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Price Editor + Actions */}
                  <div className="mt-auto border-t border-cream/10 pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <QuickPriceInput
                        item={item}
                        onSave={(val) => handleQuickPriceChange(item.id, val)}
                      />

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        {/* Toggle Available */}
                        <button
                          onClick={() => toggleAvailable(item.id, item.available !== false)}
                          className={cn(
                            "flex size-8 items-center justify-center rounded-xl border transition-colors",
                            item.available !== false
                              ? "border-cream/15 text-cream/60 hover:border-cream/30 hover:text-cream"
                              : "border-red-500/30 bg-red-500/10 text-red-400"
                          )}
                          title={item.available !== false ? "إيقاف الصنف مؤقتاً" : "إعادة تفعيل الصنف للزبائن"}
                        >
                          {item.available !== false ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                        </button>

                        {/* Edit Full */}
                        <button
                          onClick={() => openEditItemModal(item)}
                          className="flex size-8 items-center justify-center rounded-xl border border-cream/15 text-cream/60 hover:border-copper/50 hover:text-copper transition-colors"
                          title="تعديل تفاصيل الوجبة والصورة"
                        >
                          <Edit3 className="size-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className="flex size-8 items-center justify-center rounded-xl border border-cream/15 text-cream/60 hover:border-red-500/40 hover:text-red-400 transition-colors"
                          title="حذف الوجبة نهائياً"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    )}
  </main>

      {/* Easy & Intuitive Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-cream/20 bg-ink p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-cream/10 pb-4">
              <h2 className="font-display text-lg font-bold text-cream">
                {editingItem ? `تعديل وجبة: ${editingItem.name}` : "إضافة صنف جديد لقائمة الطعام"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-1.5 text-cream/60 hover:bg-cream/10 hover:text-cream transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Error Message if any */}
            {formError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/15 p-3 text-xs font-semibold text-red-300">
                <AlertTriangle className="size-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveItem} className="mt-5 flex flex-col gap-4">
              {/* 1. Meal Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-cream">اسم الوجبة</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    placeholder="مثال: بيتزا فواكه البحر، برجر دبل"
                    className="mt-1.5 h-11 w-full rounded-xl border border-cream/15 bg-ink-soft px-3.5 text-xs text-cream outline-none focus:border-neon"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-cream">القسم</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="mt-1.5 h-11 w-full rounded-xl border border-cream/15 bg-ink-soft px-3 text-xs text-cream outline-none focus:border-neon"
                  >
                    <option value="pizza">🍕 بيتزا</option>
                    <option value="fastfood">🍔 برجر وفاست فود</option>
                    <option value="drinks">🍹 عصائر ومشروبات</option>
                    <option value="desserts">🍰 حلويات وكيك</option>
                  </select>
                </div>
              </div>

              {/* 2. Description */}
              <div>
                <label className="text-xs font-bold text-cream">الوصف والمكونات (اختياري)</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="مثال: جبنة موزاريلا غنية، صلصة طازجة، لحم عجل بلدي..."
                  className="mt-1.5 w-full rounded-xl border border-cream/15 bg-ink-soft p-3 text-xs text-cream outline-none focus:border-neon"
                />
              </div>

              {/* 3. Base Price & Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-cream">السعر الأساسي (بالشيكل ₪)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    required
                    placeholder="مثال: 25"
                    className="mt-1.5 h-11 w-full rounded-xl border border-cream/15 bg-ink-soft px-3.5 text-xs text-cream outline-none focus:border-neon font-display font-bold text-neon"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-cream">شارة مميزة (اختياري)</label>
                  <input
                    type="text"
                    value={formTag}
                    onChange={(e) => setFormTag(e.target.value)}
                    placeholder="مثال: الأكثر طلباً، جديد، عرض خاص"
                    className="mt-1.5 h-11 w-full rounded-xl border border-cream/15 bg-ink-soft px-3.5 text-xs text-cream outline-none focus:border-neon"
                  />
                </div>
              </div>

              {/* 4. Image Uploader with Progress Bar */}
              <div className="border-t border-cream/10 pt-3">
                <ImageUploader value={formImage} onChange={setFormImage} />
              </div>

              {/* 5. Simple Multi-Size Toggle & Builder (No JSON required!) */}
              <div className="border-t border-cream/10 pt-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-cream">هل للوجبة أحجام مختلفة؟</label>
                    <p className="text-[11px] text-cream/50">مثل: صغير، وسط، كبير بأسعار مختلفة</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHasSizes(!hasSizes)}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      hasSizes ? "bg-neon" : "bg-cream/20"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block size-4 transform rounded-full bg-ink transition-transform",
                        hasSizes ? "-translate-x-6" : "-translate-x-1"
                      )}
                    />
                  </button>
                </div>

                {hasSizes && (
                  <div className="mt-3.5 space-y-2.5 rounded-2xl border border-cream/10 bg-ink-soft p-3">
                    <p className="text-[11px] font-semibold text-cream/60">أدخل الأحجام والأسعار:</p>
                    {sizesList.map((size, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={size.label}
                          onChange={(e) => handleSizeChange(index, "label", e.target.value)}
                          placeholder="اسم الحجم (صغير/وسط...)"
                          className="h-9 flex-1 rounded-lg border border-cream/15 bg-ink px-3 text-xs text-cream outline-none focus:border-neon"
                        />
                        <div className="flex items-center rounded-lg border border-cream/15 bg-ink px-2.5 h-9 w-24">
                          <input
                            type="number"
                            value={size.price}
                            onChange={(e) => handleSizeChange(index, "price", e.target.value)}
                            placeholder="السعر"
                            className="w-full bg-transparent text-xs font-bold text-neon outline-none"
                          />
                          <span className="text-[10px] text-cream/50">₪</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSizeRow(index)}
                          className="rounded-lg p-2 text-cream/40 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddSizeRow}
                      className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-copper hover:underline"
                    >
                      <Plus className="size-3.5" />
                      إضافة حجم آخر
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="mt-3 flex gap-3 border-t border-cream/10 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="h-11 flex-1 rounded-xl border border-cream/15 text-xs font-bold text-cream/70 hover:bg-cream/5 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="h-11 flex-1 rounded-xl bg-copper text-xs font-bold text-ink shadow-lg transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="size-4 animate-spin" />
                      <span>جارٍ الحفظ...</span>
                    </>
                  ) : (
                    <span>{editingItem ? "حفظ التعديلات" : "إضافة إلى المنيو فوراً"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
