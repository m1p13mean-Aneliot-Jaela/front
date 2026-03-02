import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ShopQuoteRequestService, QuoteRequest, QuoteStats, ManagerResponseItem } from '../../services/quote-request.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ProductService, Product } from '../../services/product.service';
import { EmployeeService, Employee } from '../../services/employee.service';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-shop-quote-requests',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="quote-requests-page">
      <div class="page-header">
        <h2>📝 Demandes clients</h2>
        <p class="subtitle">Gérez les demandes de devis et convertissez-les en commandes</p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-cards" *ngIf="stats">
        <div class="stat-card pending" (click)="filterByStatus('PENDING')">
          <span class="stat-value">{{ stats.pending }}</span>
          <span class="stat-label">En attente</span>
        </div>
        <div class="stat-card reviewing" (click)="filterByStatus('REVIEWING')">
          <span class="stat-value">{{ stats.reviewing }}</span>
          <span class="stat-label">En cours</span>
        </div>
        <div class="stat-card quote-sent" (click)="filterByStatus('QUOTE_SENT')">
          <span class="stat-value">{{ stats.quoteSent }}</span>
          <span class="stat-label">Devis envoyés</span>
        </div>
        <div class="stat-card accepted" (click)="filterByStatus('ACCEPTED')">
          <span class="stat-value">{{ stats.accepted }}</span>
          <span class="stat-label">À convertir</span>
        </div>
        <div class="stat-card total">
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">Total</span>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <input 
          type="text" 
          class="search-input"
          placeholder="🔍 Rechercher par nom ou téléphone..."
          [(ngModel)]="searchQuery"
          (input)="applyFilters()">
        
        <select class="filter-select" [(ngModel)]="statusFilter" (change)="applyFilters()">
          <option value="">Tous les statuts</option>
          <option value="PENDING">En attente</option>
          <option value="REVIEWING">En cours de traitement</option>
          <option value="QUOTE_SENT">Devis envoyé</option>
          <option value="ACCEPTED">Acceptée</option>
          <option value="REJECTED">Refusée</option>
          <option value="CONVERTED">Convertie</option>
        </select>

        <button class="btn-filter" (click)="resetFilters()">🔄 Réinitialiser</button>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading">
        Chargement des demandes...
      </div>

      <!-- Error -->
      <div *ngIf="error" class="error-message">
        {{ error }}
      </div>

      <!-- Quote Requests List -->
      <div *ngIf="!loading && !error" class="quotes-list">
        <div class="quote-card" *ngFor="let quote of filteredQuotes" [class]="quote.status.toLowerCase()">
          <div class="quote-header">
            <div class="client-info">
              <span class="client-name">👤 {{ quote.client_name }}</span>
              <span class="client-phone">📞 {{ quote.client_phone }}</span>
              <span class="quote-date">📅 {{ quote.created_at | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
            <span class="status-badge" [class]="getStatusClass(quote.status)">
              {{ getStatusLabel(quote.status) }}
            </span>
          </div>

          <!-- Client Address -->
          <div class="client-address" *ngIf="quote.client_address?.city">
            📍 {{ quote.client_address?.city }}<span *ngIf="quote.client_address?.street">, {{ quote.client_address?.street }}</span>
          </div>

          <!-- Requested Items -->
          <div class="items-section">
            <h4>Produits demandés:</h4>
            <div class="items-list">
              <div class="item" *ngFor="let item of quote.requested_items">
                <span class="item-name">{{ item.product_name }}</span>
                <span class="item-qty">x{{ item.quantity }}</span>
                <span class="item-notes" *ngIf="item.notes">({{ item.notes }})</span>
              </div>
            </div>
          </div>

          <!-- Actions for PENDING -->
          <div class="quote-actions" *ngIf="quote.status === 'PENDING'">
            <button class="btn-review" (click)="startReview(quote._id)">
              📋 Prendre en charge
            </button>
          </div>

          <!-- Actions for REVIEWING -->
          <div class="quote-actions" *ngIf="quote.status === 'REVIEWING' && quote.handled_by === currentUserId">
            <button class="btn-respond" (click)="openResponseModal(quote)">
              💰 Calculer le devis
            </button>
          </div>

          <!-- Manager Response Display -->
          <div class="manager-response" *ngIf="quote.manager_response">
            <div class="response-header">
              <span>💼 Devis envoyé par {{ quote.handled_by_name }}</span>
              <span class="response-date">{{ quote.handled_at | date:'dd/MM/yyyy' }}</span>
            </div>
            <p class="response-message" *ngIf="quote.manager_response.message">
              "{{ quote.manager_response.message }}"
            </p>
            <div class="quote-total">
              <span class="total-label">Total:</span>
              <span class="total-value">{{ quote.manager_response.calculated_total | number }} Ar</span>
              <span class="shipping-fee" *ngIf="quote.manager_response.shipping_fee">
                + {{ quote.manager_response.shipping_fee | number }} Ar livraison
              </span>
            </div>
          </div>

          <!-- Client Response -->
          <div class="client-response" *ngIf="quote.client_response">
            <span [class]="quote.client_response.accepted ? 'accepted' : 'rejected'">
              {{ quote.client_response.accepted ? '✅ Accepté' : '❌ Refusé' }}
            </span>
            <span class="response-message" *ngIf="quote.client_response.message">
              - "{{ quote.client_response.message }}"
            </span>
          </div>

          <!-- Convert to Order Action -->
          <div class="quote-actions" *ngIf="quote.status === 'ACCEPTED'">
            <button class="btn-convert" (click)="convertToOrder(quote)">
              🛒 Créer la commande
            </button>
          </div>

          <!-- Converted Info -->
          <div class="converted-info" *ngIf="quote.status === 'CONVERTED' && quote.converted_order_id">
            <span class="converted-badge">✅ Convertie en commande</span>
            <button class="btn-view-order" (click)="viewOrder(quote.converted_order_id)">
              Voir la commande →
            </button>
          </div>
        </div>

        <div *ngIf="filteredQuotes.length === 0" class="empty-state">
          Aucune demande trouvée
        </div>
      </div>
    </div>

    <!-- Response Modal -->
    <div class="modal-overlay" *ngIf="showResponseModal" (click)="closeResponseModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>💰 Répondre à la demande</h3>
          <button class="btn-close" (click)="closeResponseModal()">×</button>
        </div>

        <div class="modal-body" *ngIf="selectedQuote">
          <div class="client-info-modal">
            <h4>Client: {{ selectedQuote.client_name }}</h4>
            <p>📞 {{ selectedQuote.client_phone }}</p>
            <p *ngIf="selectedQuote.client_address?.city">
              📍 {{ selectedQuote.client_address?.city }}
            </p>
          </div>

          <div class="products-selection">
            <h4>Sélectionner les produits disponibles:</h4>
            <div class="search-product">
              <input 
                type="text" 
                [(ngModel)]="productSearch"
                (input)="searchProducts()"
                placeholder="Rechercher un produit...">
              <div class="search-results" *ngIf="searchResults.length > 0">
                <div 
                  class="product-option" 
                  *ngFor="let product of searchResults"
                  (click)="addProductToQuote(product)">
                  {{ product.name }} - {{ product.unit_price | number }} Ar
                </div>
              </div>
            </div>

            <div class="selected-products" *ngIf="confirmedItems.length > 0">
              <h5>Produits confirmés:</h5>
              <div class="selected-item" *ngFor="let item of confirmedItems; let i = index">
                <span>{{ item.product_name }}</span>
                <input 
                  type="number" 
                  [(ngModel)]="item.quantity" 
                  (change)="updateTotals()"
                  min="1">
                <input 
                  type="number" 
                  [(ngModel)]="item.unit_price" 
                  (change)="updateTotals()"
                  placeholder="Prix">
                <span class="item-total">{{ item.total | number }} Ar</span>
                <button class="btn-remove" (click)="removeItem(i)">×</button>
              </div>
            </div>
          </div>

          <div class="quote-form">
            <div class="form-group">
              <label>Message au client:</label>
              <textarea 
                [(ngModel)]="responseMessage" 
                rows="3"
                placeholder="Votre message... (ex: Voici votre devis personnalisé)"></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Frais de livraison (Ar):</label>
                <input 
                  type="number" 
                  [(ngModel)]="shippingFee" 
                  (change)="updateTotals()"
                  min="0">
              </div>
              <div class="form-group" *ngIf="autoDiscountAmount > 0">
                <label>Remise promotion (auto):</label>
                <div class="auto-discount-display">{{ autoDiscountAmount | number }} Ar</div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Remise additionnelle (Ar):</label>
                <input 
                  type="number" 
                  [(ngModel)]="discountAmount" 
                  (change)="updateTotals()"
                  min="0"
                  placeholder="Remise manuelle...">
              </div>
              <div class="form-group">
                <label>Remise % :</label>
                <input 
                  type="number" 
                  [(ngModel)]="discountPercent" 
                  (change)="updateTotals()"
                  min="0" max="100">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group" *ngIf="autoDiscountAmount > 0">
                <label>Remise promotion (auto):</label>
                <div class="auto-discount-display">{{ autoDiscountAmount | number }} Ar</div>
              </div>
              <div class="form-group">
                <label>Code promo:</label>
                <input 
                  type="text" 
                  [(ngModel)]="promotionCode" 
                  placeholder="ex: PROMO10">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Total calculé:</label>
                <div class="calculated-total">{{ calculatedTotal | number }} Ar</div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" (click)="closeResponseModal()">Annuler</button>
          <button 
            class="btn-primary" 
            (click)="submitResponse()"
            [disabled]="confirmedItems.length === 0">
            📤 Envoyer le devis
          </button>
        </div>
      </div>
    </div>

    <!-- Staff Selection Modal -->
    <div class="modal-overlay" *ngIf="showStaffModal" (click)="closeStaffModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>👤 Assigner un staff</h3>
          <button class="btn-close" (click)="closeStaffModal()">×</button>
        </div>

        <div class="modal-body" *ngIf="quoteToConvert">
          <div class="client-info-modal">
            <h4>Commande pour: {{ quoteToConvert.client_name }}</h4>
            <p>📞 {{ quoteToConvert.client_phone }}</p>
            <p *ngIf="quoteToConvert.client_address?.city">
              📍 {{ quoteToConvert.client_address?.city }}
            </p>
          </div>

          <div class="staff-selection">
            <h4>Choisir le staff qui traitera cette commande:</h4>
            
            <div class="staff-list" *ngIf="staffList.length > 0">
              <div 
                class="staff-option" 
                *ngFor="let staff of staffList"
                [class.selected]="selectedStaffId === staff._id"
                (click)="selectedStaffId = staff._id">
                <div class="staff-info">
                  <span class="staff-name">{{ staff.first_name }} {{ staff.last_name }}</span>
                  <span class="staff-email">{{ staff.email }}</span>
                </div>
                <div class="staff-check" *ngIf="selectedStaffId === staff._id">✓</div>
              </div>
            </div>

            <div class="empty-staff" *ngIf="staffList.length === 0">
              <p>Aucun staff disponible. Veuillez d'abord créer des employés staff.</p>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" (click)="closeStaffModal()">Annuler</button>
          <button 
            class="btn-primary" 
            (click)="confirmStaffSelection()"
            [disabled]="!selectedStaffId">
            🛒 Créer la commande
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .quote-requests-page {
      padding: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 1.5rem;
    }

    .page-header h2 {
      margin: 0 0 0.5rem 0;
      color: #1e293b;
    }

    .subtitle {
      color: #64748b;
      margin: 0;
    }

    /* Stats Cards */
    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      background: white;
      padding: 1rem;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .stat-card.pending { border-left: 4px solid #f59e0b; }
    .stat-card.reviewing { border-left: 4px solid #8b5cf6; }
    .stat-card.quote-sent { border-left: 4px solid #3b82f6; }
    .stat-card.accepted { border-left: 4px solid #22c55e; }
    .stat-card.total { border-left: 4px solid #64748b; }

    .stat-value {
      display: block;
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e293b;
    }

    .stat-label {
      font-size: 0.75rem;
      color: #64748b;
      text-transform: uppercase;
    }

    /* Filters */
    .filters-bar {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .search-input {
      flex: 1;
      min-width: 200px;
      padding: 0.625rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.875rem;
    }

    .filter-select {
      padding: 0.625rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.875rem;
      background: white;
    }

    .btn-filter {
      padding: 0.625rem 1rem;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      cursor: pointer;
      color: #64748b;
    }

    /* Quotes List */
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
      border-left: 4px solid transparent;
    }

    .quote-card.pending { border-left-color: #f59e0b; }
    .quote-card.reviewing { border-left-color: #8b5cf6; }
    .quote-card.quote-sent { border-left-color: #3b82f6; }
    .quote-card.accepted { border-left-color: #22c55e; }
    .quote-card.rejected { border-left-color: #ef4444; }
    .quote-card.converted { border-left-color: #059669; }

    .quote-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .client-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .client-name {
      font-weight: 600;
      color: #1e293b;
      font-size: 1.125rem;
    }

    .client-phone, .quote-date {
      color: #64748b;
      font-size: 0.875rem;
    }

    .client-address {
      color: #64748b;
      font-size: 0.875rem;
      margin-bottom: 1rem;
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

    /* Items Section */
    .items-section {
      background: #f8fafc;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .items-section h4 {
      margin: 0 0 0.75rem 0;
      color: #475569;
      font-size: 0.875rem;
    }

    .items-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .item {
      background: white;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      font-size: 0.875rem;
    }

    .item-name {
      font-weight: 500;
      color: #1e293b;
    }

    .item-qty {
      color: #8b5cf6;
      font-weight: 600;
      margin-left: 0.25rem;
    }

    .item-notes {
      color: #94a3b8;
      margin-left: 0.25rem;
    }

    /* Quote Actions */
    .quote-actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
    }

    .btn-review, .btn-respond, .btn-convert {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-review {
      background: #8b5cf6;
      color: white;
    }

    .btn-review:hover {
      background: #7c3aed;
    }

    .btn-respond {
      background: #3b82f6;
      color: white;
    }

    .btn-respond:hover {
      background: #2563eb;
    }

    .btn-convert {
      background: #22c55e;
      color: white;
    }

    .btn-convert:hover {
      background: #16a34a;
    }

    /* Manager Response */
    .manager-response {
      background: #eff6ff;
      padding: 1rem;
      border-radius: 8px;
      margin-top: 1rem;
    }

    .response-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      color: #475569;
    }

    .response-date {
      color: #94a3b8;
    }

    .response-message {
      color: #64748b;
      font-style: italic;
      margin: 0.5rem 0;
    }

    .quote-total {
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px dashed #bfdbfe;
    }

    .total-label {
      color: #64748b;
    }

    .total-value {
      font-weight: 700;
      color: #1d4ed8;
      font-size: 1.25rem;
      margin-left: 0.5rem;
    }

    .shipping-fee {
      color: #64748b;
      font-size: 0.875rem;
      margin-left: 0.5rem;
    }

    /* Client Response */
    .client-response {
      margin-top: 1rem;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
    }

    .client-response .accepted {
      color: #059669;
      font-weight: 600;
    }

    .client-response .rejected {
      color: #dc2626;
      font-weight: 600;
    }

    .client-response .response-message {
      color: #64748b;
      margin-left: 0.5rem;
    }

    /* Converted Info */
    .converted-info {
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
      padding: 1rem;
      border-radius: 8px;
      margin-top: 1rem;
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

    /* Modal */
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
      padding: 1rem;
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .modal-header h3 {
      margin: 0;
      color: #1e293b;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #64748b;
      cursor: pointer;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .client-info-modal {
      background: #f8fafc;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }

    .client-info-modal h4 {
      margin: 0 0 0.5rem 0;
      color: #1e293b;
    }

    .client-info-modal p {
      margin: 0.25rem 0;
      color: #64748b;
      font-size: 0.875rem;
    }

    .products-selection {
      margin-bottom: 1.5rem;
    }

    .products-selection h4 {
      margin: 0 0 1rem 0;
      color: #475569;
    }

    .search-product {
      position: relative;
      margin-bottom: 1rem;
    }

    .search-product input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }

    .search-results {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #e2e8f0;
      border-top: none;
      border-radius: 0 0 8px 8px;
      max-height: 200px;
      overflow-y: auto;
      z-index: 10;
    }

    .product-option {
      padding: 0.75rem;
      cursor: pointer;
      transition: background 0.2s;
    }

    .product-option:hover {
      background: #f1f5f9;
    }

    .selected-products {
      background: #f8fafc;
      padding: 1rem;
      border-radius: 8px;
    }

    .selected-products h5 {
      margin: 0 0 0.75rem 0;
      color: #475569;
    }

    .selected-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      background: white;
      border-radius: 6px;
      margin-bottom: 0.5rem;
    }

    .selected-item span {
      flex: 1;
    }

    .selected-item input {
      width: 70px;
      padding: 0.25rem;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      text-align: center;
    }

    .selected-item input[type="number"]::-webkit-inner-spin-button,
    .selected-item input[type="number"]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    .item-total {
      font-weight: 600;
      color: #059669;
    }

    .btn-remove {
      background: #fee2e2;
      color: #dc2626;
      border: none;
      width: 28px;
      height: 28px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }

    .quote-form {
      margin-top: 1.5rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #475569;
      font-weight: 500;
    }

    .form-group textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      resize: vertical;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-row input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }

    .calculated-total {
      font-size: 1.5rem;
      font-weight: 700;
      color: #059669;
      padding: 0.75rem;
      background: #f0fdf4;
      border-radius: 8px;
      text-align: center;
    }

    .auto-discount-display {
      padding: 0.75rem;
      background: #dbeafe;
      border-radius: 8px;
      color: #1d4ed8;
      font-weight: 600;
      text-align: center;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid #e2e8f0;
    }

    .btn-secondary {
      padding: 0.75rem 1.5rem;
      background: #f1f5f9;
      color: #64748b;
      border: none;
      border-radius: 8px;
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

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Staff Selection */
    .staff-selection {
      margin-top: 1rem;
    }

    .staff-selection h4 {
      margin: 0 0 1rem 0;
      color: #475569;
    }

    .staff-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .staff-option {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      border: 2px solid transparent;
    }

    .staff-option:hover {
      background: #e2e8f0;
    }

    .staff-option.selected {
      background: #e0e7ff;
      border-color: #8b5cf6;
    }

    .staff-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .staff-name {
      font-weight: 600;
      color: #1e293b;
    }

    .staff-email {
      font-size: 0.875rem;
      color: #64748b;
    }

    .staff-check {
      color: #8b5cf6;
      font-weight: 700;
      font-size: 1.25rem;
    }

    .empty-staff {
      text-align: center;
      padding: 2rem;
      color: #64748b;
      background: #f8fafc;
      border-radius: 8px;
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #64748b;
      background: #f8fafc;
      border-radius: 12px;
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
      margin-bottom: 1rem;
    }
  `]
})
export class ShopQuoteRequestsComponent implements OnInit {
  quotes: QuoteRequest[] = [];
  filteredQuotes: QuoteRequest[] = [];
  stats: QuoteStats | null = null;
  loading = false;
  error: string | null = null;
  shopId: string | null = null;
  currentUserId: string | null = null;
  
  // Filters
  searchQuery = '';
  statusFilter = '';

  // Modal
  showResponseModal = false;
  selectedQuote: QuoteRequest | null = null;
  productSearch = '';
  searchResults: Product[] = [];
  confirmedItems: ManagerResponseItem[] = [];
  responseMessage = '';
  shippingFee = 0;
  discountAmount = 0;  // Manual additional discount
  autoDiscountAmount = 0;  // Auto-calculated from promotions
  discountPercent = 0;
  promotionCode = '';
  calculatedTotal = 0;

  // Staff selection modal
  showStaffModal = false;
  staffList: any[] = [];
  selectedStaffId: string = '';
  quoteToConvert: QuoteRequest | null = null;

  // Delivery zones
  deliveryZones: Array<{ _id: string; name: string; base_fee: number }> = [];

  constructor(
    private http: HttpClient,
    private quoteService: ShopQuoteRequestService,
    private productService: ProductService,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user?.shop_id) {
      this.shopId = user.shop_id;
      this.currentUserId = user.id;
      this.loadQuotes();
    } else {
      this.error = 'Shop ID non trouvé';
    }
  }

  loadQuotes(): void {
    if (!this.shopId) return;
    
    this.loading = true;
    this.quoteService.getShopQuotes(this.shopId).subscribe({
      next: (response) => {
        this.quotes = response.data.quotes;
        this.filteredQuotes = [...this.quotes];
        this.stats = response.data.stats;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des demandes';
        this.loading = false;
        console.error('Error loading quotes:', err);
      }
    });
  }

  applyFilters(): void {
    let result = [...this.quotes];

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(q => 
        q.client_name.toLowerCase().includes(query) ||
        q.client_phone.includes(query)
      );
    }

    if (this.statusFilter) {
      result = result.filter(q => q.status === this.statusFilter);
    }

    this.filteredQuotes = result;
  }

  filterByStatus(status: string): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.statusFilter = '';
    this.filteredQuotes = [...this.quotes];
  }

  // Helper to parse dates from various formats (backend returns objects sometimes)
  private parseDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
    if (typeof value === 'string') {
      const d = new Date(value);
      return isNaN(d.getTime()) ? null : d;
    }
    if (typeof value === 'number') {
      const d = new Date(value);
      return isNaN(d.getTime()) ? null : d;
    }
    if (typeof value === 'object') {
      const anyVal: any = value;
      if (typeof anyVal.$date === 'string' || typeof anyVal.$date === 'number') {
        return this.parseDate(anyVal.$date);
      }
      if (typeof anyVal.toString === 'function') {
        const str = anyVal.toString();
        if (str !== '[object Object]') {
          const d = new Date(str);
          return isNaN(d.getTime()) ? null : d;
        }
      }
    }
    return null;
  }

  // Helper to check if product has active promo
  private hasActivePromo(product: Product): boolean {
    if (!product.current_promo || !product.current_promo.promo_price) return false;
    const start = this.parseDate(product.current_promo.start_date);
    const end = this.parseDate(product.current_promo.end_date);
    if (!start || !end) return false;
    const now = new Date();
    return now >= start && now <= end;
  }

  // Load delivery zones and auto-set shipping fee if client selected a zone
  private loadDeliveryZonesAndSetShippingFee(quote: QuoteRequest): void {
    if (!this.shopId) return;
    
    // Load zones from shop
    this.http.get<{ success: boolean; data: Array<{ _id: string; name: string; base_fee: number }> }>(
      `${environment.apiUrl}/shops/${this.shopId}/delivery-zones`
    ).subscribe({
      next: (res) => {
        this.deliveryZones = res?.data || [];
        
        // If client selected a zone, auto-populate shipping fee
        if (quote.delivery_zone_id) {
          const selectedZone = this.deliveryZones.find(z => z._id === quote.delivery_zone_id);
          if (selectedZone && selectedZone.base_fee !== undefined) {
            this.shippingFee = selectedZone.base_fee;
            console.log('DEBUG: Auto-set shipping fee from zone:', selectedZone.name, selectedZone.base_fee);
            this.updateTotals();
          }
        }
      },
      error: () => {
        this.deliveryZones = [];
      }
    });
  }

  getStatusLabel(status: string): string {
    return this.quoteService.getStatusLabel(status);
  }

  getStatusClass(status: string): string {
    return this.quoteService.getStatusClass(status);
  }

  startReview(quoteId: string): void {
    this.quoteService.startReview(quoteId).subscribe({
      next: () => {
        this.loadQuotes();
      },
      error: (err) => {
        console.error('Error starting review:', err);
        alert('Erreur lors de la prise en charge');
      }
    });
  }

  openResponseModal(quote: QuoteRequest): void {
    this.selectedQuote = quote;
    this.showResponseModal = true;
    
    // Pre-fill with the client's requested items - manager just needs to add prices
    this.confirmedItems = quote.requested_items.map(item => ({
      product_id: item.product_id || '',
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: 0,  // Will be set from product price or promo price
      original_price: 0, // Track original price for discount calculation
      total: 0
    }));
    
    // Load delivery zones and auto-populate shipping fee if client selected one
    this.loadDeliveryZonesAndSetShippingFee(quote);
    
    // Try to load prices from shop products (with auto-promo detection)
    if (this.shopId) {
      this.productService.getProductsByShop(this.shopId, { limit: 100 }).subscribe({
        next: (response: { data: { products: Product[] } }) => {
          const products = response.data.products;
          console.log('DEBUG: Loaded products:', products.length);
          console.log('DEBUG: First product:', products[0]);
          console.log('DEBUG: Confirmed items:', this.confirmedItems);
          
          let totalAutoDiscount = 0;
          
          // Match requested items with shop products to auto-fill prices
          this.confirmedItems.forEach(item => {
            const matchingProduct = products.find(p => 
              p._id === item.product_id || 
              p.name.toLowerCase() === item.product_name.toLowerCase()
            );
            console.log('DEBUG: Matching for', item.product_name, ':', matchingProduct);
            
            if (matchingProduct) {
              item.product_id = matchingProduct._id!;
              
              // Check for active promotion
              const now = new Date();
              console.log('DEBUG: Product current_promo:', matchingProduct.current_promo);
              console.log('DEBUG: Now:', now);
              
              const hasActivePromo = this.hasActivePromo(matchingProduct);
              
              console.log('DEBUG: Has active promo:', hasActivePromo);
              
              if (hasActivePromo) {
                // Use promotional price
                item.original_price = matchingProduct.unit_price;
                item.unit_price = matchingProduct.current_promo!.promo_price!;
                // Calculate auto-discount for this item
                const discountPerItem = item.original_price - item.unit_price;
                totalAutoDiscount += discountPerItem * item.quantity;
                console.log('DEBUG: Added discount:', discountPerItem, 'Total now:', totalAutoDiscount);
              } else {
                // Use regular price
                item.original_price = matchingProduct.unit_price;
                item.unit_price = matchingProduct.unit_price;
              }
              
              item.total = item.quantity * item.unit_price;
            } else {
              console.log('DEBUG: No matching product found for:', item.product_name);
            }
          });
          
          // Auto-fill the discount amount from promotions
          this.autoDiscountAmount = totalAutoDiscount;
          console.log('DEBUG: Final autoDiscountAmount:', this.autoDiscountAmount);
          
          this.updateTotals();
        },
        error: (err) => {
          console.error('DEBUG: Error loading products:', err);
          this.updateTotals();
        }
      });
    }
    
    this.updateTotals();
  }

  closeResponseModal(): void {
    this.showResponseModal = false;
    this.selectedQuote = null;
    this.confirmedItems = [];
    this.responseMessage = '';
    this.shippingFee = 0;
    this.discountAmount = 0;
    this.autoDiscountAmount = 0;
    this.discountPercent = 0;
    this.promotionCode = '';
    this.productSearch = '';
    this.searchResults = [];
  }

  searchProducts(): void {
    if (!this.productSearch || !this.shopId) {
      this.searchResults = [];
      return;
    }

    this.productService.getProductsByShop(this.shopId, {
      search: this.productSearch,
      limit: 5
    }).subscribe({
      next: (response: { data: { products: Product[] } }) => {
        this.searchResults = response.data.products.slice(0, 5);
      },
      error: (err: Error) => {
        console.error('Error searching products:', err);
      }
    });
  }

  addProductToQuote(product: Product): void {
    const existing = this.confirmedItems.find(i => i.product_id === product._id);
    if (existing) {
      existing.quantity++;
      existing.total = existing.quantity * existing.unit_price;
      this.updateTotals();
    } else {
      // Check for active promotion using helper
      const hasActivePromo = this.hasActivePromo(product);
      
      let unitPrice = product.unit_price;
      let originalPrice = product.unit_price;
      
      if (hasActivePromo) {
        unitPrice = product.current_promo!.promo_price!;
        // Add the discount to auto-calculated discount (not manual)
        this.autoDiscountAmount += (originalPrice - unitPrice);
      }
      
      this.confirmedItems.push({
        product_id: product._id!,
        product_name: product.name,
        quantity: 1,
        unit_price: unitPrice,
        original_price: originalPrice,
        total: unitPrice
      });
      this.updateTotals();
    }
    this.productSearch = '';
    this.searchResults = [];
  }

  removeItem(index: number): void {
    this.confirmedItems.splice(index, 1);
    this.updateTotals();
  }

  updateTotals(): void {
    this.confirmedItems.forEach(item => {
      item.total = item.quantity * item.unit_price;
    });
    const itemsTotal = this.confirmedItems.reduce((sum, item) => sum + item.total, 0);
    
    // Calculate discount: auto (promotions) + manual + percent
    let discount = this.autoDiscountAmount || 0;
    discount += this.discountAmount || 0;
    if (this.discountPercent > 0) {
      discount += (itemsTotal * this.discountPercent / 100);
    }
    
    // Total = items + shipping - discount
    this.calculatedTotal = itemsTotal + (this.shippingFee || 0) - discount;
    if (this.calculatedTotal < 0) this.calculatedTotal = 0;
  }

  submitResponse(): void {
    if (!this.selectedQuote || this.confirmedItems.length === 0) return;

    this.quoteService.managerRespond(this.selectedQuote._id, {
      message: this.responseMessage || 'Voici votre devis personnalisé',
      calculated_total: this.calculatedTotal,
      items_confirmed: this.confirmedItems,
      shipping_fee: this.shippingFee,
      discount_amount: (this.autoDiscountAmount || 0) + (this.discountAmount || 0),
      discount_percent: this.discountPercent,
      promotion_code: this.promotionCode
    }).subscribe({
      next: () => {
        // Refresh notifications after responding to quote
        this.notificationService.refreshNotifications();
        this.closeResponseModal();
        this.loadQuotes();
      },
      error: (err) => {
        console.error('Error submitting response:', err);
        alert('Erreur lors de l\'envoi du devis');
      }
    });
  }

  convertToOrder(quote: QuoteRequest): void {
    // Open staff selection modal first
    this.quoteToConvert = quote;
    this.selectedStaffId = '';
    this.loadStaffList();
    this.showStaffModal = true;
  }

  loadStaffList(): void {
    if (!this.shopId) return;
    
    this.employeeService.getEmployeesByShop(this.shopId, { 
      active: true,
      limit: 100 
    }).subscribe({
      next: (response) => {
        // Filter to only STAFF members (not managers)
        this.staffList = response.data.employees.filter(e => e.role === 'STAFF');
      },
      error: (err) => {
        console.error('Error loading staff:', err);
        alert('Erreur lors du chargement des employés');
      }
    });
  }

  closeStaffModal(): void {
    this.showStaffModal = false;
    this.quoteToConvert = null;
    this.selectedStaffId = '';
    this.staffList = [];
  }

  confirmStaffSelection(): void {
    if (!this.quoteToConvert) return;
    
    // Call API to convert quote to order automatically
    this.quoteService.convertToOrder(
      this.quoteToConvert._id,
      this.selectedStaffId || undefined
    ).subscribe({
      next: (response) => {
        // Refresh notifications after converting quote to order
        this.notificationService.refreshNotifications();
        this.closeStaffModal();
        this.loadQuotes(); // Refresh the list
        // Optionally navigate to the created order
        if (response.data.order?._id) {
          this.router.navigate(['/shop/orders', response.data.order._id]);
        }
      },
      error: (err) => {
        console.error('Error converting to order:', err);
        alert('Erreur lors de la création de la commande');
      }
    });
  }

  viewOrder(orderId: string): void {
    this.router.navigate(['/shop/orders', orderId]);
  }
}
