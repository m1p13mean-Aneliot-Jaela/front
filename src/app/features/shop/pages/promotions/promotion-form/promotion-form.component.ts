import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PromotionService, Promotion, CreatePromotionRequest, UpdatePromotionRequest } from '../../../services/promotion.service';
import { ProductService, Product } from '../../../services/product.service';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-promotion-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="header">
        <button class="btn-back" (click)="goBack()">← Retour</button>
        <h2>{{ isEditMode ? 'Modifier la Promotion' : 'Créer une Promotion' }}</h2>
      </div>

      <form (ngSubmit)="onSubmit()" class="promo-form" *ngIf="!loading">
        <!-- Basic Info -->
        <div class="form-section">
          <h3>Informations de base</h3>
          
          <div class="form-group">
            <label>Titre *</label>
            <input type="text" 
                   class="form-control" 
                   [(ngModel)]="formData.title" 
                   name="title"
                   required
                   placeholder="Ex: Soldes d'été">
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea class="form-control" 
                      [(ngModel)]="formData.description" 
                      name="description"
                      rows="3"
                      placeholder="Description de la promotion..."></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Type de réduction *</label>
              <select class="form-control" [(ngModel)]="formData.type" name="type" required>
                <option value="percentage">Pourcentage (%)</option>
                <option value="fixed_amount">Montant fixe (Ar)</option>
              </select>
            </div>

            <div class="form-group">
              <label>Valeur *</label>
              <input type="number" 
                     class="form-control" 
                     [(ngModel)]="formData.value" 
                     name="value"
                     required
                     min="0"
                     [placeholder]="formData.type === 'percentage' ? 'Ex: 20' : 'Ex: 5000'">
            </div>
          </div>
        </div>

        <!-- Code & Usage -->
        <div class="form-section">
          <h3>Code promo & Limites</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label>Code promo (optionnel)</label>
              <input type="text" 
                     class="form-control" 
                     [(ngModel)]="formData.promo_code" 
                     name="promo_code"
                     placeholder="Ex: ETE2024"
                     style="text-transform: uppercase;">
              <small class="help-text">Laissez vide pour une promo automatique</small>
            </div>

            <div class="form-group">
              <label>Limite d'usage (optionnel)</label>
              <input type="number" 
                     class="form-control" 
                     [(ngModel)]="formData.usage_limit" 
                     name="usage_limit"
                     min="0"
                     placeholder="Ex: 100">
              <small class="help-text">Nombre max d'utilisations</small>
            </div>
          </div>

          <div class="form-group">
            <label>Conditions d'utilisation</label>
            <textarea class="form-control" 
                      [(ngModel)]="formData.conditions" 
                      name="conditions"
                      rows="2"
                      placeholder="Ex: Valable uniquement sur les produits en stock..."></textarea>
          </div>
        </div>

        <!-- Dates -->
        <div class="form-section">
          <h3>Période de validité</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label>Date de début *</label>
              <input type="datetime-local" 
                     class="form-control" 
                     [(ngModel)]="formData.start_date" 
                     name="start_date"
                     required>
            </div>

            <div class="form-group">
              <label>Date de fin *</label>
              <input type="datetime-local" 
                     class="form-control" 
                     [(ngModel)]="formData.end_date" 
                     name="end_date"
                     required>
            </div>
          </div>
        </div>

        <!-- Products Selection -->
        <div class="form-section">
          <h3>Produits concernés</h3>
          
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" [(ngModel)]="applicableProductsType" name="applicableProductsType" value="ALL">
              <span>Tous les produits</span>
            </label>
            <label class="radio-label">
              <input type="radio" [(ngModel)]="applicableProductsType" name="applicableProductsType" value="SELECTED">
              <span>Sélectionner des produits</span>
            </label>
          </div>

          <!-- Product Selector -->
          <div *ngIf="applicableProductsType === 'SELECTED'" class="product-selector">
            <div class="search-bar">
              <input type="text" 
                     class="form-control" 
                     placeholder="Rechercher un produit..."
                     [(ngModel)]="productSearch"
                     (ngModelChange)="filterProducts()"
                     name="productSearch">
            </div>
            
            <div class="products-list">
              <div *ngFor="let product of filteredProducts" class="product-item">
                <label class="checkbox-label">
                  <input type="checkbox" 
                         [checked]="isProductSelected(product._id!)"
                         (change)="toggleProduct(product._id!)">
                  <img *ngIf="product.image_url" [src]="product.image_url" class="product-thumb">
                  <div *ngIf="!product.image_url" class="product-thumb placeholder">📦</div>
                  <div class="product-info">
                    <span class="product-name">{{ product.name }}</span>
                    <span class="product-price">{{ product.unit_price | number }} Ar</span>
                  </div>
                </label>
              </div>
            </div>
            
            <div class="selected-count">
              {{ selectedProducts.length }} produit(s) sélectionné(s)
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="goBack()">Annuler</button>
          <button type="submit" class="btn-primary" [disabled]="!isFormValid() || saving">
            {{ saving ? 'Enregistrement...' : (isEditMode ? 'Mettre à jour' : 'Créer la promotion') }}
          </button>
        </div>
      </form>

      <div *ngIf="loading" class="loading">Chargement...</div>
      <div *ngIf="error" class="error-message">{{ error }}</div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem;
      max-width: 800px;
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
    }
    h2 {
      margin: 0;
      color: #1e293b;
    }

    .promo-form {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .form-section {
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .form-section:last-of-type {
      border-bottom: none;
    }
    .form-section h3 {
      margin: 0 0 1rem 0;
      font-size: 1rem;
      color: #1e293b;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }
    .form-control {
      width: 100%;
      padding: 0.625rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.875rem;
    }
    .form-control:focus {
      outline: none;
      border-color: #8b5cf6;
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
    }
    textarea.form-control {
      resize: vertical;
    }

    .help-text {
      display: block;
      margin-top: 0.25rem;
      font-size: 0.75rem;
      color: #64748b;
    }

    .radio-group {
      display: flex;
      gap: 1.5rem;
    }
    .radio-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .product-selector {
      margin-top: 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1rem;
    }
    .search-bar {
      margin-bottom: 1rem;
    }
    .products-list {
      max-height: 300px;
      overflow-y: auto;
    }
    .product-item {
      padding: 0.5rem 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
    }
    .product-thumb {
      width: 40px;
      height: 40px;
      object-fit: cover;
      border-radius: 6px;
    }
    .product-thumb.placeholder {
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }
    .product-info {
      display: flex;
      flex-direction: column;
    }
    .product-name {
      font-size: 0.875rem;
      color: #1e293b;
    }
    .product-price {
      font-size: 0.75rem;
      color: #64748b;
    }
    .selected-count {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
      font-size: 0.875rem;
      color: #64748b;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1.5rem;
      background: #f8fafc;
    }
    .btn-secondary {
      padding: 0.75rem 1.25rem;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
    }
    .btn-primary {
      padding: 0.75rem 1.25rem;
      background: #8b5cf6;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
    }
    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .loading {
      text-align: center;
      padding: 2rem;
      color: #64748b;
    }
    .error-message {
      padding: 1rem;
      background: #fee2e2;
      color: #dc2626;
      border-radius: 8px;
    }
  `]
})
export class PromotionFormComponent implements OnInit {
  isEditMode = false;
  promotionId: string | null = null;
  
  formData: CreatePromotionRequest = {
    shop_id: '',
    title: '',
    description: '',
    type: 'percentage',
    value: 0,
    promo_code: '',
    start_date: '',
    end_date: '',
    conditions: '',
    usage_limit: undefined,
    applicable_products: 'ALL',
    exclusions: []
  };

  applicableProductsType: 'ALL' | 'SELECTED' = 'ALL';
  selectedProducts: string[] = [];
  availableProducts: Product[] = [];
  filteredProducts: Product[] = [];
  productSearch = '';

  loading = false;
  saving = false;
  error: string | null = null;
  private shopId: string | null = null;

  constructor(
    private promotionService: PromotionService,
    private productService: ProductService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user?.shop_id) {
      this.shopId = user.shop_id;
      this.formData.shop_id = user.shop_id;
      
      // Load products for selection
      this.loadProducts();
      
      // Check if edit mode
      this.promotionId = this.route.snapshot.paramMap.get('id');
      if (this.promotionId) {
        this.isEditMode = true;
        this.loadPromotion();
      } else {
        // Set default dates
        this.setDefaultDates();
      }
    } else {
      this.error = 'Shop ID non trouvé. Veuillez vous reconnecter.';
    }
  }

  setDefaultDates(): void {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    this.formData.start_date = this.formatDateTimeLocal(now);
    this.formData.end_date = this.formatDateTimeLocal(tomorrow);
  }

  formatDateTimeLocal(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  loadProducts(): void {
    if (!this.shopId) return;
    this.productService.getProductsByShop(this.shopId, { limit: 100 }).subscribe({
      next: (response) => {
        this.availableProducts = response.data.products;
        this.filteredProducts = [...this.availableProducts];
      },
      error: (err) => console.error('Error loading products:', err)
    });
  }

  loadPromotion(): void {
    if (!this.promotionId) return;
    this.loading = true;
    this.promotionService.getPromotionById(this.promotionId).subscribe({
      next: (response) => {
        const promo = response.data;
        this.formData = {
          shop_id: promo.shop_id,
          title: promo.title,
          description: promo.description || '',
          type: promo.type,
          value: promo.value,
          promo_code: promo.promo_code || '',
          start_date: this.formatDateTimeLocal(new Date(promo.start_date)),
          end_date: this.formatDateTimeLocal(new Date(promo.end_date)),
          conditions: promo.conditions || '',
          usage_limit: promo.usage_limit,
          applicable_products: promo.applicable_products || 'ALL',
          exclusions: promo.exclusions || []
        };
        
        if (promo.applicable_products && promo.applicable_products !== 'ALL') {
          this.applicableProductsType = 'SELECTED';
          this.selectedProducts = promo.applicable_products as string[];
        }
        
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de la promotion';
        this.loading = false;
        console.error('Error loading promotion:', err);
      }
    });
  }

  filterProducts(): void {
    if (!this.productSearch) {
      this.filteredProducts = [...this.availableProducts];
    } else {
      const term = this.productSearch.toLowerCase();
      this.filteredProducts = this.availableProducts.filter(p => 
        p.name.toLowerCase().includes(term)
      );
    }
  }

  isProductSelected(productId: string): boolean {
    return this.selectedProducts.includes(productId);
  }

  toggleProduct(productId: string): void {
    const index = this.selectedProducts.indexOf(productId);
    if (index === -1) {
      this.selectedProducts.push(productId);
    } else {
      this.selectedProducts.splice(index, 1);
    }
  }

  isFormValid(): boolean {
    return !!(
      this.formData.title &&
      this.formData.type &&
      this.formData.value >= 0 &&
      this.formData.start_date &&
      this.formData.end_date &&
      new Date(this.formData.end_date) > new Date(this.formData.start_date)
    );
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;
    
    this.saving = true;
    
    // Format data
    const data = { ...this.formData };
    data.applicable_products = this.applicableProductsType === 'ALL' ? 'ALL' : this.selectedProducts;
    
    if (this.isEditMode && this.promotionId) {
      const updateData: UpdatePromotionRequest = {
        title: data.title,
        description: data.description,
        type: data.type,
        value: data.value,
        promo_code: data.promo_code || undefined,
        start_date: data.start_date,
        end_date: data.end_date,
        conditions: data.conditions,
        usage_limit: data.usage_limit,
        applicable_products: data.applicable_products
      };
      
      this.promotionService.updatePromotion(this.promotionId, updateData).subscribe({
        next: () => {
          this.router.navigate(['/shop/promotions']);
        },
        error: (err) => {
          this.saving = false;
          this.error = err.error?.message || 'Erreur lors de la mise à jour';
        }
      });
    } else {
      this.promotionService.createPromotion(data).subscribe({
        next: () => {
          this.router.navigate(['/shop/promotions']);
        },
        error: (err) => {
          this.saving = false;
          this.error = err.error?.message || 'Erreur lors de la création';
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/shop/promotions']);
  }
}
