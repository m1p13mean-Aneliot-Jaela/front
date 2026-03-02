import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <h2>Rechercher</h2>
      <div class="search-box">
        <input type="text" [(ngModel)]="searchQuery" placeholder="Rechercher des produits, boutiques...">
        <button (click)="search()">⌕ Rechercher</button>
      </div>
      
      <div class="filters">
        <button class="filter-btn active">Tout</button>
        <button class="filter-btn">Produits</button>
        <button class="filter-btn">Boutiques</button>
      </div>

      <div class="results">
        <h3>Résultats populaires</h3>
        <div class="products-grid">
          <div class="product-card" *ngFor="let product of results">
            <div class="product-image">{{ product.image }}</div>
            <div class="product-info">
              <h4>{{ product.name }}</h4>
              <p class="shop">{{ product.shop }}</p>
              <p class="price">{{ product.price }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    h2 {
      margin-bottom: 1.5rem;
      color: #1e293b;
    }
    .search-box {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    input {
      flex: 1;
      padding: 0.75rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
    }
    button {
      padding: 0.75rem 1.5rem;
      background: #10b981;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }
    .filters {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
    }
    .filter-btn {
      padding: 0.5rem 1rem;
      background: white;
      color: #64748b;
      border: 2px solid #e2e8f0;
    }
    .filter-btn.active {
      background: #10b981;
      color: white;
      border-color: #10b981;
    }
    .results h3 {
      margin-bottom: 1rem;
      color: #1e293b;
    }
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }
    .product-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .product-image {
      height: 120px;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
    }
    .product-info {
      padding: 1rem;
    }
    h4 {
      margin: 0 0 0.25rem 0;
      color: #1e293b;
    }
    .shop {
      color: #64748b;
      font-size: 0.875rem;
      margin: 0;
    }
    .price {
      color: #10b981;
      font-weight: 700;
      margin: 0.5rem 0 0 0;
    }
  `]
})
export class SearchComponent {
  searchQuery = '';
  results = [
    { name: 'iPhone 15 Pro', shop: 'Tech Store', price: '4,500,000 Ar', image: '▭' },
    { name: 'Air Max 90', shop: 'Sport Pro', price: '180,000 Ar', image: '▸' },
    { name: 'Robe été', shop: 'Fashion Plus', price: '45,000 Ar', image: '◆' },
    { name: 'Fauteuil design', shop: 'Maison Déco', price: '250,000 Ar', image: '▣' }
  ];

  search() {
    console.log('Recherche:', this.searchQuery);
  }
}
