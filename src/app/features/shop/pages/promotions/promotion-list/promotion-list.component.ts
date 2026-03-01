import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PromotionService, Promotion, PromotionStats } from '../../../services/promotion.service';
import { ProductService, Product } from '../../../services/product.service';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-promotion-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="header-actions">
        <h2>Promotions</h2>
        <button class="btn-primary" (click)="addPromotion()">+ Créer Promo</button>
      </div>

      <!-- Stats Cards -->
      <div class="stats-cards" *ngIf="stats">
        <div class="stat-card active">
          <span class="stat-value">{{ stats.active }}</span>
          <span class="stat-label">Actives</span>
        </div>
        <div class="stat-card scheduled">
          <span class="stat-value">{{ stats.scheduled }}</span>
          <span class="stat-label">Programmées</span>
        </div>
        <div class="stat-card expired">
          <span class="stat-value">{{ stats.expired }}</span>
          <span class="stat-label">Expirées</span>
        </div>
        <div class="stat-card total">
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">Total</span>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <input type="text" 
               class="search-input" 
               placeholder="Rechercher promo..."
               [(ngModel)]="searchTerm"
               (ngModelChange)="applyFilters()">
        
        <select class="filter-select" [(ngModel)]="typeFilter" (ngModelChange)="applyFilters()">
          <option value="">Tous types</option>
          <option value="percentage">% Pourcentage</option>
          <option value="fixed_amount">€ Montant fixe</option>
        </select>

        <select class="filter-select" [(ngModel)]="statusFilter" (ngModelChange)="applyFilters()">
          <option value="">Tous statuts</option>
          <option value="active">Active</option>
          <option value="scheduled">Programmée</option>
          <option value="expired">Expirée</option>
        </select>

        <button class="btn-filter" (click)="resetFilters()">Réinitialiser</button>
      </div>

      <!-- Promotions Table -->
      <div *ngIf="!loading && !error" class="promotions-table-container">
        <table class="promotions-table">
          <thead>
            <tr>
              <th>Code / Titre</th>
              <th>Produits</th>
              <th>Type</th>
              <th>Valeur</th>
              <th>Période</th>
              <th>Usage</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let promo of filteredPromotions">
              <!-- Code / Titre -->
              <td>
                <div class="promo-title">{{ promo.title }}</div>
                <div class="promo-code" *ngIf="promo.promo_code">
                  <span class="code-badge">{{ promo.promo_code }}</span>
                </div>
                <div class="promo-desc" *ngIf="promo.description">
                  {{ promo.description | slice:0:50 }}...
                </div>
              </td>

              <!-- Produits concernés -->
              <td>
                <div class="products-list" *ngIf="promo.applicable_products === 'ALL' || !promo.applicable_products">
                  <span class="badge all">🛍️ Tous les produits</span>
                </div>
                <div class="products-list" *ngIf="promo.applicable_products && promo.applicable_products !== 'ALL'">
                  <div class="product-names">{{ getProductNames(promo) }}</div>
                </div>
              </td>

              <!-- Type -->
              <td>
                <span class="type-badge" [class.percentage]="promo.type === 'percentage'" [class.fixed]="promo.type === 'fixed_amount'">
                  {{ promo.type === 'percentage' ? 'Pourcentage %' : 'Montant fixe' }}
                </span>
              </td>

              <!-- Valeur -->
              <td>
                <strong class="promo-value">
                  {{ promo.type === 'percentage' ? promo.value + '%' : (promo.value | number) + ' Ar' }}
                </strong>
              </td>

              <!-- Période -->
              <td>
                <div class="date-range">
                  <span class="date">{{ promo.start_date | date:'dd/MM/yy' }}</span>
                  <span class="separator">→</span>
                  <span class="date">{{ promo.end_date | date:'dd/MM/yy' }}</span>
                </div>
                <div class="days-left" *ngIf="getDaysLeft(promo) > 0">
                  {{ getDaysLeft(promo) }} jours restants
                </div>
                <div class="days-left expired" *ngIf="getDaysLeft(promo) <= 0">
                  Expirée
                </div>
              </td>

              <!-- Usage -->
              <td>
                <div class="usage-info">
                  <span class="usage-count">{{ promo.usage_count || 0 }}</span>
                  <span class="usage-limit" *ngIf="promo.usage_limit">/ {{ promo.usage_limit }}</span>
                  <span *ngIf="!promo.usage_limit">utilisations</span>
                </div>
                <div class="usage-bar" *ngIf="promo.usage_limit">
                  <div class="usage-progress" [style.width.%]="getUsagePercentage(promo)"></div>
                </div>
              </td>

              <!-- Statut -->
              <td>
                <span class="status-badge" 
                      [class.active]="promo.is_active && !isExpired(promo)"
                      [class.scheduled]="!promo.is_active && !isExpired(promo) && isFuture(promo)"
                      [class.expired]="isExpired(promo)">
                  {{ isExpired(promo) ? 'Expirée' : (promo.is_active ? 'Active' : 'Inactive') }}
                </span>
              </td>

              <!-- Actions -->
              <td>
                <div class="actions-cell">
                  <button class="btn-icon edit" (click)="editPromotion(promo._id!)" title="Modifier">✏️</button>
                  <button class="btn-icon toggle" 
                          (click)="toggleStatus(promo)" 
                          [class.active]="promo.is_active"
                          title="{{ promo.is_active ? 'Désactiver' : 'Activer' }}">
                    {{ promo.is_active ? '⏸️' : '▶️' }}
                  </button>
                  <button class="btn-icon delete" (click)="deletePromotion(promo._id!)" title="Supprimer">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="filteredPromotions.length === 0" class="empty-state">
          Aucune promotion trouvée
        </div>

        <!-- Pagination -->
        <div class="pagination" *ngIf="pagination.pages > 1">
          <button class="btn-page" (click)="changePage(pagination.page - 1)" [disabled]="pagination.page === 1">Précédent</button>
          <span class="page-info">Page {{ pagination.page }} / {{ pagination.pages }}</span>
          <button class="btn-page" (click)="changePage(pagination.page + 1)" [disabled]="pagination.page === pagination.pages">Suivant</button>
        </div>
      </div>

      <!-- Loading & Error -->
      <div *ngIf="loading" class="loading">Chargement...</div>
      <div *ngIf="error" class="error-message">{{ error }}</div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem;
    }

    /* Header */
    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    h2 {
      margin: 0;
      color: #1e293b;
    }
    .btn-primary {
      padding: 0.75rem 1.25rem;
      background: #8b5cf6;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
    }

    /* Stats Cards */
    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .stat-card {
      background: white;
      padding: 1rem;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .stat-card.active { border-left: 4px solid #059669; }
    .stat-card.scheduled { border-left: 4px solid #3b82f6; }
    .stat-card.expired { border-left: 4px solid #dc2626; }
    .stat-card.total { border-left: 4px solid #8b5cf6; }
    .stat-value {
      display: block;
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e293b;
    }
    .stat-label {
      font-size: 0.75rem;
      color: #64748b;
      text-transform: uppercase;
    }

    /* Filters */
    .filters-bar {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
    .search-input {
      padding: 0.625rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.875rem;
      width: 250px;
    }
    .filter-select {
      padding: 0.625rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.875rem;
      background: white;
    }
    .btn-filter {
      padding: 0.625rem 1rem;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      cursor: pointer;
      color: #64748b;
    }
    .btn-filter.active-promos {
      background: #fef3c7;
      color: #92400e;
      border-color: #f59e0b;
    }

    /* Table */
    .promotions-table-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .promotions-table {
      width: 100%;
      border-collapse: collapse;
    }
    .promotions-table th {
      background: #f8fafc;
      padding: 0.75rem 1rem;
      text-align: left;
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      border-bottom: 1px solid #e2e8f0;
    }
    .promotions-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #f1f5f9;
      font-size: 0.875rem;
      color: #1e293b;
    }
    .promotions-table tr:hover {
      background: #f8fafc;
    }

    /* Products List */
    .products-list {
      max-width: 200px;
    }
    .product-names {
      font-size: 0.75rem;
      color: #64748b;
      line-height: 1.4;
      max-height: 60px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .products-list .badge {
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .products-list .badge.all {
      background: #dbeafe;
      color: #1d4ed8;
    }

    /* Promo Info */
    .promo-title {
      font-weight: 500;
      color: #1e293b;
    }
    .promo-code {
      margin-top: 0.25rem;
    }
    .code-badge {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      color: white;
      padding: 0.125rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      font-family: monospace;
    }
    .promo-desc {
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 0.25rem;
    }

    /* Type Badge */
    .type-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .type-badge.percentage {
      background: #dbeafe;
      color: #1d4ed8;
    }
    .type-badge.fixed {
      background: #d1fae5;
      color: #059669;
    }

    /* Promo Value */
    .promo-value {
      font-size: 1.125rem;
      color: #1e293b;
    }

    /* Date Range */
    .date-range {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .date-range .separator {
      color: #94a3b8;
    }
    .days-left {
      font-size: 0.75rem;
      color: #059669;
      margin-top: 0.25rem;
    }
    .days-left.expired {
      color: #dc2626;
    }

    /* Usage */
    .usage-info {
      font-size: 0.875rem;
    }
    .usage-count {
      font-weight: 600;
    }
    .usage-limit {
      color: #64748b;
    }
    .usage-bar {
      width: 100%;
      height: 4px;
      background: #e2e8f0;
      border-radius: 2px;
      margin-top: 0.25rem;
      overflow: hidden;
    }
    .usage-progress {
      height: 100%;
      background: #8b5cf6;
      border-radius: 2px;
      transition: width 0.3s;
    }

    /* Status Badge */
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .status-badge.active {
      background: #d1fae5;
      color: #059669;
    }
    .status-badge.scheduled {
      background: #dbeafe;
      color: #1d4ed8;
    }
    .status-badge.expired {
      background: #fee2e2;
      color: #dc2626;
    }

    /* Actions */
    .actions-cell {
      display: flex;
      gap: 0.5rem;
    }
    .actions-cell .btn-icon {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      background: #f1f5f9;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    .actions-cell .btn-icon:hover {
      background: #e2e8f0;
    }
    .actions-cell .btn-icon.edit:hover {
      background: #dbeafe;
    }
    .actions-cell .btn-icon.delete:hover {
      background: #fee2e2;
    }
    .actions-cell .btn-icon.toggle:hover {
      background: #fef3c7;
    }

    /* Pagination */
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
    }
    .btn-page {
      padding: 0.5rem 1rem;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      cursor: pointer;
    }
    .btn-page:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .page-info {
      color: #64748b;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #64748b;
    }

    /* Loading & Error */
    .loading {
      text-align: center;
      padding: 2rem;
      color: #64748b;
    }
    .error-message {
      padding: 1rem;
      background: #fee2e2;
      color: #dc2626;
      border-radius: 8px;
    }
  `]
})
export class PromotionListComponent implements OnInit {
  promotions: Promotion[] = [];
  filteredPromotions: Promotion[] = [];
  stats: PromotionStats | null = null;
  
  searchTerm = '';
  typeFilter = '';
  statusFilter = '';
  
  loading = false;
  error: string | null = null;
  private shopId: string | null = null;
  products: Product[] = [];
  
  pagination = {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  };

  constructor(
    private promotionService: PromotionService,
    private productService: ProductService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user?.shop_id) {
      this.shopId = user.shop_id;
      this.loadProducts();
      this.loadPromotions();
      this.loadStats();
    } else {
      this.error = 'Shop ID non trouvé. Veuillez vous reconnecter.';
    }
  }

  loadProducts(): void {
    if (!this.shopId) return;
    this.productService.getProductsByShop(this.shopId, { limit: 100 }).subscribe({
      next: (response) => {
        this.products = response.data.products;
      },
      error: (err) => console.error('Error loading products:', err)
    });
  }

  loadPromotions(): void {
    if (!this.shopId) return;
    
    this.loading = true;
    this.promotionService.getPromotionsByShop(this.shopId, {
      page: this.pagination.page,
      limit: this.pagination.limit
    }).subscribe({
      next: (response) => {
        this.promotions = response.data.promotions;
        this.filteredPromotions = [...this.promotions];
        this.pagination = response.data.pagination;
        this.loading = false;
        this.applyFilters();
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des promotions';
        this.loading = false;
        console.error('Error loading promotions:', err);
      }
    });
  }

  loadStats(): void {
    if (!this.shopId) return;
    this.promotionService.getPromotionStats(this.shopId).subscribe({
      next: (response) => {
        this.stats = response.data;
      },
      error: (err) => console.error('Error loading stats:', err)
    });
  }

  applyFilters(): void {
    let result = [...this.promotions];
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(term) ||
        (p.promo_code && p.promo_code.toLowerCase().includes(term)) ||
        (p.description && p.description.toLowerCase().includes(term))
      );
    }
    
    if (this.typeFilter) {
      result = result.filter(p => p.type === this.typeFilter);
    }
    
    if (this.statusFilter) {
      result = result.filter(p => {
        if (this.statusFilter === 'active') return p.is_active && !this.isExpired(p);
        if (this.statusFilter === 'scheduled') return !p.is_active && !this.isExpired(p) && this.isFuture(p);
        if (this.statusFilter === 'expired') return this.isExpired(p);
        return true;
      });
    }
    
    this.filteredPromotions = result;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.typeFilter = '';
    this.statusFilter = '';
    this.loadPromotions();
  }

  changePage(page: number): void {
    this.pagination.page = page;
    this.loadPromotions();
  }

  addPromotion(): void {
    this.router.navigate(['/shop/promotions/add']);
  }

  editPromotion(id: string): void {
    this.router.navigate(['/shop/promotions/edit', id]);
  }

  toggleStatus(promo: Promotion): void {
    const newStatus = !promo.is_active;
    this.promotionService.togglePromotionStatus(promo._id!, newStatus).subscribe({
      next: () => {
        promo.is_active = newStatus;
        this.loadStats();
      },
      error: (err) => {
        console.error('Error toggling status:', err);
        alert('Erreur lors du changement de statut');
      }
    });
  }

  deletePromotion(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette promotion ?')) {
      this.promotionService.deletePromotion(id).subscribe({
        next: () => {
          this.promotions = this.promotions.filter(p => p._id !== id);
          this.applyFilters();
          this.loadStats();
        },
        error: (err) => {
          console.error('Error deleting promotion:', err);
          alert('Erreur lors de la suppression');
        }
      });
    }
  }

  isExpired(promo: Promotion): boolean {
    return new Date(promo.end_date) < new Date();
  }

  isFuture(promo: Promotion): boolean {
    return new Date(promo.start_date) > new Date();
  }

  getDaysLeft(promo: Promotion): number {
    const end = new Date(promo.end_date);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }

  getUsagePercentage(promo: Promotion): number {
    if (!promo.usage_limit || !promo.usage_count) return 0;
    return Math.min((promo.usage_count / promo.usage_limit) * 100, 100);
  }

  getProductsCount(promo: Promotion): number {
    if (promo.applicable_products === 'ALL' || !promo.applicable_products) return 0;
    if (Array.isArray(promo.applicable_products)) return promo.applicable_products.length;
    return 0;
  }

  getProductNames(promo: Promotion): string {
    if (promo.applicable_products === 'ALL' || !promo.applicable_products) return 'Tous les produits';
    if (Array.isArray(promo.applicable_products)) {
      const names = promo.applicable_products
        .map(id => this.products.find(p => p._id === id)?.name)
        .filter(name => name);
      return names.length > 0 ? names.join(', ') : `${promo.applicable_products.length} produit(s)`;
    }
    return '';
  }
}
