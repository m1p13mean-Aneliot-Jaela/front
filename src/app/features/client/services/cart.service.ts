import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CartItem {
  product_id: string;
  product_name: string;
  shop_id: string;
  shop_name: string;
  quantity: number;
  unit_price: number;
  notes?: string;
}

export interface Cart {
  items: CartItem[];
  shop_id: string | null;
  shop_name: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly STORAGE_KEY = 'quote_cart';
  
  private cartSubject = new BehaviorSubject<Cart>(this.loadCart());
  cart$ = this.cartSubject.asObservable();

  constructor() {}

  private loadCart(): Cart {
    if (typeof window === 'undefined') {
      return { items: [], shop_id: null, shop_name: null };
    }
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return { items: [], shop_id: null, shop_name: null };
  }

  private saveCart(cart: Cart): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
    }
    this.cartSubject.next(cart);
  }

  getCart(): Cart {
    return this.cartSubject.value;
  }

  addToCart(item: CartItem): void {
    const cart = this.getCart();
    
    // If cart is empty, set the shop
    if (cart.items.length === 0) {
      cart.shop_id = item.shop_id;
      cart.shop_name = item.shop_name;
    }
    
    // Check if item already exists
    const existingIndex = cart.items.findIndex(i => i.product_id === item.product_id);
    
    if (existingIndex >= 0) {
      // Update quantity if item exists
      cart.items[existingIndex].quantity += item.quantity;
    } else {
      // Add new item
      cart.items.push(item);
    }
    
    this.saveCart(cart);
  }

  updateQuantity(productId: string, quantity: number): void {
    const cart = this.getCart();
    const index = cart.items.findIndex(i => i.product_id === productId);
    
    if (index >= 0) {
      if (quantity <= 0) {
        cart.items.splice(index, 1);
      } else {
        cart.items[index].quantity = quantity;
      }
      
      // If cart is empty, reset shop
      if (cart.items.length === 0) {
        cart.shop_id = null;
        cart.shop_name = null;
      }
      
      this.saveCart(cart);
    }
  }

  updateNotes(productId: string, notes: string): void {
    const cart = this.getCart();
    const index = cart.items.findIndex(i => i.product_id === productId);
    
    if (index >= 0) {
      cart.items[index].notes = notes;
      this.saveCart(cart);
    }
  }

  removeFromCart(productId: string): void {
    const cart = this.getCart();
    cart.items = cart.items.filter(i => i.product_id !== productId);
    
    // If cart is empty, reset shop
    if (cart.items.length === 0) {
      cart.shop_id = null;
      cart.shop_name = null;
    }
    
    this.saveCart(cart);
  }

  clearCart(): void {
    this.saveCart({ items: [], shop_id: null, shop_name: null });
  }

  getItemCount(): number {
    return this.getCart().items.reduce((sum, item) => sum + item.quantity, 0);
  }

  canAddFromShop(shopId: string): boolean {
    const cart = this.getCart();
    return cart.items.length === 0 || cart.shop_id === shopId;
  }

  getCartItemsForQuote(): Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    notes?: string;
  }> {
    return this.getCart().items.map(item => ({
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      notes: item.notes
    }));
  }
}
