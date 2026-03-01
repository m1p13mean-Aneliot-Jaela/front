import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { environment } from '../../../environments/environment';
import { switchMap, tap, catchError } from 'rxjs/operators';

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
  order_id?: {
    _id: string;
    order_number: string;
    total_amount: number;
  };
  shop_id?: {
    _id: string;
    shop_name: string;
  };
  product_id?: {
    _id: string;
    name: string;
  };
  action_data?: {
    url?: string;
    icon?: string;
    color?: string;
    priority?: 'LOW' | 'NORMAL' | 'HIGH';
  };
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  unreadCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  // BehaviorSubjects for reactive updates
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  notifications$ = this.notificationsSubject.asObservable();
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Get all notifications
  getNotifications(unreadOnly: boolean = false, limit: number = 20): Observable<NotificationResponse> {
    return this.http.get<any>(`${this.apiUrl}`, {
      params: { unreadOnly: unreadOnly.toString(), limit: limit.toString() }
    }).pipe(
      tap(response => {
        if (response.success) {
          this.notificationsSubject.next(response.data);
          this.unreadCountSubject.next(response.data.unreadCount);
        }
      }),
      catchError(error => {
        console.error('Error fetching notifications:', error);
        throw error;
      })
    );
  }

  // Get unread count only
  getUnreadCount(): Observable<number> {
    return this.http.get<any>(`${this.apiUrl}/unread-count`).pipe(
      tap(response => {
        if (response.success) {
          this.unreadCountSubject.next(response.data.count);
        }
      }),
      catchError(error => {
        console.error('Error fetching unread count:', error);
        throw error;
      })
    );
  }

  // Mark a notification as read
  markAsRead(notificationId: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${notificationId}/read`, {}).pipe(
      tap(() => {
        this.refreshUnreadCount();
      })
    );
  }

  // Mark all as read
  markAllAsRead(): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/mark-all-read`, {}).pipe(
      tap(() => {
        this.unreadCountSubject.next(0);
        this.refreshNotifications();
      })
    );
  }

  // Refresh notifications
  refreshNotifications(): void {
    this.getNotifications().subscribe();
  }

  // Refresh unread count
  refreshUnreadCount(): void {
    this.getUnreadCount().subscribe();
  }

  // Start polling for new notifications
  startPolling(intervalMs: number = 30000): Observable<number> {
    return interval(intervalMs).pipe(
      switchMap(() => this.getUnreadCount()),
      catchError(() => [])
    );
  }

  // Get notification icon based on type
  getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      // Order notifications
      'ORDER_NEW': 'shopping_cart',
      'ORDER_CREATED': 'shopping_bag',
      'ORDER_ASSIGNED': 'assignment_ind',
      'ORDER_CONFIRMED': 'check_circle',
      'ORDER_PAYMENT_REQUESTED': 'payment',
      'ORDER_PAID': 'paid',
      'ORDER_SHIPPED': 'local_shipping',
      'ORDER_DELIVERED': 'home',
      'ORDER_CANCELED': 'cancel',
      'ORDER_REFUNDED': 'money_off',

      // Quote request notifications
      'QUOTE_REQUEST': 'request_quote',
      'QUOTE_RESPONSE': 'receipt',
      'QUOTE_ACCEPTED': 'check_circle',
      'QUOTE_REJECTED': 'cancel',

      // Payment notifications
      'PAYMENT_RECEIVED': 'paid',
      'PAYMENT_FAILED': 'error',
      'PAYMENT_PENDING': 'schedule',

      // Rent payment notifications
      'RENT_PAYMENT_DUE': 'payment',
      'RENT_PAYMENT_RECEIVED': 'check_circle',
      'RENT_PAYMENT_OVERDUE': 'error',
      'RENT_PAYMENT_FAILED': 'error',

      // Shop notifications
      'STOCK_LOW': 'warning',
      'STOCK_OUT': 'error',
      'REVIEW_NEW': 'star',

      // Client notifications
      'PROMOTION_NEW': 'campaign',
      'PROMOTION_EXPIRING': 'schedule',
      'WISHLIST_PRICE_DROP': 'trending_down',

      // System notifications
      'SYSTEM': 'notifications',
      'WELCOME': 'emoji_people',
      'ACCOUNT_VERIFIED': 'verified_user',
      'PASSWORD_CHANGED': 'lock',
      'DELIVERY_UPDATE': 'local_shipping'
    };
    return icons[type] || 'notifications';
  }

  // Get notification color based on type
  getNotificationColor(type: string): string {
    const colors: { [key: string]: string } = {
      // Order notifications
      'ORDER_NEW': 'success',
      'ORDER_CREATED': 'success',
      'ORDER_ASSIGNED': 'info',
      'ORDER_CONFIRMED': 'success',
      'ORDER_PAYMENT_REQUESTED': 'warning',
      'ORDER_PAID': 'success',
      'ORDER_SHIPPED': 'info',
      'ORDER_DELIVERED': 'success',
      'ORDER_CANCELED': 'error',
      'ORDER_REFUNDED': 'warning',

      // Quote request notifications
      'QUOTE_REQUEST': 'info',
      'QUOTE_RESPONSE': 'success',
      'QUOTE_ACCEPTED': 'success',
      'QUOTE_REJECTED': 'warning',

      // Payment notifications
      'PAYMENT_RECEIVED': 'success',
      'PAYMENT_FAILED': 'error',
      'PAYMENT_PENDING': 'warning',

      // Rent payment notifications
      'RENT_PAYMENT_DUE': 'warning',
      'RENT_PAYMENT_RECEIVED': 'success',
      'RENT_PAYMENT_OVERDUE': 'error',
      'RENT_PAYMENT_FAILED': 'error',

      // Shop notifications
      'STOCK_LOW': 'warning',
      'STOCK_OUT': 'error',
      'REVIEW_NEW': 'info',

      // Client notifications
      'PROMOTION_NEW': 'success',
      'PROMOTION_EXPIRING': 'warning',
      'WISHLIST_PRICE_DROP': 'success',

      // System notifications
      'SYSTEM': 'info',
      'WELCOME': 'success',
      'ACCOUNT_VERIFIED': 'success',
      'PASSWORD_CHANGED': 'warning',
      'DELIVERY_UPDATE': 'info'
    };
    return colors[type] || 'info';
  }

  // Get action URL based on notification
  getActionUrl(notification: Notification): string {
    if (notification.action_data?.url) {
      return notification.action_data.url;
    }

    // Fallback URLs based on notification type
    if (notification.type.startsWith('ORDER_')) {
      return `/client/orders/${notification.order_id?._id || ''}`;
    }

    if (notification.type.startsWith('QUOTE_')) {
      return '/client/quote-requests';
    }

    if (notification.type.startsWith('RENT_PAYMENT_')) {
      return '/boutique/payments';
    }

    if (notification.type === 'PROMOTION_NEW') {
      return `/client/shops/${notification.shop_id?._id || ''}`;
    }

    return '/client/notifications';
  }
}
