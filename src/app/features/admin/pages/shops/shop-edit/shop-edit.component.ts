import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ShopService } from '../../../services/shop.service';
import { ShopCategoryService } from '../../../services/shop-category.service';
import { Shop, ShopCategory } from '../../../../../shared/models/shop.model';

@Component({
  selector: 'app-shop-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="header">
        <h2>Modifier la Boutique</h2>
      </div>

      <div *ngIf="loading" class="loading">Chargement...</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <div *ngIf="!loading && !error" class="form-container">
        <form (ngSubmit)="onSubmit()">
          <!-- Basic Info -->
          <div class="form-section">
            <h3>Informations de base</h3>

            <div class="form-group">
              <label>Nom de la boutique *</label>
              <input 
                type="text" 
                [(ngModel)]="shop.shop_name" 
                name="shop_name" 
                placeholder="Ma Boutique"
                required
              />
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea 
                [(ngModel)]="shop.description" 
                name="description" 
                rows="3" 
                placeholder="Description de la boutique..."
              ></textarea>
            </div>

            <div class="form-group">
              <label>URL du logo</label>
              <input 
                type="text" 
                [(ngModel)]="shop.logo" 
                name="logo" 
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div class="form-group">
              <label>Mall / Centre Commercial</label>
              <input 
                type="text" 
                [(ngModel)]="shop.mall_location" 
                name="mall_location" 
                placeholder="Centre Commercial Tana Water Front"
              />
            </div>
          </div>

          <!-- Categories -->
          <div class="form-section">
            <h3>Catégories *</h3>
            
            <div class="category-selection">
              <div *ngFor="let category of categories" class="checkbox-item">
                <label>
                  <input 
                    type="checkbox" 
                    [value]="category._id"
                    (change)="onCategoryChange($event, category._id!)"
                    [checked]="isCategorySelected(category._id!)"
                  />
                  <span>{{ category.name }}</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Opening Hours -->
          <div class="form-section">
            <h3>Horaires d'ouverture</h3>
            
            <div *ngFor="let day of daysOfWeek" class="day-hours">
              <div class="day-label">{{ day.label }}</div>
              <div class="time-inputs">
                <input 
                  type="time" 
                  [(ngModel)]="shop.opening_time[day.key].open" 
                  [name]="'open_' + day.key"
                  placeholder="08:00"
                />
                <span class="time-separator">à</span>
                <input 
                  type="time" 
                  [(ngModel)]="shop.opening_time[day.key].close" 
                  [name]="'close_' + day.key"
                  placeholder="18:00"
                />
              </div>
            </div>
          </div>

          <!-- Status -->
          <div class="form-section">
            <h3>Statut</h3>
            
            <div class="form-group">
              <label>Statut actuel</label>
              <select [(ngModel)]="shop.current_status.status" name="status">
                <option value="pending">En attente</option>
                <option value="validated">Validé</option>
                <option value="active">Actif</option>
                <option value="deactivated">Désactivé</option>
                <option value="suspended">Suspendu</option>
              </select>
            </div>

            <div class="form-group">
              <label>Raison du statut (optionnel)</label>
              <textarea 
                [(ngModel)]="shop.current_status.reason" 
                name="status_reason" 
                rows="2" 
                placeholder="Raison du changement de statut..."
              ></textarea>
            </div>
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="onCancel()">Annuler</button>
            <button type="submit" class="btn-primary" [disabled]="submitting">
              {{ submitting ? 'Mise à jour...' : 'Mettre à jour' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem;
      max-width: 1200px;
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
    .form-section {
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .form-section:last-of-type {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    h3 {
      margin: 0 0 1.5rem 0;
      color: #334155;
      font-size: 1.125rem;
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
    input, select, textarea {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      box-sizing: border-box;
      font-family: inherit;
    }
    input:disabled {
      background: #f8fafc;
      cursor: not-allowed;
    }
    textarea {
      resize: vertical;
    }
    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: #10b981;
    }
    input[type="checkbox"] {
      width: auto;
      margin-right: 0.5rem;
    }
    .checkbox-group label {
      display: flex;
      align-items: center;
      cursor: pointer;
    }
    .checkbox-group span {
      font-weight: 400;
      color: #1e293b;
    }
    .error-message {
      background: #fee2e2;
      color: #dc2626;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }
    .checkbox-item {
      margin-bottom: 0.75rem;
    }
    .checkbox-item label {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-weight: normal;
    }
    .checkbox-item input[type="checkbox"] {
      width: auto;
      margin-right: 0.5rem;
    }
    .category-selection {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 0.5rem;
    }
    .day-hours {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
      gap: 1rem;
    }
    .day-label {
      width: 120px;
      font-weight: 500;
      color: #64748b;
    }
    .time-inputs {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
    }
    .time-inputs input {
      width: 120px;
    }
    .time-separator {
      color: #64748b;
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
export class ShopEditComponent implements OnInit {
  shopId: string = '';
  shop: Shop = {
    shop_name: '',
    description: '',
    logo: '',
    mall_location: '',
    opening_time: {
      monday: { open: '08:00', close: '18:00' },
      tuesday: { open: '08:00', close: '18:00' },
      wednesday: { open: '08:00', close: '18:00' },
      thursday: { open: '08:00', close: '18:00' },
      friday: { open: '08:00', close: '18:00' },
      saturday: { open: '08:00', close: '12:00' },
      sunday: { open: '08:00', close: '18:00' }
    },
    users: [],
    current_status: {
      status: 'pending',
      updated_at: new Date()
    },
    categories: []
  };

  categories: ShopCategory[] = [];
  selectedCategories: string[] = [];
  
  daysOfWeek = [
    { key: 'monday', label: 'Lundi' },
    { key: 'tuesday', label: 'Mardi' },
    { key: 'wednesday', label: 'Mercredi' },
    { key: 'thursday', label: 'Jeudi' },
    { key: 'friday', label: 'Vendredi' },
    { key: 'saturday', label: 'Samedi' },
    { key: 'sunday', label: 'Dimanche' }
  ];
  
  loading = false;
  error = '';
  submitting = false;
  errorMessage = '';

  constructor(
    private shopService: ShopService,
    private shopCategoryService: ShopCategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.shopId = this.route.snapshot.params['id'];
    if (this.shopId) {
      this.loadShop();
      this.loadCategories();
    }
  }

  loadShop(): void {
    this.loading = true;
    this.error = '';

    this.shopService.getShopById(this.shopId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.shop = response.data as Shop;
          
          // Extract selected category IDs
          if (this.shop.categories && Array.isArray(this.shop.categories)) {
            this.selectedCategories = this.shop.categories.map(cat => 
              typeof cat.category_id === 'string' ? cat.category_id : (cat.category_id as any)?._id
            ).filter(id => id);
          }
          
          // Ensure opening_time structure exists
          if (!this.shop.opening_time) {
            this.shop.opening_time = {
              monday: { open: '08:00', close: '18:00' },
              tuesday: { open: '08:00', close: '18:00' },
              wednesday: { open: '08:00', close: '18:00' },
              thursday: { open: '08:00', close: '18:00' },
              friday: { open: '08:00', close: '18:00' },
              saturday: { open: '08:00', close: '12:00' },
              sunday: { open: '08:00', close: '18:00' }
            };
          }
        } else {
          this.error = 'Impossible de charger la boutique';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de la boutique';
        console.error('Error loading shop:', err);
        this.loading = false;
      }
    });
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
        }
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  onCategoryChange(event: any, categoryId: string): void {
    if (event.target.checked) {
      if (!this.selectedCategories.includes(categoryId)) {
        this.selectedCategories.push(categoryId);
      }
    } else {
      this.selectedCategories = this.selectedCategories.filter(id => id !== categoryId);
    }
  }

  isCategorySelected(categoryId: string): boolean {
    return this.selectedCategories.includes(categoryId);
  }

  onSubmit(): void {
    if (!this.shop.shop_name) {
      this.errorMessage = 'Le nom de la boutique est obligatoire';
      return;
    }

    if (this.selectedCategories.length === 0) {
      this.errorMessage = 'Veuillez sélectionner au moins une catégorie';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    // Prepare shop data with selected categories
    const shopData = {
      ...this.shop,
      categories: this.selectedCategories,
      current_status: {
        ...this.shop.current_status,
        updated_at: new Date()
      }
    };

    this.shopService.updateShop(this.shopId, shopData).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Boutique mise à jour avec succès');
          this.router.navigate(['/admin/shops']);
        }
        this.submitting = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la mise à jour de la boutique';
        console.error('Error updating shop:', err);
        this.submitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/shops']);
  }
}
