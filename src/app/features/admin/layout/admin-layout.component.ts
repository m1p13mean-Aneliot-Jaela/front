import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent {
  user$: Observable<User | null>;
  sidebarCollapsed = false;

  menuItems: MenuItem[] = [
    { icon: '📊', label: 'Dashboard', route: '/admin/dashboard' },
    { 
      icon: '👥', 
      label: 'Utilisateurs', 
      route: '/admin/users/list'
    },
    { 
      icon: '🏪', 
      label: 'Boutiques', 
      expanded: false,
      children: [
        { label: '📋 Liste', route: '/admin/shops/list' },
        { label: '➕ Ajouter', route: '/admin/shops/add' },
        { label: '🏷️ Catégories', route: '/admin/shop-categories' },
        { label: '📦 Boxes', route: '/admin/shop-boxes' }
      ]
    },
    { 
      icon: '', 
      label: 'Contrats de Bail', 
      expanded: false,
      children: [
        { label: '📋 Liste', route: '/admin/lease-contracts' },
        { label: '➕ Ajouter', route: '/admin/lease-contracts/add' }
      ]
    },
    { 
      icon: '💰', 
      label: 'Paiements de Loyer', 
      expanded: false,
      children: [
        { label: '📋 Liste', route: '/admin/rent-payments' },
        { label: '➕ Ajouter', route: '/admin/rent-payments/add' }
      ]
    }
  ];

  constructor(private authService: AuthService) {
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
