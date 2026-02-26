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
      { path: 'users', component: UserListComponent },
      { path: 'users/list', component: UserListComponent },
      { path: 'users/add', component: UserAddComponent },
      { 
        path: 'users/edit/:id', 
        loadComponent: () => import('./pages/users/user-edit/user-edit.component').then(m => m.UserEditComponent)
      },
      { path: 'shops/list', component: ShopListComponent },
      { path: 'shops', component: ShopListComponent },
      { path: 'shops/add', component: ShopAddComponent },
      { 
        path: 'shops/:id/edit', 
        loadComponent: () => import('./pages/shops/shop-edit/shop-edit.component').then(m => m.ShopEditComponent)
      },
      { 
        path: 'shop-categories', 
        loadComponent: () => import('./pages/shop-categories/shop-category-list/shop-category-list.component').then(m => m.ShopCategoryListComponent)
      },
      { 
        path: 'shop-categories/add', 
        loadComponent: () => import('./pages/shop-categories/shop-category-form/shop-category-form.component').then(m => m.ShopCategoryFormComponent)
      },
      { 
        path: 'shop-categories/:id/edit', 
        loadComponent: () => import('./pages/shop-categories/shop-category-form/shop-category-form.component').then(m => m.ShopCategoryFormComponent)
      },
      { 
        path: 'shop-boxes', 
        loadComponent: () => import('./pages/shop-boxes/shop-box-list/shop-box-list.component').then(m => m.ShopBoxListComponent)
      },
      { 
        path: 'shop-boxes/add', 
        loadComponent: () => import('./pages/shop-boxes/shop-box-add/shop-box-add.component').then(m => m.ShopBoxAddComponent)
      },
      { 
        path: 'shop-boxes/edit/:id', 
        loadComponent: () => import('./pages/shop-boxes/shop-box-edit/shop-box-edit.component').then(m => m.ShopBoxEditComponent)
      },
      {
        path: 'lease-contracts',
        loadComponent: () => import('./pages/lease-contracts/lease-contract-list/lease-contract-list.component').then(m => m.LeaseContractListComponent)
      },
      {
        path: 'lease-contracts/add',
        loadComponent: () => import('./pages/lease-contracts/lease-contract-form/lease-contract-form.component').then(m => m.LeaseContractFormComponent)
      },
      {
        path: 'lease-contracts/:id/edit',
        loadComponent: () => import('./pages/lease-contracts/lease-contract-form/lease-contract-form.component').then(m => m.LeaseContractFormComponent)
      },
      {
        path: 'rent-payments',
        loadComponent: () => import('./pages/rent-payments/rent-payment-list/rent-payment-list.component').then(m => m.RentPaymentListComponent)
      },
      {
        path: 'rent-payments/add',
        loadComponent: () => import('./pages/rent-payments/rent-payment-form/rent-payment-form.component').then(m => m.RentPaymentFormComponent)
      },
      {
        path: 'rent-payments/:id',
        loadComponent: () => import('./pages/rent-payments/rent-payment-form/rent-payment-form.component').then(m => m.RentPaymentFormComponent)
      },
      {
        path: 'rent-payments/:id/edit',
        loadComponent: () => import('./pages/rent-payments/rent-payment-form/rent-payment-form.component').then(m => m.RentPaymentFormComponent)
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
