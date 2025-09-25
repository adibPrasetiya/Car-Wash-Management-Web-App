import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  Discount,
  DiscountListResponse,
  DiscountSearchParams
} from '../../../core/models/service.model';
import { DiscountService } from '../../../core/services/discount.service';
import { ToastrService } from '../../../core/services/toastr.service';

@Component({
  selector: 'app-discount-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './discount-list.component.html',
  styleUrl: './discount-list.component.css'
})
export class DiscountListComponent implements OnInit {
  discounts: Discount[] = [];
  isLoading = false;

  // Search and filter properties
  searchQuery = '';
  statusFilter: 'all' | 'active' | 'inactive' = 'all';
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  totalCount = 0;

  // Pagination options
  pageSizeOptions = [5, 10, 20, 50];

  // Action menu state
  activeActionMenu: number | null = null;

  // Expose Math to template
  Math = Math;

  constructor(
    private discountService: DiscountService,
    private router: Router,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDiscounts();

    // Close action menu when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as Element;
      if (this.activeActionMenu && !target.closest('.action-menu-container')) {
        this.closeActionMenu();
      }
    });
  }

  loadDiscounts(): void {
    this.isLoading = true;

    const params: DiscountSearchParams = {
      search: this.searchQuery || undefined,
      isActive: this.statusFilter === 'all' ? undefined : this.statusFilter === 'active',
      page: this.currentPage,
      size: this.pageSize
    };

    this.discountService.getDiscounts(params).subscribe({
      next: (response: DiscountListResponse) => {
        this.discounts = response.discounts;
        this.totalCount = response.totalCount;
        this.totalPages = response.totalPages;
        this.currentPage = response.page;
        this.pageSize = response.size;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading discounts:', error);
        this.toastrService.error('Failed to load discounts');
        this.isLoading = false;
      }
    });
  }

  // Search and filter methods
  onSearch(): void {
    this.currentPage = 1;
    this.loadDiscounts();
  }

  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.loadDiscounts();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.currentPage = 1;
    this.loadDiscounts();
  }

  // Pagination methods
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadDiscounts();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadDiscounts();
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
  onAddDiscount(): void {
    this.router.navigate(['/main/discounts/new']);
  }

  onEditDiscount(id: number): void {
    this.router.navigate(['/main/discounts', id, 'edit']);
    this.closeActionMenu();
  }

  onDeleteDiscount(discount: Discount): void {
    if (confirm(`Are you sure you want to delete discount "${discount.name}"?`)) {
      this.discountService.deleteDiscount(discount.id).subscribe({
        next: () => {
          this.loadDiscounts();
          this.toastrService.success('Discount deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting discount:', error);
          this.toastrService.error('Failed to delete discount');
        }
      });
    }
    this.closeActionMenu();
  }

  // Action menu methods
  toggleActionMenu(id: number, event: Event): void {
    event.stopPropagation();
    if (this.activeActionMenu === id) {
      this.activeActionMenu = null;
    } else {
      this.activeActionMenu = id;
    }
  }

  closeActionMenu(): void {
    this.activeActionMenu = null;
  }

  isActionMenuOpen(id: number): boolean {
    return this.activeActionMenu === id;
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
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

  formatDiscountValue(discount: Discount): string {
    if (discount.type === 'percentage') {
      return `${discount.value}%`;
    } else {
      return this.formatCurrency(discount.value);
    }
  }

  formatValidityPeriod(discount: Discount): string {
    const validFrom = new Date(discount.validFrom);
    const now = new Date();

    if (discount.validUntil) {
      const validUntil = new Date(discount.validUntil);
      if (now > validUntil) {
        return 'Expired';
      }
      return `Until ${this.formatDate(validUntil)}`;
    } else {
      return 'No expiry';
    }
  }

  trackById(index: number, discount: Discount): number {
    return discount.id;
  }
}
