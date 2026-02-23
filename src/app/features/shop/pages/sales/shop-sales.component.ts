import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shop-sales',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h2>Mes Ventes</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="label">Ventes du jour</span>
          <span class="value">1,250,000 Ar</span>
        </div>
        <div class="stat-card">
          <span class="label">Ventes du mois</span>
          <span class="value">15,680,000 Ar</span>
        </div>
        <div class="stat-card">
          <span class="label">Commandes</span>
          <span class="value">128</span>
        </div>
        <div class="stat-card">
          <span class="label">Panier moyen</span>
          <span class="value">122,500 Ar</span>
        </div>
      </div>
      <div class="chart-placeholder">
        <h3>Graphique des ventes</h3>
        <p>📊 Visualisation des ventes par semaine (statique)</p>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem;
    }
    h2 {
      margin-bottom: 1.5rem;
      color: #1e293b;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
    }
    .label {
      color: #64748b;
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }
    .value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
    }
    .stat-card:nth-child(1) .value { color: #8b5cf6; }
    .stat-card:nth-child(2) .value { color: #10b981; }
    .stat-card:nth-child(3) .value { color: #f59e0b; }
    .stat-card:nth-child(4) .value { color: #ef4444; }
    .chart-placeholder {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      text-align: center;
      color: #64748b;
    }
    h3 {
      margin-bottom: 1rem;
      color: #1e293b;
    }
  `]
})
export class ShopSalesComponent {}
