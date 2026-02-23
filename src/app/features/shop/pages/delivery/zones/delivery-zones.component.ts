import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DeliveryService, DeliveryZone } from '../../../services/delivery.service';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-delivery-zones',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="header-actions">
        <h2>Zones de livraison</h2>
        <button class="btn-primary" (click)="showAddModal = true">+ Ajouter une zone</button>
      </div>

      <!-- Stats -->
      <div class="stats-cards" *ngIf="zones.length > 0">
        <div class="stat-card total">
          <span class="stat-value">{{ zones.length }}</span>
          <span class="stat-label">Zones totales</span>
        </div>
        <div class="stat-card active">
          <span class="stat-value">{{ activeZonesCount }}</span>
          <span class="stat-label">Zones actives</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ zonesWithFreeDelivery }}</span>
          <span class="stat-label">Livraison gratuite</span>
        </div>
      </div>

      <!-- Zones List -->
      <div *ngIf="!loading && !error" class="zones-container">
        <div *ngFor="let zone of zones" class="zone-card">
          <div class="zone-header">
            <div class="zone-info">
              <h3>{{ zone.name }}</h3>
              <span class="status-badge" [class.active]="zone.is_active !== false">
                {{ zone.is_active !== false ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div class="zone-actions">
              <button class="btn-icon" (click)="editZone(zone)" title="Modifier">✏️</button>
              <button class="btn-icon delete" (click)="deleteZone(zone._id!)" title="Supprimer">🗑️</button>
            </div>
          </div>

          <p class="zone-description" *ngIf="zone.description">{{ zone.description }}</p>

          <div class="zone-details">
            <div class="detail-item">
              <span class="label">Frais de livraison:</span>
              <span class="value">{{ zone.base_fee | number }} Ar</span>
            </div>
            <div class="detail-item" *ngIf="zone.free_delivery_threshold">
              <span class="label">Gratuit à partir de:</span>
              <span class="value">{{ zone.free_delivery_threshold | number }} Ar</span>
            </div>
            <div class="detail-item">
              <span class="label">Délai estimé:</span>
              <span class="value">{{ formatEstimatedTime(zone) }}</span>
            </div>
          </div>

          <div class="zone-coverage" *ngIf="(zone.cities ?? []).length > 0">
            <span class="coverage-label">Villes desservies:</span>
            <div class="coverage-tags">
              <span *ngFor="let city of (zone.cities ?? []).slice(0, 5)" class="tag">{{ city }}</span>
              <span *ngIf="(zone.cities ?? []).length > 5" class="tag more">+{{ (zone.cities ?? []).length - 5 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && !error && zones.length === 0" class="empty-state">
        <div class="empty-icon">🚚</div>
        <p>Aucune zone de livraison configurée</p>
        <button class="btn-primary" (click)="showAddModal = true">Créer une zone</button>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading">Chargement...</div>
      <div *ngIf="error" class="error-message">{{ error }}</div>
    </div>

    <!-- Add/Edit Modal -->
    <div *ngIf="showAddModal || showEditModal" class="modal-overlay" (click)="closeModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ showEditModal ? 'Modifier la zone' : 'Nouvelle zone de livraison' }}</h3>
        </div>

        <form (ngSubmit)="saveZone()" class="zone-form">
          <div class="form-group">
            <label>Nom *</label>
            <input type="text" class="form-control" [(ngModel)]="formData.name" name="name" required
                   placeholder="Ex: Antananarivo Centre">
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea class="form-control" [(ngModel)]="formData.description" name="description" rows="2"
                      placeholder="Description de la zone..."></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Frais de livraison (Ar) *</label>
              <input type="number" class="form-control" [(ngModel)]="formData.base_fee" name="base_fee" required min="0">
            </div>
            <div class="form-group">
              <label>Gratuit à partir de (Ar)</label>
              <input type="number" class="form-control" [(ngModel)]="formData.free_delivery_threshold" name="free_delivery_threshold" min="0"
                     placeholder="Laisser vide pour toujours facturer">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Délai estimé (jours)</label>
              <input type="number" class="form-control" [(ngModel)]="formData.estimated_days" name="estimated_days" min="0" value="1">
            </div>
            <div class="form-group">
              <label>Heures supplémentaires</label>
              <input type="number" class="form-control" [(ngModel)]="formData.estimated_hours" name="estimated_hours" min="0" max="23" value="0">
            </div>
          </div>

          <div class="form-group">
            <label>Villes desservies (séparées par des virgules)</label>
            <input type="text" class="form-control" [(ngModel)]="citiesInput" name="cities"
                   placeholder="Ex: Antananarivo, Antsirabe, Toamasina">
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="formData.is_active" name="is_active">
              <span>Zone active</span>
            </label>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" (click)="closeModal()">Annuler</button>
            <button type="submit" class="btn-primary" [disabled]="!isFormValid() || saving">
              {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
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
    }
    h2 {
      margin: 0;
      color: #1e293b;
    }
    .btn-primary {
      padding: 0.75rem 1.25rem;
      background: #8b5cf6;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
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
    .stat-card.active { border-left: 4px solid #059669; }
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

    /* Zones */
    .zones-container {
      display: grid;
      gap: 1rem;
    }
    .zone-card {
      background: white;
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .zone-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
    }
    .zone-info h3 {
      margin: 0 0 0.5rem 0;
      color: #1e293b;
    }
    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      background: #e5e7eb;
      color: #6b7280;
    }
    .status-badge.active {
      background: #d1fae5;
      color: #059669;
    }
    .zone-actions {
      display: flex;
      gap: 0.5rem;
    }
    .btn-icon {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      background: #f1f5f9;
      font-size: 0.875rem;
    }
    .btn-icon.delete:hover {
      background: #fee2e2;
    }
    .zone-description {
      color: #64748b;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }
    .zone-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.75rem;
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: #f8fafc;
      border-radius: 8px;
    }
    .detail-item {
      display: flex;
      flex-direction: column;
    }
    .detail-item .label {
      font-size: 0.75rem;
      color: #64748b;
    }
    .detail-item .value {
      font-weight: 600;
      color: #1e293b;
    }
    .zone-coverage {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .coverage-label {
      font-size: 0.75rem;
      color: #64748b;
    }
    .coverage-tags {
      display: flex;
      gap: 0.25rem;
      flex-wrap: wrap;
    }
    .tag {
      padding: 0.25rem 0.5rem;
      background: #e0e7ff;
      color: #4338ca;
      border-radius: 4px;
      font-size: 0.75rem;
    }
    .tag.more {
      background: #f1f5f9;
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
    .empty-state p {
      color: #64748b;
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
    .modal-header {
      padding: 1.25rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .modal-header h3 {
      margin: 0;
      color: #1e293b;
    }
    .zone-form {
      padding: 1.25rem;
    }
    .form-group {
      margin-bottom: 1rem;
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
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .checkbox-group {
      display: flex;
      align-items: center;
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
    }
    .btn-secondary {
      padding: 0.625rem 1rem;
      background: #f1f5f9;
      border: none;
      border-radius: 8px;
      cursor: pointer;
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
  `]
})
export class DeliveryZonesComponent implements OnInit {
  zones: DeliveryZone[] = [];
  loading = false;
  error: string | null = null;
  private shopId: string | null = null;

  showAddModal = false;
  showEditModal = false;
  saving = false;
  citiesInput = '';

  formData: Partial<DeliveryZone> = {
    name: '',
    description: '',
    base_fee: 0,
    free_delivery_threshold: undefined,
    estimated_days: 1,
    estimated_hours: 0,
    is_active: true
  };
  editingZoneId: string | null = null;

  constructor(
    private deliveryService: DeliveryService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user?.shop_id) {
      this.shopId = user.shop_id;
      this.loadZones();
    } else {
      this.error = 'Shop ID non trouvé';
    }
  }

  loadZones(): void {
    if (!this.shopId) return;
    this.loading = true;
    this.deliveryService.getZones(this.shopId).subscribe({
      next: (response: { success: boolean; data: DeliveryZone[] }) => {
        this.zones = response.data;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Erreur lors du chargement des zones';
        this.loading = false;
      }
    });
  }

  get activeZonesCount(): number {
    return this.zones.filter(z => z.is_active !== false).length;
  }

  get zonesWithFreeDelivery(): number {
    return this.zones.filter(z => z.free_delivery_threshold && z.free_delivery_threshold > 0).length;
  }

  formatEstimatedTime(zone: DeliveryZone): string {
    const days = zone.estimated_days || 0;
    const hours = zone.estimated_hours || 0;
    if (days === 0 && hours === 0) return 'Immédiat';
    if (days === 0) return `${hours}h`;
    if (hours === 0) return `${days} jour${days > 1 ? 's' : ''}`;
    return `${days}j ${hours}h`;
  }

  editZone(zone: DeliveryZone): void {
    this.editingZoneId = zone._id || null;
    this.formData = { ...zone };
    this.citiesInput = zone.cities?.join(', ') || '';
    this.showEditModal = true;
  }

  deleteZone(zoneId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette zone ?')) {
      this.deliveryService.deleteZone(zoneId).subscribe({
        next: () => this.loadZones(),
        error: () => alert('Erreur lors de la suppression')
      });
    }
  }

  closeModal(): void {
    this.showAddModal = false;
    this.showEditModal = false;
    this.editingZoneId = null;
    this.citiesInput = '';
    this.formData = {
      name: '',
      description: '',
      base_fee: 0,
      free_delivery_threshold: undefined,
      estimated_days: 1,
      estimated_hours: 0,
      is_active: true
    };
  }

  isFormValid(): boolean {
    return !!(this.formData.name && this.formData.base_fee !== undefined && this.formData.base_fee >= 0);
  }

  saveZone(): void {
    if (!this.shopId || !this.isFormValid()) return;

    this.saving = true;
    const data: Partial<DeliveryZone> = {
      ...this.formData,
      cities: this.citiesInput.split(',').map(c => c.trim()).filter(c => c)
    };

    if (this.showEditModal && this.editingZoneId) {
      this.deliveryService.updateZone(this.editingZoneId, data).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.loadZones();
        },
        error: (err: any) => {
          this.saving = false;
          alert('Erreur lors de la mise à jour: ' + (err?.error?.message || err?.message || 'Erreur inconnue'));
        }
      });
    } else {
      this.deliveryService.createZone(this.shopId, data).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.loadZones();
        },
        error: (err: any) => {
          this.saving = false;
          alert('Erreur lors de la création: ' + (err?.error?.message || err?.message || 'Erreur inconnue'));
        }
      });
    }
  }
}
