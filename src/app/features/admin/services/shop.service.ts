import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Shop, ShopFilters, ShopResponse } from '../../../shared/models/shop.model';

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  private endpoint = '/admin/shops';

  constructor(private apiService: ApiService) {}

  getAllShops(): Observable<ShopResponse> {
    return this.apiService.get<ShopResponse>(this.endpoint);
  }

  getShopById(id: string): Observable<ShopResponse> {
    return this.apiService.get<ShopResponse>(`${this.endpoint}/${id}`);
  }

  createShop(shop: any): Observable<ShopResponse> {
    return this.apiService.post<ShopResponse>(this.endpoint, shop);
  }

  updateShop(id: string, shop: any): Observable<ShopResponse> {
    return this.apiService.put<ShopResponse>(`${this.endpoint}/${id}`, shop);
  }

  deleteShop(id: string): Observable<ShopResponse> {
    return this.apiService.delete<ShopResponse>(`${this.endpoint}/${id}`);
  }
}
