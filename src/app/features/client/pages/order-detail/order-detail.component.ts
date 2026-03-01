import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="order-detail-page" *ngIf="order">
      <div class="container">
        <!-- Header -->
        <div class="header">
          <button class="btn-back" (click)="goBack()">← Retour</button>
          <h1>Commande #{{ order.order_number }}</h1>
        </div>

        <!-- Status Banner -->
        <div class="status-banner" [class]="order.status.toLowerCase()">
          <span class="status-label">{{ getStatusLabel(order.status) }}</span>
          <span class="status-desc">{{ getStatusDescription(order.status) }}</span>
        </div>

        <!-- Order Info -->
        <div class="info-card">
          <h2>Informations</h2>
          <div class="info-grid">
            <div>
              <label>Date de commande</label>
              <p>{{ order.created_at | date:'dd/MM/yyyy à HH:mm' }}</p>
            </div>
            <div>
              <label>Client</label>
              <p>{{ order.customer.name }}</p>
              <p>{{ order.customer.phone }}</p>
            </div>
            <div *ngIf="order.customer.address">
              <label>Adresse de livraison</label>
              <p>{{ order.customer.address.street }}</p>
              <p>{{ order.customer.address.city }} {{ order.customer.address.postal_code }}</p>
            </div>
          </div>
        </div>

        <!-- Items -->
        <div class="items-card">
          <h2>Articles</h2>
          <div class="item" *ngFor="let item of order.items">
            <span class="item-name">{{ item.product_name }}</span>
            <span class="item-qty">x{{ item.quantity }}</span>
            <span class="item-price">{{ item.unit_price | number:'1.0-0' }} Ar</span>
            <span class="item-total">{{ item.total_price | number:'1.0-0' }} Ar</span>
          </div>
          <div class="totals">
            <div class="row">
              <span>Sous-total</span>
              <span>{{ order.subtotal || 0 | number:'1.0-0' }} Ar</span>
            </div>
            <div class="row">
              <span>Frais de livraison</span>
              <span>{{ order.shipping_fee || 0 | number:'1.0-0' }} Ar</span>
            </div>
            <div class="row" *ngIf="order.discount && order.discount > 0">
              <span>Remise</span>
              <span>-{{ order.discount | number:'1.0-0' }} Ar</span>
            </div>
            <div class="row total">
              <span>Total</span>
              <span>{{ order.total_amount | number:'1.0-0' }} Ar</span>
            </div>
          </div>
        </div>

        <!-- Payment Section -->
        <div class="payment-card" *ngIf="order.status === 'PAYMENT_REQUESTED'">
          <h2>💳 Paiement</h2>
          <p class="payment-desc">Le vendeur attend votre paiement. Choisissez votre méthode de paiement :</p>
          
          <div class="payment-methods">
            <div class="method" 
                 *ngFor="let method of paymentMethods" 
                 [class.selected]="selectedMethod === method.id"
                 (click)="selectMethod(method.id)">
              <span class="method-icon">{{ method.icon }}</span>
              <div class="method-info">
                <span class="method-name">{{ method.name }}</span>
                <span class="method-desc">{{ method.description }}</span>
              </div>
            </div>
          </div>

          <button class="btn-pay" 
                  [disabled]="!selectedMethod || paying"
                  (click)="confirmPayment()">
            {{ paying ? 'Traitement...' : 'Confirmer le paiement' }}
          </button>
        </div>

        <!-- Payment Status -->
        <div class="payment-status" *ngIf="order.payment && order.payment.status === 'PAID'">
          <div class="paid-badge">
            ✓ Paiement confirmé le {{ order.payment.paid_at | date:'dd/MM/yyyy à HH:mm' }}
          </div>
        </div>

        <!-- Next Steps -->
        <div class="next-steps" *ngIf="order.status === 'PAID' || order.status === 'SHIPPED'">
          <h3>Prochaines étapes</h3>
          <div class="step-list">
            <div class="step" [class.done]="isStep1Done(order.status)">
              <span class="step-num">1</span>
              <span>Commande confirmée</span>
            </div>
            <div class="step" [class.done]="order.payment && order.payment.status === 'PAID'">
              <span class="step-num">2</span>
              <span>Paiement effectué</span>
            </div>
            <div class="step" [class.done]="isStep3Done(order.status)">
              <span class="step-num">3</span>
              <span>Commande expédiée</span>
            </div>
            <div class="step" [class.done]="isStep4Done(order.status)">
              <span class="step-num">4</span>
              <span>Livraison</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="loading" *ngIf="!order && !error">Chargement...</div>
    <div class="error" *ngIf="error">
      <p>{{ error }}</p>
      <button (click)="goBack()">Retour</button>
    </div>
  `,
  styles: [`
    .order-detail-page {
      padding: 2rem 0;
      background: #f8fafc;
      min-height: 100vh;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .btn-back {
      padding: 0.5rem 1rem;
      background: #f1f5f9;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
    }
    .header h1 {
      font-size: 1.5rem;
      color: #1e293b;
      margin: 0;
    }

    .status-banner {
      padding: 1rem 1.5rem;
      border-radius: 12px;
      margin-bottom: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .status-banner.pending {
      background: #fef3c7;
      color: #b45309;
    }
    .status-banner.payment_requested {
      background: #dbeafe;
      color: #1e40af;
    }
    .status-banner.paid {
      background: #d1fae5;
      color: #065f46;
    }
    .status-banner.delivered {
      background: #f3e8ff;
      color: #6b21a8;
    }
    .status-label {
      font-weight: 600;
      font-size: 1.125rem;
    }
    .status-desc {
      font-size: 0.875rem;
      opacity: 0.9;
    }

    .info-card, .items-card, .payment-card, .payment-status, .next-steps {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .info-card h2, .items-card h2, .payment-card h2, .next-steps h3 {
      font-size: 1.125rem;
      color: #1e293b;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    .info-grid label {
      font-size: 0.875rem;
      color: #64748b;
      display: block;
      margin-bottom: 0.25rem;
    }
    .info-grid p {
      margin: 0;
      color: #1e293b;
    }

    .item {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 1rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f1f5f9;
      align-items: center;
    }
    .item:last-child {
      border-bottom: none;
    }
    .item-name {
      font-weight: 500;
      color: #1e293b;
    }
    .item-qty {
      color: #64748b;
    }
    .item-price, .item-total {
      text-align: right;
      color: #1e293b;
    }
    .item-total {
      font-weight: 600;
      color: #8b5cf6;
    }

    .totals {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 2px solid #e2e8f0;
    }
    .row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      color: #64748b;
    }
    .row.total {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e293b;
      padding-top: 0.75rem;
      border-top: 1px solid #e2e8f0;
    }

    .payment-desc {
      color: #64748b;
      margin-bottom: 1rem;
    }
    .payment-methods {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }
    .method {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .method:hover {
      border-color: #8b5cf6;
    }
    .method.selected {
      border-color: #8b5cf6;
      background: #f5f3ff;
    }
    .method-icon {
      font-size: 1.5rem;
    }
    .method-info {
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .method-name {
      font-weight: 600;
      color: #1e293b;
    }
    .method-desc {
      font-size: 0.875rem;
      color: #64748b;
    }

    .btn-pay {
      width: 100%;
      padding: 1rem;
      background: #8b5cf6;
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-pay:hover:not(:disabled) {
      background: #7c3aed;
    }
    .btn-pay:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .paid-badge {
      background: #dcfce7;
      color: #16a34a;
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
      font-weight: 500;
    }

    .step-list {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .step {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #f1f5f9;
      border-radius: 20px;
      color: #64748b;
      font-size: 0.875rem;
    }
    .step.done {
      background: #dcfce7;
      color: #16a34a;
    }
    .step-num {
      width: 20px;
      height: 20px;
      background: currentColor;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .loading, .error {
      text-align: center;
      padding: 3rem;
      color: #64748b;
    }
    .error {
      color: #dc2626;
    }
    .error button {
      margin-top: 1rem;
      padding: 0.75rem 1.5rem;
      background: #8b5cf6;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }
  `]
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  loading = true;
  error: string | null = null;
  paying = false;
  selectedMethod: string | null = null;

  paymentMethods = [
    { id: 'MOBILE_MONEY', name: 'Mobile Money', icon: '📱', description: 'Airtel Money, MVola, Orange Money' },
    { id: 'BANK_TRANSFER', name: 'Virement bancaire', icon: '🏦', description: 'Transfert depuis votre compte bancaire' },
    { id: 'CARD', name: 'Carte bancaire', icon: '💳', description: 'Visa, Mastercard' },
    { id: 'CASH', name: 'Espèces', icon: '💵', description: 'Paiement à la livraison' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(orderId);
    } else {
      this.error = 'ID de commande manquant';
      this.loading = false;
    }
  }

  loadOrder(id: string): void {
    this.loading = true;
    this.orderService.getOrderById(id).subscribe({
      next: (response) => {
        this.order = response.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading order:', err);
        this.error = 'Erreur lors du chargement de la commande';
        this.loading = false;
      }
    });
  }

  selectMethod(methodId: string): void {
    this.selectedMethod = methodId;
  }

  confirmPayment(): void {
    if (!this.order || !this.selectedMethod) return;

    this.paying = true;
    this.orderService.confirmPayment(this.order._id).subscribe({
      next: (response) => {
        this.paying = false;
        // Refresh notifications after payment confirmation
        this.notificationService.refreshNotifications();
        alert('Paiement confirmé avec succès !');
        this.loadOrder(this.order!._id); // Reload to show updated status
      },
      error: (err) => {
        this.paying = false;
        console.error('Payment error:', err);
        alert('Erreur lors du paiement: ' + (err.error?.message || 'Veuillez réessayer'));
      }
    });
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

  getStatusDescription(status: string): string {
    const descriptions: { [key: string]: string } = {
      'PENDING': 'Votre commande est en attente de confirmation par le vendeur',
      'CONFIRMED': 'Le vendeur a confirmé votre commande',
      'PAYMENT_REQUESTED': 'Le vendeur attend votre paiement pour poursuivre',
      'PAID': 'Paiement confirmé, préparation en cours',
      'SHIPPED': 'Votre commande est en cours de livraison',
      'DELIVERED': 'Commande livrée avec succès',
      'CANCELED': 'Commande annulée'
    };
    return descriptions[status] || '';
  }

  goBack(): void {
    this.router.navigate(['/client/orders']);
  }

  // Helper methods to avoid type comparison issues
  isStep1Done(status: string): boolean {
    return status !== 'PENDING' && status !== 'CONFIRMED';
  }

  isStep3Done(status: string): boolean {
    return status === 'SHIPPED' || status === 'DELIVERED';
  }

  isStep4Done(status: string): boolean {
    return status === 'DELIVERED';
  }
}
