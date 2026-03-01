import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

// Structure conforme à la base de données (unit_price, cost_price, image_url, etc.)
export interface Product {
  _id?: string;
  name: string;
  description?: string;
  shop_id: string;
  shop_name?: string;
  
  // Prix (Decimal128 côté backend)
  unit_price: number;
  cost_price?: number;
  
  // Images
  image_url?: string;
  images?: {
    image_url: string;
    created_at: string;
  }[];
  
  // Catégories
  categories?: {
    category_id?: string;
    name: string;
    assigned_at?: string;
  }[];
  
  // Promotion
  current_promo?: {
    promo_price: number;
    start_date: string;
    end_date: string;
    created_at?: string;
  };
  promo_history?: {
    promo_price: number;
    start_date: string;
    end_date: string;
    created_at: string;
  }[];
  
  // Bannissement
  is_banned?: boolean;
  ban_info?: {
    reason: string;
    created_at: string;
  };
  reports?: {
    cause: string;
    created_at: string;
  }[];
  
  // Statut produit
  current_status?: {
    status: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'REJECTED';
    reason?: string;
    updated_at?: string;
  };
  status_history?: {
    status: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'REJECTED';
    reason?: string;
    updated_at?: string;
  }[];
  
  // Historique
  update_history?: {
    name?: string;
    description?: string;
    unit_price?: number;
    cost_price?: number;
    image_url?: string;
    updated_at: string;
  }[];
  
  created_at?: string;
  updated_at?: string;
  
  // Virtual fields (calculés côté backend)
  current_price?: number;
  is_on_promo?: boolean;
  is_featured?: boolean;
  
  // Stock initial (pour création)
  initial_stock?: number;
  
  // Stock (ajouté par le backend)
  stock?: {
    current_quantity: number;
    updated_at?: string;
  };
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  description?: string;
  unit_price: number;
  cost_price?: number;
  image_url?: string;
  images?: {
    image_url: string;
    created_at: string;
  }[];
  shop_id: string;
  categories?: { category_id?: string; name: string; assigned_at?: string }[];
  initial_stock?: number; // Pour initialiser le stock séparé
  current_status?: {
    status: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'REJECTED';
    reason?: string;
    updated_at?: string;
  };
}

export interface UpdateProductRequest {
  name?: string;
  sku?: string;
  description?: string;
  unit_price?: number;
  cost_price?: number;
  image_url?: string;
  images?: {
    image_url: string;
    created_at: string;
  }[];
  categories?: { category_id?: string; name: string; assigned_at?: string }[];
}

export interface SetPromotionRequest {
  promo_price: number;
  start_date: string;
  end_date: string;
}

export interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: {
    categories: string[];
  };
}

