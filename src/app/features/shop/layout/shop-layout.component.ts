import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-shop-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './shop-layout.component.html',
  styleUrls: ['./shop-layout.component.css']
})
export class ShopLayoutComponent {
  get user$() { return this.authService.currentUser; }
  sidebarCollapsed = false;

  menuItems = [
    { icon: '📊', label: 'Dashboard', route: '/shop/dashboard', active: true },
    { icon: '📦', label: 'Produits', route: '/shop/products', active: false },
    { icon: '🛒', label: 'Commandes', route: '/shop/orders', active: false },
    { icon: '💰', label: 'Ventes', route: '/shop/sales', active: false },
    { icon: '⭐', label: 'Avis', route: '/shop/reviews', active: false },
    { icon: '⚙️', label: 'Paramètres', route: '/shop/settings', active: false }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout(): void {
    this.authService.logout();
  }
}
