import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../../core/services/auth.service';
import { PermissionService } from '../../../../../core/services/permission.service';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

@Component({
  selector: 'app-shop-clients-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="header">
        <h2>Mes Clients</h2>
        <div class="header-actions">
          <div class="search-box">
            <input 
              type="text" 
              [(ngModel)]="searchTerm" 
              (input)="filterClients()"
              placeholder="Rechercher un client..."
              class="search-input"
            >
          </div>
          <button 
            *ngIf="canCreateClients"
            class="btn-add" 
            (click)="addClient()"
          >
            + Nouveau Client
          </button>
        </div>
      </div>

      <!-- Error Message -->
      <div *ngIf="error" class="error-message">
        {{ error }}
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading">
        Chargement des clients...
      </div>

      <!-- Clients Table -->
      <div *ngIf="!loading && !error" class="clients-table-container">
        <table class="clients-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Ville</th>
              <th>Commandes</th>
              <th>Total dépensé</th>
              <th *ngIf="canEditClients || canDeleteClients">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let client of filteredClients">
              <td>
                <div class="client-name">
                  <span class="avatar">{{ client.firstName.charAt(0) || '?' }}</span>
                  <span>{{ client.firstName }} {{ client.lastName }}</span>
                </div>
              </td>
              <td>{{ client.email }}</td>
              <td>{{ client.phone || '-' }}</td>
              <td>{{ client.city || '-' }}</td>
              <td>{{ client.totalOrders }}</td>
              <td>{{ client.totalSpent | number }} Ar</td>
              <td *ngIf="canEditClients || canDeleteClients" class="actions">
                <button 
                  *ngIf="canEditClients"
                  class="btn-edit" 
                  (click)="editClient(client.id)"
                  title="Modifier"
                >
                  ✏️
                </button>
                <button 
                  *ngIf="canDeleteClients"
                  class="btn-delete" 
                  (click)="deleteClient(client.id)"
                  title="Supprimer"
                >
                  🗑️
                </button>
              </td>
            </tr>
            <tr *ngIf="filteredClients.length === 0">
              <td colspan="7" class="no-data">Aucun client trouvé</td>
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
      color: #1e293b;
      margin: 0;
    }
    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
    .search-input {
      padding: 0.625rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.875rem;
      width: 250px;
    }
    .btn-add {
      padding: 0.625rem 1.25rem;
      background: #8b5cf6;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.875rem;
    }
    .error-message {
      padding: 1rem;
      background: #fee2e2;
      color: #dc2626;
      border-radius: 8px;
      margin-bottom: 1rem;
    }
    .loading {
      text-align: center;
      padding: 2rem;
      color: #64748b;
    }
    .clients-table-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .clients-table {
      width: 100%;
      border-collapse: collapse;
    }
    .clients-table th {
      background: #f8fafc;
      padding: 1rem;
      text-align: left;
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .clients-table td {
      padding: 1rem;
      border-top: 1px solid #f1f5f9;
      font-size: 0.875rem;
      color: #1e293b;
    }
    .client-name {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .avatar {
      width: 32px;
      height: 32px;
      background: #8b5cf6;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      font-weight: 600;
    }
    .actions {
      display: flex;
      gap: 0.5rem;
    }
    .btn-edit, .btn-delete {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
    }
    .btn-edit {
      background: #dbeafe;
    }
    .btn-delete {
      background: #fee2e2;
    }
    .no-data {
      text-align: center;
      color: #64748b;
      padding: 2rem;
    }
  `]
})
export class ShopClientsListComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  searchTerm = '';
  loading = false;
  error: string | null = null;
  private shopId: string | null = null;

  canCreateClients = false;
  canEditClients = false;
  canDeleteClients = false;

  constructor(
    private authService: AuthService,
    private permissionService: PermissionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user?.shop_id) {
      this.shopId = user.shop_id;
    } else {
      this.error = 'Shop ID non trouvé. Veuillez vous reconnecter.';
      return;
    }

    this.canCreateClients = this.permissionService.hasPermission('clients.create');
    this.canEditClients = this.permissionService.hasPermission('clients.edit');
    this.canDeleteClients = this.permissionService.hasPermission('clients.delete');

    this.loadClients();
  }

  loadClients(): void {
    this.loading = true;
    // TODO: Load from API
    setTimeout(() => {
      this.clients = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '034 12 345 67',
          address: '123 Rue Principale',
          city: 'Antananarivo',
          totalOrders: 5,
          totalSpent: 2340000,
          createdAt: '2026-01-15'
        },
        {
          id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          phone: '033 98 765 43',
          city: 'Toamasina',
          totalOrders: 3,
          totalSpent: 1200000,
          createdAt: '2026-02-01'
        },
        {
          id: '3',
          firstName: 'Bob',
          lastName: 'Wilson',
          email: 'bob@example.com',
          totalOrders: 1,
          totalSpent: 450000,
          createdAt: '2026-02-10'
        }
      ];
      this.filteredClients = [...this.clients];
      this.loading = false;
    }, 500);
  }

  filterClients(): void {
    if (!this.searchTerm) {
      this.filteredClients = [...this.clients];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredClients = this.clients.filter(client => 
      client.firstName.toLowerCase().includes(term) ||
      client.lastName.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term) ||
      (client.phone && client.phone.includes(term))
    );
  }

  addClient(): void {
    this.router.navigate(['/shop/clients/add']);
  }

  editClient(id: string): void {
    this.router.navigate(['/shop/clients/edit', id]);
  }

  deleteClient(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      // TODO: Delete from API
      this.clients = this.clients.filter(c => c.id !== id);
      this.filterClients();
    }
  }
}
