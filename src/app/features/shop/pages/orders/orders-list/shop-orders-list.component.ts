import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService, Order, OrdersListResponse } from '../../../services/order.service';

@Component({
  selector: 'app-shop-orders-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="orders-page">
      <div class="page-header">
        <h2>🛒 Commandes</h2>
        <div class="header-actions">
          <button class="btn-export" (click)="exportOrders()">📥 Export</button>
          <button class="btn-primary" routerLink="/shop/orders/new">+ Nouvelle commande</button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <div class="filter-group">
          <input 
            type="text" 
            placeholder="🔍 Rechercher (n°, client...)" 
            [(ngModel)]="searchQuery"
            (keyup.enter)="applyFilters()"
          >
        </div>
        <div class="filter-group">
          <select [(ngModel)]="statusFilter" (change)="applyFilters()">
            <option value="">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="CONFIRMED">Confirmée</option>
            <option value="SHIPPED">Expédiée</option>
            <option value="DELIVERED">Livrée</option>
            <option value="CANCELED">Annulée</option>
          </select>
        </div>
        <div class="filter-group dates">
          <input type="date" [(ngModel)]="startDate" (change)="applyFilters()">
          <span>à</span>
          <input type="date" [(ngModel)]="endDate" (change)="applyFilters()">
        </div>
        <button class="btn-reset" (click)="resetFilters()">Réinitialiser</button>
      </div>

      <!-- Status Summary -->
      <div class="status-summary" *ngIf="statusCounts">
        <div class="status-chip pending" [class.active]="statusFilter === 'PENDING'" (click)="setStatusFilter('PENDING')">
          <span class="dot"></span>
          <span>En attente</span>
          <span class="count">{{ statusCounts.PENDING || 0 }}</span>
        </div>
        <div class="status-chip confirmed" [class.active]="statusFilter === 'CONFIRMED'" (click)="setStatusFilter('CONFIRMED')">
          <span class="dot"></span>
          <span>Confirmées</span>
          <span class="count">{{ statusCounts.CONFIRMED || 0 }}</span>
        </div>
        <div class="status-chip shipped" [class.active]="statusFilter === 'SHIPPED'" (click)="setStatusFilter('SHIPPED')">
          <span class="dot"></span>
          <span>Expédiées</span>
          <span class="count">{{ statusCounts.SHIPPED || 0 }}</span>
        </div>
        <div class="status-chip delivered" [class.active]="statusFilter === 'DELIVERED'" (click)="setStatusFilter('DELIVERED')">
          <span class="dot"></span>
          <span>Livrées</span>
          <span class="count">{{ statusCounts.DELIVERED || 0 }}</span>
        </div>
        <div class="status-chip canceled" [class.active]="statusFilter === 'CANCELED'" (click)="setStatusFilter('CANCELED')">
          <span class="dot"></span>
          <span>Annulées</span>
          <span class="count">{{ statusCounts.CANCELED || 0 }}</span>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading">Chargement des commandes...</div>

      <!-- Orders Table -->
      <div class="orders-container" *ngIf="!loading && orders.length">
        <table class="orders-table">
          <thead>
            <tr>
              <th>N° Commande</th>
              <th>Client</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Montant</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let order of orders" [routerLink]="['/shop/orders', order._id]" class="order-row">
              <td class="order-number">{{ order.order_number }}</td>
              <td class="customer">
                <span class="name">{{ order.customer.name }}</span>
                <span class="phone">{{ order.customer.phone }}</span>
              </td>
              <td class="date">{{ order.created_at | date:'dd/MM/yyyy HH:mm' }}</td>
              <td class="status">
                <span 
                  class="status-badge" 
                  [style.background]="getStatusColor(order.status)"
                >
                  {{ getStatusLabel(order.status) }}
                </span>
              </td>
              <td class="amount">{{ order.total_amount | currency:'Ar ':'symbol':'1.0-0' }}</td>
              <td class="actions" (click)="$event.stopPropagation()">
                <button 
                  class="btn-action" 
                  *ngIf="canAdvance(order.status)"
                  (click)="advanceStatus(order)"
                  title="Avancer le statut"
                >
                  ▶️
                </button>
                <button 
                  class="btn-action cancel" 
                  *ngIf="order.status !== 'CANCELED' && order.status !== 'DELIVERED'"
                  (click)="cancelOrder(order)"
                  title="Annuler"
                >
                  ❌
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="pagination" *ngIf="pagination && pagination.pages > 1">
          <button 
            [disabled]="pagination.page === 1" 
            (click)="changePage(pagination.page - 1)"
          >
            ← Précédent
          </button>
          <span>Page {{ pagination.page }} / {{ pagination.pages }}</span>
          <span class="total">({{ pagination.total }} commandes)</span>
          <button 
            [disabled]="pagination.page === pagination.pages" 
            (click)="changePage(pagination.page + 1)"
          >
            Suivant →
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && !orders.length" class="empty-state">
        <span class="icon">📭</span>
        <p>Aucune commande trouvée</p>
        <button class="btn-secondary" (click)="resetFilters()">Réinitialiser les filtres</button>
      </div>
    </div>
  `,
  styles: [`
    .orders-page { padding: 1.5rem; max-width: 1400px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
    h2 { color: #1e293b; margin: 0; }
    .header-actions { display: flex; gap: 0.75rem; }
    .btn-primary { padding: 0.625rem 1.25rem; background: #8b5cf6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; }
    .btn-export { padding: 0.625rem 1.25rem; background: white; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; }

    .filters-bar { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; align-items: center; background: white; padding: 1rem; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .filter-group input, .filter-group select { padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.875rem; }
    .filter-group.dates { display: flex; align-items: center; gap: 0.5rem; }
    .btn-reset { padding: 0.5rem 1rem; background: #f1f5f9; border: none; border-radius: 8px; cursor: pointer; font-size: 0.875rem; color: #64748b; }

    .status-summary { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .status-chip { display: flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1rem; background: white; border-radius: 8px; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.1); font-size: 0.875rem; }
    .status-chip.active { outline: 2px solid #8b5cf6; }
    .status-chip .dot { width: 8px; height: 8px; border-radius: 50%; }
    .status-chip.pending .dot { background: #f59e0b; }
    .status-chip.confirmed .dot { background: #3b82f6; }
    .status-chip.shipped .dot { background: #8b5cf6; }
    .status-chip.delivered .dot { background: #22c55e; }
    .status-chip.canceled .dot { background: #dc2626; }
    .count { background: #f1f5f9; padding: 0.125rem 0.5rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }

    .loading { text-align: center; padding: 3rem; color: #64748b; }
    .orders-container { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
    .orders-table { width: 100%; border-collapse: collapse; }
    .orders-table th { text-align: left; padding: 1rem; background: #f8fafc; font-size: 0.875rem; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0; }
    .orders-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; }
    .order-row { cursor: pointer; transition: background 0.2s; }
    .order-row:hover { background: #f8fafc; }
    .order-number { font-weight: 600; color: #8b5cf6; }
    .customer { display: flex; flex-direction: column; }
    .customer .name { font-weight: 500; }
    .customer .phone { font-size: 0.875rem; color: #64748b; }
    .date { font-size: 0.875rem; color: #64748b; }
    .status-badge { padding: 0.375rem 0.75rem; border-radius: 6px; font-size: 0.75rem; color: white; font-weight: 500; }
    .amount { font-weight: 600; color: #1e293b; }
    .actions { display: flex; gap: 0.5rem; }
    .btn-action { padding: 0.375rem; background: none; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; }
    .btn-action:hover { background: #f1f5f9; }
    .btn-action.cancel:hover { background: #fee2e2; border-color: #dc2626; }

    .pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; padding: 1rem; border-top: 1px solid #f1f5f9; }
    .pagination button { padding: 0.5rem 1rem; background: white; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; }
    .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
    .pagination .total { color: #64748b; font-size: 0.875rem; }

    .empty-state { text-align: center; padding: 4rem; color: #64748b; }
    .empty-state .icon { font-size: 3rem; }
    .empty-state p { margin: 1rem 0; }
    .btn-secondary { padding: 0.625rem 1.25rem; background: white; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; }
  `]
})
export class ShopOrdersListComponent implements OnInit {
  orders: Order[] = [];
  pagination: { page: number; limit: number; total: number; pages: number } | null = null;
  loading = true;
  
  // Filters
  searchQuery = '';
  statusFilter = '';
  startDate = '';
  endDate = '';
  currentPage = 1;
  
  statusCounts: { PENDING: number; CONFIRMED: number; SHIPPED: number; DELIVERED: number; CANCELED: number } | null = null;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
    this.loadStatusCounts();
  }

  loadOrders(): void {
    this.loading = true;
    const filters = {
      search: this.searchQuery,
      status: this.statusFilter,
      startDate: this.startDate,
      endDate: this.endDate,
      page: this.currentPage,
      limit: 20
    };

    this.orderService.getOrders(filters).subscribe({
      next: (response) => {
        this.orders = response.data.orders;
        this.pagination = response.data.pagination;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.loading = false;
      }
    });
  }

  loadStatusCounts(): void {
    this.orderService.getDashboardStats(30).subscribe({
      next: (response) => {
        this.statusCounts = response.data.orders_by_status;
      },
      error: (err) => {
        console.error('Error loading status counts:', err);
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.statusFilter = '';
    this.startDate = '';
    this.endDate = '';
    this.currentPage = 1;
    this.loadOrders();
  }

  setStatusFilter(status: string): void {
    this.statusFilter = this.statusFilter === status ? '' : status;
    this.applyFilters();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadOrders();
  }

  canAdvance(status: string): boolean {
    return ['PENDING', 'CONFIRMED', 'SHIPPED'].includes(status);
  }

  advanceStatus(order: Order): void {
    const nextStatus: Record<string, string> = {
      'PENDING': 'CONFIRMED',
      'CONFIRMED': 'SHIPPED',
      'SHIPPED': 'DELIVERED'
    };
    
    const newStatus = nextStatus[order.status];
    if (newStatus && confirm(`Avancer la commande ${order.order_number} vers "${this.getStatusLabel(newStatus)}" ?`)) {
      this.orderService.updateStatus(order._id, newStatus).subscribe({
        next: () => {
          this.loadOrders();
          this.loadStatusCounts();
        },
        error: (err) => {
          alert('Erreur lors du changement de statut: ' + (err?.error?.message || 'Erreur inconnue'));
        }
      });
    }
  }

  cancelOrder(order: Order): void {
    if (confirm(`Annuler la commande ${order.order_number} ?`)) {
      this.orderService.updateStatus(order._id, 'CANCELED', 'Annulation manuelle').subscribe({
        next: () => {
          this.loadOrders();
          this.loadStatusCounts();
        },
        error: (err) => {
          alert('Erreur lors de l\'annulation: ' + (err?.error?.message || 'Erreur inconnue'));
        }
      });
    }
  }

  exportOrders(): void {
    const filters = {
      status: this.statusFilter,
      startDate: this.startDate,
      endDate: this.endDate
    };

    this.orderService.exportOrders(filters).subscribe({
      next: (response) => {
        // Convert to CSV and download
        const data = response.data;
        if (data.length === 0) {
          alert('Aucune commande à exporter');
          return;
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
          headers.join(','),
          ...data.map(row => headers.map(h => {
            const val = row[h];
            return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
          }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `commandes_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        alert('Erreur lors de l\'export: ' + (err?.error?.message || 'Erreur inconnue'));
      }
    });
  }

  getStatusLabel(status: string): string {
    return this.orderService.getStatusLabel(status);
  }

  getStatusColor(status: string): string {
    return this.orderService.getStatusColor(status);
  }
}
