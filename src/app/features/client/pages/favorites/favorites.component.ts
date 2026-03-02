import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h2>Mes Favoris</h2>
      <div class="favorites-grid" *ngIf="favorites.length > 0; else empty">
        <div class="favorite-card" *ngFor="let item of favorites">
          <button class="remove-btn" (click)="remove(item.id)">×</button>
          <div class="item-image">{{ item.image }}</div>
          <div class="item-info">
            <h4>{{ item.name }}</h4>
            <p class="shop">{{ item.shop }}</p>
            <p class="price">{{ item.price }}</p>
          </div>
        </div>
      </div>
      <ng-template #empty>
        <div class="empty-state">
          <span class="icon">★</span>
          <p>Vous n'avez pas encore de favoris</p>
          <button class="btn-primary">Découvrir des produits</button>
        </div>
      </ng-template>
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
    .favorites-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }
    .favorite-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      position: relative;
    }
    .remove-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: white;
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .item-image {
      height: 150px;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
    }
    .item-info {
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
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #64748b;
    }
    .empty-state .icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      display: block;
    }
    .btn-primary {
      margin-top: 1rem;
      padding: 0.75rem 1.5rem;
      background: #10b981;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }
  `]
})
export class FavoritesComponent {
  favorites = [
    { id: 1, name: 'iPhone 15 Pro', shop: 'Tech Store', price: '4,500,000 Ar', image: '▭' },
    { id: 2, name: 'Sac à main cuir', shop: 'Fashion Plus', price: '180,000 Ar', image: '◇' }
  ];

  remove(id: number) {
    this.favorites = this.favorites.filter(f => f.id !== id);
  }
}
