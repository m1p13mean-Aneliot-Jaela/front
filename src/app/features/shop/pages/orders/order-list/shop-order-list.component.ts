import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shop-order-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h2>Mes Commandes</h2>
      <div class="orders-list">
        <div class="order-card" *ngFor="let order of orders">
          <div class="order-header">
            <div class="order-info">
              <span class="order-id">#{{ order.id }}</span>
              <span class="order-date">{{ order.date }}</span>
            </div>
            <span class="status" [class]="order.status">{{ order.statusLabel }}</span>
          </div>
          <div class="order-customer">
            👤 {{ order.customer }} • {{ order.items.length }} article(s)
          </div>
          <div class="order-footer">
            <span class="total">Total: {{ order.total }}</span>
            <button class="btn-view">Voir détails</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem;
    }
    h2 {
      margin-bottom: 1.5rem;
      color: #1e293b;
    }
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
    .status {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .status.pending { background: #fef3c7; color: #b45309; }
    .status.processing { background: #dbeafe; color: #1d4ed8; }
    .status.shipped { background: #e0e7ff; color: #4338ca; }
    .status.delivered { background: #d1fae5; color: #059669; }
    .order-customer {
      color: #64748b;
      font-size: 0.875rem;
      margin-bottom: 0.75rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .total {
      font-weight: 600;
      color: #1e293b;
    }
    .btn-view {
      padding: 0.5rem 1rem;
      background: #8b5cf6;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
    }
  `]
})
export class ShopOrderListComponent {
  orders = [
    { id: 'CMD-001', date: '14 fév 2026', customer: 'John Doe', items: [{name: 'iPhone'}, {name: 'Coque'}], total: '4,680,000 Ar', status: 'pending', statusLabel: 'En attente' },
    { id: 'CMD-002', date: '13 fév 2026', customer: 'Jane Smith', items: [{name: 'AirPods'}], total: '450,000 Ar', status: 'processing', statusLabel: 'En préparation' },
    { id: 'CMD-003', date: '12 fév 2026', customer: 'Bob Wilson', items: [{name: 'Chargeur'}], total: '25,000 Ar', status: 'shipped', statusLabel: 'Expédiée' },
    { id: 'CMD-004', date: '10 fév 2026', customer: 'Alice Brown', items: [{name: 'iPhone'}], total: '4,500,000 Ar', status: 'delivered', statusLabel: 'Livrée' }
  ];
}
