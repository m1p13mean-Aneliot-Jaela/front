import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shop-product-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h2>Mes Produits</h2>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Prix</th>
              <th>Stock</th>
              <th>Ventes</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let product of products">
              <td>
                <div class="product-cell">
                  <span class="product-image">{{ product.image }}</span>
                  <span>{{ product.name }}</span>
                </div>
              </td>
              <td>{{ product.price }}</td>
              <td>{{ product.stock }}</td>
              <td>{{ product.sales }}</td>
              <td>
                <span class="badge" [class.active]="product.stock > 0" [class.out]="product.stock === 0">
                  {{ product.stock > 0 ? 'Actif' : 'Rupture' }}
                </span>
              </td>
              <td>
                <button class="btn-edit">✏️</button>
                <button class="btn-delete">🗑️</button>
              </td>
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
    h2 {
      margin-bottom: 1.5rem;
      color: #1e293b;
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
    .product-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .product-image {
      font-size: 1.5rem;
    }
    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .badge.active { background: #d1fae5; color: #059669; }
    .badge.out { background: #fee2e2; color: #dc2626; }
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
  `]
})
export class ShopProductListComponent {
  products = [
    { name: 'iPhone 15 Pro', price: '4,500,000 Ar', stock: 12, sales: 45, image: '📱' },
    { name: 'AirPods Pro', price: '450,000 Ar', stock: 8, sales: 23, image: '🎧' },
    { name: 'Coque iPhone', price: '35,000 Ar', stock: 0, sales: 67, image: '📱' },
    { name: 'Chargeur USB-C', price: '25,000 Ar', stock: 50, sales: 89, image: '🔌' }
  ];
}
