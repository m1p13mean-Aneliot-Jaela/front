import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Google Maps types
declare const google: any;

interface MapPosition {
  lat: number;
  lng: number;
  address?: string;
}

@Component({
  selector: 'app-map-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-container">
      <!-- Map Container -->
      <div #mapElement class="map-canvas"></div>
      
      <!-- Search Box -->
      <div class="search-box">
        <input 
          #searchInput
          type="text" 
          class="search-input" 
          placeholder="🔍 Rechercher une adresse..."
          (keydown.enter)="searchLocation()"
        >
        <button class="btn-search" (click)="searchLocation()">Rechercher</button>
      </div>

      <!-- Current Position Info -->
      <div class="position-info" *ngIf="currentPosition">
        <div class="coord-display">
          <span>📍 Lat: {{ currentPosition.lat | number:'1.6-6' }}</span>
          <span>Lng: {{ currentPosition.lng | number:'1.6-6' }}</span>
        </div>
        <button class="btn-confirm" (click)="confirmLocation()">
          ✅ Confirmer cette position
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-overlay">
        <span>Chargement de la carte...</span>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error-message">
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .map-container {
      position: relative;
      width: 100%;
      height: 400px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .map-canvas {
      width: 100%;
      height: 100%;
    }

    /* Search Box */
    .search-box {
      position: absolute;
      top: 12px;
      left: 12px;
      right: 12px;
      display: flex;
      gap: 0.5rem;
      z-index: 10;
      background: white;
      padding: 0.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .search-input {
      flex: 1;
      padding: 0.5rem 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.875rem;
    }
    .btn-search {
      padding: 0.5rem 1rem;
      background: #8b5cf6;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
    }

    /* Position Info */
    .position-info {
      position: absolute;
      bottom: 12px;
      left: 12px;
      right: 12px;
      background: white;
      padding: 0.75rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .coord-display {
      display: flex;
      gap: 1rem;
      font-size: 0.875rem;
      color: #64748b;
    }
    .btn-confirm {
      padding: 0.5rem 1rem;
      background: #22c55e;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
    }
    .btn-confirm:hover {
      background: #16a34a;
    }

    /* Loading & Error */
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255,255,255,0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 20;
      color: #64748b;
    }
    .error-message {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #fee2e2;
      color: #dc2626;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      z-index: 20;
    }
  `]
})
export class MapPickerComponent implements OnInit {
  @Input() initialPosition?: MapPosition;
  @Output() positionSelected = new EventEmitter<MapPosition>();
  @Output() closed = new EventEmitter<void>();

  private map: any;
  private marker: any;
  private geocoder: any;
  private autocomplete: any;

  currentPosition: MapPosition | null = null;
  loading = true;
  error: string | null = null;

  constructor() {}

  ngOnInit(): void {
    this.loadGoogleMaps();
  }

  private loadGoogleMaps(): void {
    // Check if Google Maps is already loaded
    if (typeof google !== 'undefined' && google.maps) {
      this.initMap();
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    // Replace YOUR_API_KEY with your actual Google Maps API key
    const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;

    // Global callback
    (window as any).initGoogleMaps = () => {
      this.initMap();
    };

    script.onerror = () => {
      this.loading = false;
      this.error = 'Erreur lors du chargement de Google Maps. Vérifiez votre clé API.';
    };

    document.head.appendChild(script);
  }

  private initMap(): void {
    try {
      const mapElement = document.querySelector('.map-canvas') as HTMLElement;
      if (!mapElement) return;

      // Default position (Antananarivo, Madagascar)
      const defaultPos = { lat: -18.8792, lng: 47.5079 };
      const initialLat = this.initialPosition?.lat || defaultPos.lat;
      const initialLng = this.initialPosition?.lng || defaultPos.lng;

      // Create map
      this.map = new google.maps.Map(mapElement, {
        center: { lat: initialLat, lng: initialLng },
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });

      // Create marker
      this.marker = new google.maps.Marker({
        map: this.map,
        position: { lat: initialLat, lng: initialLng },
        draggable: true,
        animation: google.maps.Animation.DROP
      });

      // Update position on marker drag
      this.marker.addListener('dragend', () => {
        const pos = this.marker.getPosition();
        this.updatePosition(pos.lat(), pos.lng());
      });

      // Update position on map click
      this.map.addListener('click', (event: any) => {
        const pos = event.latLng;
        this.marker.setPosition(pos);
        this.updatePosition(pos.lat(), pos.lng());
      });

      // Initialize geocoder
      this.geocoder = new google.maps.Geocoder();

      // Initialize autocomplete for search
      const searchInput = document.querySelector('.search-input') as HTMLInputElement;
      if (searchInput) {
        this.autocomplete = new google.maps.places.Autocomplete(searchInput, {
          types: ['geocode', 'establishment']
        });
        this.autocomplete.bindTo('bounds', this.map);

        this.autocomplete.addListener('place_changed', () => {
          const place = this.autocomplete.getPlace();
          if (place.geometry) {
            const location = place.geometry.location;
            this.map.setCenter(location);
            this.marker.setPosition(location);
            this.updatePosition(location.lat(), location.lng(), place.formatted_address);
          }
        });
      }

      // Set initial position
      this.currentPosition = {
        lat: initialLat,
        lng: initialLng,
        address: this.initialPosition?.address
      };

      this.loading = false;
    } catch (err) {
      this.loading = false;
      this.error = 'Erreur lors de l\'initialisation de la carte';
      console.error('Map init error:', err);
    }
  }

  private updatePosition(lat: number, lng: number, address?: string): void {
    this.currentPosition = { lat, lng, address };

    // Reverse geocode to get address if not provided
    if (!address && this.geocoder) {
      this.geocoder.geocode(
        { location: { lat, lng } },
        (results: any[], status: string) => {
          if (status === 'OK' && results[0]) {
            this.currentPosition!.address = results[0].formatted_address;
          }
        }
      );
    }
  }

  searchLocation(): void {
    const searchInput = document.querySelector('.search-input') as HTMLInputElement;
    const query = searchInput?.value;
    if (!query || !this.geocoder) return;

    this.geocoder.geocode({ address: query }, (results: any[], status: string) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        this.map.setCenter(location);
        this.marker.setPosition(location);
        this.updatePosition(location.lat(), location.lng(), results[0].formatted_address);
      } else {
        alert('Adresse non trouvée');
      }
    });
  }

  confirmLocation(): void {
    if (this.currentPosition) {
      this.positionSelected.emit(this.currentPosition);
    }
  }

  close(): void {
    this.closed.emit();
  }
}
