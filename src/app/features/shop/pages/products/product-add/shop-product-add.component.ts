import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ProductService, Product, CreateProductRequest, UpdateProductRequest } from '../../../services/product.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { PermissionService } from '../../../../../core/services/permission.service';

// Type pour le statut du produit
type ProductStatus = 'DRAFT' | 'PENDING' | 'ACTIVE' | 'REJECTED';

interface ProductStatusInfo {
  status: ProductStatus;
  reason?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-shop-product-add',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-container">
      <div class="header">
        <button class="btn-back" (click)="goBack()">← Retour</button>
        <h2>{{ isEdit ? 'Modifier' : 'Ajouter' }} un Produit</h2>
      </div>

      <!-- Error Message -->
      <div *ngIf="error" class="error-message">
        {{ error }}
      </div>

      <form (ngSubmit)="onSubmit()" class="product-form">
        <!-- Basic Info Section -->
        <div class="form-section">
          <h3>Informations de base</h3>
          
          <div class="form-group">
            <label>Nom du produit *</label>
            <input 
              type="text" 
              [(ngModel)]="product.name" 
              name="name" 
              required
              placeholder="Nom du produit"
            >
          </div>

          <div class="form-row two-col">
            <div class="form-group">
              <label>SKU (Référence) *</label>
              <input 
                type="text" 
                [(ngModel)]="product.sku" 
                name="sku" 
                required
                placeholder="Ex: PROD-001"
              >
            </div>
            <div class="form-group">
              <label>Statut du produit</label>
              <select [(ngModel)]="product.current_status.status" name="status">
                <option value="DRAFT">Brouillon (Draft)</option>
                <option value="PENDING">En attente de validation</option>
                <option value="ACTIVE">Actif</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea 
              [(ngModel)]="product.description" 
              name="description" 
              rows="4"
              placeholder="Description du produit..."
            ></textarea>
          </div>
        </div>

        <!-- Pricing Section -->
        <div class="form-section">
          <h3>Prix</h3>
          
          <div class="form-row two-col">
            <div class="form-group">
              <label>Prix unitaire * (Ar)</label>
              <input 
                type="number" 
                [(ngModel)]="product.unit_price" 
                name="unit_price" 
                required
                min="0"
                placeholder="0"
              >
            </div>
            <div class="form-group">
              <label>Prix de revient (Ar)</label>
              <input 
                type="number" 
                [(ngModel)]="product.cost_price" 
                name="cost_price"
                min="0"
                placeholder="Coût d'achat"
              >
            </div>
          </div>
        </div>

        <!-- Stock Section -->
        <div class="form-section" *ngIf="!isEdit">
          <h3>Stock initial</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label>Quantité initiale</label>
              <input 
                type="number" 
                [(ngModel)]="product.initial_stock" 
                name="initial_stock"
                min="0"
                placeholder="0"
              >
            </div>
          </div>
          <p class="hint">Le stock sera géré séparément après création du produit.</p>
        </div>

        <!-- Categories Section -->
        <div class="form-section">
          <h3>Catégories</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label>Catégorie principale</label>
              <select [(ngModel)]="selectedCategory" name="category" (change)="addCategory()">
                <option value="">Sélectionner une catégorie</option>
                <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
              </select>
            </div>
          </div>
          
          <div class="selected-categories" *ngIf="product.categories.length > 0">
            <span *ngFor="let cat of product.categories; let i = index" class="category-tag">
              {{ cat.name }}
              <button type="button" (click)="removeCategory(i)">×</button>
            </span>
          </div>
        </div>

        <!-- Images Section -->
        <div class="form-section">
          <h3>Images du produit</h3>
          
          <div class="images-grid">
            <div 
              *ngFor="let image of product.images; let i = index" 
              class="image-preview"
            >
              <img [src]="image.image_url" alt="Product image">
              <button 
                type="button" 
                class="btn-remove-image" 
                (click)="removeImage(i)"
                title="Supprimer l'image"
              >
                ×
              </button>
              <span *ngIf="i === 0" class="main-image-badge">Principale</span>
            </div>
            
