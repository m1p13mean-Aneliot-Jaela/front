import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { OrderService, Order, OrderStatusHistory } from '../../../services/order.service';

@Component({
  selector: 'app-shop-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="order-detail-page" *ngIf="order">
      <div class="page-header">
        <div class="header-left">
          <a routerLink="/shop/orders" class="back-link">← Retour aux commandes</a>
          <h2>Commande {{ order.order_number }}</h2>
        </div>
        <div class="header-actions">
          <span 
            class="status-badge-large" 
            [style.background]="getStatusColor(order.status)"
          >
            {{ getStatusLabel(order.status) }}
          </span>
        </div>
      </div>

      <div class="order-grid">
        <!-- Customer Info -->
        <div class="info-card">
          <h3>👤 Client</h3>
          <div class="info-content">
            <p class="name">{{ order.customer.name }}</p>
            <p class="phone">📞 {{ order.customer.phone }}</p>
            <p class="email" *ngIf="order.customer.email">✉️ {{ order.customer.email }}</p>
            <div class="address" *ngIf="order.customer.address">
              <p>📍 {{ order.customer.address.street }}</p>
              <p>{{ order.customer.address.city }} {{ order.customer.address.postal_code }}</p>
            </div>
          </div>
        </div>

        <!-- Order Info -->
        <div class="info-card">
          <h3>📋 Détails</h3>
          <div class="info-content">
            <div class="info-row">
              <span>Date:</span>
              <span>{{ order.created_at | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
            <div class="info-row">
              <span>Paiement:</span>
              <span>{{ order.payment.method }} - {{ order.payment.status }}</span>
            </div>
            <div class="info-row" *ngIf="order.delivery?.tracking_number">
              <span>Tracking:</span>
              <span>{{ order.delivery?.tracking_number }}</span>
            </div>
          </div>
        </div>

        <!-- Status Actions -->
        <div class="info-card actions-card">
          <h3>⚡ Actions</h3>
          <div class="action-buttons">
            <button 
              *ngIf="canAdvance(order.status)"
              class="btn-advance"
              (click)="advanceStatus()"
            >
              {{ getNextStatusLabel(order.status) }}
            </button>
            <button 
              *ngIf="order.status !== 'CANCELED' && order.status !== 'DELIVERED'"
              class="btn-cancel"
              (click)="cancelOrder()"
            >
              Annuler la commande
            </button>
          </div>
        </div>

        <!-- Order Items -->
        <div class="info-card wide">
          <h3>🛍️ Articles ({{ order.items.length }})</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Prix unitaire</th>
                <th>Quantité</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of order.items">
                <td>{{ item.product_name }}</td>
                <td>{{ item.unit_price | currency:'Ar ':'symbol':'1.0-0' }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ item.total_price | currency:'Ar ':'symbol':'1.0-0' }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3">Sous-total</td>
                <td>{{ order.subtotal | currency:'Ar ':'symbol':'1.0-0' }}</td>
              </tr>
              <tr *ngIf="order.shipping_fee">
                <td colspan="3">Frais de livraison</td>
                <td>{{ order.shipping_fee | currency:'Ar ':'symbol':'1.0-0' }}</td>
              </tr>
              <tr *ngIf="order.discount">
                <td colspan="3">Remise</td>
                <td>-{{ order.discount | currency:'Ar ':'symbol':'1.0-0' }}</td>
              </tr>
              <tr class="total">
                <td colspan="3"><strong>Total</strong></td>
                <td><strong>{{ order.total_amount | currency:'Ar ':'symbol':'1.0-0' }}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Status History -->
        <div class="info-card wide">
          <h3>📜 Historique des statuts</h3>
          <div class="history-timeline">
            <div 
              *ngFor="let entry of order.status_history; let last = last" 
              class="timeline-item"
              [class.last]="last"
            >
              <div class="timeline-dot" [style.background]="getStatusColor(entry.status)"></div>
              <div class="timeline-content">
                <p class="status">{{ getStatusLabel(entry.status) }}</p>
                <p class="date">{{ entry.changed_at | date:'dd/MM/yyyy HH:mm' }}</p>
                <p class="note" *ngIf="entry.note">{{ entry.note }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="info-card wide" *ngIf="order.customer_note || order.internal_note">
          <h3>📝 Notes</h3>
          <div class="notes-content">
            <div class="note-box" *ngIf="order.customer_note">
              <strong>Note client:</strong>
              <p>{{ order.customer_note }}</p>
            </div>
            <div class="note-box internal" *ngIf="order.internal_note">
              <strong>Note interne:</strong>
              <p>{{ order.internal_note }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="loading" *ngIf="!order && !error">Chargement...</div>
    <div class="error" *ngIf="error">{{ error }}</div>
  `,
  styles: [`
    .order-detail-page { padding: 1.5rem; max-width: 1200px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
    .header-left { display: flex; flex-direction: column; gap: 0.5rem; }
    .back-link { color: #8b5cf6; text-decoration: none; font-size: 0.875rem; }
    h2 { margin: 0; color: #1e293b; }
    .status-badge-large { padding: 0.75rem 1.5rem; border-radius: 8px; color: white; font-weight: 600; font-size: 1rem; }

    .order-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
    .info-card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 1.5rem; }
    .info-card.wide { grid-column: 1 / -1; }
    .info-card h3 { margin: 0 0 1rem 0; color: #1e293b; font-size: 1rem; }
    
    .info-content { display: flex; flex-direction: column; gap: 0.5rem; }
    .info-content .name { font-weight: 600; font-size: 1.125rem; }
    .info-content .phone, .info-content .email { color: #64748b; }
    .info-content .address { margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #f1f5f9; }
    
    .info-row { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #f1f5f9; }
    .info-row:last-child { border-bottom: none; }

    .action-buttons { display: flex; flex-direction: column; gap: 0.75rem; }
    .btn-advance { padding: 0.75rem; background: #8b5cf6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; }
    .btn-advance:hover { background: #7c3aed; }
    .btn-cancel { padding: 0.75rem; background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; border-radius: 8px; cursor: pointer; }
    .btn-cancel:hover { background: #fecaca; }

    .items-table { width: 100%; border-collapse: collapse; }
    .items-table th { text-align: left; padding: 1rem; background: #f8fafc; font-size: 0.875rem; color: #64748b; border-bottom: 1px solid #e2e8f0; }
    .items-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; }
    .items-table tfoot tr { font-weight: 500; }
    .items-table tfoot tr.total { font-size: 1.125rem; color: #8b5cf6; }

    .history-timeline { display: flex; flex-direction: column; gap: 0; }
    .timeline-item { display: flex; gap: 1rem; position: relative; padding-bottom: 1.5rem; }
    .timeline-item.last { padding-bottom: 0; }
    .timeline-item:not(.last)::before { content: ''; position: absolute; left: 6px; top: 24px; bottom: 0; width: 2px; background: #e2e8f0; }
    .timeline-dot { width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
    .timeline-content { flex: 1; }
    .timeline-content .status { font-weight: 600; color: #1e293b; margin: 0; }
    .timeline-content .date { font-size: 0.875rem; color: #64748b; margin: 0.25rem 0; }
    .timeline-content .note { font-size: 0.875rem; color: #94a3b8; font-style: italic; margin: 0; }

    .notes-content { display: flex; flex-direction: column; gap: 1rem; }
    .note-box { padding: 1rem; background: #f8fafc; border-radius: 8px; }
    .note-box.internal { background: #fef3c7; }
    .note-box p { margin: 0.5rem 0 0 0; color: #64748b; }

    .loading, .error { text-align: center; padding: 3rem; }
    .error { color: #dc2626; }
  `]
})
export class ShopOrderDetailComponent implements OnInit {
  order: Order | null = null;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      // Redirect to add page if id is 'new' or 'add'
      if (orderId === 'new' || orderId === 'add') {
        this.router.navigate(['/shop/orders/add']);
        return;
      }
      this.loadOrder(orderId);
    }
  }

  loadOrder(orderId: string): void {
    this.orderService.getOrder(orderId).subscribe({
      next: (response) => {
        this.order = response.data;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de la commande';
        console.error(err);
      }
    });
  }

  canAdvance(status: string): boolean {
    // Shop can only advance: PENDING, CONFIRMED, PAID, SHIPPED
    // PAYMENT_REQUESTED must wait for client confirmation
    return ['PENDING', 'CONFIRMED', 'PAID', 'SHIPPED'].includes(status);
  }

  advanceStatus(): void {
    if (!this.order) return;
    
    const nextStatus: Record<string, string> = {
      'PENDING': 'CONFIRMED',
      'CONFIRMED': 'PAYMENT_REQUESTED',
      // 'PAYMENT_REQUESTED' -> 'PAID' is done by CLIENT, not shop
      'PAID': 'SHIPPED',
      'SHIPPED': 'DELIVERED'
    };
    
    const newStatus = nextStatus[this.order.status];
    if (!newStatus) return;
    
    // CONFIRMED → PAYMENT_REQUESTED
    if (this.order.status === 'CONFIRMED') {
      if (confirm(`Demander le paiement au client pour ${this.order.total_amount.toLocaleString()} Ar ?`)) {
        this.orderService.updateStatus(this.order._id, newStatus).subscribe({
          next: (response) => {
            this.order = response.data;
            alert('Demande de paiement envoyée au client');
          },
          error: (err) => {
            alert('Erreur: ' + (err?.error?.message || 'Erreur inconnue'));
          }
        });
      }
      return;
    }
    
    // PAID → SHIPPED or others
    if (confirm(`Avancer vers "${this.getStatusLabel(newStatus)}" ?`)) {
      this.orderService.updateStatus(this.order._id, newStatus).subscribe({
        next: (response) => {
          this.order = response.data;
        },
        error: (err) => {
          alert('Erreur: ' + (err?.error?.message || 'Erreur inconnue'));
        }
      });
    }
  }

  cancelOrder(): void {
    if (!this.order) return;
    
    if (confirm('Annuler cette commande ?')) {
      this.orderService.updateStatus(this.order._id, 'CANCELED', 'Annulation manuelle').subscribe({
        next: (response) => {
          this.order = response.data;
        },
        error: (err) => {
          alert('Erreur: ' + (err?.error?.message || 'Erreur inconnue'));
        }
      });
    }
  }

  getNextStatusLabel(currentStatus: string): string {
    const labels: Record<string, string> = {
      'PENDING': '✓ Confirmer la commande',
      'CONFIRMED': '💰 Demander paiement',
      'PAID': '📦 Marquer comme expédiée',
      'SHIPPED': '🎉 Marquer comme livrée'
    };
    return labels[currentStatus] || 'Avancer';
  }

  getStatusLabel(status: string): string {
    return this.orderService.getStatusLabel(status);
  }

  getStatusColor(status: string): string {
    return this.orderService.getStatusColor(status);
  }
}