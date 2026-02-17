import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { EmployeeService, Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '../../../services/employee.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { PermissionService } from '../../../../../core/services/permission.service';

interface Permission {
  key: string;
  label: string;
  manager: boolean;
  staff: boolean;
}

@Component({
  selector: 'app-shop-employee-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-container">
      <h2>{{ isEdit ? 'Modifier' : 'Ajouter' }} un Employé</h2>
      
      <div class="form-container">
        <form (ngSubmit)="onSubmit()">
          <div class="form-section">
            <h3>Informations personnelles</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Prénom *</label>
                <input type="text" [(ngModel)]="employee.firstName" name="firstName" required>
              </div>
              <div class="form-group">
                <label>Nom *</label>
                <input type="text" [(ngModel)]="employee.lastName" name="lastName" required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Email *</label>
                <input type="email" [(ngModel)]="employee.email" name="email" required>
              </div>
              <div class="form-group">
                <label>Téléphone</label>
                <input type="tel" [(ngModel)]="employee.phone" name="phone" placeholder="+261 34 00 000 00">
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Rôle et permissions</h3>
            <div class="form-group">
              <label>Rôle *</label>
              <select [(ngModel)]="employee.role" name="role" (change)="onRoleChange()" required>
                <option value="STAFF">Vendeur</option>
                <option value="MANAGER_SHOP">Manager</option>
              </select>
              <span class="role-description">
                {{ employee.role === 'MANAGER_SHOP' ? 'Accès complet : gestion employés, ventes, produits' : 'Accès limité : ventes et consultations uniquement' }}
              </span>
            </div>
          </div>

          <div class="form-section">
            <h3>Permissions détaillées</h3>
            <div class="permissions-table">
              <div class="permission-row header">
                <span>Fonctionnalité</span>
                <span>Manager</span>
                <span>Vendeur</span>
              </div>
              <div class="permission-row" *ngFor="let perm of permissions">
                <span>{{ perm.label }}</span>
                <input type="checkbox" [(ngModel)]="perm.manager" name="perm-manager-{{perm.key}}" disabled>
                <input type="checkbox" [(ngModel)]="perm.staff" name="perm-staff-{{perm.key}}" [disabled]="employee.role === 'MANAGER_SHOP'">
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Sécurité</h3>
            <div class="form-group">
              <label>Mot de passe {{ isEdit ? '(laisser vide pour ne pas changer)' : '*' }}</label>
              <input type="password" [(ngModel)]="employee.password" name="password" [required]="!isEdit">
            </div>
            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="employee.active" name="active">
                <span>Employé actif</span>
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" routerLink="/shop/employees/list">Annuler</button>
            <button type="submit" class="btn-primary">{{ isEdit ? 'Mettre à jour' : 'Créer l\'employé' }}</button>
          </div>
        </form>
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
    .form-container {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      max-width: 800px;
    }
    .form-section {
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .form-section:last-of-type {
      border-bottom: none;
    }
    h3 {
      margin: 0 0 1rem 0;
      color: #475569;
      font-size: 1rem;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #64748b;
      font-size: 0.875rem;
    }
    input, select {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      box-sizing: border-box;
    }
    input:focus, select:focus {
      outline: none;
      border-color: #8b5cf6;
    }
    .role-description {
      display: block;
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #64748b;
    }
    .permissions-table {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }
    .permission-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      padding: 0.75rem 1rem;
      align-items: center;
      border-bottom: 1px solid #e2e8f0;
    }
    .permission-row:last-child {
      border-bottom: none;
    }
    .permission-row.header {
      background: #f8fafc;
      font-weight: 600;
      font-size: 0.875rem;
      color: #64748b;
    }
    .permission-row input[type="checkbox"] {
      width: auto;
      justify-self: center;
    }
    .checkbox-group {
      margin-top: 1rem;
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }
    .checkbox-label input {
      width: auto;
    }
    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #e2e8f0;
    }
    button {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary {
      background: #8b5cf6;
      color: white;
      border: none;
    }
    .btn-primary:hover {
      background: #7c3aed;
    }
    .btn-secondary {
      background: white;
      color: #64748b;
      border: 2px solid #e2e8f0;
    }
    .btn-secondary:hover {
      background: #f8fafc;
    }
  `]
})
export class ShopEmployeeFormComponent implements OnInit {
  isEdit = false;
  employeeId: string | null = null;
  error: string | null = null;

  employee = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'STAFF' as 'MANAGER_SHOP' | 'STAFF',
    password: '',
    active: true
  };

  permissions: Permission[] = [
    { key: 'view_products', label: 'Voir les produits', manager: true, staff: true },
    { key: 'edit_products', label: 'Modifier les produits', manager: true, staff: false },
    { key: 'view_orders', label: 'Voir les commandes', manager: true, staff: true },
    { key: 'process_orders', label: 'Traiter les commandes', manager: true, staff: true },
    { key: 'view_sales', label: 'Voir les ventes', manager: true, staff: false },
    { key: 'manage_employees', label: 'Gérer les employés', manager: true, staff: false },
    { key: 'view_reports', label: 'Voir les rapports', manager: true, staff: false }
  ];

  // Shop ID récupéré de l'utilisateur connecté
  private shopId: string | null = null;
  
  // Permissions
  canCreateEmployees = false;
  canEditEmployees = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    // Check permissions - STAFF cannot access this page
    this.canCreateEmployees = this.permissionService.canCreateEmployees();
    this.canEditEmployees = this.permissionService.canEditEmployees();
    
    // Redirect if no permission
    if (this.isEdit && !this.canEditEmployees) {
      alert('Vous n\'avez pas la permission de modifier des employés.');
      this.router.navigate(['/shop/employees/list']);
      return;
    }
    if (!this.isEdit && !this.canCreateEmployees) {
      alert('Vous n\'avez pas la permission de créer des employés.');
      this.router.navigate(['/shop/employees/list']);
      return;
    }

    // Récupérer le shop_id de l'utilisateur connecté
    const user = this.authService.currentUserValue;
    if (user?.shop_id) {
      this.shopId = user.shop_id;
    } else {
      this.error = 'Shop ID non trouvé. Veuillez vous reconnecter.';
      return;
    }

    this.employeeId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.employeeId;
    
    if (this.isEdit) {
      this.loadEmployeeData();
    }
  }

  loadEmployeeData(): void {
    if (!this.employeeId) return;
    
    this.employeeService.getEmployeeById(this.employeeId).subscribe({
      next: (response) => {
        const emp = response.data;
        this.employee = {
          firstName: emp.first_name,
          lastName: emp.last_name,
          email: emp.email,
          phone: emp.phone || '',
          role: emp.role,
          password: '', // Password not returned from API
          active: emp.active
        };
      },
      error: (err: Error) => {
        console.error('Error loading employee:', err);
        alert('Erreur lors du chargement de l\'employé');
      }
    });
  }

  onRoleChange(): void {
    if (this.employee.role === 'MANAGER_SHOP') {
      this.permissions.forEach(p => {
        p.staff = p.manager;
      });
    }
  }

  onSubmit(): void {
    if (this.isEdit && this.employeeId) {
      // Update existing employee
      const updateData: UpdateEmployeeRequest = {
        first_name: this.employee.firstName,
        last_name: this.employee.lastName,
        email: this.employee.email,
        phone: this.employee.phone,
        role: this.employee.role,
        active: this.employee.active
      };
      
      // Only include password if provided
      if (this.employee.password) {
        (updateData as any).password = this.employee.password;
      }

      this.employeeService.updateEmployee(this.employeeId, updateData).subscribe({
        next: () => {
          this.router.navigate(['/shop/employees/list']);
        },
        error: (err: Error) => {
          console.error('Error updating employee:', err);
          alert('Erreur lors de la mise à jour de l\'employé');
        }
      });
    } else {
      // Create new employee
      if (!this.shopId) {
        alert('Shop ID non trouvé. Veuillez vous reconnecter.');
        return;
      }

      const createData: CreateEmployeeRequest = {
        first_name: this.employee.firstName,
        last_name: this.employee.lastName,
        email: this.employee.email,
        phone: this.employee.phone,
        password: this.employee.password,
        role: this.employee.role,
        shop_id: this.shopId
      };

      this.employeeService.createEmployee(createData).subscribe({
        next: () => {
          this.router.navigate(['/shop/employees/list']);
        },
        error: (err: Error) => {
          console.error('Error creating employee:', err);
          alert('Erreur lors de la création de l\'employé');
        }
      });
    }
  }
}
