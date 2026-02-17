import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EmployeeService, Employee, EmployeeListResponse } from '../../../services/employee.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { PermissionService } from '../../../../../core/services/permission.service';

interface DisplayEmployee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'MANAGER_SHOP' | 'STAFF';
  active: boolean;
  joinedDate: string;
}

@Component({
  selector: 'app-shop-employees-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-container">
      <div class="header-actions">
        <h2>Gestion des Employés</h2>
        <button *ngIf="canCreateEmployees" class="btn-primary" routerLink="/shop/employees/add">
          ➕ Ajouter un employé
        </button>
      </div>

      <div class="filters">
        <input type="text" placeholder="Rechercher un employé..." class="search-input">
        <select class="filter-select">
          <option value="">Tous les rôles</option>
          <option value="MANAGER_SHOP">Manager</option>
          <option value="STAFF">Vendeur</option>
        </select>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Employé</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Date d'entrée</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let employee of employees">
              <td>
                <div class="employee-cell">
                  <div class="avatar">{{ getInitials(employee) }}</div>
                  <span>{{ employee.firstName }} {{ employee.lastName }}</span>
                </div>
              </td>
              <td>{{ employee.email }}</td>
              <td>{{ employee.phone }}</td>
              <td>
                <span class="badge" [class.manager]="employee.role === 'MANAGER_SHOP'" [class.vendeur]="employee.role === 'STAFF'">
                  {{ employee.role === 'MANAGER_SHOP' ? 'Manager' : 'Vendeur' }}
                </span>
              </td>
              <td>
                <span class="badge" [class.active]="employee.active" [class.inactive]="!employee.active">
                  {{ employee.active ? 'Actif' : 'Inactif' }}
                </span>
              </td>
              <td>{{ employee.joinedDate }}</td>
              <td class="actions">
                <button *ngIf="canEditEmployees" class="btn-edit" [routerLink]="['/shop/employees/edit', employee.id]">✏️</button>
                <button *ngIf="canManagePermissions" class="btn-permissions" title="Gérer permissions">🔐</button>
                <button *ngIf="canDeleteEmployees" class="btn-delete" (click)="deleteEmployee(employee.id)">🗑️</button>
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
    .header-actions {
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
      padding: 0.75rem 1.5rem;
      background: #8b5cf6;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .search-input {
      flex: 1;
      padding: 0.625rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.9375rem;
    }
    .filter-select {
      padding: 0.625rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      background: white;
      min-width: 150px;
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
    }
    .employee-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
    }
    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .badge.manager { background: #dbeafe; color: #1d4ed8; }
    .badge.vendeur { background: #fce7f3; color: #be185d; }
    .badge.active { background: #d1fae5; color: #059669; }
    .badge.inactive { background: #fee2e2; color: #dc2626; }
    .actions {
      display: flex;
      gap: 0.25rem;
    }
    .actions button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 6px;
      transition: background 0.2s;
    }
    .btn-edit:hover { background: #e0f2fe; }
    .btn-permissions:hover { background: #fef3c7; }
    .btn-delete:hover { background: #fee2e2; }
  `]
})
export class ShopEmployeesListComponent implements OnInit {
  employees: DisplayEmployee[] = [];
  loading = false;
  error: string | null = null;
  
  private shopId: string | null = null;

  canCreateEmployees = false;
  canEditEmployees = false;
  canDeleteEmployees = false;
  canManagePermissions = false;

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    // Check permissions
    this.canCreateEmployees = this.permissionService.canCreateEmployees();
    this.canEditEmployees = this.permissionService.canEditEmployees();
    this.canDeleteEmployees = this.permissionService.canDeleteEmployees();
    this.canManagePermissions = this.permissionService.canManagePermissions();

    // Récupérer le shop_id de l'utilisateur connecté
    const user = this.authService.currentUserValue;
    if (user?.shop_id) {
      this.shopId = user.shop_id;
      this.loadEmployees();
    } else {
      this.error = 'Shop ID non trouvé. Veuillez vous reconnecter.';
    }
  }

  loadEmployees(): void {
    if (!this.shopId) return;
    
    this.loading = true;
    this.employeeService.getEmployeesByShop(this.shopId).subscribe({
      next: (response: { success: boolean; data: EmployeeListResponse }) => {
        this.employees = response.data.employees.map((emp: Employee) => ({
          id: emp._id || '',
          firstName: emp.first_name,
          lastName: emp.last_name,
          email: emp.email,
          phone: emp.phone || '',
          role: emp.role,
          active: emp.active,
          joinedDate: emp.joined_at ? new Date(emp.joined_at).toLocaleDateString('fr-FR') : ''
        }));
        this.loading = false;
      },
      error: (err: Error) => {
        this.error = 'Erreur lors du chargement des employés';
        this.loading = false;
        console.error('Error loading employees:', err);
      }
    });
  }

  getInitials(employee: DisplayEmployee): string {
    return `${employee.firstName[0]}${employee.lastName[0]}`.toUpperCase();
  }

  deleteEmployee(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {
          this.employees = this.employees.filter(e => e.id !== id);
        },
        error: (err: Error) => {
          console.error('Error deleting employee:', err);
          alert('Erreur lors de la suppression de l\'employé');
        }
      });
    }
  }
}
