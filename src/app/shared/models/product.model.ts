export interface ProductCategory {
  category_id: string;
  name?: string;
  assigned_at?: Date;
}

export interface ProductImage {
  image_url: string;
  created_at?: Date;
}

export interface ProductVariant {
  variant_name?: string;
  unit_price?: number;
  cost_price?: number;
  sku?: string;
  attributes?: Record<string, any>;
  images?: string[];
}

export interface ProductPromo {
  promo_price: number;
  start_date?: Date;
  end_date?: Date;
  created_at?: Date;
}

export interface ProductStatus {
  status: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'REJECTED';
  reason?: string;
  updated_at?: Date;
}

export interface ProductBanInfo {
  reason?: string;
  created_at?: Date;
}

export interface Product {
  _id?: string;
  shop_id: string;
  shop_name?: string;
  sku: string;
  name: string;
  description?: string;
  unit_price: number;
  cost_price?: number;
  tags?: string[];
  image_url?: string;
  images?: ProductImage[];
  categories?: ProductCategory[];
  variants?: ProductVariant[];
  current_promo?: ProductPromo;
  promo_history?: ProductPromo[];
  is_banned?: boolean;
  ban_info?: ProductBanInfo;
  current_status?: ProductStatus;
  status_history?: ProductStatus[];
  reports?: { cause: string; created_at: Date }[];
  update_history?: any[];
  created_at?: Date;
  updated_at?: Date;
}

export interface ProductFilters {
  keyword?: string;
  categoryId?: string;
  shopId?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  isBanned?: boolean;
}

export interface ProductResponse {
  success: boolean;
  product?: Product;
  products?: Product[];
  productId?: string;
  modifiedCount?: number;
  deletedCount?: number;
  message?: string;
}
