import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ShopService } from '../../../services/shop.service';
import { ShopCategoryService } from '../../../services/shop-category.service';
import { ShopBoxService } from '../../../services/shop-box.service';
import { Shop, ShopCategory } from '../../../../../shared/models/shop.model';
import { ShopBox } from '../../../../../shared/models/shop-box.model';

@Component({
  selector: 'app-shop-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="header">
        <h2>Ajouter une Boutique</h2>
      </div>

      <div class="form-container">
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
          </div>

          <!-- Shop Box -->
          <div class="form-section">
            <h3>Box de Boutique</h3>
            
            <div class="box-search-container">
              <div class="form-group">
                <label>Rechercher et assigner une box</label>
                <input 
                  type="text" 
                  [(ngModel)]="boxSearchQuery" 
                  name="boxSearch"
                  placeholder="Rechercher une box disponible..."
                  (input)="filterBoxes()"
                  (focus)="onBoxSearchFocus()"
                  (blur)="onBoxSearchBlur()"
                />
              </div>

              <!-- Search Results -->
              <div *ngIf="showBoxDropdown && filteredBoxes.length > 0" class="search-results">
                <div 
                  *ngFor="let box of filteredBoxes" 
                  class="search-result-item"
                  (mousedown)="selectBox(box)"
                >
                  <span>{{ box.ref }}</span>
                  <span class="box-status" [class.free]="box.current_status.status === 'free'">
                    {{ box.current_status.status === 'free' ? 'Libre' : box.current_status.status }}
                  </span>
                  <span class="add-hint">Cliquer pour assigner</span>
                </div>
              </div>

              <!-- No Results Message -->
              <div *ngIf="showBoxDropdown && boxSearchQuery && filteredBoxes.length === 0 && shopBoxes.length > 0" class="no-results">
                <p>Aucune box disponible trouvée</p>
              </div>
              
              <!-- No Boxes Available Message -->
              <div *ngIf="shopBoxes.length === 0" class="info-message">
                <p>ℹ️ Aucune box libre disponible pour le moment</p>
              </div>
            </div>

            <!-- Selected Box Display -->
            <div *ngIf="selectedShopBox" class="selected-box-display">
              <h4>Box assignée</h4>
              <div class="selected-box-item">
                <span class="box-ref">{{ selectedShopBox.ref }}</span>
                <span class="box-status-badge free">{{ selectedShopBox.current_status.status === 'free' ? 'Libre' : selectedShopBox.current_status.status }}</span>
                <button 
                  type="button" 
                  class="btn-remove" 
                  (click)="clearBox()"
                  title="Retirer cette box"
                >
                  <span>×</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Categories -->
          <div class="form-section">
            <h3>Catégories *</h3>
            
            <div class="category-search-container">
              <div class="form-group">
                <label>Rechercher et ajouter des catégories</label>
                <input 
                  type="text" 
                  [(ngModel)]="categorySearchQuery" 
                  name="categorySearch"
                  placeholder="Rechercher une catégorie..."
                  (input)="filterCategories()"
                  (focus)="onSearchFocus()"
                  (blur)="onCategorySearchBlur()"
                />
              </div>

              <!-- Search Results -->
              <div *ngIf="showDropdown && filteredCategories.length > 0" class="search-results">
                <div 
                  *ngFor="let category of filteredCategories" 
                  class="search-result-item"
                  (mousedown)="selectCategory(category)"
                >
                  <span>{{ category.name }}</span>
                  <span class="add-hint">Cliquer pour ajouter</span>
                </div>
              </div>

              <!-- No Results Message -->
              <div *ngIf="showDropdown && categorySearchQuery && filteredCategories.length === 0 && categories.length > 0" class="no-results">
                <p>Aucune catégorie trouvée</p>
              </div>
            </div>

            <!-- Selected Categories List -->
            <div *ngIf="getSelectedCategoryObjects().length > 0" class="selected-categories-list">
              <h4>Catégories ajoutées ({{ selectedCategories.length }})</h4>
              <ul class="category-list">
                <li 
                  *ngFor="let category of getSelectedCategoryObjects(); let i = index" 
                  class="category-list-item"
                >
                  <span class="category-number">{{ i + 1 }}.</span>
                  <span class="category-name">{{ category.name }}</span>
                  <button 
                    type="button" 
                    class="btn-remove-list" 
                    (click)="removeCategory(getCategoryId(category))"
                    title="Retirer cette catégorie"
                  >
                    <span>×</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <!-- Status -->
          <div class="form-section">
            <h3>Statut</h3>
            
            <div class="form-group">
              <label>Statut de la boutique *</label>
              <select [(ngModel)]="shop.current_status.status" name="status" required>
                <option value="pending">En attente</option>
                <option value="validated">Validé</option>
                <option value="active">Actif</option>
                <option value="deactivated">Désactivé</option>
                <option value="suspended">Suspendu</option>
              </select>
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
              {{ submitting ? 'Création...' : 'Créer la boutique' }}
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
    textarea {
      resize: vertical;
    }
    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: #10b981;
    }
    .category-search-container {
      position: relative;
    }
    .search-results {
      margin-top: 0.5rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      max-height: 200px;
      overflow-y: auto;
      background: white;
      position: relative;
      z-index: 10;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .search-result-item {
      padding: 0.75rem 1rem;
      cursor: pointer;
      transition: all 0.2s;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .search-result-item:last-child {
      border-bottom: none;
    }
    .search-result-item:hover {
      background: #d1fae5;
    }
    .search-result-item .add-hint {
      font-size: 0.75rem;
      color: #10b981;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .search-result-item:hover .add-hint {
      opacity: 1;
    }
    .no-results {
      padding: 1rem;
      text-align: center;
      color: #64748b;
      font-size: 0.875rem;
    }
    .no-results p {
      margin: 0;
    }
    .info-message {
      padding: 1rem;
      text-align: center;
      color: #0284c7;
      font-size: 0.875rem;
      background: #f0f9ff;
      border-radius: 6px;
      margin-top: 0.5rem;
    }
    .info-message p {
      margin: 0;
    }
    .selected-categories-list {
      margin-top: 1.5rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 8px;
      border: 2px solid #e2e8f0;
    }
    .selected-categories-list h4 {
      margin: 0 0 1rem 0;
      color: #334155;
      font-size: 0.9rem;
      font-weight: 600;
    }
    .category-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .category-list-item {
      display: flex;
      align-items: center;
      padding: 0.75rem;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      margin-bottom: 0.5rem;
      transition: all 0.2s;
    }
    .category-list-item:last-child {
      margin-bottom: 0;
    }
    .category-list-item:hover {
      border-color: #cbd5e1;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .category-number {
      color: #64748b;
      font-weight: 600;
      margin-right: 0.75rem;
      min-width: 25px;
    }
    .category-name {
      flex: 1;
      color: #1e293b;
      font-weight: 500;
    }
    .btn-remove-list {
      background: #ef4444;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
      padding: 0;
      font-size: 1.25rem;
      line-height: 1;
    }
    .btn-remove-list:hover {
      background: #dc2626;
    }
    .btn-remove-list span {
      display: block;
      margin-top: -2px;
    }
    .box-search-container {
      position: relative;
    }
    .selected-box-display {
      margin-top: 1.5rem;
      padding: 1rem;
      background: #f0f9ff;
      border-radius: 8px;
      border: 2px solid #bae6fd;
    }
    .selected-box-display h4 {
      margin: 0 0 1rem 0;
      color: #334155;
      font-size: 0.9rem;
      font-weight: 600;
    }
    .selected-box-item {
      display: flex;
      align-items: center;
      padding: 0.75rem;
      background: white;
      border: 1px solid #bae6fd;
      border-radius: 6px;
      gap: 0.75rem;
    }
    .box-ref {
      flex: 1;
      color: #1e293b;
      font-weight: 600;
      font-size: 1rem;
    }
    .box-status {
      font-size: 0.75rem;
      color: #64748b;
      margin-left: 0.5rem;
    }
    .box-status.free {
      color: #10b981;
      font-weight: 600;
    }
    .box-status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      background: #10b981;
      color: white;
    }
    .btn-remove {
      background: #ef4444;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
      padding: 0;
      font-size: 1.25rem;
      line-height: 1;
    }
    .btn-remove:hover {
      background: #dc2626;
    }
    .btn-remove span {
      display: block;
      margin-top: -2px;
    }
    .error-message {
      padding: 1rem;
      background: #fee2e2;
      color: #991b1b;
      border-radius: 8px;
      margin-bottom: 1rem;
    }
    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #e2e8f0;
    }
    button {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 1rem;
    }
    .btn-primary {
      background: #10b981;
      color: white;
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
export class ShopAddComponent implements OnInit {
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
  categorySearchQuery: string = '';
  filteredCategories: ShopCategory[] = [];
  showDropdown: boolean = false;
  
  shopBoxes: ShopBox[] = [];
  selectedShopBox: ShopBox | null = null;
  boxSearchQuery: string = '';
  filteredBoxes: ShopBox[] = [];
  showBoxDropdown: boolean = false;
  
  submitting = false;
  errorMessage = '';

  constructor(
    private shopService: ShopService,
    private shopCategoryService: ShopCategoryService,
    private shopBoxService: ShopBoxService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadShopBoxes();
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
        // Error loading categories
      }
    });
  }

  onSearchFocus(): void {
    // Show all available categories when focusing on the input
    this.filterCategories();
  }

  filterCategories(): void {
    const query = this.categorySearchQuery.toLowerCase().trim();
    
    if (!query) {
      // Show all available categories when no search query
      this.filteredCategories = this.categories.filter(category => {
        const categoryId = category._id || (category as any).id;
        return !this.selectedCategories.includes(categoryId!);
      });
    } else {
      // Filter by search query
      this.filteredCategories = this.categories.filter(category => {
        const categoryId = category._id || (category as any).id;
        return category.name.toLowerCase().includes(query) && 
               !this.selectedCategories.includes(categoryId!);
      });
    }
    
    this.showDropdown = this.filteredCategories.length > 0;
  }

  onCategorySearchBlur(): void {
    // Delay closing to allow click on dropdown items
    setTimeout(() => {
      this.showDropdown = false;
    }, 200);
  }

  selectCategory(category: ShopCategory): void {
    // Try both _id and id fields
    const categoryId = category._id || (category as any).id;
    
    if (!categoryId) {
      alert('Erreur: Cette catégorie n\'a pas d\'identifiant. Vérifiez les données du backend.');
      return;
    }
    
    if (this.selectedCategories.includes(categoryId)) {
      return;
    }
    
    // Add the category directly
    this.selectedCategories.push(categoryId);
    
    // Reset the search
    this.categorySearchQuery = '';
    this.filteredCategories = [];
    this.showDropdown = false;
  }

  removeCategory(categoryId: string): void {
    if (!categoryId) {
      return;
    }
    
    this.selectedCategories = this.selectedCategories.filter(id => id !== categoryId);
  }

  getSelectedCategoryObjects(): ShopCategory[] {
    return this.categories.filter(category => {
      const categoryId = category._id || (category as any).id;
      return categoryId && this.selectedCategories.includes(categoryId);
    });
  }

  getCategoryId(category: ShopCategory): string {
    const id = category._id || (category as any).id;
    return id || '';
  }

  loadShopBoxes(): void {
    this.shopBoxService.getAllShopBoxes().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data = response.data as any;
          if (data.shopBoxes && Array.isArray(data.shopBoxes)) {
            // Only load free boxes for new shop creation
            this.shopBoxes = data.shopBoxes.filter((box: ShopBox) => box.current_status.status === 'free');
          } else if (Array.isArray(response.data)) {
            // Fallback for direct array response
            this.shopBoxes = (response.data as ShopBox[]).filter((box: ShopBox) => box.current_status.status === 'free');
          }
        }
      },
      error: (err) => {
        // Error loading shop boxes
      }
    });
  }

  onBoxSearchFocus(): void {
    // Show all available boxes when focusing on the input
    this.filterBoxes();
  }

  filterBoxes(): void {
    const query = this.boxSearchQuery.toLowerCase().trim();
    
    if (!query) {
      // Show all available boxes when no search query
      this.filteredBoxes = this.shopBoxes.filter(box => 
        !this.selectedShopBox || box._id !== this.selectedShopBox._id
      );
    } else {
      // Filter by search query
      this.filteredBoxes = this.shopBoxes.filter(box => 
        box.ref.toLowerCase().includes(query) && 
        (!this.selectedShopBox || box._id !== this.selectedShopBox._id)
      );
    }
    
    this.showBoxDropdown = this.filteredBoxes.length > 0;
  }

  selectBox(box: ShopBox): void {
    this.selectedShopBox = box;
    this.boxSearchQuery = '';
    this.filteredBoxes = [];
    this.showBoxDropdown = false;
  }

  onBoxSearchBlur(): void {
    // Delay closing to allow click on dropdown items
    setTimeout(() => {
      this.showBoxDropdown = false;
    }, 200);
  }

  clearBox(): void {
    this.selectedShopBox = null;
    this.boxSearchQuery = '';
    this.filteredBoxes = [];
    this.showBoxDropdown = false;
  }

  onSubmit(): void {
    if (!this.shop.shop_name) {
      this.errorMessage = 'Veuillez remplir le nom de la boutique';
      return;
    }

    if (this.selectedCategories.length === 0) {
      this.errorMessage = 'Veuillez sélectionner au moins une catégorie';
      return;
    }

    // Validate that all category IDs are valid
    const invalidCategories = this.selectedCategories.filter(id => !id || id.trim() === '');
    if (invalidCategories.length > 0) {
      this.errorMessage = 'Certaines catégories ont des identifiants invalides';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    // Prepare shop data - only send category IDs (backend will transform them)
    const shopData = {
      shop_name: this.shop.shop_name.trim(),
      description: this.shop.description?.trim() || '',
      categories: this.selectedCategories.filter(id => id && id.trim()),  // Array of category IDs only
      current_status: {
        status: this.shop.current_status.status
      }
    };

    this.shopService.createShop(shopData).subscribe({
      next: (response) => {
        if (response.success) {
          // If a shop box is selected, assign it to the newly created shop
          const createdShop = Array.isArray(response.data) ? response.data[0] : response.data;
          if (this.selectedShopBox && this.selectedShopBox._id && createdShop && (createdShop as any)._id) {
            const shopId = (createdShop as any)._id;
            const shopName = (createdShop as any).shop_name || this.shop.shop_name;
            
            this.shopBoxService.assignShop(this.selectedShopBox._id, {
              shop_id: shopId,
              shop_name: shopName
            }).subscribe({
              next: (boxResponse) => {
                alert('Boutique créée et box assignée avec succès');
                this.router.navigate(['/admin/shops']);
              },
              error: (boxErr) => {
                // Shop was created but box assignment failed
                alert('Boutique créée mais erreur lors de l\'assignation de la box');
                this.router.navigate(['/admin/shops']);
              }
            });
          } else {
            alert('Boutique créée avec succès');
            this.router.navigate(['/admin/shops']);
          }
        }
        this.submitting = false;
      },
      error: (err) => {
        // Parse validation errors if present
        if (err.error?.errors && Array.isArray(err.error.errors)) {
          const errorMessages = err.error.errors.map((e: any) => 
            `${e.field}: ${e.message}`
          ).join(', ');
          this.errorMessage = `Erreur de validation: ${errorMessages}`;
        } else {
          this.errorMessage = err.error?.message || 'Erreur lors de la création de la boutique';
        }
        
        this.submitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/shops']);
  }
}
