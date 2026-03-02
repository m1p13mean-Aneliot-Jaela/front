import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ShopCategoryService } from '../../../services/shop-category.service';
import { ShopCategory } from '../../../../../shared/models/shop.model';

@Component({
  selector: 'app-shop-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="header">
        <h2>Catégories de Boutiques</h2>
        <button class="btn-primary" (click)="navigateToAdd()">+ Ajouter une Catégorie</button>
      </div>

      <!-- Search -->
      <div class="search-container">
        <input 
          type="text" 
          placeholder="Rechercher une catégorie..." 
          [(ngModel)]="searchTerm"
          (input)="onSearch()"
        />
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
              <th>Nom</th>
              <th>Description</th>
              <th>Catégorie Parente</th>
              <th>Type</th>
              <th>Date de création</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let category of filteredCategories">
              <td>
                <div class="category-name">{{ category.name }}</div>
              </td>
              <td>{{ category.description || 'N/A' }}</td>
              <td>{{ getCategoryName(category.parent_category_id) }}</td>
              <td>
                <span [class]="category.parent_category_id ? 'badge child' : 'badge root'">
                  {{ category.parent_category_id ? 'Sous-catégorie' : 'Racine' }}
                </span>
              </td>
              <td>{{ formatDate(category.createdAt) }}</td>
              <td>
                <button class="btn-edit" (click)="editCategory(category)" title="Modifier">✎</button>
                <button class="btn-delete" (click)="deleteCategory(category)" title="Supprimer">✕</button>
              </td>
            </tr>
            <tr *ngIf="filteredCategories.length === 0">
              <td colspan="6" class="no-data">Aucune catégorie trouvée</td>
            </tr>
          </tbody>
        </table>
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
    .search-container {
      background: white;
      padding: 1rem;
      border-radius: 12px;
      margin-bottom: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .search-container input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      box-sizing: border-box;
    }
    .search-container input:focus {
      outline: none;
      border-color: #10b981;
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
    .category-name {
      font-weight: 600;
      color: #1e293b;
    }
    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .badge.root { background: #dbeafe; color: #2563eb; }
    .badge.child { background: #fef3c7; color: #b45309; }
    button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      margin: 0 0.25rem;
      border-radius: 6px;
      transition: background 0.2s;
    }
    .btn-edit:hover { background: #e0f2fe; }
    .btn-delete:hover { background: #fee2e2; }
    .no-data {
      text-align: center;
      color: #64748b;
      padding: 2rem !important;
    }

    /* Responsive Styles */
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
        min-width: 600px;
      }
    }

    @media (max-width: 480px) {
      th, td {
        padding: 0.5rem;
        font-size: 0.875rem;
      }
    }
  `]
})
export class ShopCategoryListComponent implements OnInit {
  categories: ShopCategory[] = [];
  filteredCategories: ShopCategory[] = [];
  loading = false;
  error = '';
  searchTerm = '';

  constructor(
    private shopCategoryService: ShopCategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.error = '';

    this.shopCategoryService.getAllCategories().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Backend returns { categories: [], pagination: {} }
          const data = response.data as any;
          if (data.categories && Array.isArray(data.categories)) {
            this.categories = data.categories;
            this.filteredCategories = [...this.categories];
          } else if (Array.isArray(response.data)) {
            // Fallback for direct array response
            this.categories = response.data;
            this.filteredCategories = [...this.categories];
          } else {
            this.error = 'Format de réponse invalide';
          }
        } else {
          this.error = 'Format de réponse invalide';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des catégories';
        console.error('Error loading categories:', err);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    if (!this.searchTerm) {
      this.filteredCategories = [...this.categories];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredCategories = this.categories.filter(cat =>
      cat.name.toLowerCase().includes(term) ||
      cat.description?.toLowerCase().includes(term)
    );
  }

  getCategoryName(categoryId?: string): string {
    if (!categoryId) return 'Aucune';
    const parent = this.categories.find(cat => cat._id === categoryId);
    return parent ? parent.name : 'N/A';
  }

  formatDate(date?: Date): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  navigateToAdd(): void {
    this.router.navigate(['/admin/shop-categories/add']);
  }

  editCategory(category: ShopCategory): void {
    this.router.navigate(['/admin/shop-categories', category._id, 'edit']);
  }

  deleteCategory(category: ShopCategory): void {
    if (!category._id) return;

    if (confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?`)) {
      this.shopCategoryService.deleteCategory(category._id).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Catégorie supprimée avec succès');
            this.loadCategories();
          }
        },
        error: (err) => {
          alert('Erreur lors de la suppression de la catégorie');
          console.error('Error deleting category:', err);
        }
      });
    }
  }
}
