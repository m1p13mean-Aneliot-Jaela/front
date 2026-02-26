import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { ClientLayoutComponent } from './layout/client-layout.component';
import { ClientHomeComponent } from './pages/home/client-home.component';
import { ShopsListComponent } from './pages/shops/shops-list.component';
import { ShopDetailComponent } from './pages/shop-detail/shop-detail.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { OrderConfirmationComponent } from './pages/order-confirmation/order-confirmation.component';
import { OrderDetailComponent } from './pages/order-detail/order-detail.component';
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
      { path: 'checkout', component: CheckoutComponent },
      { path: 'order-confirmation/:id', component: OrderConfirmationComponent },
      { path: 'search', component: SearchComponent },
      { path: 'favorites', component: FavoritesComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'orders/:id', component: OrderDetailComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    ClientLayoutComponent,
    ClientHomeComponent,
    ShopsListComponent,
    ShopDetailComponent,
    ProductDetailComponent,
    CheckoutComponent,
    OrderConfirmationComponent,
    OrderDetailComponent,
    SearchComponent,
    FavoritesComponent,
    OrdersComponent,
    RouterModule.forChild(routes)
  ]
})
export class ClientModule { }
