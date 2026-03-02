import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { User, UserFilters } from '../../../../../shared/models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="header">
        <h2>Liste des Utilisateurs</h2>
        <button class="btn-primary" (click)="navigateToAdd()">+ Ajouter un Utilisateur</button>
      </div>

      <!-- Search and Filters -->
      <div class="filters-container">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Rechercher par nom, email..." 
            [(ngModel)]="searchTerm"
            (input)="onSearch()"
          />
        </div>
        <div class="filter-options">
          <select [(ngModel)]="filterUserType" (change)="applyFilters()">
            <option value="">Tous les types</option>
            <option value="admin">Admin</option>
            <option value="shop">Boutique</option>
            <option value="buyer">Acheteur</option>
          </select>
          <select [(ngModel)]="filterStatus" (change)="applyFilters()">
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="suspended">Suspendu</option>
            <option value="blocked">Bloqué</option>
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
              <th>Nom complet</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Type</th>
              <th>Statut</th>
              <th>Date d'inscription</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of paginatedUsers">
              <td>
                <div class="user-name">{{ user.first_name }} {{ user.last_name }}</div>
              </td>
              <td>{{ user.email }}</td>
              <td>{{ user.phone || 'N/A' }}</td>
              <td>
                <span [class]="'badge ' + getUserTypeClass(user.user_type)">
                  {{ getUserTypeLabel(user.user_type) }}
                </span>
              </td>
              <td>
                <span [class]="'badge ' + getStatusClass(user.current_status.status)">
                  {{ getStatusLabel(user.current_status.status) }}
                </span>
              </td>
              <td>{{ formatDate(user.registered_at) }}</td>
              <td class="actions-cell">
                <button class="btn-edit" (click)="editUser(user)" title="Modifier">✎</button>
                <button 
                  class="btn-status" 
                  (click)="toggleUserStatus(user)" 
                  [title]="user.current_status.status === 'active' ? 'Suspendre' : 'Activer'"
                >
                  {{ user.current_status.status === 'active' ? '●' : '○' }}
                </button>
                <button class="btn-delete" (click)="deleteUser(user)" title="Supprimer">✕</button>
              </td>
            </tr>
            <tr *ngIf="paginatedUsers.length === 0">
              <td colspan="7" class="no-data">Aucun utilisateur trouvé</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div *ngIf="filteredUsers.length > 0" class="pagination">
        <div class="pagination-info">
          Affichage {{ startIndex + 1 }} - {{ endIndex }} sur {{ filteredUsers.length }} utilisateurs
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

    <!-- Delete Confirmation Modal -->
    <div *ngIf="showDeleteModal" class="modal-overlay" (click)="cancelDelete()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h3>Confirmer la suppression</h3>
        <p>Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{{ userToDelete?.first_name }} {{ userToDelete?.last_name }}</strong> ?</p>
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
    .user-name {
      font-weight: 600;
      color: #1e293b;
    }
    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
      display: inline-block;
    }
    .badge.buyer { background: #dbeafe; color: #1d4ed8; }
    .badge.shop { background: #fce7f3; color: #be185d; }
    .badge.admin { background: #fef3c7; color: #b45309; }
    .badge.active { background: #d1fae5; color: #059669; }
    .badge.suspended { background: #fed7aa; color: #ea580c; }
    .badge.blocked { background: #fee2e2; color: #dc2626; }
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
    .btn-status:hover { background: #fef3c7; }
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
      .pagination-info {
        order: 1;
      }
      .pagination-controls {
        order: 3;
      }
      .items-per-page {
        order: 2;
      }
    }

    @media (max-width: 480px) {
      th, td {
        padding: 0.5rem;
        font-size: 0.875rem;
      }
      .modal-content {
        padding: 1.5rem;
      }
      .modal-actions {
        flex-direction: column;
      }
    }
  `]
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  paginatedUsers: User[] = [];
  
  loading = false;
  error = '';
  
  searchTerm = '';
  filterUserType = '';
  filterStatus = '';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  startIndex = 0;
  endIndex = 0;

  // Delete modal
  showDeleteModal = false;
  userToDelete: User | null = null;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';

    this.userService.getAllUsers().subscribe({
      next: (response) => {
        this.users = Array.isArray(response.data) ? response.data : [];
        this.filteredUsers = [...this.users];
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.error = 'Erreur lors du chargement des utilisateurs.';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchTerm || 
        user.first_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesType = !this.filterUserType || user.user_type === this.filterUserType;
      const matchesStatus = !this.filterStatus || user.current_status.status === this.filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    this.startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.endIndex = Math.min(this.startIndex + this.itemsPerPage, this.filteredUsers.length);
    this.paginatedUsers = this.filteredUsers.slice(this.startIndex, this.endIndex);
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
    this.router.navigate(['/admin/users/add']);
  }

  editUser(user: User): void {
    this.router.navigate(['/admin/users/edit', user._id]);
  }

  toggleUserStatus(user: User): void {
    const newStatus: 'active' | 'suspended' = user.current_status.status === 'active' ? 'suspended' : 'active';
    const statusData = {
      status: newStatus,
      reason: newStatus === 'suspended' ? 'Suspendu par l\'administrateur' : 'Réactivé par l\'administrateur'
    };

    this.userService.updateUserStatus(user._id!, statusData).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error updating user status:', error);
        alert('Erreur lors de la mise à jour du statut.');
      }
    });
  }

  deleteUser(user: User): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.userToDelete && this.userToDelete._id) {
      this.userService.deleteUser(this.userToDelete._id).subscribe({
        next: () => {
          this.showDeleteModal = false;
          this.userToDelete = null;
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          alert('Erreur lors de la suppression de l\'utilisateur.');
          this.showDeleteModal = false;
        }
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  getUserTypeClass(type: string): string {
    return type;
  }

  getUserTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'buyer': 'Acheteur',
      'shop': 'Boutique',
      'admin': 'Admin'
    };
    return labels[type] || type;
  }

  getStatusClass(status: string): string {
    return status;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'active': 'Actif',
      'suspended': 'Suspendu',
      'blocked': 'Bloqué'
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
