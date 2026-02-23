import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';

import { AuthService, UserType } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean | UrlTree {
    const allowedRoles = (route.data['roles'] as UserType[] | undefined) ?? [];

    if (!this.authService.isAuthenticated()) {
      return this.router.parseUrl('/login');
    }

    if (allowedRoles.length === 0) {
      return true;
    }

    const userType = this.authService.getUserType();
    if (userType && allowedRoles.includes(userType)) {
      return true;
    }

    this.authService.redirectByRole();
    return false;
  }
}
