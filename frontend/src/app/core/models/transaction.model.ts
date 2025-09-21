export interface Transaction {
  id: string;
  transactionId: string; // TRX1212897bkasnnk0
  transactionNumber: string; // U0001, P0001
  clientName: string;
  clientType: 'U' | 'P'; // U = registered, P = guest
  vehicleType: 'car' | 'motorcycle' | 'truck';
  plateNumber: string;
  serviceType: string;
  amount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  date: Date;
  cashierId: string;
  cashierName: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransactionRequest {
  clientName: string;
  clientType: 'U' | 'P';
  vehicleType: 'car' | 'motorcycle' | 'truck';
  plateNumber: string;
  serviceType: string;
  amount: number;
  cashierId: string;
  cashierName: string;
  notes?: string;
}

export interface UpdateTransactionRequest {
  clientName?: string;
  vehicleType?: 'car' | 'motorcycle' | 'truck';
  plateNumber?: string;
  serviceType?: string;
  amount?: number;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
}

export interface TransactionSearchParams {
  search?: string; // search by transaction number, plate number, or client name
  status?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  clientType?: 'U' | 'P';
  page?: number;
  size?: number;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  totalCount: number;
  page: number;
  size: number;
  totalPages: number;
}
