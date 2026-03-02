import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FavoritesService, FavoriteShop } from '../../services/favorites.service';
 
@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h2>Mes Favoris</h2>
      <div class="favorites-grid" *ngIf="favorites.length > 0; else empty">
        <div class="favorite-card" *ngFor="let item of favorites" (click)="viewShop(item)">
          <button class="remove-btn" (click)="remove($event, item.shop_id)" title="Retirer des favoris">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
          <div class="item-image">
            <img *ngIf="item.logo" [src]="item.logo" [alt]="item.shop_name">
            <span *ngIf="!item.logo" class="placeholder">🏪</span>
          </div>
          <div class="item-info">
            <h4>{{ item.shop_name }}</h4>
            <p class="shop" *ngIf="item.mall_location">📍 {{ item.mall_location }}</p>
          </div>
        </div>
      </div>
      <ng-template #empty>
        <div class="empty-state">
          <span class="icon">★</span>
          <p>Vous n'avez pas encore de favoris</p>
          <button class="btn-primary" (click)="discoverProducts()">Découvrir des produits</button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    h2 {
      margin-bottom: 1.5rem;
      color: #1e293b;
    }
    .favorites-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1.5rem;
    }
    .favorite-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      position: relative;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .favorite-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }
    .remove-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: white;
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: background 0.2s;
      z-index: 10;
    }
    .remove-btn:hover {
      background: #fee2e2;
      color: #ef4444;
    }
    .item-image {
      height: 180px;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .item-image .placeholder {
      font-size: 3rem;
    }
    .item-info {
      padding: 1rem;
    }
    h4 {
      margin: 0 0 0.25rem 0;
      color: #1e293b;
      font-size: 1rem;
      font-weight: 600;
    }
    .shop {
      color: #64748b;
      font-size: 0.875rem;
      margin: 0;
    }
    .price {
      color: #10b981;
      font-weight: 700;
      margin: 0.5rem 0 0 0;
      font-size: 1.1rem;
    }
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #64748b;
    }
    .empty-state .icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      display: block;
    }
    .btn-primary {
      margin-top: 1rem;
      padding: 0.75rem 1.5rem;
      background: #10b981;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.2s;
    }
    .btn-primary:hover {
      background: #059669;
    }
  `]
})
export class FavoritesComponent implements OnInit {
  favorites: FavoriteShop[] = [];
 
  constructor(
    private favoritesService: FavoritesService,
    private router: Router
  ) {}
 
  ngOnInit(): void {
    this.favoritesService.favorites$.subscribe(favs => {
      this.favorites = favs;
    });
  }
 
  remove(event: Event, shopId: string): void {
    event.stopPropagation();
    this.favoritesService.removeFromFavorites(shopId);
  }
 
  viewShop(item: FavoriteShop): void {
    this.router.navigate(['/client/shops', item.shop_id]);
  }
 
  discoverProducts(): void {
    this.router.navigate(['/client/shops']);
  }
}