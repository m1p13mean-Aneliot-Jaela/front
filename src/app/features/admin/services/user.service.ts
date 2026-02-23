import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { 
  User, 
  CreateUserDto, 
  UpdateUserDto, 
  UpdateUserStatusDto,
  UserResponse,
  UserFilters
} from '../../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private endpoint = '/users';

  constructor(private apiService: ApiService) {}

  // Get all users with optional filters
  getAllUsers(filters?: UserFilters): Observable<UserResponse> {
    let queryParams = '';
    if (filters) {
      const params = [];
      if (filters.user_type) params.push(`user_type=${filters.user_type}`);
      if (filters.status) params.push(`status=${filters.status}`);
      if (filters.page) params.push(`page=${filters.page}`);
      if (filters.limit) params.push(`limit=${filters.limit}`);
      if (params.length > 0) {
        queryParams = '?' + params.join('&');
      }
    }
    return this.apiService.get<UserResponse>(`${this.endpoint}${queryParams}`);
  }

  // Get user by ID
  getUserById(id: string): Observable<UserResponse> {
    return this.apiService.get<UserResponse>(`${this.endpoint}/${id}`);
  }

  // Create new user
  createUser(user: CreateUserDto): Observable<UserResponse> {
    return this.apiService.post<UserResponse>(this.endpoint, user);
  }

  // Update user
  updateUser(id: string, user: UpdateUserDto): Observable<UserResponse> {
    return this.apiService.put<UserResponse>(`${this.endpoint}/${id}`, user);
  }

  // Update user status
  updateUserStatus(id: string, statusData: UpdateUserStatusDto): Observable<UserResponse> {
    return this.apiService.put<UserResponse>(`${this.endpoint}/${id}/status`, statusData);
  }

  // Delete user
  deleteUser(id: string): Observable<UserResponse> {
    return this.apiService.delete<UserResponse>(`${this.endpoint}/${id}`);
  }

  // Get user statistics (admin only)
  getUserStats(): Observable<any> {
    return this.apiService.get<any>(`${this.endpoint}/stats`);
  }

  // Assign user to shop (admin only)
  assignToShop(userId: string, shopId: string, role: 'MANAGER_SHOP' | 'STAFF'): Observable<UserResponse> {
    return this.apiService.put<UserResponse>(`${this.endpoint}/${userId}/shop`, {
      shop_id: shopId,
      role: role
    });
  }
}
