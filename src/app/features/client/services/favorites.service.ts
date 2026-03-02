import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface FavoriteShop {
  shop_id: string;
  shop_name: string;
  logo?: string;
  mall_location?: string;
  added_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly STORAGE_KEY = 'favoriteShops';
  private favoritesSubject = new BehaviorSubject<FavoriteShop[]>([]);
  public favorites$: Observable<FavoriteShop[]> = this.favoritesSubject.asObservable();

  constructor() {
    this.loadFavorites();
  }

  private loadFavorites(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const favorites = JSON.parse(stored);
        this.favoritesSubject.next(Array.isArray(favorites) ? favorites : []);
      } catch (e) {
        console.error('Error loading favorites:', e);
        this.favoritesSubject.next([]);
      }
    } else {
      this.favoritesSubject.next([]);
    }
  }

  private saveFavorites(favorites: FavoriteShop[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
    this.favoritesSubject.next(favorites);
  }

  getFavorites(): FavoriteShop[] {
    return this.favoritesSubject.value;
  }

  isFavorite(shopId: string): boolean {
    return this.favoritesSubject.value.some(f => f.shop_id === shopId);
  }

  addToFavorites(shop: {
    shop_id: string;
    shop_name: string;
    logo?: string;
    mall_location?: string;
  }): void {
    const current = this.getFavorites();
    if (this.isFavorite(shop.shop_id)) {
      return; // Already a favorite
    }

    const favorite: FavoriteShop = {
      ...shop,
      added_at: new Date().toISOString()
    };

    const updated = [...current, favorite];
    this.saveFavorites(updated);
  }

  removeFromFavorites(shopId: string): void {
    const current = this.getFavorites();
    const updated = current.filter(f => f.shop_id !== shopId);
    this.saveFavorites(updated);
  }

  toggleFavorite(shop: {
    shop_id: string;
    shop_name: string;
    logo?: string;
    mall_location?: string;
  }): boolean {
    if (this.isFavorite(shop.shop_id)) {
      this.removeFromFavorites(shop.shop_id);
      return false; // Now removed
    } else {
      this.addToFavorites(shop);
      return true; // Now added
    }
  }

  clearFavorites(): void {
    this.saveFavorites([]);
  }

  getFavoritesCount(): number {
    return this.favoritesSubject.value.length;
  }
}
