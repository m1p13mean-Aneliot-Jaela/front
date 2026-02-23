import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ShopBoxService } from '../../../services/shop-box.service';
import { CreateShopBoxDto } from '../../../../../shared/models/shop-box.model';

@Component({
  selector: 'app-shop-box-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="header">
        <h2>Ajouter un Box de Boutique</h2>
      </div>

      <div class="form-container">
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
              <small class="help-text">Identifiant unique du box (ex: BOX-001, A-12, etc.)</small>
            </div>

            <div class="form-group">
              <label>Statut initial</label>
              <select [(ngModel)]="shopBox.status" name="status">
                <option value="free">Libre</option>
                <option value="occupied">Occupé</option>
                <option value="under_repair">En réparation</option>
              </select>
              <small class="help-text">Le statut par défaut est "Libre"</small>
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
              {{ submitting ? 'Création...' : 'Créer le box' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      margin-bottom: 1.5rem;
    }
    h2 {
      margin: 0;
      color: #1e293b;
    }
    .form-container {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .form-section {
      margin-bottom: 2rem;
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
export class ShopBoxAddComponent implements OnInit {
  shopBox: CreateShopBoxDto = {
    ref: '',
    status: 'free'
  };

  submitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private shopBoxService: ShopBoxService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialization logic if needed
  }

  onSubmit(): void {
    if (this.submitting) return;

    // Reset messages
    this.errorMessage = '';
    this.successMessage = '';

    // Validate required fields
    if (!this.shopBox.ref || !this.shopBox.ref.trim()) {
      this.errorMessage = 'Veuillez entrer une référence pour le box.';
      return;
    }

    this.submitting = true;

    // Clean data
    const boxData = {
      ref: this.shopBox.ref.trim(),
      status: this.shopBox.status
    };

    this.shopBoxService.createShopBox(boxData).subscribe({
      next: (response) => {
        this.successMessage = 'Box créé avec succès !';
        this.submitting = false;
        
        // Redirect after 1.5 seconds
        setTimeout(() => {
          this.router.navigate(['/admin/shop-boxes']);
        }, 1500);
      },
      error: (error) => {
        console.error('Error creating shop box:', error);
        this.errorMessage = error.error?.message || 'Une erreur est survenue lors de la création du box.';
        this.submitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/shop-boxes']);
  }
}
