import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../../core/services/auth.service';
import { PermissionService } from '../../../../../core/services/permission.service';

@Component({
  selector: 'app-shop-client-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="header">
        <button class="btn-back" (click)="goBack()">← Retour</button>
        <h2>{{ isEdit ? 'Modifier Client' : 'Nouveau Client' }}</h2>
      </div>

      <form (ngSubmit)="onSubmit()" class="client-form">
        <div class="form-section">
          <h3>Informations personnelles</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Prénom *</label>
              <input 
                type="text" 
                [(ngModel)]="client.firstName" 
                name="firstName" 
                required 
                class="form-control"
                placeholder="Prénom"
              >
            </div>
            <div class="form-group">
              <label>Nom *</label>
              <input 
                type="text" 
                [(ngModel)]="client.lastName" 
                name="lastName" 
                required 
                class="form-control"
                placeholder="Nom"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Email *</label>
              <input 
                type="email" 
                [(ngModel)]="client.email" 
                name="email" 
                required 
                class="form-control"
                placeholder="email@example.com"
              >
            </div>
            <div class="form-group">
              <label>Téléphone</label>
              <input 
                type="tel" 
                [(ngModel)]="client.phone" 
                name="phone" 
                class="form-control"
                placeholder="034 XX XXX XX"
              >
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Adresse</h3>
          <div class="form-group">
            <label>Adresse</label>
            <textarea 
              [(ngModel)]="client.address" 
              name="address" 
              rows="2" 
              class="form-control"
              placeholder="Adresse complète"
            ></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Ville</label>
              <input 
                type="text" 
                [(ngModel)]="client.city" 
                name="city" 
                class="form-control"
                placeholder="Ville"
              >
            </div>
            <div class="form-group">
              <label>Code postal</label>
              <input 
                type="text" 
                [(ngModel)]="client.postalCode" 
                name="postalCode" 
                class="form-control"
                placeholder="Code postal"
              >
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Notes</h3>
          <div class="form-group">
            <textarea 
              [(ngModel)]="client.notes" 
              name="notes" 
              rows="3" 
              class="form-control"
              placeholder="Notes sur le client..."
            ></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="goBack()">Annuler</button>
          <button type="submit" class="btn-primary">
            {{ isEdit ? 'Enregistrer les modifications' : 'Créer le client' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem;
      max-width: 700px;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .btn-back {
      padding: 0.5rem 1rem;
      background: #f1f5f9;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    h2 {
      color: #1e293b;
      margin: 0;
    }
    .client-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .form-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .form-section h3 {
      margin: 0 0 1rem 0;
      color: #1e293b;
      font-size: 1rem;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .form-row:last-child {
      margin-bottom: 0;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #64748b;
    }
    .form-control {
      padding: 0.625rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.875rem;
    }
    textarea.form-control {
      resize: vertical;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }
    .btn-secondary {
      padding: 0.75rem 1.5rem;
      background: #f1f5f9;
      border: none;
      border-radius: 8px;
      color: #64748b;
      cursor: pointer;
    }
    .btn-primary {
      padding: 0.75rem 1.5rem;
      background: #8b5cf6;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }

    /* Responsive Styles */
    @media (max-width: 768px) {
      .client-form { padding: 0.75rem; }
      .form-container { padding: 1rem; }
      .form-row { flex-direction: column; }
      .form-group { width: 100%; }
    }

    @media (max-width: 480px) {
      .client-form { padding: 0.5rem; }
      h2 { font-size: 1.25rem; }
      .btn-primary, .btn-secondary { padding: 0.625rem 1rem; font-size: 0.875rem; }
    }
  `]
})
export class ShopClientFormComponent implements OnInit {
  isEdit = false;
  clientId: string | null = null;
  private shopId: string | null = null;

  client = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    // Check permissions
    const canCreate = this.permissionService.hasPermission('clients.create');
    const canEdit = this.permissionService.hasPermission('clients.edit');

    const user = this.authService.currentUserValue;
    if (user?.shop_id) {
      this.shopId = user.shop_id;
    }

    this.clientId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.clientId;

    if (this.isEdit && !canEdit) {
      alert('Vous n\'avez pas la permission de modifier des clients.');
      this.router.navigate(['/shop/clients/list']);
      return;
    }
    if (!this.isEdit && !canCreate) {
      alert('Vous n\'avez pas la permission de créer des clients.');
      this.router.navigate(['/shop/clients/list']);
      return;
    }

    if (this.isEdit) {
      this.loadClientData();
    }
  }

  loadClientData(): void {
    // TODO: Load from API
    this.client = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '034 12 345 67',
      address: '123 Rue Principale',
      city: 'Antananarivo',
      postalCode: '101',
      notes: 'Client fidèle'
    };
  }

  onSubmit(): void {
    // TODO: Save to API
    console.log('Saving client:', this.client);
    this.goBack();
  }

  goBack(): void {
    this.router.navigate(['/shop/clients/list']);
  }
}
