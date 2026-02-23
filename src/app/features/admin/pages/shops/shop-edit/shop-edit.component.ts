import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ShopService } from '../../../services/shop.service';
import { ShopCategoryService } from '../../../services/shop-category.service';
import { ShopBoxService } from '../../../services/shop-box.service';
import { Shop, ShopCategory } from '../../../../../shared/models/shop.model';
import { ShopBox } from '../../../../../shared/models/shop-box.model';

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
                <span class="box-status-badge">{{ selectedShopBox.current_status.status === 'free' ? 'Libre' : selectedShopBox.current_status.status }}</span>
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
            
            <!-- Current Box (if already assigned) -->
            <div *ngIf="currentAssignedBox && !selectedShopBox" class="current-box-display">
              <h4>Box actuelle</h4>
              <div class="current-box-item">
                <span class="box-ref">{{ currentAssignedBox.ref }}</span>
                <span class="box-status-badge occupied">Occupée</span>
                <button 
                  type="button" 
                  class="btn-unassign" 
                  (click)="unassignCurrentBox()"
                  title="Désassigner cette box"
                >
                  Désassigner
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
    }    .category-search-container {
      position: relative;
    }
    .box-search-container {
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
    .selected-box-display, .current-box-display {
      margin-top: 1.5rem;
      padding: 1rem;
      background: #f0f9ff;
      border-radius: 8px;
      border: 2px solid #bae6fd;
    }
    .current-box-display {
      background: #f1f5f9;
      border-color: #cbd5e1;
    }
    .selected-box-display h4, .current-box-display h4 {
      margin: 0 0 1rem 0;
      color: #334155;
      font-size: 0.9rem;
      font-weight: 600;
    }
    .selected-box-item, .current-box-item {
      display: flex;
      align-items: center;
      padding: 0.75rem;
      background: white;
      border: 1px solid #bae6fd;
      border-radius: 6px;
      gap: 0.75rem;
    }
    .current-box-item {
      border-color: #cbd5e1;
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
    .box-status-badge.occupied {
      background: #3b82f6;
    }
    .btn-remove, .btn-unassign {
      background: #ef4444;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
      font-size: 0.875rem;
      font-weight: 600;
    }
    .btn-remove {
      width: 24px;
      height: 24px;
      padding: 0;
      font-size: 1.25rem;
    }
    .btn-remove:hover, .btn-unassign:hover {
      background: #dc2626;
    }
    .btn-remove span {
      display: block;
      margin-top: -2px;
    }    input[type="checkbox"] {
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
  categorySearchQuery: string = '';
  filteredCategories: ShopCategory[] = [];
  showDropdown: boolean = false;
  
  shopBoxes: ShopBox[] = [];
  selectedShopBox: ShopBox | null = null;
  currentAssignedBox: ShopBox | null = null;
  boxSearchQuery: string = '';
  filteredBoxes: ShopBox[] = [];
  showBoxDropdown: boolean = false;
  
  loading = false;
  error = '';
  submitting = false;
  errorMessage = '';

  constructor(
    private shopService: ShopService,
    private shopCategoryService: ShopCategoryService,
    private shopBoxService: ShopBoxService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.shopId = this.route.snapshot.params['id'];
    if (this.shopId) {
      this.loadShop();
      this.loadCategories();
      this.loadShopBoxes();
      this.loadCurrentAssignedBox();
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
            // Categories can be:
            // 1. Array of strings (IDs directly)
            // 2. Array of objects with category_id field
            this.selectedCategories = this.shop.categories.map(cat => {
              if (typeof cat === 'string') {
                return cat; // Direct ID
              } else if (typeof cat === 'object' && cat !== null) {
                // Object with category_id field
                const categoryId = (cat as any).category_id;
                if (typeof categoryId === 'string') {
                  return categoryId;
                } else if (categoryId && typeof categoryId === 'object') {
                  return categoryId._id || categoryId.id;
                }
              }
              return null;
            }).filter(id => id) as string[];
          }
        } else {
          this.error = 'Impossible de charger la boutique';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de la boutique';
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
        // Error loading categories
      }
    });
  }

  loadShopBoxes(): void {
    this.shopBoxService.getAllShopBoxes().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data = response.data as any;
          if (data.shopBoxes && Array.isArray(data.shopBoxes)) {
            // Only load free boxes for changing assignment
            this.shopBoxes = data.shopBoxes.filter((box: ShopBox) => box.current_status.status === 'free');
          }
        }
      },
      error: (err) => {
        // Error loading shop boxes
      }
    });
  }

  loadCurrentAssignedBox(): void {
    // Load current assigned box for this shop
    this.shopBoxService.getAllShopBoxes({ shop_id: this.shopId }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data = response.data as any;
          
          let boxes: ShopBox[] = [];
          
          // Handle different response structures
          if (Array.isArray(data)) {
            // Data is directly an array
            boxes = data;
          } else if (data.shopBoxes && Array.isArray(data.shopBoxes)) {
            // Data is wrapped in shopBoxes property
            boxes = data.shopBoxes;
          }
          
          if (boxes.length > 0) {
            // Find a box that's assigned to this shop
            const assignedBox = boxes.find((box: ShopBox) => 
              box.current_assignment && 
              box.current_assignment.shop_id === this.shopId
            );
            
            if (assignedBox) {
              this.currentAssignedBox = assignedBox;
            } else if (boxes.length === 1) {
              // If filter returned one box, it's the assigned one
              this.currentAssignedBox = boxes[0];
            }
          }
        }
      },
      error: (err) => {
        // Error loading current box
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
    const categoryId = category._id || (category as any).id;
    
    if (!categoryId) {
      return;
    }
    
    if (this.selectedCategories.includes(categoryId)) {
      return;
    }
    
    this.selectedCategories.push(categoryId);
    this.categorySearchQuery = '';
    this.filteredCategories = [];
    this.showDropdown = false;
  }

  removeCategory(categoryId: string): void {
    if (!categoryId) return;
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

  unassignCurrentBox(): void {
    if (!this.currentAssignedBox || !this.currentAssignedBox._id) return;
    
    if (confirm(`Êtes-vous sûr de vouloir désassigner la box ${this.currentAssignedBox.ref} ?`)) {
      this.shopBoxService.unassignShop(this.currentAssignedBox._id).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Box désassignée avec succès');
            this.currentAssignedBox = null;
            this.loadShopBoxes(); // Reload available boxes
          }
        },
        error: (err) => {
          alert('Erreur lors de la désassignation de la box');
        }
      });
    }
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
          // If a new shop box is selected, assign it
          if (this.selectedShopBox && this.selectedShopBox._id) {
            this.shopBoxService.assignShop(this.selectedShopBox._id, {
              shop_id: this.shopId,
              shop_name: this.shop.shop_name
            }).subscribe({
              next: (boxResponse) => {
                alert('Boutique mise à jour et box assignée avec succès');
                this.router.navigate(['/admin/shops']);
              },
              error: (boxErr) => {
                alert('Boutique mise à jour mais erreur lors de l\'assignation de la box');
                this.router.navigate(['/admin/shops']);
              }
            });
          } else {
            alert('Boutique mise à jour avec succès');
            this.router.navigate(['/admin/shops']);
          }
        }
        this.submitting = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la mise à jour de la boutique';
        this.submitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/shops']);
  }
}
