import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ShopLayoutComponent } from './layout/shop-layout.component';
import { ShopDashboardComponent } from './pages/dashboard/shop-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: ShopLayoutComponent,
    children: [
      { path: 'dashboard', component: ShopDashboardComponent },
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
    RouterModule.forChild(routes)
  ]
})
export class ShopModule { }
