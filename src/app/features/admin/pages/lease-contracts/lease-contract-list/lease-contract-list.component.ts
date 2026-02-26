import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LeaseContractService } from '../../../services/lease-contract.service';
import { ShopService } from '../../../services/shop.service';
import { LeaseContract } from '../../../../../shared/models/lease-contract.model';

@Component({
  selector: 'app-lease-contract-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lease-contract-list.component.html',
  styleUrls: ['./lease-contract-list.component.css']
})
export class LeaseContractListComponent implements OnInit {
  contracts: LeaseContract[] = [];
  filteredContracts: LeaseContract[] = [];
  paginatedContracts: LeaseContract[] = [];
  shops: any[] = [];
  loading = false;
  error: string | null = null;

  // Filters
  searchTerm = '';
  filterStatus = '';
  filterPaymentFrequency = '';
  filterShopId = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;

  constructor(
    private leaseContractService: LeaseContractService,
    private shopService: ShopService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadContracts();
    this.loadShops();
  }

  loadContracts(): void {
    this.loading = true;
    this.error = null;

    this.leaseContractService.getAllLeaseContracts().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.contracts = response.data;
          this.applyFilters();
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load lease contracts';
        this.loading = false;
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

  applyFilters(): void {
    let filtered = [...this.contracts];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(contract =>
        contract.shop_name?.toLowerCase().includes(term) ||
        contract.special_conditions?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (this.filterStatus) {
      filtered = filtered.filter(contract =>
        contract.current_status?.status === this.filterStatus
      );
    }

    // Payment frequency filter
    if (this.filterPaymentFrequency) {
      filtered = filtered.filter(contract =>
        contract.payment_frequency === this.filterPaymentFrequency
      );
    }

    // Shop filter
    if (this.filterShopId) {
      filtered = filtered.filter(contract =>
        contract.shop_id === this.filterShopId
      );
    }

    this.filteredContracts = filtered;
    this.totalPages = Math.ceil(this.filteredContracts.length / this.pageSize);
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedContracts = this.filteredContracts.slice(start, end);
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
    this.router.navigate(['/admin/lease-contracts/add']);
  }

  viewContract(contract: LeaseContract): void {
    this.router.navigate(['/admin/lease-contracts', contract._id]);
  }

  editContract(contract: LeaseContract): void {
    this.router.navigate(['/admin/lease-contracts', contract._id, 'edit']);
  }

  deleteContract(contract: LeaseContract): void {
    if (!contract._id) return;

    const confirmed = confirm(
      `Are you sure you want to delete the lease contract for ${contract.shop_name}?`
    );

    if (confirmed) {
      this.leaseContractService.deleteLeaseContract(contract._id).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Lease contract deleted successfully');
            this.loadContracts();
          }
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to delete lease contract');
        }
      });
    }
  }

  updateStatus(contract: LeaseContract, newStatus: string): void {
    if (!contract._id) return;

    const reason = prompt('Reason for status change (optional):');

    this.leaseContractService.updateContractStatus(contract._id, newStatus, reason || '').subscribe({
      next: (response) => {
        if (response.success) {
          alert('Contract status updated successfully');
          this.loadContracts();
        }
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to update contract status');
      }
    });
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'active': 'status-active',
      'expired': 'status-expired',
      'terminated': 'status-terminated',
      'signed': 'status-signed'
    };
    return statusClasses[status] || 'status-default';
  }

  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'active': 'Active',
      'expired': 'Expired',
      'terminated': 'Terminated',
      'signed': 'Signed'
    };
    return statusLabels[status] || status;
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  formatCurrency(amount: number | undefined): string {
    if (!amount) return '0 €';
    return `${amount.toFixed(2)} €`;
  }

  isExpiringSoon(contract: LeaseContract): boolean {
    if (!contract.end_date) return false;
    const endDate = new Date(contract.end_date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }
}
