import { Injectable } from '@angular/core';
import { AuthService, User } from './auth.service';

// Permissions must match backend: employee.service.js getPermissions()
export type Permission = 
  // Products
  | 'view_products'       // Voir les produits
  | 'edit_products'       // Modifier les produits (ajouter/modifier/supprimer)
  | 'delete_products'     // Supprimer les produits
  // Orders
  | 'view_orders'         // Voir les commandes
  | 'process_orders'      // Traiter les commandes
  | 'cancel_orders'       // Annuler les commandes
  // Sales & Reports
  | 'view_sales'          // Voir les ventes
  | 'view_reports'        // Voir les rapports
  // Employees
  | 'manage_employees'    // Gérer les employés
  // Stock
  | 'manage_stock'        // Gérer le stock
  // Promotions
  | 'manage_promotions'   // Gérer les promotions
  // Deliveries
  | 'view_deliveries'     // Voir les livraisons
  // Shop Profile
  | 'edit_shop_profile'   // Modifier le profil boutique
  // Clients (legacy compatibility)
  | 'clients.view'        // Voir les clients
  | 'clients.create'      // Créer un client
  | 'clients.edit'        // Modifier un client
  | 'clients.delete';     // Supprimer un client

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
   * Check shop employee permissions - must match backend employee.service.js
   */
  private hasShopPermission(user: User, permission: Permission): boolean {
    const role = user.role;

    if (!role) return false;

    // MANAGER_SHOP - Full access
    if (role === 'MANAGER_SHOP') {
      return true; // Manager has all permissions
    }

    // STAFF - Limited access (matches backend permissions)
    if (role === 'STAFF') {
      switch (permission) {
        // STAFF can view
        case 'view_products':
        case 'view_orders':
        case 'manage_stock':
        case 'view_deliveries':
          return true;
        
        // STAFF can process orders but not cancel
        case 'process_orders':
          return true;
        
        // Everything else is false
        case 'edit_products':
        case 'delete_products':
        case 'cancel_orders':
        case 'view_sales':
        case 'view_reports':
        case 'manage_employees':
        case 'manage_promotions':
        case 'edit_shop_profile':
          return false;
        
        default:
          return false;
      }
    }

    return false;
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
   * Legacy helper methods for employee management
   */
  canViewEmployees(): boolean {
    return this.hasPermission('manage_employees');
  }

  canCreateEmployees(): boolean {
    return this.hasPermission('manage_employees');
  }

  canEditEmployees(): boolean {
    return this.hasPermission('manage_employees');
  }

  canDeleteEmployees(): boolean {
    return this.hasPermission('manage_employees');
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
