import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { RentPayment, RentPaymentResponse, RentPaymentFilters, RentPaymentStatistics } from '../../../shared/models/rent-payment.model';

@Injectable({
  providedIn: 'root'
})
export class RentPaymentService {
  private endpoint = '/admin/rent-payments';

  constructor(private apiService: ApiService) {}

  /**
   * Get all rent payments with optional filters
   */
  getAllRentPayments(filters?: RentPaymentFilters): Observable<RentPaymentResponse> {
    let url = this.endpoint;
    
    if (filters) {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.contract_id) params.append('contract_id', filters.contract_id);
      if (filters.shop_id) params.append('shop_id', filters.shop_id);
      if (filters.method) params.append('method', filters.method);
      if (filters.due_date_from) params.append('due_date_from', filters.due_date_from);
      if (filters.due_date_to) params.append('due_date_to', filters.due_date_to);
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    
    return this.apiService.get<RentPaymentResponse>(url);
  }

  /**
   * Get rent payment by ID
   */
  getRentPaymentById(id: string): Observable<RentPaymentResponse> {
    return this.apiService.get<RentPaymentResponse>(`${this.endpoint}/${id}`);
  }

  /**
   * Get rent payments by contract ID
   */
  getRentPaymentsByContract(contractId: string): Observable<RentPaymentResponse> {
    return this.apiService.get<RentPaymentResponse>(`${this.endpoint}/contract/${contractId}`);
  }

  /**
   * Get rent payments by shop ID
   */
  getRentPaymentsByShop(shopId: string): Observable<RentPaymentResponse> {
    return this.apiService.get<RentPaymentResponse>(`${this.endpoint}/shop/${shopId}`);
  }

  /**
   * Create new rent payment
   */
  createRentPayment(payment: Partial<RentPayment>): Observable<RentPaymentResponse> {
    return this.apiService.post<RentPaymentResponse>(this.endpoint, payment);
  }

  /**
   * Update rent payment
   */
  updateRentPayment(id: string, payment: Partial<RentPayment>): Observable<RentPaymentResponse> {
    return this.apiService.put<RentPaymentResponse>(`${this.endpoint}/${id}`, payment);
  }

  /**
   * Update payment status
   */
  updatePaymentStatus(id: string, status: string, reason?: string): Observable<RentPaymentResponse> {
    return this.apiService.patch<RentPaymentResponse>(`${this.endpoint}/${id}/status`, { status, reason });
  }

  /**
   * Delete rent payment
   */
  deleteRentPayment(id: string): Observable<RentPaymentResponse> {
    return this.apiService.delete<RentPaymentResponse>(`${this.endpoint}/${id}`);
  }

  /**
   * Get pending payments
   */
  getPendingPayments(): Observable<RentPaymentResponse> {
    return this.apiService.get<RentPaymentResponse>(`${this.endpoint}/pending`);
  }

  /**
   * Get overdue payments
   */
  getOverduePayments(): Observable<RentPaymentResponse> {
    return this.apiService.get<RentPaymentResponse>(`${this.endpoint}/overdue`);
  }

  /**
   * Get upcoming payments
   */
  getUpcomingPayments(days: number = 30): Observable<RentPaymentResponse> {
    return this.apiService.get<RentPaymentResponse>(`${this.endpoint}/upcoming/${days}`);
  }

  /**
   * Get payment statistics
   */
  getPaymentStatistics(filters?: { shop_id?: string; contract_id?: string }): Observable<{ success: boolean; data: RentPaymentStatistics }> {
    let url = `${this.endpoint}/statistics`;
    
    if (filters) {
      const params = new URLSearchParams();
      if (filters.shop_id) params.append('shop_id', filters.shop_id);
      if (filters.contract_id) params.append('contract_id', filters.contract_id);
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    
    return this.apiService.get<{ success: boolean; data: RentPaymentStatistics }>(url);
  }
}
