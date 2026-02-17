import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <h2>Bienvenue dans votre espace !</h2>
      <div class="welcome-section">
        <div class="promo-card">
          <span class="icon">🎁</span>
          <h3>Offre spéciale</h3>
          <p>-20% sur votre première commande avec le code BIENVENUE</p>
          <button class="btn-primary">Parcourir les boutiques</button>
        </div>
      </div>
      <div class="quick-actions">
        <h3>Accès rapide</h3>
        <div class="actions-grid">
          <button class="action-card">
            <span class="icon">🏪</span>
            <span>Boutiques</span>
          </button>
          <button class="action-card">
            <span class="icon">📋</span>
            <span>Mes commandes</span>
          </button>
          <button class="action-card">
            <span class="icon">❤️</span>
            <span>Favoris</span>
          </button>
          <button class="action-card">
            <span class="icon">🎟️</span>
            <span>Promotions</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1200px;
    }
    h2 {
      color: #1e293b;
      margin-bottom: 1.5rem;
    }
    .welcome-section {
      margin-bottom: 2rem;
    }
    .promo-card {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 2rem;
      border-radius: 16px;
      text-align: center;
    }
    .promo-card .icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      display: block;
    }
    .promo-card h3 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }
    .promo-card p {
      opacity: 0.9;
      margin-bottom: 1.5rem;
    }
    .btn-primary {
      background: white;
      color: #059669;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
    }
    .quick-actions h3 {
      color: #1e293b;
      margin-bottom: 1rem;
    }
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
    }
    .action-card {
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .action-card:hover {
      border-color: #10b981;
      background: #f0fdf4;
    }
    .action-card .icon {
      font-size: 2rem;
    }
    .action-card span:last-child {
      font-weight: 500;
      color: #475569;
    }
  `]
})
export class ClientDashboardComponent {}
