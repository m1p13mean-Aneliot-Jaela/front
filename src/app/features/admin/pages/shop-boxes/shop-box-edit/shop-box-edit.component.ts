import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ShopBoxService } from '../../../services/shop-box.service';
import { ShopBox, UpdateShopBoxDto } from '../../../../../shared/models/shop-box.model';

@Component({
  selector: 'app-shop-box-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="header">
        <h2>Modifier le Box</h2>
      </div>

      <div *ngIf="loading" class="loading">Chargement...</div>
      <div *ngIf="loadError" class="error">{{ loadError }}</div>

      <div *ngIf="!loading && !loadError && shopBox" class="form-container">
        <form (ngSubmit)="onSubmit()">
          <!-- Basic Info -->
          <div class="form-section">
            <h3>Informations du box</h3>
            
            <div class="form-group">
              <label>Référence *</label>
              <input 
                type="text" 
                [(ngModel)]="shopBox.ref" 
                name="ref" 
                placeholder="BOX-001"
                required
              />
              <small class="help-text">Identifiant unique du box</small>
            </div>

            <div class="form-group">
              <label>Statut</label>
              <select [(ngModel)]="shopBox.current_status.status" name="status">
                <option value="free">Libre</option>
                <option value="occupied">Occupé</option>
                <option value="under_repair">En réparation</option>
              </select>
            </div>
          </div>

          <!-- Assignment Info -->
          <div *ngIf="shopBox.current_assignment?.shop_name" class="form-section">
            <h3>Boutique assignée</h3>
            
            <div class="info-card">
              <div class="info-item">
                <label>Nom de la boutique</label>
                <div class="info-value">{{ shopBox.current_assignment?.shop_name }}</div>
              </div>
              <div class="info-item">
                <label>Date d'assignation</label>
                <div class="info-value">{{ formatDate(shopBox.current_assignment?.assigned_at) }}</div>
              </div>
            </div>
          </div>

          <!-- Box Info -->
          <div class="form-section">
            <h3>Informations supplémentaires</h3>
            
            <div class="info-grid">
              <div class="info-item">
                <label>ID</label>
                <div class="info-value">{{ shopBox._id }}</div>
              </div>
              <div class="info-item">
                <label>Date de création</label>
                <div class="info-value">{{ formatDate(shopBox.created_at) }}</div>
              </div>
              <div class="info-item">
                <label>Dernière mise à jour du statut</label>
                <div class="info-value">{{ formatDate(shopBox.current_status.updated_at) }}</div>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <!-- Success Message -->
          <div *ngIf="successMessage" class="success-message">
            {{ successMessage }}
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="onCancel()">Annuler</button>
            <button type="submit" class="btn-primary" [disabled]="submitting">
              {{ submitting ? 'Mise à jour...' : 'Mettre à jour' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem;
      max-width: 900px;
      margin: 0 auto;
    }
    .header {
      margin-bottom: 1.5rem;
    }
    h2 {
      margin: 0;
      color: #1e293b;
    }
    .loading, .error {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      margin: 1rem 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .error {
      color: #dc2626;
    }
    .form-container {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .form-section {
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .form-section:last-of-type {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    h3 {
      margin: 0 0 1.5rem 0;
      color: #334155;
      font-size: 1.125rem;
    }
    .form-group {
      margin-bottom: 1.25rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #64748b;
      font-size: 0.875rem;
    }
    input, select {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      box-sizing: border-box;
    }
    input:focus, select:focus {
      outline: none;
      border-color: #10b981;
    }
    .help-text {
      display: block;
      margin-top: 0.25rem;
      font-size: 0.75rem;
      color: #94a3b8;
    }
    .info-card {
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      padding: 1.5rem;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    .info-item {
      padding: 1rem;
      background: #f8fafc;
      border-radius: 8px;
    }
    .info-item label {
      margin-bottom: 0.25rem;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .info-value {
      color: #1e293b;
      font-weight: 500;
      word-break: break-all;
    }
    .error-message {
      padding: 1rem;
      background-color: #fee2e2;
      color: #dc2626;
      border-radius: 8px;
      margin-bottom: 1rem;
      border-left: 4px solid #dc2626;
    }
    .success-message {
      padding: 1rem;
      background-color: #d1fae5;
      color: #059669;
      border-radius: 8px;
      margin-bottom: 1rem;
      border-left: 4px solid #059669;
    }
    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    button {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary {
      flex: 1;
      background: #10b981;
      color: white;
      border: none;
    }
    .btn-primary:hover:not(:disabled) {
      background: #059669;
    }
    .btn-primary:disabled {
      background: #6ee7b7;
      cursor: not-allowed;
    }
    .btn-secondary {
      padding: 0.75rem 1.5rem;
      background: white;
      color: #64748b;
      border: 2px solid #e2e8f0;
    }
    .btn-secondary:hover {
      background: #f8fafc;
    }
  `]
})
export class ShopBoxEditComponent implements OnInit {
  shopBox: ShopBox | null = null;
  boxId: string = '';
  
  loading = false;
  loadError = '';
  submitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private shopBoxService: ShopBoxService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.boxId = this.route.snapshot.paramMap.get('id') || '';
    if (this.boxId) {
      this.loadBox();
    } else {
      this.loadError = 'ID du box invalide';
    }
  }

  loadBox(): void {
    this.loading = true;
    this.loadError = '';

    this.shopBoxService.getShopBoxById(this.boxId).subscribe({
      next: (response) => {
        if (response.data && !Array.isArray(response.data)) {
          this.shopBox = response.data;
        } else {
          this.loadError = 'Box non trouvé';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading shop box:', error);
        this.loadError = 'Erreur lors du chargement du box.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (!this.shopBox || this.submitting) return;

    // Reset messages
    this.errorMessage = '';
    this.successMessage = '';

    // Validate required fields
    if (!this.shopBox.ref || !this.shopBox.ref.trim()) {
      this.errorMessage = 'La référence est obligatoire.';
      return;
    }

    this.submitting = true;

    // Update basic info
    const updateData: UpdateShopBoxDto = {
      ref: this.shopBox.ref.trim()
    };

    this.shopBoxService.updateShopBox(this.boxId, updateData).subscribe({
      next: () => {
        // Update status if needed
        const statusData = {
          status: this.shopBox!.current_status.status
        };

        this.shopBoxService.updateShopBoxStatus(this.boxId, statusData).subscribe({
          next: () => {
            this.successMessage = 'Box mis à jour avec succès !';
            this.submitting = false;
            
            // Redirect after 1.5 seconds
            setTimeout(() => {
              this.router.navigate(['/admin/shop-boxes']);
            }, 1500);
          },
          error: (error) => {
            console.error('Error updating status:', error);
            this.successMessage = 'Box mis à jour, mais erreur lors de la mise à jour du statut.';
            this.submitting = false;
          }
        });
      },
      error: (error) => {
        console.error('Error updating shop box:', error);
        this.errorMessage = error.error?.message || 'Une erreur est survenue lors de la mise à jour.';
        this.submitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/shop-boxes']);
  }

  formatDate(date: any): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
