import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StockService, Stock, StockMovement } from '../../../services/stock.service';
import { ProductService } from '../../../services/product.service';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-shop-stock-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-container">
      <div class="header">
        <h1>Gestion des Stocks</h1>
        <div class="header-actions">
          <button class="btn-secondary" (click)="refreshStocks()">↻ Rafraîchir</button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="search-box">
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (input)="filterStocks()"
            placeholder="Rechercher un produit..."
          >
        </div>
        <div class="filter-group">
          <select [(ngModel)]="stockFilter" (change)="filterStocks()">
            <option value="all">Tous les stocks</option>
            <option value="low">Stock faible</option>
            <option value="out">Rupture de stock</option>
          </select>
        </div>
      </div>

      <!-- Stock Table -->
      <div class="stock-table-container">
        <table class="stock-table" *ngIf="!loading && filteredStocks.length > 0">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Stock actuel</th>
              <th>Dernière mise à jour</th>
              <th>Dernier mouvement</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let stock of filteredStocks" [class.low-stock]="isLowStock(stock)" [class.out-stock]="isOutOfStock(stock)">
              <td class="product-cell">
                <span class="product-name">{{ stock.product_name }}</span>
              </td>
              <td class="quantity-cell">
                <span class="quantity" [class.warning]="isLowStock(stock)" [class.danger]="isOutOfStock(stock)">
                  {{ stock.current_quantity }}
                </span>
                <span *ngIf="isLowStock(stock)" class="alert-badge">⚠ Faible</span>
                <span *ngIf="isOutOfStock(stock)" class="alert-badge danger">❌ Épuisé</span>
              </td>
              <td class="date-cell">{{ stock.updated_at | date:'dd/MM/yyyy HH:mm' }}</td>
              <td class="movement-cell">
                <span *ngIf="stock.recent_movements && stock.recent_movements.length > 0">
                  {{ getLastMovement(stock) }}
                </span>
                <span *ngIf="!stock.recent_movements || stock.recent_movements.length === 0" class="no-movement">
                  Aucun mouvement
                </span>
              </td>
              <td class="actions-cell">
                <button class="btn-icon add" (click)="openMovementModal(stock, 'IN')" title="Entrée stock">
                  ➕
                </button>
                <button class="btn-icon remove" (click)="openMovementModal(stock, 'OUT')" title="Sortie stock">
                  ➖
                </button>
                <button class="btn-icon adjust" (click)="openMovementModal(stock, 'ADJUST')" title="Ajustement">
                  ⚖️
                </button>
                <button class="btn-icon history" (click)="viewHistory(stock)" title="Historique">
                  ≡
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div *ngIf="!loading && filteredStocks.length === 0" class="empty-state">
          <p>Aucun stock trouvé</p>
          <button class="btn-primary" routerLink="/shop/products/add">Créer un produit</button>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="loading">Chargement...</div>
      </div>

      <!-- Movement Modal -->
      <div class="modal" *ngIf="showMovementModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ getMovementTitle() }}</h3>
            <button class="btn-close" (click)="closeMovementModal()">×</button>
          </div>
          <div class="modal-body" *ngIf="selectedStock">
            <p><strong>Produit :</strong> {{ selectedStock.product_name }}</p>
            <p><strong>Stock actuel :</strong> {{ selectedStock.current_quantity }}</p>
            
            <div class="form-group">
              <label>Quantité *</label>
              <input 
                type="number" 
                [(ngModel)]="movementQuantity" 
                min="1"
                placeholder="Quantité"
              >
            </div>
            
            <div class="form-group">
              <label>Raison / Motif</label>
              <textarea 
                [(ngModel)]="movementReason" 
                rows="3"
                placeholder="Ex: Réception marchandise, Vente, Inventaire..."
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="closeMovementModal()">Annuler</button>
            <button class="btn-primary" (click)="saveMovement()" [disabled]="!movementQuantity">
              Enregistrer
            </button>
          </div>
        </div>
      </div>

      <!-- History Modal -->
      <div class="modal" *ngIf="showHistoryModal">
        <div class="modal-content large">
          <div class="modal-header">
            <h3>Historique des mouvements - {{ selectedStock?.product_name }}</h3>
            <button class="btn-close" (click)="closeHistoryModal()">×</button>
          </div>
          <div class="modal-body">
            <table class="history-table" *ngIf="stockHistory.length > 0">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Qté</th>
                  <th>Par</th>
                  <th>Raison</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let movement of stockHistory">
                  <td>{{ movement.created_at | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td>
                    <span class="movement-badge" [class.in]="movement.movement_type === 'IN'" [class.out]="movement.movement_type === 'OUT'" [class.adjust]="movement.movement_type === 'ADJUST'">
                      {{ movement.movement_type }}
                    </span>
                  </td>
                  <td>{{ movement.quantity }}</td>
                  <td>{{ movement.staff_name || 'Système' }}</td>
                  <td>{{ movement.reason || '-' }}</td>
                </tr>
              </tbody>
            </table>
            <p *ngIf="stockHistory.length === 0" class="no-data">Aucun mouvement enregistré</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .header h1 {
      margin: 0;
      font-size: 1.5rem;
      color: #1e293b;
    }
    .header-actions {
      display: flex;
      gap: 0.75rem;
    }
    .btn-primary, .btn-secondary {
      padding: 0.625rem 1rem;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .btn-primary {
      background: #8b5cf6;
      color: white;
    }
    .btn-secondary {
      background: #f1f5f9;
      color: #64748b;
    }
    .filters-section {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .search-box input, .filter-group select {
      padding: 0.625rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.875rem;
    }
    .search-box input {
      width: 300px;
    }
    .stock-table-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .stock-table {
      width: 100%;
      border-collapse: collapse;
    }
    .stock-table th {
      background: #f8fafc;
      padding: 0.75rem 1rem;
      text-align: left;
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      border-bottom: 1px solid #e2e8f0;
    }
    .stock-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #f1f5f9;
      font-size: 0.875rem;
    }
    .stock-table tr:hover {
      background: #f8fafc;
    }
    .stock-table tr.low-stock {
      background: #fffbeb;
    }
    .stock-table tr.out-stock {
      background: #fef2f2;
    }
    .product-name {
      font-weight: 500;
      color: #1e293b;
    }
    .quantity {
      font-weight: 600;
      font-size: 1rem;
      color: #059669;
    }
    .quantity.warning {
      color: #d97706;
    }
    .quantity.danger {
      color: #dc2626;
    }
    .alert-badge {
      background: #fef3c7;
      color: #d97706;
      padding: 0.125rem 0.375rem;
      border-radius: 4px;
      font-size: 0.625rem;
      margin-left: 0.5rem;
    }
    .alert-badge.danger {
      background: #fee2e2;
      color: #dc2626;
    }
    .no-movement {
      color: #94a3b8;
      font-size: 0.75rem;
    }
    .actions-cell {
      display: flex;
      gap: 0.5rem;
    }
    .btn-icon {
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
    }
    .btn-icon:hover {
      background: #e2e8f0;
    }
    .btn-icon.add:hover { background: #d1fae5; }
    .btn-icon.remove:hover { background: #fee2e2; }
    .btn-icon.adjust:hover { background: #fef3c7; }
    .btn-icon.history:hover { background: #dbeafe; }
    .modal {
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
    .modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }
    .modal-content.large {
      max-width: 700px;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .modal-header h3 {
      margin: 0;
      font-size: 1.125rem;
    }
    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #64748b;
    }
    .modal-body {
      padding: 1.5rem;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.375rem;
      font-weight: 500;
      font-size: 0.875rem;
    }
    .form-group input, .form-group textarea {
      width: 100%;
      padding: 0.625rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.875rem;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid #e2e8f0;
    }
    .history-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }
    .history-table th, .history-table td {
      padding: 0.625rem;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    .movement-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .movement-badge.in {
      background: #d1fae5;
      color: #059669;
    }
    .movement-badge.out {
      background: #fee2e2;
      color: #dc2626;
    }
    .movement-badge.adjust {
      background: #fef3c7;
      color: #d97706;
    }
    .empty-state {
      text-align: center;
      padding: 3rem;
    }
    .loading {
      text-align: center;
      padding: 2rem;
      color: #64748b;
    }

    /* Responsive Styles */
    @media (max-width: 1024px) {
      .stock-page { padding: 1rem; }
    }

    @media (max-width: 768px) {
      .stock-page { padding: 0.75rem; }
      .page-header { flex-direction: column; align-items: stretch; }
      h2 { font-size: 1.25rem; }
      .stock-container { overflow-x: auto; }
      .stock-table { min-width: 800px; }
    }

    @media (max-width: 480px) {
      .stock-page { padding: 0.5rem; }
      h2 { font-size: 1rem; }
      .stock-table th, .stock-table td { padding: 0.5rem; font-size: 0.75rem; }
    }
  `]
})
export class ShopStockListComponent implements OnInit {
  stocks: Stock[] = [];
  filteredStocks: Stock[] = [];
  loading = true;
  
  // Filters
  searchQuery = '';
  stockFilter: 'all' | 'low' | 'out' = 'all';
  
  // Modal state
  showMovementModal = false;
  showHistoryModal = false;
  selectedStock: Stock | null = null;
  movementType: 'IN' | 'OUT' | 'ADJUST' = 'IN';
  movementQuantity: number = 0;
  movementReason: string = '';
  stockHistory: StockMovement[] = [];

  constructor(
    private stockService: StockService,
    private productService: ProductService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadStocks();
  }

  loadStocks() {
    this.loading = true;
    const shopId = this.authService.currentUserValue?.shop_id;
    
    if (!shopId) {
      console.error('No shop_id found');
      this.loading = false;
      return;
    }

    this.stockService.getShopStocks(shopId).subscribe({
      next: (stocks) => {
        this.stocks = stocks;
        this.filterStocks();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading stocks:', err);
        this.loading = false;
      }
    });
  }

  filterStocks() {
    let filtered = [...this.stocks];

    // Search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.product_name?.toLowerCase().includes(query)
      );
    }

    // Stock level filter
    switch (this.stockFilter) {
      case 'low':
        filtered = filtered.filter(s => s.current_quantity > 0 && s.current_quantity <= 5);
        break;
      case 'out':
        filtered = filtered.filter(s => s.current_quantity === 0);
        break;
    }

    this.filteredStocks = filtered;
  }

  isLowStock(stock: Stock): boolean {
    return stock.current_quantity > 0 && stock.current_quantity <= 5;
  }

  isOutOfStock(stock: Stock): boolean {
    return stock.current_quantity === 0;
  }

  getLastMovement(stock: Stock): string {
    if (!stock.recent_movements || stock.recent_movements.length === 0) {
      return 'Aucun';
    }
    const last = stock.recent_movements[0];
    return `${last.movement_type} (${last.quantity})`;
  }

  // Movement Modal
  openMovementModal(stock: Stock, type: 'IN' | 'OUT' | 'ADJUST') {
    this.selectedStock = stock;
    this.movementType = type;
    this.movementQuantity = 0;
    this.movementReason = '';
    this.showMovementModal = true;
  }

  closeMovementModal() {
    this.showMovementModal = false;
    this.selectedStock = null;
  }

  getMovementTitle(): string {
    switch (this.movementType) {
      case 'IN': return '➕ Entrée de stock';
      case 'OUT': return '➖ Sortie de stock';
      case 'ADJUST': return '⚖️ Ajustement d\'inventaire';
      default: return 'Mouvement';
    }
  }

  saveMovement() {
    if (!this.selectedStock || !this.movementQuantity) return;

    const shopId = this.authService.currentUserValue?.shop_id;
    if (!shopId) return;

    const productId = this.selectedStock.product_id;
    let request;
    
    switch (this.movementType) {
      case 'IN':
        request = this.stockService.addStock(shopId, productId, { quantity: this.movementQuantity, reason: this.movementReason });
        break;
      case 'OUT':
        request = this.stockService.removeStock(shopId, productId, { quantity: this.movementQuantity, reason: this.movementReason });
        break;
      case 'ADJUST':
        request = this.stockService.updateStock(shopId, productId, { new_quantity: this.movementQuantity, reason: this.movementReason });
        break;
    }

    request?.subscribe({
      next: () => {
        this.closeMovementModal();
        this.loadStocks();
      },
      error: (err) => {
        console.error('Error saving movement:', err);
        alert('Erreur lors de l\'enregistrement du mouvement');
      }
    });
  }

  // History Modal
  viewHistory(stock: Stock) {
    this.selectedStock = stock;
    this.showHistoryModal = true;
    this.loadStockHistory(stock._id!);
  }

  closeHistoryModal() {
    this.showHistoryModal = false;
    this.selectedStock = null;
    this.stockHistory = [];
  }

  loadStockHistory(stockId: string) {
    // This would need a new endpoint in stock.service to get full history
    // For now, we show recent_movements
    if (this.selectedStock?.recent_movements) {
      this.stockHistory = this.selectedStock.recent_movements;
    }
  }

  refreshStocks() {
    this.loadStocks();
  }
}
