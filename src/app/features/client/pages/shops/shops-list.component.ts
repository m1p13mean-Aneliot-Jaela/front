import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';

interface Shop {
  _id: string;
  shop_name: string;
  description?: string;
  logo?: string;
  mall_location?: string;
  categories?: Array<{
    category_id?: {
      _id?: string;
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

interface ShopCategory {
  _id: string;
  name: string;
}

@Component({
  selector: 'app-shops-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Nos Boutiques</h1>
          <p class="page-subtitle">Découvrez toutes nos boutiques et trouvez vos produits préférés</p>
        </div>
      </div>
      
      <!-- Search & Filters -->
      <div class="filters-container">
        <div class="search-box">
          <span class="search-icon">⌕</span>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (input)="applyFilters()"
            placeholder="Rechercher une boutique..."
            class="search-input">
        </div>
        
        <div class="filter-row">
          <div class="select-wrapper">
            <select [(ngModel)]="selectedCategory" (change)="applyFilters()" class="filter-select">
              <option value="">Toutes les catégories</option>
              <option *ngFor="let cat of categories" [value]="cat._id">{{ cat.name }}</option>
            </select>
          </div>
          
          <button class="btn-reset" (click)="resetFilters()">
            <span class="btn-icon">↻</span>
            Réinitialiser
          </button>
        </div>
      </div>
      
      <!-- Loading -->
      <div *ngIf="loading" class="state-container loading">
        <div class="spinner"></div>
        <p>Chargement des boutiques...</p>
      </div>
      
      <!-- Error -->
      <div *ngIf="error" class="state-container error">
        <span class="state-icon">⚠</span>
        <p>{{ error }}</p>
      </div>
      
      <!-- Empty -->
      <div *ngIf="!loading && !error && filteredShops.length === 0" class="state-container empty">
        <span class="state-icon">⌕</span>
        <p>Aucune boutique trouvée</p>
        <button class="btn-secondary" (click)="resetFilters()">Réinitialiser les filtres</button>
      </div>
      
      <!-- Shops Grid -->
      <div class="shops-grid" *ngIf="!loading && filteredShops.length > 0">
        <div class="shop-card" *ngFor="let shop of filteredShops" (click)="viewShop(shop._id)">
          <div class="shop-image">
            <img *ngIf="shop.logo" [src]="shop.logo" [alt]="shop.shop_name" />
            <div *ngIf="!shop.logo" class="shop-placeholder">
              <span class="shop-emoji">▣</span>
            </div>
            <button class="btn-favorite" (click)="toggleFavorite($event, shop._id)" [class.active]="isFavorite(shop._id)">
              {{ isFavorite(shop._id) ? '★' : '☆' }}
            </button>
            <span class="status-badge" [class.open]="isOpen(shop)">
              {{ isOpen(shop) ? 'Ouvert' : 'Fermé' }}
            </span>
          </div>
          <div class="shop-info">
            <div class="shop-header">
              <h3>{{ shop.shop_name }}</h3>
              <span class="category-badge">{{ getCategoryName(shop) }}</span>
            </div>
            <p class="location" *ngIf="shop.mall_location">
              <span class="location-icon">●</span>
              {{ shop.mall_location }}
            </p>
            <div class="shop-footer">
              <div class="stats" *ngIf="shop.review_stats">
                <span *ngIf="shop.review_stats.average_rating" class="rating">
                  <span class="star-icon">★</span>
                  {{ shop.review_stats.average_rating.toFixed(1) }}
                </span>
                <span *ngIf="shop.review_stats.total_reviews" class="reviews">
                  ({{ shop.review_stats.total_reviews }} avis)
                </span>
              </div>
              <button class="btn-view">
                Voir →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Page Container */
    .page-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0;
    }

    /* Page Header */
    .page-header {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.8));
      border-radius: 24px;
      padding: 3rem 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 16px rgba(30, 41, 59, 0.08);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.5);
    }

    .header-content {
      max-width: 800px;
    }

    .page-title {
      font-family: 'Nunito', sans-serif;
      font-weight: 900;
      font-size: 2.5rem;
      color: #1e293b;
      margin: 0 0 0.5rem 0;
      letter-spacing: -0.02em;
    }

    .page-subtitle {
      font-family: 'Inter', sans-serif;
      font-size: 1.125rem;
      color: #64748B;
      margin: 0;
      line-height: 1.6;
    }

    /* Filters Container */
    .filters-container {
      background: white;
      border-radius: 20px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 16px rgba(30, 41, 59, 0.08);
      border: 1px solid rgba(226, 232, 240, 0.8);
    }

    /* Search Box */
    .search-box {
      position: relative;
      margin-bottom: 1rem;
    }

    .search-icon {
      position: absolute;
      left: 1.25rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1.25rem;
      color: #64748B;
      pointer-events: none;
      z-index: 1;
    }

