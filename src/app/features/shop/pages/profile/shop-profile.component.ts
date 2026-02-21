import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { ShopService, ShopProfile, BusinessHoursDay } from '../../services/shop.service';
import { MapPickerComponent } from '../../../../shared/components/map-picker/map-picker.component';

@Component({
  selector: 'app-shop-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MapPickerComponent],
  template: `
    <div class="page-container">
      <div class="header">
        <h2>🏪 Profil Boutique</h2>
        <button class="btn-primary" (click)="saveProfile()" [disabled]="saving">
          {{ saving ? 'Sauvegarde...' : '💾 Enregistrer' }}
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading">Chargement du profil...</div>
      
      <!-- Error -->
      <div *ngIf="error && !loading" class="error-banner">
        {{ error }}
        <button (click)="loadProfile()">Réessayer</button>
      </div>

      <div class="profile-content" *ngIf="profile && !loading">
        <!-- Logo Section -->
        <div class="section">
          <h3>Logo</h3>
          <div class="logo-section">
            <div class="logo-preview" *ngIf="profile.logo || previewUrl">
              <img [src]="previewUrl || profile.logo" alt="Logo boutique">
              <button class="btn-remove-logo" (click)="removeLogo()">×</button>
            </div>
            <div class="logo-upload" *ngIf="!profile.logo && !previewUrl">
              <input type="file" 
                     accept="image/*" 
                     (change)="onFileSelected($event)" 
                     #fileInput
                     hidden>
              <button class="btn-upload" (click)="fileInput.click()">
                📤 Uploader un logo
              </button>
              <p class="upload-hint">PNG, JPG jusqu'à 2MB</p>
            </div>
          </div>
        </div>

        <!-- Basic Info -->
        <div class="section">
          <h3>Informations de base</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Nom de la boutique *</label>
              <input type="text" class="form-control" [(ngModel)]="profile.name" required>
            </div>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea class="form-control" [(ngModel)]="profile.description" rows="4"
                      placeholder="Décrivez votre boutique..."></textarea>
          </div>
        </div>

        <!-- Location -->
        <div class="section">
          <h3>📍 Localisation</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Adresse</label>
              <input type="text" class="form-control" [(ngModel)]="profile.location!.address"
                     placeholder="Rue, numéro...">
            </div>
          </div>
          <div class="form-row two-col">
            <div class="form-group">
              <label>Ville</label>
              <input type="text" class="form-control" [(ngModel)]="profile.location!.city">
            </div>
            <div class="form-group">
              <label>Code postal</label>
              <input type="text" class="form-control" [(ngModel)]="profile.location!.postal_code">
            </div>
          </div>
          
          <!-- Map Display -->
          <div class="map-display" *ngIf="profile.location?.latitude && profile.location?.longitude; else noMap">
            <div class="selected-coords">
              <span>📍 {{ profile.location?.latitude | number:'1.6-6' }}, {{ profile.location?.longitude | number:'1.6-6' }}</span>
              <button class="btn-change-location" (click)="openMapPicker()">
                Modifier
              </button>
            </div>
            <div class="map-preview">
              <img [src]="getStaticMapUrl()" alt="Carte localisation">
            </div>
          </div>
          
          <ng-template #noMap>
            <div class="map-container">
              <div class="map-placeholder">
                <span>🗺️ Aucune localisation sélectionnée</span>
                <p>Cliquez ci-dessous pour choisir l'emplacement sur la carte</p>
                <button class="btn-secondary" (click)="openMapPicker()">
                  📍 Choisir sur la carte
                </button>
              </div>
            </div>
          </ng-template>
        </div>

        <!-- Business Hours -->
        <div class="section">
          <h3>🕐 Horaires d'ouverture</h3>
          <div class="hours-list">
            <div class="hour-row" *ngFor="let day of weekDays; let i = index">
              <span class="day-name">{{ day.label || ('Jour ' + (i+1)) }}</span>
              <label class="closed-toggle">
                <input type="checkbox" [(ngModel)]="day.hours.closed">
                <span>Fermé</span>
              </label>
              <div class="time-inputs" *ngIf="!day.hours.closed">
                <input type="time" class="form-control" [(ngModel)]="day.hours.open">
                <span>à</span>
                <input type="time" class="form-control" [(ngModel)]="day.hours.close">
              </div>
            </div>
          </div>
        </div>

        <!-- Contact -->
        <div class="section">
          <h3>📞 Coordonnées</h3>
          <div class="form-row two-col">
            <div class="form-group">
              <label>Téléphone</label>
              <input type="tel" class="form-control" [(ngModel)]="profile.contact!.phone"
                     placeholder="034 12 345 67">
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" class="form-control" [(ngModel)]="profile.contact!.email"
                     placeholder="contact@boutique.com">
            </div>
          </div>
          <div class="form-row two-col">
            <div class="form-group">
              <label>Site web</label>
              <input type="url" class="form-control" [(ngModel)]="profile.contact!.website"
                     placeholder="https://...">
            </div>
            <div class="form-group">
              <label>WhatsApp</label>
              <input type="tel" class="form-control" [(ngModel)]="profile.contact!.whatsapp"
                     placeholder="034 12 345 67">
            </div>
          </div>
        </div>

        <!-- Social Media -->
        <div class="section">
          <h3>📱 Réseaux sociaux</h3>
          <div class="form-row two-col">
            <div class="form-group">
              <label>Facebook</label>
              <input type="url" class="form-control" [(ngModel)]="profile.social_media!.facebook"
                     placeholder="https://facebook.com/...">
            </div>
            <div class="form-group">
              <label>Instagram</label>
              <input type="url" class="form-control" [(ngModel)]="profile.social_media!.instagram"
                     placeholder="https://instagram.com/...">
            </div>
          </div>
          <div class="form-row two-col">
            <div class="form-group">
              <label>Twitter / X</label>
              <input type="url" class="form-control" [(ngModel)]="profile.social_media!.twitter"
                     placeholder="https://twitter.com/...">
            </div>
            <div class="form-group">
              <label>YouTube</label>
              <input type="url" class="form-control" [(ngModel)]="profile.social_media!.youtube"
                     placeholder="https://youtube.com/...">
            </div>
          </div>
        </div>
      </div>

      <!-- Map Picker Modal -->
      <div *ngIf="showMapPicker" class="modal-overlay" (click)="closeMapPicker()">
        <div class="modal modal-large" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>📍 Choisir la localisation</h3>
            <button class="btn-close" (click)="closeMapPicker()">×</button>
          </div>
          <app-map-picker
            [initialPosition]="getInitialMapPosition()"
            (positionSelected)="onLocationSelected($event)"
            (closed)="closeMapPicker()">
          </app-map-picker>
        </div>
      </div>

      <!-- Success Message -->
      <div *ngIf="showSuccess" class="success-message">
        ✅ Profil mis à jour avec succès!
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem;
      max-width: 900px;
    }
    .header {
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
      padding: 0.75rem 1.5rem;
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

    .profile-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .section h3 {
      margin: 0 0 1rem 0;
      color: #1e293b;
      font-size: 1rem;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 0.5rem;
    }

    /* Logo Section */
    .logo-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .logo-preview {
      position: relative;
      width: 120px;
      height: 120px;
      border-radius: 12px;
      overflow: hidden;
      border: 2px solid #e2e8f0;
    }
    .logo-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .btn-remove-logo {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 24px;
      height: 24px;
      border: none;
      border-radius: 50%;
      background: #dc2626;
      color: white;
      cursor: pointer;
      font-size: 1rem;
      line-height: 1;
    }
    .logo-upload {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    .btn-upload {
      padding: 0.75rem 1.5rem;
      background: #f1f5f9;
      border: 2px dashed #cbd5e1;
      border-radius: 8px;
      cursor: pointer;
      color: #64748b;
    }
    .upload-hint {
      font-size: 0.75rem;
      color: #94a3b8;
      margin: 0;
    }

    /* Form */
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
      margin-bottom: 0.5rem;
    }
    .form-row.two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    /* Map Display */
    .map-display {
      margin-top: 1rem;
      background: #f8fafc;
      border-radius: 12px;
      padding: 1rem;
    }
    .selected-coords {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .selected-coords span {
      font-size: 0.875rem;
      color: #64748b;
    }
    .btn-change-location {
      padding: 0.375rem 0.75rem;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
    }
    .map-preview img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 8px;
    }

    /* Map Picker Modal */
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
      width: 600px;
      max-width: 95%;
      max-height: 90vh;
      overflow: hidden;
    }
    .modal-large {
      width: 800px;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .modal-header h3 {
      margin: 0;
      color: #1e293b;
      border: none;
      padding: 0;
    }
    .btn-close {
      width: 32px;
      height: 32px;
      border: none;
      background: #f1f5f9;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1.25rem;
    }
    .map-container {
      margin-top: 1rem;
    }
    .map-placeholder {
      background: #f8fafc;
      border: 2px dashed #e2e8f0;
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
    }
    .map-placeholder span {
      font-size: 1.5rem;
    }
    .map-placeholder p {
      color: #64748b;
      margin: 0.5rem 0 1rem 0;
    }
    .btn-secondary {
      padding: 0.5rem 1rem;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      cursor: pointer;
    }

    /* Hours */
    .hours-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .hour-row {
      display: grid;
      grid-template-columns: 100px 80px 1fr;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      background: #f8fafc;
      border-radius: 8px;
    }
    .day-name {
      font-weight: 500;
      color: #1e293b;
    }
    .closed-toggle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 0.875rem;
    }
    .time-inputs {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .time-inputs .form-control {
      width: 100px;
    }
    .time-inputs span {
      color: #64748b;
    }

    .error-banner {
      background: #fee2e2;
      color: #dc2626;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .error-banner button {
      padding: 0.375rem 0.75rem;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      cursor: pointer;
    }
    .loading {
      text-align: center;
      padding: 3rem;
      color: #64748b;
    }
    .success-message {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      padding: 1rem 1.5rem;
      background: #dcfce7;
      color: #166534;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      animation: slideIn 0.3s ease;
    }
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class ShopProfileComponent implements OnInit {
  profile: ShopProfile = {
    name: '',
    location: {},
    contact: {},
    social_media: {},
    business_hours: {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '08:00', close: '12:00', closed: false },
      sunday: { open: '08:00', close: '18:00', closed: true }
    }
  };

  weekDays: { key: string; label: string; hours: BusinessHoursDay }[] = [];
  previewUrl: string | null = null;
  saving = false;
  showSuccess = false;
  showMapPicker = false;
  loading = true;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private shopService: ShopService
  ) {}

  ngOnInit(): void {
    this.initWeekDays();
    this.loadProfile();
  }

  initWeekDays(): void {
    const days = [
      { key: 'monday', label: 'Lundi' },
      { key: 'tuesday', label: 'Mardi' },
      { key: 'wednesday', label: 'Mercredi' },
      { key: 'thursday', label: 'Jeudi' },
      { key: 'friday', label: 'Vendredi' },
      { key: 'saturday', label: 'Samedi' },
      { key: 'sunday', label: 'Dimanche' }
    ];

    this.weekDays = days.map(day => ({
      ...day,
      hours: this.profile.business_hours?.[day.key as keyof typeof this.profile.business_hours] || 
             { open: '08:00', close: '18:00', closed: false }
    }));
    
    console.log('weekDays initialized:', this.weekDays);
  }

  loadProfile(): void {
    this.loading = true;
    this.error = null;
    
    this.shopService.getMyProfile().subscribe({
      next: (response) => {
        // Merge with defaults to ensure all sub-objects exist
        this.profile = {
          ...this.getDefaultProfile(),
          ...response.data,
          location: { ...this.getDefaultProfile().location, ...response.data.location },
          contact: { ...this.getDefaultProfile().contact, ...response.data.contact },
          social_media: { ...this.getDefaultProfile().social_media, ...response.data.social_media },
          business_hours: { ...this.getDefaultProfile().business_hours, ...response.data.business_hours }
        };
        this.initWeekDays();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.error = 'Erreur lors du chargement du profil';
        this.loading = false;
        
        // Use default profile on error
        this.profile = this.getDefaultProfile();
        this.initWeekDays();
      }
    });
  }

  getDefaultProfile(): ShopProfile {
    return {
      name: 'Ma Boutique',
      description: '',
      location: {
        address: '',
        city: '',
        postal_code: '',
        country: 'MG'
      },
      contact: {
        phone: '',
        email: '',
        website: '',
        whatsapp: ''
      },
      social_media: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: ''
      },
      business_hours: {
        monday: { open: '08:00', close: '18:00', closed: false },
        tuesday: { open: '08:00', close: '18:00', closed: false },
        wednesday: { open: '08:00', close: '18:00', closed: false },
        thursday: { open: '08:00', close: '18:00', closed: false },
        friday: { open: '08:00', close: '18:00', closed: false },
        saturday: { open: '08:00', close: '12:00', closed: false },
        sunday: { open: '08:00', close: '18:00', closed: true }
      }
    };
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      console.log('File selected:', file.name, file.size, file.type);
      
      if (file.size > 2 * 1024 * 1024) {
        alert('Le fichier est trop grand. Taille max: 2MB');
        return;
      }
      
      // Upload to API
      const user = this.authService.currentUserValue;
      console.log('Current user:', user);
      console.log('Shop ID:', user?.shop_id);
      
      if (user?.shop_id) {
        console.log('Uploading logo for shop:', user.shop_id);
        this.shopService.uploadLogo(user.shop_id, file).subscribe({
          next: (response) => {
            console.log('Upload success:', response);
            const logoUrl = response.data.logo_url;
            const cacheBustedUrl = `${logoUrl}${logoUrl.includes('?') ? '&' : '?'}v=${Date.now()}`;
            this.profile.logo = cacheBustedUrl;
            this.previewUrl = cacheBustedUrl;
          },
          error: (err) => {
            console.error('Upload error:', err);
            alert('Erreur lors de l\'upload du logo: ' + (err?.error?.message || err?.message || 'Unknown error'));
          }
        });
      } else {
        console.warn('No shop_id found, using preview only');
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewUrl = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeLogo(): void {
    this.previewUrl = null;
    this.profile.logo = undefined;
  }

  getInitialMapPosition(): any {
    if (this.profile.location?.latitude && this.profile.location?.longitude) {
      return {
        lat: this.profile.location.latitude,
        lng: this.profile.location.longitude,
        address: this.profile.location.address
      };
    }
    return undefined;
  }

  openMapPicker(): void {
    this.showMapPicker = true;
  }

  closeMapPicker(): void {
    this.showMapPicker = false;
  }

  onLocationSelected(position: any): void {
    this.profile.location = {
      ...this.profile.location,
      latitude: position.lat,
      longitude: position.lng,
      address: position.address || this.profile.location?.address
    };
    this.closeMapPicker();
  }

  getStaticMapUrl(): string {
    const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY';
    const lat = this.profile.location?.latitude;
    const lng = this.profile.location?.longitude;
    if (!lat || !lng) return '';
    
    // Using Google Maps Static API for preview
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=800x300&markers=color:red%7C${lat},${lng}&key=${apiKey}`;
  }

  saveProfile(): void {
    this.saving = true;
    this.error = null;
    
    // Update business hours from weekDays
    this.weekDays.forEach(day => {
      (this.profile.business_hours as any)[day.key] = day.hours;
    });

    // Call API to save
    this.shopService.updateMyProfile(this.profile).subscribe({
      next: () => {
        this.saving = false;
        this.showSuccess = true;
        setTimeout(() => this.showSuccess = false, 3000);
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message || 'Erreur lors de la sauvegarde';
        console.error('Save error:', err);
      }
    });
  }
}
