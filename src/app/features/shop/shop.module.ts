import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ShopLayoutComponent } from './layout/shop-layout.component';
import { ShopDashboardComponent } from './pages/dashboard/shop-dashboard.component';
import { ShopProductListComponent } from './pages/products/product-list/shop-product-list.component';
import { ShopProductAddComponent } from './pages/products/product-add/shop-product-add.component';
import { ShopOrderListComponent } from './pages/orders/order-list/shop-order-list.component';
import { ShopSalesComponent } from './pages/sales/shop-sales.component';

const routes: Routes = [
  {
    path: '',
    component: ShopLayoutComponent,
    children: [
      { path: 'dashboard', component: ShopDashboardComponent },
      { path: 'products/list', component: ShopProductListComponent },
      { path: 'products/add', component: ShopProductAddComponent },
      { path: 'orders/list', component: ShopOrderListComponent },
      { path: 'sales', component: ShopSalesComponent },
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
    ShopSalesComponent,
    RouterModule.forChild(routes)
  ]
})
export class ShopModule { }
