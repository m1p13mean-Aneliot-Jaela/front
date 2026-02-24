import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { LeaseContract, LeaseContractResponse, LeaseContractFilters } from '../../../shared/models/lease-contract.model';

@Injectable({
  providedIn: 'root'
})
export class LeaseContractService {
  private endpoint = '/admin/lease-contracts';

  constructor(private apiService: ApiService) {}

  /**
   * Get all lease contracts with optional filters
   */
  getAllLeaseContracts(filters?: LeaseContractFilters): Observable<LeaseContractResponse> {
    let url = this.endpoint;
    
    if (filters) {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.shop_id) params.append('shop_id', filters.shop_id);
      if (filters.payment_frequency) params.append('payment_frequency', filters.payment_frequency);
      if (filters.start_date_from) params.append('start_date_from', filters.start_date_from);
      if (filters.end_date_to) params.append('end_date_to', filters.end_date_to);
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    
    return this.apiService.get<LeaseContractResponse>(url);
  }

  /**
   * Get lease contract by ID
   */
  getLeaseContractById(id: string): Observable<LeaseContractResponse> {
    return this.apiService.get<LeaseContractResponse>(`${this.endpoint}/${id}`);
  }

  /**
   * Get lease contracts by shop ID
   */
  getLeaseContractsByShop(shopId: string): Observable<LeaseContractResponse> {
    return this.apiService.get<LeaseContractResponse>(`${this.endpoint}/shop/${shopId}`);
  }

  /**
   * Create new lease contract
   */
  createLeaseContract(contract: Partial<LeaseContract>): Observable<LeaseContractResponse> {
    return this.apiService.post<LeaseContractResponse>(this.endpoint, contract);
  }

  /**
   * Update lease contract
   */
  updateLeaseContract(id: string, contract: Partial<LeaseContract>): Observable<LeaseContractResponse> {
    return this.apiService.put<LeaseContractResponse>(`${this.endpoint}/${id}`, contract);
  }

  /**
   * Update contract status
   */
  updateContractStatus(id: string, status: string, reason?: string): Observable<LeaseContractResponse> {
    return this.apiService.patch<LeaseContractResponse>(`${this.endpoint}/${id}/status`, { status, reason });
  }

  /**
   * Delete lease contract
   */
  deleteLeaseContract(id: string): Observable<LeaseContractResponse> {
    return this.apiService.delete<LeaseContractResponse>(`${this.endpoint}/${id}`);
  }

  /**
   * Get active contracts
   */
  getActiveContracts(): Observable<LeaseContractResponse> {
    return this.apiService.get<LeaseContractResponse>(`${this.endpoint}/active`);
  }

  /**
   * Get expiring contracts
   */
  getExpiringContracts(days: number = 30): Observable<LeaseContractResponse> {
    return this.apiService.get<LeaseContractResponse>(`${this.endpoint}/expiring/${days}`);
  }
}
