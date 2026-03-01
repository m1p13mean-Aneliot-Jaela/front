import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService, Order } from '../../../services/order.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { PermissionService } from '../../../../../core/services/permission.service';
import { NotificationService } from '../../../../../shared/services/notification.service';

@Component({
  selector: 'app-shop-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="header-actions">
        <h2>Mes Commandes</h2>
        <button class="btn-primary" (click)="createOrder()" *ngIf="canCreateOrder">+ Nouvelle Commande</button>
      </div>

      <!-- Stats Cards -->
      <div class="stats-cards" *ngIf="stats">
        <div class="stat-card pending">
          <span class="stat-value">{{ stats.pending }}</span>
          <span class="stat-label">En attente</span>
        </div>
        <div class="stat-card confirmed">
          <span class="stat-value">{{ stats.confirmed }}</span>
          <span class="stat-label">Confirmées</span>
        </div>
        <div class="stat-card shipped">
          <span class="stat-value">{{ stats.shipped }}</span>
          <span class="stat-label">Expédiées</span>
        </div>
        <div class="stat-card delivered">
          <span class="stat-value">{{ stats.delivered }}</span>
          <span class="stat-label">Livrées</span>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <input type="text" 
               class="search-input" 
               placeholder="🔍 Rechercher une commande..."
               [(ngModel)]="searchTerm"
               (input)="applyFilters()">
        
        <select class="filter-select" [(ngModel)]="statusFilter" (change)="applyFilters()">
          <option value="">Tous les statuts</option>
          <option value="PENDING">🟡 En attente</option>
          <option value="CONFIRMED">🔵 Confirmée</option>
          <option value="PAID">💰 Payée</option>
          <option value="SHIPPED">🚚 Expédiée</option>
          <option value="DELIVERED">✅ Livrée</option>
          <option value="CANCELED">❌ Annulée</option>
        </select>

        <button class="btn-filter" (click)="resetFilters()">🔄 Réinitialiser</button>
      </div>

      <!-- Orders List -->
      <div *ngIf="!loading && !error" class="orders-list">
        <div class="order-card" *ngFor="let order of filteredOrders" (click)="viewOrder(order._id)">
          <div class="order-header">
            <div class="order-info">
              <span class="order-id">#{{ order.order_number || order._id.slice(-6) }}</span>
              <span class="order-date">{{ order.created_at | date:'dd/MM/yy HH:mm' }}</span>
            </div>
            <span class="status-badge" [class]="order.status.toLowerCase()">
              {{ getStatusLabel(order.status) }}
            </span>
          </div>
          
          <div class="order-customer">
            👤 {{ order.customer.name }} • {{ order.items.length }} article(s)
          </div>
          
          <div class="order-items" *ngIf="order.items.length > 0">
            <span *ngFor="let item of order.items.slice(0, 2); let last = last" class="item-name">
              {{ item.product_name }} (x{{ item.quantity }}){{ last ? '' : ', ' }}
            </span>
            <span *ngIf="order.items.length > 2" class="more-items">+{{ order.items.length - 2 }} autres</span>
          </div>
          
          <div class="order-footer">
            <span class="total">{{ order.total_amount | number }} Ar</span>
            <div class="actions">
              <!-- STAFF can confirm orders (process_orders) -->
              <button class="btn-icon" (click)="updateStatus(order._id, 'CONFIRMED', $event)" 
                      *ngIf="canProcessOrders && order.status === 'PENDING'" title="Confirmer">✅</button>
              
              <!-- STAFF can ship orders (process_orders) -->
              <button class="btn-icon" (click)="updateStatus(order._id, 'SHIPPED', $event)" 
                      *ngIf="canProcessOrders && (order.status === 'PAID' || order.status === 'CONFIRMED')" title="Expédier">🚚</button>
              
              <!-- Only MANAGER can deliver -->
              <button class="btn-icon" (click)="updateStatus(order._id, 'DELIVERED', $event)" 
                      *ngIf="canProcessOrders && order.status === 'SHIPPED'" title="Livrer">📦</button>
              
              <!-- Only MANAGER can cancel (cancel_orders permission) -->
              <button class="btn-icon cancel" (click)="cancelOrder(order._id, $event)" 
                      *ngIf="canCancelOrders && order.status !== 'DELIVERED' && order.status !== 'CANCELED'" title="Annuler">❌</button>
            </div>
          </div>
        </div>

        <div *ngIf="filteredOrders.length === 0" class="empty-state">
          Aucune commande trouvée
        </div>
      </div>

      <!-- Loading & Error -->
      <div *ngIf="loading" class="loading">Chargement des commandes...</div>
      <div *ngIf="error" class="error-message">{{ error }}</div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="pagination.pages > 1">
        <button class="btn-page" (click)="changePage(pagination.page - 1)" [disabled]="pagination.page === 1">← Précédent</button>
        <span class="page-info">Page {{ pagination.page }} / {{ pagination.pages }}</span>
        <button class="btn-page" (click)="changePage(pagination.page + 1)" [disabled]="pagination.page === pagination.pages">Suivant →</button>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem;
    }
    
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

    /* Stats */
    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
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
    .stat-card.pending { border-left: 4px solid #f59e0b; }
    .stat-card.confirmed { border-left: 4px solid #3b82f6; }
    .stat-card.shipped { border-left: 4px solid #8b5cf6; }
    .stat-card.delivered { border-left: 4px solid #22c55e; }
    .stat-value {
      display: block;
      font-size: 1.5rem;
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

    /* Orders List */
    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .order-card {
      background: white;
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .order-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .order-info {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
    .order-id {
      font-weight: 600;
      color: #1e293b;
    }
    .order-date {
      color: #64748b;
      font-size: 0.875rem;
    }
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .status-badge.pending { background: #fef3c7; color: #92400e; }
    .status-badge.confirmed { background: #dbeafe; color: #1d4ed8; }
    .status-badge.paid { background: #d1fae5; color: #065f46; }
    .status-badge.shipped { background: #e0e7ff; color: #4338ca; }
    .status-badge.delivered { background: #d1fae5; color: #059669; }
    .status-badge.canceled { background: #fee2e2; color: #dc2626; }
    .order-customer {
      color: #64748b;
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }
    .order-items {
      font-size: 0.75rem;
      color: #94a3b8;
      margin-bottom: 0.75rem;
    }
    .item-name {
      color: #64748b;
    }
    .more-items {
      color: #8b5cf6;
    }
    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.75rem;
      border-top: 1px solid #e2e8f0;
    }
    .total {
      font-weight: 600;
      color: #1e293b;
      font-size: 1.125rem;
    }
    .actions {
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
      transition: background 0.2s;
    }
    .btn-icon:hover {
      background: #e2e8f0;
    }
    .btn-icon.cancel:hover {
      background: #fee2e2;
    }

    /* Empty & Loading */
    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #64748b;
      background: white;
      border-radius: 12px;
    }
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
      margin-bottom: 1rem;
    }

    /* Pagination */
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 1.5rem;
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
  `]
})
export class ShopOrderListComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  
  searchTerm = '';
  statusFilter = '';
  
  loading = false;
  error: string | null = null;
  
  stats = {
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0
  };
  
  pagination = {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  };

  // Permissions
  canCreateOrder = false;
  canProcessOrders = false;
  canCancelOrders = false;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private permissionService: PermissionService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user?.shop_id) {
      // Check permissions
      this.canCreateOrder = this.permissionService.hasPermission('process_orders');
      this.canProcessOrders = this.permissionService.hasPermission('process_orders');
      this.canCancelOrders = this.permissionService.hasPermission('cancel_orders');
      
      this.loadOrders();
      this.loadStats();
    } else {
      this.error = 'Shop ID non trouvé. Veuillez vous reconnecter.';
    }
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getOrders({
      page: this.pagination.page,
      limit: this.pagination.limit
    }).subscribe({
      next: (response) => {
        this.orders = response.data.orders;
        this.filteredOrders = [...this.orders];
        this.pagination = response.data.pagination;
        this.loading = false;
        this.applyFilters();
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des commandes';
        this.loading = false;
        console.error('Error loading orders:', err);
      }
    });
  }

  loadStats(): void {
    this.orderService.getDashboardStats().subscribe({
      next: (response) => {
        const data = response.data.orders_by_status_detailed || response.data.orders_by_status;
        const getCount = (status: string): number => {
          const val = data?.[status as keyof typeof data];
          if (typeof val === 'number') return val;
          if (val && typeof val === 'object' && 'count' in val) return (val as any).count || 0;
          return 0;
        };
        this.stats = {
          pending: getCount('PENDING'),
          confirmed: getCount('CONFIRMED'),
          shipped: getCount('SHIPPED'),
          delivered: getCount('DELIVERED')
        };
      },
      error: (err) => console.error('Error loading stats:', err)
    });
  }

  applyFilters(): void {
    let result = [...this.orders];
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(o =>
        o.order_number?.toLowerCase().includes(term) ||
        o.customer.name.toLowerCase().includes(term) ||
        o.items.some(i => i.product_name.toLowerCase().includes(term))
      );
    }
    
    if (this.statusFilter) {
      result = result.filter(o => o.status === this.statusFilter);
    }
    
    this.filteredOrders = result;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.loadOrders();
  }

  changePage(page: number): void {
    this.pagination.page = page;
    this.loadOrders();
  }

  getStatusLabel(status: string): string {
    return this.orderService.getStatusLabel(status);
  }

  viewOrder(orderId: string): void {
    this.router.navigate(['/shop/orders', orderId]);
  }

  createOrder(): void {
    this.router.navigate(['/shop/orders/add']);
  }

  updateStatus(orderId: string, status: string, event: Event): void {
    event.stopPropagation();
    this.orderService.updateStatus(orderId, status).subscribe({
      next: () => {
        // Refresh notifications after status update
        this.notificationService.refreshNotifications();
        this.loadOrders();
        this.loadStats();
      },
      error: (err) => {
        console.error('Error updating status:', err);
        alert('Erreur lors de la mise à jour du statut');
      }
    });
  }

  cancelOrder(orderId: string, event: Event): void {
    event.stopPropagation();
    if (!this.canCancelOrders) {
      alert('Vous n\'avez pas la permission d\'annuler les commandes.');
      return;
    }
    if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      this.orderService.updateStatus(orderId, 'CANCELED', 'Annulée par le vendeur').subscribe({
        next: () => {
          // Refresh notifications after canceling order
          this.notificationService.refreshNotifications();
          this.loadOrders();
          this.loadStats();
        },
        error: (err) => {
          console.error('Error canceling order:', err);
          alert('Erreur lors de l\'annulation');
        }
      });
    }
  }
}
