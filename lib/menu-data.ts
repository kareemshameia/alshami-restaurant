export type CategoryId = "pizza" | "fastfood" | "drinks" | "desserts"

export type MenuSize = { label: string; price: number }

export type MenuItem = {
  id: string
  name: string
  description: string
  category: CategoryId
  image: string
  /** Overhead shot used by the pizza wheel */
  topImage?: string
  price: number
  sizes?: MenuSize[]
  tag?: string
}

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "pizza", label: "بيتزا" },
  { id: "fastfood", label: "برجر وفاست فود" },
  { id: "drinks", label: "عصائر ومشروبات" },
  { id: "desserts", label: "كيك وحلويات" },
]

// الأسعار تقديرية بالشيكل — عدّلها هنا مباشرة
export const MENU: MenuItem[] = [
  {
    id: "pizza-supreme",
    name: "بيتزا سوبريم",
    description: "زيتون وفلفل ملوّن وجبنة موزاريلا سايحة على عجينة الشامي.",
    category: "pizza",
    image: "/images/hero-pizza.webp",
    topImage: "/images/pizza-supreme-top.webp",
    price: 25,
    sizes: [
      { label: "صغير", price: 25 },
      { label: "وسط", price: 35 },
      { label: "كبير", price: 45 },
    ],
    tag: "الأكثر طلباً",
  },
  {
    id: "pizza-chicken",
    name: "بيتزا صدر",
    description: "قطع صدر دجاج متبّلة مع فطر وذرة، وجبنة بتمطّ.",
    category: "pizza",
    image: "/images/pizza-chicken.webp",
    topImage: "/images/pizza-chicken-top.webp",
    price: 30,
    sizes: [
      { label: "صغير", price: 30 },
      { label: "وسط", price: 40 },
      { label: "كبير", price: 50 },
    ],
  },
  {
    id: "pizza-classic",
    name: "بيتزا عادية",
    description: "صلصة طماطم وجبنة ذهبية… البساطة اللي بتحبها.",
    category: "pizza",
    image: "/images/pizza-margherita.webp",
    topImage: "/images/pizza-classic-top.webp",
    price: 20,
    sizes: [
      { label: "صغير", price: 20 },
      { label: "وسط", price: 28 },
      { label: "كبير", price: 36 },
    ],
  },
  {
    id: "pizza-mini",
    name: "أصغر بيتزا في العالم",
    description: "حجمها صغير وطعمها كبير. جرّبها وصوّرها!",
    category: "pizza",
    image: "/images/pizza-mini.webp",
    topImage: "/images/pizza-mini-top.webp",
    price: 5,
    tag: "ترند",
  },
  {
    id: "burger-cheese",
    name: "برجر الجبنة السايحة",
    description: "لحمة طازجة وشيدر سايح مع خس وطماطم بخبز بريوش.",
    category: "fastfood",
    image: "/images/burger.webp",
    price: 22,
    sizes: [
      { label: "سنجل", price: 22 },
      { label: "دبل", price: 30 },
    ],
    tag: "تشيز بول",
  },
  {
    id: "calzone",
    name: "كالزوني",
    description: "الدلع إله عنوان: عجينة محشية جبنة ودجاج.",
    category: "fastfood",
    image: "/images/calzone.webp",
    price: 18,
  },
  {
    id: "fries",
    name: "بطاطا مقلية",
    description: "مقرمشة وذهبية مع كاتشب.",
    category: "fastfood",
    image: "/images/fries.webp",
    price: 8,
    sizes: [
      { label: "عادي", price: 8 },
      { label: "عائلي", price: 14 },
    ],
  },
  {
    id: "mojito-blue",
    name: "موهيتو الشامي الأزرق",
    description: "ليمون ونعناع وسبرايت، مع ثلج كثير.",
    category: "drinks",
    image: "/images/mojito-blue.webp",
    price: 10,
    tag: "منعش",
  },
  {
    id: "mojito-purple",
    name: "موهيتو بنفسجي",
    description: "توت وليمون ونعناع… طاقة ما بتخلص.",
    category: "drinks",
    image: "/images/mojito-purple.webp",
    price: 10,
  },
  {
    id: "bear-juice",
    name: "عصير الدب",
    description: "عبوة الدبدوب بثلاث نكهات: فراولة، ليمون، حليب.",
    category: "drinks",
    image: "/images/bear-juice.webp",
    price: 7,
  },
  {
    id: "smoothie",
    name: "سموثي",
    description: "مانجو، أو وردي بالفراولة، أو سموثي الطاقة.",
    category: "drinks",
    image: "/images/smoothie-mango.webp",
    price: 12,
    sizes: [
      { label: "مانجو", price: 12 },
      { label: "وردي", price: 12 },
      { label: "طاقة", price: 14 },
    ],
  },
  {
    id: "cake-kitkat",
    name: "كيك كيت كات",
    description: "شوكولاتة غنية محاطة بأصابع الويفر.",
    category: "desserts",
    image: "/images/cake-kitkat.webp",
    price: 80,
  },
  {
    id: "cake-lotus",
    name: "كيك لوتس",
    description: "كراميل وبسكويت لوتس مطحون.",
    category: "desserts",
    image: "/images/cake-lotus.webp",
    price: 80,
  },
  {
    id: "cake-fruit",
    name: "كيك فواكه",
    description: "كريمة خفيفة مع فواكه طازجة موسمية.",
    category: "desserts",
    image: "/images/cake-fruit.webp",
    price: 75,
  },
  {
    id: "cake-snickers",
    name: "كيك سنكرز",
    description: "نوغا وكراميل وفول سوداني مع شوكولاتة.",
    category: "desserts",
    image: "/images/cake-snickers.webp",
    price: 85,
  },
  {
    id: "cake-wedding",
    name: "كيكة العرسان",
    description: "كيك أفراح مزيّن بالورد، بالطلب المسبق.",
    category: "desserts",
    image: "/images/cake-wedding.webp",
    price: 250,
    tag: "طلب مسبق",
  },
  {
    id: "qashtota",
    name: "كاسات قشطوطة",
    description: "طبقات قشطة وبسكويت وفستق.",
    category: "desserts",
    image: "/images/dessert-cups.webp",
    price: 8,
  },
  {
    id: "ice-cream",
    name: "آيس كريم",
    description: "فستق وشوكولاتة وفراولة.",
    category: "desserts",
    image: "/images/ice-cream.webp",
    price: 6,
  },
]

export function getItem(id: string) {
  return MENU.find((item) => item.id === id)
}
