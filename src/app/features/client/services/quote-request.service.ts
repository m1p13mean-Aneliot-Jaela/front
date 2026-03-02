import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface QuoteRequestItem {
  product_name: string;
  quantity: number;
  notes?: string;
  product_id?: string | null;
}

export interface ClientAddress {
  street?: string;
  city?: string;
}

export interface ManagerResponseItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface ManagerResponse {
  message: string;
  calculated_total: number;
  items_confirmed: ManagerResponseItem[];
  shipping_fee: number;
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

@Injectable({
  providedIn: 'root'
})
export class QuoteRequestService {
  private apiUrl = `${environment.apiUrl}/quotes`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new quote request
   */
  createQuote(data: {
    client_name: string;
    client_phone: string;
    client_email?: string;
    client_address?: ClientAddress;
    shop_id: string;
    shop_name: string;
    delivery_zone_id?: string;
    requested_items: QuoteRequestItem[];
  }): Observable<{ success: boolean; data: { quote: QuoteRequest } }> {
    return this.http.post<{ success: boolean; data: { quote: QuoteRequest } }>(
      this.apiUrl,
      data
    );
  }

  /**
   * Get client's quote requests
   */
  getMyQuotes(phone: string): Observable<{ success: boolean; data: { quotes: QuoteRequest[] } }> {
    return this.http.get<{ success: boolean; data: { quotes: QuoteRequest[] } }>(
      `${this.apiUrl}/my`,
      { params: { phone } }
    );
  }

  /**
   * Get a single quote by ID
   */
  getQuoteById(id: string): Observable<{ success: boolean; data: { quote: QuoteRequest } }> {
    return this.http.get<{ success: boolean; data: { quote: QuoteRequest } }>(
      `${this.apiUrl}/${id}`
    );
  }

  /**
   * Client responds to a quote (accept or reject)
   */
  respondToQuote(
    id: string,
    accepted: boolean,
    message?: string
  ): Observable<{ success: boolean; data: { quote: QuoteRequest } }> {
    return this.http.post<{ success: boolean; data: { quote: QuoteRequest } }>(
      `${this.apiUrl}/${id}/respond/client`,
      { accepted, message }
    );
  }

  /**
   * Get status label in French
   */
  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'PENDING': 'En attente',
      'REVIEWING': 'En cours de traitement',
      'QUOTE_SENT': 'Devis envoyé',
      'ACCEPTED': 'Acceptée',
      'REJECTED': 'Refusée',
      'CONVERTED': 'Convertie en commande',
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
