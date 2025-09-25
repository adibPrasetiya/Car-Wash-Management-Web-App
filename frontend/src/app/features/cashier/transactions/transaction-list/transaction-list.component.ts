import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  Transaction,
  TransactionSearchParams,
  TransactionListResponse
} from '../../../../core/models/transaction.model';
import { TransactionService } from '../../../../core/services/transaction.service';
import { ToastrService } from '../../../../core/services/toastr.service';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.css'
})
export class TransactionListComponent implements OnInit {
  transactions: Transaction[] = [];
  isLoading = false;

  // Search and filter properties
  searchQuery = '';
  selectedStatus = '';
  selectedClientType = '';
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  totalCount = 0;

  // Pagination options
  pageSizeOptions = [5, 10, 20, 50];

  // Mock cashier ID (in real app this would come from auth service)
  private cashierId = 'cashier1';

  // Expose Math to template
  Math = Math;

  // Action menu state
  activeActionMenu: string | null = null;

  // Custom dropdown states
  isStatusDropdownOpen = false;
  isClientTypeDropdownOpen = false;

  constructor(
    private transactionService: TransactionService,
    private router: Router,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadTransactions();

    // Close dropdowns when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as Element;

      // Close action menu
      if (this.activeActionMenu && !target.closest('.action-menu-container')) {
        this.closeActionMenu();
      }

      // Close custom dropdowns
      if (this.isStatusDropdownOpen && !target.closest('.custom-dropdown')) {
        this.isStatusDropdownOpen = false;
      }

      if (this.isClientTypeDropdownOpen && !target.closest('.custom-dropdown')) {
        this.isClientTypeDropdownOpen = false;
      }
    });
  }

  loadTransactions(): void {
    this.isLoading = true;

    const params: TransactionSearchParams = {
      search: this.searchQuery || undefined,
      status: this.selectedStatus || undefined,
      clientType: this.selectedClientType as 'U' | 'P' || undefined,
      page: this.currentPage,
      size: this.pageSize
    };

    this.transactionService.getTransactions(this.cashierId, params).subscribe({
      next: (response: TransactionListResponse) => {
        this.transactions = response.transactions;
        this.totalCount = response.totalCount;
        this.totalPages = response.totalPages;
        this.currentPage = response.page;
        this.pageSize = response.size;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.toastrService.error('Gagal memuat data transaksi');
        this.isLoading = false;
      }
    });
  }

  // Search and filter methods
  onSearch(): void {
    this.currentPage = 1;
    this.loadTransactions();
  }

  onStatusFilter(): void {
    this.currentPage = 1;
    this.loadTransactions();
  }

  onClientTypeFilter(): void {
    this.currentPage = 1;
    this.loadTransactions();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = '';
    this.selectedClientType = '';
    this.currentPage = 1;
    this.loadTransactions();
  }

  // Pagination methods
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadTransactions();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadTransactions();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Action methods
  onAddTransaction(): void {
    this.router.navigate(['/main/cashier/transactions/new']);
  }

  onViewDetail(transaction: Transaction): void {
    // TODO: Open modal with transaction detail
    console.log('View detail for transaction:', transaction);
  }

  onEditTransaction(id: string): void {
    this.router.navigate(['/main/cashier/transactions', id, 'edit']);
    this.closeActionMenu();
  }

  // Action menu methods
  toggleActionMenu(transactionId: string, event: Event): void {
    event.stopPropagation();
    if (this.activeActionMenu === transactionId) {
      this.activeActionMenu = null;
    } else {
      this.activeActionMenu = transactionId;
    }
  }

  closeActionMenu(): void {
    this.activeActionMenu = null;
  }

  isActionMenuOpen(transactionId: string): boolean {
    return this.activeActionMenu === transactionId;
  }

  onUpdateTransactionStatus(transaction: Transaction, status: 'pending' | 'in_progress' | 'completed' | 'cancelled'): void {
    this.transactionService.updateTransaction(this.cashierId, transaction.transactionId, { status }).subscribe({
      next: (updatedTransaction) => {
        if (updatedTransaction) {
          // Update transaction in local array
          const index = this.transactions.findIndex(t => t.transactionId === transaction.transactionId);
          if (index !== -1) {
            this.transactions[index] = updatedTransaction;
          }
          this.toastrService.success('Transaction status updated successfully');
        }
      },
      error: (error) => {
        console.error('Error updating transaction:', error);
        this.toastrService.error('Failed to update transaction status');
      }
    });
    this.closeActionMenu();
  }

  onDeleteTransaction(transaction: Transaction): void {
    if (confirm(`Are you sure you want to delete transaction ${transaction.transactionNumber}?`)) {
      this.transactionService.deleteTransaction(this.cashierId, transaction.transactionId).subscribe({
        next: (success) => {
          if (success) {
            this.loadTransactions(); // Reload the list
            this.toastrService.success('Transaction deleted successfully');
          }
        },
        error: (error) => {
          console.error('Error deleting transaction:', error);
          this.toastrService.error('Failed to delete transaction');
        }
      });
    }
    this.closeActionMenu();
  }

  // Custom dropdown methods
  toggleStatusDropdown(event: Event): void {
    event.stopPropagation();
    this.isClientTypeDropdownOpen = false; // Close other dropdown
    this.isStatusDropdownOpen = !this.isStatusDropdownOpen;
  }

  toggleClientTypeDropdown(event: Event): void {
    event.stopPropagation();
    this.isStatusDropdownOpen = false; // Close other dropdown
    this.isClientTypeDropdownOpen = !this.isClientTypeDropdownOpen;
  }

  selectStatus(status: string): void {
    this.selectedStatus = status;
    this.isStatusDropdownOpen = false;
    this.onStatusFilter();
  }

  selectClientType(clientType: string): void {
    this.selectedClientType = clientType;
    this.isClientTypeDropdownOpen = false;
    this.onClientTypeFilter();
  }

  getStatusLabel(): string {
    switch (this.selectedStatus) {
      case 'pending':
        return 'Pending';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Success';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'All Status';
    }
  }

  getClientTypeLabel(): string {
    switch (this.selectedClientType) {
      case 'U':
        return 'Registered';
      case 'P':
        return 'Guest';
      default:
        return 'All Clients';
    }
  }

  // Utility methods
  getStatusClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'status-success';
      case 'in_progress':
        return 'status-progress';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed':
        return 'Success';
      case 'in_progress':
        return 'In progress';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }

  getVehicleTypeText(vehicleType: string): string {
    switch (vehicleType) {
      case 'car':
        return 'Car';
      case 'motorcycle':
        return 'Motorcycle';
      case 'truck':
        return 'Truck';
      default:
        return vehicleType;
    }
  }

  getVehicleTypeIcon(vehicleType: string): string {
    const icons: { [key: string]: string } = {
      'car': 'fas fa-car',
      'motorcycle': 'fas fa-motorcycle',
      'truck': 'fas fa-truck'
    };
    return icons[vehicleType] || 'fas fa-car';
  }

  getVehicleBrandModel(transaction: Transaction): string {
    const brand = transaction.vehicleBrand || '';
    const model = transaction.vehicleModel || '';
    if (brand && model) {
      return `${brand} ${model}`;
    } else if (brand) {
      return brand;
    } else if (model) {
      return model;
    }
    return '';
  }

  getClientTypeText(clientType: string): string {
    return clientType === 'U' ? 'Registered' : 'Guest';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 1000); // Convert to dollars for demo
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  trackByTransactionId(index: number, transaction: Transaction): string {
    return transaction.id;
  }
}
