import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DeliveryService, Delivery, DeliveryStatus, DeliveryStats } from '../../../services/delivery.service';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-delivery-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="header-actions">
        <h2>Suivi des livraisons</h2>
        <div class="header-filters">
          <select class="filter-select" [(ngModel)]="statusFilter" (change)="applyFilters()">
            <option value="">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="CONFIRMED">Confirmé</option>
            <option value="PREPARING">En préparation</option>
            <option value="IN_TRANSIT">En transit</option>
            <option value="OUT_FOR_DELIVERY">En cours de livraison</option>
            <option value="DELIVERED">Livré</option>
            <option value="CANCELLED">Annulé</option>
          </select>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-cards" *ngIf="stats">
        <div class="stat-card total">
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">Total {{ stats.period }}j</span>
        </div>
        <div class="stat-card delivered">
          <span class="stat-value">{{ stats.byStatus?.DELIVERED || 0 }}</span>
          <span class="stat-label">Livrés</span>
        </div>
        <div class="stat-card transit">
          <span class="stat-value">{{ inTransitCount }}</span>
          <span class="stat-label">En cours</span>
        </div>
        <div class="stat-card" *ngIf="stats.avgDeliveryTimeMs > 0">
          <span class="stat-value">{{ formatDuration(stats.avgDeliveryTimeMs) }}</span>
          <span class="stat-label">Délai moyen</span>
        </div>
      </div>

      <!-- Deliveries Table -->
      <div *ngIf="!loading && !error" class="table-container">
        <table class="deliveries-table">
          <thead>
            <tr>
              <th>N° Suivi</th>
              <th>Destination</th>
              <th>Zone</th>
              <th>Frais</th>
              <th>Statut</th>
              <th>Dernière mise à jour</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let delivery of filteredDeliveries" [class.cancelled]="delivery.status === 'CANCELLED'">
              <!-- Tracking -->
              <td>
                <div class="tracking-info">
                  <span class="tracking-number">{{ delivery.tracking_number }}</span>
                  <span class="carrier" *ngIf="delivery.carrier?.name">{{ delivery.carrier?.name }}</span>
                </div>
              </td>

              <!-- Destination -->
              <td>
                <div class="destination">
                  <div class="recipient">{{ delivery.delivery_address?.recipient_name || '—' }}</div>
                  <div class="address">{{ delivery.delivery_address?.city || '—' }}</div>
                  <div class="phone" *ngIf="delivery.delivery_address?.recipient_phone">
                    ☎ {{ delivery.delivery_address?.recipient_phone }}
                  </div>
                </div>
              </td>

              <!-- Zone -->
              <td>{{ delivery.zone_name || '—' }}</td>

              <!-- Fee -->
              <td>
                <div class="fee" [class.free]="delivery.free_delivery_applied">
                  <span *ngIf="delivery.free_delivery_applied" class="free-badge">GRATUIT</span>
                  <span *ngIf="!delivery.free_delivery_applied">{{ getDeliveryFeeAmount(delivery) | number }} {{ getDeliveryFeeCurrency(delivery) }}</span>
                </div>
              </td>

              <!-- Status -->
              <td>
                <span class="status-badge" [style.background-color]="getStatusColor(delivery.status)"
                      [style.color]="getStatusTextColor(delivery.status)">
                  {{ getStatusLabel(delivery.status) }}
                </span>
              </td>

              <!-- Last Update -->
              <td>
                <div class="last-update">
                  <span class="date">{{ getLastUpdate(delivery) | date:'dd/MM/yy HH:mm' }}</span>
                  <span class="time-ago">{{ getTimeAgo(getLastUpdate(delivery)) }}</span>
                </div>
              </td>

              <!-- Actions -->
              <td>
                <div class="actions-cell">
                  <button class="btn-icon" (click)="viewDetails(delivery)" title="Voir détails">⊙</button>
                  <button class="btn-icon" (click)="updateStatus(delivery)" title="Mettre à jour"
                          *ngIf="canUpdateStatus(delivery.status)">✎</button>
                  <button class="btn-icon" (click)="refreshTracking(delivery)" title="Actualiser suivi"
                          *ngIf="delivery.carrier?.external_tracking_id">↻</button>
                  <button class="btn-icon cancel" (click)="cancelDelivery(delivery)" title="Annuler"
                          *ngIf="canCancel(delivery.status)">❌</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="pagination" *ngIf="pagination.pages > 1">
          <button class="btn-page" (click)="changePage(pagination.page - 1)" [disabled]="pagination.page === 1">
            Précédent
          </button>
          <span class="page-info">Page {{ pagination.page }} / {{ pagination.pages }}</span>
          <button class="btn-page" (click)="changePage(pagination.page + 1)" [disabled]="pagination.page === pagination.pages">
            Suivant
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && !error && filteredDeliveries.length === 0" class="empty-state">
        <div class="empty-icon">▢</div>
        <p>Aucune livraison trouvée</p>
      </div>

      <!-- Loading & Error -->
      <div *ngIf="loading" class="loading">Chargement...</div>
      <div *ngIf="error" class="error-message">{{ error }}</div>
    </div>

    <!-- Status Update Modal -->
    <div *ngIf="showStatusModal" class="modal-overlay" (click)="closeStatusModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Mise à jour du statut</h3>
          <p class="tracking">{{ selectedDelivery?.tracking_number }}</p>
        </div>

        <div class="status-flow">
          <div *ngFor="let status of statusFlow" 
               class="status-step"
               [class.active]="status === selectedDelivery?.status"
               [class.completed]="isStatusCompleted(status)"
               (click)="newStatus = status">
            <div class="step-dot"></div>
            <span class="step-label">{{ getStatusLabel(status) }}</span>
          </div>
        </div>

        <div class="form-group" *ngIf="newStatus">
          <label>Note (optionnel)</label>
          <textarea class="form-control" [(ngModel)]="statusNote" rows="2"
                    placeholder="Ex: Colis déposé au point relais..."></textarea>
        </div>

        <div class="form-group" *ngIf="newStatus === 'DELIVERED'">
          <label>Nom du récepteur</label>
          <input type="text" class="form-control" [(ngModel)]="recipientName"
                 placeholder="Nom de la personne ayant reçu">
        </div>

        <div class="modal-actions">
          <button class="btn-secondary" (click)="closeStatusModal()">Annuler</button>
          <button class="btn-primary" [disabled]="!newStatus || newStatus === selectedDelivery?.status" 
                  (click)="confirmStatusUpdate()">
            Mettre à jour
          </button>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <div *ngIf="showDetailsModal" class="modal-overlay" (click)="closeDetailsModal()">
      <div class="modal modal-large" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Détails de la livraison</h3>
          <span class="tracking-number">{{ selectedDelivery?.tracking_number }}</span>
        </div>

        <div class="details-content" *ngIf="selectedDelivery">
          <!-- Status Timeline -->
          <div class="timeline-section">
            <h4>Historique des statuts</h4>
            <div class="timeline">
              <div *ngFor="let history of selectedDelivery.status_history; let last = last" 
                   class="timeline-item" [class.last]="last">
                <div class="timeline-dot" [style.background-color]="getStatusColor(history.status)"></div>
                <div class="timeline-content">
                  <div class="timeline-status">{{ getStatusLabel(history.status) }}</div>
                  <div class="timeline-date">{{ history.timestamp | date:'dd/MM/yy HH:mm' }}</div>
                  <div class="timeline-note" *ngIf="history.note">{{ history.note }}</div>
                  <div class="timeline-location" *ngIf="history.location">⊛ {{ history.location }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Address -->
          <div class="address-section">
            <h4>Adresse de livraison</h4>
            <div class="address-card">
              <p><strong>{{ selectedDelivery.delivery_address?.recipient_name || '—' }}</strong></p>
              <p>{{ selectedDelivery.delivery_address?.address_line1 || '—' }}</p>
              <p *ngIf="selectedDelivery.delivery_address?.address_line2">{{ selectedDelivery.delivery_address?.address_line2 }}</p>
              <p>{{ selectedDelivery.delivery_address?.postal_code || '—' }} {{ selectedDelivery.delivery_address?.city || '—' }}</p>
              <p *ngIf="selectedDelivery.delivery_address?.recipient_phone">
                ☎ {{ selectedDelivery.delivery_address?.recipient_phone }}
              </p>
            </div>
          </div>

          <!-- External Tracking -->
          <div class="tracking-section" *ngIf="selectedDelivery.carrier?.external_tracking_id">
            <h4>Suivi externe</h4>
            <div class="tracking-info-card">
              <p><strong>Transporteur:</strong> {{ selectedDelivery.carrier?.name }}</p>
              <p><strong>N° suivi:</strong> {{ selectedDelivery.carrier?.external_tracking_id }}</p>
              <p *ngIf="selectedDelivery.external_tracking_data?.last_sync">
                <strong>Dernière sync:</strong> {{ selectedDelivery.external_tracking_data?.last_sync | date:'dd/MM/yy HH:mm' }}
              </p>
            </div>

            <!-- Checkpoints -->
            <div class="checkpoints" *ngIf="selectedDelivery.external_tracking_data?.checkpoints?.length">
              <div *ngFor="let checkpoint of selectedDelivery.external_tracking_data?.checkpoints" class="checkpoint">
                <div class="checkpoint-date">{{ checkpoint.date | date:'dd/MM/yy HH:mm' }}</div>
                <div class="checkpoint-status">{{ checkpoint.status }}</div>
                <div class="checkpoint-location" *ngIf="checkpoint.location">⊛ {{ checkpoint.location }}</div>
                <div class="checkpoint-message" *ngIf="checkpoint.message">{{ checkpoint.message }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-secondary" (click)="closeDetailsModal()">Fermer</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem;
    }

    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    h2 {
      margin: 0;
      color: #1e293b;
    }
    .filter-select {
      padding: 0.625rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: white;
      font-size: 0.875rem;
    }

    /* Stats */
    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .stat-card {
      background: white;
      padding: 1rem;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .stat-card.total { border-left: 4px solid #8b5cf6; }
    .stat-card.delivered { border-left: 4px solid #059669; }
    .stat-card.transit { border-left: 4px solid #3b82f6; }
    .stat-value {
      display: block;
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e293b;
    }
    .stat-label {
      font-size: 0.75rem;
      color: #64748b;
      text-transform: uppercase;
    }

    /* Table */
    .table-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .deliveries-table {
      width: 100%;
      border-collapse: collapse;
    }
    .deliveries-table th {
      background: #f8fafc;
      padding: 0.75rem 1rem;
      text-align: left;
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      border-bottom: 1px solid #e2e8f0;
    }
    .deliveries-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #f1f5f9;
      font-size: 0.875rem;
    }
    .deliveries-table tr:hover {
      background: #f8fafc;
    }
    .deliveries-table tr.cancelled {
      opacity: 0.6;
      background: #f3f4f6;
    }

    .tracking-info {
      display: flex;
      flex-direction: column;
    }
    .tracking-number {
      font-weight: 600;
      color: #1e293b;
      font-family: monospace;
    }
    .carrier {
      font-size: 0.75rem;
      color: #64748b;
    }

    .destination .recipient {
      font-weight: 500;
    }
    .destination .address {
      font-size: 0.75rem;
      color: #64748b;
    }
    .destination .phone {
      font-size: 0.75rem;
      color: #3b82f6;
    }

    .fee {
      font-weight: 600;
    }
    .fee.free .free-badge {
      background: #d1fae5;
      color: #059669;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
    }

    .status-badge {
      display: inline-block;
      padding: 0.375rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .last-update {
      display: flex;
      flex-direction: column;
    }
    .last-update .date {
      font-size: 0.875rem;
    }
    .last-update .time-ago {
      font-size: 0.75rem;
      color: #64748b;
    }

    .actions-cell {
      display: flex;
      gap: 0.25rem;
    }
    .btn-icon {
      width: 28px;
      height: 28px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      background: #f1f5f9;
      font-size: 0.75rem;
    }
    .btn-icon:hover {
      background: #e2e8f0;
    }
    .btn-icon.cancel:hover {
      background: #fee2e2;
    }

    /* Pagination */
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
    }
    .btn-page {
      padding: 0.5rem 1rem;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      cursor: pointer;
    }
    .btn-page:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .page-info {
      color: #64748b;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 3rem;
      background: white;
      border-radius: 12px;
    }
    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal {
      background: white;
      border-radius: 12px;
      width: 500px;
      max-width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }
    .modal-large {
      width: 700px;
    }
    .modal-header {
      padding: 1.25rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-header h3 {
      margin: 0;
      color: #1e293b;
    }
    .modal-header .tracking {
      color: #64748b;
      font-family: monospace;
      font-size: 0.875rem;
    }

    /* Status Flow */
    .status-flow {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      padding: 1.25rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .status-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 0.5rem;
      cursor: pointer;
      border-radius: 8px;
      min-width: 80px;
    }
    .status-step:hover {
      background: #f8fafc;
    }
    .status-step.active {
      background: #dbeafe;
    }
    .status-step.completed {
      background: #d1fae5;
    }
    .step-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #e2e8f0;
    }
    .status-step.active .step-dot {
      background: #3b82f6;
    }
    .status-step.completed .step-dot {
      background: #059669;
    }
    .step-label {
      font-size: 0.625rem;
      text-align: center;
      color: #64748b;
    }

    .form-group {
      padding: 1rem 1.25rem;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }
    .form-control {
      width: 100%;
      padding: 0.625rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.875rem;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1.25rem;
      border-top: 1px solid #e2e8f0;
    }
    .btn-secondary {
      padding: 0.625rem 1rem;
      background: #f1f5f9;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }
    .btn-primary {
      padding: 0.625rem 1rem;
      background: #8b5cf6;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }
    .btn-primary:disabled {
      opacity: 0.5;
    }

    /* Details Content */
    .details-content {
      padding: 1.25rem;
    }
    .details-content h4 {
      margin: 0 0 1rem 0;
      color: #1e293b;
      font-size: 1rem;
    }
    .timeline-section, .address-section, .tracking-section {
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .timeline-section:last-child, .address-section:last-child, .tracking-section:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    /* Timeline */
    .timeline {
      position: relative;
      padding-left: 1.5rem;
    }
    .timeline::before {
      content: '';
      position: absolute;
      left: 5px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #e2e8f0;
    }
    .timeline-item {
      position: relative;
      padding-bottom: 1rem;
    }
    .timeline-item.last {
      padding-bottom: 0;
    }
    .timeline-dot {
      position: absolute;
      left: -1.25rem;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 0 2px #e2e8f0;
    }
    .timeline-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .timeline-status {
      font-weight: 500;
      color: #1e293b;
    }
    .timeline-date {
      font-size: 0.75rem;
      color: #64748b;
    }
    .timeline-note {
      font-size: 0.875rem;
      color: #374151;
      font-style: italic;
    }
    .timeline-location {
      font-size: 0.75rem;
      color: #64748b;
    }

    .address-card, .tracking-info-card {
      background: #f8fafc;
      padding: 1rem;
      border-radius: 8px;
    }
    .address-card p {
      margin: 0.25rem 0;
    }

    .checkpoints {
      margin-top: 1rem;
    }
    .checkpoint {
      padding: 0.75rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .checkpoint:last-child {
      border-bottom: none;
    }
    .checkpoint-date {
      font-size: 0.75rem;
      color: #64748b;
    }
    .checkpoint-status {
      font-weight: 500;
      color: #1e293b;
    }
    .checkpoint-location {
      font-size: 0.75rem;
      color: #64748b;
    }
    .checkpoint-message {
      font-size: 0.875rem;
      color: #374151;
    }

    .loading, .error-message {
      text-align: center;
      padding: 2rem;
      color: #64748b;
    }
    .error-message {
      color: #dc2626;
      background: #fee2e2;
      border-radius: 8px;
    }

    /* Responsive Styles */
    @media (max-width: 1024px) {
      .deliveries-page { padding: 1rem; }
      .filters-bar { gap: 0.75rem; }
    }

    @media (max-width: 768px) {
      .deliveries-page { padding: 0.75rem; }
      .page-header { flex-direction: column; align-items: stretch; }
      h2 { font-size: 1.25rem; }
      .filters-bar { flex-direction: column; }
      .deliveries-container { overflow-x: auto; }
      .deliveries-table { min-width: 900px; }
    }

    @media (max-width: 480px) {
      .deliveries-page { padding: 0.5rem; }
      h2 { font-size: 1rem; }
      .btn-primary { padding: 0.625rem 1rem; font-size: 0.875rem; }
      .deliveries-table th, .deliveries-table td { padding: 0.5rem; font-size: 0.75rem; }
    }
  `]
})
export class DeliveryListComponent implements OnInit {
  deliveries: Delivery[] = [];
  filteredDeliveries: Delivery[] = [];
  stats: DeliveryStats | null = null;
  loading = false;
  error: string | null = null;
  private shopId: string | null = null;

  statusFilter = '';
  pagination = { page: 1, limit: 20, total: 0, pages: 0 };

  // Modal states
  showStatusModal = false;
  showDetailsModal = false;
  selectedDelivery: Delivery | null = null;
  newStatus: DeliveryStatus | '' = '';
  statusNote = '';
  recipientName = '';

  statusFlow: DeliveryStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];

  constructor(
    private deliveryService: DeliveryService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user?.shop_id) {
      this.shopId = user.shop_id;
      this.loadDeliveries();
      this.loadStats();
    } else {
      this.error = 'Shop ID non trouvé';
    }
  }

  loadDeliveries(): void {
    if (!this.shopId) return;
    this.loading = true;
    console.log('🔍 [DeliveryList] Loading deliveries for shop:', this.shopId);
    this.deliveryService.getDeliveries(this.shopId, {
      page: this.pagination.page,
      limit: this.pagination.limit,
      status: this.statusFilter as DeliveryStatus || undefined
    }).subscribe({
      next: (response: { success: boolean; data: { deliveries: Delivery[]; pagination: any } }) => {
        console.log('✅ [DeliveryList] Response:', response);
        console.log('📦 [DeliveryList] Deliveries count:', response.data?.deliveries?.length);
        console.log('📦 [DeliveryList] First delivery:', response.data?.deliveries?.[0]);
        this.deliveries = response.data.deliveries;
        this.filteredDeliveries = this.deliveries;
        this.pagination = response.data.pagination;
        console.log('📦 [DeliveryList] this.deliveries assigned:', this.deliveries.length);
        console.log('📦 [DeliveryList] this.filteredDeliveries assigned:', this.filteredDeliveries.length);
        this.loading = false;
        console.log('📦 [DeliveryList] loading set to false');
      },
      error: (err) => {
        console.error('❌ [DeliveryList] Error loading deliveries:', err);
        this.error = 'Erreur lors du chargement';
        this.loading = false;
      }
    });
  }

  loadStats(): void {
    if (!this.shopId) return;
    this.deliveryService.getStats(this.shopId, 30).subscribe({
      next: (response: { success: boolean; data: DeliveryStats }) => {
        this.stats = response.data;
      }
    });
  }

  get inTransitCount(): number {
    if (!this.stats) return 0;
    return (this.stats.byStatus?.IN_TRANSIT || 0) + 
           (this.stats.byStatus?.OUT_FOR_DELIVERY || 0) +
           (this.stats.byStatus?.PICKED_UP || 0);
  }

  applyFilters(): void {
    this.pagination.page = 1;
    this.loadDeliveries();
  }

  changePage(page: number): void {
    this.pagination.page = page;
    this.loadDeliveries();
  }

  getStatusLabel(status: DeliveryStatus): string {
    return this.deliveryService.getStatusLabel(status);
  }

  getStatusColor(status: DeliveryStatus): string {
    return this.deliveryService.getStatusColor(status);
  }

  getStatusTextColor(status: DeliveryStatus): string {
    return ['DELIVERED', 'CANCELLED', 'RETURNED'].includes(status) ? 'white' : '#1e293b';
  }

  getLastUpdate(delivery: Delivery): Date {
    const history = delivery.status_history;
    if (history && history.length > 0) {
      return new Date(history[history.length - 1].timestamp);
    }
    return new Date(delivery.created_at || Date.now());
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'à l\'instant';
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
    return `il y a ${Math.floor(diff / 86400)}j`;
  }

  formatDuration(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}j`;
  }

  canUpdateStatus(status: DeliveryStatus): boolean {
    return !['DELIVERED', 'CANCELLED', 'RETURNED'].includes(status);
  }

  canCancel(status: DeliveryStatus): boolean {
    return !['DELIVERED', 'CANCELLED', 'RETURNED'].includes(status);
  }

  viewDetails(delivery: Delivery): void {
    this.selectedDelivery = delivery;
    this.showDetailsModal = true;
  }

  updateStatus(delivery: Delivery): void {
    this.selectedDelivery = delivery;
    this.newStatus = '';
    this.statusNote = '';
    this.showStatusModal = true;
  }

  isStatusCompleted(status: DeliveryStatus): boolean {
    if (!this.selectedDelivery) return false;
    const currentIndex = this.statusFlow.indexOf(this.selectedDelivery.status);
    const checkIndex = this.statusFlow.indexOf(status);
    return checkIndex < currentIndex;
  }

  confirmStatusUpdate(): void {
    if (!this.selectedDelivery || !this.newStatus) return;
    
    this.deliveryService.updateStatus(
      this.selectedDelivery._id!,
      this.newStatus,
      this.statusNote
    ).subscribe({
      next: () => {
        this.closeStatusModal();
        this.loadDeliveries();
        this.loadStats();
      },
      error: () => alert('Erreur lors de la mise à jour')
    });
  }

  syncTracking(delivery: Delivery): void {
    this.deliveryService.syncExternalTracking(delivery._id!).subscribe({
      next: () => {
        alert('Suivi synchronisé');
        this.loadDeliveries();
      },
      error: () => alert('Erreur de synchronisation')
    });
  }

  cancelDelivery(delivery: Delivery): void {
    const reason = prompt('Motif d\'annulation:');
    if (reason) {
      this.deliveryService.cancelDelivery(delivery._id!, reason).subscribe({
        next: () => {
          this.loadDeliveries();
          this.loadStats();
        },
        error: () => alert('Erreur lors de l\'annulation')
      });
    }
  }

  closeStatusModal(): void {
    this.showStatusModal = false;
    this.selectedDelivery = null;
    this.newStatus = '';
    this.statusNote = '';
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedDelivery = null;
  }

  getDeliveryFeeAmount(delivery: Delivery): number {
    const fee: any = (delivery as any)?.delivery_fee;
    if (fee && typeof fee === 'object' && typeof fee.amount === 'number') {
      return fee.amount;
    }
    if (typeof fee === 'number') {
      return fee;
    }
    return 0;
  }

  getDeliveryFeeCurrency(delivery: Delivery): string {
    const fee: any = (delivery as any)?.delivery_fee;
    if (fee && typeof fee === 'object' && typeof fee.currency === 'string') {
      return fee.currency;
    }
    return 'Ar';
  }
}