            <div 
              class="image-upload" 
              (click)="fileInput.click()"
              [class.dragover]="isDragging"
              (dragover)="onDragOver($event)"
              (dragleave)="onDragLeave($event)"
              (drop)="onDrop($event)"
            >
              <input 
                #fileInput
                type="file" 
                multiple 
                accept="image/*"
                (change)="onFileSelected($event)"
                hidden
              >
              <span class="upload-icon">📷</span>
              <span>Cliquez ou glissez des images ici</span>
              <small>JPG, PNG, WEBP (max 5MB)</small>
            </div>
          </div>
          <p class="hint">La première image sera utilisée comme image principale du produit.</p>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="goBack()">Annuler</button>
          <button 
            type="submit" 
            class="btn-primary"
            [disabled]="saving"
          >
            {{ saving ? 'Enregistrement...' : (isEdit ? 'Mettre à jour' : 'Créer le produit') }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem;
      max-width: 900px;
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
      border-radius: 6px;
      cursor: pointer;
    }
    h2 {
      color: #1e293b;
      margin: 0;
    }
    .error-message {
      padding: 1rem;
      background: #fee2e2;
      color: #dc2626;
      border-radius: 8px;
      margin-bottom: 1rem;
    }
    .product-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .form-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .form-section h3 {
      margin: 0 0 1rem 0;
      color: #1e293b;
      font-size: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .form-row.three-col {
      grid-template-columns: 1fr 1fr 1fr;
    }
    .form-row:last-child {
      margin-bottom: 0;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #64748b;
    }
    input, select, textarea {
      padding: 0.625rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.875rem;
      width: 100%;
      box-sizing: border-box;
    }
    textarea {
      resize: vertical;
    }
    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: #8b5cf6;
    }
    .new-category-input {
      margin-top: 0.5rem;
    }

    /* Checkbox */
    .checkbox-group {
      margin-top: 1rem;
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
    }
    .checkbox-label input {
      width: auto;
    }
    .checkmark {
      font-size: 1.25rem;
    }

