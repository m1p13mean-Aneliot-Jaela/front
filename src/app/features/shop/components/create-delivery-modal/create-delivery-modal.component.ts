import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeliveryService, DeliveryZone, DeliveryAddress } from '../../services/delivery.service';

interface Order {
  _id: string;
  customer_name?: string;
  customer_phone?: string;
  shipping_address?: {
    address_line1?: string;
    address_line2?: string;
    city?: string;
    postal_code?: string;
  };
  total_amount?: number;
}

@Component({
  selector: 'app-create-delivery-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="close()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>⇄ Créer la livraison</h3>
          <p class="order-info">Commande {{ order._id.slice(-6) }}</p>
        </div>

        <form (ngSubmit)="createDelivery()" class="delivery-form">
          <!-- Zone selection -->
          <div class="form-group">
            <label>Zone de livraison *</label>
            <select class="form-control" [(ngModel)]="selectedZoneId" name="zoneId" required (change)="onZoneChange()">
              <option value="">-- Choisir une zone --</option>
              <option *ngFor="let zone of zones" [value]="zone._id">
                {{ zone.name }} - {{ zone.base_fee | number }} Ar
                <span *ngIf="zone.free_delivery_threshold">(Gratuit > {{ zone.free_delivery_threshold | number }} Ar)</span>
              </option>
            </select>
            <small *ngIf="selectedZone" class="zone-info">
              Délai estimé: {{ formatEstimatedTime(selectedZone) }}
            </small>
          </div>

          <!-- Fee preview -->
          <div class="fee-preview" *ngIf="feeInfo">
            <div class="fee-row">
              <span>Montant commande:</span>
              <strong>{{ order.total_amount || 0 | number }} Ar</strong>
            </div>
            <div class="fee-row" *ngIf="feeInfo.free_delivery_applied">
              <span>Frais de livraison:</span>
              <span class="free-badge">GRATUIT</span>
            </div>
            <div class="fee-row" *ngIf="!feeInfo.free_delivery_applied">
              <span>Frais de livraison:</span>
              <strong>{{ feeInfo.fee | number }} Ar</strong>
            </div>
            <div class="fee-row total" *ngIf="!feeInfo.free_delivery_applied">
              <span>Total avec livraison:</span>
              <strong>{{ (order.total_amount || 0) + feeInfo.fee | number }} Ar</strong>
            </div>
          </div>

          <!-- Delivery address -->
          <div class="form-section">
            <h4>Adresse de livraison</h4>
            
            <div class="form-row">
              <div class="form-group">
                <label>Nom du destinataire *</label>
                <input type="text" class="form-control" [(ngModel)]="deliveryAddress.recipient_name" name="recipientName" required>
              </div>
              <div class="form-group">
                <label>Téléphone *</label>
                <input type="text" class="form-control" [(ngModel)]="deliveryAddress.recipient_phone" name="recipientPhone" required>
              </div>
            </div>

            <div class="form-group">
              <label>Adresse ligne 1 *</label>
              <input type="text" class="form-control" [(ngModel)]="deliveryAddress.address_line1" name="addressLine1" required>
            </div>

            <div class="form-group">
              <label>Adresse ligne 2</label>
              <input type="text" class="form-control" [(ngModel)]="deliveryAddress.address_line2" name="addressLine2">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Ville *</label>
                <input type="text" class="form-control" [(ngModel)]="deliveryAddress.city" name="city" required>
              </div>
              <div class="form-group">
                <label>Code postal *</label>
                <input type="text" class="form-control" [(ngModel)]="deliveryAddress.postal_code" name="postalCode" required>
              </div>
            </div>
          </div>

          <!-- Scheduled date -->
          <div class="form-group">
            <label>Date de livraison prévue</label>
            <input type="datetime-local" class="form-control" [(ngModel)]="scheduledDate" name="scheduledDate">
          </div>

          <!-- Instructions -->
          <div class="form-group">
            <label>Instructions (optionnel)</label>
            <textarea class="form-control" [(ngModel)]="instructions" name="instructions" rows="2"
                      placeholder="Ex: Appeler avant d'arriver, laisser au gardien..."></textarea>
          </div>

          <!-- Error message -->
          <div *ngIf="error" class="error-message">{{ error }}</div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" (click)="close()">Annuler</button>
            <button type="submit" class="btn-primary" [disabled]="!canSubmit() || saving">
              {{ saving ? 'Création...' : '⇄ Créer la livraison' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
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
      width: 550px;
      max-width: 95%;
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
    .order-info {
      color: #64748b;
      font-size: 0.875rem;
      margin: 0.25rem 0 0 0;
    }

    .delivery-form {
      padding: 1.25rem;
    }
    .form-section {
      margin: 1.5rem 0;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 8px;
    }
    .form-section h4 {
      margin: 0 0 1rem 0;
      color: #1e293b;
      font-size: 0.875rem;
      text-transform: uppercase;
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
    .zone-info {
      color: #64748b;
      font-size: 0.75rem;
    }

    .fee-preview {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
    }
    .fee-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }
    .fee-row.total {
      border-top: 1px solid #bbf7d0;
      padding-top: 0.5rem;
      margin-top: 0.5rem;
      font-weight: 600;
    }
    .free-badge {
      background: #22c55e;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .error-message {
      padding: 0.75rem;
      background: #fee2e2;
      color: #dc2626;
      border-radius: 8px;
      margin-bottom: 1rem;
      font-size: 0.875rem;
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
    .btn-primary {
      padding: 0.625rem 1.25rem;
      background: #8b5cf6;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
    }
    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class CreateDeliveryModalComponent implements OnInit {
  @Input() shopId!: string;
  @Input() order!: Order;
  @Output() created = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  zones: DeliveryZone[] = [];
  selectedZoneId = '';
  selectedZone: DeliveryZone | null = null;
  feeInfo: { fee: number; free_delivery_applied: boolean } | null = null;

  deliveryAddress: DeliveryAddress = {
    recipient_name: '',
    recipient_phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    country: 'MG'
  };

  scheduledDate = '';
  instructions = '';
  saving = false;
  error: string | null = null;

  constructor(private deliveryService: DeliveryService) {}

  ngOnInit(): void {
    this.loadZones();
    this.prefillAddress();
  }

  loadZones(): void {
    this.deliveryService.getZones(this.shopId).subscribe({
      next: (response) => {
        this.zones = response.data;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des zones';
      }
    });
  }

  prefillAddress(): void {
    if (this.order) {
      this.deliveryAddress.recipient_name = this.order.customer_name || '';
      this.deliveryAddress.recipient_phone = this.order.customer_phone || '';
      this.deliveryAddress.address_line1 = this.order.shipping_address?.address_line1 || '';
      this.deliveryAddress.address_line2 = this.order.shipping_address?.address_line2 || '';
      this.deliveryAddress.city = this.order.shipping_address?.city || '';
      this.deliveryAddress.postal_code = this.order.shipping_address?.postal_code || '';
    }
  }

  onZoneChange(): void {
    this.selectedZone = this.zones.find(z => z._id === this.selectedZoneId) || null;
    if (this.selectedZone && this.order?.total_amount) {
      this.deliveryService.calculateFee(this.shopId, this.selectedZoneId, this.order.total_amount).subscribe({
        next: (response) => {
          this.feeInfo = {
            fee: response.data.fee,
            free_delivery_applied: response.data.free_delivery_applied
          };
        }
      });
    }
  }

  formatEstimatedTime(zone: DeliveryZone): string {
    const days = zone.estimated_days || 0;
    const hours = zone.estimated_hours || 0;
    if (days === 0 && hours === 0) return 'Immédiat';
    if (days === 0) return `${hours}h`;
    if (hours === 0) return `${days} jour${days > 1 ? 's' : ''}`;
    return `${days}j ${hours}h`;
  }

  canSubmit(): boolean {
    return !!(
      this.selectedZoneId &&
      this.deliveryAddress.recipient_name &&
      this.deliveryAddress.recipient_phone &&
      this.deliveryAddress.address_line1 &&
      this.deliveryAddress.city &&
      this.deliveryAddress.postal_code
    );
  }

  createDelivery(): void {
    if (!this.canSubmit() || !this.selectedZone) return;

    this.saving = true;
    this.error = null;

    const data = {
      zone_id: this.selectedZoneId,
      order_amount: this.order?.total_amount || 0,
      delivery_address: this.deliveryAddress,
      scheduled_date: this.scheduledDate || undefined,
      instructions: this.instructions || undefined
    };

    this.deliveryService.createDelivery(this.shopId, this.order._id, data).subscribe({
      next: () => {
        this.saving = false;
        this.created.emit();
        this.close();
      },
      error: (err: any) => {
        this.saving = false;
        this.error = err?.error?.message || 'Erreur lors de la création de la livraison';
      }
    });
  }

  close(): void {
    this.closed.emit();
  }
}