export interface ProductStats {
  total: number;
  banned: number;
  withPromo: number;
  byCategory: Record<string, number>;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private api: ApiService) {}

  // Create new product - uses the standard endpoint
  createProduct(product: CreateProductRequest): Observable<{ success: boolean; message: string; data: Product }> {
    return this.api.post<{ success: boolean; message: string; data: Product }>(
      '/products',
      product,
      { withCredentials: true }
    );
  }

  // Get all products by shop - uses the new endpoint
  getProductsByShop(
    shopId: string,
    options: {
      page?: number;
      limit?: number;
      categoryId?: string;
      isBanned?: boolean;
      hasPromo?: boolean;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Observable<{ success: boolean; data: ProductListResponse }> {
    let params = new HttpParams();
    if (options.page) params = params.set('page', options.page.toString());
    if (options.limit) params = params.set('limit', options.limit.toString());
    if (options.isBanned !== undefined) params = params.set('isBanned', options.isBanned.toString());
    if (options.search) params = params.set('keyword', options.search);

    // Use the new endpoint: GET /api/products/by-shop/:shopId
    return this.api.get<{ success: boolean; data: ProductListResponse }>(
      `/products/by-shop/${shopId}`,
      params,
      { withCredentials: true }
    );
  }

  // Get product by ID
  getProductById(id: string): Observable<{ success: boolean; data: Product }> {
    return this.api.get<{ success: boolean; data: Product }>(
      `/products/${id}`,
      undefined,
      { withCredentials: true }
    );
  }

  // Update product
  updateProduct(
    id: string,
    data: UpdateProductRequest
  ): Observable<{ success: boolean; message: string; data: Product }> {
    return this.api.put<{ success: boolean; message: string; data: Product }>(
      `/products/${id}`,
      data,
      { withCredentials: true }
    );
  }

  // Set promotion
  setPromotion(
    id: string,
    data: SetPromotionRequest
  ): Observable<{ success: boolean; message: string; data: Product }> {
    return this.api.patch<{ success: boolean; message: string; data: Product }>(
      `/products/${id}/promotion`,
      data,
      { withCredentials: true }
    );
  }

  // Ban product
  banProduct(id: string, reason: string): Observable<{ success: boolean; message: string; data: Product }> {
    return this.api.patch<{ success: boolean; message: string; data: Product }>(
      `/products/${id}/ban`,
      { reason },
      { withCredentials: true }
    );
  }

  // Unban product
  unbanProduct(id: string): Observable<{ success: boolean; message: string; data: Product }> {
    return this.api.patch<{ success: boolean; message: string; data: Product }>(
      `/products/${id}/unban`,
      {},
      { withCredentials: true }
    );
  }

  // Add report
  addReport(id: string, cause: string): Observable<{ success: boolean; message: string; data: Product }> {
    return this.api.post<{ success: boolean; message: string; data: Product }>(
      `/products/${id}/reports`,
      { cause },
      { withCredentials: true }
    );
  }

  // Delete product
  deleteProduct(id: string): Observable<{ success: boolean; message: string }> {
    return this.api.delete<{ success: boolean; message: string }>(
      `/products/${id}`,
      { withCredentials: true }
    );
  }

  // Get product stats
  getProductStats(shopId: string): Observable<{ success: boolean; data: ProductStats }> {
    return this.api.get<{ success: boolean; data: ProductStats }>(
      `/products/by-shop/${shopId}/stats`,
      undefined,
      { withCredentials: true }
    );
  }

  // Get stock alerts (now from stock module)
  getStockAlerts(shopId: string): Observable<{ success: boolean; data: any[] }> {
    return this.api.get<{ success: boolean; data: any[] }>(
      `/shops/${shopId}/stocks/alerts`,
      undefined,
      { withCredentials: true }
    );
  }

  // Upload product images
  uploadImages(
    productId: string,
    files: File[]
  ): Observable<{ success: boolean; message: string; data: { urls: string[] } }> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`image_${index}`, file);
    });

    return this.api.post<{ success: boolean; message: string; data: { urls: string[] } }>(
      `/products/${productId}/images`,
      formData,
      { withCredentials: true }
    );
  }

  // Delete product image
  deleteImage(productId: string, imageUrl: string): Observable<{ success: boolean; message: string }> {
    return this.api.post<{ success: boolean; message: string }>(
      `/products/${productId}/images/delete`,
      { imageUrl },
      { withCredentials: true }
    );
  }

  // Categories
  getCategories(shopId: string): Observable<{ success: boolean; data: string[] }> {
    return this.api.get<{ success: boolean; data: string[] }>(
      `/products/by-shop/${shopId}/categories`,
      undefined,
      { withCredentials: true }
    );
  }

  // ===== STOCK METHODS =====

  // Get stock by product ID
  getProductStock(productId: string): Observable<{ success: boolean; data: any }> {
    return this.api.get<{ success: boolean; data: any }>(
      `/products/${productId}/stock`,
      undefined,
      { withCredentials: true }
    );
  }

  // Get stock movements by product ID
  getStockMovements(productId: string): Observable<{ success: boolean; data: any[] }> {
    return this.api.get<{ success: boolean; data: any[] }>(
      `/products/${productId}/stock/movements`,
      undefined,
      { withCredentials: true }
    );
  }

  // Add stock (IN movement)
  addStock(
    shopId: string,
    productId: string,
    quantity: number,
    reason?: string
  ): Observable<{ success: boolean; message: string; data: any }> {
    return this.api.post<{ success: boolean; message: string; data: any }>(
      `/shops/${shopId}/products/${productId}/stock/add`,
      { quantity, reason },
      { withCredentials: true }
    );
  }

  // Remove stock (OUT movement)
  removeStock(
    shopId: string,
    productId: string,
    quantity: number,
    reason?: string
  ): Observable<{ success: boolean; message: string; data: any }> {
    return this.api.post<{ success: boolean; message: string; data: any }>(
      `/shops/${shopId}/products/${productId}/stock/remove`,
      { quantity, reason },
      { withCredentials: true }
    );
  }

  // Update stock quantity (adjustment)
  updateStock(
    shopId: string,
    productId: string,
    newQuantity: number,
    reason?: string
  ): Observable<{ success: boolean; message: string; data: any }> {
    return this.api.put<{ success: boolean; message: string; data: any }>(
      `/shops/${shopId}/products/${productId}/stock`,
      { new_quantity: newQuantity, reason },
      { withCredentials: true }
    );
  }

  // Batch operations
  batchBan(productIds: string[], reason: string): Observable<{ success: boolean; message: string; data: { banned: number } }> {
    return this.api.patch<{ success: boolean; message: string; data: { banned: number } }>(
      `/products/batch/ban`,
      { productIds, reason },
      { withCredentials: true }
    );
  }

  batchDelete(productIds: string[]): Observable<{ success: boolean; message: string; data: { deleted: number } }> {
    return this.api.post<{ success: boolean; message: string; data: { deleted: number } }>(
      `/products/batch/delete`,
      { productIds },
      { withCredentials: true }
    );
  }
}
