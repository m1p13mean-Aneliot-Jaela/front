import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';

import { PermissionService } from '../services/permission.service';
import { AuthService } from '../services/auth.service';

export type EmployeeRole = 'MANAGER_SHOP' | 'STAFF';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  constructor(
    private permissionService: PermissionService,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean | UrlTree {
    // Check authentication first
    if (!this.authService.isAuthenticated()) {
      return this.router.parseUrl('/login');
    }

    // Get required permission from route data
    const requiredPermission = route.data['permission'] as string | undefined;
    
    if (!requiredPermission) {
      return true; // No permission required
    }

    // Check if user has the required permission
    if (this.permissionService.hasPermission(requiredPermission as any)) {
      return true;
    }

    // Redirect to shop dashboard if no permission
    return this.router.parseUrl('/shop/dashboard');
  }
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeRoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean | UrlTree {
    // Check authentication first
    if (!this.authService.isAuthenticated()) {
      return this.router.parseUrl('/login');
    }

    // Get allowed roles from route data
    const allowedRoles = (route.data['employeeRoles'] as EmployeeRole[] | undefined) ?? [];
    
    if (allowedRoles.length === 0) {
      return true; // No specific role required
    }

    const user = this.authService.currentUserValue;
    
    // Admins and brands can access everything
    if (user?.user_type === 'admin' || user?.user_type === 'brand') {
      return true;
    }

    // Check if user has one of the allowed roles
    if (user?.role && allowedRoles.includes(user.role as EmployeeRole)) {
      return true;
    }

    // Redirect to shop dashboard if wrong role
    return this.router.parseUrl('/shop/dashboard');
  }
}
