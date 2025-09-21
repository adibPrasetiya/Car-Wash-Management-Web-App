import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Transaction,
  CreateTransactionRequest,
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
      clientName: 'John Doe',
      clientType: 'U',
      vehicleType: 'car',
      plateNumber: 'B1234ABC',
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
      clientName: 'Jane Smith',
      clientType: 'U',
      vehicleType: 'car',
      plateNumber: 'B5678DEF',
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
      clientName: 'Maria Garcia',
      clientType: 'U',
      vehicleType: 'car',
      plateNumber: 'B3456JKL',
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
      clientName: 'Siti Nurhaliza',
      clientType: 'U',
      vehicleType: 'car',
      plateNumber: 'B1357PQR',
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
    if (params?.dateRange?.start) httpParams = httpParams.set('startDate', params.dateRange.start.toISOString());
    if (params?.dateRange?.end) httpParams = httpParams.set('endDate', params.dateRange.end.toISOString());

    return this.http.get<TransactionListResponse>(`${this.apiUrl}/${cashierId}/transactions`, { params: httpParams })
      .pipe(
        map(response => ({
          ...response,
          transactions: response.transactions.map(t => ({
            ...t,
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
          date: new Date(transaction.date),
          createdAt: new Date(transaction.createdAt),
          updatedAt: new Date(transaction.updatedAt)
        }))
      );
  }

  createTransaction(transactionData: CreateTransactionRequest): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/${transactionData.cashierId}/transactions`, transactionData)
      .pipe(
        map(transaction => ({
          ...transaction,
          date: new Date(transaction.date),
          createdAt: new Date(transaction.createdAt),
          updatedAt: new Date(transaction.updatedAt)
        }))
      );
  }

  updateTransaction(cashierId: string, transactionId: string, updates: Partial<Transaction>): Observable<Transaction | null> {
    return this.http.patch<Transaction>(`${this.apiUrl}/${cashierId}/transactions/${transactionId}`, updates)
      .pipe(
        map(transaction => ({
          ...transaction,
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

}
