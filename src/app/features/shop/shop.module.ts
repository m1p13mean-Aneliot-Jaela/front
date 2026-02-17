import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ShopLayoutComponent } from './layout/shop-layout.component';
import { ShopDashboardComponent } from './pages/dashboard/shop-dashboard.component';
import { ShopProductListComponent } from './pages/products/product-list/shop-product-list.component';
import { ShopProductAddComponent } from './pages/products/product-add/shop-product-add.component';
import { ShopOrderListComponent } from './pages/orders/order-list/shop-order-list.component';
import { ShopOrderFormComponent } from './pages/orders/order-add-edit/shop-order-form.component';
import { ShopSalesComponent } from './pages/sales/shop-sales.component';
import { ShopEmployeesListComponent } from './pages/employees/employees-list/shop-employees-list.component';
import { ShopEmployeeFormComponent } from './pages/employees/employee-form/shop-employee-form.component';
import { ShopClientsListComponent } from './pages/clients/client-list/shop-clients-list.component';
import { ShopClientFormComponent } from './pages/clients/client-add-edit/shop-client-form.component';
import { ShopDeliveriesListComponent } from './pages/deliveries/delivery-list/shop-deliveries-list.component';

import { AuthGuard } from '../../core/guards/auth.guard';
import { PermissionGuard, EmployeeRoleGuard } from '../../core/guards/permission.guard';

const routes: Routes = [
  {
    path: '',
    component: ShopLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: ShopDashboardComponent },
      
      // Products
      { path: 'products/list', component: ShopProductListComponent },
      { path: 'products/add', component: ShopProductAddComponent },
      
      // Orders with CRUD
      { path: 'orders/list', component: ShopOrderListComponent },
      { path: 'orders/add', component: ShopOrderFormComponent },
      { path: 'orders/edit/:id', component: ShopOrderFormComponent },
      
      { path: 'sales', component: ShopSalesComponent },
      
      // Clients with CRUD
      { path: 'clients/list', component: ShopClientsListComponent },
      { path: 'clients/add', component: ShopClientFormComponent },
      { path: 'clients/edit/:id', component: ShopClientFormComponent },
      
      // Deliveries
      { path: 'deliveries/list', component: ShopDeliveriesListComponent },
      
      // Employee routes with permission guards
      { 
        path: 'employees/list', 
        component: ShopEmployeesListComponent,
        data: { permission: 'employees.view' }
      },
      { 
        path: 'employees/add', 
        component: ShopEmployeeFormComponent,
        data: { permission: 'employees.create' }
      },
      { 
        path: 'employees/edit/:id', 
        component: ShopEmployeeFormComponent,
        data: { permission: 'employees.edit' }
      },
      
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ShopLayoutComponent,
    ShopDashboardComponent,
    ShopProductListComponent,
    ShopProductAddComponent,
    ShopOrderListComponent,
    ShopOrderFormComponent,
    ShopSalesComponent,
    ShopEmployeesListComponent,
    ShopEmployeeFormComponent,
    ShopClientsListComponent,
    ShopClientFormComponent,
    ShopDeliveriesListComponent,
    RouterModule.forChild(routes)
  ]
})
export class ShopModule { }
