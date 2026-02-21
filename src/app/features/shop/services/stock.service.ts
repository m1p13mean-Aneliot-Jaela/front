import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

// Stock interface (collection séparée)
export interface Stock {
  _id?: string;
  shop_id: string;
  product_id: string;
  product_name?: string;
  current_quantity: number;
  updated_at?: string;
  created_at?: string;

  // Mouvements récents intégrés
  recent_movements?: StockMovement[];
}

export interface StockMovement {
  staff_id?: string;
  staff_name?: string;
  movement_type: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  reason?: string;
  created_at: string;
}

export interface StockAlert {
  stockId: string;
  productId: string;
  productName: string;
  currentStock: number;
  status: 'low' | 'out';
}

export interface StockStats {
  total: number;
  lowStock: number;
  outOfStock: number;
  inStock: number;
}

export interface StockListResponse {
  stocks: Stock[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AddStockRequest {
  quantity: number;
  reason?: string;
}

export interface RemoveStockRequest {
  quantity: number;
  reason?: string;
}

export interface UpdateStockRequest {
  new_quantity: number;
  reason?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StockService {
  constructor(private api: ApiService) {}

  // Get stock by product ID
  getStockByProductId(productId: string): Observable<{ success: boolean; data: Stock }> {
    return this.api.get<{ success: boolean; data: Stock }>(
      `/products/${productId}/stock`,
      undefined,
      { withCredentials: true }
    );
  }

  // Get all stocks by shop (simplified - returns array directly)
  getShopStocks(shopId: string): Observable<Stock[]> {
    return this.api.get<Stock[]>(
      `/shops/${shopId}/stocks/all`,
      undefined,
      { withCredentials: true }
    );
  }

  // Get all stocks by shop (with pagination)
  getStocksByShop(
    shopId: string,
    options: {
      page?: number;
      limit?: number;
      lowStock?: boolean;
      outOfStock?: boolean;
    } = {}
  ): Observable<{ success: boolean; data: StockListResponse }> {
    let params = new HttpParams();
    if (options.page) params = params.set('page', options.page.toString());
    if (options.limit) params = params.set('limit', options.limit.toString());
    if (options.lowStock) params = params.set('lowStock', 'true');
    if (options.outOfStock) params = params.set('outOfStock', 'true');

    return this.api.get<{ success: boolean; data: StockListResponse }>(
      `/shops/${shopId}/stocks`,
      params,
      { withCredentials: true }
    );
  }

  // Add stock (IN movement)
  addStock(
    shopId: string,
    productId: string,
    data: AddStockRequest
  ): Observable<{ success: boolean; message: string; data: Stock }> {
    return this.api.post<{ success: boolean; message: string; data: Stock }>(
      `/shops/${shopId}/products/${productId}/stock/add`,
      data,
      { withCredentials: true }
    );
  }

  // Remove stock (OUT movement)
  removeStock(
    shopId: string,
    productId: string,
    data: RemoveStockRequest
  ): Observable<{ success: boolean; message: string; data: Stock }> {
    return this.api.post<{ success: boolean; message: string; data: Stock }>(
      `/shops/${shopId}/products/${productId}/stock/remove`,
      data,
      { withCredentials: true }
    );
  }

  // Update stock quantity (adjustment)
  updateStock(
    shopId: string,
    productId: string,
    data: UpdateStockRequest
  ): Observable<{ success: boolean; message: string; data: Stock }> {
    return this.api.put<{ success: boolean; message: string; data: Stock }>(
      `/shops/${shopId}/products/${productId}/stock`,
      data,
      { withCredentials: true }
    );
  }

  // Get stock stats
  getStockStats(shopId: string): Observable<{ success: boolean; data: StockStats }> {
    return this.api.get<{ success: boolean; data: StockStats }>(
      `/shops/${shopId}/stocks/stats`,
      undefined,
      { withCredentials: true }
    );
  }

  // Get stock alerts
  getStockAlerts(shopId: string): Observable<{ success: boolean; data: StockAlert[] }> {
    return this.api.get<{ success: boolean; data: StockAlert[] }>(
      `/shops/${shopId}/stocks/alerts`,
      undefined,
      { withCredentials: true }
    );
  }
}
