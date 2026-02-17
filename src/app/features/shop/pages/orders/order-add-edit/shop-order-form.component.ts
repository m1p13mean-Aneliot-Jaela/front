import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../../core/services/auth.service';

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  statusLabel: string;
  items: OrderItem[];
  total: number;
  notes?: string;
}

@Component({
  selector: 'app-shop-order-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="header">
        <button class="btn-back" (click)="goBack()">← Retour</button>
        <h2>{{ isEdit ? 'Modifier Commande' : 'Nouvelle Commande' }}</h2>
      </div>

      <form (ngSubmit)="onSubmit()" class="order-form">
        <!-- Client Section -->
        <div class="form-section">
          <h3>Client</h3>
          <div class="form-group">
            <label>Client *</label>
            <select [(ngModel)]="order.customerId" name="customerId" required class="form-control">
              <option value="">Sélectionner un client</option>
              <option *ngFor="let client of clients" [value]="client.id">{{ client.name }}</option>
            </select>
          </div>
        </div>

        <!-- Products Section -->
        <div class="form-section">
          <h3>Articles</h3>
          <div class="items-list">
            <div *ngFor="let item of order.items; let i = index" class="item-row">
              <select [(ngModel)]="item.productId" name="product{{i}}" required class="form-control">
                <option value="">Sélectionner un produit</option>
                <option *ngFor="let product of products" [value]="product.id">{{ product.name }} - {{ product.price }} Ar</option>
              </select>
              <input 
                type="number" 
                [(ngModel)]="item.quantity" 
                name="quantity{{i}}" 
                placeholder="Qté"
                min="1"
                required
                class="form-control quantity"
                (change)="updateItemTotal(item)"
              >
              <span class="item-total">{{ item.total | number }} Ar</span>
              <button type="button" class="btn-remove" (click)="removeItem(i)">×</button>
            </div>
          </div>
          <button type="button" class="btn-add-item" (click)="addItem()">+ Ajouter un article</button>
        </div>

        <!-- Order Info -->
        <div class="form-section">
          <h3>Informations</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Date *</label>
              <input type="date" [(ngModel)]="order.date" name="date" required class="form-control">
            </div>
            <div class="form-group">
              <label>Statut</label>
              <select [(ngModel)]="order.status" name="status" class="form-control">
                <option value="pending">En attente</option>
                <option value="processing">En préparation</option>
                <option value="shipped">Expédiée</option>
                <option value="delivered">Livrée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Notes</label>
            <textarea [(ngModel)]="order.notes" name="notes" rows="3" class="form-control"></textarea>
          </div>
        </div>

        <!-- Total -->
        <div class="form-section total-section">
          <div class="total-row">
            <span>Total :</span>
            <span class="total-amount">{{ order.total | number }} Ar</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="goBack()">Annuler</button>
          <button type="submit" class="btn-primary">
            {{ isEdit ? 'Enregistrer les modifications' : 'Créer la commande' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem;
      max-width: 900px;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .btn-back {
      padding: 0.5rem 1rem;
      background: #f1f5f9;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    h2 {
      color: #1e293b;
      margin: 0;
    }
    .order-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .form-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .form-section h3 {
      margin: 0 0 1rem 0;
      color: #1e293b;
      font-size: 1rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #64748b;
    }
    .form-control {
      padding: 0.625rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.875rem;
    }
    .items-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .item-row {
      display: grid;
      grid-template-columns: 2fr 80px 1fr auto;
      gap: 0.75rem;
      align-items: center;
    }
    .quantity {
      text-align: center;
    }
    .item-total {
      font-weight: 500;
      color: #1e293b;
    }
    .btn-remove {
      width: 32px;
      height: 32px;
      border: none;
      background: #fee2e2;
      color: #dc2626;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1.25rem;
    }
    .btn-add-item {
      padding: 0.75rem;
      background: #f1f5f9;
      border: 2px dashed #cbd5e1;
      border-radius: 8px;
      color: #64748b;
      cursor: pointer;
      margin-top: 0.5rem;
    }
    .total-section {
      text-align: right;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 1.25rem;
    }
    .total-amount {
      font-weight: 700;
      color: #1e293b;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }
    .btn-secondary {
      padding: 0.75rem 1.5rem;
      background: #f1f5f9;
      border: none;
      border-radius: 8px;
      color: #64748b;
      cursor: pointer;
    }
    .btn-primary {
      padding: 0.75rem 1.5rem;
      background: #8b5cf6;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }
  `]
})
export class ShopOrderFormComponent implements OnInit {
  isEdit = false;
  orderId: string | null = null;
  private shopId: string | null = null;

  clients = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Bob Wilson' }
  ];

  products = [
    { id: '1', name: 'iPhone 15', price: 4500000 },
    { id: '2', name: 'AirPods Pro', price: 450000 },
    { id: '3', name: 'Coque iPhone', price: 180000 },
    { id: '4', name: 'Chargeur', price: 25000 }
  ];

  order: Order = {
    id: '',
    customerId: '',
    customerName: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    statusLabel: 'En attente',
    items: [],
    total: 0,
    notes: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user?.shop_id) {
      this.shopId = user.shop_id;
    }

    this.orderId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.orderId;

    // Add first empty item for new orders
    if (!this.isEdit) {
      this.addItem();
    } else {
      // Load order data for edit
      this.loadOrderData();
    }
  }

  loadOrderData(): void {
    // TODO: Load order from API
    this.order = {
      id: 'CMD-001',
      customerId: '1',
      customerName: 'John Doe',
      date: '2026-02-14',
      status: 'pending',
      statusLabel: 'En attente',
      items: [
        { productId: '1', name: 'iPhone 15', quantity: 1, price: 4500000, total: 4500000 },
        { productId: '3', name: 'Coque iPhone', quantity: 1, price: 180000, total: 180000 }
      ],
      total: 4680000,
      notes: ''
    };
  }

  addItem(): void {
    this.order.items.push({
      productId: '',
      name: '',
      quantity: 1,
      price: 0,
      total: 0
    });
  }

  removeItem(index: number): void {
    this.order.items.splice(index, 1);
    this.calculateTotal();
  }

  updateItemTotal(item: OrderItem): void {
    const product = this.products.find(p => p.id === item.productId);
    if (product) {
      item.price = product.price;
      item.name = product.name;
    }
    item.total = item.quantity * item.price;
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.order.total = this.order.items.reduce((sum, item) => sum + item.total, 0);
  }

  onSubmit(): void {
    // TODO: Save order to API
    console.log('Saving order:', this.order);
    this.goBack();
  }

  goBack(): void {
    this.router.navigate(['/shop/orders/list']);
  }
}
