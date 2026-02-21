import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ProductService } from '../../../services/product.service';
import { Product, ProductResponse } from '../../../../../shared/models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-container">
      <h2>{{ isEditMode ? 'Modifier' : 'Ajouter' }} un Produit</h2>
      
      <div class="form-container">
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Nom du produit *</label>
            <input 
              type="text" 
              [(ngModel)]="product.name" 
              name="name"
              placeholder="Nom du produit"
              required
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>SKU *</label>
              <input 
                type="text" 
                [(ngModel)]="product.sku" 
                name="sku"
                placeholder="Référence SKU"
                required
              />
            </div>
            <div class="form-group">
              <label>Boutique ID *</label>
              <input 
                type="text" 
                [(ngModel)]="product.shop_id" 
                name="shop_id"
                placeholder="ID de la boutique"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Prix unitaire (Ar) *</label>
              <input 
                type="number" 
                [(ngModel)]="product.unit_price" 
                name="unit_price"
                placeholder="0"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div class="form-group">
              <label>Prix de revient (Ar)</label>
              <input 
                type="number" 
                [(ngModel)]="product.cost_price" 
                name="cost_price"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div class="form-group">
            <label>URL de l'image</label>
            <input 
              type="text" 
              [(ngModel)]="product.image_url" 
              name="image_url"
              placeholder="https://..."
            />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea 
              rows="4" 
              [(ngModel)]="product.description" 
              name="description"
              placeholder="Description du produit..."
            ></textarea>
          </div>

          <div class="form-group">
            <label>Tags (séparés par des virgules)</label>
            <input 
              type="text" 
              [(ngModel)]="tagsInput" 
              name="tags"
              placeholder="tag1, tag2, tag3"
            />
          </div>

          <div class="form-group" *ngIf="isEditMode">
            <label>Statut</label>
            <select [(ngModel)]="product.current_status!.status" name="status">
              <option value="DRAFT">Brouillon</option>
              <option value="PENDING">En attente</option>
              <option value="ACTIVE">Actif</option>
              <option value="REJECTED">Rejeté</option>
            </select>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" routerLink="/admin/products/list">
              Annuler
            </button>
            <button 
              type="submit" 
              class="btn-primary"
              [disabled]="loading"
            >
              {{ loading ? 'Enregistrement...' : (isEditMode ? 'Mettre à jour' : 'Créer le produit') }}
            </button>
          </div>

          <div *ngIf="error" class="error-message">
            {{ error }}
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem;
    }
    h2 {
      margin-bottom: 1.5rem;
      color: #1e293b;
    }
    .form-container {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      max-width: 600px;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .form-group {
      margin-bottom: 1.25rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #64748b;
      font-size: 0.875rem;
    }
    label::after {
      color: #dc2626;
    }
    input, select, textarea {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      box-sizing: border-box;
      font-family: inherit;
    }
    textarea {
      resize: vertical;
    }
    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: #10b981;
    }
    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    button {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .btn-primary {
      background: #10b981;
      color: white;
      border: none;
    }
    .btn-primary:hover:not(:disabled) {
      background: #059669;
    }
    .btn-secondary {
      background: white;
      color: #64748b;
      border: 2px solid #e2e8f0;
    }
    .btn-secondary:hover {
      background: #f8fafc;
    }
    .error-message {
      color: #dc2626;
      margin-top: 1rem;
      padding: 0.75rem;
      background: #fee2e2;
      border-radius: 8px;
    }
  `]
})
export class ProductAddComponent implements OnInit {
  product: Product = {
    shop_id: '',
    sku: '',
    name: '',
    unit_price: 0,
    current_status: { status: 'DRAFT' }
  };
  tagsInput = '';
  isEditMode = false;
  productId: string | null = null;
  loading = false;
  error = '';

  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.isEditMode = true;
      this.loadProduct();
    }
  }

  loadProduct(): void {
    this.loading = true;
    this.productService.getProductById(this.productId!).subscribe({
      next: (response) => {
        if (response.success && response.product) {
          this.product = response.product;
          this.tagsInput = this.product.tags?.join(', ') || '';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du produit';
        this.loading = false;
        console.error('Error loading product:', err);
      }
    });
  }

  onSubmit(): void {
    if (!this.validateForm()) return;

    this.loading = true;
    this.error = '';

    // Parse tags
    if (this.tagsInput) {
      this.product.tags = this.tagsInput.split(',').map(t => t.trim()).filter(t => t);
    }

    if (this.isEditMode) {
      this.productService.updateProduct(this.productId!, this.product).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/admin/products/list']);
          } else {
            this.error = response.message || 'Erreur lors de la mise à jour';
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Erreur lors de la mise à jour du produit';
          this.loading = false;
        }
      });
    } else {
      this.productService.createProduct(this.product).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/admin/products/list']);
          } else {
            this.error = response.message || 'Erreur lors de la création';
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Erreur lors de la création du produit';
          this.loading = false;
        }
      });
    }
  }

  validateForm(): boolean {
    if (!this.product.name || !this.product.sku || !this.product.shop_id || !this.product.unit_price) {
      this.error = 'Veuillez remplir tous les champs obligatoires';
      return false;
    }
    return true;
  }
}
