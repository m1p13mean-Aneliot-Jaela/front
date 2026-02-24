import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RentPaymentService } from '../../../services/rent-payment.service';
import { LeaseContractService } from '../../../services/lease-contract.service';
import { ShopService } from '../../../services/shop.service';
import { RentPayment } from '../../../../../shared/models/rent-payment.model';

@Component({
  selector: 'app-rent-payment-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rent-payment-form.component.html',
  styleUrls: ['./rent-payment-form.component.css']
})
export class RentPaymentFormComponent implements OnInit {
  payment: Partial<RentPayment> = {
    contract_id: '',
    shop_id: '',
    amount: 0,
    due_date: '',
    method: 'CARD',
    transaction_reference: '',
    gateway_information: {},
    current_status: {
      status: 'PENDING'
    }
  };

  statusReason: string = ''; // For status change reason
  contracts: any[] = [];
  shops: any[] = [];
  isEditMode = false;
  paymentId: string | null = null;
  loading = false;
  error: string | null = null;
  submitting = false;

  paymentMethods = ['CARD', 'PAYPAL', 'MOBILE_MONEY', 'BANK', 'CASH'];
  paymentStatuses = ['PENDING', 'SUCCESSFUL', 'FAILED', 'REFUNDED'];

  constructor(
    private rentPaymentService: RentPaymentService,
    private leaseContractService: LeaseContractService,
    private shopService: ShopService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadContracts();
    this.loadShops();
    
    this.paymentId = this.route.snapshot.paramMap.get('id');
    if (this.paymentId) {
      this.isEditMode = true;
      this.loadPayment(this.paymentId);
    }
  }

  loadContracts(): void {
    this.leaseContractService.getAllLeaseContracts().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          // Only show active contracts
          this.contracts = response.data.filter((c: any) => 
            c.current_status?.status === 'active' || c.current_status?.status === 'signed'
          );
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

  loadPayment(id: string): void {
    this.loading = true;
    this.error = null;

    this.rentPaymentService.getRentPaymentById(id).subscribe({
      next: (response) => {
        if (response.success && response.data && !Array.isArray(response.data)) {
          const data: any = response.data;
          
          // Convert contract_id to string
          let contractId: string = '';
          if (data.contract_id) {
            if (typeof data.contract_id === 'string') {
              contractId = data.contract_id;
            } else if (typeof data.contract_id === 'object') {
              contractId = data.contract_id._id || data.contract_id.toString();
            }
          }

          // Convert shop_id to string
          let shopId: string = '';
          if (data.shop_id) {
            if (typeof data.shop_id === 'string') {
              shopId = data.shop_id;
            } else if (typeof data.shop_id === 'object') {
              shopId = data.shop_id._id || data.shop_id.toString();
            }
          }
          
          this.payment = {
            contract_id: contractId,
            shop_id: shopId,
            amount: data.amount,
            due_date: this.formatDateForInput(data.due_date),
            method: data.method,
            transaction_reference: data.transaction_reference || '',
            gateway_information: data.gateway_information || {},
            current_status: data.current_status || { status: 'PENDING' }
          };
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load rent payment';
        this.loading = false;
      }
    });
  }

  onContractChange(): void {
    // Auto-populate shop and amount from selected contract
    const selectedContract = this.contracts.find(c => c._id === this.payment.contract_id);
    if (selectedContract) {
      // Convert shop_id to string if it's an object
      if (typeof selectedContract.shop_id === 'string') {
        this.payment.shop_id = selectedContract.shop_id;
      } else if (selectedContract.shop_id && typeof selectedContract.shop_id === 'object') {
        this.payment.shop_id = (selectedContract.shop_id as any)._id || selectedContract.shop_id.toString();
      }
      this.payment.amount = selectedContract.rent_amount;
    }
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

    const paymentData = {
      contract_id: this.payment.contract_id,
      shop_id: this.payment.shop_id,
      amount: this.payment.amount,
      due_date: this.payment.due_date,
      method: this.payment.method,
      transaction_reference: this.payment.transaction_reference,
      gateway_information: this.payment.gateway_information,
      status: this.payment.current_status?.status || 'PENDING',
      reason: this.statusReason || ''
    };

    const request = this.isEditMode && this.paymentId
      ? this.rentPaymentService.updateRentPayment(this.paymentId, paymentData)
      : this.rentPaymentService.createRentPayment(paymentData);

    request.subscribe({
      next: (response) => {
        if (response.success) {
          alert(this.isEditMode ? 'Rent payment updated successfully' : 'Rent payment created successfully');
          this.router.navigate(['/admin/rent-payments']);
        }
        this.submitting = false;
      },
      error: (err) => {
        this.error = err.error?.message || `Failed to ${this.isEditMode ? 'update' : 'create'} rent payment`;
        this.submitting = false;
      }
    });
  }

  validateForm(): boolean {
    if (!this.payment.contract_id) {
      this.error = 'Please select a contract';
      return false;
    }

    if (!this.payment.amount || this.payment.amount <= 0) {
      this.error = 'Please enter a valid amount';
      return false;
    }

    if (!this.payment.due_date) {
      this.error = 'Please select a due date';
      return false;
    }

    if (!this.payment.method) {
      this.error = 'Please select a payment method';
      return false;
    }

    return true;
  }

  onCancel(): void {
    this.router.navigate(['/admin/rent-payments']);
  }

  getContractLabel(contract: any): string {
    return `${contract.shop_name} - ${contract.rent_amount} (${contract.payment_frequency})`;
  }

  getSelectedShopName(): string {
    if (!this.payment.shop_id) return 'No shop selected';
    const shop = this.shops.find(s => s._id === this.payment.shop_id);
    return shop ? shop.shop_name : 'Shop not found';
  }
}
