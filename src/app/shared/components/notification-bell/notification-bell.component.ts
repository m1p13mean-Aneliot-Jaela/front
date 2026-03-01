import { Component, OnInit, OnDestroy, HostListener, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="notification-container">
      <button class="notification-btn" (click)="toggleDropdown($event)">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
        </svg>
        <span class="badge" *ngIf="filteredUnreadCount > 0">{{ filteredUnreadCount > 99 ? '99+' : filteredUnreadCount }}</span>
      </button>

      <div class="notification-dropdown" *ngIf="isOpen">
        <div class="dropdown-header">
          <h4>
            <svg class="header-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
            </svg>
          </h4>
          <button *ngIf="filteredNotifications.length > 0" class="mark-all-btn" (click)="markAllAsRead($event)">
            Tout marquer comme lu
          </button>
        </div>

        <div class="notification-list" *ngIf="filteredNotifications.length > 0; else noNotifications">
          <div
            *ngFor="let notification of filteredNotifications"
            class="notification-item"
            [class.unread]="!notification.is_read"
            [ngClass]="notification.action_data?.color || getNotificationColor(notification.type)"
            (click)="onNotificationClick(notification, $event)"
          >
            <div class="notification-icon">
              <span class="material-icons">{{ getIcon(notification) }}</span>
            </div>
            <div class="notification-content">
              <h5 class="notif-title">{{ notification.title }}</h5>
              <p class="notif-message">{{ notification.message }}</p>
              <span class="time">{{ formatTime(notification.created_at) }}</span>
            </div>
            <button
              *ngIf="!notification.is_read"
              class="mark-read-btn"
              (click)="markAsRead(notification._id, $event)"
            >
              <span class="material-icons">done</span>
            </button>
          </div>
        </div>

        <ng-template #noNotifications>
          <div class="no-notifications">
            <span class="material-icons">notifications_off</span>
            <p>Aucune notification</p>
          </div>
        </ng-template>

        <div class="dropdown-footer" *ngIf="filteredNotifications.length > 0">
          <a [routerLink]="notificationLink">Voir toutes les notifications</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: relative;
      display: inline-block;
    }

    .notification-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: background-color 0.2s;
      position: relative;
    }

    .notification-btn:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }

    .notification-btn .material-icons {
      font-size: 24px;
      color: #555;
    }

    .badge {
      position: absolute;
      top: 0;
      right: 0;
      background-color: #e74c3c;
      color: white;
      font-size: 11px;
      font-weight: bold;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
    }

    .notification-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      width: 360px;
      max-height: 500px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      overflow: hidden;
    }

    .dropdown-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #eee;
    }

    .dropdown-header h4 {
      margin: 0;
      display: flex;
      align-items: center;
    }

    .header-icon {
      font-size: 24px;
      color: #555;
    }

    .mark-all-btn {
      background: none;
      border: none;
      color: #3498db;
      font-size: 12px;
      cursor: pointer;
      padding: 4px 8px;
    }

    .mark-all-btn:hover {
      background-color: #f0f0f0;
      border-radius: 4px;
    }

    .notification-list {
      max-height: 350px;
      overflow-y: auto;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      padding: 12px 16px;
      border-bottom: 1px solid #f5f5f5;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .notification-item:hover {
      background-color: #f8f9fa;
    }

    .notification-item.unread {
      background-color: #fff3cd;
      border-left: 3px solid #ffc107;
    }

    .notification-item.success {
      border-left-color: #28a745;
    }

    .notification-item.warning {
      border-left-color: #ffc107;
    }

    .notification-item.error {
      border-left-color: #dc3545;
    }

    .notification-item.info {
      border-left-color: #17a2b8;
    }

    .notification-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      flex-shrink: 0;
    }

    .notification-icon .material-icons {
      font-size: 20px;
      color: #555;
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-content h5.notif-title {
      margin: 0 0 6px 0;
      font-size: 15px;
      font-weight: 600;
      color: #1a1a1a;
      line-height: 1.3;
    }

    .notification-content p.notif-message {
      margin: 0 0 6px 0;
      font-size: 14px;
      color: #444;
      line-height: 1.5;
    }

    .notification-content .time {
      font-size: 11px;
      color: #999;
    }

    .mark-read-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .notification-item:hover .mark-read-btn {
      opacity: 1;
    }

    .mark-read-btn .material-icons {
      font-size: 18px;
      color: #28a745;
    }

    .no-notifications {
      text-align: center;
      padding: 40px 20px;
      color: #999;
    }

    .no-notifications .material-icons {
      font-size: 48px;
      margin-bottom: 12px;
      opacity: 0.5;
    }

    .dropdown-footer {
      padding: 12px 16px;
      text-align: center;
      border-top: 1px solid #eee;
    }

    .dropdown-footer a {
      color: #3498db;
      text-decoration: none;
      font-size: 13px;
    }

    .dropdown-footer a:hover {
      text-decoration: underline;
    }
  `]
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  @Input() userType: 'client' | 'shop' = 'client';
  notifications: Notification[] = [];
  unreadCount = 0;
  isOpen = false;
  notificationLink = '/client/notifications';

  private destroy$ = new Subject<void>();

  // Types de notifications pour la boutique (commandes, paiements, devis, loyer)
  private shopNotificationTypes = [
    'ORDER_NEW', 
    'ORDER_PAID', 
    'QUOTE_REQUEST',
    'QUOTE_ACCEPTED',
    'QUOTE_REJECTED',
    'PAYMENT_RECEIVED',
    'RENT_PAYMENT_DUE',
    'RENT_PAYMENT_RECEIVED',
    'RENT_PAYMENT_OVERDUE',
    'RENT_PAYMENT_FAILED',
    'STOCK_LOW',
    'STOCK_OUT',
    'REVIEW_NEW'
  ];
  
  // Types de notifications pour le client (statuts de commande, devis, promotions)
  private clientNotificationTypes = [
    'ORDER_NEW',
    'ORDER_CREATED',
    'ORDER_ASSIGNED',
    'ORDER_CONFIRMED', 
    'ORDER_PAYMENT_REQUESTED', 
    'ORDER_SHIPPED', 
    'ORDER_DELIVERED', 
    'ORDER_CANCELED',
    'ORDER_REFUNDED',
    'QUOTE_RESPONSE',
    'PROMOTION_NEW',
    'PROMOTION_EXPIRING',
    'WISHLIST_PRICE_DROP',
    'WELCOME',
    'SYSTEM',
    'DELIVERY_UPDATE'
  ];

  get filteredNotifications(): Notification[] {
    if (this.userType === 'shop') {
      // Shop: commandes et paiements uniquement
      return this.notifications.filter(n => this.shopNotificationTypes.includes(n.type));
    }
    // Client: tout sauf les notifications shop (ORDER_NEW, ORDER_PAID)
    return this.notifications.filter(n => !this.shopNotificationTypes.includes(n.type));
  }

  get filteredUnreadCount(): number {
    return this.filteredNotifications.filter(n => !n.is_read).length;
  }

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNotifications();

    // Subscribe to unread count
    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-container')) {
      this.isOpen = false;
    }
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.loadNotifications();
    }
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (response: any) => {
        if (response.success) {
          // Backend returns data directly as array, not wrapped in notifications property
          this.notifications = Array.isArray(response.data) ? response.data : (response.data.notifications || []);
          this.unreadCount = response.data.unreadCount || this.notifications.filter((n: Notification) => !n.is_read).length;
          console.log('🔔 [NotificationBell] Loaded notifications:', this.notifications);
        }
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
      }
    });
  }

  onNotificationClick(notification: Notification, event: Event): void {
    event.stopPropagation();

    // Mark as read
    if (!notification.is_read) {
      this.notificationService.markAsRead(notification._id).subscribe();
    }

    // Navigate to action URL
    const url = this.notificationService.getActionUrl(notification);
    if (url) {
      this.router.navigateByUrl(url);
    }

    this.isOpen = false;
  }

  markAsRead(notificationId: string, event: Event): void {
    event.stopPropagation();
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        const notification = this.notifications.find(n => n._id === notificationId);
        if (notification) {
          notification.is_read = true;
        }
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
    });
  }

  markAllAsRead(event: Event): void {
    event.stopPropagation();
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.is_read = true);
        this.unreadCount = 0;
      }
    });
  }

  getIcon(notification: Notification): string {
    return notification.action_data?.icon ||
           this.notificationService.getNotificationIcon(notification.type);
  }

  getNotificationColor(type: string): string {
    return this.notificationService.getNotificationColor(type);
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return minutes < 1 ? 'À l\'instant' : `Il y a ${minutes} min`;
    }

    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `Il y a ${hours}h`;
    }

    // Less than 7 days
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `Il y a ${days} j`;
    }

    return date.toLocaleDateString('fr-FR');
  }
}
