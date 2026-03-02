import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ShopBoxService } from '../../../services/shop-box.service';
import { ShopService } from '../../../services/shop.service';
import { ShopBox, AssignShopDto } from '../../../../../shared/models/shop-box.model';
import { Shop } from '../../../../../shared/models/shop.model';

@Component({
  selector: 'app-shop-box-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="header">
        <h2>Liste des Boxes de Boutique</h2>
        <button class="btn-primary" (click)="navigateToAdd()">+ Ajouter un Box</button>
      </div>

      <!-- Search and Filters -->
      <div class="filters-container">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Rechercher par référence..." 
            [(ngModel)]="searchTerm"
            (input)="onSearch()"
          />
        </div>
        <div class="filter-options">
          <select [(ngModel)]="filterStatus" (change)="applyFilters()">
            <option value="">Tous les statuts</option>
            <option value="free">Libre</option>
            <option value="occupied">Occupé</option>
            <option value="under_repair">En réparation</option>
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
              <th>Référence</th>
              <th>Statut</th>
              <th>Boutique assignée</th>
              <th>Date d'assignation</th>
              <th>Date de création</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let box of paginatedBoxes">
              <td>
                <div class="box-ref">{{ box.ref }}</div>
              </td>
              <td>
                <span [class]="'badge ' + getStatusClass(box.current_status.status)">
                  {{ getStatusLabel(box.current_status.status) }}
                </span>
              </td>
              <td>
                <div *ngIf="box.current_assignment?.shop_name">
                  {{ box.current_assignment?.shop_name }}
                </div>
                <div *ngIf="!box.current_assignment?.shop_name" class="text-muted">
                  Non assigné
                </div>
              </td>
              <td>
                <div *ngIf="box.current_assignment?.assigned_at">
                  {{ formatDate(box.current_assignment?.assigned_at) }}
                </div>
                <div *ngIf="!box.current_assignment?.assigned_at" class="text-muted">
                  -
                </div>
              </td>
              <td>{{ formatDate(box.created_at) }}</td>
              <td class="actions-cell">
                <button class="btn-edit" (click)="editBox(box)" title="Modifier">✏️</button>
                <button 
                  *ngIf="!box.current_assignment?.shop_id"
                  class="btn-assign" 
                  (click)="openAssignModal(box)" 
                  title="Assigner une boutique"
                >
                  🏪
                </button>
                <button 
                  *ngIf="box.current_assignment?.shop_id"
                  class="btn-unassign" 
                  (click)="unassignShop(box)" 
                  title="Retirer l'assignation"
                >
                  🔓
                </button>
                <button class="btn-delete" (click)="deleteBox(box)" title="Supprimer">🗑️</button>
              </td>
            </tr>
            <tr *ngIf="paginatedBoxes.length === 0">
              <td colspan="6" class="no-data">Aucun box trouvé</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div *ngIf="filteredBoxes.length > 0" class="pagination">
        <div class="pagination-info">
          Affichage {{ startIndex + 1 }} - {{ endIndex }} sur {{ filteredBoxes.length }} boxes
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

    <!-- Assign Shop Modal -->
    <div *ngIf="showAssignModal" class="modal-overlay" (click)="cancelAssign()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h3>Assigner une boutique</h3>
        <p>Box: <strong>{{ boxToAssign?.ref }}</strong></p>
        
        <div class="form-group">
          <label>Rechercher une boutique</label>
          <input 
            type="text" 
            [(ngModel)]="shopSearchQuery" 
            (input)="filterShops()"
            placeholder="Nom de la boutique..."
          />
        </div>

        <div *ngIf="filteredShops.length > 0" class="shop-list">
          <div 
            *ngFor="let shop of filteredShops" 
            class="shop-item"
            (click)="selectShop(shop)"
            [class.selected]="selectedShop?._id === shop._id"
          >
            <div class="shop-info">
              <div class="shop-name">{{ shop.shop_name }}</div>
              <div class="shop-location">{{ shop.mall_location || 'Aucun mall' }}</div>
            </div>
          </div>
        </div>

        <div *ngIf="shopSearchQuery && filteredShops.length === 0" class="no-results">
          Aucune boutique trouvée
        </div>

        <div class="modal-actions">
          <button class="btn-secondary" (click)="cancelAssign()">Annuler</button>
          <button 
            class="btn-primary" 
            (click)="confirmAssign()"
            [disabled]="!selectedShop"
          >
            Assigner
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div *ngIf="showDeleteModal" class="modal-overlay" (click)="cancelDelete()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h3>Confirmer la suppression</h3>
        <p>Êtes-vous sûr de vouloir supprimer le box <strong>{{ boxToDelete?.ref }}</strong> ?</p>
        <p class="warning">Cette action est irréversible.</p>
        <div class="modal-actions">
          <button class="btn-secondary" (click)="cancelDelete()">Annuler</button>
          <button class="btn-danger" (click)="confirmDelete()">Supprimer</button>
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
    .btn-primary:hover:not(:disabled) {
      background: #059669;
    }
    .btn-primary:disabled {
      background: #6ee7b7;
      cursor: not-allowed;
      opacity: 0.6;
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
      min-width: 150px;
    }
    .loading, .error {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      margin: 1rem 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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
    .box-ref {
      font-weight: 600;
      color: #1e293b;
    }
    .text-muted {
      color: #94a3b8;
      font-style: italic;
    }
    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
      display: inline-block;
    }
    .badge.free { background: #d1fae5; color: #059669; }
    .badge.occupied { background: #dbeafe; color: #1d4ed8; }
    .badge.under_repair { background: #fed7aa; color: #ea580c; }
    .actions-cell {
      white-space: nowrap;
    }
    button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      margin: 0 0.25rem;
      border-radius: 6px;
      transition: background 0.2s;
      font-size: 1rem;
    }
    .btn-edit:hover { background: #e0f2fe; }
    .btn-assign:hover { background: #dbeafe; }
    .btn-unassign:hover { background: #fed7aa; }
    .btn-delete:hover { background: #fee2e2; }
    .no-data {
      text-align: center;
      color: #94a3b8;
      padding: 2rem !important;
    }
    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: white;
      border-radius: 12px;
      margin-top: 1rem;
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
      padding: 0.5rem 1rem;
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-pagination:hover:not(:disabled) {
      background: #f8fafc;
      border-color: #10b981;
    }
    .btn-pagination:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .page-number {
      font-weight: 600;
      color: #334155;
    }
    .items-per-page {
      display: flex;
      align-items: center;
      gap: 0.5rem;
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
    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      max-height: 80vh;
      overflow-y: auto;
    }
    .modal-content h3 {
      margin: 0 0 1rem 0;
      color: #1e293b;
    }
    .modal-content p {
      margin: 0.5rem 0;
      color: #64748b;
    }
    .modal-content .warning {
      color: #dc2626;
      font-weight: 500;
      margin-top: 1rem;
    }
    .form-group {
      margin: 1rem 0;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #64748b;
      font-size: 0.875rem;
    }
    .form-group input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      box-sizing: border-box;
    }
    .form-group input:focus {
      outline: none;
      border-color: #10b981;
    }
    .shop-list {
      max-height: 300px;
      overflow-y: auto;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      margin-top: 0.5rem;
    }
    .shop-item {
      padding: 1rem;
      cursor: pointer;
      border-bottom: 1px solid #e2e8f0;
      transition: background 0.2s;
    }
    .shop-item:last-child {
      border-bottom: none;
    }
    .shop-item:hover {
      background: #f8fafc;
    }
    .shop-item.selected {
      background: #d1fae5;
      border-left: 4px solid #10b981;
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
    .no-results {
      padding: 1rem;
      text-align: center;
      color: #94a3b8;
      font-style: italic;
    }
    .modal-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    .btn-secondary {
      flex: 1;
      padding: 0.75rem;
      background: white;
      color: #64748b;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-secondary:hover {
      background: #f8fafc;
    }
    .btn-danger {
      flex: 1;
      padding: 0.75rem;
      background: #dc2626;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-danger:hover {
      background: #b91c1c;
    }

    /* Responsive Styles */
    @media (max-width: 1024px) {
      .filters-container {
        flex-direction: column;
      }
      .filter-options {
        flex-direction: column;
      }
      .filter-options select {
        width: 100%;
      }
    }

    @media (max-width: 768px) {
      .page-container {
        padding: 1rem;
      }
      .header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }
      .btn-primary {
        width: 100%;
      }
      .table-container {
        overflow-x: auto;
      }
      table {
        min-width: 700px;
      }
      .pagination {
        flex-direction: column;
        gap: 1rem;
      }
      .modal-content {
        width: 95%;
        padding: 1.5rem;
      }
    }

    @media (max-width: 480px) {
      th, td {
        padding: 0.5rem;
        font-size: 0.875rem;
      }
      .modal-actions {
        flex-direction: column;
      }
    }
  `]
})
export class ShopBoxListComponent implements OnInit {
  boxes: ShopBox[] = [];
  filteredBoxes: ShopBox[] = [];
  paginatedBoxes: ShopBox[] = [];
  
  loading = false;
  error = '';
  
  searchTerm = '';
  filterStatus = '';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  startIndex = 0;
  endIndex = 0;

  // Delete modal
  showDeleteModal = false;
  boxToDelete: ShopBox | null = null;

  // Assign modal
  showAssignModal = false;
  boxToAssign: ShopBox | null = null;
  shops: Shop[] = [];
  filteredShops: Shop[] = [];
  selectedShop: Shop | null = null;
  shopSearchQuery = '';

  constructor(
    private shopBoxService: ShopBoxService,
    private shopService: ShopService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBoxes();
    this.loadShops();
  }

  loadBoxes(): void {
    this.loading = true;
    this.error = '';

    this.shopBoxService.getAllShopBoxes().subscribe({
      next: (response) => {
        this.boxes = Array.isArray(response.data) ? response.data : [];
        this.filteredBoxes = [...this.boxes];
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading shop boxes:', error);
        this.error = 'Erreur lors du chargement des boxes.';
        this.loading = false;
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

  onSearch(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredBoxes = this.boxes.filter(box => {
      const matchesSearch = !this.searchTerm || 
        box.ref.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.filterStatus || box.current_status.status === this.filterStatus;
      
      return matchesSearch && matchesStatus;
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredBoxes.length / this.itemsPerPage);
    this.startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.endIndex = Math.min(this.startIndex + this.itemsPerPage, this.filteredBoxes.length);
    this.paginatedBoxes = this.filteredBoxes.slice(this.startIndex, this.endIndex);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  navigateToAdd(): void {
    this.router.navigate(['/admin/shop-boxes/add']);
  }

  editBox(box: ShopBox): void {
    this.router.navigate(['/admin/shop-boxes/edit', box._id]);
  }

  openAssignModal(box: ShopBox): void {
    this.boxToAssign = box;
    this.showAssignModal = true;
    this.shopSearchQuery = '';
    this.selectedShop = null;
    this.filteredShops = [...this.shops];
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
  }

  selectShop(shop: Shop): void {
    this.selectedShop = shop;
  }

  confirmAssign(): void {
    if (this.boxToAssign && this.selectedShop && this.selectedShop._id) {
      const assignData: AssignShopDto = {
        shop_id: this.selectedShop._id,
        shop_name: this.selectedShop.shop_name
      };

      this.shopBoxService.assignShop(this.boxToAssign._id!, assignData).subscribe({
        next: () => {
          this.showAssignModal = false;
          this.boxToAssign = null;
          this.selectedShop = null;
          this.loadBoxes();
        },
        error: (error) => {
          console.error('Error assigning shop:', error);
          alert('Erreur lors de l\'assignation de la boutique.');
        }
      });
    }
  }

  cancelAssign(): void {
    this.showAssignModal = false;
    this.boxToAssign = null;
    this.selectedShop = null;
    this.shopSearchQuery = '';
  }

  unassignShop(box: ShopBox): void {
    if (confirm(`Retirer l'assignation de la boutique ${box.current_assignment?.shop_name} ?`)) {
      this.shopBoxService.unassignShop(box._id!).subscribe({
        next: () => {
          this.loadBoxes();
        },
        error: (error) => {
          console.error('Error unassigning shop:', error);
          alert('Erreur lors du retrait de l\'assignation.');
        }
      });
    }
  }

  deleteBox(box: ShopBox): void {
    this.boxToDelete = box;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.boxToDelete && this.boxToDelete._id) {
      this.shopBoxService.deleteShopBox(this.boxToDelete._id).subscribe({
        next: () => {
          this.showDeleteModal = false;
          this.boxToDelete = null;
          this.loadBoxes();
        },
        error: (error) => {
          console.error('Error deleting shop box:', error);
          alert('Erreur lors de la suppression du box.');
          this.showDeleteModal = false;
        }
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.boxToDelete = null;
  }

  getStatusClass(status: string): string {
    return status;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'free': 'Libre',
      'occupied': 'Occupé',
      'under_repair': 'En réparation'
    };
    return labels[status] || status;
  }

  formatDate(date: any): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
