export interface ShopBox {
  _id?: string;
  ref: string;
  created_at?: Date;
  current_status: ShopBoxStatus;
  status_history?: ShopBoxStatusHistory[];
  current_assignment?: ShopBoxAssignment;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ShopBoxStatus {
  status: 'occupied' | 'free' | 'under_repair';
  updated_at?: Date;
}

export interface ShopBoxStatusHistory {
  status: 'occupied' | 'free' | 'under_repair';
  updated_at: Date;
}

export interface ShopBoxAssignment {
  shop_id?: string;
  shop_name?: string;
  assigned_at?: Date;
}

export interface CreateShopBoxDto {
  ref: string;
  status?: 'occupied' | 'free' | 'under_repair';
}

export interface UpdateShopBoxDto {
  ref?: string;
}

export interface UpdateShopBoxStatusDto {
  status: 'occupied' | 'free' | 'under_repair';
}

export interface AssignShopDto {
  shop_id: string;
  shop_name: string;
}

export interface ShopBoxResponse {
  success: boolean;
  message?: string;
  data?: ShopBox | ShopBox[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface ShopBoxFilters {
  status?: string;
  shop_id?: string;
  ref?: string;
  page?: number;
  limit?: number;
}
