import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionSearchParams,
  TransactionListResponse
} from '../models/transaction.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = `${environment.api.baseUrl}/cashiers`;

  constructor(private http: HttpClient) { }

  // Mock data for fallback during development
  private mockTransactions: Transaction[] = [
    {
      id: '1',
      transactionId: 'TRX1212897bkasnnk0',
      transactionNumber: 'U0001',
      clientId: 1,
      clientName: 'John Doe',
      clientType: 'U',
      vehicleId: 'vehicle1',
      vehicleType: 'car',
      plateNumber: 'B1234ABC',
      vehicleBrand: 'Toyota',
      vehicleModel: 'Camry',
      serviceType: 'Cuci mobil sedan reguler',
      amount: 50000,
      status: 'completed',
      date: new Date('2024-01-15'),
      cashierId: 'cashier1',
      cashierName: 'Ahmad Rizki',
      notes: 'Pelanggan tetap',
      createdAt: new Date('2024-01-15T08:00:00'),
      updatedAt: new Date('2024-01-15T09:30:00')
    },
    {
      id: '2',
      transactionId: 'TRX9876543mnbvcxz1',
      transactionNumber: 'U0002',
      clientId: 2,
      clientName: 'Jane Smith',
      clientType: 'U',
      vehicleId: 'vehicle2',
      vehicleType: 'car',
      plateNumber: 'B5678DEF',
      vehicleBrand: 'Honda',
      vehicleModel: 'CR-V',
      serviceType: 'Cuci mobil SUV premium + wax',
      amount: 120000,
      status: 'completed',
      date: new Date('2024-01-16'),
      cashierId: 'cashier1',
      cashierName: 'Ahmad Rizki',
      createdAt: new Date('2024-01-16T10:15:00'),
      updatedAt: new Date('2024-01-16T12:00:00')
    },
    {
      id: '3',
      transactionId: 'TRX5555444qwerty33',
      transactionNumber: 'P0001',
      clientName: 'Ahmad Rahman',
      clientType: 'P',
      vehicleType: 'motorcycle',
      plateNumber: 'B9012GHI',
      vehicleBrand: 'Yamaha',
      vehicleModel: 'Vixion',
      serviceType: 'Cuci motor + detailing',
      amount: 35000,
      status: 'in_progress',
      date: new Date('2024-01-17'),
      cashierId: 'cashier1',
      cashierName: 'Ahmad Rizki',
      createdAt: new Date('2024-01-17T14:30:00'),
      updatedAt: new Date('2024-01-17T14:30:00')
    },
    {
      id: '4',
      transactionId: 'TRX7777888poiuyt56',
      transactionNumber: 'U0003',
      clientId: 2,
      clientName: 'Maria Garcia',
      clientType: 'U',
      vehicleId: 'vehicle3',
      vehicleType: 'car',
      plateNumber: 'B3456JKL',
      vehicleBrand: 'Mazda',
      vehicleModel: 'CX-5',
      serviceType: 'Cuci mobil hatchback + poles',
      amount: 80000,
      status: 'completed',
      date: new Date('2024-01-18'),
      cashierId: 'cashier1',
      cashierName: 'Ahmad Rizki',
      createdAt: new Date('2024-01-18T09:45:00'),
      updatedAt: new Date('2024-01-18T11:15:00')
    },
    {
      id: '5',
      transactionId: 'TRX3333222asdfgh78',
      transactionNumber: 'P0002',
      clientName: 'Robert Johnson',
      clientType: 'P',
      vehicleType: 'truck',
      plateNumber: 'B7890MNO',
      vehicleBrand: 'Isuzu',
      vehicleModel: 'D-Max',
      serviceType: 'Cuci pickup truck reguler',
      amount: 60000,
      status: 'pending',
      date: new Date(),
      cashierId: 'cashier1',
      cashierName: 'Ahmad Rizki',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '6',
      transactionId: 'TRX9999111zxcvbn90',
      transactionNumber: 'U0004',
      clientId: 1,
      clientName: 'Siti Nurhaliza',
      clientType: 'U',
      vehicleId: 'vehicle4',
      vehicleType: 'car',
      plateNumber: 'B1357PQR',
      vehicleBrand: 'BMW',
      vehicleModel: '320i',
      serviceType: 'Cuci mobil sedan premium',
      amount: 75000,
      status: 'pending',
      date: new Date(),
      cashierId: 'cashier1',
      cashierName: 'Ahmad Rizki',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Get transactions with search and pagination
  getTransactions(cashierId: string, params?: TransactionSearchParams): Observable<TransactionListResponse> {
    let httpParams = new HttpParams();

    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.clientType) httpParams = httpParams.set('clientType', params.clientType);
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.size) httpParams = httpParams.set('size', params.size.toString());
    if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);

    return this.http.get<TransactionListResponse>(`${this.apiUrl}/${cashierId}/transactions`, { params: httpParams })
      .pipe(
        map(response => ({
          ...response,
          transactions: response.transactions.map(t => ({
            ...t,
            amount: (t as any).totalAmount || t.amount,
            date: new Date(t.date),
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt)
          }))
        }))
      );
  }

  getTransactionById(cashierId: string, transactionId: string): Observable<Transaction | null> {
    return this.http.get<Transaction>(`${this.apiUrl}/${cashierId}/transactions/${transactionId}`)
      .pipe(
        map(transaction => ({
          ...transaction,
          amount: (transaction as any).totalAmount || transaction.amount,
          date: new Date(transaction.date),
          createdAt: new Date(transaction.createdAt),
          updatedAt: new Date(transaction.updatedAt)
        }))
      );
  }

  createTransaction(transactionData: CreateTransactionRequest): Observable<Transaction> {
    const backendData = {
      ...transactionData,
      totalAmount: transactionData.amount
    };
    return this.http.post<Transaction>(`${this.apiUrl}/${transactionData.cashierId}/transactions`, backendData)
      .pipe(
        map(transaction => ({
          ...transaction,
          amount: (transaction as any).totalAmount || transaction.amount,
          date: new Date(transaction.date),
          createdAt: new Date(transaction.createdAt),
          updatedAt: new Date(transaction.updatedAt)
        }))
      );
  }

  updateTransaction(cashierId: string, transactionId: string, updates: UpdateTransactionRequest): Observable<Transaction | null> {
    const backendUpdates = {
      ...updates,
      ...(updates.amount && { totalAmount: updates.amount })
    };
    return this.http.patch<Transaction>(`${this.apiUrl}/${cashierId}/transactions/${transactionId}`, backendUpdates)
      .pipe(
        map(transaction => ({
          ...transaction,
          amount: (transaction as any).totalAmount || transaction.amount,
          date: new Date(transaction.date),
          createdAt: new Date(transaction.createdAt),
          updatedAt: new Date(transaction.updatedAt)
        }))
      );
  }

  deleteTransaction(cashierId: string, transactionId: string): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/${cashierId}/transactions/${transactionId}`)
      .pipe(
        map(() => true)
      );
  }

  // Additional methods for transaction management

  /**
   * Get transactions by client ID (for registered clients)
   */
  getTransactionsByClientId(cashierId: string, clientId: string): Observable<Transaction[]> {
    const params = new HttpParams().set('clientId', clientId);

    return this.http.get<Transaction[]>(`${this.apiUrl}/${cashierId}/transactions/by-client`, { params })
      .pipe(
        map(transactions => transactions.map(t => ({
          ...t,
          amount: (t as any).totalAmount || t.amount,
          date: new Date(t.date),
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt)
        })))
      );
  }

  /**
   * Get transaction statistics for dashboard
   */
  getTransactionStats(cashierId: string, startDate?: string, endDate?: string): Observable<any> {
    let params = new HttpParams();

    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<any>(`${this.apiUrl}/${cashierId}/transactions/stats`, { params });
  }

}
