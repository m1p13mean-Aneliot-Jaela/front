import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="confirmation-page" *ngIf="order">
      <div class="container">
        <!-- Success Header -->
        <div class="success-header">
          <div class="icon">✓</div>
          <h1>Commande confirmée !</h1>
          <p class="order-number">Commande #{{ order.order_number }}</p>
        </div>

        <!-- Order Summary -->
        <div class="summary-card">
          <h2>Récapitulatif de votre commande</h2>
          
          <div class="info-section">
            <h3>Informations client</h3>
            <p><strong>Nom:</strong> {{ order.customer.name }}</p>
            <p><strong>Téléphone:</strong> {{ order.customer.phone }}</p>
            <p *ngIf="order.customer.email"><strong>Email:</strong> {{ order.customer.email }}</p>
            <p *ngIf="order.customer.address">
              <strong>Adresse:</strong> {{ order.customer.address.street }}, 
              {{ order.customer.address.city }}
              <span *ngIf="order.customer.address.postal_code">{{ order.customer.address.postal_code }}</span>
            </p>
          </div>

          <div class="items-section">
            <h3>Articles commandés</h3>
            <div class="item" *ngFor="let item of order.items">
              <span class="item-name">{{ item.product_name }}</span>
              <span class="item-qty">x{{ item.quantity }}</span>
              <span class="item-price">{{ item.total_price | currency:'Ar ':'symbol':'1.0-0' }}</span>
            </div>
          </div>

          <div class="total-section">
            <span>Total</span>
            <span class="total-amount">{{ order.total_amount | currency:'Ar ':'symbol':'1.0-0' }}</span>
          </div>

          <div class="status-section">
            <span class="status-badge" [class]="order.status.toLowerCase()">
              {{ getStatusLabel(order.status) }}
            </span>
          </div>
        </div>

        <!-- Next Steps -->
        <div class="next-steps">
          <h2>Prochaines étapes</h2>
          <div class="steps">
            <div class="step">
              <div class="step-num">1</div>
              <p>Le vendeur va confirmer votre commande</p>
            </div>
            <div class="step">
              <div class="step-num">2</div>
              <p>Vous recevrez une demande de paiement</p>
            </div>
            <div class="step">
              <div class="step-num">3</div>
              <p>Après paiement, votre commande sera livrée</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions">
          <button class="btn-primary" (click)="viewMyOrders()">
            Voir mes commandes
          </button>
          <button class="btn-secondary" (click)="continueShopping()">
            Continuer mes achats
          </button>
        </div>
      </div>
    </div>

    <div class="loading" *ngIf="!order && !error">Chargement...</div>
    <div class="error" *ngIf="error">
      <p>{{ error }}</p>
      <button (click)="viewMyOrders()">Voir mes commandes</button>
    </div>
  `,
  styles: [`
    .confirmation-page {
      padding: 2rem 0;
      background: #f8fafc;
      min-height: 100vh;
    }
    .container {
      max-width: 700px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .success-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .success-header .icon {
      width: 80px;
      height: 80px;
      background: #dcfce7;
      color: #16a34a;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      margin: 0 auto 1rem;
    }
    .success-header h1 {
      color: #1e293b;
      margin: 0 0 0.5rem 0;
    }
    .order-number {
      color: #8b5cf6;
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
    }

    .summary-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .summary-card h2 {
      font-size: 1.25rem;
      color: #1e293b;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid #f1f5f9;
    }

    .info-section, .items-section {
      margin-bottom: 1.5rem;
    }
    .info-section h3, .items-section h3 {
      font-size: 1rem;
      color: #64748b;
      margin-bottom: 0.75rem;
    }
    .info-section p {
      margin: 0.25rem 0;
      color: #374151;
    }

    .item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .item:last-child { border-bottom: none; }
    .item-name { flex: 1; color: #1e293b; }
    .item-qty { 
      background: #f1f5f9; 
      padding: 0.25rem 0.75rem; 
      border-radius: 20px; 
      font-size: 0.875rem;
      margin: 0 1rem;
    }
    .item-price { 
      font-weight: 600; 
      color: #8b5cf6;
      min-width: 100px;
      text-align: right;
    }

    .total-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-top: 2px solid #e2e8f0;
      margin-top: 1rem;
      font-size: 1.25rem;
      font-weight: 700;
    }
    .total-amount { color: #8b5cf6; }

    .status-section {
      text-align: center;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #f1f5f9;
    }
    .status-badge {
      display: inline-block;
      padding: 0.5rem 1.5rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 500;
      text-transform: uppercase;
    }
    .status-badge.pending { background: #fef3c7; color: #d97706; }
    .status-badge.confirmed { background: #dbeafe; color: #2563eb; }
    .status-badge.paid { background: #dcfce7; color: #16a34a; }
    .status-badge.delivered { background: #f3e8ff; color: #9333ea; }

    .next-steps {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .next-steps h2 {
      font-size: 1.25rem;
      color: #1e293b;
      margin-bottom: 1rem;
    }
    .steps {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .step {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .step-num {
      width: 32px;
      height: 32px;
      background: #8b5cf6;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      flex-shrink: 0;
    }
    .step p {
      margin: 0;
      color: #64748b;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    .btn-primary, .btn-secondary {
      padding: 1rem 2rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
    }
    .btn-primary {
      background: #8b5cf6;
      color: white;
    }
    .btn-primary:hover { background: #7c3aed; }
    .btn-secondary {
      background: #f1f5f9;
      color: #64748b;
    }
    .btn-secondary:hover { background: #e2e8f0; }

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
export class OrderConfirmationComponent implements OnInit {
  order: Order | null = null;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    // Try to get order from navigation state
    const navigation = this.router.getCurrentNavigation();
    const stateOrder = navigation?.extras?.state?.['order'];
    
    if (stateOrder) {
      this.order = stateOrder;
    } else {
      // Otherwise fetch from API
      const orderId = this.route.snapshot.paramMap.get('id');
      if (orderId) {
        this.loadOrder(orderId);
      } else {
        this.error = 'ID de commande manquant';
      }
    }
  }

  loadOrder(id: string): void {
    this.orderService.getOrderById(id).subscribe({
      next: (response) => {
        this.order = response.data;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de la commande';
        console.error('Error:', err);
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

  viewMyOrders(): void {
    this.router.navigate(['/client/orders']);
  }

  continueShopping(): void {
    this.router.navigate(['/client/shops']);
  }
}
