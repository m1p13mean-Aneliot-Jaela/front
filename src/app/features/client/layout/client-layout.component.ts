import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

import { SharedModule } from '../../../shared/shared.module';
import { AuthService, User } from '../../../core/services/auth.service';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './client-layout.component.html',
  styleUrls: ['./client-layout.component.css']
})
export class ClientLayoutComponent {
  user$: Observable<User | null>;
  mobileMenuOpen = false;
  cartCount = 3;

  navItems = [
    { icon: '🏠', label: 'Accueil', route: '/client/home' },
    { icon: '🏪', label: 'Boutiques', route: '/client/shops' },
    { icon: '🔍', label: 'Rechercher', route: '/client/search' },
    { icon: '❤️', label: 'Favoris', route: '/client/favorites' },
    { icon: '📋', label: 'Commandes', route: '/client/orders' }
  ];

  constructor(private authService: AuthService) {
    this.user$ = this.authService.currentUser;
  }

  logout(): void {
    this.authService.logout();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
