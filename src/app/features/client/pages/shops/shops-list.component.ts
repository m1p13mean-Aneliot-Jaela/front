import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shops-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h2>Nos Boutiques</h2>
      <div class="shops-grid">
        <div class="shop-card" *ngFor="let shop of shops">
          <div class="shop-image">{{ shop.image }}</div>
          <div class="shop-info">
            <h3>{{ shop.name }}</h3>
            <p class="category">{{ shop.category }}</p>
            <div class="stats">
              <span>⭐ {{ shop.rating }}</span>
              <span>📦 {{ shop.products }} produits</span>
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
    .shops-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    .shop-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: transform 0.2s;
      cursor: pointer;
    }
    .shop-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .shop-image {
      height: 150px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
    }
    .shop-info {
      padding: 1rem;
    }
    h3 {
      margin: 0 0 0.5rem 0;
      color: #1e293b;
    }
    .category {
      color: #64748b;
      font-size: 0.875rem;
      margin: 0 0 0.75rem 0;
    }
    .stats {
      display: flex;
      gap: 1rem;
      font-size: 0.875rem;
      color: #64748b;
    }
  `]
})
export class ShopsListComponent {
  shops = [
    { name: 'Tech Store', category: 'Électronique', rating: 4.8, products: 156, image: '💻' },
    { name: 'Fashion Plus', category: 'Mode', rating: 4.5, products: 342, image: '👗' },
    { name: 'Maison Déco', category: 'Maison', rating: 4.7, products: 89, image: '🏠' },
    { name: 'Sport Pro', category: 'Sport', rating: 4.6, products: 234, image: '⚽' },
    { name: 'Gourmet Food', category: 'Alimentation', rating: 4.9, products: 67, image: '🍔' },
    { name: 'Beauty Shop', category: 'Beauté', rating: 4.4, products: 198, image: '💄' }
  ];
}
