import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ClientLayoutComponent } from './layout/client-layout.component';
import { ClientHomeComponent } from './pages/home/client-home.component';
import { ShopsListComponent } from './pages/shops/shops-list.component';
import { ShopDetailComponent } from './pages/shop-detail/shop-detail.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { SearchComponent } from './pages/search/search.component';
import { FavoritesComponent } from './pages/favorites/favorites.component';
import { OrdersComponent } from './pages/orders/orders.component';

const routes: Routes = [
  {
    path: '',
    component: ClientLayoutComponent,
    children: [
      { path: 'home', component: ClientHomeComponent },
      { path: 'shops', component: ShopsListComponent },
      { path: 'shops/:id', component: ShopDetailComponent },
      { path: 'products/:id', component: ProductDetailComponent },
      { path: 'search', component: SearchComponent },
      { path: 'favorites', component: FavoritesComponent },
      { path: 'orders', component: OrdersComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ClientLayoutComponent,
    ClientHomeComponent,
    ShopsListComponent,
    ShopDetailComponent,
    ProductDetailComponent,
    SearchComponent,
    FavoritesComponent,
    OrdersComponent,
    RouterModule.forChild(routes)
  ]
})
export class ClientModule { }
