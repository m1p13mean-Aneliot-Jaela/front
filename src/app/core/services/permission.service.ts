import { Injectable } from '@angular/core';
import { AuthService, User } from './auth.service';

export type Permission = 
  | 'employees.view'      // Voir la liste des employés
  | 'employees.create'    // Créer un employé
  | 'employees.edit'      // Modifier un employé
  | 'employees.delete'    // Supprimer un employé
  | 'employees.manage_permissions' // Gérer les permissions
  | 'clients.view'        // Voir la liste des clients
  | 'clients.create'      // Créer un client
  | 'clients.edit'        // Modifier un client
  | 'clients.delete'      // Supprimer un client
  | 'orders.view'         // Voir les commandes
  | 'orders.create'       // Créer une commande
  | 'orders.edit'         // Modifier une commande
  | 'orders.delete'       // Supprimer une commande
  | 'products.view'       // Voir les produits
  | 'products.create'     // Créer un produit
  | 'products.edit'       // Modifier un produit
  | 'products.delete'     // Supprimer un produit
  | 'deliveries.view';    // Voir les livraisons

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  
  constructor(private authService: AuthService) {}

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.authService.currentUserValue;
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(permission: Permission): boolean {
    const user = this.getCurrentUser();
    
    if (!user) return false;

    // Admins and brands have all permissions
    if (user.user_type === 'admin' || user.user_type === 'brand') {
      return true;
    }

    // Shop employees permissions based on role
    if (user.user_type === 'shop') {
      return this.hasShopPermission(user, permission);
    }

    return false;
  }

  /**
   * Check shop employee permissions
   */
  private hasShopPermission(user: User, permission: Permission): boolean {
    const role = user.role;

    if (!role) return false;

    // MANAGER_SHOP - Full access to employee management
    if (role === 'MANAGER_SHOP') {
      return true; // Manager has all permissions
    }

    // STAFF - Limited access
    if (role === 'STAFF') {
      switch (permission) {
        case 'employees.view':
          return true; // Can view employees
        case 'employees.create':
        case 'employees.edit':
        case 'employees.delete':
        case 'employees.manage_permissions':
          return false; // Cannot modify employees
        default:
          return false;
      }
    }

    return false;
  }

  /**
   * Check if user can view employees
   */
  canViewEmployees(): boolean {
    return this.hasPermission('employees.view');
  }

  /**
   * Check if user can create employees
   */
  canCreateEmployees(): boolean {
    return this.hasPermission('employees.create');
  }

  /**
   * Check if user can edit employees
   */
  canEditEmployees(): boolean {
    return this.hasPermission('employees.edit');
  }

  /**
   * Check if user can delete employees
   */
  canDeleteEmployees(): boolean {
    return this.hasPermission('employees.delete');
  }

  /**
   * Check if user can manage permissions
   */
  canManagePermissions(): boolean {
    return this.hasPermission('employees.manage_permissions');
  }

  /**
   * Check if user is MANAGER_SHOP
   */
  isManager(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'MANAGER_SHOP';
  }

  /**
   * Check if user is STAFF
   */
  isStaff(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'STAFF';
  }

  /**
   * Get user role display name
   */
  getRoleDisplayName(): string {
    const user = this.getCurrentUser();
    if (!user?.role) return '';
    
    switch (user.role) {
      case 'MANAGER_SHOP':
        return 'Manager';
      case 'STAFF':
        return 'Vendeur';
      default:
        return user.role;
    }
  }
}
