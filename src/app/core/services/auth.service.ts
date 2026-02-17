import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

import { ApiService } from './api.service';

export type UserType = 'admin' | 'brand' | 'shop' | 'buyer';

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  user_type: UserType;
  phone?: string;
  profile_photo?: string;
  shop_id?: string;  // ← AJOUTÉ pour les employés de shop
  role?: 'MANAGER_SHOP' | 'STAFF';  // ← AJOUTÉ pour les permissions
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private api: ApiService,
    private router: Router
  ) {
    // Load user from localStorage (tokens are in HttpOnly cookies)
    this.currentUserSubject = new BehaviorSubject<User | null>(
      JSON.parse(localStorage.getItem('user') || 'null')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  signup(payload: { email: string; password: string; first_name: string; last_name: string; phone?: string }): Observable<any> {
    return this.api.post<any>('/auth/signup', payload, { withCredentials: true }).pipe(
      tap((res) => {
        const user: User | null = res?.data?.user || null;
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
      })
    );
  }

  login(credentials: any): Observable<any> {
    return this.api.post<any>('/auth/login', credentials, { withCredentials: true }).pipe(
      tap((res) => {
        const user: User | null = res?.data?.user || null;
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
      })
    );
  }

  logout(): void {
    // Call backend to clear cookies
    this.api.post('/auth/logout', {}, { withCredentials: true }).subscribe({
      next: () => {
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
      },
      error: () => {
        // Even if API fails, clear local state
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
      }
    });
  }

  isAuthenticated(): boolean {
    // Check if we have user data (actual auth check is done via cookies on backend)
    return !!this.currentUserValue;
  }

  getUserType(): UserType | null {
    return this.currentUserValue?.user_type || null;
  }

  // Redirection selon le rôle
  redirectByRole(): void {
    const userType = this.getUserType();
    if (!userType) {
      this.router.navigate(['/login']);
      return;
    }

    const routes: Record<UserType, string> = {
      admin: '/admin/dashboard',
      brand: '/shop/dashboard',
      shop: '/shop/dashboard',
      buyer: '/app/home'
    };

    this.router.navigate([routes[userType]]);
  }
}
