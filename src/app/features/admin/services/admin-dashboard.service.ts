import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface DashboardStats {
  users: {
    total: number;
    byType: { [key: string]: number };
    byStatus: { [key: string]: number };
  };
  shops: {
    total: number;
    byStatus: { [key: string]: number };
  };
  leaseContracts: {
    total: number;
    byStatus: { [key: string]: number };
    expiringSoon: number;
  };
  rentPayments: {
    total: number;
    byStatus: { [key: string]: number };
    overdue: number;
    amounts: { [key: string]: number };
  };
  recentActivity: {
    users: any[];
    shops: any[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private endpoint = '/admin/dashboard';

  constructor(private apiService: ApiService) {}

  /**
   * Get comprehensive dashboard statistics
   */
  getDashboardStats(): Observable<{ success: boolean; data: DashboardStats }> {
    return this.apiService.get<{ success: boolean; data: DashboardStats }>(`${this.endpoint}/stats`);
  }
}
