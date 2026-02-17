import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <h2>Tableau de bord Administrateur</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="icon">👥</span>
          <div class="stat-info">
            <span class="value">1,234</span>
            <span class="label">Utilisateurs</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="icon">🏪</span>
          <div class="stat-info">
            <span class="value">56</span>
            <span class="label">Boutiques</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="icon">📦</span>
          <div class="stat-info">
            <span class="value">8,932</span>
            <span class="label">Produits</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="icon">💰</span>
          <div class="stat-info">
            <span class="value">€45.2K</span>
            <span class="label">Revenus</span>
          </div>
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
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
    }
    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .stat-card .icon {
      font-size: 2rem;
      width: 60px;
      height: 60px;
      background: #fef2f2;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .stat-info {
      display: flex;
      flex-direction: column;
    }
    .stat-info .value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e293b;
    }
    .stat-info .label {
      color: #64748b;
      font-size: 0.875rem;
    }
  `]
})
export class AdminDashboardComponent {}
