import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface Product {
  _id: string;
  name: string;
  description?: string;
  unit_price: number;
  image_url?: string;
  images?: string[];
  current_quantity?: number;
  stock_quantity?: number;
  sku?: string;
  shop_id: string;
  shop_name?: string;
  categories?: { name: string }[];
  category_id?: { name: string };
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="product-detail-page" *ngIf="product">
      <div class="container">
        <!-- Breadcrumb -->
        <nav class="breadcrumb">
          <a [routerLink]="['/client/shops', product.shop_id]">← Retour à la boutique</a>
        </nav>

        <div class="product-layout">
          <!-- Image Section -->
          <div class="image-section">
            <img 
              [src]="product.images?.[0] || product.image_url || '/assets/images/default-product.png'" 
              [alt]="product.name"
              class="product-image"
            >
          </div>

          <!-- Info Section -->
          <div class="info-section">
            <h1 class="product-name">{{ product.name }}</h1>
            
            <div class="shop-name" *ngIf="product.shop_name">
              <span>Vendu par: {{ product.shop_name }}</span>
            </div>

            <div class="price-section">
              <span class="price">{{ product.unit_price | currency:'Ar ':'symbol':'1.0-0' }}</span>
            </div>

            <div class="stock-status">
              <span class="badge" [class.in-stock]="getStockQuantity() > 0" [class.out-of-stock]="getStockQuantity() === 0">
                {{ getStockQuantity() > 0 ? 'En stock (' + getStockQuantity() + ')' : 'Rupture de stock' }}
              </span>
            </div>

            <div class="description" *ngIf="product.description">
              <h3>Description</h3>
              <p>{{ product.description }}</p>
            </div>

            <div class="sku" *ngIf="product.sku">
              <span>Référence: {{ product.sku }}</span>
            </div>

            <!-- Quantity Selector -->
            <div class="quantity-section" *ngIf="getStockQuantity() > 0">
              <label>Quantité:</label>
              <div class="quantity-selector">
                <button (click)="decreaseQuantity()" [disabled]="quantity <= 1">-</button>
                <input type="number" [(ngModel)]="quantity" min="1" [max]="getStockQuantity()" readonly>
                <button (click)="increaseQuantity()" [disabled]="quantity >= getStockQuantity()">+</button>
              </div>
            </div>

            <!-- Order Button -->
            <div class="actions">
              <button 
                class="btn-order" 
                (click)="goToCheckout()"
                [disabled]="getStockQuantity() === 0"
              >
                🛒 Commander maintenant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="loading" *ngIf="!product && !error">Chargement...</div>
    <div class="error" *ngIf="error">{{ error }}</div>
  `,
  styles: [`
    .product-detail-page { padding: 2rem 0; background: #f8fafc; min-height: 100vh; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
    
    .breadcrumb { margin-bottom: 1.5rem; }
    .breadcrumb a { color: #8b5cf6; text-decoration: none; font-size: 0.875rem; }
    .breadcrumb a:hover { text-decoration: underline; }
    
    .product-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; background: white; border-radius: 16px; padding: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    
    @media (max-width: 768px) {
      .product-layout { grid-template-columns: 1fr; gap: 2rem; }
    }
    
    .image-section { display: flex; align-items: center; justify-content: center; }
    .product-image { width: 100%; max-width: 500px; height: 400px; object-fit: cover; border-radius: 12px; }
    
    .info-section { display: flex; flex-direction: column; gap: 1.5rem; }
    .product-name { font-size: 2rem; font-weight: 700; color: #1e293b; margin: 0; }
    .shop-name { color: #64748b; font-size: 0.875rem; }
    
    .price-section .price { font-size: 2rem; font-weight: 700; color: #8b5cf6; }
    
    .stock-status .badge { 
      display: inline-block; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.875rem; font-weight: 500;
    }
    .stock-status .badge.in-stock { background: #dcfce7; color: #16a34a; }
    .stock-status .badge.out-of-stock { background: #fee2e2; color: #dc2626; }
    
    .description h3 { font-size: 1.125rem; color: #1e293b; margin-bottom: 0.5rem; }
    .description p { color: #64748b; line-height: 1.6; }
    
    .sku { color: #94a3b8; font-size: 0.875rem; }
    
    .quantity-section { display: flex; align-items: center; gap: 1rem; }
    .quantity-section label { font-weight: 500; color: #1e293b; }
    .quantity-selector { display: flex; align-items: center; gap: 0.5rem; }
    .quantity-selector button { 
      width: 40px; height: 40px; border: 1px solid #e2e8f0; background: white; 
      border-radius: 8px; cursor: pointer; font-size: 1.25rem; color: #1e293b;
    }
    .quantity-selector button:hover:not(:disabled) { background: #f1f5f9; }
    .quantity-selector button:disabled { opacity: 0.5; cursor: not-allowed; }
    .quantity-selector input { 
      width: 60px; height: 40px; text-align: center; border: 1px solid #e2e8f0; 
      border-radius: 8px; font-size: 1rem; font-weight: 600;
    }
    
    .actions { margin-top: 1rem; }
    .btn-order { 
      width: 100%; padding: 1rem; background: #8b5cf6; color: white; 
      border: none; border-radius: 12px; font-size: 1.125rem; font-weight: 600;
      cursor: pointer; transition: background 0.2s;
    }
    .btn-order:hover:not(:disabled) { background: #7c3aed; }
    .btn-order:disabled { background: #e2e8f0; color: #94a3b8; cursor: not-allowed; }
    
    .loading, .error { text-align: center; padding: 3rem; }
    .error { color: #dc2626; }
  `]
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  quantity: number = 1;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(productId);
    } else {
      this.error = 'ID de produit manquant';
    }
  }

  loadProduct(id: string): void {
    this.http.get<{ success: boolean; data: Product }>(
      `${environment.apiUrl}/products/${id}`
    ).subscribe({
      next: (response) => {
        this.product = response.data;
        this.quantity = 1;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du produit';
        console.error('Error loading product:', err);
      }
    });
  }

  getStockQuantity(): number {
    return this.product?.stock_quantity ?? this.product?.current_quantity ?? 0;
  }

  increaseQuantity(): void {
    const stock = this.getStockQuantity();
    if (this.quantity < stock) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  goToCheckout(): void {
    console.log('goToCheckout called');
    console.log('product:', this.product);
    console.log('stock:', this.getStockQuantity());
    
    if (!this.product) {
      console.error('No product');
      return;
    }
    if (this.getStockQuantity() === 0) {
      console.error('No stock');
      return;
    }
    
    console.log('Navigating to checkout with:', {
      product: this.product._id,
      qty: this.quantity
    });
    
    // Navigate to checkout page with product and quantity
    this.router.navigate(['/client/checkout'], {
      queryParams: {
        product: this.product._id,
        qty: this.quantity
      }
    }).then(
      success => console.log('Navigation success:', success),
      error => console.error('Navigation error:', error)
    );
  }
}
