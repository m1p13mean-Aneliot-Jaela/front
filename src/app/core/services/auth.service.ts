import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export type UserType = 'admin' | 'shop' | 'client';

export interface User {
  id: string;
  email: string;
  name: string;
  userType: UserType;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.currentUserSubject = new BehaviorSubject<User | null>(
      JSON.parse(localStorage.getItem('currentUser') || 'null')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Simulation locale de connexion
  simulateLogin(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>('/api/auth/login', credentials).pipe(
      tap(user => {
        if (user && user.token) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  getUserType(): UserType | null {
    return this.currentUserValue?.userType || null;
  }

  getToken(): string | null {
    const user = this.currentUserValue;
    return user ? user.token : null;
  }

  // Redirection selon le rôle
  redirectByRole(): void {
    const user = this.currentUserValue;
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    const routes: Record<UserType, string> = {
      admin: '/admin/dashboard',
      shop: '/shop/dashboard',
      client: '/app/dashboard'
    };

    this.router.navigate([routes[user.userType]]);
  }
}
