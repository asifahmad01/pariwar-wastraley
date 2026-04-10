export interface Product {
  id: string;
  name: string;
  nameHi?: string;
  /** Legacy single-category string (kept for backward compat with existing DB rows) */
  category?: string;
  /** Array of category names from ProductCategory join — primary source going forward */
  categories?: string[];
  /** Array of category IDs — used in admin forms */
  categoryIds?: string[];
  style: string;
  badge?: "new" | "trending" | null;
  price: number;
  showPrice: boolean;
  colors: string[];
  colorHex: string[];
  sizes: string[];
  image?: string;
  description?: string;
  fabric?: string;
  isVisible?: boolean;
}

export interface Variant {
  id: string;
  productId: string;
  color: string;
  colorHex: string;
  size: string;
  stockQty: number;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  productCount?: number;
}

export interface Style {
  id: string;
  name: string;
  productCount?: number;
}

/** Current UI filter state */
export interface FilterState {
  category: string;
  style: string;
  size: string;
  color: string;
  search: string;
}

export interface StoreInfo {
  nameEn: string;
  nameHi: string;
  address: string;
  phone: string;
  whatsapp: string;
  tagline: string;
  taglineHi: string;
  hours: string;
}
