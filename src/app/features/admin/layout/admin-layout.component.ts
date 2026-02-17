import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent {
  get user$() { return this.authService.currentUser; }
  sidebarCollapsed = false;

  menuItems = [
    { icon: '📊', label: 'Dashboard', route: '/admin/dashboard', active: true },
    { icon: '👥', label: 'Utilisateurs', route: '/admin/users', active: false },
    { icon: '🏪', label: 'Boutiques', route: '/admin/shops', active: false },
    { icon: '📦', label: 'Produits', route: '/admin/products', active: false },
    { icon: '📋', label: 'Rapports', route: '/admin/reports', active: false },
    { icon: '⚙️', label: 'Paramètres', route: '/admin/settings', active: false }
  ];

  constructor(private authService: AuthService) {}

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout(): void {
    this.authService.logout();
  }
}
