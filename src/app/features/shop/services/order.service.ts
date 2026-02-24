import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

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

export interface OrderStatusHistory {
  status: 'PENDING' | 'CONFIRMED' | 'PAYMENT_REQUESTED' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELED';
  changed_at: string;
  changed_by?: string;
  note?: string;
}

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
  status_history: OrderStatusHistory[];
  payment: {
    method: 'CASH' | 'CARD' | 'MOBILE_MONEY' | 'BANK_TRANSFER';
    status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
    paid_at?: string;
  };
  delivery?: {
    delivery_id?: string;
    tracking_number?: string;
    estimated_delivery?: string;
    actual_delivery?: string;
  };
  customer_note?: string;
  internal_note?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  period: number;
  revenue: number;
  orders_count: number;
  orders_by_status: {
    PENDING: number;
    CONFIRMED: number;
    SHIPPED: number;
    DELIVERED: number;
    CANCELED: number;
  };
  top_products: {
    _id: string;
    name: string;
    total_quantity: number;
    total_revenue: number;
  }[];
  monthly_sales: {
    month: string;
    revenue: number;
    orders: number;
  }[];
  conversion_rate: number;
  orders_by_status_detailed: {
    PENDING: { count: number; total_value: number };
    CONFIRMED: { count: number; total_value: number };
    SHIPPED: { count: number; total_value: number };
    DELIVERED: { count: number; total_value: number };
    CANCELED: { count: number; total_value: number };
  };
  recent_orders: Order[];
}

export interface TodoItem {
  type: 'ORDER_PENDING' | 'ORDER_TO_SHIP' | 'ORDER_IN_TRANSIT';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  order_id: string;
  created_at: string;
}

export interface OrdersListResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private api: ApiService) {}

  // Get dashboard stats
  getDashboardStats(period: number = 30): Observable<{ success: boolean; data: DashboardStats }> {
    return this.api.get<{ success: boolean; data: DashboardStats }>(
      `/shops/me/orders/stats?period=${period}`,
      undefined,
      { withCredentials: true }
    );
  }

  // Get todo list
  getTodoList(): Observable<{ success: boolean; data: TodoItem[] }> {
    return this.api.get<{ success: boolean; data: TodoItem[] }>(
      '/shops/me/orders/todo',
      undefined,
      { withCredentials: true }
    );
  }

  // Get orders list
  getOrders(filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Observable<{ success: boolean; data: OrdersListResponse }> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.startDate) params.set('startDate', filters.startDate);
    if (filters?.endDate) params.set('endDate', filters.endDate);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.page) params.set('page', filters.page.toString());
    if (filters?.limit) params.set('limit', filters.limit.toString());

    const queryString = params.toString();
    const url = `/shops/me/orders${queryString ? '?' + queryString : ''}`;

    return this.api.get<{ success: boolean; data: OrdersListResponse }>(
      url,
      undefined,
      { withCredentials: true }
    );
  }

  // Get single order
  getOrder(orderId: string): Observable<{ success: boolean; data: Order }> {
    return this.api.get<{ success: boolean; data: Order }>(
      `/orders/${orderId}`,
      undefined,
      { withCredentials: true }
    );
  }

  // Create order
  createOrder(orderData: Partial<Order>): Observable<{ success: boolean; message: string; data: Order }> {
    return this.api.post<{ success: boolean; message: string; data: Order }>(
      '/shops/me/orders',
      orderData,
      { withCredentials: true }
    );
  }

  // Client confirms payment (changes PAYMENT_REQUESTED → PAID)
  confirmPayment(orderId: string): Observable<{ success: boolean; message: string; data: Order }> {
    return this.api.post<{ success: boolean; message: string; data: Order }>(
      `/orders/${orderId}/confirm-payment`,
      {},
      { withCredentials: true }
    );
  }

  // Update order status
  updateStatus(orderId: string, status: string, note?: string): Observable<{ success: boolean; message: string; data: Order }> {
    return this.api.patch<{ success: boolean; message: string; data: Order }>(
      `/orders/${orderId}/status`,
      { status, note },
      { withCredentials: true }
    );
  }

  // Update order
  updateOrder(orderId: string, orderData: Partial<Order>): Observable<{ success: boolean; message: string; data: Order }> {
    return this.api.patch<{ success: boolean; message: string; data: Order }>(
      `/orders/${orderId}`,
      orderData,
      { withCredentials: true }
    );
  }

  // Get order history
  getOrderHistory(orderId: string): Observable<{ success: boolean; data: OrderStatusHistory[] }> {
    return this.api.get<{ success: boolean; data: OrderStatusHistory[] }>(
      `/orders/${orderId}/history`,
      undefined,
      { withCredentials: true }
    );
  }

  // Delete order
  deleteOrder(orderId: string): Observable<{ success: boolean; message: string }> {
    return this.api.delete<{ success: boolean; message: string }>(
      `/orders/${orderId}`,
      { withCredentials: true }
    );
  }

  // Export orders
  exportOrders(filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Observable<{ success: boolean; data: any[] }> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.startDate) params.set('startDate', filters.startDate);
    if (filters?.endDate) params.set('endDate', filters.endDate);

    const queryString = params.toString();
    const url = `/shops/me/orders/export${queryString ? '?' + queryString : ''}`;

    return this.api.get<{ success: boolean; data: any[] }>(
      url,
      undefined,
      { withCredentials: true }
    );
  }

  // Status labels for UI
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING': 'En attente',
      'CONFIRMED': 'Confirmée',
      'PAYMENT_REQUESTED': 'Paiement demandé',
      'PAID': 'Payée',
      'SHIPPED': 'Expédiée',
      'DELIVERED': 'Livrée',
      'CANCELED': 'Annulée'
    };
    return labels[status] || status;
  }

  // Status colors for UI
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'PENDING': '#f59e0b', // amber
      'CONFIRMED': '#3b82f6', // blue
      'PAYMENT_REQUESTED': '#f97316', // orange
      'PAID': '#10b981', // emerald
      'SHIPPED': '#8b5cf6', // violet
      'DELIVERED': '#22c55e', // green
      'CANCELED': '#dc2626'  // red
    };
    return colors[status] || '#6b7280';
  }
}
