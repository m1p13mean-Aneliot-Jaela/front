import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface DeliveryZone {
  _id?: string;
  name: string;
  description?: string;
  cities?: string[];
  postal_codes?: string[];
  coordinates?: { lat: number; lng: number }[];
  base_fee: number;
  free_delivery_threshold?: number | null;
  estimated_days: number;
  estimated_hours: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DeliveryAddress {
  recipient_name: string;
  recipient_phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  postal_code: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface Delivery {
  _id?: string;
  shop_id: string;
  order_id: string;
  tracking_number?: string;
  carrier?: {
    name?: string;
    external_tracking_id?: string;
    api_provider?: string;
  };
  status: DeliveryStatus;
  status_history?: {
    status: DeliveryStatus;
    timestamp: string;
    location?: string;
    note?: string;
    updated_by?: string;
  }[];
  delivery_address: DeliveryAddress;
  zone_id?: string;
  zone_name?: string;
  delivery_fee: number;
  free_delivery_applied?: boolean;
  requested_date?: string;
  scheduled_date?: string;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  instructions?: string;
  leave_at_door?: boolean;
  signature_required?: boolean;
  proof_of_delivery?: {
    signature_url?: string;
    photo_url?: string;
    recipient_name?: string;
    delivered_at?: string;
  };
  driver?: {
    id?: string;
    name?: string;
    phone?: string;
    vehicle_info?: string;
  };
  external_tracking_data?: {
    provider?: string;
    last_sync?: string;
    checkpoints?: {
      date: string;
      status: string;
      location: string;
      message: string;
    }[];
  };
  notes?: string;
  internal_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export type DeliveryStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'PREPARING' 
  | 'READY' 
  | 'PICKED_UP' 
  | 'IN_TRANSIT' 
  | 'OUT_FOR_DELIVERY' 
  | 'DELIVERED' 
  | 'FAILED' 
  | 'RETURNED' 
  | 'CANCELLED';

export interface DeliveryStats {
  total: number;
  byStatus: Record<DeliveryStatus, number>;
  avgDeliveryTimeMs: number;
  period: number;
}

export interface DeliveryFilters {
  page?: number;
  limit?: number;
  status?: DeliveryStatus;
  startDate?: string;
  endDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  constructor(private api: ApiService) {}

  // ========== ZONES ==========

  createZone(shopId: string, zone: Partial<DeliveryZone>): Observable<{ success: boolean; message: string; data: DeliveryZone }> {
    return this.api.post<{ success: boolean; message: string; data: DeliveryZone }>(
      `/shops/${shopId}/zones`,
      zone,
      { withCredentials: true }
    );
  }

  getZones(shopId: string): Observable<{ success: boolean; data: DeliveryZone[] }> {
    return this.api.get<{ success: boolean; data: DeliveryZone[] }>(
      `/shops/${shopId}/zones`,
      undefined,
      { withCredentials: true }
    );
  }

  updateZone(zoneId: string, zone: Partial<DeliveryZone>): Observable<{ success: boolean; message: string; data: DeliveryZone }> {
    return this.api.put<{ success: boolean; message: string; data: DeliveryZone }>(
      `/zones/${zoneId}`,
      zone,
      { withCredentials: true }
    );
  }

  deleteZone(zoneId: string): Observable<{ success: boolean; message: string }> {
    return this.api.delete<{ success: boolean; message: string }>(
      `/zones/${zoneId}`,
      { withCredentials: true }
    );
  }

  calculateFee(shopId: string, zoneId: string, orderAmount: number): Observable<{ success: boolean; data: {
    fee: number;
    free_delivery_applied: boolean;
    zone_name: string;
    estimated_days: number;
    estimated_hours: number;
  } }> {
    return this.api.post<{ success: boolean; data: any }>(
      `/shops/${shopId}/zones/${zoneId}/calculate-fee`,
      { order_amount: orderAmount },
      { withCredentials: true }
    );
  }

  // ========== DELIVERIES ==========

  createDelivery(shopId: string, orderId: string, data: {
    zone_id: string;
    order_amount?: number;
    delivery_address: DeliveryAddress;
    requested_date?: string;
    scheduled_date?: string;
    instructions?: string;
    leave_at_door?: boolean;
    signature_required?: boolean;
  }): Observable<{ success: boolean; message: string; data: Delivery }> {
    return this.api.post<{ success: boolean; message: string; data: Delivery }>(
      `/shops/${shopId}/orders/${orderId}/delivery`,
      data,
      { withCredentials: true }
    );
  }

  getDeliveries(shopId: string, filters?: DeliveryFilters): Observable<{ success: boolean; data: {
    deliveries: Delivery[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  } }> {
    let params = new HttpParams();
    if (filters) {
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.status) params = params.set('status', filters.status);
      if (filters.startDate) params = params.set('startDate', filters.startDate);
      if (filters.endDate) params = params.set('endDate', filters.endDate);
    }
    return this.api.get<{ success: boolean; data: any }>(
      `/shops/${shopId}/deliveries`,
      params,
      { withCredentials: true }
    );
  }

  getDeliveryById(deliveryId: string): Observable<{ success: boolean; data: Delivery }> {
    return this.api.get<{ success: boolean; data: Delivery }>(
      `/deliveries/${deliveryId}`,
      undefined,
      { withCredentials: true }
    );
  }

  getDeliveryByOrderId(orderId: string): Observable<{ success: boolean; data: Delivery }> {
    return this.api.get<{ success: boolean; data: Delivery }>(
      `/orders/${orderId}/delivery`,
      undefined,
      { withCredentials: true }
    );
  }

  updateStatus(deliveryId: string, status: DeliveryStatus, note?: string, location?: string): Observable<{ success: boolean; message: string; data: Delivery }> {
    return this.api.patch<{ success: boolean; message: string; data: Delivery }>(
      `/deliveries/${deliveryId}/status`,
      { status, note, location },
      { withCredentials: true }
    );
  }

  assignDriver(deliveryId: string, driver: { id?: string; name: string; phone?: string; vehicle_info?: string }): Observable<{ success: boolean; message: string; data: Delivery }> {
    return this.api.patch<{ success: boolean; message: string; data: Delivery }>(
      `/deliveries/${deliveryId}/driver`,
      driver,
      { withCredentials: true }
    );
  }

  updateExternalTracking(deliveryId: string, tracking: {
    carrier_name: string;
    tracking_id: string;
    provider?: string;
  }): Observable<{ success: boolean; message: string; data: Delivery }> {
    return this.api.patch<{ success: boolean; message: string; data: Delivery }>(
      `/deliveries/${deliveryId}/tracking`,
      tracking,
      { withCredentials: true }
    );
  }

  syncExternalTracking(deliveryId: string): Observable<{ success: boolean; message: string; data: Delivery }> {
    return this.api.post<{ success: boolean; message: string; data: Delivery }>(
      `/deliveries/${deliveryId}/sync-tracking`,
      {},
      { withCredentials: true }
    );
  }

  cancelDelivery(deliveryId: string, reason: string): Observable<{ success: boolean; message: string; data: Delivery }> {
    return this.api.patch<{ success: boolean; message: string; data: Delivery }>(
      `/deliveries/${deliveryId}/cancel`,
      { reason },
      { withCredentials: true }
    );
  }

  getStats(shopId: string, period?: number): Observable<{ success: boolean; data: DeliveryStats }> {
    let params = new HttpParams();
    if (period) params = params.set('period', period.toString());
    return this.api.get<{ success: boolean; data: DeliveryStats }>(
      `/shops/${shopId}/deliveries/stats`,
      params,
      { withCredentials: true }
    );
  }

  // Helper methods
  getStatusLabel(status: DeliveryStatus): string {
    const labels: Record<DeliveryStatus, string> = {
      PENDING: 'En attente',
      CONFIRMED: 'Confirmé',
      PREPARING: 'En préparation',
      READY: 'Prêt',
      PICKED_UP: 'Récupéré',
      IN_TRANSIT: 'En transit',
      OUT_FOR_DELIVERY: 'En cours de livraison',
      DELIVERED: 'Livré',
      FAILED: 'Échec',
      RETURNED: 'Retourné',
      CANCELLED: 'Annulé'
    };
    return labels[status] || status;
  }

  getStatusColor(status: DeliveryStatus): string {
    const colors: Record<DeliveryStatus, string> = {
      PENDING: '#f59e0b',
      CONFIRMED: '#3b82f6',
      PREPARING: '#8b5cf6',
      READY: '#6366f1',
      PICKED_UP: '#0ea5e9',
      IN_TRANSIT: '#0284c7',
      OUT_FOR_DELIVERY: '#22c55e',
      DELIVERED: '#059669',
      FAILED: '#dc2626',
      RETURNED: '#7c2d12',
      CANCELLED: '#9ca3af'
    };
    return colors[status] || '#64748b';
  }

  isActiveStatus(status: DeliveryStatus): boolean {
    return !['DELIVERED', 'CANCELLED', 'RETURNED'].includes(status);
  }
}
