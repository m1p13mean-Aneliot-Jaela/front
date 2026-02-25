import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface Shop {
  _id: string;
  shop_name: string;
  description?: string;
  logo?: string;
  mall_location?: string;
  categories?: Array<{
    category_id?: {
      name?: string;
    };
    name?: string;
  }>;
  review_stats?: {
    average_rating?: number;
    total_reviews?: number;
  };
  current_status?: {
    status?: string;
  };
}

@Component({
  selector: 'app-shops-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h2>Nos Boutiques</h2>
      
      <!-- Loading -->
      <div *ngIf="loading" class="loading">
        Chargement des boutiques...
      </div>
      
      <!-- Error -->
      <div *ngIf="error" class="error">
        {{ error }}
      </div>
      
      <!-- Empty -->
      <div *ngIf="!loading && !error && shops.length === 0" class="empty">
        Aucune boutique disponible pour le moment.
      </div>
      
      <!-- Shops Grid -->
      <div class="shops-grid" *ngIf="!loading && shops.length > 0">
        <div class="shop-card" *ngFor="let shop of shops" (click)="viewShop(shop._id)">
          <div class="shop-image">
            <img *ngIf="shop.logo" [src]="shop.logo" [alt]="shop.shop_name" />
            <span *ngIf="!shop.logo" class="shop-emoji">🏪</span>
          </div>
          <div class="shop-info">
            <h3>{{ shop.shop_name }}</h3>
            <p class="category">{{ getCategoryName(shop) }}</p>
            <p class="location" *ngIf="shop.mall_location">
              📍 {{ shop.mall_location }}
            </p>
            <div class="stats" *ngIf="shop.review_stats">
              <span *ngIf="shop.review_stats.average_rating">
                ⭐ {{ shop.review_stats.average_rating.toFixed(1) }}
              </span>
              <span *ngIf="shop.review_stats.total_reviews">
                ({{ shop.review_stats.total_reviews }} avis)
              </span>
            </div>
            <span class="status-badge" [class.open]="isOpen(shop)">
              {{ isOpen(shop) ? 'Ouvert' : 'Fermé' }}
            </span>
          </div>
        </div>
      </div>
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
    .shops-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    .shop-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: transform 0.2s;
      cursor: pointer;
    }
    .shop-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .shop-image {
      height: 150px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .shop-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .shop-emoji {
      font-size: 3rem;
    }
    .shop-info {
      padding: 1rem;
    }
    h3 {
      margin: 0 0 0.5rem 0;
      color: #1e293b;
      font-size: 1.125rem;
    }
    .category {
      color: #8b5cf6;
      font-size: 0.875rem;
      margin: 0 0 0.5rem 0;
      font-weight: 500;
    }
    .location {
      color: #64748b;
      font-size: 0.875rem;
      margin: 0 0 0.75rem 0;
    }
    .stats {
      display: flex;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #64748b;
      margin-bottom: 0.75rem;
    }
    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
      background: #fee2e2;
      color: #dc2626;
    }
    .status-badge.open {
      background: #dcfce7;
      color: #16a34a;
    }
  `]
})
export class ShopsListComponent implements OnInit {
  shops: Shop[] = [];
  loading = true;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadShops();
  }

  loadShops(): void {
    this.loading = true;
    this.error = null;

    this.http.get<{ success: boolean; data: Shop[] }>(
      `${environment.apiUrl}/shops`
    ).subscribe({
      next: (response) => {
        this.shops = response.data || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des boutiques';
        this.loading = false;
        console.error('Error loading shops:', err);
      }
    });
  }

  getCategoryName(shop: Shop): string {
    if (!shop.categories || shop.categories.length === 0) {
      return 'Boutique';
    }
    const category = shop.categories[0];
    return category.category_id?.name || category.name || 'Boutique';
  }

  isOpen(shop: Shop): boolean {
    return shop.current_status?.status === 'active' || 
           shop.current_status?.status === 'open';
  }

  viewShop(shopId: string): void {
    // Navigate to shop detail page
    window.location.href = `/client/shops/${shopId}`;
  }
}
