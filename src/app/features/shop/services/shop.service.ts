import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

export interface ShopLocation {
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface BusinessHoursDay {
  open: string;
  close: string;
  closed: boolean;
}

export interface BusinessHours {
  monday?: BusinessHoursDay;
  tuesday?: BusinessHoursDay;
  wednesday?: BusinessHoursDay;
  thursday?: BusinessHoursDay;
  friday?: BusinessHoursDay;
  saturday?: BusinessHoursDay;
  sunday?: BusinessHoursDay;
}

export interface ShopContact {
  phone?: string;
  email?: string;
  website?: string;
  whatsapp?: string;
}

export interface ShopSocialMedia {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
}

export interface ShopProfile {
  _id?: string;
  shop_id?: string;
  name: string;
  logo?: string;
  description?: string;
  categories?: {
    category_id?: {
      _id?: string;
      name?: string;
    };
    name?: string;
    assigned_at?: string;
  }[];
  location?: ShopLocation;
  business_hours?: BusinessHours;
  contact?: ShopContact;
  social_media?: ShopSocialMedia;
  settings?: {
    currency?: string;
    timezone?: string;
    language?: string;
  };
  is_active?: boolean;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ShopOpenStatus {
  open: boolean;
  reason?: string;
  hours?: BusinessHoursDay;
  next_open?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  constructor(
    private api: ApiService,
    private authService: AuthService
  ) {}

  // Get my shop profile (uses shop_id from auth)
  getMyProfile(): Observable<{ success: boolean; data: ShopProfile }> {
    const shopId = this.authService.currentUserValue?.shop_id;
    if (!shopId) {
      return throwError(() => new Error('Shop ID not found in user profile'));
    }
    return this.getProfile(shopId);
  }

  // Get my shop categories (uses shop_id from auth)
  getMyCategories(): Observable<{ success: boolean; data: { categories: any[] } }> {
    return this.api.get<{ success: boolean; data: { categories: any[] } }>(
      `/shops/me/categories`,
      undefined,
      { withCredentials: true }
    );
  }

  // Update my shop profile (uses shop_id from auth)
  updateMyProfile(profile: Partial<ShopProfile>): Observable<{ success: boolean; message: string; data: ShopProfile }> {
    const shopId = this.authService.currentUserValue?.shop_id;
    if (!shopId) {
      return throwError(() => new Error('Shop ID not found in user profile'));
    }
    return this.updateProfile(shopId, profile);
  }

  // Get shop profile by ID (uses public endpoint)
  getProfile(shopId: string): Observable<{ success: boolean; data: ShopProfile }> {
    return this.api.get<{ success: boolean; data: ShopProfile }>(
      `/shops/${shopId}/public`,
      undefined,
      { withCredentials: true }
    );
  }

  // Update shop profile
  updateProfile(shopId: string, profile: Partial<ShopProfile>): Observable<{ success: boolean; message: string; data: ShopProfile }> {
    return this.api.patch<{ success: boolean; message: string; data: ShopProfile }>(
      `/shops/${shopId}/profile`,
      profile,
      { withCredentials: true }
    );
  }

  // Update logo URL
  updateLogo(shopId: string, logoUrl: string): Observable<{ success: boolean; message: string; data: ShopProfile }> {
    return this.api.patch<{ success: boolean; message: string; data: ShopProfile }>(
      `/shops/${shopId}/profile/logo`,
      { logo_url: logoUrl },
      { withCredentials: true }
    );
  }

  // Update location (with Google Maps coordinates)
  updateLocation(shopId: string, location: ShopLocation): Observable<{ success: boolean; message: string; data: ShopProfile }> {
    return this.api.patch<{ success: boolean; message: string; data: ShopProfile }>(
      `/shops/${shopId}/profile/location`,
      location,
      { withCredentials: true }
    );
  }

  // Update business hours
  updateBusinessHours(shopId: string, hours: BusinessHours): Observable<{ success: boolean; message: string; data: ShopProfile }> {
    return this.api.patch<{ success: boolean; message: string; data: ShopProfile }>(
      `/shops/${shopId}/profile/hours`,
      hours,
      { withCredentials: true }
    );
  }

  // Check if shop is open
  checkOpenStatus(shopId: string): Observable<{ success: boolean; data: ShopOpenStatus }> {
    return this.api.get<{ success: boolean; data: ShopOpenStatus }>(
      `/shops/${shopId}/open-status`,
      undefined,
      { withCredentials: true }
    );
  }

  // Upload logo (base64)
  uploadLogo(shopId: string, file: File): Observable<{ success: boolean; message: string; data: { logo_url: string; profile: ShopProfile } }> {
    return new Observable(observer => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        
        this.api.post<{ success: boolean; message: string; data: any }>(
          `/shops/${shopId}/profile/logo/upload`,
          { logo_base64: base64String },
          { withCredentials: true }
        ).subscribe(observer);
      };
      reader.onerror = (error) => {
        observer.error(error);
      };
      reader.readAsDataURL(file);
    });
  }

  // Get nearby shops (public endpoint)
  getNearbyShops(lat: number, lng: number, distance?: number): Observable<{ success: boolean; data: (ShopProfile & { distance: number })[] }> {
    const params = new URLSearchParams();
    params.set('lat', lat.toString());
    params.set('lng', lng.toString());
    if (distance) params.set('distance', distance.toString());

    return this.api.get<{ success: boolean; data: any }>(
      `/shops/nearby?${params.toString()}`
    );
  }
}
