import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService, User } from '../../../core/services/auth.service';

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

  menuItems: MenuItem[] = [
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
      icon: '�', 
      label: 'Commandes', 
      expanded: false,
      children: [
        { label: '📋 Liste', route: '/shop/orders/list' }
      ]
    },
    { icon: '💰', label: 'Ventes', route: '/shop/sales' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.user$ = this.authService.currentUser;
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
