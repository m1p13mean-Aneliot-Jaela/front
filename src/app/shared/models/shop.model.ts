export interface DayHours {
  open: string;  // Format: "HH:mm"
  close: string; // Format: "HH:mm"
}

export interface OpeningTime {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
  [key: string]: DayHours; // Index signature for dynamic access
}

export interface ShopUser {
  user_id: string;
  role: 'MANAGER_SHOP' | 'STAFF';
  assigned_at: Date;
  first_name?: string;
  last_name?: string;
}

export interface ShopStatus {
  status: 'pending' | 'validated' | 'active' | 'deactivated' | 'suspended';
  reason?: string;
  updated_at: Date;
}

export interface ShopCategoryAssignment {
  category_id: string | ShopCategory;
  name?: string;
  assigned_at: Date;
}

export interface ShopUpdateHistory {
  shop_name?: string;
  description?: string;
  logo?: string;
  mall_location?: string;
  opening_time?: OpeningTime;
  updated_at: Date;
}

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
}

export interface Shop {
  _id?: string;
  shop_name: string;
  description?: string;
  logo?: string;
  mall_location?: string;
  opening_time: OpeningTime;
  users: ShopUser[];
  current_status: ShopStatus;
  status_history?: ShopStatus[];
  categories: ShopCategoryAssignment[];
  update_history?: ShopUpdateHistory[];
  review_stats?: ReviewStats;
  created_at?: Date;
}

export interface ShopCategory {
  _id?: string;
  name: string;
  description?: string;
  parent_category_id?: string;
  ancestors?: string[];
  is_root?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ShopFilters {
  keyword?: string;
  status?: 'pending' | 'validated' | 'active' | 'deactivated' | 'suspended';
  mall_location?: string;
  category_id?: string;
}

export interface ShopResponse {
  success: boolean;
  message?: string;
  data?: Shop | Shop[];
}

export interface ShopCategoryResponse {
  success: boolean;
  message?: string;
  data?: ShopCategory | ShopCategory[];
}
