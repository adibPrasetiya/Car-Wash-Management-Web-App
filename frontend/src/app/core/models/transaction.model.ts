export interface Transaction {
  id: string;
  transactionId: string; // TRX1212897bkasnnk0
  transactionNumber: string; // U0001, P0001
  clientId?: number; // For registered clients
  clientName: string;
  clientType: 'U' | 'P'; // U = registered, P = guest
  vehicleId?: string; // Selected vehicle ID for registered clients
  vehicleType: 'car' | 'motorcycle' | 'truck';
  plateNumber?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  serviceType: string;
  amount: number; // This will map to totalAmount in backend
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  date: Date;
  cashierId: string;
  cashierName: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransactionRequest {
  clientId?: number; // For registered clients
  clientName: string;
  clientType: 'U' | 'P';
  vehicleId?: string; // Selected vehicle ID for registered clients
  vehicleType: 'car' | 'motorcycle' | 'truck';
  plateNumber?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  serviceType: string;
  amount: number; // Maps to totalAmount in backend
  cashierId: string;
  cashierName: string;
  notes?: string;
}

export interface UpdateTransactionRequest {
  clientId?: number;
  clientName?: string;
  vehicleId?: string;
  vehicleType?: 'car' | 'motorcycle' | 'truck';
  plateNumber?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  serviceType?: string;
  amount?: number; // Maps to totalAmount in backend
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
}

export interface TransactionSearchParams {
  search?: string; // search by transaction number, plate number, or client name
  status?: string;
  startDate?: string; // ISO date string for backend
  endDate?: string; // ISO date string for backend
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
