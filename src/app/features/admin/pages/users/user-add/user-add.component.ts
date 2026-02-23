import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { ShopService } from '../../../services/shop.service';
import { CreateUserDto } from '../../../../../shared/models/user.model';
import { Shop } from '../../../../../shared/models/shop.model';

@Component({
  selector: 'app-user-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="header">
        <h2>Ajouter un Utilisateur</h2>
      </div>

      <div class="form-container">
        <form (ngSubmit)="onSubmit()">
          <!-- Basic Info -->
          <div class="form-section">
            <h3>Informations de base</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label>Prénom *</label>
                <input 
                  type="text" 
                  [(ngModel)]="user.first_name" 
                  name="first_name" 
                  placeholder="John"
                  required
                />
              </div>
              <div class="form-group">
                <label>Nom *</label>
                <input 
                  type="text" 
                  [(ngModel)]="user.last_name" 
                  name="last_name" 
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label>Email *</label>
              <input 
                type="email" 
                [(ngModel)]="user.email" 
                name="email" 
                placeholder="email@example.com"
                required
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Téléphone</label>
                <input 
                  type="tel" 
                  [(ngModel)]="user.phone" 
                  name="phone" 
                  placeholder="+261 34 00 000 00"
                />
              </div>
              <div class="form-group">
                <label>Type d'utilisateur *</label>
                <select [(ngModel)]="user.user_type" name="user_type" required>
                  <option value="buyer">Acheteur</option>
                  <option value="shop">Boutique</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Mot de passe *</label>
              <input 
                type="password" 
                [(ngModel)]="user.password" 
                name="password" 
                placeholder="••••••••"
                minlength="6"
                required
              />
              <small class="help-text">Le mot de passe doit contenir au moins 6 caractères</small>
            </div>
          </div>

          <!-- Shop Selection (only for shop user type) -->
          <div *ngIf="user.user_type === 'shop'" class="form-section">
            <h3>Assignation à une boutique</h3>
            
            <div class="form-group">
              <label>Rechercher et sélectionner une boutique *</label>
              <input 
                type="text" 
                [(ngModel)]="shopSearchQuery" 
                name="shopSearch"
                placeholder="Rechercher une boutique..."
                (input)="filterShops()"
                (focus)="showShopDropdown = true"
              />
            </div>

            <!-- Shop Search Results -->
            <div *ngIf="showShopDropdown && filteredShops.length > 0" class="search-results">
              <div 
                *ngFor="let shop of filteredShops" 
                class="search-result-item"
                (click)="selectShop(shop)"
              >
                <div class="shop-info">
                  <span class="shop-name">{{ shop.shop_name }}</span>
                  <span class="shop-location">{{ shop.mall_location || 'Aucun mall' }}</span>
                </div>
                <span class="select-hint">Sélectionner</span>
              </div>
            </div>

            <!-- No Results Message -->
            <div *ngIf="showShopDropdown && shopSearchQuery && filteredShops.length === 0 && shops.length > 0" class="no-results">
              <p>Aucune boutique trouvée</p>
            </div>

            <!-- Selected Shop -->
            <div *ngIf="selectedShop" class="selected-shop">
              <div class="shop-card">
                <div class="shop-details">
                  <div class="shop-name">{{ selectedShop.shop_name }}</div>
                  <div class="shop-meta">{{ selectedShop.mall_location || 'Aucun mall' }}</div>
                </div>
                <button 
                  type="button" 
                  class="btn-remove" 
                  (click)="removeShop()"
                  title="Retirer"
                >
                  ×
                </button>
              </div>
            </div>

            <!-- Role Selection -->
            <div *ngIf="selectedShop" class="form-group">
              <label>Rôle dans la boutique *</label>
              <select [(ngModel)]="shopRole" name="shopRole" required>
                <option value="MANAGER_SHOP">Manager de boutique</option>
                <option value="STAFF">Personnel</option>
              </select>
            </div>
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <!-- Success Message -->
          <div *ngIf="successMessage" class="success-message">
            {{ successMessage }}
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="onCancel()">Annuler</button>
            <button type="submit" class="btn-primary" [disabled]="submitting">
              {{ submitting ? 'Création...' : 'Créer l\'utilisateur' }}
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
    .form-container {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .form-section {
      margin-bottom: 2rem;
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
    input, select {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      box-sizing: border-box;
    }
    input:focus, select:focus {
      outline: none;
      border-color: #10b981;
    }
    .help-text {
      display: block;
      margin-top: 0.25rem;
      font-size: 0.75rem;
      color: #94a3b8;
    }
    .error-message {
      padding: 1rem;
      background-color: #fee2e2;
      color: #dc2626;
      border-radius: 8px;
      margin-bottom: 1rem;
      border-left: 4px solid #dc2626;
    }
    .success-message {
      padding: 1rem;
      background-color: #d1fae5;
      color: #059669;
      border-radius: 8px;
      margin-bottom: 1rem;
      border-left: 4px solid #059669;
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
    .btn-primary {
      background: #10b981;
      color: white;
      border: none;
    }
    .btn-primary:hover:not(:disabled) {
      background: #059669;
    }
    .btn-primary:disabled {
      background: #6ee7b7;
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
    .search-results {
      position: relative;
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      margin-top: 0.5rem;
      max-height: 300px;
      overflow-y: auto;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      z-index: 10;
    }
    .search-result-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      cursor: pointer;
      border-bottom: 1px solid #e2e8f0;
      transition: background 0.2s;
    }
    .search-result-item:last-child {
      border-bottom: none;
    }
    .search-result-item:hover {
      background: #f8fafc;
    }
    .shop-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .shop-name {
      font-weight: 600;
      color: #1e293b;
    }
    .shop-location {
      font-size: 0.875rem;
      color: #64748b;
    }
    .select-hint {
      font-size: 0.75rem;
      color: #10b981;
      font-weight: 500;
    }
    .no-results {
      padding: 1rem;
      text-align: center;
      color: #94a3b8;
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      margin-top: 0.5rem;
    }
    .no-results p {
      margin: 0;
    }
    .selected-shop {
      margin-top: 1rem;
    }
    .shop-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f0fdfa;
      border: 2px solid #10b981;
      border-radius: 8px;
    }
    .shop-details {
      flex: 1;
    }
    .shop-card .shop-name {
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 0.25rem;
    }
    .shop-meta {
      font-size: 0.875rem;
      color: #64748b;
    }
    .btn-remove {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fee2e2;
      color: #dc2626;
      border: none;
      border-radius: 6px;
      font-size: 1.5rem;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
      padding: 0;
    }
    .btn-remove:hover {
      background: #fecaca;
    }
  `]
})
export class UserAddComponent implements OnInit {
  user: CreateUserDto = {
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    user_type: 'buyer'
  };

  // Shop selection
  shops: Shop[] = [];
  filteredShops: Shop[] = [];
  selectedShop: Shop | null = null;
  shopSearchQuery = '';
  showShopDropdown = false;
  shopRole: 'MANAGER_SHOP' | 'STAFF' = 'STAFF';

  submitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private userService: UserService,
    private shopService: ShopService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadShops();
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.form-group') && !target.closest('.search-results')) {
        this.showShopDropdown = false;
      }
    });
  }

  loadShops(): void {
    this.shopService.getAllShops().subscribe({
      next: (response) => {
        this.shops = Array.isArray(response.data) ? response.data : [];
        this.filteredShops = [...this.shops];
      },
      error: (error) => {
        console.error('Error loading shops:', error);
      }
    });
  }

  filterShops(): void {
    const query = this.shopSearchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredShops = [...this.shops];
    } else {
      this.filteredShops = this.shops.filter(shop => 
        shop.shop_name.toLowerCase().includes(query) ||
        (shop.mall_location && shop.mall_location.toLowerCase().includes(query))
      );
    }
    this.showShopDropdown = true;
  }

  selectShop(shop: Shop): void {
    this.selectedShop = shop;
    this.shopSearchQuery = shop.shop_name;
    this.showShopDropdown = false;
  }

  removeShop(): void {
    this.selectedShop = null;
    this.shopSearchQuery = '';
    this.filteredShops = [...this.shops];
  }

  onSubmit(): void {
    if (this.submitting) return;

    // Reset messages
    this.errorMessage = '';
    this.successMessage = '';

    // Validate required fields
    if (!this.user.email || !this.user.password || !this.user.first_name || !this.user.last_name) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    // Validate shop selection if user type is shop
    if (this.user.user_type === 'shop' && !this.selectedShop) {
      this.errorMessage = 'Veuillez sélectionner une boutique pour un utilisateur de type Boutique.';
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.user.email)) {
      this.errorMessage = 'Veuillez entrer une adresse email valide.';
      return;
    }

    // Validate password length
    if (this.user.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }

    this.submitting = true;

    // Remove empty phone if not provided
    const userData = { ...this.user };
    if (!userData.phone) {
      delete userData.phone;
    }

    this.userService.createUser(userData).subscribe({
      next: (response) => {
        // If user type is shop and a shop is selected, assign to shop
        if (this.user.user_type === 'shop' && this.selectedShop && this.selectedShop._id) {
          const createdUserId = Array.isArray(response.data) ? response.data[0]?._id : response.data?._id;
          
          if (createdUserId) {
            this.userService.assignToShop(createdUserId, this.selectedShop._id, this.shopRole).subscribe({
              next: () => {
                this.successMessage = 'Utilisateur créé et assigné à la boutique avec succès !';
                this.submitting = false;
                
                // Redirect after 1.5 seconds
                setTimeout(() => {
                  this.router.navigate(['/admin/users']);
                }, 1500);
              },
              error: (error) => {
                console.error('Error assigning user to shop:', error);
                this.errorMessage = 'Utilisateur créé mais erreur lors de l\'assignation à la boutique.';
                this.submitting = false;
              }
            });
          } else {
            this.successMessage = 'Utilisateur créé avec succès !';
            this.submitting = false;
            setTimeout(() => {
              this.router.navigate(['/admin/users']);
            }, 1500);
          }
        } else {
          this.successMessage = 'Utilisateur créé avec succès !';
          this.submitting = false;
          
          // Redirect after 1.5 seconds
          setTimeout(() => {
            this.router.navigate(['/admin/users']);
          }, 1500);
        }
      },
      error: (error) => {
        console.error('Error creating user:', error);
        this.errorMessage = error.error?.message || 'Une erreur est survenue lors de la création de l\'utilisateur.';
        this.submitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/users']);
  }
}
