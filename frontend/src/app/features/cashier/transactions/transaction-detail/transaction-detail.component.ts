import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Transaction } from '../../../../core/models/transaction.model';
import { TransactionService } from '../../../../core/services/transaction.service';
import { ToastrService } from '../../../../core/services/toastr.service';

@Component({
  selector: 'app-transaction-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-detail.component.html',
  styleUrl: './transaction-detail.component.css'
})
export class TransactionDetailComponent implements OnInit {
  transaction: Transaction | null = null;
  isLoading = false;
  transactionId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.transactionId = this.route.snapshot.paramMap.get('id');
    if (this.transactionId) {
      this.loadTransaction(this.transactionId);
    } else {
      this.toastrService.error('ID transaksi tidak valid');
      this.router.navigate(['/main/cashier/transactions']);
    }
  }

  loadTransaction(id: string): void {
    this.isLoading = true;
    this.transactionService.getTransactionById('cashier1', id).subscribe({
      next: (transaction) => {
        this.transaction = transaction;
        this.isLoading = false;
        if (!transaction) {
          this.toastrService.error('Transaksi tidak ditemukan');
          this.router.navigate(['/main/cashier/transactions']);
        }
      },
      error: (error) => {
        console.error('Error loading transaction:', error);
        this.toastrService.error('Gagal memuat detail transaksi');
        this.isLoading = false;
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/main/cashier/transactions']);
  }

  onEdit(): void {
    if (this.transaction) {
      // For now, just show a message. Edit functionality can be implemented later
      this.toastrService.info('Fitur edit akan segera tersedia');
    }
  }

  onUpdateStatus(status: 'pending' | 'completed' | 'cancelled'): void {
    if (this.transaction && this.transactionId) {
      this.transactionService.updateTransaction('cashier1', this.transactionId, { status }).subscribe({
        next: (updatedTransaction) => {
          if (updatedTransaction) {
            this.transaction = updatedTransaction;
            this.toastrService.success('Status transaksi berhasil diperbarui');
          }
        },
        error: (error) => {
          console.error('Error updating transaction:', error);
          this.toastrService.error('Gagal memperbarui status transaksi');
        }
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'badge bg-success fs-6';
      case 'pending':
        return 'badge bg-warning text-dark fs-6';
      case 'cancelled':
        return 'badge bg-danger fs-6';
      default:
        return 'badge bg-secondary fs-6';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed':
        return 'Selesai';
      case 'pending':
        return 'Menunggu';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateTime(date: Date): string {
    return new Date(date).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
