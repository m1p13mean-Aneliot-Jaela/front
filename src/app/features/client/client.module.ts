import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ClientLayoutComponent } from './layout/client-layout.component';
import { ClientDashboardComponent } from './pages/dashboard/client-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: ClientLayoutComponent,
    children: [
      { path: 'dashboard', component: ClientDashboardComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ClientLayoutComponent,
    ClientDashboardComponent,
    RouterModule.forChild(routes)
  ]
})
export class ClientModule { }
