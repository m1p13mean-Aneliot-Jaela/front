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
        <h2>🛒 Mon Panier</h2>
        <p class="subtitle">Préparez votre demande de devis</p>
      </div>

      <!-- Empty Cart -->
      <div class="empty-cart" *ngIf="!cart.items.length">
        <div class="empty-icon">🛒</div>
        <h3>Votre panier est vide</h3>
        <p>Parcourez les boutiques pour ajouter des produits</p>
        <button class="btn-primary" routerLink="/client/shops">
          🏪 Voir les boutiques
        </button>
      </div>

      <!-- Cart Content -->
      <div class="cart-content" *ngIf="cart.items.length">
        <div class="shop-info">
          <span class="shop-badge">🏪 {{ cart.shop_name }}</span>
          <span class="item-count">{{ cart.items.length }} produit(s)</span>
        </div>

        <div class="cart-items">
          <div class="cart-item" *ngFor="let item of cart.items; let i = index">
            <div class="item-details">
              <h4>{{ item.product_name }}</h4>
              <span class="item-price">{{ item.unit_price | number:'1.0-0' }} FCFA</span>
            </div>
            
            <div class="item-actions">
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
              
              <button 
                class="btn-remove" 
                (click)="removeItem(item.product_id)"
                title="Retirer">
                🗑️
              </button>
            </div>

            <div class="item-notes">
              <input 
                type="text" 
                [(ngModel)]="itemNotes[item.product_id]"
                (blur)="saveNotes(item.product_id)"
                placeholder="Notes (optionnel): taille, couleur..."
                class="notes-input">
            </div>
          </div>
        </div>

        <div class="cart-summary">
          <div class="summary-row">
            <span>Total estimé:</span>
            <span class="total-value">{{ estimatedTotal | number:'1.0-0' }} FCFA</span>
          </div>
          <p class="disclaimer">
            * Ce montant est indicatif. Le manager vous enverra un devis précis.
          </p>
        </div>

        <div class="cart-actions">
          <button class="btn-secondary" (click)="clearCart()">
            🗑️ Vider le panier
          </button>
          <button 
            class="btn-primary" 
            (click)="proceedToQuote()"
            [disabled]="cart.items.length === 0">
            📋 Demander un devis
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cart-page {
      padding: 1.5rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 1.5rem;
    }

    .page-header h2 {
      margin: 0 0 0.5rem 0;
      color: #1e293b;
    }

    .subtitle {
      color: #64748b;
      margin: 0;
    }

    /* Empty Cart */
    .empty-cart {
      text-align: center;
      padding: 3rem;
      background: #f8fafc;
      border-radius: 16px;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .empty-cart h3 {
      color: #1e293b;
      margin: 0 0 0.5rem 0;
    }

    .empty-cart p {
      color: #64748b;
      margin: 0 0 1.5rem 0;
    }

    /* Cart Content */
    .shop-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding: 0.75rem 1rem;
      background: #e0e7ff;
      border-radius: 8px;
    }

    .shop-badge {
      font-weight: 600;
      color: #4338ca;
    }

    .item-count {
      font-size: 0.875rem;
      color: #64748b;
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .cart-item {
      background: white;
      padding: 1rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .item-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .item-details h4 {
      margin: 0;
      color: #1e293b;
    }

    .item-price {
      color: #8b5cf6;
      font-weight: 600;
    }

    .item-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .quantity-control {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-qty {
      width: 32px;
      height: 32px;
      border: 1px solid #e2e8f0;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-qty:hover:not(:disabled) {
      background: #f1f5f9;
    }

    .btn-qty:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .qty-value {
      min-width: 40px;
      text-align: center;
      font-weight: 600;
      color: #1e293b;
    }

    .btn-remove {
      background: #fee2e2;
      border: none;
      padding: 0.5rem;
      border-radius: 6px;
      cursor: pointer;
    }

    .item-notes {
      margin-top: 0.5rem;
    }

    .notes-input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.875rem;
    }

    .notes-input:focus {
      outline: none;
      border-color: #8b5cf6;
    }

    /* Summary */
    .cart-summary {
      background: #f0fdf4;
      padding: 1rem;
      border-radius: 12px;
      margin-bottom: 1.5rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 1.125rem;
    }

    .total-value {
      font-weight: 700;
      color: #059669;
    }

    .disclaimer {
      font-size: 0.75rem;
      color: #64748b;
      margin: 0.5rem 0 0 0;
    }

    /* Actions */
    .cart-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .btn-primary {
      padding: 0.875rem 1.5rem;
      background: #8b5cf6;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-primary:hover:not(:disabled) {
      background: #7c3aed;
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      padding: 0.875rem 1.5rem;
      background: #f1f5f9;
      color: #64748b;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
    }

    .btn-secondary:hover {
      background: #e2e8f0;
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
