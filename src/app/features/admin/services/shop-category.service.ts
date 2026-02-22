import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ShopCategory, ShopCategoryResponse } from '../../../shared/models/shop.model';

@Injectable({
  providedIn: 'root'
})
export class ShopCategoryService {
  private endpoint = '/shop-categories/admin';

  constructor(private apiService: ApiService) {}

  getAllCategories(): Observable<ShopCategoryResponse> {
    return this.apiService.get<ShopCategoryResponse>(this.endpoint);
  }

  getCategoryById(id: string): Observable<ShopCategoryResponse> {
    return this.apiService.get<ShopCategoryResponse>(`${this.endpoint}/${id}`);
  }

  searchCategories(query: string): Observable<ShopCategoryResponse> {
    return this.apiService.get<ShopCategoryResponse>(`${this.endpoint}/search?q=${query}`);
  }

  getCategoryTree(): Observable<ShopCategoryResponse> {
    return this.apiService.get<ShopCategoryResponse>(`${this.endpoint}/tree`);
  }

  getRootCategories(): Observable<ShopCategoryResponse> {
    return this.apiService.get<ShopCategoryResponse>(`${this.endpoint}/root`);
  }

  createCategory(category: ShopCategory): Observable<ShopCategoryResponse> {
    return this.apiService.post<ShopCategoryResponse>(this.endpoint, category);
  }

  updateCategory(id: string, category: Partial<ShopCategory>): Observable<ShopCategoryResponse> {
    return this.apiService.put<ShopCategoryResponse>(`${this.endpoint}/${id}`, category);
  }

  deleteCategory(id: string): Observable<ShopCategoryResponse> {
    return this.apiService.delete<ShopCategoryResponse>(`${this.endpoint}/${id}`);
  }
}
