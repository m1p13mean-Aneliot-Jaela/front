import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../../core/services/auth.service';
import { PermissionService } from '../../../../../core/services/permission.service';

interface Delivery {
  id: string;
  orderId: string;
  customerName: string;
  address: string;
  city: string;
  phone: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  statusLabel: string;
  trackingNumber?: string;
  carrier?: string;
  scheduledDate?: string;
  deliveredDate?: string;
  createdAt: string;
}

@Component({
  selector: 'app-shop-deliveries-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="header">
        <h2>Livraisons</h2>
        <div class="header-actions">
          <div class="search-box">
            <input 
              type="text" 
              [(ngModel)]="searchTerm" 
              (input)="filterDeliveries()"
              placeholder="Rechercher une livraison..."
              class="search-input"
            >
          </div>
          <select [(ngModel)]="statusFilter" (change)="filterDeliveries()" class="filter-select">
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="processing">En préparation</option>
            <option value="shipped">Expédiée</option>
            <option value="delivered">Livrée</option>
            <option value="cancelled">Annulée</option>
          </select>
        </div>
      </div>

      <!-- Error Message -->
      <div *ngIf="error" class="error-message">
        {{ error }}
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading">
        Chargement des livraisons...
      </div>

      <!-- Deliveries Table -->
      <div *ngIf="!loading && !error" class="deliveries-table-container">
        <table class="deliveries-table">
          <thead>
            <tr>
              <th>N° Commande</th>
              <th>Client</th>
              <th>Adresse</th>
              <th>Statut</th>
              <th>Transporteur</th>
              <th>N° Suivi</th>
              <th>Date prévue</th>
              <th>Date livraison</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let delivery of filteredDeliveries">
              <td class="order-id">{{ delivery.orderId }}</td>
              <td>{{ delivery.customerName }}</td>
              <td>
                <div class="address">
                  <span>{{ delivery.address }}</span>
                  <span class="city">{{ delivery.city }}</span>
                </div>
              </td>
              <td>
                <span class="status-badge" [class]="delivery.status">
                  {{ delivery.statusLabel }}
                </span>
              </td>
              <td>{{ delivery.carrier || '-' }}</td>
              <td>{{ delivery.trackingNumber || '-' }}</td>
              <td>{{ delivery.scheduledDate ? (delivery.scheduledDate | date:'dd/MM/yyyy') : '-' }}</td>
              <td>{{ delivery.deliveredDate ? (delivery.deliveredDate | date:'dd/MM/yyyy') : '-' }}</td>
            </tr>
            <tr *ngIf="filteredDeliveries.length === 0">
              <td colspan="8" class="no-data">Aucune livraison trouvée</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    h2 {
      color: #1e293b;
      margin: 0;
    }
    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
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
    .deliveries-table-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .deliveries-table {
      width: 100%;
      border-collapse: collapse;
    }
    .deliveries-table th {
      background: #f8fafc;
      padding: 1rem;
      text-align: left;
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .deliveries-table td {
      padding: 1rem;
      border-top: 1px solid #f1f5f9;
      font-size: 0.875rem;
      color: #1e293b;
    }
    .order-id {
      font-weight: 600;
      color: #8b5cf6;
    }
    .address {
      display: flex;
      flex-direction: column;
    }
    .city {
      color: #64748b;
      font-size: 0.75rem;
    }
    .status-badge {
      padding: 0.375rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .status-badge.pending {
      background: #fef3c7;
      color: #d97706;
    }
    .status-badge.processing {
      background: #dbeafe;
      color: #2563eb;
    }
    .status-badge.shipped {
      background: #ede9fe;
      color: #8b5cf6;
    }
    .status-badge.delivered {
      background: #d1fae5;
      color: #059669;
    }
    .status-badge.cancelled {
      background: #fee2e2;
      color: #dc2626;
    }
    .no-data {
      text-align: center;
      color: #64748b;
      padding: 2rem;
    }
  `]
})
export class ShopDeliveriesListComponent implements OnInit {
  deliveries: Delivery[] = [];
  filteredDeliveries: Delivery[] = [];
  searchTerm = '';
  statusFilter = '';
  loading = false;
  error: string | null = null;
  private shopId: string | null = null;

  constructor(
    private authService: AuthService,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user?.shop_id) {
      this.shopId = user.shop_id;
    } else {
      this.error = 'Shop ID non trouvé. Veuillez vous reconnecter.';
      return;
    }

    this.loadDeliveries();
  }

  loadDeliveries(): void {
    this.loading = true;
    // TODO: Load from API
    setTimeout(() => {
      this.deliveries = [
        {
          id: 'LIV-001',
          orderId: 'CMD-001',
          customerName: 'John Doe',
          address: '123 Rue Principale',
          city: 'Antananarivo',
          phone: '034 12 345 67',
          status: 'delivered',
          statusLabel: 'Livrée',
          carrier: 'Colis Express',
          trackingNumber: 'CE123456789',
          scheduledDate: '2026-02-15',
          deliveredDate: '2026-02-15',
          createdAt: '2026-02-14'
        },
        {
          id: 'LIV-002',
          orderId: 'CMD-002',
          customerName: 'Jane Smith',
          address: '45 Avenue de la Mer',
          city: 'Toamasina',
          phone: '033 98 765 43',
          status: 'shipped',
          statusLabel: 'Expédiée',
          carrier: 'Fast Delivery',
          trackingNumber: 'FD987654321',
          scheduledDate: '2026-02-18',
          createdAt: '2026-02-14'
        },
        {
          id: 'LIV-003',
          orderId: 'CMD-003',
          customerName: 'Bob Wilson',
          address: '78 Boulevard Central',
          city: 'Antsirabe',
          phone: '032 45 678 90',
          status: 'processing',
          statusLabel: 'En préparation',
          createdAt: '2026-02-15'
        }
      ];
      this.filteredDeliveries = [...this.deliveries];
      this.loading = false;
    }, 500);
  }

  filterDeliveries(): void {
    let result = [...this.deliveries];
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(d => 
        d.orderId.toLowerCase().includes(term) ||
        d.customerName.toLowerCase().includes(term) ||
        d.trackingNumber?.toLowerCase().includes(term)
      );
    }

    if (this.statusFilter) {
      result = result.filter(d => d.status === this.statusFilter);
    }

    this.filteredDeliveries = result;
  }
}
