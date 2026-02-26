import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface CustomerInfo {
  name: string;
  email?: string;
  phone: string;
  address?: {
    street?: string;
    city?: string;
    postal_code?: string;
  };
}

export interface CreateOrderRequest {
  shop_id: string;
  customer: CustomerInfo;
  items: OrderItem[];
  notes?: string;
}

// Order interface - updated with all fields
export interface Order {
  _id: string;
  order_number: string;
  shop_id: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total_amount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PAYMENT_REQUESTED' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELED';
  payment?: {
    method: string;
    status: string;
    paid_at?: string;
  };
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Create a new order (for clients)
  createOrder(orderData: CreateOrderRequest): Observable<{ success: boolean; data: Order }> {
    return this.http.post<{ success: boolean; data: Order }>(
      `${this.apiUrl}/orders`,
      orderData,
      { withCredentials: true }
    );
  }

  // Get my orders (for clients)
  getMyOrders(): Observable<{ success: boolean; data: Order[] }> {
    return this.http.get<{ success: boolean; data: Order[] }>(
      `${this.apiUrl}/orders/my`,
      { withCredentials: true }
    );
  }

  // Get order by ID
  getOrderById(orderId: string): Observable<{ success: boolean; data: Order }> {
    return this.http.get<{ success: boolean; data: Order }>(
      `${this.apiUrl}/orders/${orderId}`,
      { withCredentials: true }
    );
  }

  // Confirm payment for an order
  confirmPayment(orderId: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/orders/${orderId}/confirm-payment`,
      {},
      { withCredentials: true }
    );
  }
}
