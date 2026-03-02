import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RentPaymentService } from '../../../services/rent-payment.service';
import { LeaseContractService } from '../../../services/lease-contract.service';
import { ShopService } from '../../../services/shop.service';
import { RentPayment } from '../../../../../shared/models/rent-payment.model';

@Component({
  selector: 'app-rent-payment-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rent-payment-list.component.html',
  styleUrls: ['./rent-payment-list.component.css']
})
export class RentPaymentListComponent implements OnInit {
  payments: RentPayment[] = [];
  filteredPayments: RentPayment[] = [];
  paginatedPayments: RentPayment[] = [];
  contracts: any[] = [];
  shops: any[] = [];
  loading = false;
  error: string | null = null;

  // Statistics
  statistics: any = null;

  // Filters
  searchTerm = '';
  filterStatus = '';
  filterMethod = '';
  filterContractId = '';
  filterShopId = '';
  filterDateFrom = '';
  filterDateTo = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;

  constructor(
    private rentPaymentService: RentPaymentService,
    private leaseContractService: LeaseContractService,
    private shopService: ShopService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPayments();
    this.loadContracts();
    this.loadShops();
    this.loadStatistics();
  }

  loadPayments(): void {
    this.loading = true;
    this.error = null;

    this.rentPaymentService.getAllRentPayments().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.payments = response.data;
          this.applyFilters();
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load rent payments';
        this.loading = false;
      }
    });
  }

  loadContracts(): void {
    this.leaseContractService.getAllLeaseContracts().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.contracts = response.data;
        }
      },
      error: (err) => {
        console.error('Failed to load contracts:', err);
      }
    });
  }

  loadShops(): void {
    this.shopService.getAllShops().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.shops = response.data;
        }
      },
      error: (err) => {
        console.error('Failed to load shops:', err);
      }
    });
  }

  loadStatistics(): void {
    this.rentPaymentService.getPaymentStatistics().subscribe({
      next: (response) => {
        if (response.success) {
          this.statistics = response.data;
        }
      },
      error: (err) => {
        console.error('Failed to load statistics:', err);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.payments];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(payment =>
        payment.transaction_reference?.toLowerCase().includes(term) ||
        payment.shop?.shop_name?.toLowerCase().includes(term) ||
        payment.contract?.shop_name?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (this.filterStatus) {
      filtered = filtered.filter(payment =>
        payment.current_status?.status === this.filterStatus
      );
    }

    // Method filter
    if (this.filterMethod) {
      filtered = filtered.filter(payment =>
        payment.method === this.filterMethod
      );
    }

    // Contract filter
    if (this.filterContractId) {
      filtered = filtered.filter(payment =>
        payment.contract_id === this.filterContractId
      );
    }

    // Shop filter
    if (this.filterShopId) {
      filtered = filtered.filter(payment =>
        payment.shop_id === this.filterShopId
      );
    }

    // Date range filter
    if (this.filterDateFrom) {
      const fromDate = new Date(this.filterDateFrom);
      filtered = filtered.filter(payment =>
        new Date(payment.due_date) >= fromDate
      );
    }
    if (this.filterDateTo) {
      const toDate = new Date(this.filterDateTo);
      filtered = filtered.filter(payment =>
        new Date(payment.due_date) <= toDate
      );
    }

    this.filteredPayments = filtered;
    this.totalPages = Math.ceil(this.filteredPayments.length / this.pageSize);
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedPayments = this.filteredPayments.slice(start, end);
  }

  onSearch(): void {
    this.applyFilters();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  navigateToAdd(): void {
    this.router.navigate(['/admin/rent-payments/add']);
  }

  viewPayment(payment: RentPayment): void {
    this.router.navigate(['/admin/rent-payments', payment._id]);
  }

  editPayment(payment: RentPayment): void {
    this.router.navigate(['/admin/rent-payments', payment._id, 'edit']);
  }

  deletePayment(payment: RentPayment): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce paiement? Seuls les paiements en attente peuvent être supprimés.')) {
      return;
    }

    this.rentPaymentService.deleteRentPayment(payment._id!).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Paiement supprimé avec succès');
          this.loadPayments();
          this.loadStatistics();
        }
      },
      error: (err) => {
        alert(err.error?.message || 'Échec de la suppression du paiement');
      }
    });
  }

  updateStatus(payment: RentPayment, newStatus: string): void {
    const reason = prompt(`Enter reason for changing status to ${newStatus}:`);
    if (reason === null) return;

    this.rentPaymentService.updatePaymentStatus(payment._id!, newStatus, reason).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Statut du paiement mis à jour avec succès');
          this.loadPayments();
          this.loadStatistics();
        }
      },
      error: (err) => {
        alert(err.error?.message || 'Échec de la mise à jour du statut du paiement');
      }
    });
  }

  formatDate(date: any): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  formatCurrency(amount: number): string {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'MGA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'status-badge status-pending',
      'SUCCESSFUL': 'status-badge status-successful',
      'FAILED': 'status-badge status-failed',
      'REFUNDED': 'status-badge status-refunded'
    };
    return statusMap[status] || 'status-badge';
  }

  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'PENDING': 'En Attente',
      'SUCCESSFUL': 'Réussi',
      'FAILED': 'Échoué',
      'REFUNDED': 'Remboursé'
    };
    return statusLabels[status] || status;
  }

  getMethodBadgeClass(method: string): string {
    const methodMap: { [key: string]: string } = {
      'CARD': 'method-badge method-card',
      'PAYPAL': 'method-badge method-paypal',
      'MOBILE_MONEY': 'method-badge method-mobile',
      'BANK': 'method-badge method-bank',
      'CASH': 'method-badge method-cash'
    };
    return methodMap[method] || 'method-badge';
  }

  isOverdue(payment: RentPayment): boolean {
    if (payment.current_status?.status !== 'PENDING') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(payment.due_date) < today;
  }
}
