import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { QuoteRequestService, QuoteRequestItem } from '../../services/quote-request.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CartService, Cart } from '../../services/cart.service';
import { environment } from '../../../../../environments/environment';

interface ShopPublic {
  _id: string;
  shop_name: string;
  logo?: string;
  mall_location?: string;
}

interface ShopProduct {
  _id: string;
  name: string;
  unit_price: number;
}

interface DeliveryZone {
  _id: string;
  name: string;
  base_fee: number;
  free_delivery_threshold?: number;
  estimated_days?: number;
  estimated_hours?: number;
}

interface ProductsResponse {
  success: boolean;
  data: {
    products: ShopProduct[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

@Component({
  selector: 'app-create-quote-request',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page">
      <div class="header">
        <h2>📝 Nouvelle demande de devis</h2>
        <p class="subtitle">Décrivez vos besoins et envoyez la demande à une boutique.</p>
      </div>

      <div *ngIf="error" class="error">{{ error }}</div>

      <div class="card">
        <h3>🏪 Boutique</h3>

        <div class="form-row">
          <label>Boutique</label>
          <select [(ngModel)]="shopId" (change)="onShopChange()">
            <option value="">-- Choisir une boutique --</option>
            <option *ngFor="let s of shops" [value]="s._id">{{ s.shop_name }}</option>
          </select>
        </div>

        <div *ngIf="selectedShop" class="shop-preview">
          <div class="shop-name">{{ selectedShop.shop_name }}</div>
          <div class="shop-meta" *ngIf="selectedShop.mall_location">📍 {{ selectedShop.mall_location }}</div>
        </div>
      </div>

      <div class="card">
        <h3>👤 Vos informations</h3>

        <div class="grid">
          <div class="form-row">
            <label>Nom</label>
            <input [(ngModel)]="client_name" placeholder="Votre nom" />
          </div>

          <div class="form-row">
            <label>Téléphone</label>
            <input [(ngModel)]="client_phone" placeholder="0341234567" />
          </div>

          <div class="form-row">
            <label>Email (optionnel)</label>
            <input [(ngModel)]="client_email" placeholder="exemple@mail.com" />
          </div>

          <!-- <div class="form-row">
            <label>Ville (optionnel)</label>
            <input [(ngModel)]="client_city" placeholder="Ville" />
          </div> -->

          <div class="form-row" style="grid-column: 1 / -1;">
            <label>Zone de livraison</label>
            <select [(ngModel)]="selectedZoneId" [disabled]="deliveryZones.length === 0">
              <option value="">-- Choisir une zone de livraison --</option>
              <option *ngFor="let zone of deliveryZones" [value]="zone._id">
                {{ zone.name }} 
                <ng-container *ngIf="zone.base_fee > 0">(+ {{ zone.base_fee | number }} Ar)</ng-container>
                <ng-container *ngIf="zone.base_fee === 0">(Livraison gratuite)</ng-container>
              </option>
            </select>
            <small *ngIf="deliveryZones.length === 0" class="hint">Aucune zone de livraison disponible pour cette boutique</small>
          </div>

          <div class="form-row" style="grid-column: 1 / -1;">
            <label>Adresse (optionnel)</label>
            <input [(ngModel)]="client_street" placeholder="Adresse" />
          </div>
        </div>
      </div>

      <div class="card">
        <div class="items-header">
          <h3>📦 Produits du panier</h3>
          <a routerLink="/client/cart" class="btn-link">Modifier le panier →</a>
        </div>

        <div class="cart-items-list" *ngIf="fromCart">
          <div class="cart-item-row" *ngFor="let item of requested_items; let i = index">
            <div class="item-info">
              <span class="item-name">{{ item.product_name }}</span>
              <span class="item-qty">× {{ item.quantity }}</span>
            </div>
            <input 
              type="text" 
              [(ngModel)]="item.notes" 
              placeholder="Notes (optionnel): taille, couleur..."
              class="notes-input">
          </div>
        </div>

        <div *ngIf="!fromCart" class="hint">
          <p>Sélectionnez une boutique pour voir les produits disponibles, ou remplissez manuellement ci-dessous.</p>
        </div>

        <div class="items-list" *ngIf="!fromCart">
          <div class="item" *ngFor="let item of requested_items; let i = index">
            <div class="item-grid">
              <div class="form-row">
                <label>Produit</label>
                <select *ngIf="shopProducts.length > 0" [(ngModel)]="selectedProductIds[i]" (change)="applySelectedProduct(i)">
                  <option value="">-- Saisie manuelle --</option>
                  <option *ngFor="let p of shopProducts" [value]="p._id">{{ p.name }}</option>
                </select>
                <input *ngIf="shopProducts.length === 0" [(ngModel)]="item.product_name" placeholder="Nom du produit" />
                <input *ngIf="shopProducts.length > 0" [(ngModel)]="item.product_name" placeholder="Nom du produit" />
              </div>

              <div class="form-row">
                <label>Quantité</label>
                <input type="number" min="1" [(ngModel)]="item.quantity" />
              </div>

              <div class="form-row" style="grid-column: 1 / -1;">
                <label>Notes (optionnel)</label>
                <input [(ngModel)]="item.notes" placeholder="Taille, couleur, précision..." />
              </div>
            </div>

            <button class="btn-danger" type="button" (click)="removeItem(i)" [disabled]="requested_items.length === 1">Supprimer</button>
          </div>
          <button class="btn" type="button" (click)="addItem()" *ngIf="!fromCart">+ Ajouter un produit</button>
        </div>
      </div>

      <div class="actions">
        <button class="btn-secondary" type="button" (click)="cancel()">Annuler</button>
        <button class="btn-primary" type="button" (click)="submit()" [disabled]="submitting">
          {{ submitting ? 'Envoi...' : 'Envoyer la demande' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .page{max-width:900px;margin:0 auto;padding:2rem 1rem;}
    .header{text-align:center;margin-bottom:1.5rem;}
    .subtitle{margin:0;color:#64748b;}
    .card{background:white;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.1);padding:1.25rem;margin-bottom:1rem;}
    .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;}
    .form-row{display:flex;flex-direction:column;gap:.5rem;}
    label{font-size:.85rem;color:#64748b;font-weight:600;}
    input,select{padding:.75rem;border:1px solid #e2e8f0;border-radius:8px;font-size:.95rem;}
    .items-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem;}
    .item{border:1px solid #f1f5f9;border-radius:12px;padding:1rem;margin-bottom:.75rem;}
    .item-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;}
    .actions{display:flex;gap:.75rem;justify-content:flex-end;}
    .btn,.btn-primary,.btn-secondary,.btn-danger{border:none;border-radius:8px;padding:.75rem 1rem;cursor:pointer;font-weight:600;}
    .btn{background:#f1f5f9;color:#334155;}
    .btn-primary{background:#8b5cf6;color:white;}
    .btn-secondary{background:#e2e8f0;color:#334155;}
    .btn-danger{background:#fee2e2;color:#b91c1c;margin-top:.75rem;}
    .error{background:#fee2e2;color:#b91c1c;padding:1rem;border-radius:10px;margin-bottom:1rem;}
    .shop-preview{margin-top:.75rem;padding:.75rem;border-radius:10px;background:#f8fafc;}
    .shop-name{font-weight:700;color:#0f172a;}
    .shop-meta{color:#64748b;font-size:.9rem;margin-top:.25rem;}
    .hint{color:#64748b;font-size:.9rem;margin-bottom:.75rem;}
    
    /* Cart items in form */
    .cart-items-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .cart-item-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem;
      background: #f8fafc;
      border-radius: 8px;
      gap: 1rem;
    }
    .item-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
    }
    .item-name {
      font-weight: 500;
      color: #1e293b;
    }
    .item-qty {
      color: #8b5cf6;
      font-weight: 600;
    }
    .notes-input {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.875rem;
      min-width: 150px;
    }
    .notes-input:focus {
      outline: none;
      border-color: #8b5cf6;
    }
    .btn-link {
      color: #8b5cf6;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.875rem;
    }
    .btn-link:hover {
      text-decoration: underline;
    }
    
    @media (max-width: 768px){.grid,.item-grid{grid-template-columns:1fr;}}
    @media (max-width: 768px) {
      .cart-item-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
      .notes-input {
        width: 100%;
      }
    }
  `]
})
export class CreateQuoteRequestComponent implements OnInit {
  shops: ShopPublic[] = [];
  selectedShop: ShopPublic | null = null;
  shopProducts: ShopProduct[] = [];
  deliveryZones: DeliveryZone[] = [];
  selectedZoneId = '';
  cart: Cart = { items: [], shop_id: null, shop_name: null };
  fromCart = false;

  shopId = '';

  client_name = '';
  client_phone = '';
  client_email = '';
  client_city = '';
  client_street = '';

  requested_items: QuoteRequestItem[] = [{ product_name: '', quantity: 1, notes: '', product_id: null }];
  selectedProductIds: string[] = [''];

  submitting = false;
  error: string | null = null;

  constructor(
    private http: HttpClient,
    private quoteService: QuoteRequestService,
    private authService: AuthService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user?.user_type === 'buyer') {
      this.client_name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || this.client_name;
      this.client_phone = user.phone || this.client_phone;
      this.client_email = user.email || this.client_email;
    }

    this.route.queryParamMap.subscribe(params => {
      const qShopId = params.get('shopId');
      const fromCart = params.get('from_cart') === 'true';
      
      if (fromCart) {
        this.fromCart = true;
        this.cart = this.cartService.getCart();
        
        // If cart is empty, redirect to cart page
        if (this.cart.items.length === 0) {
          this.router.navigate(['/client/cart']);
          return;
        }
        
        // Set shop info from cart
        this.shopId = this.cart.shop_id || '';
        this.requested_items = this.cart.items.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          notes: item.notes || ''
        }));
        
        // Load shop name AND delivery zones
        if (this.shopId) {
          this.loadShopName();
          this.loadDeliveryZones();
        }
      } else {
        this.loadShops();
        if (qShopId) {
          this.shopId = qShopId;
          this.onShopChange();
        }
      }
    });
  }

  loadShopName(): void {
    this.http.get<{ success: boolean; data: ShopPublic }>(
      `${environment.apiUrl}/shops/${this.shopId}/public`
    ).subscribe({
      next: (res) => {
        this.selectedShop = res.data;
      },
      error: () => {
        this.selectedShop = null;
      }
    });
  }

  loadDeliveryZones(): void {
    if (!this.shopId) return;
    
    this.http.get<{ success: boolean; data: DeliveryZone[] }>(
      `${environment.apiUrl}/shops/${this.shopId}/delivery-zones`
    ).subscribe({
      next: (res) => {
        this.deliveryZones = res?.data || [];
      },
      error: () => {
        this.deliveryZones = [];
      }
    });
  }

  loadShops(): void {
    this.http.get<{ success: boolean; data: ShopPublic[] }>(`${environment.apiUrl}/shops/public`).subscribe({
      next: (res) => {
        this.shops = res.data || [];
        if (this.shopId) {
          this.selectedShop = this.shops.find(s => s._id === this.shopId) || this.selectedShop;
        }
      },
      error: () => {
        this.error = 'Erreur lors du chargement des boutiques';
      }
    });
  }

  onShopChange(): void {
    this.selectedShop = this.shops.find(s => s._id === this.shopId) || null;
    this.shopProducts = [];

    if (!this.shopId) return;

    this.http.get<ProductsResponse>(`${environment.apiUrl}/shops/${this.shopId}/products?limit=100`).subscribe({
      next: (res) => {
        this.shopProducts = res?.data?.products || [];
      },
      error: () => {
        this.shopProducts = [];
      }
    });

    // Load delivery zones
    this.http.get<{ success: boolean; data: DeliveryZone[] }>(`${environment.apiUrl}/shops/${this.shopId}/delivery-zones`).subscribe({
      next: (res) => {
        this.deliveryZones = res?.data || [];
      },
      error: () => {
        this.deliveryZones = [];
      }
    });

    if (!this.selectedShop) {
      this.http.get<{ success: boolean; data: ShopPublic }>(`${environment.apiUrl}/shops/${this.shopId}/public`).subscribe({
        next: (res) => {
          this.selectedShop = res.data;
        },
        error: () => {
          this.selectedShop = null;
        }
      });
    }
  }

  addItem(): void {
    this.requested_items.push({ product_name: '', quantity: 1, notes: '', product_id: null });
    this.selectedProductIds.push('');
  }

  removeItem(index: number): void {
    if (this.requested_items.length === 1) return;
    this.requested_items.splice(index, 1);
    this.selectedProductIds.splice(index, 1);
  }

  applySelectedProduct(index: number): void {
    const productId = this.selectedProductIds[index];
    if (!productId) {
      this.requested_items[index].product_id = null;
      return;
    }
    const p = this.shopProducts.find(x => x._id === productId);
    if (!p) return;
    this.requested_items[index].product_id = p._id;
    this.requested_items[index].product_name = p.name;
  }

  private validate(): boolean {
    if (!this.shopId) {
      this.error = 'Veuillez choisir une boutique';
      return false;
    }
    if (!this.client_name.trim()) {
      this.error = 'Veuillez entrer votre nom';
      return false;
    }
    if (!this.client_phone.trim()) {
      this.error = 'Veuillez entrer votre téléphone';
      return false;
    }
    const validItems = this.requested_items.filter(i => (i.product_name || '').trim() && (i.quantity || 0) > 0);
    if (validItems.length === 0) {
      this.error = 'Ajoutez au moins un produit';
      return false;
    }
    this.requested_items = validItems;
    this.error = null;
    return true;
  }

  submit(): void {
    if (!this.validate()) return;

    this.submitting = true;

    const shopName = this.selectedShop?.shop_name || this.shops.find(s => s._id === this.shopId)?.shop_name || '';

    this.quoteService.createQuote({
      client_name: this.client_name,
      client_phone: this.client_phone,
      client_email: this.client_email || undefined,
      client_address: {
        city: this.client_city || undefined,
        street: this.client_street || undefined
      },
      shop_id: this.shopId,
      shop_name: shopName,
      delivery_zone_id: this.selectedZoneId || undefined,
      requested_items: this.requested_items
    }).subscribe({
      next: () => {
        this.submitting = false;
        // Clear cart if coming from cart
        if (this.fromCart) {
          this.cartService.clearCart();
        }
        this.router.navigate(['/client/quote-requests']);
      },
      error: (err) => {
        console.error('Error creating quote request:', err);
        this.submitting = false;
        this.error = 'Erreur lors de l\'envoi de la demande';
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/client/quote-requests']);
  }
}
