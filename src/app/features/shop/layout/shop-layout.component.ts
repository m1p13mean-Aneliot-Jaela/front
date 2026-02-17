import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthService, User } from '../../../core/services/auth.service';
import { PermissionService } from '../../../core/services/permission.service';

interface SubMenuItem {
  label: string;
  route: string;
}

interface MenuItem {
  icon: string;
  label: string;
  route?: string;
  expanded?: boolean;
  children?: SubMenuItem[];
}

@Component({
  selector: 'app-shop-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './shop-layout.component.html',
  styleUrls: ['./shop-layout.component.css']
})
export class ShopLayoutComponent {
  user$: Observable<User | null>;
  sidebarCollapsed = false;

  // Full menu for managers/admins
  private fullMenuItems: MenuItem[] = [
    { icon: '📊', label: 'Dashboard', route: '/shop/dashboard' },
    { 
      icon: '📦', 
      label: 'Produits', 
      expanded: false,
      children: [
        { label: '📋 Liste', route: '/shop/products/list' },
        { label: '➕ Ajouter', route: '/shop/products/add' }
      ]
    },
    { 
      icon: '🛒', 
      label: 'Commandes', 
      expanded: false,
      children: [
        { label: '📋 Liste', route: '/shop/orders/list' }
      ]
    },
    { icon: '💰', label: 'Ventes', route: '/shop/sales' },
    { 
      icon: '👥', 
      label: 'Employés', 
      expanded: false,
      children: [
        { label: '📋 Liste', route: '/shop/employees/list' },
        { label: '➕ Ajouter', route: '/shop/employees/add' }
      ]
    }
  ];

  // Limited menu for STAFF (Dashboard, Produits, Commandes, Clients, Livraisons)
  private staffMenuItems: MenuItem[] = [
    { icon: '📊', label: 'Dashboard', route: '/shop/dashboard' },
    { 
      icon: '📦', 
      label: 'Produits', 
      expanded: false,
      children: [
        { label: '📋 Liste', route: '/shop/products/list' },
        { label: '➕ Ajouter', route: '/shop/products/add' }
      ]
    },
    { 
      icon: '🛒', 
      label: 'Commandes', 
      expanded: false,
      children: [
        { label: '📋 Liste', route: '/shop/orders/list' },
        { label: '➕ Ajouter', route: '/shop/orders/add' }
      ]
    },
    { 
      icon: '🚚', 
      label: 'Livraisons', 
      route: '/shop/deliveries/list'
    },
    { 
      icon: '👤', 
      label: 'Clients', 
      expanded: false,
      children: [
        { label: '📋 Liste', route: '/shop/clients/list' },
        { label: '➕ Ajouter', route: '/shop/clients/add' }
      ]
    }
  ];

  // Observable for filtered menu items
  menuItems$: Observable<MenuItem[]>;

  constructor(
    private authService: AuthService,
    private permissionService: PermissionService,
    private router: Router
  ) {
    this.user$ = this.authService.currentUser;
    
    // Filter menu items based on user role
    this.menuItems$ = this.user$.pipe(
      map(user => this.getMenuItemsForUser(user))
    );
  }

  private getMenuItemsForUser(user: User | null): MenuItem[] {
    if (!user) return this.staffMenuItems;
    
    // Admins and brands see full menu
    if (user.user_type === 'admin' || user.user_type === 'brand') {
      return this.fullMenuItems;
    }
    
    // MANAGER_SHOP sees full menu
    if (user.role === 'MANAGER_SHOP') {
      return this.fullMenuItems;
    }
    
    // STAFF sees limited menu (only Commandes)
    return this.staffMenuItems;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleMenu(item: MenuItem): void {
    if (item.children) {
      item.expanded = !item.expanded;
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
