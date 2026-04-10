/** Known categories — extra categories from product data get defaults via getCategoryMeta */
export const CATEGORY_META: Record<string, { iconHindi: string; description: string }> = {
  Saree: {
    iconHindi: "साड़ी",
    description: "Silk, cotton & festive drapes",
  },
  Kurti: {
    iconHindi: "कुर्ती",
    description: "Daily & festive kurtis",
  },
  "Men's Kurta": {
    iconHindi: "पुरुष कुर्ता",
    description: "Sherwani, Pathani & more",
  },
  "Kids Wear": {
    iconHindi: "बच्चों के वस्त्र",
    description: "Lehenga, kurta sets",
  },
  Festive: {
    iconHindi: "त्योहार",
    description: "Lehenga, salwar sets",
  },
  Everyday: {
    iconHindi: "रोज़मर्रा",
    description: "Comfortable daily wear",
  },
};

const DEFAULT_META = {
  iconHindi: "",
  description: "Explore collection",
};

export function getCategoryMeta(category: string) {
  return CATEGORY_META[category] ?? { ...DEFAULT_META };
}
