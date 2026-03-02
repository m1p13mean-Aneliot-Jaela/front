import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

import { SharedModule } from '../../../shared/shared.module';
import { AuthService, User } from '../../../core/services/auth.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './client-layout.component.html',
  styleUrls: ['./client-layout.component.css']
})
export class ClientLayoutComponent implements OnInit {
  user$: Observable<User | null>;
  mobileMenuOpen = false;
  cartCount = 0;

  navItems = [
    { icon: '🏠', label: 'Accueil', route: '/client/home' },
    { icon: '🏪', label: 'Boutiques', route: '/client/shops' },
    { icon: '🛒', label: 'Panier', route: '/client/cart' },
    { icon: '❤️', label: 'Favoris', route: '/client/favorites' },
    { icon: '📋', label: 'Commandes', route: '/client/orders' },
    { icon: '📝', label: 'Mes demandes', route: '/client/quote-requests' }
  ];

  constructor(
    private authService: AuthService,
    private cartService: CartService
  ) {
    this.user$ = this.authService.currentUser;
  }

  ngOnInit(): void {
    this.cartService.cart$.subscribe(cart => {
      this.cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    });
  }

  logout(): void {
    this.authService.logout();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
