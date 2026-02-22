import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ShopService } from '../../../services/shop.service';
import { Shop } from '../../../../../shared/models/shop.model';

@Component({
  selector: 'app-shop-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="header">
        <h2>Liste des Boutiques</h2>
        <button class="btn-primary" (click)="navigateToAdd()">+ Ajouter une Boutique</button>
      </div>

      <!-- Search and Filters -->
      <div class="filters-container">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Rechercher par nom, description, email..." 
            [(ngModel)]="searchTerm"
            (input)="onSearch()"
          />
        </div>
        <div class="filter-options">
          <select [(ngModel)]="filterStatus" (change)="applyFilters()">
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="validated">Validé</option>
            <option value="active">Actif</option>
            <option value="deactivated">Désactivé</option>
            <option value="suspended">Suspendu</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading">Chargement...</div>

      <!-- Error State -->
      <div *ngIf="error" class="error">{{ error }}</div>

      <!-- Table -->
      <div *ngIf="!loading && !error" class="table-container">
        <table>
          <thead>
            <tr>
              <th>Logo</th>
              <th>Nom</th>
              <th>Mall</th>
              <th>Catégories</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let shop of paginatedShops">
              <td>
                <img 
                  [src]="shop.logo || 'assets/images/default-shop.png'" 
                  alt="Logo"
                  class="shop-logo"
                  (error)="onImageError($event)"
                />
              </td>
              <td>
                <div class="shop-name">{{ shop.shop_name }}</div>
                <div class="shop-id">ID: {{ shop._id }}</div>
              </td>
              <td>
                <div>{{ shop.mall_location || 'N/A' }}</div>
              </td>
              <td>
                <div *ngIf="shop.categories && shop.categories.length > 0">
                  <span *ngFor="let cat of shop.categories" class="category-badge">
                    {{ cat.name }}
                  </span>
                </div>
                <div *ngIf="!shop.categories || shop.categories.length === 0">Aucune</div>
              </td>
              <td>
                <span [class]="getStatusClass(shop.current_status.status)">
                  {{ getStatusLabel(shop.current_status.status) }}
                </span>
              </td>
              <td>
                <button class="btn-view" (click)="viewShop(shop)" title="Voir">👁️</button>
                <button class="btn-edit" (click)="editShop(shop)" title="Modifier">✏️</button>
                <button class="btn-delete" (click)="deleteShop(shop)" title="Supprimer">🗑️</button>
              </td>
            </tr>
            <tr *ngIf="paginatedShops.length === 0">
              <td colspan="6" class="no-data">Aucune boutique trouvée</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div *ngIf="filteredShops.length > 0" class="pagination">
        <div class="pagination-info">
          Affichage {{ startIndex + 1 }} - {{ endIndex }} sur {{ filteredShops.length }} boutiques
        </div>
        <div class="pagination-controls">
          <button 
            (click)="previousPage()" 
            [disabled]="currentPage === 1"
            class="btn-pagination"
          >
            ‹ Précédent
          </button>
          <span class="page-number">Page {{ currentPage }} / {{ totalPages }}</span>
          <button 
            (click)="nextPage()" 
            [disabled]="currentPage === totalPages"
            class="btn-pagination"
          >
            Suivant ›
          </button>
        </div>
        <div class="items-per-page">
          <label>Éléments par page:</label>
          <select [(ngModel)]="itemsPerPage" (change)="onItemsPerPageChange()">
            <option [value]="5">5</option>
            <option [value]="10">10</option>
            <option [value]="25">25</option>
            <option [value]="50">50</option>
          </select>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    h2 {
      margin: 0;
      color: #1e293b;
    }
    .btn-primary {
      background: #10b981;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary:hover {
      background: #059669;
    }
    .filters-container {
      background: white;
      padding: 1rem;
      border-radius: 12px;
      margin-bottom: 1rem;
      display: flex;
      gap: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .search-box {
      flex: 1;
    }
    .search-box input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      box-sizing: border-box;
    }
    .search-box input:focus {
      outline: none;
      border-color: #10b981;
    }
    .filter-options {
      display: flex;
      gap: 0.5rem;
    }
    .filter-options select {
      padding: 0.75rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      background: white;
      cursor: pointer;
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
    .table-container {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    th {
      background: #f8fafc;
      font-weight: 600;
      color: #64748b;
      font-size: 0.875rem;
      text-transform: uppercase;
    }
    .shop-logo {
      width: 50px;
      height: 50px;
      border-radius: 8px;
      object-fit: cover;
    }
    .shop-name {
      font-weight: 600;
      color: #1e293b;
    }
    .shop-id {
      font-size: 0.75rem;
      color: #64748b;
    }
    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
      display: inline-block;
    }
    .status-pending {
      background: #fef3c7;
      color: #92400e;
    }
    .status-validated {
      background: #dbeafe;
      color: #1e40af;
    }
    .status-active {
      background: #d1fae5;
      color: #065f46;
    }
    .status-deactivated {
      background: #fee2e2;
      color: #991b1b;
    }
    .status-suspended {
      background: #f3f4f6;
      color: #374151;
    }
    .category-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-size: 0.75rem;
      background: #e0e7ff;
      color: #3730a3;
      margin-right: 0.25rem;
      display: inline-block;
    }
    }
    .badge.active { background: #d1fae5; color: #059669; }
    .badge.inactive { background: #fee2e2; color: #dc2626; }
    .badge.verified { background: #dbeafe; color: #2563eb; }
    .badge.unverified { background: #fef3c7; color: #b45309; }
    button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      margin: 0 0.25rem;
      border-radius: 6px;
      transition: background 0.2s;
    }
    .btn-view:hover { background: #f0f9ff; }
    .btn-edit:hover { background: #e0f2fe; }
    .btn-delete:hover { background: #fee2e2; }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .no-data {
      text-align: center;
      color: #64748b;
      padding: 2rem !important;
    }
    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
      padding: 1rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .pagination-info {
      color: #64748b;
      font-size: 0.875rem;
    }
    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .btn-pagination {
      background: white;
      border: 2px solid #e2e8f0;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: 600;
      color: #64748b;
    }
    .btn-pagination:not(:disabled):hover {
      background: #f8fafc;
      border-color: #10b981;
      color: #10b981;
    }
    .page-number {
      font-weight: 600;
      color: #1e293b;
    }
    .items-per-page {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .items-per-page label {
      font-size: 0.875rem;
      color: #64748b;
    }
    .items-per-page select {
      padding: 0.5rem;
      border: 2px solid #e2e8f0;
      border-radius: 6px;
      background: white;
      cursor: pointer;
    }
  `]
})
export class ShopListComponent implements OnInit {
  shops: Shop[] = [];
  filteredShops: Shop[] = [];
  paginatedShops: Shop[] = [];
  loading = false;
  error = '';

  // Search and Filter
  searchTerm = '';
  filterStatus = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  startIndex = 0;
  endIndex = 0;

  constructor(
    private shopService: ShopService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadShops();
  }

  loadShops(): void {
    this.loading = true;
    this.error = '';

    this.shopService.getAllShops().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.shops = response.data;
          this.applyFilters();
        } else {
          this.error = 'Format de réponse invalide';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des boutiques';
        console.error('Error loading shops:', err);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.shops];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(shop => 
        shop.shop_name?.toLowerCase().includes(term) ||
        shop.description?.toLowerCase().includes(term) ||
        shop.mall_location?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (this.filterStatus) {
      filtered = filtered.filter(shop => shop.current_status.status === this.filterStatus);
    }

    this.filteredShops = filtered;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredShops.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
    
    this.startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.endIndex = Math.min(this.startIndex + this.itemsPerPage, this.filteredShops.length);
    
    this.paginatedShops = this.filteredShops.slice(this.startIndex, this.endIndex);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  navigateToAdd(): void {
    this.router.navigate(['/admin/shops/add']);
  }

  viewShop(shop: Shop): void {
    this.router.navigate(['/admin/shops', shop._id]);
  }

  editShop(shop: Shop): void {
    this.router.navigate(['/admin/shops', shop._id, 'edit']);
  }

  deleteShop(shop: Shop): void {
    if (!shop._id) return;

    if (confirm(`Êtes-vous sûr de vouloir supprimer la boutique "${shop.shop_name}" ?`)) {
      this.shopService.deleteShop(shop._id).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Boutique supprimée avec succès');
            this.loadShops();
          }
        },
        error: (err) => {
          alert('Erreur lors de la suppression de la boutique');
          console.error('Error deleting shop:', err);
        }
      });
    }
  }

  getStatusClass(status: string): string {
    const baseClass = 'badge status-';
    return baseClass + status;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'En attente',
      'validated': 'Validé',
      'active': 'Actif',
      'deactivated': 'Désactivé',
      'suspended': 'Suspendu'
    };
    return labels[status] || status;
  }

  onImageError(event: any): void {
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNFMkU4RjAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2NDc0OEIiPjwvdGV4dD48L3N2Zz4=';
  }
}
