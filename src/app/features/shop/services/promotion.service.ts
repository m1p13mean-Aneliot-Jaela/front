import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface Promotion {
  _id?: string;
  shop_id: string;
  shop_name?: string;
  title: string;
  description?: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  promo_code?: string | null;
  start_date: string;
  end_date: string;
  conditions?: string;
  usage_limit?: number;
  usage_count?: number;
  is_active?: boolean;
  applicable_products?: 'ALL' | string[];
  exclusions?: string[];
  created_at?: string;
}

export interface CreatePromotionRequest {
  shop_id: string;
  title: string;
  description?: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  promo_code?: string;
  start_date: string;
  end_date: string;
  conditions?: string;
  usage_limit?: number;
  applicable_products?: 'ALL' | string[];
  exclusions?: string[];
}

export interface UpdatePromotionRequest {
  title?: string;
  description?: string;
  type?: 'percentage' | 'fixed_amount';
  value?: number;
  promo_code?: string;
  start_date?: string;
  end_date?: string;
  conditions?: string;
  usage_limit?: number;
  is_active?: boolean;
  applicable_products?: 'ALL' | string[];
  exclusions?: string[];
}

export interface PromotionListResponse {
  promotions: Promotion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PromotionStats {
  total: number;
  active: number;
  expired: number;
  scheduled: number;
  byType: {
    percentage: number;
    fixed_amount: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PromotionService {
  constructor(private api: ApiService) {}

  // Create promotion
  createPromotion(data: CreatePromotionRequest): Observable<{ success: boolean; message: string; data: Promotion }> {
    return this.api.post<{ success: boolean; message: string; data: Promotion }>(
      '/promotions',
      data,
      { withCredentials: true }
    );
  }

  // Get promotions by shop
  getPromotionsByShop(
    shopId: string,
    options: {
      page?: number;
      limit?: number;
      isActive?: boolean;
      type?: 'percentage' | 'fixed_amount';
      search?: string;
    } = {}
  ): Observable<{ success: boolean; data: PromotionListResponse }> {
    let params = new HttpParams();
    if (options.page) params = params.set('page', options.page.toString());
    if (options.limit) params = params.set('limit', options.limit.toString());
    if (options.isActive !== undefined) params = params.set('isActive', options.isActive.toString());
    if (options.type) params = params.set('type', options.type);
    if (options.search) params = params.set('keyword', options.search);

    return this.api.get<{ success: boolean; data: PromotionListResponse }>(
      `/shops/${shopId}/promotions`,
      params,
      { withCredentials: true }
    );
  }

  // Get promotion by ID
  getPromotionById(id: string): Observable<{ success: boolean; data: Promotion }> {
    return this.api.get<{ success: boolean; data: Promotion }>(
      `/promotions/${id}`,
      undefined,
      { withCredentials: true }
    );
  }

  // Update promotion
  updatePromotion(
    id: string,
    data: UpdatePromotionRequest
  ): Observable<{ success: boolean; message: string; data: Promotion }> {
    return this.api.put<{ success: boolean; message: string; data: Promotion }>(
      `/promotions/${id}`,
      data,
      { withCredentials: true }
    );
  }

  // Delete promotion
  deletePromotion(id: string): Observable<{ success: boolean; message: string }> {
    return this.api.delete<{ success: boolean; message: string }>(
      `/promotions/${id}`,
      { withCredentials: true }
    );
  }

  // Toggle promotion status (activate/deactivate)
  togglePromotionStatus(id: string, isActive: boolean): Observable<{ success: boolean; message: string; data: Promotion }> {
    return this.api.patch<{ success: boolean; message: string; data: Promotion }>(
      `/promotions/${id}/status`,
      { is_active: isActive },
      { withCredentials: true }
    );
  }

  // Get promotion stats
  getPromotionStats(shopId: string): Observable<{ success: boolean; data: PromotionStats }> {
    return this.api.get<{ success: boolean; data: PromotionStats }>(
      `/shops/${shopId}/promotions/stats`,
      undefined,
      { withCredentials: true }
    );
  }

  // Validate promo code
  validatePromoCode(code: string, shopId: string): Observable<{ success: boolean; data: { valid: boolean; promotion?: Promotion; message?: string } }> {
    return this.api.get<{ success: boolean; data: { valid: boolean; promotion?: Promotion; message?: string } }>(
      `/promotions/validate/${code}`,
      new HttpParams().set('shop_id', shopId),
      { withCredentials: true }
    );
  }

  // Get applicable products for promotion
  getPromotionProducts(promotionId: string): Observable<{ success: boolean; data: string[] }> {
    return this.api.get<{ success: boolean; data: string[] }>(
      `/promotions/${promotionId}/products`,
      undefined,
      { withCredentials: true }
    );
  }

  // Update promotion products
  updatePromotionProducts(
    promotionId: string,
    productIds: string[] | 'ALL'
  ): Observable<{ success: boolean; message: string }> {
    return this.api.put<{ success: boolean; message: string }>(
      `/promotions/${promotionId}/products`,
      { applicable_products: productIds },
      { withCredentials: true }
    );
  }

  // Get active promotions for shop products
  getActivePromotionsForProducts(shopId: string, productIds?: string[]): Observable<{ success: boolean; data: Promotion[] }> {
    let params = new HttpParams();
    if (productIds && productIds.length > 0) {
      params = params.set('product_ids', productIds.join(','));
    }
    return this.api.get<{ success: boolean; data: Promotion[] }>(
      `/shops/${shopId}/promotions/active`,
      params,
      { withCredentials: true }
    );
  }

  // Calculate promo price for a product
  calculatePromoPrice(unitPrice: number, promotion: Promotion): number | null {
    if (!promotion || !promotion.is_active) return null;
    
    const now = new Date();
    const startDate = new Date(promotion.start_date);
    const endDate = new Date(promotion.end_date);
    
    if (now < startDate || now > endDate) return null;
    
    let promoPrice = unitPrice;
    if (promotion.type === 'percentage') {
      promoPrice = unitPrice * (1 - promotion.value / 100);
    } else {
      promoPrice = unitPrice - promotion.value;
    }
    
    return Math.max(0, promoPrice);
  }

  // Get discount percentage
  getDiscountPercentage(unitPrice: number, promoPrice: number): number {
    return Math.round(((unitPrice - promoPrice) / unitPrice) * 100);
  }
}
