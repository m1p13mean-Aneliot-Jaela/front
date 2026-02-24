export interface LeaseContract {
  _id?: string;
  shop_id: string;
  shop_name?: string;
  start_date: Date | string;
  end_date: Date | string;
  rent_amount: number;
  payment_frequency: 'monthly' | 'quarterly';
  special_conditions?: string;
  current_status?: {
    status: 'active' | 'expired' | 'terminated' | 'signed';
    reason?: string;
    updated_at?: Date;
  };
  status_history?: Array<{
    status: 'active' | 'expired' | 'terminated' | 'signed';
    reason?: string;
    updated_at?: Date;
  }>;
  update_history?: Array<{
    start_date?: Date;
    end_date?: Date;
    rent_amount?: number;
    payment_frequency?: 'monthly' | 'quarterly';
    special_conditions?: string;
    updated_at?: Date;
  }>;
  created_at?: Date;
  updated_at?: Date;
  shop?: any; // populated shop data
}

export interface LeaseContractResponse {
  success: boolean;
  message?: string;
  data?: LeaseContract | LeaseContract[];
  count?: number;
}

export interface LeaseContractFilters {
  status?: string;
  shop_id?: string;
  payment_frequency?: string;
  start_date_from?: string;
  end_date_to?: string;
}
