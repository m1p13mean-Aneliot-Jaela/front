import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Product, ProductFilters, ProductResponse } from '../../../shared/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private endpoint = '/products';

  constructor(private apiService: ApiService) {}

  getAllProducts(filters?: ProductFilters): Observable<ProductResponse> {
    const params: any = {};
    if (filters) {
      if (filters.keyword) params.keyword = filters.keyword;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.shopId) params.shopId = filters.shopId;
      if (filters.status) params.status = filters.status;
    }
    return this.apiService.get<ProductResponse>(this.endpoint, params);
  }

  getProductById(id: string): Observable<ProductResponse> {
    return this.apiService.get<ProductResponse>(`${this.endpoint}/${id}`);
  }

  createProduct(product: Product): Observable<ProductResponse> {
    return this.apiService.post<ProductResponse>(this.endpoint, product);
  }

  updateProduct(id: string, product: Partial<Product>): Observable<ProductResponse> {
    return this.apiService.put<ProductResponse>(`${this.endpoint}/${id}`, product);
  }

  deleteProduct(id: string): Observable<ProductResponse> {
    return this.apiService.delete<ProductResponse>(`${this.endpoint}/${id}`);
  }
}
