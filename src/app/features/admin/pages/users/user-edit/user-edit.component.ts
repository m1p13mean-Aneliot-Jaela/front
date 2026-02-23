import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { User, UpdateUserDto } from '../../../../../shared/models/user.model';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="header">
        <h2>Modifier l'Utilisateur</h2>
      </div>

      <div *ngIf="loading" class="loading">Chargement...</div>
      <div *ngIf="loadError" class="error">{{ loadError }}</div>

      <div *ngIf="!loading && !loadError && user" class="form-container">
        <form (ngSubmit)="onSubmit()">
          <!-- Basic Info -->
          <div class="form-section">
            <h3>Informations de base</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label>Prénom *</label>
                <input 
                  type="text" 
                  [(ngModel)]="user.first_name" 
                  name="first_name" 
                  placeholder="John"
                  required
                />
              </div>
              <div class="form-group">
                <label>Nom *</label>
                <input 
                  type="text" 
                  [(ngModel)]="user.last_name" 
                  name="last_name" 
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label>Email</label>
              <input 
                type="email" 
                [value]="user.email" 
                disabled
                class="disabled"
              />
              <small class="help-text">L'email ne peut pas être modifié</small>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Téléphone</label>
                <input 
                  type="tel" 
                  [(ngModel)]="user.phone" 
                  name="phone" 
                  placeholder="+261 34 00 000 00"
                />
              </div>
              <div class="form-group">
                <label>Type d'utilisateur</label>
                <input 
                  type="text" 
                  [value]="getUserTypeLabel(user.user_type)" 
                  disabled
                  class="disabled"
                />
                <small class="help-text">Le type ne peut pas être modifié</small>
              </div>
            </div>

            <div class="form-group">
              <label>URL de la photo de profil</label>
              <input 
                type="text" 
                [(ngModel)]="user.profile_photo" 
                name="profile_photo" 
                placeholder="https://example.com/photo.jpg"
              />
            </div>
          </div>

          <!-- Status Section -->
          <div class="form-section">
            <h3>Statut</h3>
            
            <div class="form-group">
              <label>Statut actuel</label>
              <select [(ngModel)]="user.current_status.status" name="status">
                <option value="active">Actif</option>
                <option value="suspended">Suspendu</option>
                <option value="blocked">Bloqué</option>
              </select>
            </div>

            <div class="form-group">
              <label>Raison du statut (optionnel)</label>
              <textarea 
                [(ngModel)]="user.current_status.reason" 
                name="status_reason" 
                rows="2" 
                placeholder="Raison du changement de statut..."
              ></textarea>
            </div>
          </div>

          <!-- User Info -->
          <div class="form-section">
            <h3>Informations supplémentaires</h3>
            
            <div class="info-grid">
              <div class="info-item">
                <label>ID</label>
                <div class="info-value">{{ user._id }}</div>
              </div>
              <div class="info-item">
                <label>Date d'inscription</label>
                <div class="info-value">{{ formatDate(user.registered_at) }}</div>
              </div>
              <div class="info-item">
                <label>Dernière modification</label>
                <div class="info-value">{{ formatDate(user.updatedAt) }}</div>
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
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
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
    input, select, textarea {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      box-sizing: border-box;
      font-family: inherit;
    }
    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: #10b981;
    }
    input.disabled {
      background-color: #f1f5f9;
      color: #94a3b8;
      cursor: not-allowed;
    }
    textarea {
      resize: vertical;
    }
    .help-text {
      display: block;
      margin-top: 0.25rem;
      font-size: 0.75rem;
      color: #94a3b8;
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
export class UserEditComponent implements OnInit {
  user: User | null = null;
  userId: string = '';
  
  loading = false;
  loadError = '';
  submitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    if (this.userId) {
      this.loadUser();
    } else {
      this.loadError = 'ID utilisateur invalide';
    }
  }

  loadUser(): void {
    this.loading = true;
    this.loadError = '';

    this.userService.getUserById(this.userId).subscribe({
      next: (response) => {
        if (response.data && !Array.isArray(response.data)) {
          this.user = response.data;
        } else {
          this.loadError = 'Utilisateur non trouvé';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.loadError = 'Erreur lors du chargement de l\'utilisateur.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (!this.user || this.submitting) return;

    // Reset messages
    this.errorMessage = '';
    this.successMessage = '';

    // Validate required fields
    if (!this.user.first_name || !this.user.last_name) {
      this.errorMessage = 'Le prénom et le nom sont obligatoires.';
      return;
    }

    this.submitting = true;

    // Prepare update data
    const updateData: UpdateUserDto = {
      first_name: this.user.first_name,
      last_name: this.user.last_name
    };

    if (this.user.phone) {
      updateData.phone = this.user.phone;
    }

    if (this.user.profile_photo) {
      updateData.profile_photo = this.user.profile_photo;
    }

    // Update user
    this.userService.updateUser(this.userId, updateData).subscribe({
      next: (response) => {
        // Also update status if changed
        const statusData = {
          status: this.user!.current_status.status,
          reason: this.user!.current_status.reason
        };

        this.userService.updateUserStatus(this.userId, statusData).subscribe({
          next: () => {
            this.successMessage = 'Utilisateur mis à jour avec succès !';
            this.submitting = false;
            
            // Redirect after 1.5 seconds
            setTimeout(() => {
              this.router.navigate(['/admin/users']);
            }, 1500);
          },
          error: (error) => {
            console.error('Error updating status:', error);
            this.successMessage = 'Informations mises à jour, mais erreur lors de la mise à jour du statut.';
            this.submitting = false;
          }
        });
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.errorMessage = error.error?.message || 'Une erreur est survenue lors de la mise à jour.';
        this.submitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/users']);
  }

  getUserTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'buyer': 'Acheteur',
      'shop': 'Boutique',
      'admin': 'Admin'
    };
    return labels[type] || type;
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
