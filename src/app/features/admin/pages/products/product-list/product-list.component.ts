import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ProductService } from '../../../services/product.service';
import { Product, ProductFilters, ProductResponse } from '../../../../../shared/models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="header">
        <h2>Liste des Produits</h2>
        <button class="btn-add" routerLink="/admin/products/add">
          + Ajouter un produit
        </button>
      </div>

      <!-- Filtres -->
      <div class="filters">
        <input
          type="text"
          [(ngModel)]="filters.keyword"
          (ngModelChange)="onSearch()"
          placeholder="Rechercher un produit..."
          class="search-input"
        />
        <select [(ngModel)]="filters.status" (change)="onSearch()">
          <option value="">Tous les statuts</option>
          <option value="DRAFT">Brouillon</option>
          <option value="PENDING">En attente</option>
          <option value="ACTIVE">Actif</option>
          <option value="REJECTED">Rejeté</option>
        </select>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading">
        Chargement...
      </div>

      <!-- Error -->
      <div *ngIf="error" class="error-message">
        {{ error }}
      </div>

      <!-- Table -->
      <div class="table-container" *ngIf="!loading && !error">
        <table *ngIf="products.length > 0">
          <thead>
            <tr>
              <th>Produit</th>
              <th>SKU</th>
              <th>Boutique</th>
              <th>Prix</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let product of products">
              <td>
                <div class="product-info">
                  <img
                    *ngIf="product.image_url"
                    [src]="product.image_url"
                    alt="{{ product.name }}"
                    class="product-image"
                  />
                  <div class="product-details">
                    <strong>{{ product.name }}</strong>
                    <small *ngIf="product.description">{{ product.description | slice:0:50 }}...</small>
                  </div>
                </div>
              </td>
              <td>{{ product.sku }}</td>
              <td>{{ product.shop_name || 'N/A' }}</td>
              <td>{{ product.unit_price | number:'1.0-0' }} Ar</td>
              <td>
                <span class="badge" [ngClass]="getStatusClass(product.current_status?.status)">
                  {{ getStatusLabel(product.current_status?.status) }}
                </span>
              </td>
              <td>
                <button class="btn-view" [routerLink]="['/admin/products/edit', product._id]">👁️</button>
                <button class="btn-edit" [routerLink]="['/admin/products/edit', product._id]">✏️</button>
                <button class="btn-delete" (click)="deleteProduct(product._id!)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="products.length === 0" class="empty-state">
          Aucun produit trouvé
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
      color: #1e293b;
      margin: 0;
    }
    .btn-add {
      background: #10b981;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-add:hover {
      background: #059669;
    }
    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .search-input {
      flex: 1;
      padding: 0.75rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
    }
    .search-input:focus {
      outline: none;
      border-color: #10b981;
    }
    select {
      padding: 0.75rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      background: white;
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
    }
    .product-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .product-image {
      width: 50px;
      height: 50px;
      object-fit: cover;
      border-radius: 8px;
    }
    .product-details {
      display: flex;
      flex-direction: column;
    }
    .product-details small {
      color: #64748b;
    }
    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .badge.active { background: #d1fae5; color: #059669; }
    .badge.pending { background: #fef3c7; color: #d97706; }
    .badge.draft { background: #e0e7ff; color: #4f46e5; }
    .badge.rejected { background: #fee2e2; color: #dc2626; }
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
    .loading, .error-message, .empty-state {
      text-align: center;
      padding: 2rem;
      color: #64748b;
    }
    .error-message {
      color: #dc2626;
    }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  error = '';
  filters: ProductFilters = {
    keyword: '',
    status: ''
  };

  private productService = inject(ProductService);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = '';
    this.productService.getAllProducts(this.filters).subscribe({
      next: (response: ProductResponse) => {
        this.products = response.products || [];
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'Erreur lors du chargement des produits';
        this.loading = false;
        console.error('Error loading products:', err);
      }
    });
  }

  onSearch(): void {
    this.loadProducts();
  }

  deleteProduct(id: string): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    this.productService.deleteProduct(id).subscribe({
      next: (response: ProductResponse) => {
        if (response.success) {
          this.products = this.products.filter(p => p._id !== id);
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error deleting product:', err);
        alert('Erreur lors de la suppression du produit');
      }
    });
  }

  getStatusClass(status?: string): string {
    const map: { [key: string]: string } = {
      'DRAFT': 'draft',
      'PENDING': 'pending',
      'ACTIVE': 'active',
      'REJECTED': 'rejected'
    };
    return map[status || ''] || 'draft';
  }

  getStatusLabel(status?: string): string {
    const map: { [key: string]: string } = {
      'DRAFT': 'Brouillon',
      'PENDING': 'En attente',
      'ACTIVE': 'Actif',
      'REJECTED': 'Rejeté'
    };
    return map[status || ''] || status || 'Inconnu';
  }
}
