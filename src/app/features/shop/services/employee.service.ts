import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface Employee {
  _id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  shop_id?: string;
  shop_name?: string;
  role: 'MANAGER_SHOP' | 'STAFF';
  active: boolean;
  joined_at?: string;
  last_login?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEmployeeRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  password: string;
  role: 'MANAGER_SHOP' | 'STAFF';
  shop_id: string;
}

export interface UpdateEmployeeRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  role?: 'MANAGER_SHOP' | 'STAFF';
  active?: boolean;
}

export interface UpdateStatusRequest {
  active: boolean;
}

export interface EmployeeListResponse {
  employees: Employee[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface EmployeeStats {
  total: number;
  byRole: {
    MANAGER_SHOP?: number;
    STAFF?: number;
  };
}

export interface EmployeePermissions {
  employee_id: string;
  role: string;
  permissions: {
    view_products: boolean;
    edit_products: boolean;
    delete_products: boolean;
    view_orders: boolean;
    process_orders: boolean;
    cancel_orders: boolean;
    view_sales: boolean;
    view_reports: boolean;
    manage_employees: boolean;
    manage_stock: boolean;
    manage_promotions: boolean;
  };
}

export interface CheckPermissionResponse {
  employee_id: string;
  permission: string;
  granted: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  constructor(private api: ApiService) {}

  // Create new employee
  createEmployee(employee: CreateEmployeeRequest): Observable<{ success: boolean; message: string; data: Employee }> {
    return this.api.post<{ success: boolean; message: string; data: Employee }>(
      `/shops/${employee.shop_id}/employees`,
      employee,
      { withCredentials: true }
    );
  }

  // Get all employees by shop
  getEmployeesByShop(
    shopId: string,
    options: {
      page?: number;
      limit?: number;
      role?: string;
      active?: boolean;
      search?: string;
    } = {}
  ): Observable<{ success: boolean; data: EmployeeListResponse }> {
    let params = new HttpParams();
    if (options.page) params = params.set('page', options.page.toString());
    if (options.limit) params = params.set('limit', options.limit.toString());
    if (options.role) params = params.set('role', options.role);
    if (options.active !== undefined) params = params.set('active', options.active.toString());
    if (options.search) params = params.set('search', options.search);

    return this.api.get<{ success: boolean; data: EmployeeListResponse }>(
      `/shops/${shopId}/employees`,
      params,
      { withCredentials: true }
    );
  }

  // Get employee by ID
  getEmployeeById(id: string): Observable<{ success: boolean; data: Employee }> {
    return this.api.get<{ success: boolean; data: Employee }>(
      `/employees/${id}`,
      undefined,
      { withCredentials: true }
    );
  }

  // Update employee
  updateEmployee(
    id: string,
    data: UpdateEmployeeRequest
  ): Observable<{ success: boolean; message: string; data: Employee }> {
    return this.api.put<{ success: boolean; message: string; data: Employee }>(
      `/employees/${id}`,
      data,
      { withCredentials: true }
    );
  }

  // Update employee status (activate/deactivate)
  updateEmployeeStatus(
    id: string,
    active: boolean
  ): Observable<{ success: boolean; message: string; data: Employee }> {
    return this.api.patch<{ success: boolean; message: string; data: Employee }>(
      `/employees/${id}/status`,
      { active },
      { withCredentials: true }
    );
  }

  // Delete employee
  deleteEmployee(id: string): Observable<{ success: boolean; message: string }> {
    return this.api.delete<{ success: boolean; message: string }>(
      `/employees/${id}`,
      { withCredentials: true }
    );
  }

  // Get employee stats
  getEmployeeStats(shopId: string): Observable<{ success: boolean; data: EmployeeStats }> {
    return this.api.get<{ success: boolean; data: EmployeeStats }>(
      `/shops/${shopId}/employees/stats`,
      undefined,
      { withCredentials: true }
    );
  }

  // Get employee permissions
  getEmployeePermissions(id: string): Observable<{ success: boolean; data: EmployeePermissions }> {
    return this.api.get<{ success: boolean; data: EmployeePermissions }>(
      `/employees/${id}/permissions`,
      undefined,
      { withCredentials: true }
    );
  }

  // Check specific permission
  checkPermission(id: string, permission: string): Observable<{ success: boolean; data: CheckPermissionResponse }> {
    return this.api.get<{ success: boolean; data: CheckPermissionResponse }>(
      `/employees/${id}/permissions/${permission}`,
      undefined,
      { withCredentials: true }
    );
  }
}
