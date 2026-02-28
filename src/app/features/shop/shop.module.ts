import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { ShopLayoutComponent } from './layout/shop-layout.component';
import { ShopDashboardComponent } from './pages/dashboard/shop-dashboard.component';
import { ShopProductListComponent } from './pages/products/product-list/shop-product-list.component';
import { ShopProductAddComponent } from './pages/products/product-add/shop-product-add.component';
import { ShopOrdersListComponent } from './pages/orders/orders-list/shop-orders-list.component';
import { ShopOrderFormComponent } from './pages/orders/order-add-edit/shop-order-form.component';
import { ShopOrderDetailComponent } from './pages/orders/order-detail/shop-order-detail.component';
import { ShopSalesComponent } from './pages/sales/shop-sales.component';
import { ShopEmployeesListComponent } from './pages/employees/employees-list/shop-employees-list.component';
import { ShopEmployeeFormComponent } from './pages/employees/employee-form/shop-employee-form.component';
import { ShopClientsListComponent } from './pages/clients/client-list/shop-clients-list.component';
import { ShopClientFormComponent } from './pages/clients/client-add-edit/shop-client-form.component';
import { DeliveryListComponent } from './pages/delivery/list/delivery-list.component';
import { ShopStockListComponent } from './pages/stock/stock-list/shop-stock-list.component';
import { PromotionListComponent } from './pages/promotions/promotion-list/promotion-list.component';
import { PromotionFormComponent } from './pages/promotions/promotion-form/promotion-form.component';
import { DeliveryZonesComponent } from './pages/delivery/zones/delivery-zones.component';
import { ShopProfileComponent } from './pages/profile/shop-profile.component';
import { ShopQuoteRequestsComponent } from './pages/quote-requests/shop-quote-requests.component';

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
      { path: 'products/edit/:id', component: ShopProductAddComponent },
      
      // Orders with CRUD
      { path: 'orders', redirectTo: 'orders/list', pathMatch: 'full' },
      { path: 'orders/list', component: ShopOrdersListComponent },
      { path: 'orders/add', component: ShopOrderFormComponent },
      { path: 'orders/edit/:id', component: ShopOrderFormComponent },
      { path: 'orders/:id', component: ShopOrderDetailComponent },
      
      // Quote Requests
      { path: 'quote-requests', component: ShopQuoteRequestsComponent },
      
      { path: 'sales', component: ShopSalesComponent },
      
      // Clients with CRUD
      { path: 'clients/list', component: ShopClientsListComponent },
      { path: 'clients/add', component: ShopClientFormComponent },
      { path: 'clients/edit/:id', component: ShopClientFormComponent },
      
      // Deliveries
      { path: 'deliveries/list', component: DeliveryListComponent },
      { path: 'deliveries/list2', component: DeliveryListComponent },
      { path: 'deliveries/zones', component: DeliveryZonesComponent },
      
      // Stock Management
      { path: 'stock/list', component: ShopStockListComponent },
      
      // Promotions
      { path: 'promotions', component: PromotionListComponent },
      { path: 'promotions/add', component: PromotionFormComponent },
      { path: 'promotions/edit/:id', component: PromotionFormComponent },
      
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
      
      // Profile
      { path: 'profile', component: ShopProfileComponent },
      
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    ShopLayoutComponent,
    ShopDashboardComponent,
    ShopProductListComponent,
    ShopProductAddComponent,
    ShopOrdersListComponent,
    ShopOrderFormComponent,
    ShopOrderDetailComponent,
    ShopSalesComponent,
    ShopEmployeesListComponent,
    ShopEmployeeFormComponent,
    ShopClientsListComponent,
    ShopClientFormComponent,
    DeliveryListComponent,
    ShopStockListComponent,
    PromotionListComponent,
    PromotionFormComponent,
    DeliveryZonesComponent,
    ShopProfileComponent,
    ShopQuoteRequestsComponent,
    RouterModule.forChild(routes)
  ]
})
export class ShopModule { }
