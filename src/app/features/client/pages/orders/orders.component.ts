import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';

interface DisplayOrder {
  _id: string;
  id: string;
  date: string;
  status: string;
  statusLabel: string;
  total: string;
  items: Array<{
    name: string;
    shop: string;
    price: string;
    image: string;
  }>;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-container">
      <h2>Mes Commandes</h2>
      <div class="orders-list" *ngIf="orders.length > 0; else empty">
        <div class="order-card" *ngFor="let order of orders">
          <div class="order-header">
            <div>
              <span class="order-id">#{{ order.id }}</span>
              <span class="order-date">{{ order.date }}</span>
            </div>
            <span class="status" [class]="order.status">{{ order.statusLabel }}</span>
          </div>
          <div class="order-items">
            <div class="item" *ngFor="let item of order.items">
              <span class="item-image">{{ item.image }}</span>
              <div class="item-details">
                <h4>{{ item.name }}</h4>
                <p class="shop">{{ item.shop }}</p>
              </div>
              <span class="item-price">{{ item.price }}</span>
            </div>
          </div>
          <div class="order-footer">
            <span class="total">Total: {{ order.total }}</span>
            <button class="btn-details" (click)="viewOrder(order._id)">Voir détails</button>
          </div>
        </div>
      </div>
      <ng-template #empty>
        <div class="empty-state">
          <span class="icon">📋</span>
          <p>{{ loading ? 'Chargement...' : 'Vous n\'avez pas encore de commandes' }}</p>
          <button class="btn-primary" (click)="goShopping()" *ngIf="!loading">Faire des achats</button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    h2 {
      margin-bottom: 1.5rem;
      color: #1e293b;
    }
    .order-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .order-id {
      font-weight: 600;
      color: #1e293b;
      margin-right: 1rem;
    }
    .order-date {
      color: #64748b;
      font-size: 0.875rem;
    }
    .status {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .status.delivered {
      background: #d1fae5;
      color: #059669;
    }
    .status.pending {
      background: #fef3c7;
      color: #b45309;
    }
    .item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 0;
    }
    .item-image {
      font-size: 2rem;
    }
    .item-details {
      flex: 1;
    }
    h4 {
      margin: 0 0 0.25rem 0;
      color: #1e293b;
      font-size: 0.9375rem;
    }
    .shop {
      color: #64748b;
      font-size: 0.875rem;
      margin: 0;
    }
    .item-price {
      font-weight: 600;
      color: #1e293b;
    }
    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
    }
    .total {
      font-weight: 600;
      color: #1e293b;
    }
    .btn-details {
      padding: 0.5rem 1rem;
      background: white;
      color: #10b981;
      border: 2px solid #10b981;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
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
    }
  `]
})
export class OrdersComponent implements OnInit {
  orders: DisplayOrder[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getMyOrders().subscribe({
      next: (response) => {
        this.orders = this.mapOrders(response.data);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.error = 'Erreur lors du chargement des commandes';
        this.loading = false;
      }
    });
  }

  mapOrders(orders: Order[]): DisplayOrder[] {
    return orders.map(order => ({
      _id: order._id,
      id: order.order_number,
      date: new Date(order.created_at).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      status: this.mapStatus(order.status),
      statusLabel: this.getStatusLabel(order.status),
      total: this.formatPrice(order.total_amount),
      items: order.items.map(item => ({
        name: item.product_name,
        shop: 'Boutique',
        price: this.formatPrice(item.total_price),
        image: '📦'
      }))
    }));
  }

  mapStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'pending',
      'CONFIRMED': 'confirmed',
      'PAYMENT_REQUESTED': 'pending',
      'PAID': 'confirmed',
      'SHIPPED': 'shipped',
      'DELIVERED': 'delivered',
      'CANCELED': 'canceled'
    };
    return statusMap[status] || 'pending';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'PENDING': 'En attente',
      'CONFIRMED': 'Confirmée',
      'PAYMENT_REQUESTED': 'Paiement demandé',
      'PAID': 'Payée',
      'SHIPPED': 'Expédiée',
      'DELIVERED': 'Livrée',
      'CANCELED': 'Annulée'
    };
    return labels[status] || status;
  }

  formatPrice(amount: number): string {
    return amount.toLocaleString('fr-FR') + ' Ar';
  }

  viewOrder(orderId: string): void {
    this.router.navigate(['/client/orders', orderId]);
  }

  goShopping(): void {
    this.router.navigate(['/client/shops']);
  }
}
