import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, Cart, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="cart-page">
      <div class="page-header">
        <h1 class="page-title">
          <span class="title-icon">⊞</span>
          Mon Panier
        </h1>
        <p class="subtitle">Préparez votre demande de devis</p>
      </div>

      <!-- Empty Cart -->
      <div class="empty-cart" *ngIf="!cart.items.length">
        <div class="empty-content">
          <div class="empty-icon">�</div>
          <h3>Votre panier est vide</h3>
          <p>Parcourez les boutiques pour ajouter des produits</p>
          <button class="btn-primary" routerLink="/client/shops">
            <span class="btn-icon">▣</span>
            Voir les boutiques
          </button>
        </div>
      </div>

      <!-- Cart Content -->
      <div class="cart-content" *ngIf="cart.items.length">
        <div class="shop-info-card">
          <div class="shop-badge">
            <span class="badge-icon">▣</span>
            <span class="badge-text">{{ cart.shop_name }}</span>
          </div>
          <span class="item-count">{{ cart.items.length }} produit(s)</span>
        </div>

        <div class="cart-items">
          <div class="cart-item" *ngFor="let item of cart.items; let i = index">
            <div class="item-header">
              <div class="item-info">
                <h4 class="item-name">{{ item.product_name }}</h4>
                <span class="item-price">{{ item.unit_price | number:'1.0-0' }} FCFA</span>
              </div>
            </div>
            
            <div class="item-controls">
              <div class="quantity-section">
                <label class="quantity-label">Quantité</label>
                <div class="quantity-control">
                  <button 
                    class="btn-qty" 
                    (click)="updateQuantity(item.product_id, item.quantity - 1)"
                    [disabled]="item.quantity <= 1">
                    −
                  </button>
                  <span class="qty-value">{{ item.quantity }}</span>
                  <button 
                    class="btn-qty" 
                    (click)="updateQuantity(item.product_id, item.quantity + 1)">
                    +
                  </button>
                </div>
              </div>
              
              <button 
                class="btn-remove" 
                (click)="removeItem(item.product_id)"
                title="Retirer du panier">
                <span class="remove-icon">×</span>
                Retirer
              </button>
            </div>

            <div class="item-notes">
              <label class="notes-label">Notes (optionnel)</label>
              <input 
                type="text" 
                [(ngModel)]="itemNotes[item.product_id]"
                (blur)="saveNotes(item.product_id)"
                placeholder="Précisez la taille, la couleur, etc..."
                class="notes-input">
            </div>

            <div class="item-total">
              <span>Sous-total:</span>
              <span class="subtotal-value">{{ item.unit_price * item.quantity | number:'1.0-0' }} FCFA</span>
            </div>
          </div>
        </div>

        <div class="cart-summary">
          <div class="summary-content">
            <div class="summary-row">
              <span class="summary-label">Total estimé:</span>
              <span class="total-value">{{ estimatedTotal | number:'1.0-0' }} FCFA</span>
            </div>
            <p class="disclaimer">
              <span class="disclaimer-icon">ⓘ</span>
              Ce montant est indicatif. Le manager vous enverra un devis précis.
            </p>
          </div>
        </div>

        <div class="cart-actions">
          <button class="btn-secondary" (click)="clearCart()">
            <span class="btn-icon">×</span>
            Vider le panier
          </button>
          <button 
            class="btn-primary" 
            (click)="proceedToQuote()"
            [disabled]="cart.items.length === 0">
            <span class="btn-icon">☰</span>
            Demander un devis
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Cart Page */
    .cart-page {
      max-width: 900px;
      margin: 0 auto;
    }

    /* Page Header */
    .page-header {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.8));
      border-radius: 24px;
      padding: 2.5rem 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 16px rgba(30, 41, 59, 0.08);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.5);
    }

    .page-title {
      font-family: 'Nunito', sans-serif;
      font-weight: 900;
      font-size: 2.25rem;
      color: #1e293b;
      margin: 0 0 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      letter-spacing: -0.02em;
    }

    .title-icon {
      font-size: 2.5rem;
    }

    .subtitle {
      font-family: 'Inter', sans-serif;
      font-size: 1.0625rem;
      color: #64748B;
      margin: 0;
    }

    /* Empty Cart */
    .empty-cart {
      background: white;
      border-radius: 24px;
      padding: 4rem 2rem;
      text-align: center;
      box-shadow: 0 4px 16px rgba(30, 41, 59, 0.08);
    }

    .empty-content {
      max-width: 400px;
      margin: 0 auto;
    }

    .empty-icon {
      font-size: 5rem;
      margin-bottom: 1.5rem;
      display: inline-block;
      animation: bounce 2s ease-in-out infinite;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }

    .empty-cart h3 {
      font-family: 'Nunito', sans-serif;
      font-weight: 800;
      font-size: 1.5rem;
      color: #1e293b;
      margin: 0 0 0.75rem 0;
    }

    .empty-cart p {
      font-family: 'Inter', sans-serif;
      color: #64748B;
      margin: 0 0 2rem 0;
      font-size: 1.0625rem;
    }

    /* Cart Content */
    .cart-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* Shop Info Card */
    .shop-info-card {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(29, 78, 216, 0.05));
      border: 2px solid rgba(59, 130, 246, 0.3);
      border-radius: 20px;
      padding: 1.25rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.08);
    }

    .shop-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: 'Nunito', sans-serif;
      font-weight: 800;
      font-size: 1.125rem;
      color: #1D4ED8;
    }

    .badge-icon {
      font-size: 1.5rem;
    }

    .item-count {
      font-family: 'Inter', sans-serif;
      font-size: 0.9375rem;
      font-weight: 600;
      color: #64748B;
      background: white;
      padding: 0.5rem 1rem;
      border-radius: 50px;
    }

    /* Cart Items */
    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .cart-item {
      background: white;
      padding: 1.75rem;
      border-radius: 20px;
      box-shadow: 0 4px 16px rgba(30, 41, 59, 0.08);
      border: 2px solid transparent;
      transition: all 0.3s ease;
    }

    .cart-item:hover {
      border-color: rgba(59, 130, 246, 0.2);
      box-shadow: 0 8px 24px rgba(30, 41, 59, 0.12);
    }

    /* Item Header */
    .item-header {
      margin-bottom: 1.5rem;
    }

    .item-info {
      display: flex;
      justify-content: space-between;
      align-items: start;
      gap: 1rem;
    }

    .item-name {
      font-family: 'Nunito', sans-serif;
      font-weight: 800;
      font-size: 1.25rem;
      color: #1e293b;
      margin: 0;
      flex: 1;
    }

    .item-price {
      font-family: 'Nunito', sans-serif;
      font-weight: 700;
      font-size: 1.125rem;
      color: #3B82F6;
      white-space: nowrap;
    }

    /* Item Controls */
    .item-controls {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 1rem;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
    }

    .quantity-section {
      flex: 1;
      min-width: 200px;
    }

    .quantity-label {
      font-family: 'Nunito', sans-serif;
      font-weight: 700;
      font-size: 0.875rem;
      color: #64748B;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      display: block;
      margin-bottom: 0.5rem;
    }

    .quantity-control {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      background: #F8FAFC;
      border: 2px solid #E2E8F0;
      border-radius: 50px;
      padding: 0.5rem 1rem;
    }

    .btn-qty {
      width: 36px;
      height: 36px;
      border: none;
      background: white;
      border-radius: 50%;
      cursor: pointer;
      font-family: 'Nunito', sans-serif;
      font-weight: 700;
      font-size: 1.125rem;
      color: #1e293b;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .btn-qty:hover:not(:disabled) {
      background: linear-gradient(135deg, #3B82F6, #1D4ED8);
      color: white;
      transform: scale(1.1);
    }

    .btn-qty:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .qty-value {
      min-width: 50px;
      text-align: center;
      font-family: 'Nunito', sans-serif;
      font-weight: 800;
      font-size: 1.125rem;
      color: #1e293b;
    }

    .btn-remove {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: rgba(239, 68, 68, 0.1);
      border: 2px solid rgba(239, 68, 68, 0.3);
      border-radius: 50px;
      font-family: 'Nunito', sans-serif;
      font-weight: 700;
      font-size: 0.9375rem;
      color: #dc2626;
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;
    }

    .btn-remove:hover {
      background: #ef4444;
      border-color: #ef4444;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    .remove-icon {
      font-size: 1.1rem;
    }

    /* Item Notes */
    .item-notes {
      margin-bottom: 1.25rem;
    }

    .notes-label {
      font-family: 'Nunito', sans-serif;
      font-weight: 700;
      font-size: 0.875rem;
      color: #64748B;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      display: block;
      margin-bottom: 0.5rem;
    }

    .notes-input {
      width: 100%;
      padding: 1rem 1.25rem;
      font-family: 'Inter', sans-serif;
      font-size: 0.9375rem;
      border: 2px solid #E2E8F0;
      border-radius: 12px;
      background: #F8FAFC;
      color: #1E293B;
      transition: all 0.3s ease;
      outline: none;
    }

    .notes-input::placeholder {
      color: #94A3B8;
    }

    .notes-input:focus {
      border-color: #3B82F6;
      background: white;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }

    /* Item Total */
    .item-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1.25rem;
      border-top: 2px solid #F1F5F9;
      font-family: 'Nunito', sans-serif;
      font-weight: 700;
      font-size: 1rem;
      color: #64748B;
    }

    .subtotal-value {
      color: #3B82F6;
      font-size: 1.125rem;
    }

    /* Cart Summary */
    .cart-summary {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05));
      border: 2px solid rgba(16, 185, 129, 0.3);
      border-radius: 20px;
      padding: 1.75rem;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.08);
    }

    .summary-content {
      max-width: 100%;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .summary-label {
      font-family: 'Nunito', sans-serif;
      font-weight: 700;
      font-size: 1.25rem;
      color: #1e293b;
    }

    .total-value {
      font-family: 'Nunito', sans-serif;
      font-weight: 900;
      font-size: 1.75rem;
      color: #059669;
    }

    .disclaimer {
      display: flex;
      align-items: start;
      gap: 0.5rem;
      font-family: 'Inter', sans-serif;
      font-size: 0.875rem;
      color: #64748B;
      margin: 0;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 12px;
    }

    .disclaimer-icon {
      flex-shrink: 0;
      font-size: 1rem;
    }

    /* Cart Actions */
    .cart-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      flex-wrap: wrap;
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 2rem;
      background: linear-gradient(135deg, #3B82F6, #1D4ED8);
      color: white;
      border: none;
      border-radius: 50px;
      font-family: 'Nunito', sans-serif;
      font-weight: 800;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 8px 24px rgba(29, 78, 216, 0.25);
      letter-spacing: 0.02em;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(29, 78, 216, 0.35);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 2rem;
      background: rgba(239, 68, 68, 0.1);
      color: #dc2626;
      border: 2px solid rgba(239, 68, 68, 0.3);
      border-radius: 50px;
      font-family: 'Nunito', sans-serif;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-secondary:hover {
      background: #ef4444;
      border-color: #ef4444;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    .btn-icon {
      font-size: 1.2rem;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .page-header {
        padding: 2rem 1.5rem;
      }

      .page-title {
        font-size: 1.875rem;
      }

      .cart-item {
        padding: 1.5rem;
      }

      .item-controls {
        flex-direction: column;
        align-items: stretch;
      }

      .quantity-section {
        min-width: 100%;
      }

      .btn-remove {
        width: 100%;
        justify-content: center;
      }

      .cart-actions {
        flex-direction: column;
      }

      .btn-primary, .btn-secondary {
        width: 100%;
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .page-header {
        padding: 1.5rem 1rem;
      }

      .page-title {
        font-size: 1.625rem;
        flex-direction: column;
        gap: 0.5rem;
      }

      .title-icon {
        font-size: 2rem;
      }

      .cart-item {
        padding: 1.25rem;
      }

      .item-name {
        font-size: 1.125rem;
      }

      .summary-label {
        font-size: 1.125rem;
      }

      .total-value {
        font-size: 1.5rem;
      }
    }
  `]
})
export class CartComponent implements OnInit {
  cart: Cart = { items: [], shop_id: null, shop_name: null };
  itemNotes: { [key: string]: string } = {};

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
      // Initialize notes from cart items
      cart.items.forEach(item => {
        if (item.notes) {
          this.itemNotes[item.product_id] = item.notes;
        }
      });
    });
  }

  get estimatedTotal(): number {
    return this.cart.items.reduce((sum, item) => 
      sum + (item.unit_price * item.quantity), 0
    );
  }

  updateQuantity(productId: string, quantity: number): void {
    this.cartService.updateQuantity(productId, quantity);
  }

  removeItem(productId: string): void {
    this.cartService.removeFromCart(productId);
  }

  saveNotes(productId: string): void {
    const notes = this.itemNotes[productId];
    if (notes !== undefined) {
      this.cartService.updateNotes(productId, notes);
    }
  }

  clearCart(): void {
    if (confirm('Vider tout le panier ?')) {
      this.cartService.clearCart();
    }
  }

  proceedToQuote(): void {
    if (this.cart.items.length === 0) return;
    
    // Navigate to quote request form with shop_id
    this.router.navigate(['/client/quote-requests/new'], {
      queryParams: {
        shop_id: this.cart.shop_id,
        from_cart: 'true'
      }
    });
  }
}
