import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { OrderService, DashboardStats, TodoItem } from '../../services/order.service';

@Component({
  selector: 'app-shop-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <h2>🏪 Tableau de bord</h2>
        <div class="period-selector">
          <button [class.active]="period === 7" (click)="changePeriod(7)">7 jours</button>
          <button [class.active]="period === 30" (click)="changePeriod(30)">30 jours</button>
          <button [class.active]="period === 90" (click)="changePeriod(90)">90 jours</button>
        </div>
      </div>

      <div *ngIf="loading" class="loading">Chargement...</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <div class="dashboard-content" *ngIf="!loading && stats">
        <!-- KPI Cards -->
        <div class="stats-grid">
          <div class="stat-card primary">
            <span class="icon">💵</span>
            <div class="stat-info">
              <span class="value">{{ stats.revenue | currency:'Ar ':'symbol':'1.0-0' }}</span>
              <span class="label">Chiffre d'affaires</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="icon">🛒</span>
            <div class="stat-info">
              <span class="value">{{ stats.orders_count }}</span>
              <span class="label">Commandes</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="icon">📈</span>
            <div class="stat-info">
              <span class="value">{{ stats.conversion_rate }}%</span>
              <span class="label">Conversion</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="icon">⏳</span>
            <div class="stat-info">
              <span class="value">{{ stats.orders_by_status.PENDING }}</span>
              <span class="label">En attente</span>
            </div>
          </div>
        </div>

        <!-- Monthly Chart & Top Products -->
        <div class="dashboard-row">
          <div class="dashboard-card chart-card">
            <h3>📊 Ventes mensuelles</h3>
            <div class="chart-bars">
              <div *ngFor="let m of stats.monthly_sales" class="bar-wrapper">
                <div class="bar" [style.height.%]="getBarHeight(m.revenue)"></div>
                <span class="bar-label">{{ formatMonth(m.month) }}</span>
              </div>
            </div>
          </div>

          <div class="dashboard-card">
            <h3>🏆 Top Produits</h3>
            <div class="product-item" *ngFor="let p of stats.top_products; let i = index">
              <span class="rank">{{ i + 1 }}</span>
              <div class="product-info">
                <span class="name">{{ p.name }}</span>
                <span class="details">{{ p.total_quantity }} vendus</span>
              </div>
            </div>
          </div>
        </div>

        <!-- To-Do & Recent Orders -->
        <div class="dashboard-row">
          <div class="dashboard-card">
            <div class="card-header">
              <h3>✅ À faire</h3>
              <span class="badge" *ngIf="todoList.length">{{ todoList.length }}</span>
            </div>
            <div class="todo-item" *ngFor="let t of todoList.slice(0, 5)" [routerLink]="['/shop/orders']">
              <span class="priority-dot" [class.high]="t.priority === 'high'"></span>
              <span>{{ t.title }}</span>
            </div>
          </div>

          <div class="dashboard-card">
            <div class="card-header">
              <h3>🕐 Commandes récentes</h3>
              <a routerLink="/shop/orders">Voir tout</a>
            </div>
            <div class="order-item" *ngFor="let o of stats.recent_orders" [routerLink]="['/shop/orders', o._id]">
              <span class="order-num">{{ o.order_number }}</span>
              <span class="status-badge" [style.background]="getStatusColor(o.status)">{{ getStatusLabel(o.status) }}</span>
              <span class="amount">{{ o.total_amount | currency:'Ar ':'symbol':'1.0-0' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 1.5rem; max-width: 1400px; }
    .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
    h2 { color: #1e293b; margin: 0; }
    .period-selector { display: flex; gap: 0.5rem; }
    .period-selector button { padding: 0.5rem 1rem; border: 1px solid #e2e8f0; background: white; border-radius: 8px; cursor: pointer; }
    .period-selector button.active { background: #8b5cf6; color: white; border-color: #8b5cf6; }
    .loading, .error { text-align: center; padding: 3rem; }
    .error { color: #dc2626; }

    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem; }
    .stat-card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 1rem; }
    .stat-card.primary .icon { background: #8b5cf6; color: white; }
    .stat-card .icon { font-size: 1.75rem; width: 56px; height: 56px; background: #f3f0ff; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-info .value { font-size: 1.5rem; font-weight: 700; color: #1e293b; }
    .stat-info .label { color: #64748b; font-size: 0.875rem; }

    .dashboard-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem; }
    .dashboard-card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 1.5rem; }
    .dashboard-card h3 { margin: 0 0 1rem 0; color: #1e293b; font-size: 1rem; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .card-header h3 { margin: 0; }
    .badge { background: #dc2626; color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
    a { color: #8b5cf6; font-size: 0.875rem; text-decoration: none; }

    .chart-bars { display: flex; align-items: flex-end; height: 150px; gap: 8px; }
    .bar-wrapper { flex: 1; display: flex; flex-direction: column; align-items: center; }
    .bar { width: 100%; background: linear-gradient(to top, #8b5cf6, #a78bfa); border-radius: 4px 4px 0 0; min-height: 4px; }
    .bar-label { font-size: 0.75rem; color: #64748b; margin-top: 0.5rem; }

    .product-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #f8fafc; border-radius: 8px; margin-bottom: 0.5rem; }
    .rank { width: 28px; height: 28px; background: #8b5cf6; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; font-weight: 600; }
    .product-info { display: flex; flex-direction: column; }
    .product-info .name { font-weight: 500; font-size: 0.875rem; color: #1e293b; }
    .product-info .details { font-size: 0.75rem; color: #64748b; }

    .todo-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #f8fafc; border-radius: 8px; margin-bottom: 0.5rem; cursor: pointer; }
    .priority-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; }
    .priority-dot.high { background: #dc2626; }

    .order-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: #f8fafc; border-radius: 8px; margin-bottom: 0.5rem; cursor: pointer; }
    .order-num { font-weight: 600; font-size: 0.875rem; color: #1e293b; }
    .status-badge { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; color: white; }
    .amount { font-weight: 600; color: #1e293b; }
  `]
})
export class ShopDashboardComponent implements OnInit, OnDestroy {
  stats: DashboardStats | null = null;
  todoList: TodoItem[] = [];
  loading = true;
  error: string | null = null;
  period = 30;

  private subscriptions: Subscription[] = [];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadTodoList();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  loadStats(): void {
    this.loading = true;
    this.error = null;
    const sub = this.orderService.getDashboardStats(this.period).subscribe({
      next: (r) => { this.stats = r.data; this.loading = false; },
      error: (e) => { this.error = 'Erreur de chargement'; this.loading = false; console.error(e); }
    });
    this.subscriptions.push(sub);
  }

  loadTodoList(): void {
    const sub = this.orderService.getTodoList().subscribe({
      next: (r) => { this.todoList = r.data; },
      error: (e) => { console.error(e); }
    });
    this.subscriptions.push(sub);
  }

  changePeriod(days: number): void { this.period = days; this.loadStats(); }

  getBarHeight(revenue: number): number {
    if (!this.stats?.monthly_sales?.length) return 0;
    const max = Math.max(...this.stats.monthly_sales.map(m => m.revenue));
    return max > 0 ? (revenue / max) * 100 : 0;
  }

  formatMonth(monthStr: string): string {
    const months = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc'];
    const [, month] = monthStr.split('-');
    return months[parseInt(month) - 1] || monthStr;
  }

  getStatusLabel(status: string): string { return this.orderService.getStatusLabel(status); }
  getStatusColor(status: string): string { return this.orderService.getStatusColor(status); }
}
