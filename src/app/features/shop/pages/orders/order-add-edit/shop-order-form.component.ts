import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../services/order.service';
import { ProductService, Product } from '../../../services/product.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { DeliveryService, DeliveryZone } from '../../../services/delivery.service';

interface FormOrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface FormOrder {
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: {
      street?: string;
      city: string;
      postal_code?: string;
    };
  };
  items: FormOrderItem[];
  shipping_fee: number;
  discount: number;
  subtotal: number;
  total_amount: number;
  customer_note?: string;
  payment_method: 'CASH' | 'CARD' | 'MOBILE_MONEY' | 'BANK_TRANSFER';
}

@Component({
  selector: 'app-shop-order-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="header">
        <button class="btn-back" (click)="goBack()">← Retour</button>
        <h2>{{ isEdit ? 'Modifier Commande' : 'Nouvelle Commande' }}</h2>
      </div>

      <form (ngSubmit)="onSubmit()" class="order-form">
        <!-- Client Section -->
        <div class="form-section">
          <h3>👤 Client</h3>
          <div class="form-row two-col">
            <div class="form-group">
              <label>Nom *</label>
              <input type="text" [(ngModel)]="order.customer.name" name="customerName" required class="form-control" placeholder="Nom du client">
            </div>
            <div class="form-group">
              <label>Téléphone *</label>
              <input type="tel" [(ngModel)]="order.customer.phone" name="customerPhone" required class="form-control" placeholder="034 XX XXX XX">
            </div>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="order.customer.email" name="customerEmail" class="form-control" placeholder="client@email.com">
          </div>
          <div class="form-group">
            <label>Ville * (pour calculer les frais de livraison)</label>
            <input type="text" [(ngModel)]="order.customer.address.city" name="customerCity" required class="form-control" placeholder="Antananarivo" (change)="calculateShippingFee()">
            <small *ngIf="calculatedShippingFee > 0" class="shipping-info">
              Frais estimés: {{ calculatedShippingFee | number }} Ar 
              <button type="button" class="btn-link" (click)="applyShippingFee()">Appliquer</button>
            </small>
          </div>
        </div>

        <!-- Products Section -->
        <div class="form-section">
          <h3>🛍️ Articles</h3>
          
          <!-- Product Search -->
          <div class="product-search">
            <input 
              type="text" 
              [(ngModel)]="productSearchQuery"
              name="productSearch"
              class="form-control"
              placeholder="🔍 Rechercher un produit..."
              (input)="searchProducts()"
              (focus)="showProductDropdown = true"
            >
            <div class="product-dropdown" *ngIf="showProductDropdown && filteredProducts.length">
              <div 
                *ngFor="let product of filteredProducts" 
                class="product-option"
                (click)="addProductToOrder(product)"
              >
                <span class="product-name">{{ product.name }}</span>
                <span class="product-price">{{ product.unit_price | number }} Ar</span>
              </div>
            </div>
          </div>

          <!-- Items List -->
          <div class="items-list" *ngIf="order.items.length">
            <div *ngFor="let item of order.items; let i = index" class="item-row">
              <div class="item-info">
                <span class="item-name">{{ item.product_name }}</span>
              </div>
              <div class="item-price">{{ item.unit_price | number }} Ar</div>
              <input 
                type="number" 
                [(ngModel)]="item.quantity" 
                name="quantity{{i}}" 
                min="1"
                class="form-control quantity"
                (change)="updateItemTotal(item)"
              >
              <div class="item-total">{{ item.total_price | number }} Ar</div>
              <button type="button" class="btn-remove" (click)="removeItem(i)">×</button>
            </div>
          </div>
          
          <div class="empty-items" *ngIf="!order.items.length">
            <p>Aucun article. Utilisez la recherche ci-dessus pour ajouter des produits.</p>
          </div>
        </div>

        <!-- Order Info -->
        <div class="form-section">
          <h3>📋 Informations</h3>
          <div class="form-row two-col">
            <div class="form-group">
              <label>Frais de livraison</label>
              <input type="number" [(ngModel)]="order.shipping_fee" name="shippingFee" min="0" class="form-control" (change)="calculateTotals()">
            </div>
            <div class="form-group">
              <label>Remise</label>
              <input type="number" [(ngModel)]="order.discount" name="discount" min="0" class="form-control" (change)="calculateTotals()">
            </div>
          </div>
          <div class="form-group">
            <label>Méthode de paiement</label>
            <select [(ngModel)]="order.payment_method" name="paymentMethod" class="form-control">
              <option value="CASH">Espèces</option>
              <option value="CARD">Carte bancaire</option>
              <option value="MOBILE_MONEY">Mobile Money</option>
              <option value="BANK_TRANSFER">Virement bancaire</option>
            </select>
          </div>
          <div class="form-group">
            <label>Note client</label>
            <textarea [(ngModel)]="order.customer_note" name="customerNote" rows="2" class="form-control" placeholder="Instructions spéciales..."></textarea>
          </div>
        </div>

        <!-- Totals -->
        <div class="form-section totals-section">
          <div class="totals-grid">
            <div class="total-row">
              <span>Sous-total:</span>
              <span>{{ order.subtotal | number }} Ar</span>
            </div>
            <div class="total-row" *ngIf="order.shipping_fee">
              <span>Frais de livraison:</span>
              <span>+{{ order.shipping_fee | number }} Ar</span>
            </div>
            <div class="total-row" *ngIf="order.discount">
              <span>Remise:</span>
              <span>-{{ order.discount | number }} Ar</span>
            </div>
            <div class="total-row grand-total">
              <span>Total:</span>
              <span class="total-amount">{{ order.total_amount | number }} Ar</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="goBack()">Annuler</button>
          <button type="submit" class="btn-primary" [disabled]="!order.items.length || saving">
            {{ saving ? 'Création...' : 'Créer la commande' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .page-container { padding: 1.5rem; max-width: 900px; }
    .header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
    .btn-back { padding: 0.5rem 1rem; background: #f1f5f9; border: none; border-radius: 6px; cursor: pointer; }
    h2 { color: #1e293b; margin: 0; }
    .order-form { display: flex; flex-direction: column; gap: 1.5rem; }
    .form-section { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .form-section h3 { margin: 0 0 1rem 0; color: #1e293b; font-size: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    label { font-size: 0.875rem; font-weight: 500; color: #64748b; }
    .form-control { padding: 0.625rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.875rem; }

    .product-search { position: relative; margin-bottom: 1rem; }
    .product-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-height: 300px; overflow-y: auto; z-index: 100; }
    .product-option { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; cursor: pointer; border-bottom: 1px solid #f1f5f9; }
    .product-option:hover { background: #f8fafc; }
    .product-name { flex: 1; font-weight: 500; }
    .product-price { color: #8b5cf6; font-weight: 600; }
    .product-stock { font-size: 0.75rem; color: #64748b; background: #f1f5f9; padding: 0.25rem 0.5rem; border-radius: 4px; }
    .product-stock.low { background: #fee2e2; color: #dc2626; }

    .items-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .item-row { display: grid; grid-template-columns: 2fr 1fr 80px 1fr auto; gap: 0.75rem; align-items: center; padding: 0.75rem; background: #f8fafc; border-radius: 8px; }
    .item-name { font-weight: 500; color: #1e293b; }
    .item-price { color: #64748b; font-size: 0.875rem; }
    .quantity { text-align: center; width: 80px; }
    .item-total { font-weight: 600; color: #8b5cf6; text-align: right; }
    .btn-remove { width: 32px; height: 32px; border: none; background: #fee2e2; color: #dc2626; border-radius: 6px; cursor: pointer; font-size: 1.25rem; }
    .empty-items { text-align: center; padding: 2rem; color: #94a3b8; background: #f8fafc; border-radius: 8px; border: 2px dashed #e2e8f0; }

    .totals-section { background: #f8fafc; }
    .total-row { display: flex; justify-content: space-between; padding: 0.5rem 0; color: #64748b; }
    .grand-total { border-top: 2px solid #e2e8f0; padding-top: 1rem; font-size: 1.25rem; font-weight: 700; color: #1e293b; }
    .total-amount { color: #8b5cf6; }

    .form-actions { display: flex; justify-content: flex-end; gap: 1rem; }
    .btn-secondary { padding: 0.75rem 1.5rem; background: #f1f5f9; border: none; border-radius: 8px; color: #64748b; cursor: pointer; }
    .btn-primary { padding: 0.75rem 1.5rem; background: #8b5cf6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    
    .shipping-info { display: flex; align-items: center; gap: 0.5rem; color: #64748b; font-size: 0.875rem; margin-top: 0.5rem; }
    .btn-link { background: none; border: none; color: #8b5cf6; cursor: pointer; text-decoration: underline; padding: 0; font-size: 0.875rem; }
    .btn-link:hover { color: #7c3aed; }
  `]
})
export class ShopOrderFormComponent implements OnInit {
  isEdit = false;
  saving = false;
  products: Product[] = [];
  filteredProducts: Product[] = [];
  productSearchQuery = '';
  showProductDropdown = false;
  calculatedShippingFee = 0;
  deliveryZones: DeliveryZone[] = [];

  order: FormOrder = {
    customer: { name: '', phone: '', email: '', address: { street: '', city: '', postal_code: '' } },
    items: [],
    shipping_fee: 0,
    discount: 0,
    subtotal: 0,
    total_amount: 0,
    payment_method: 'CASH'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private productService: ProductService,
    private authService: AuthService,
    private deliveryService: DeliveryService
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!orderId && orderId !== 'new';
    this.loadProducts();
    this.loadDeliveryZones();
  }

  loadDeliveryZones(): void {
    const user = this.authService.currentUserValue;
    if (!user?.shop_id) return;
    
    this.deliveryService.getZones(user.shop_id).subscribe({
      next: (response: { success: boolean; data: DeliveryZone[] }) => {
        this.deliveryZones = response.data || [];
      },
      error: (err: any) => { console.error('Error loading zones:', err); }
    });
  }

  calculateShippingFee(): void {
    const city = this.order.customer.address?.city?.toLowerCase().trim();
    if (!city || !this.deliveryZones.length) {
      this.calculatedShippingFee = 3000; // Default
      return;
    }
    
    // Find matching zone
    const matchingZone = this.deliveryZones.find(zone => {
      const zoneCities = zone.cities?.map((c: string) => c.toLowerCase().trim()) || [];
      const zoneName = zone.name?.toLowerCase().trim() || '';
      return zoneCities.includes(city) || city.includes(zoneName);
    });
    
    this.calculatedShippingFee = matchingZone?.base_fee || 3000;
  }

  applyShippingFee(): void {
    this.order.shipping_fee = this.calculatedShippingFee;
    this.calculateTotals();
  }

  loadProducts(): void {
    const user = this.authService.currentUserValue;
    if (!user?.shop_id) return;
    
    this.productService.getProductsByShop(user.shop_id, { limit: 100 }).subscribe({
      next: (response: { success: boolean; data: { products: Product[] } }) => {
        this.products = response.data.products || [];
      },
      error: (err: any) => { console.error('Error loading products:', err); }
    });
  }

  searchProducts(): void {
    const query = this.productSearchQuery.toLowerCase().trim();
    this.filteredProducts = query
      ? this.products.filter(p => p.name.toLowerCase().includes(query)).slice(0, 10)
      : this.products.slice(0, 10);
    this.showProductDropdown = this.filteredProducts.length > 0;
  }

  addProductToOrder(product: Product): void {
    if (!product._id) return; // Skip if no product ID
    
    const existing = this.order.items.find(item => item.product_id === product._id);
    if (existing) {
      existing.quantity++;
      existing.total_price = existing.quantity * existing.unit_price;
    } else {
      this.order.items.push({
        product_id: product._id,
        product_name: product.name,
        quantity: 1,
        unit_price: product.unit_price || 0,
        total_price: product.unit_price || 0
      });
    }
    this.calculateTotals();
    this.productSearchQuery = '';
    this.showProductDropdown = false;
  }

  removeItem(index: number): void {
    this.order.items.splice(index, 1);
    this.calculateTotals();
  }

  updateItemTotal(item: FormOrderItem): void {
    if (item.quantity < 1) item.quantity = 1;
    item.total_price = item.quantity * item.unit_price;
    this.calculateTotals();
  }

  calculateTotals(): void {
    this.order.subtotal = this.order.items.reduce((sum, item) => sum + item.total_price, 0);
    this.order.total_amount = this.order.subtotal + (this.order.shipping_fee || 0) - (this.order.discount || 0);
    if (this.order.total_amount < 0) this.order.total_amount = 0;
  }

  onSubmit(): void {
    if (!this.order.customer.name || !this.order.customer.phone) {
      alert('Veuillez remplir le nom et téléphone du client');
      return;
    }
    if (!this.order.items.length) {
      alert('Veuillez ajouter au moins un article');
      return;
    }

    this.saving = true;
    const orderData = {
      customer: this.order.customer,
      items: this.order.items,
      shipping_fee: this.order.shipping_fee || 0,
      discount: this.order.discount || 0,
      subtotal: this.order.subtotal,
      total_amount: this.order.total_amount,
      customer_note: this.order.customer_note,
      payment: { method: this.order.payment_method, status: 'PENDING' as const }
    };

    this.orderService.createOrder(orderData).subscribe({
      next: () => { this.saving = false; this.goBack(); },
      error: (err) => {
        this.saving = false;
        alert('Erreur: ' + (err?.error?.message || 'Erreur inconnue'));
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/shop/orders']);
  }
}
