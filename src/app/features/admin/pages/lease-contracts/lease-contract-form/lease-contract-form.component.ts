import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LeaseContractService } from '../../../services/lease-contract.service';
import { ShopService } from '../../../services/shop.service';
import { LeaseContract } from '../../../../../shared/models/lease-contract.model';

@Component({
  selector: 'app-lease-contract-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lease-contract-form.component.html',
  styleUrls: ['./lease-contract-form.component.css']
})
export class LeaseContractFormComponent implements OnInit {
  contract: Partial<LeaseContract> = {
    shop_id: '',
    start_date: '',
    end_date: '',
    rent_amount: 0,
    payment_frequency: 'monthly',
    special_conditions: '',
    current_status: {
      status: 'signed'
    }
  };

  statusReason: string = ''; // For status change reason
  shops: any[] = [];
  isEditMode = false;
  contractId: string | null = null;
  loading = false;
  error: string | null = null;
  submitting = false;

  constructor(
    private leaseContractService: LeaseContractService,
    private shopService: ShopService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadShops();
    
    this.contractId = this.route.snapshot.paramMap.get('id');
    if (this.contractId) {
      this.isEditMode = true;
      this.loadContract(this.contractId);
    }
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

  loadContract(id: string): void {
    this.loading = true;
    this.error = null;

    this.leaseContractService.getLeaseContractById(id).subscribe({
      next: (response) => {
        if (response.success && response.data && !Array.isArray(response.data)) {
          const data: any = response.data;
          // Convert shop_id to string - it may come as ObjectId or populated shop object
          let shopId: string = '';
          if (data.shop_id) {
            if (typeof data.shop_id === 'string') {
              shopId = data.shop_id;
            } else if (typeof data.shop_id === 'object') {
              shopId = data.shop_id._id || data.shop_id.toString();
            }
          }
          
          this.contract = {
            shop_id: shopId,
            start_date: this.formatDateForInput(data.start_date),
            end_date: this.formatDateForInput(data.end_date),
            rent_amount: data.rent_amount,
            payment_frequency: data.payment_frequency,
            special_conditions: data.special_conditions || '',
            current_status: data.current_status || { status: 'signed' }
          };
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load lease contract';
        this.loading = false;
      }
    });
  }

  formatDateForInput(date: Date | string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.submitting = true;
    this.error = null;

    const contractData = {
      shop_id: this.contract.shop_id,
      start_date: this.contract.start_date,
      end_date: this.contract.end_date,
      rent_amount: this.contract.rent_amount,
      payment_frequency: this.contract.payment_frequency,
      special_conditions: this.contract.special_conditions,
      status: this.contract.current_status?.status || 'signed',
      status_reason: this.statusReason || ''
    };

    const request = this.isEditMode && this.contractId
      ? this.leaseContractService.updateLeaseContract(this.contractId, contractData)
      : this.leaseContractService.createLeaseContract(contractData);

    request.subscribe({
      next: (response) => {
        if (response.success) {
          alert(this.isEditMode ? 'Lease contract updated successfully' : 'Lease contract created successfully');
          this.router.navigate(['/admin/lease-contracts']);
        }
        this.submitting = false;
      },
      error: (err) => {
        this.error = err.error?.message || `Failed to ${this.isEditMode ? 'update' : 'create'} lease contract`;
        this.submitting = false;
      }
    });
  }

  validateForm(): boolean {
    if (!this.contract.shop_id) {
      this.error = 'Please select a shop';
      return false;
    }

    if (!this.contract.start_date) {
      this.error = 'Please enter start date';
      return false;
    }

    if (!this.contract.end_date) {
      this.error = 'Please enter end date';
      return false;
    }

    const startDate = new Date(this.contract.start_date);
    const endDate = new Date(this.contract.end_date);

    if (startDate >= endDate) {
      this.error = 'End date must be after start date';
      return false;
    }

    if (!this.contract.rent_amount || this.contract.rent_amount <= 0) {
      this.error = 'Please enter a valid rent amount';
      return false;
    }

    if (!this.contract.payment_frequency) {
      this.error = 'Please select payment frequency';
      return false;
    }

    return true;
  }

  cancel(): void {
    this.router.navigate(['/admin/lease-contracts']);
  }
}