    /* Images */
    .images-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 1rem;
    }
    .image-preview {
      position: relative;
      aspect-ratio: 1;
      border-radius: 8px;
      overflow: hidden;
      border: 2px solid #e2e8f0;
    }
    .image-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .btn-remove-image {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 24px;
      height: 24px;
      background: rgba(220, 38, 38, 0.9);
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1rem;
      line-height: 1;
    }
    .main-image-badge {
      position: absolute;
      bottom: 4px;
      left: 4px;
      background: #8b5cf6;
      color: white;
      padding: 0.125rem 0.375rem;
      border-radius: 4px;
      font-size: 0.625rem;
      font-weight: 600;
    }
    .image-upload {
      aspect-ratio: 1;
      border: 2px dashed #cbd5e1;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .image-upload:hover,
    .image-upload.dragover {
      border-color: #8b5cf6;
      background: #f5f3ff;
    }
    .upload-icon {
      font-size: 2rem;
    }
    .image-upload span {
      font-size: 0.75rem;
      color: #64748b;
      text-align: center;
    }
    .image-upload small {
      font-size: 0.625rem;
      color: #94a3b8;
    }
    .hint {
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 0.75rem;
    }

    /* Form Actions */
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1rem;
    }
    button {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary {
      background: #8b5cf6;
      color: white;
      border: none;
    }
    .btn-primary:hover:not(:disabled) {
      background: #7c3aed;
    }
    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .btn-secondary {
      background: white;
      color: #64748b;
      border: 2px solid #e2e8f0;
    }
    .btn-secondary:hover {
      background: #f8fafc;
    }
  `]
})
export class ShopProductAddComponent implements OnInit {
  isEdit = false;
  productId: string | null = null;
  private shopId: string | null = null;
  saving = false;
  error: string | null = null;
  isDragging = false;
  
  categories: string[] = [];
  newCategory = '';
  tagsInput = '';
  
  product: {
    name: string;
    sku: string;
    description: string;
    unit_price: number;
    cost_price: number;
    image_url: string;
    images: { image_url: string; created_at: string }[];
    categories: { category_id?: string; name: string }[];
    initial_stock: number;
    current_status: ProductStatusInfo;
  } = {
    name: '',
    sku: '',
    description: '',
    unit_price: 0,
    cost_price: 0,
    image_url: '',
    images: [],
    categories: [],
    initial_stock: 0,
    current_status: { status: 'DRAFT', reason: '', updated_at: new Date().toISOString() }
  };
  selectedCategory = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private authService: AuthService,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user?.shop_id) {
      this.shopId = user.shop_id;
    } else {
      this.error = 'Shop ID non trouvé. Veuillez vous reconnecter.';
      return;
    }

    // Load categories
    this.loadCategories();

    // Check if editing
    this.productId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.productId;

    if (this.isEdit) {
      this.loadProductData();
    }
  }

  loadCategories(): void {
    if (!this.shopId) return;
    this.productService.getCategories(this.shopId).subscribe({
      next: (response) => {
        this.categories = response.data;
      },
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  loadProductData(): void {
    if (!this.productId) return;
    
    this.productService.getProductById(this.productId).subscribe({
      next: (response) => {
        const p = response.data as any;
        
        // Convert MongoDB decimal to number
        const unitPrice = typeof p.unit_price === 'object' && p.unit_price?.$numberDecimal 
          ? parseFloat(p.unit_price.$numberDecimal) 
          : Number(p.unit_price) || 0;
          
        const costPrice = typeof p.cost_price === 'object' && p.cost_price?.$numberDecimal
          ? parseFloat(p.cost_price.$numberDecimal)
          : Number(p.cost_price) || 0;
        
        this.product = {
          name: p.name || '',
          sku: p.sku || '',
          description: p.description || '',
          unit_price: unitPrice,
          cost_price: costPrice,
          image_url: p.image_url || '',
          images: Array.isArray(p.images) ? p.images : [],
          categories: Array.isArray(p.categories) ? p.categories : [],
          initial_stock: 0,
          current_status: (p.current_status || { status: 'DRAFT', reason: '', updated_at: new Date().toISOString() }) as ProductStatusInfo
        };
      },
      error: (err) => {
        console.error('Error loading product:', err);
        this.error = 'Erreur lors du chargement du produit';
      }
    });
  }

  onSubmit(): void {
    if (!this.shopId) {
      this.error = 'Shop ID non trouvé';
      return;
    }

    this.saving = true;

    if (this.isEdit && this.productId) {
      const updateData: UpdateProductRequest = {
        name: this.product.name,
        sku: this.product.sku,
        description: this.product.description || undefined,
        unit_price: this.product.unit_price,
        cost_price: this.product.cost_price || undefined,
        image_url: this.product.image_url || undefined,
        categories: this.product.categories
      };

      this.productService.updateProduct(this.productId, updateData).subscribe({
        next: () => {
          this.router.navigate(['/shop/products/list']);
        },
        error: (err) => {
          console.error('Error updating product:', err);
          this.error = 'Erreur lors de la mise à jour du produit';
          this.saving = false;
        }
      });
    } else {
      const createData: CreateProductRequest = {
        name: this.product.name,
        sku: this.product.sku,
        description: this.product.description || undefined,
        unit_price: this.product.unit_price,
        cost_price: this.product.cost_price || undefined,
        image_url: this.product.images.length > 0 ? this.product.images[0].image_url : undefined,
        images: this.product.images,
        categories: this.product.categories,
        shop_id: this.shopId,
        initial_stock: this.product.initial_stock,
        current_status: this.product.current_status as ProductStatusInfo
      };

      this.productService.createProduct(createData).subscribe({
        next: () => {
          this.router.navigate(['/shop/products/list']);
        },
        error: (err) => {
          console.error('Error creating product:', err);
          this.error = 'Erreur lors de la création du produit';
          this.saving = false;
        }
      });
    }
  }

  addCategory(): void {
    if (this.selectedCategory && !this.product.categories.find(c => c.name === this.selectedCategory)) {
      this.product.categories.push({ name: this.selectedCategory });
    }
    this.selectedCategory = '';
  }

  removeCategory(index: number): void {
    this.product.categories.splice(index, 1);
  }

  // Image handling
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer?.files) {
      this.handleFiles(Array.from(event.dataTransfer.files));
    }
  }

  handleFiles(files: File[]): void {
    // For now, convert to data URLs (in production, upload to server)
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.product.images.push({
            image_url: e.target?.result as string,
            created_at: new Date().toISOString()
          });
        };
        reader.readAsDataURL(file);
      }
    });
  }

  removeImage(index: number): void {
    this.product.images.splice(index, 1);
  }

  goBack(): void {
    this.router.navigate(['/shop/products/list']);
  }
}
