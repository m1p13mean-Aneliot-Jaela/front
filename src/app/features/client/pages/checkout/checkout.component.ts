import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { OrderService, CreateOrderRequest, OrderItem } from '../../services/order.service';
import { AuthService } from '../../../../core/services/auth.service';

interface Product {
  _id: string;
  name: string;
  description?: string;
  unit_price: number;
  image_url?: string;
  images?: string[];
  stock_quantity?: number;
  shop_id: string;
  shop_name?: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="checkout-page" *ngIf="product">
      <div class="container">
        <h1>Finaliser votre commande</h1>
        
        <!-- Product Summary -->
        <div class="product-summary">
          <img [src]="product.images?.[0] || product.image_url || '/assets/images/default-product.png'" 
               [alt]="product.name">
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <p class="shop" *ngIf="product.shop_name">{{ product.shop_name }}</p>
            <p class="price">{{ product.unit_price | currency:'Ar ':'symbol':'1.0-0' }} x {{ quantity }}</p>
            <p class="total">Total: {{ product.unit_price * quantity | currency:'Ar ':'symbol':'1.0-0' }}</p>
          </div>
        </div>

        <!-- Customer Form -->
        <div class="form-section">
          <h2>Informations de livraison</h2>
          
          <div class="form-group">
            <label>Nom complet *</label>
            <input type="text" [(ngModel)]="customer.name" placeholder="Votre nom et prénom" required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Téléphone *</label>
              <input type="tel" [(ngModel)]="customer.phone" placeholder="Votre numéro" required>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" [(ngModel)]="customer.email" placeholder="Votre email (optionnel)">
            </div>
          </div>

          <h3>Adresse de livraison</h3>
          
          <div class="form-group">
            <label>Rue / Quartier *</label>
            <input type="text" [(ngModel)]="customer.address.street" placeholder="Rue, quartier, numéro..." required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Ville *</label>
              <input type="text" [(ngModel)]="customer.address.city" placeholder="Ville" required>
            </div>
            <div class="form-group">
              <label>Code postal</label>
              <input type="text" [(ngModel)]="customer.address.postal_code" placeholder="Code postal">
            </div>
          </div>

          <div class="form-group">
            <label>Notes pour la livraison (optionnel)</label>
            <textarea [(ngModel)]="notes" rows="3" 
                      placeholder="Instructions spéciales pour le livreur..."></textarea>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions">
          <button class="btn-back" (click)="goBack()">← Retour</button>
          <button class="btn-confirm" 
                  (click)="confirmOrder()" 
                  [disabled]="!isFormValid() || submitting">
            {{ submitting ? 'Traitement...' : '✓ Confirmer la commande' }}
          </button>
        </div>

        <!-- Error Message -->
        <div class="error-message" *ngIf="error">
          {{ error }}
        </div>
      </div>
    </div>

    <div class="loading" *ngIf="!product && !error">Chargement...</div>
    <div class="error" *ngIf="error && !product">{{ error }}</div>
  `,
  styles: [`
    .checkout-page { 
      padding: 2rem 0; 
      background: #f8fafc; 
      min-height: 100vh;
    }
    .container { 
      max-width: 800px; 
      margin: 0 auto; 
      padding: 0 1rem; 
    }
    h1 { 
      font-size: 1.75rem; 
      color: #1e293b; 
      margin-bottom: 1.5rem;
      text-align: center;
    }
    
    .product-summary {
      display: flex;
      gap: 1.5rem;
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .product-summary img {
      width: 120px;
      height: 120px;
      object-fit: cover;
      border-radius: 8px;
    }
    .product-info { flex: 1; }
    .product-info h3 { margin: 0 0 0.5rem 0; color: #1e293b; }
    .product-info .shop { color: #64748b; font-size: 0.875rem; margin-bottom: 0.5rem; }
    .product-info .price { color: #64748b; font-size: 0.9rem; }
    .product-info .total { 
      color: #8b5cf6; 
      font-size: 1.25rem; 
      font-weight: 700; 
      margin-top: 0.5rem;
    }
    
    .form-section {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .form-section h2 {
      font-size: 1.25rem;
      color: #1e293b;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid #f1f5f9;
    }
    .form-section h3 {
      font-size: 1rem;
      color: #1e293b;
      margin: 1.5rem 0 1rem 0;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    .form-group label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
    }
    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      box-sizing: border-box;
    }
    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #8b5cf6;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    @media (max-width: 640px) {
      .form-row { grid-template-columns: 1fr; }
    }
    
    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    .btn-back {
      padding: 1rem 2rem;
      background: #f1f5f9;
      color: #64748b;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      cursor: pointer;
    }
    .btn-confirm {
      padding: 1rem 2rem;
      background: #8b5cf6;
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-confirm:hover:not(:disabled) { background: #7c3aed; }
    .btn-confirm:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .error-message {
      margin-top: 1rem;
      padding: 1rem;
      background: #fee2e2;
      color: #dc2626;
      border-radius: 8px;
      text-align: center;
    }
    
    .loading, .error {
      text-align: center;
      padding: 3rem;
      color: #64748b;
    }
    .error { color: #dc2626; }
  `]
})
export class CheckoutComponent implements OnInit {
  product: Product | null = null;
  quantity: number = 1;
  submitting = false;
  error: string | null = null;
  
  customer = {
    name: '',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      postal_code: ''
    }
  };
  notes = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get query params
    const productId = this.route.snapshot.queryParamMap.get('product');
    this.quantity = parseInt(this.route.snapshot.queryParamMap.get('qty') || '1', 10);
    
    if (!productId) {
      this.error = 'Produit non spécifié';
      return;
    }
    
    this.loadProduct(productId);
    
    // Prefill customer info
    const user = this.authService.currentUserValue;
    if (user) {
      this.customer.name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
      this.customer.phone = user.phone || '';
      this.customer.email = user.email || '';
    }
  }

  loadProduct(id: string): void {
    this.http.get<{ success: boolean; data: Product }>(
      `${environment.apiUrl}/products/${id}`
    ).subscribe({
      next: (response) => {
        this.product = response.data;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du produit';
        console.error('Error:', err);
      }
    });
  }

  isFormValid(): boolean {
    return !!(
      this.customer.name &&
      this.customer.phone &&
      this.customer.address.street &&
      this.customer.address.city
    );
  }

  goBack(): void {
    if (this.product) {
      this.router.navigate(['/client/products', this.product._id]);
    } else {
      this.router.navigate(['/client/shops']);
    }
  }

  confirmOrder(): void {
    if (!this.product || !this.isFormValid()) return;

    this.submitting = true;
    this.error = null;

    const orderItem: OrderItem = {
      product_id: this.product._id,
      product_name: this.product.name,
      quantity: this.quantity,
      unit_price: this.product.unit_price,
      total_price: this.product.unit_price * this.quantity
    };

    const orderData: CreateOrderRequest = {
      shop_id: this.product.shop_id,
      customer: {
        name: this.customer.name,
        phone: this.customer.phone,
        email: this.customer.email || undefined,
        address: {
          street: this.customer.address.street,
          city: this.customer.address.city,
          postal_code: this.customer.address.postal_code || undefined
        }
      },
      items: [orderItem],
      notes: this.notes || undefined
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (response) => {
        this.submitting = false;
        // Navigate to confirmation page
        this.router.navigate(['/client/order-confirmation', response.data._id], {
          state: { order: response.data }
        });
      },
      error: (err) => {
        this.submitting = false;
        this.error = err.error?.message || 'Erreur lors de la création de la commande';
        console.error('Error:', err);
      }
    });
  }
}
