import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AdminLayoutComponent } from './layout/admin-layout.component';
import { AdminDashboardComponent } from './pages/dashboard/admin-dashboard.component';
import { UserListComponent } from './pages/users/user-list/user-list.component';
import { UserAddComponent } from './pages/users/user-add/user-add.component';
import { ShopListComponent } from './pages/shops/shop-list/shop-list.component';
import { ShopAddComponent } from './pages/shops/shop-add/shop-add.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users/list', component: UserListComponent },
      { path: 'users/add', component: UserAddComponent },
      { path: 'shops/list', component: ShopListComponent },
      { path: 'shops/add', component: ShopAddComponent },
      { 
        path: 'products/list', 
        loadComponent: () => import('./pages/products/product-list/product-list.component').then(m => m.ProductListComponent)
      },
      { 
        path: 'products/add', 
        loadComponent: () => import('./pages/products/product-add/product-add.component').then(m => m.ProductAddComponent)
      },
      { 
        path: 'products/edit/:id', 
        loadComponent: () => import('./pages/products/product-add/product-add.component').then(m => m.ProductAddComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class AdminModule { }
