import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { 
  ShopBox, 
  CreateShopBoxDto, 
  UpdateShopBoxDto, 
  UpdateShopBoxStatusDto,
  AssignShopDto,
  ShopBoxResponse,
  ShopBoxFilters
} from '../../../shared/models/shop-box.model';

@Injectable({
  providedIn: 'root'
})
export class ShopBoxService {
  private endpoint = '/shop-boxes';

  constructor(private apiService: ApiService) {}

  // Get all shop boxes with optional filters
  getAllShopBoxes(filters?: ShopBoxFilters): Observable<ShopBoxResponse> {
    let queryParams = '';
    if (filters) {
      const params = [];
      if (filters.status) params.push(`status=${filters.status}`);
      if (filters.shop_id) params.push(`shop_id=${filters.shop_id}`);
      if (filters.ref) params.push(`ref=${filters.ref}`);
      if (filters.page) params.push(`page=${filters.page}`);
      if (filters.limit) params.push(`limit=${filters.limit}`);
      if (params.length > 0) {
        queryParams = '?' + params.join('&');
      }
    }
    return this.apiService.get<ShopBoxResponse>(`${this.endpoint}${queryParams}`);
  }

  // Get available shop boxes
  getAvailableShopBoxes(): Observable<ShopBoxResponse> {
    return this.apiService.get<ShopBoxResponse>(`${this.endpoint}/available`);
  }

  // Get shop box by ID
  getShopBoxById(id: string): Observable<ShopBoxResponse> {
    return this.apiService.get<ShopBoxResponse>(`${this.endpoint}/${id}`);
  }

  // Get shop boxes by shop ID
  getShopBoxesByShopId(shopId: string): Observable<ShopBoxResponse> {
    return this.apiService.get<ShopBoxResponse>(`${this.endpoint}/by-shop/${shopId}`);
  }

  // Create new shop box
  createShopBox(shopBox: CreateShopBoxDto): Observable<ShopBoxResponse> {
    return this.apiService.post<ShopBoxResponse>(this.endpoint, shopBox);
  }

  // Update shop box
  updateShopBox(id: string, shopBox: UpdateShopBoxDto): Observable<ShopBoxResponse> {
    return this.apiService.put<ShopBoxResponse>(`${this.endpoint}/${id}`, shopBox);
  }

  // Update shop box status
  updateShopBoxStatus(id: string, statusData: UpdateShopBoxStatusDto): Observable<ShopBoxResponse> {
    return this.apiService.patch<ShopBoxResponse>(`${this.endpoint}/${id}/status`, statusData);
  }

  // Delete shop box
  deleteShopBox(id: string): Observable<ShopBoxResponse> {
    return this.apiService.delete<ShopBoxResponse>(`${this.endpoint}/${id}`);
  }

  // Assign shop to shop box
  assignShop(id: string, data: AssignShopDto): Observable<ShopBoxResponse> {
    return this.apiService.post<ShopBoxResponse>(`${this.endpoint}/${id}/assign`, data);
  }

  // Unassign shop from shop box
  unassignShop(id: string): Observable<ShopBoxResponse> {
    return this.apiService.post<ShopBoxResponse>(`${this.endpoint}/${id}/unassign`, {});
  }

  // Bulk assign shops
  bulkAssignShops(assignments: any[]): Observable<ShopBoxResponse> {
    return this.apiService.post<ShopBoxResponse>(`${this.endpoint}/bulk-assign`, { assignments });
  }
}