    .search-input {
      width: 100%;
      padding: 1rem 1rem 1rem 3.5rem;
      font-family: 'Inter', sans-serif;
      font-size: 1rem;
      border: 2px solid #E2E8F0;
      border-radius: 50px;
      background: #F8FAFC;
      color: #1E293B;
      transition: all 0.3s ease;
      outline: none;
    }

    .search-input::placeholder {
      color: #94A3B8;
    }

    .search-input:focus {
      border-color: #3B82F6;
      background: white;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }

    /* Filter Row */
    .filter-row {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      align-items: center;
    }

    .select-wrapper {
      flex: 1;
      min-width: 200px;
      position: relative;
    }

    .filter-select {
      width: 100%;
      padding: 0.875rem 1.25rem;
      font-family: 'Inter', sans-serif;
      font-size: 0.9375rem;
      font-weight: 500;
      border: 2px solid #E2E8F0;
      border-radius: 50px;
      background: #F8FAFC;
      color: #1E293B;
      cursor: pointer;
      transition: all 0.3s ease;
      outline: none;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"8\"><path fill=\"%2364748B\" d=\"M0 0l6 8 6-8z\"/></svg>');
      background-repeat: no-repeat;
      background-position: right 1.25rem center;
      padding-right: 3rem;
    }

    .filter-select:hover {
      border-color: #CBD5E1;
      background: white;
    }

    .filter-select:focus {
      border-color: #3B82F6;
      background: white;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }

    .btn-reset {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 1.75rem;
      font-family: 'Nunito', sans-serif;
      font-weight: 700;
      font-size: 0.9375rem;
      border: 2px solid rgba(239, 68, 68, 0.3);
      border-radius: 50px;
      background: rgba(239, 68, 68, 0.1);
      color: #dc2626;
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;
    }

    .btn-reset:hover {
      background: #ef4444;
      border-color: #ef4444;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    .btn-icon {
      font-size: 1.1rem;
    }

    /* State Containers */
    .state-container {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 20px;
      box-shadow: 0 4px 16px rgba(30, 41, 59, 0.08);
    }

    .state-container p {
      font-family: 'Inter', sans-serif;
      font-size: 1.125rem;
      color: #64748B;
      margin: 1rem 0;
    }

    .state-icon {
      font-size: 4rem;
      display: block;
      margin-bottom: 1rem;
    }

    /* Loading Spinner */
    .spinner {
      width: 60px;
      height: 60px;
      margin: 0 auto 1.5rem;
      border: 4px solid rgba(59, 130, 246, 0.2);
      border-top-color: #3B82F6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 1.75rem;
      margin-top: 1rem;
      font-family: 'Nunito', sans-serif;
      font-weight: 700;
      font-size: 0.9375rem;
      border: 2px solid rgba(59, 130, 246, 0.3);
      border-radius: 50px;
      background: rgba(59, 130, 246, 0.1);
      color: #1D4ED8;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-secondary:hover {
      background: #3B82F6;
      border-color: #3B82F6;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    /* Shops Grid */
    .shops-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 2rem;
    }

    /* Shop Card */
    .shop-card {
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(30, 41, 59, 0.08);
      transition: all 0.3s ease;
      cursor: pointer;
      border: 2px solid transparent;
      position: relative;
    }

