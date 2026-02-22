import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ShopCategoryService } from '../../../services/shop-category.service';
import { ShopCategory } from '../../../../../shared/models/shop.model';

@Component({
  selector: 'app-shop-category-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="header">
        <h2>{{ isEditMode ? 'Modifier la Catégorie' : 'Ajouter une Catégorie' }}</h2>
      </div>

      <div *ngIf="loading" class="loading">Chargement...</div>
      <div *ngIf="loadError" class="error">{{ loadError }}</div>

      <div *ngIf="!loading && !loadError" class="form-container">
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Nom de la catégorie *</label>
            <input 
              type="text" 
              [(ngModel)]="category.name" 
              name="name" 
              placeholder="Ex: Alimentation, Mode, Technologie..."
              required
            />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea 
              [(ngModel)]="category.description" 
              name="description" 
              rows="3" 
              placeholder="Description de la catégorie..."
            ></textarea>
          </div>

          <div class="form-group">
            <label>Catégorie parente</label>
            <select 
              [(ngModel)]="category.parent_category_id" 
              name="parent_category_id"
            >
              <option value="">Aucune (Catégorie racine)</option>
              <option 
                *ngFor="let cat of availableParentCategories" 
                [value]="cat._id"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="onCancel()">Annuler</button>
            <button type="submit" class="btn-primary" [disabled]="submitting">
              {{ submitting ? 'Enregistrement...' : (isEditMode ? 'Mettre à jour' : 'Créer') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      margin-bottom: 1.5rem;
    }
    h2 {
      margin: 0;
      color: #1e293b;
    }
    .loading, .error {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      margin: 1rem 0;
    }
    .error {
      color: #dc2626;
    }
    .form-container {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #64748b;
      font-size: 0.875rem;
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
    .error-message {
      background: #fee2e2;
      color: #dc2626;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }
    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #e2e8f0;
    }
    button {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 1rem;
    }
    .btn-primary {
      background: #10b981;
      color: white;
      border: none;
      flex: 1;
    }
    .btn-primary:hover:not(:disabled) {
      background: #059669;
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
export class ShopCategoryFormComponent implements OnInit {
  category: ShopCategory = {
    name: '',
    description: '',
    parent_category_id: ''
  };

  categories: ShopCategory[] = [];
  availableParentCategories: ShopCategory[] = [];
  
  isEditMode = false;
  categoryId: string = '';
  loading = false;
  loadError = '';
  submitting = false;
  errorMessage = '';

  constructor(
    private shopCategoryService: ShopCategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.categoryId;
    
    this.loadCategories();
    
    if (this.isEditMode) {
      this.loadCategory();
    }
  }

  loadCategories(): void {
    this.shopCategoryService.getAllCategories().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Backend returns { categories: [], pagination: {} }
          const data = response.data as any;
          if (data.categories && Array.isArray(data.categories)) {
            this.categories = data.categories;
          } else if (Array.isArray(response.data)) {
            // Fallback for direct array response
            this.categories = response.data;
          }
          this.updateAvailableParentCategories();
        }
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  loadCategory(): void {
    this.loading = true;
    this.loadError = '';

    this.shopCategoryService.getCategoryById(this.categoryId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.category = response.data as ShopCategory;
          // Convert null/undefined parent_category_id to empty string for select binding
          if (!this.category.parent_category_id) {
            this.category.parent_category_id = '';
          }
          this.updateAvailableParentCategories();
        } else {
          this.loadError = 'Impossible de charger la catégorie';
        }
        this.loading = false;
      },
      error: (err) => {
        this.loadError = 'Erreur lors du chargement de la catégorie';
        console.error('Error loading category:', err);
        this.loading = false;
      }
    });
  }

  updateAvailableParentCategories(): void {
    // Exclude the current category and its descendants from parent options
    if (this.isEditMode && this.categoryId) {
      this.availableParentCategories = this.categories.filter(
        cat => cat._id !== this.categoryId
      );
    } else {
      this.availableParentCategories = [...this.categories];
    }
  }

  onSubmit(): void {
    if (!this.category.name) {
      this.errorMessage = 'Le nom de la catégorie est obligatoire';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    // Prepare category data - remove parent_category_id if empty
    const categoryData: any = {
      name: this.category.name,
      description: this.category.description
    };

    // Only include parent_category_id if it has a valid value
    if (this.category.parent_category_id && 
        this.category.parent_category_id !== '' && 
        this.category.parent_category_id !== 'null' && 
        this.category.parent_category_id !== 'undefined') {
      categoryData.parent_category_id = this.category.parent_category_id;
    }

    const operation = this.isEditMode
      ? this.shopCategoryService.updateCategory(this.categoryId, categoryData)
      : this.shopCategoryService.createCategory(categoryData);

    operation.subscribe({
      next: (response) => {
        if (response.success) {
          alert(this.isEditMode ? 'Catégorie mise à jour avec succès' : 'Catégorie créée avec succès');
          this.router.navigate(['/admin/shop-categories']);
        }
        this.submitting = false;
      },
      error: (err) => {
        this.errorMessage = this.isEditMode 
          ? 'Erreur lors de la mise à jour de la catégorie'
          : 'Erreur lors de la création de la catégorie';
        console.error('Error saving category:', err);
        this.submitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/shop-categories']);
  }
}
