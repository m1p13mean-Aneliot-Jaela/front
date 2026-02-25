import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { FormsModule } from '@angular/forms';

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
  opening_time?: {
    [key: string]: { open: string; close: string };
  };
}

interface Product {
  _id: string;
  name: string;
  description?: string;
  unit_price: number;
  cost_price?: number;
  images?: string[];
  image_url?: string;
  category_id?: {
    _id?: string;
    name?: string;
  };
  stock_quantity?: number;
  is_available?: boolean;
  categories?: Array<{
    category_id?: { name?: string };
    name?: string;
  }>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

@Component({
  selector: 'app-shop-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page-container" *ngIf="shop">
      <!-- Shop Header -->
      <div class="shop-header">
        <a routerLink="/client/shops" class="back-link">← Retour aux boutiques</a>
        <div class="shop-info-header">
          <div class="shop-logo">
            <img *ngIf="shop.logo" [src]="shop.logo" [alt]="shop.shop_name" />
            <span *ngIf="!shop.logo">🏪</span>
          </div>
          <div class="shop-details">
            <h1>{{ shop.shop_name }}</h1>
            <p class="description" *ngIf="shop.description">{{ shop.description }}</p>
            <p class="location" *ngIf="shop.mall_location">
              📍 {{ shop.mall_location }}
            </p>
            <div class="rating" *ngIf="shop.review_stats?.average_rating">
              ⭐ {{ shop.review_stats?.average_rating?.toFixed(1) }} 
              ({{ shop.review_stats?.total_reviews }} avis)
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="filters-section">
        <h3>🔍 Rechercher des produits</h3>
        <div class="filters-grid">
          <!-- Search by name -->
          <div class="filter-input">
            <label>Nom du produit</label>
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              (input)="onFilterChange()"
              placeholder="Rechercher..."
            />
          </div>

          <!-- Price range -->
          <div class="filter-input price-range">
            <label>Prix (Ar)</label>
            <div class="price-inputs">
              <input 
                type="number" 
                [(ngModel)]="minPrice" 
                (input)="onFilterChange()"
                placeholder="Min"
              />
              <span>-</span>
              <input 
                type="number" 
                [(ngModel)]="maxPrice" 
                (input)="onFilterChange()"
                placeholder="Max"
              />
            </div>
          </div>

          <!-- Category filter -->
          <div class="filter-input">
            <label>Catégorie</label>
            <select [(ngModel)]="selectedCategory" (change)="onFilterChange()">
              <option value="">Toutes les catégories</option>
              <option *ngFor="let cat of categories" [value]="cat._id || cat.name">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- Sort -->
          <div class="filter-input">
            <label>Trier par</label>
            <select [(ngModel)]="sortBy" (change)="onFilterChange()">
              <option value="newest">Plus récents</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="name">Nom A-Z</option>
            </select>
          </div>
        </div>

        <!-- Clear filters -->
        <button class="btn-clear" (click)="clearFilters()" *ngIf="hasActiveFilters()">
          🗑️ Réinitialiser les filtres
        </button>
      </div>

      <!-- Products Section -->
      <div class="products-section">
        <div class="section-header">
          <h2>Produits ({{ pagination.total }})</h2>
          <span class="results-info" *ngIf="pagination.pages > 1">
            Page {{ pagination.page }} sur {{ pagination.pages }}
          </span>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="loading">
          Chargement des produits...
        </div>

        <!-- No results -->
        <div *ngIf="!loading && products.length === 0" class="no-results">
          <p>Aucun produit trouvé</p>
          <button class="btn-clear" (click)="clearFilters()">
            Réinitialiser les filtres
          </button>
        </div>

        <!-- Products Grid -->
        <div class="products-grid" *ngIf="!loading && products.length > 0">
          <div class="product-card" *ngFor="let product of products" (click)="viewProduct(product._id)">
            <div class="product-image">
              <img *ngIf="product.images && product.images.length > 0" [src]="product.images[0]" [alt]="product.name" />
              <span *ngIf="!product.images || product.images.length === 0" class="product-emoji">📦</span>
              <span class="badge-sale" *ngIf="product.cost_price && product.cost_price > product.unit_price">
                -{{ getDiscountPercent(product) }}%
              </span>
              <span class="badge-out" *ngIf="product.stock_quantity === 0 || !product.is_available">
                Indisponible
              </span>
            </div>
            <div class="product-info">
              <h4>{{ product.name }}</h4>
              <p class="category" *ngIf="product.category_id?.name">
                {{ product.category_id?.name }}
              </p>
              <div class="price-row">
                <span class="price">{{ product.unit_price?.toLocaleString() }} Ar</span>
                <span class="original-price" *ngIf="product.cost_price && product.cost_price > product.unit_price">
                  {{ product.cost_price?.toLocaleString() }} Ar
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination" *ngIf="pagination.pages > 1">
          <button 
            (click)="changePage(pagination.page - 1)" 
            [disabled]="pagination.page === 1"
            class="btn-page"
          >
            ← Précédent
          </button>
          <span class="page-info">
            Page {{ pagination.page }} / {{ pagination.pages }}
          </span>
          <button 
            (click)="changePage(pagination.page + 1)" 
            [disabled]="pagination.page === pagination.pages"
            class="btn-page"
          >
            Suivant →
          </button>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div *ngIf="error" class="error-container">
      <p>{{ error }}</p>
      <a routerLink="/client/shops">Retour aux boutiques</a>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1.5rem;
    }

    /* Shop Header */
    .shop-header {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      color: white;
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
    }
    .back-link {
      color: rgba(255,255,255,0.9);
      text-decoration: none;
      display: inline-block;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
    .back-link:hover {
      color: white;
    }
    .shop-info-header {
      display: flex;
      gap: 1.5rem;
      align-items: flex-start;
    }
    .shop-logo {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      font-size: 2.5rem;
      flex-shrink: 0;
    }
    .shop-logo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .shop-details h1 {
      margin: 0 0 0.5rem 0;
      font-size: 1.75rem;
    }
    .description {
      margin: 0 0 0.5rem 0;
      opacity: 0.9;
      line-height: 1.5;
    }
    .location {
      margin: 0 0 0.5rem 0;
      font-size: 0.9rem;
      opacity: 0.9;
    }
    .rating {
      font-size: 0.9rem;
      opacity: 0.9;
    }

    /* Filters */
    .filters-section {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
    .filters-section h3 {
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
      color: #1e293b;
    }
    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .filter-input {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .filter-input label {
      font-size: 0.85rem;
      color: #64748b;
      font-weight: 500;
    }
    .filter-input input,
    .filter-input select {
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.9rem;
    }
    .filter-input input:focus,
    .filter-input select:focus {
      outline: none;
      border-color: #8b5cf6;
    }
    .price-inputs {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .price-inputs input {
      flex: 1;
      min-width: 0;
    }
    .btn-clear {
      background: #f1f5f9;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      color: #64748b;
    }
    .btn-clear:hover {
      background: #e2e8f0;
    }

    /* Products */
    .products-section {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .section-header h2 {
      margin: 0;
      font-size: 1.25rem;
      color: #1e293b;
    }
    .results-info {
      color: #64748b;
      font-size: 0.9rem;
    }
    .loading, .no-results {
      text-align: center;
      padding: 3rem;
      color: #64748b;
    }

    /* Products Grid */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.5rem;
    }
    .product-card {
      background: white;
      border: 1px solid #f1f5f9;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .product-image {
      height: 180px;
      background: #f8fafc;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .product-emoji {
      font-size: 4rem;
    }
    .badge-sale {
      position: absolute;
      top: 8px;
      left: 8px;
      background: #dc2626;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .badge-out {
      position: absolute;
      top: 8px;
      right: 8px;
      background: #64748b;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
    }
    .product-info {
      padding: 1rem;
    }
    .product-info h4 {
      margin: 0 0 0.25rem 0;
      font-size: 0.95rem;
      color: #1e293b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .product-info .category {
      margin: 0 0 0.5rem 0;
      font-size: 0.8rem;
      color: #8b5cf6;
    }
    .price-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .price {
      font-weight: 600;
      color: #1e293b;
      font-size: 1rem;
    }
    .original-price {
      text-decoration: line-through;
      color: #94a3b8;
      font-size: 0.85rem;
    }

    /* Pagination */
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #f1f5f9;
    }
    .btn-page {
      padding: 0.5rem 1rem;
      border: 1px solid #e2e8f0;
      background: white;
      border-radius: 6px;
      cursor: pointer;
    }
    .btn-page:hover:not(:disabled) {
      background: #f8fafc;
    }
    .btn-page:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .page-info {
      color: #64748b;
      font-size: 0.9rem;
    }

    /* Error */
    .error-container {
      text-align: center;
      padding: 3rem;
      color: #dc2626;
    }
    .error-container a {
      color: #8b5cf6;
      text-decoration: none;
    }

    @media (max-width: 768px) {
      .shop-info-header {
        flex-direction: column;
        text-align: center;
      }
      .filters-grid {
        grid-template-columns: 1fr;
      }
      .products-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class ShopDetailComponent implements OnInit {
  shop: Shop | null = null;
  products: Product[] = [];
  categories: any[] = [];
  loading = true;
  error: string | null = null;

  // Filters
  searchQuery = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  selectedCategory = '';
  sortBy = 'newest';

  // Pagination
  pagination: Pagination = {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  };

  private shopId: string = '';
  private filterTimeout: any;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.shopId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.shopId) {
      this.error = 'ID de boutique manquant';
      return;
    }
    this.loadShop();
    this.loadProducts();
  }

  loadShop(): void {
    this.http.get<{ success: boolean; data: Shop }>(
      `${environment.apiUrl}/shops/${this.shopId}/public`
    ).subscribe({
      next: (response) => {
        this.shop = response.data;
        // Extract categories from shop data
        if (this.shop.categories) {
          this.categories = this.shop.categories.map(c => ({
            _id: c.category_id?._id || c.name,
            name: c.category_id?.name || c.name
          })).filter(c => c.name);
        }
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de la boutique';
        console.error('Error loading shop:', err);
      }
    });
  }

  loadProducts(): void {
    this.loading = true;

    const params: any = {
      page: this.pagination.page,
      limit: this.pagination.limit
    };

    if (this.searchQuery) params.search = this.searchQuery;
    if (this.minPrice !== null) params.minPrice = this.minPrice;
    if (this.maxPrice !== null) params.maxPrice = this.maxPrice;
    if (this.selectedCategory) params.category = this.selectedCategory;

    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');

    this.http.get<{ success: boolean; data: { products: Product[]; pagination: Pagination } }>(
      `${environment.apiUrl}/shops/${this.shopId}/products?${queryString}`
    ).subscribe({
      next: (response) => {
        this.products = response.data.products;
        this.pagination = response.data.pagination;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des produits';
        this.loading = false;
        console.error('Error loading products:', err);
      }
    });
  }

  onFilterChange(): void {
    // Debounce filter changes
    clearTimeout(this.filterTimeout);
    this.filterTimeout = setTimeout(() => {
      this.pagination.page = 1; // Reset to first page on filter change
      this.loadProducts();
    }, 300);
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.selectedCategory = '';
    this.sortBy = 'newest';
    this.pagination.page = 1;
    this.loadProducts();
  }

  hasActiveFilters(): boolean {
    return !!this.searchQuery || 
           this.minPrice !== null || 
           this.maxPrice !== null || 
           !!this.selectedCategory;
  }

  changePage(page: number): void {
    if (page < 1 || page > this.pagination.pages) return;
    this.pagination.page = page;
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getDiscountPercent(product: Product): number {
    if (!product.cost_price || product.cost_price <= product.unit_price) return 0;
    return Math.round(((product.cost_price - product.unit_price) / product.cost_price) * 100);
  }

  viewProduct(productId: string): void {
    // Navigate to product detail
    window.location.href = `/client/products/${productId}`;
  }
}