    .shop-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 32px rgba(30, 41, 59, 0.15);
      border-color: rgba(59, 130, 246, 0.3);
    }

    /* Shop Image */
    .shop-image {
      position: relative;
      height: 200px;
      background: linear-gradient(145deg, #1e293b, #0f172a);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .shop-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .shop-card:hover .shop-image img {
      transform: scale(1.1);
    }

    .shop-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .shop-emoji {
      font-size: 4rem;
      filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2));
    }

    /* Favorite Button */
    .btn-favorite {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(8px);
      font-size: 1.25rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      z-index: 2;
    }

    .btn-favorite:hover {
      transform: scale(1.15);
      background: white;
    }

    .btn-favorite.active {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      transform: scale(1.1);
    }

    /* Status Badge */
    .status-badge {
      position: absolute;
      top: 1rem;
      left: 1rem;
      padding: 0.5rem 1rem;
      border-radius: 50px;
      font-family: 'Nunito', sans-serif;
      font-size: 0.8125rem;
      font-weight: 700;
      background: rgba(220, 38, 38, 0.95);
      color: white;
      backdrop-filter: blur(8px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      z-index: 2;
    }

    .status-badge.open {
      background: rgba(16, 185, 129, 0.95);
    }

    /* Shop Info */
    .shop-info {
      padding: 1.5rem;
    }

    .shop-header {
      margin-bottom: 1rem;
    }

    h3 {
      font-family: 'Nunito', sans-serif;
      font-weight: 800;
      font-size: 1.25rem;
      color: #1e293b;
      margin: 0 0 0.75rem 0;
      line-height: 1.3;
    }

    .category-badge {
      display: inline-block;
      padding: 0.375rem 0.875rem;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(29, 78, 216, 0.1));
      border: 1.5px solid rgba(59, 130, 246, 0.3);
      border-radius: 50px;
      font-family: 'Nunito', sans-serif;
      font-size: 0.8125rem;
      font-weight: 700;
      color: #1D4ED8;
      letter-spacing: 0.02em;
    }

    .location {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: 'Inter', sans-serif;
      color: #64748B;
      font-size: 0.9375rem;
      margin: 0 0 1rem 0;
    }

    .location-icon {
      font-size: 1rem;
    }

    /* Shop Footer */
    .shop-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 1rem;
      border-top: 2px solid #F1F5F9;
      gap: 1rem;
    }

    .stats {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: 'Inter', sans-serif;
      font-size: 0.875rem;
      flex: 1;
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: #1e293b;
      font-weight: 600;
    }

    .star-icon {
      font-size: 1rem;
    }

    .reviews {
      color: #64748B;
    }

    .btn-view {
      padding: 0.5rem 1.25rem;
      font-family: 'Nunito', sans-serif;
      font-weight: 700;
      font-size: 0.875rem;
      border: none;
      border-radius: 50px;
      background: linear-gradient(135deg, #3B82F6, #1D4ED8);
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;
    }

    .btn-view:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .shops-grid {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
      }
    }

    @media (max-width: 768px) {
      .page-header {
        padding: 2rem 1.5rem;
      }

      .page-title {
        font-size: 2rem;
      }

      .page-subtitle {
        font-size: 1rem;
      }

      .filters-container {
        padding: 1.25rem;
      }

      .filter-row {
        flex-direction: column;
      }

      .select-wrapper {
        width: 100%;
      }

      .btn-reset {
        width: 100%;
        justify-content: center;
      }

      .shops-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
    }

    @media (max-width: 480px) {
      .page-header {
        padding: 1.5rem 1rem;
        margin-bottom: 1.5rem;
      }

      .page-title {
        font-size: 1.75rem;
      }

      .filters-container {
        padding: 1rem;
      }

      .search-input {
        font-size: 0.9375rem;
      }

      .shop-image {
        height: 160px;
      }

      .shop-info {
        padding: 1.25rem;
      }

      h3 {
        font-size: 1.125rem;
      }

      .shop-footer {
        flex-direction: column;
        align-items: stretch;
      }

      .btn-view {
        width: 100%;
      }
    }
  `]
})
export class ShopsListComponent implements OnInit {
  shops: Shop[] = [];
  filteredShops: Shop[] = [];
  categories: ShopCategory[] = [];
  loading = true;
  error: string | null = null;
  
  // Filters
  searchQuery = '';
  selectedCategory = '';
  
  // Favorites (stored in localStorage for now)
  favoriteShops: string[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadFavorites();
    this.loadCategories();
    this.loadShops();
  }
  
  loadFavorites(): void {
    const favs = localStorage.getItem('favoriteShops');
    this.favoriteShops = favs ? JSON.parse(favs) : [];
  }
  
  saveFavorites(): void {
    localStorage.setItem('favoriteShops', JSON.stringify(this.favoriteShops));
  }
  
  isFavorite(shopId: string): boolean {
    return this.favoriteShops.includes(shopId);
  }
  
  toggleFavorite(event: Event, shopId: string): void {
    event.stopPropagation();
    if (this.isFavorite(shopId)) {
      this.favoriteShops = this.favoriteShops.filter(id => id !== shopId);
    } else {
      this.favoriteShops.push(shopId);
    }
    this.saveFavorites();
  }
  
  loadCategories(): void {
    this.http.get<{ success: boolean; data: any[] }>(
      `${environment.apiUrl}/shop-categories`
    ).subscribe({
      next: (response) => {
        this.categories = response.data || [];
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  loadShops(): void {
    this.loading = true;
    this.error = null;

    this.http.get<{ success: boolean; data: Shop[] }>(
      `${environment.apiUrl}/shops/public`
    ).subscribe({
      next: (response) => {
        this.shops = response.data || [];
        this.filteredShops = [...this.shops];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des boutiques';
        this.loading = false;
        console.error('Error loading shops:', err);
      }
    });
  }
  
  applyFilters(): void {
    let result = [...this.shops];
    
    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(shop => 
        shop.shop_name.toLowerCase().includes(query) ||
        (shop.description && shop.description.toLowerCase().includes(query)) ||
        (shop.mall_location && shop.mall_location.toLowerCase().includes(query))
      );
    }
    
    // Filter by category
    if (this.selectedCategory) {
      result = result.filter(shop => 
        shop.categories?.some(cat => 
          cat.category_id?._id === this.selectedCategory || 
          cat.category_id?.name === this.selectedCategory
        )
      );
    }
    
    this.filteredShops = result;
  }
  
  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.filteredShops = [...this.shops];
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
    window.location.href = `/client/shops/${shopId}`;
  }
}
