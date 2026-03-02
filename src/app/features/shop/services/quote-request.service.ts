import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

// Re-declare interfaces here to avoid circular dependency
export interface QuoteRequestItem {
  product_name: string;
  quantity: number;
  notes?: string;
  product_id?: string | null;
}

export interface ManagerResponseItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  original_price?: number;
  total: number;
}

export interface ClientAddress {
  street?: string;
  city?: string;
}

export interface ManagerResponse {
  message: string;
  calculated_total: number;
  items_confirmed: ManagerResponseItem[];
  shipping_fee: number;
  discount_amount?: number;
  discount_percent?: number;
  promotion_code?: string;
  valid_until: string;
}

export interface ClientResponse {
  accepted: boolean;
  message?: string;
  responded_at?: string;
}

export interface QuoteRequest {
  _id: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  client_address?: ClientAddress;
  client_id?: string | null;
  delivery_zone_id?: string;
  shop_id: string;
  shop_name: string;
  requested_items: QuoteRequestItem[];
  status: 'PENDING' | 'REVIEWING' | 'QUOTE_SENT' | 'ACCEPTED' | 'REJECTED' | 'CONVERTED' | 'EXPIRED';
  status_label?: string;
  manager_response?: ManagerResponse | null;
  handled_by?: string | null;
  handled_by_name?: string;
  handled_at?: string;
  client_response?: ClientResponse | null;
  converted_order_id?: string | null;
  converted_by_staff_id?: string | null;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export interface QuoteStats {
  total: number;
  pending: number;
  reviewing: number;
  quoteSent: number;
  accepted: number;
  rejected: number;
  converted: number;
  expired: number;
}

@Injectable({
  providedIn: 'root'
})
export class ShopQuoteRequestService {
  private apiUrl = `${environment.apiUrl}/quotes`;

  constructor(private http: HttpClient) {}

  /**
   * Get quote requests for a shop
   */
  getShopQuotes(
    shopId: string,
    filters?: { status?: string; search?: string; limit?: number }
  ): Observable<{ success: boolean; data: { quotes: QuoteRequest[]; stats: QuoteStats } }> {
    let params: any = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.search) params.search = filters.search;
    if (filters?.limit) params.limit = filters.limit;

    return this.http.get<{ success: boolean; data: { quotes: QuoteRequest[]; stats: QuoteStats } }>(
      `${this.apiUrl}/shop/${shopId}`,
      { params }
    );
  }

  /**
   * Get quote statistics
   */
  getStats(shopId: string): Observable<{ success: boolean; data: { stats: QuoteStats } }> {
    return this.http.get<{ success: boolean; data: { stats: QuoteStats } }>(
      `${this.apiUrl}/stats/${shopId}`
    );
  }

  /**
   * Get single quote by ID
   */
  getQuoteById(id: string): Observable<{ success: boolean; data: { quote: QuoteRequest } }> {
    return this.http.get<{ success: boolean; data: { quote: QuoteRequest } }>(
      `${this.apiUrl}/${id}`
    );
  }

  /**
   * Start reviewing a quote
   */
  startReview(id: string): Observable<{ success: boolean; data: { quote: QuoteRequest } }> {
    return this.http.post<{ success: boolean; data: { quote: QuoteRequest } }>(
      `${this.apiUrl}/${id}/review`,
      {}
    );
  }

  /**
   * Manager responds with a quote
   */
  managerRespond(
    id: string,
    data: {
      message: string;
      calculated_total: number;
      items_confirmed: ManagerResponseItem[];
      shipping_fee?: number;
      discount_amount?: number;
      discount_percent?: number;
      promotion_code?: string;
    }
  ): Observable<{ success: boolean; data: { quote: QuoteRequest } }> {
    return this.http.post<{ success: boolean; data: { quote: QuoteRequest } }>(
      `${this.apiUrl}/${id}/respond/manager`,
      data
    );
  }

  /**
   * Convert accepted quote to order - Creates order automatically
   */
  convertToOrder(
    id: string,
    assignedStaffId?: string
  ): Observable<{ success: boolean; data: { quote: QuoteRequest; order: any } }> {
    return this.http.post<{ success: boolean; data: { quote: QuoteRequest; order: any } }>(
      `${this.apiUrl}/${id}/convert`,
      { 
        assigned_staff_id: assignedStaffId
      }
    );
  }

  /**
   * Get status label
   */
  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'PENDING': 'En attente',
      'REVIEWING': 'En cours',
      'QUOTE_SENT': 'Devis envoyé',
      'ACCEPTED': 'Acceptée',
      'REJECTED': 'Refusée',
      'CONVERTED': 'Convertie',
      'EXPIRED': 'Expirée'
    };
    return labels[status] || status;
  }

  /**
   * Get status color class
   */
  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'PENDING': 'pending',
      'REVIEWING': 'reviewing',
      'QUOTE_SENT': 'quote-sent',
      'ACCEPTED': 'accepted',
      'REJECTED': 'rejected',
      'CONVERTED': 'converted',
      'EXPIRED': 'expired'
    };
    return classes[status] || 'default';
  }
}
