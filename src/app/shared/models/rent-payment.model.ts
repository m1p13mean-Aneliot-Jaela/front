export interface RentPayment {
  _id?: string;
  contract_id: string;
  shop_id?: string;
  amount: number;
  due_date: Date | string;
  method: 'CARD' | 'PAYPAL' | 'MOBILE_MONEY' | 'BANK' | 'CASH';
  transaction_reference?: string;
  gateway_information?: any;
  current_status?: {
    status: 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'REFUNDED';
    reason?: string;
    updated_at?: Date;
  };
  status_history?: Array<{
    status: 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'REFUNDED';
    reason?: string;
    updated_at?: Date;
  }>;
  created_at?: Date;
  updated_at?: Date;
  contract?: any; // populated contract data
  shop?: any; // populated shop data
}

export interface RentPaymentResponse {
  success: boolean;
  message?: string;
  data?: RentPayment | RentPayment[];
  count?: number;
}

export interface RentPaymentFilters {
  status?: string;
  contract_id?: string;
  shop_id?: string;
  method?: string;
  due_date_from?: string;
  due_date_to?: string;
}

export interface RentPaymentStatistics {
  total: number;
  pending: number;
  successful: number;
  failed: number;
  refunded: number;
  overdue: number;
  amounts: {
    pending: number;
    successful: number;
    failed: number;
    refunded: number;
  };
}
