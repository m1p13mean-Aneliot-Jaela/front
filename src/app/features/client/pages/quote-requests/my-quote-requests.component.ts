import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuoteRequestService, QuoteRequest } from '../../services/quote-request.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-my-quote-requests',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="quote-requests-page">
      <div class="page-header">
        <h2>📝 Mes demandes de devis</h2>
        <p class="subtitle">Suivez vos demandes et les réponses des boutiques</p>
        <div class="header-actions">
          <a class="btn-primary" routerLink="/client/quote-requests/new">Nouvelle demande</a>
        </div>
      </div>

      <!-- Phone input for non-registered users -->
      <div class="phone-search" *ngIf="!isAuthenticated">
        <label>Entrez votre numéro de téléphone pour voir vos demandes :</label>
        <div class="phone-input-group">
          <input 
            type="tel" 
            [(ngModel)]="searchPhone"
            placeholder="Ex: 0341234567"
            (keyup.enter)="loadQuotes()">
          <button class="btn-primary" (click)="loadQuotes()">Rechercher</button>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading">
        Chargement de vos demandes...
      </div>

      <!-- Error -->
      <div *ngIf="error" class="error-message">
        {{ error }}
      </div>

      <!-- Empty state -->
      <div *ngIf="!loading && !error && quotes.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>Aucune demande trouvée</h3>
        <p *ngIf="hasSearched">Aucune demande n'est associée à ce numéro de téléphone.</p>
        <p *ngIf="!hasSearched && isAuthenticated">Vous n'avez pas encore fait de demande de devis.</p>
        <div class="empty-actions">
          <a class="btn-primary" routerLink="/client/quote-requests/new">Faire une demande</a>
          <a class="btn-secondary" routerLink="/client/shops">Voir les boutiques</a>
        </div>
      </div>

      <!-- Quote requests list -->
      <div *ngIf="!loading && quotes.length > 0" class="quotes-list">
        <div 
          class="quote-card" 
          *ngFor="let quote of quotes"
          [class.clickable]="quote.status === 'QUOTE_SENT' || quote.status === 'ACCEPTED'"
          (click)="viewQuoteDetail(quote)">
          
          <div class="quote-header">
            <div class="shop-info">
              <span class="shop-name">{{ quote.shop_name }}</span>
              <span class="quote-date">{{ quote.created_at | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
            <span class="status-badge" [class]="getStatusClass(quote.status)">
              {{ getStatusLabel(quote.status) }}
            </span>
          </div>

          <div class="quote-items">
            <div class="items-summary">
              <span *ngFor="let item of quote.requested_items.slice(0, 2); let last = last">
                {{ item.product_name }} (x{{ item.quantity }}){{ last ? '' : ', ' }}
              </span>
              <span *ngIf="quote.requested_items.length > 2" class="more-items">
                +{{ quote.requested_items.length - 2 }} autres
              </span>
            </div>
          </div>

          <!-- Manager response preview -->
          <div class="manager-response" *ngIf="quote.manager_response">
            <div class="response-header">
              <span class="response-by">💼 Réponse de {{ quote.handled_by_name || 'le manager' }}</span>
            </div>
            <p class="response-message" *ngIf="quote.manager_response.message">
              "{{ quote.manager_response.message }}"
            </p>
            <div class="quote-total" *ngIf="quote.manager_response.calculated_total">
              <span class="total-label">Total proposé:</span>
              <span class="total-value">{{ quote.manager_response.calculated_total | number }} Ar</span>
              <span class="shipping-fee" *ngIf="quote.manager_response.shipping_fee">
                (livraison: {{ quote.manager_response.shipping_fee | number }} Ar)
              </span>
            </div>
          </div>

          <!-- Client response actions -->
          <div class="client-actions" *ngIf="quote.status === 'QUOTE_SENT' && !quote.client_response">
            <div class="action-hint">
              ⏰ Ce devis expire le {{ quote.expires_at | date:'dd/MM/yyyy' }}
            </div>
            <div class="action-buttons">
              <button class="btn-accept" (click)="respondToQuote(quote._id, true, $event)">
                ✅ Accepter
              </button>
              <button class="btn-reject" (click)="respondToQuote(quote._id, false, $event)">
                ❌ Refuser
              </button>
            </div>
          </div>

          <!-- Client response result -->
          <div class="client-response" *ngIf="quote.client_response">
            <span [class]="quote.client_response.accepted ? 'accepted' : 'rejected'">
              {{ quote.client_response.accepted ? '✅ Vous avez accepté' : '❌ Vous avez refusé' }}
            </span>
            <span class="response-date">le {{ quote.client_response.responded_at | date:'dd/MM/yyyy' }}</span>
          </div>

          <!-- Converted to order -->
          <div class="converted-info" *ngIf="quote.status === 'CONVERTED' && quote.converted_order_id">
            <span class="converted-badge">🎉 Commande créée !</span>
            <button class="btn-view-order" (click)="viewOrder(quote.converted_order_id, $event)">
              Voir la commande →
            </button>
          </div>

          <div class="quote-footer">
            <span class="items-count">{{ quote.requested_items.length }} produit(s)</span>
            <span class="view-detail" *ngIf="quote.status === 'QUOTE_SENT' || quote.status === 'ACCEPTED'">
              Cliquez pour voir le détail →
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .quote-requests-page {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .page-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .header-actions {
      margin-top: 1rem;
    }

    .page-header h2 {
      margin: 0 0 0.5rem 0;
      color: #1e293b;
      font-size: 1.75rem;
    }

    .subtitle {
      color: #64748b;
      margin: 0;
    }

    /* Phone search for guests */
    .phone-search {
      background: #f8fafc;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 2rem;
    }

    .phone-search label {
      display: block;
      margin-bottom: 0.75rem;
      color: #475569;
      font-weight: 500;
    }

    .phone-input-group {
      display: flex;
      gap: 0.75rem;
    }

    .phone-input-group input {
      flex: 1;
      padding: 0.75rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
    }

    .phone-input-group input:focus {
      outline: none;
      border-color: #8b5cf6;
    }

    /* Loading & Error */
    .loading {
      text-align: center;
      padding: 3rem;
      color: #64748b;
    }

    .error-message {
      background: #fee2e2;
      color: #dc2626;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: #f8fafc;
      border-radius: 12px;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: #1e293b;
    }

    .empty-state p {
      color: #64748b;
      margin: 0 0 1.5rem 0;
    }

    .empty-actions {
      display: flex;
      justify-content: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .btn-secondary {
      background: #e2e8f0;
      color: #334155;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
      text-decoration: none;
      display: inline-block;
    }

    .btn-secondary:hover {
      background: #cbd5e1;
    }

    /* Quote cards */
    .quotes-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .quote-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: box-shadow 0.2s, transform 0.2s;
    }

    .quote-card.clickable {
      cursor: pointer;
    }

    .quote-card.clickable:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: translateY(-2px);
    }

    .quote-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .shop-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .shop-name {
      font-weight: 600;
      color: #1e293b;
      font-size: 1.125rem;
    }

    .quote-date {
      color: #94a3b8;
      font-size: 0.875rem;
    }

    /* Status badges */
    .status-badge {
      padding: 0.375rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-badge.pending { background: #fef3c7; color: #92400e; }
    .status-badge.reviewing { background: #e0e7ff; color: #4338ca; }
    .status-badge.quote-sent { background: #dbeafe; color: #1d4ed8; }
    .status-badge.accepted { background: #d1fae5; color: #065f46; }
    .status-badge.rejected { background: #fee2e2; color: #991b1b; }
    .status-badge.converted { background: #d1fae5; color: #059669; }
    .status-badge.expired { background: #f3f4f6; color: #6b7280; }

    /* Quote items */
    .quote-items {
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .items-summary {
      color: #64748b;
      font-size: 0.875rem;
    }

    .more-items {
      color: #8b5cf6;
    }

    /* Manager response */
    .manager-response {
      background: #f8fafc;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .response-header {
      margin-bottom: 0.5rem;
    }

    .response-by {
      font-weight: 500;
      color: #475569;
      font-size: 0.875rem;
    }

    .response-message {
      color: #64748b;
      font-style: italic;
      margin: 0.5rem 0;
    }

    .quote-total {
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px dashed #cbd5e1;
    }

    .total-label {
      color: #64748b;
    }

    .total-value {
      font-weight: 700;
      color: #059669;
      font-size: 1.25rem;
      margin-left: 0.5rem;
    }

    .shipping-fee {
      color: #94a3b8;
      font-size: 0.875rem;
      margin-left: 0.5rem;
    }

    /* Client actions */
    .client-actions {
      margin-bottom: 1rem;
    }

    .action-hint {
      color: #f59e0b;
      font-size: 0.875rem;
      margin-bottom: 0.75rem;
    }

    .action-buttons {
      display: flex;
      gap: 0.75rem;
    }

    .btn-accept, .btn-reject {
      flex: 1;
      padding: 0.75rem;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-accept {
      background: #22c55e;
      color: white;
    }

    .btn-accept:hover {
      background: #16a34a;
    }

    .btn-reject {
      background: #ef4444;
      color: white;
    }

    .btn-reject:hover {
      background: #dc2626;
    }

    /* Client response result */
    .client-response {
      background: #f8fafc;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }

    .client-response .accepted {
      color: #059669;
      font-weight: 500;
    }

    .client-response .rejected {
      color: #dc2626;
      font-weight: 500;
    }

    .response-date {
      color: #94a3b8;
      margin-left: 0.5rem;
    }

    /* Converted info */
    .converted-info {
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .converted-badge {
      font-weight: 600;
      color: #065f46;
    }

    .btn-view-order {
      background: white;
      color: #059669;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
    }

    /* Quote footer */
    .quote-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.875rem;
    }

    .items-count {
      color: #94a3b8;
    }

    .view-detail {
      color: #8b5cf6;
      font-weight: 500;
    }

    /* Primary button */
    .btn-primary {
      background: #8b5cf6;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-primary:hover {
      background: #7c3aed;
    }
  `]
})
export class MyQuoteRequestsComponent implements OnInit {
  quotes: QuoteRequest[] = [];
  loading = false;
  error: string | null = null;
  isAuthenticated = false;
  searchPhone = '';
  hasSearched = false;

  constructor(
    private quoteService: QuoteRequestService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    this.isAuthenticated = user?.user_type === 'buyer';
    
    if (this.isAuthenticated && user?.phone) {
      this.searchPhone = user.phone;
      this.loadQuotes();
    }
  }

  loadQuotes(): void {
    if (!this.searchPhone) {
      this.error = 'Veuillez entrer un numéro de téléphone';
      return;
    }

    this.loading = true;
    this.error = null;
    this.hasSearched = true;

    this.quoteService.getMyQuotes(this.searchPhone).subscribe({
      next: (response) => {
        this.quotes = response.data.quotes;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des demandes';
        this.loading = false;
        console.error('Error loading quotes:', err);
      }
    });
  }

  respondToQuote(quoteId: string, accepted: boolean, event: Event): void {
    event.stopPropagation();
    
    const message = accepted 
      ? 'Je confirme ma commande' 
      : 'Je ne souhaite pas poursuivre';

    this.quoteService.respondToQuote(quoteId, accepted, message).subscribe({
      next: () => {
        this.loadQuotes(); // Reload to show updated status
      },
      error: (err) => {
        console.error('Error responding to quote:', err);
        alert('Erreur lors de la réponse au devis');
      }
    });
  }

  viewQuoteDetail(quote: QuoteRequest): void {
    if (quote.status === 'QUOTE_SENT' || quote.status === 'ACCEPTED') {
      // Navigate to detail page if needed
      // this.router.navigate(['/quotes', quote._id]);
      alert('Page de détail à implémenter');
    }
  }

  viewOrder(orderId: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/orders', orderId]);
  }

  getStatusLabel(status: string): string {
    return this.quoteService.getStatusLabel(status);
  }

  getStatusClass(status: string): string {
    return this.quoteService.getStatusClass(status);
  }
}
