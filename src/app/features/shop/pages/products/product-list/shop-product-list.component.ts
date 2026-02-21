import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, Product, ProductStats } from '../../../services/product.service';
import { PromotionService, Promotion } from '../../../services/promotion.service';
import { StockService, StockAlert } from '../../../services/stock.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { PermissionService } from '../../../../../core/services/permission.service';

@Component({
  selector: 'app-shop-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- Alertes Stock Faible -->
    <div *ngIf="lowStockProducts.length > 0" class="stock-alerts-banner">
      <div class="alert-header">
        <span class="alert-icon">⚠️</span>
        <strong>Alertes Stock Faible</strong>
        <span class="alert-count">({{ lowStockProducts.length }})</span>
      </div>
      <div class="alert-products">
        <span *ngFor="let product of lowStockProducts.slice(0, 3)" class="alert-chip">
          {{ product.name }} ({{ product.stock?.current_quantity || 0 }})
        </span>
        <span *ngIf="lowStockProducts.length > 3" class="alert-more">
          +{{ lowStockProducts.length - 3 }} autres
        </span>
      </div>
    </div>

    <div *ngIf="!loading && !error" class="products-table-container">
  <table class="products-table">
    <thead>
      <tr>
        <th>Image</th>
        <th>Produit</th>
        <th>Catégorie</th>
        <th>Prix</th>
        <th>Status</th>
        <th *ngIf="canManageProducts">Actions</th>
      </tr>
    </thead>

    <tbody>
      <tr *ngFor="let product of filteredProducts" 
          [class.banned-row]="product.is_banned">

        <!-- Image -->
        <td>
          <img *ngIf="product.image_url"
               [src]="product.image_url"
               class="table-thumbnail">
          <div *ngIf="!product.image_url" class="table-no-image">📦</div>
        </td>

        <!-- Nom + Description -->
        <td>
          <div class="product-name">{{ product.name }}</div>
          <div class="product-desc" *ngIf="product.description">
            {{ product.description | slice:0:40 }}...
          </div>
        </td>

        <!-- Catégorie -->
        <td>
          {{ product.categories?.[0]?.name || '—' }}
        </td>

        <!-- Prix -->
        <td>
          <div *ngIf="!getProductPromo(product)" class="price-regular">
            <strong>{{ product.unit_price | number }} Ar</strong>
          </div>
          <div *ngIf="getProductPromo(product) as promo" class="price-promo">
            <span class="original-price">{{ product.unit_price | number }} Ar</span>
            <span class="promo-price">{{ getPromoPrice(product, promo) | number }} Ar</span>
            <span class="discount-badge">-{{ getDiscountPercent(product, promo) }}%</span>
          </div>
        </td>

        <!-- Status -->
        <td>
          <span class="status-badge"
                [class.banned]="product.is_banned"
                [class.active]="!product.is_banned">
            {{ product.is_banned ? 'Banni' : 'Actif' }}
          </span>

          <span *ngIf="product.is_featured" class="featured-badge">⭐ Vedette</span>

          <span *ngIf="product.is_on_promo"
                class="promo-badge">
            🔥 Promo
          </span>
        </td>

        <!-- Actions -->
        <td *ngIf="canManageProducts">
          <div class="actions-cell">

            <button class="btn-icon"
                    (click)="quickStockUpdate(product)"
                    title="Voir stock">
              👁️
            </button>

            <button class="btn-icon edit"
                    (click)="editProduct(product._id!)"
                    title="Modifier">
              ✏️
            </button>

            <button class="btn-icon delete"
                    (click)="deleteProduct(product._id!)"
                    title="Supprimer">
              🗑️
            </button>

          </div>
        </td>

      </tr>
    </tbody>
  </table>

  <div *ngIf="filteredProducts.length === 0"
       class="empty-state">
    Aucun produit trouvé
  </div>
</div>

    <!-- Stock Modal -->
    <div *ngIf="showStockModal" class="modal-overlay" (click)="closeStockModal()">
      <div class="modal stock-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Gestion du Stock</h3>
          <p class="product-name">{{ selectedProduct?.name }}</p>
        </div>

        <!-- Stock Info -->
        <div class="stock-info" *ngIf="!stockLoading">
          <div class="current-stock">
            <span class="stock-label">Stock actuel:</span>
            <span class="stock-value" [class.in-stock]="selectedStock?.current_quantity > 10"
                  [class.low-stock]="selectedStock?.current_quantity <= 10 && selectedStock?.current_quantity > 0"
                  [class.out-stock]="!selectedStock || selectedStock?.current_quantity === 0">
              {{ selectedStock?.current_quantity ?? 0 }}
            </span>
          </div>
        </div>

        <!-- Stock Actions -->
        <div class="stock-actions-section" *ngIf="!stockLoading">
          <div class="action-tabs">
            <button class="tab-btn" [class.active]="stockAction === 'add'" (click)="stockAction = 'add'">➕ Entrée</button>
            <button class="tab-btn" [class.active]="stockAction === 'remove'" (click)="stockAction = 'remove'">➖ Sortie</button>
            <button class="tab-btn" [class.active]="stockAction === 'set'" (click)="stockAction = 'set'">✏️ Ajustement</button>
          </div>

          <div class="action-form">
            <div class="form-group">
              <label>Quantité:</label>
              <input type="number" class="form-control" [(ngModel)]="newStockQuantity" min="0">
            </div>
            <div class="form-group">
              <label>Raison (optionnel):</label>
              <input type="text" class="form-control" [(ngModel)]="stockReason" placeholder="Ex: Livraison fournisseur">
            </div>
            <button class="btn-primary" (click)="executeStockAction()">
              {{ stockAction === 'add' ? 'Ajouter au stock' : stockAction === 'remove' ? 'Retirer du stock' : 'Mettre à jour' }}
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div *ngIf="stockLoading" class="loading">
          Chargement des données...
        </div>

        <!-- Movements History -->
        <div class="movements-section" *ngIf="!stockLoading && stockMovements.length > 0">
          <h4>📋 Historique des mouvements</h4>
          <div class="movements-list">
            <div *ngFor="let movement of stockMovements.slice(0, 10)" class="movement-item">
              <span class="movement-type" [class.in]="movement.movement_type === 'IN'"
                    [class.out]="movement.movement_type === 'OUT'"
                    [class.adjust]="movement.movement_type === 'ADJUST'">
                {{ movement.movement_type === 'IN' ? '⬇️' : movement.movement_type === 'OUT' ? '⬆️' : '⚖️' }}
              </span>
              <span class="movement-qty">{{ movement.quantity }}</span>
              <span class="movement-reason">{{ movement.reason || '—' }}</span>
              <span class="movement-date">{{ movement.created_at | date:'dd/MM/yy HH:mm' }}</span>
              <span class="movement-staff">{{ movement.staff_name || '—' }}</span>
            </div>
          </div>
        </div>

        <div class="movements-section empty" *ngIf="!stockLoading && stockMovements.length === 0">
          <p>Aucun mouvement enregistré</p>
        </div>

        <div class="modal-actions">
          <button class="btn-secondary" (click)="closeStockModal()">Fermer</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem;
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
    .stat-card.featured { border-left: 4px solid #8b5cf6; }
    .stat-card.warning { border-left: 4px solid #f59e0b; }
    .stat-card.danger { border-left: 4px solid #dc2626; }
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

    /* Alerts Section */
    .alerts-section {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1.5rem;
    }
    .alerts-section h4 {
      margin: 0 0 0.5rem 0;
      color: #92400e;
    }
    .alert-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .alert-item {
      background: white;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      font-size: 0.875rem;
      display: flex;
      flex-direction: column;
    }
    .alert-item.out {
      background: #fee2e2;
      border: 1px solid #dc2626;
    }
    .alert-product {
      font-weight: 500;
      color: #1e293b;
    }
    .alert-stock {
      font-size: 0.75rem;
      color: #64748b;
    }

    /* Header Actions */
    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    h2 {
      color: #1e293b;
      margin: 0;
    }
    .actions {
      display: flex;
      gap: 0.5rem;
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

    /* Products Table */
    .products-table-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .products-table {
      width: 100%;
      border-collapse: collapse;
    }
    .products-table th {
      background: #f8fafc;
      padding: 0.75rem 1rem;
      text-align: left;
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      border-bottom: 1px solid #e2e8f0;
    }
    .products-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #f1f5f9;
      font-size: 0.875rem;
      color: #1e293b;
    }
    .products-table tr:hover {
      background: #f8fafc;
    }
    .products-table tr.banned-row {
      background: #fef2f2;
      opacity: 0.7;
    }
    .products-table tr.banned-row:hover {
      background: #fee2e2;
    }

    /* Table Image */
    .table-thumbnail {
      width: 48px;
      height: 48px;
      object-fit: cover;
      border-radius: 6px;
    }
    .table-no-image {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f1f5f9;
      border-radius: 6px;
      font-size: 1.25rem;
    }

    /* Product Name Cell */
    .product-name-cell .product-name {
      font-weight: 500;
      color: #1e293b;
    }
    .product-name-cell .product-desc {
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 0.25rem;
    }

    /* Price Cell */
    .price-cell .unit-price {
      font-weight: 600;
      color: #1e293b;
    }

    /* Promo Pricing */
    .price-promo {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .original-price {
      text-decoration: line-through;
      color: #94a3b8;
      font-size: 0.75rem;
    }
    .promo-price {
      font-weight: 700;
      color: #dc2626;
      font-size: 1rem;
    }
    .discount-badge {
      background: #fee2e2;
      color: #dc2626;
      padding: 0.125rem 0.375rem;
      border-radius: 4px;
      font-size: 0.625rem;
      font-weight: 700;
      width: fit-content;
    }

    /* Stock Badge */
    .stock-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
    }
    .stock-badge.in-stock {
      background: #d1fae5;
      color: #059669;
    }
    .stock-badge.low-stock {
      background: #fef3c7;
      color: #d97706;
    }
    .stock-badge.out-stock {
      background: #fee2e2;
      color: #dc2626;
    }

    /* Promo Cell */
    .stock-cell .stock-value {
      font-weight: 600;
      color: #1e293b;
    }

    /* Status Cell */
    .status-cell {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .status-cell .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
      width: fit-content;
    }
    .status-cell .status-badge.active {
      background: #d1fae5;
      color: #059669;
    }
    .status-cell .status-badge.banned {
      background: #fee2e2;
      color: #dc2626;
    }
    .status-cell .promo-indicator {
      background: #fef3c7;
      color: #d97706;
      padding: 0.125rem 0.375rem;
      border-radius: 4px;
      font-size: 0.625rem;
      font-weight: 600;
      width: fit-content;
    }

    /* Actions Cell */
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
    .actions-cell .btn-icon.stock:hover {
      background: #fef3c7;
    }
    .actions-cell .btn-icon.delete:hover {
      background: #fee2e2;
    }

    .stock-alerts-banner {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .alert-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #92400e;
      font-size: 0.875rem;
    }
    .alert-icon {
      font-size: 1rem;
    }
    .alert-count {
      background: #f59e0b;
      color: white;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .alert-products {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      flex: 1;
    }
    .alert-chip {
      background: white;
      border: 1px solid #fbbf24;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      color: #78350f;
      cursor: pointer;
    }
    .alert-chip:hover {
      background: #fffbeb;
    }
    .alert-more {
      font-size: 0.75rem;
      color: #92400e;
      padding: 0.25rem 0.5rem;
    }
    .featured-badge {
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      width: fit-content;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 3rem;
      color: #64748b;
    }

    /* Error & Loading */
    .error-message {
      padding: 1rem;
      background: #fee2e2;
      color: #dc2626;
      border-radius: 8px;
      margin-bottom: 1rem;
    }
    .loading {
      text-align: center;
      padding: 2rem;
      color: #64748b;
    }

    /* Pagination */
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
    }
    .btn-page {
      padding: 0.5rem 1rem;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      cursor: pointer;
    }
    .btn-page:disabled { opacity: 0.5; cursor: not-allowed; }
    .page-info { color: #64748b; }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      width: 500px;
      max-width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    }
    .modal.stock-modal {
      width: 600px;
    }
    .modal-header h3 { margin: 0 0 0.25rem 0; }
    .modal-header .product-name { 
      color: #64748b; 
      margin: 0 0 1rem 0;
      font-size: 0.875rem;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    .form-group label {
      display: block;
/* ... */
      width: 100%;
      padding: 0.625rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }

    /* Stock Info */
    .stock-info {
      background: #f8fafc;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }
    .current-stock {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .stock-label {
      font-size: 0.875rem;
      color: #64748b;
    }
    .stock-value {
      font-size: 1.5rem;
      font-weight: 700;
      padding: 0.25rem 1rem;
      border-radius: 8px;
    }
    .stock-value.in-stock { background: #d1fae5; color: #059669; }
    .stock-value.low-stock { background: #fef3c7; color: #d97706; }
    .stock-value.out-stock { background: #fee2e2; color: #dc2626; }

    /* Stock Actions */
    .stock-actions-section {
      margin-bottom: 1.5rem;
    }
    .action-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    .tab-btn {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid #e2e8f0;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
    }
    .tab-btn.active {
      background: #8b5cf6;
      color: white;
      border-color: #8b5cf6;
    }
    .action-form {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    /* Movements */
    .movements-section {
      border-top: 1px solid #e2e8f0;
      padding-top: 1rem;
    }
    .movements-section h4 {
      margin: 0 0 0.75rem 0;
      font-size: 0.875rem;
      color: #1e293b;
    }
    .movements-list {
      max-height: 200px;
      overflow-y: auto;
    }
    .movement-item {
      display: grid;
      grid-template-columns: 30px 50px 1fr 100px 80px;
      gap: 0.5rem;
      align-items: center;
      padding: 0.5rem;
      border-bottom: 1px solid #f1f5f9;
      font-size: 0.75rem;
    }
    .movement-type {
      font-size: 1rem;
    }
    .movement-type.in { color: #059669; }
    .movement-type.out { color: #dc2626; }
    .movement-type.adjust { color: #d97706; }
    .movement-qty {
      font-weight: 600;
      color: #1e293b;
    }
    .movement-reason {
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .movement-date {
      color: #94a3b8;
      font-size: 0.625rem;
    }
    .movement-staff {
      color: #64748b;
      font-size: 0.625rem;
      text-align: right;
    }
    .movements-section.empty {
      text-align: center;
      color: #94a3b8;
      font-size: 0.875rem;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
    }
    .btn-secondary {
      padding: 0.625rem 1rem;
      background: #f1f5f9;
      border: none;
      border-radius: 8px;
      cursor: pointer;
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
  `]
})
export class ShopProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = [];
  stockAlerts: StockAlert[] = [];
  stats: any = null;

  searchTerm = '';
  categoryFilter = '';
/* ... */
  isBannedFilter: boolean | '' = '';
  hasPromoFilter: boolean | '' = '';
  stockFilter = '';

  loading = false;
  error: string | null = null;
  private shopId: string | null = null;

  pagination = {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  };

  // Permissions
  canManageProducts = false;

  // Promotions
  activePromotions: Promotion[] = [];

  // Computed property for low stock products
  get lowStockProducts(): Product[] {
    return this.products.filter(p => p.stock && p.stock.current_quantity <= 5 && p.stock.current_quantity > 0);
  }

  // Modal stock
  showStockModal = false;
  selectedProduct: Product | null = null;
  selectedStock: any = null;
  stockMovements: any[] = [];
  stockLoading = false;
  newStockQuantity = 0;
  stockReason = '';
  stockAction: 'add' | 'remove' | 'set' = 'add';

  constructor(
    private productService: ProductService,
    private promotionService: PromotionService,
    private authService: AuthService,
    private permissionService: PermissionService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // All authenticated shop users can manage products (simplified permissions)
    this.canManageProducts = true;
    const user = this.authService.currentUserValue;
    if (user?.shop_id) {
      this.shopId = user.shop_id;
      this.loadProducts();
      this.loadStats();
      this.loadStockAlerts();
    } else {
      this.error = 'Shop ID non trouvé. Veuillez vous reconnecter.';
    }
  }

  loadProducts(): void {
    if (!this.shopId) return;

    this.loading = true;
    this.productService.getProductsByShop(this.shopId, {
      page: this.pagination.page,
      limit: this.pagination.limit
    }).subscribe({
      next: (response) => {
        // Convert Decimal128 prices to numbers
        this.products = response.data.products.map((p: any) => ({
          ...p,
          unit_price: typeof p.unit_price === 'object' && p.unit_price?.$numberDecimal
            ? parseFloat(p.unit_price.$numberDecimal)
            : Number(p.unit_price) || 0,
          cost_price: typeof p.cost_price === 'object' && p.cost_price?.$numberDecimal
            ? parseFloat(p.cost_price.$numberDecimal)
            : Number(p.cost_price) || 0
        }));
        this.filteredProducts = [...this.products];
        this.pagination = response.data.pagination;
        this.categories = response.data.filters.categories;
        this.loading = false;
        // Load active promotions for these products
        this.loadActivePromotions();
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des produits';
        this.loading = false;
        console.error('Error loading products:', err);
      }
    });
  }

  loadStats(): void {
    if (!this.shopId) return;
    this.productService.getProductStats(this.shopId).subscribe({
      next: (response) => {
        this.stats = response.data;
      },
      error: (err) => console.error('Error loading stats:', err)
    });
  }

  loadStockAlerts(): void {
    if (!this.shopId) return;
    this.productService.getStockAlerts(this.shopId).subscribe({
      next: (response) => {
        this.stockAlerts = response.data;
      },
      error: (err) => console.error('Error loading alerts:', err)
    });
  }

  applyFilters(): void {
    let result = [...this.products];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term))
      );
    }

    if (this.categoryFilter) {
      result = result.filter(p => p.categories?.some(c => c.name === this.categoryFilter));
    }

    if (this.isBannedFilter !== '') {
      result = result.filter(p => p.is_banned === this.isBannedFilter);
    }

    if (this.hasPromoFilter !== '') {
      result = result.filter(p => p.is_on_promo === this.hasPromoFilter);
    }

    this.filteredProducts = result;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.categoryFilter = '';
    this.isBannedFilter = '';
    this.hasPromoFilter = '';
    this.stockFilter = '';
    this.loadProducts();
  }

  changePage(page: number): void {
    this.pagination.page = page;
    this.loadProducts();
  }

  addProduct(): void {
    this.router.navigate(['/shop/products/add']);
  }

  editProduct(id: string): void {
    this.router.navigate(['/shop/products/edit', id]);
  }

  deleteProduct(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.products = this.products.filter(p => p._id !== id);
          this.applyFilters();
          this.loadStats();
        },
        error: (err) => {
          console.error('Error deleting product:', err);
          alert('Erreur lors de la suppression du produit');
        }
      });
    }
  }
  quickStockUpdate(product: Product): void {
    this.selectedProduct = product;
    this.showStockModal = true;
    this.stockLoading = true;
    this.newStockQuantity = 0;
    this.stockReason = '';

    // Charger le stock et les mouvements
    this.productService.getProductStock(product._id!).subscribe({
      next: (response) => {
        this.selectedStock = response.data;
        this.newStockQuantity = response.data?.current_quantity || 0;
        this.loadStockMovements(product._id!);
      },
      error: () => {
        this.selectedStock = null;
        this.stockLoading = false;
      }
    });
  }

  loadStockMovements(productId: string): void {
    this.productService.getStockMovements(productId).subscribe({
      next: (response) => {
        this.stockMovements = response.data || [];
        this.stockLoading = false;
      },
      error: () => {
        this.stockMovements = [];
        this.stockLoading = false;
      }
    });
  }

  executeStockAction(): void {
    if (!this.selectedProduct || !this.shopId) return;

    const productId = this.selectedProduct._id!;
    const quantity = this.newStockQuantity;

    let operation;
    if (this.stockAction === 'add') {
      operation = this.productService.addStock(this.shopId, productId, quantity, this.stockReason);
    } else if (this.stockAction === 'remove') {
      operation = this.productService.removeStock(this.shopId, productId, quantity, this.stockReason);
    } else {
      operation = this.productService.updateStock(this.shopId, productId, quantity, this.stockReason);
    }

    operation.subscribe({
      next: () => {
        this.loadStockMovements(productId);
        this.loadProducts(); // Refresh stock display
        this.newStockQuantity = 0;
        this.stockReason = '';
      },
      error: (err: any) => {
        alert('Erreur: ' + (err.error?.message || 'Action échouée'));
      }
    });
  }

  closeStockModal(): void {
    this.showStockModal = false;
    this.selectedProduct = null;
    this.selectedStock = null;
    this.stockMovements = [];
  }

  saveStockUpdate(): void {
    this.closeStockModal();
  }

  // Promotion helper methods
  getProductPromo(product: Product): Promotion | null {
    return this.activePromotions.find(promo => 
      this.isProductEligibleForPromo(product, promo)
    ) || null;
  }

  isProductEligibleForPromo(product: Product, promo: Promotion): boolean {
    if (!promo.is_active) return false;
    
    const now = new Date();
    const startDate = new Date(promo.start_date);
    const endDate = new Date(promo.end_date);
    
    if (now < startDate || now > endDate) return false;
    
    // Check applicability
    if (promo.applicable_products === 'ALL') return true;
    if (Array.isArray(promo.applicable_products)) {
      return promo.applicable_products.includes(product._id!);
    }
    return false;
  }

  getPromoPrice(product: Product, promo: Promotion): number {
    if (!promo) return product.unit_price;
    
    let promoPrice = product.unit_price;
    if (promo.type === 'percentage') {
      promoPrice = product.unit_price * (1 - promo.value / 100);
    } else {
      promoPrice = product.unit_price - promo.value;
    }
    
    return Math.max(0, promoPrice);
  }

  getDiscountPercent(product: Product, promo: Promotion): number {
    const promoPrice = this.getPromoPrice(product, promo);
    return Math.round(((product.unit_price - promoPrice) / product.unit_price) * 100);
  }

  loadActivePromotions(): void {
    if (!this.shopId) return;
    this.promotionService.getActivePromotionsForProducts(this.shopId).subscribe({
      next: (response) => {
        this.activePromotions = response.data;
      },
      error: (err) => console.error('Error loading promotions:', err)
    });
  }
}
