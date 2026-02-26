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

        <!-- Revenue Charts -->
        <div class="dashboard-row">
          <div class="dashboard-card chart-card wide">
            <h3>📊 Chiffre d'affaires</h3>
            <div class="chart-tabs">
              <button [class.active]="revenueView === 'monthly'" (click)="revenueView = 'monthly'">Mensuel</button>
              <button [class.active]="revenueView === 'yearly'" (click)="revenueView = 'yearly'">Annuel</button>
            </div>
            <div class="chart-container" *ngIf="revenueView === 'monthly'">
              <svg viewBox="0 0 400 200" class="line-chart">
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <polygon [attr.points]="getRevenueAreaPoints()" fill="url(#revenueGradient)"/>
                <polyline [attr.points]="getRevenueLinePoints()" fill="none" stroke="#8b5cf6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                <circle *ngFor="let point of getRevenuePoints(); let i = index" [attr.cx]="point.x" [attr.cy]="point.y" r="4" fill="#8b5cf6"/>
                <text *ngFor="let point of getRevenuePoints(); let i = index" [attr.x]="point.x" [attr.y]="185" text-anchor="middle" font-size="10" fill="#64748b">{{ point.label }}</text>
              </svg>
              <div class="chart-legend">
                <span class="legend-item"><span class="dot" style="background:#8b5cf6"></span> CA Mensuel</span>
              </div>
            </div>
            <div class="chart-container yearly" *ngIf="revenueView === 'yearly'">
              <div class="yearly-stats">
                <div class="year-stat" *ngFor="let year of getYearlyRevenue()">
                  <span class="year-label">{{ year.year }}</span>
                  <div class="year-bar-container">
                    <div class="year-bar" [style.height.%]="year.percentage"></div>
                  </div>
                  <span class="year-value">{{ year.revenue | currency:'Ar ':'symbol':'1.0-0' }}</span>
                </div>
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

        <!-- To-Do with Sales Chart & Recent Orders -->
        <div class="dashboard-row">
          <div class="dashboard-card">
            <div class="card-header">
              <h3>✅ À faire</h3>
              <span class="badge" *ngIf="todoList.length">{{ todoList.length }}</span>
            </div>
            <div class="todo-sales-chart">
              <h4>📈 Ventes des 7 derniers jours</h4>
              <svg viewBox="0 0 300 100" class="mini-chart">
                <polyline [attr.points]="getTodoSalesPoints()" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle *ngFor="let point of getTodoSalesData(); let i = index" [attr.cx]="point.x" [attr.cy]="point.y" r="3" fill="#22c55e"/>
              </svg>
              <div class="mini-chart-labels">
                <span *ngFor="let label of getTodoSalesLabels()">{{ label }}</span>
              </div>
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
    .dashboard-card.wide { grid-column: span 2; }
    @media (max-width: 900px) { .dashboard-card.wide { grid-column: span 1; } }
    .dashboard-card h3 { margin: 0 0 1rem 0; color: #1e293b; font-size: 1rem; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .card-header h3 { margin: 0; }
    .badge { background: #dc2626; color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
    a { color: #8b5cf6; font-size: 0.875rem; text-decoration: none; }

    .chart-tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
    .chart-tabs button { padding: 0.4rem 1rem; border: 1px solid #e2e8f0; background: white; border-radius: 6px; cursor: pointer; font-size: 0.875rem; }
    .chart-tabs button.active { background: #8b5cf6; color: white; border-color: #8b5cf6; }
    .chart-container { height: 220px; }
    .line-chart { width: 100%; height: 100%; }
    .chart-legend { display: flex; justify-content: center; margin-top: 0.5rem; }
    .legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #64748b; }
    .legend-item .dot { width: 10px; height: 10px; border-radius: 50%; }

    .yearly-stats { display: flex; flex-direction: column; gap: 1rem; padding: 1rem 0; }
    .year-stat { display: flex; align-items: center; gap: 1rem; }
    .year-label { width: 50px; font-weight: 600; color: #1e293b; }
    .year-bar-container { flex: 1; height: 30px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
    .year-bar { background: linear-gradient(to right, #8b5cf6, #a78bfa); border-radius: 4px; transition: height 0.3s; }
    .year-value { width: 100px; text-align: right; font-weight: 600; color: #1e293b; font-size: 0.875rem; }

    .todo-sales-chart { margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #e2e8f0; }
    .todo-sales-chart h4 { margin: 0 0 0.75rem 0; font-size: 0.875rem; color: #64748b; font-weight: 500; }
    .mini-chart { width: 100%; height: 80px; }
    .mini-chart-labels { display: flex; justify-content: space-between; font-size: 0.7rem; color: #94a3b8; margin-top: 0.25rem; }

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
  revenueView: 'monthly' | 'yearly' = 'monthly';

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

  // Revenue chart methods
  getRevenuePoints(): {x: number, y: number, label: string, value: number}[] {
    if (!this.stats?.monthly_sales?.length) return [];
    const sales = this.stats.monthly_sales.slice(-6); // Last 6 months
    const max = Math.max(...sales.map(m => m.revenue), 1);
    const width = 400;
    const height = 180;
    const padding = 40;
    
    return sales.map((m, i) => ({
      x: padding + (i * (width - 2 * padding) / (sales.length - 1 || 1)),
      y: height - 20 - ((m.revenue / max) * (height - 40)),
      label: this.formatMonth(m.month),
      value: m.revenue
    }));
  }

  getRevenueLinePoints(): string {
    return this.getRevenuePoints().map(p => `${p.x},${p.y}`).join(' ');
  }

  getRevenueAreaPoints(): string {
    const points = this.getRevenuePoints();
    if (!points.length) return '';
    const height = 180;
    const start = `${points[0].x},${height - 20}`;
    const end = `${points[points.length - 1].x},${height - 20}`;
    return `${start} ${this.getRevenueLinePoints()} ${end}`;
  }

  getYearlyRevenue(): {year: string, revenue: number, percentage: number}[] {
    if (!this.stats?.monthly_sales?.length) return [];
    const byYear: {[key: string]: number} = {};
    this.stats.monthly_sales.forEach(m => {
      const year = m.month.split('-')[0];
      byYear[year] = (byYear[year] || 0) + m.revenue;
    });
    const years = Object.entries(byYear).map(([year, revenue]) => ({ year, revenue }));
    const max = Math.max(...years.map(y => y.revenue), 1);
    return years.map(y => ({ ...y, percentage: (y.revenue / max) * 100 }));
  }

  // Todo sales chart methods
  getTodoSalesData(): {x: number, y: number, value: number}[] {
    // Generate mock daily sales data for last 7 days
    const data = this.stats?.monthly_sales?.slice(-1)[0]?.revenue || 100000;
    const daily = data / 30;
    const values = Array.from({length: 7}, (_, i) => daily * (0.7 + Math.random() * 0.6));
    const max = Math.max(...values, 1);
    const width = 300;
    const height = 80;
    
    return values.map((v, i) => ({
      x: 20 + (i * (width - 40) / 6),
      y: height - 10 - ((v / max) * (height - 20)),
      value: v
    }));
  }

  getTodoSalesPoints(): string {
    return this.getTodoSalesData().map(p => `${p.x},${p.y}`).join(' ');
  }

  getTodoSalesLabels(): string[] {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const today = new Date().getDay();
    return Array.from({length: 7}, (_, i) => {
      const dayIndex = (today - 6 + i + 7) % 7;
      return days[dayIndex === 0 ? 6 : dayIndex - 1];
    });
  }
}
