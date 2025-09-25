import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  Service,
  ServiceListResponse,
  ServiceSearchParams
} from '../../../core/models/service.model';
import { ServiceService } from '../../../core/services/service.service';
import { ToastrService } from '../../../core/services/toastr.service';

@Component({
  selector: 'app-service-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './service-list.component.html',
  styleUrl: './service-list.component.css'
})
export class ServiceListComponent implements OnInit {
  services: Service[] = [];
  isLoading = false;

  // Search and filter properties
  searchQuery = '';
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
    private serviceService: ServiceService,
    private router: Router,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadServices();

    // Close action menu when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as Element;
      if (this.activeActionMenu && !target.closest('.action-menu-container')) {
        this.closeActionMenu();
      }
    });
  }

  loadServices(): void {
    this.isLoading = true;

    const params: ServiceSearchParams = {
      search: this.searchQuery || undefined,
      page: this.currentPage,
      size: this.pageSize
    };

    this.serviceService.getServices(params).subscribe({
      next: (response: ServiceListResponse) => {
        this.services = response.services;
        this.totalCount = response.totalCount;
        this.totalPages = response.totalPages;
        this.currentPage = response.page;
        this.pageSize = response.size;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading services:', error);
        this.toastrService.error('Failed to load services');
        this.isLoading = false;
      }
    });
  }

  // Search and filter methods
  onSearch(): void {
    this.currentPage = 1;
    this.loadServices();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.currentPage = 1;
    this.loadServices();
  }

  // Pagination methods
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadServices();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadServices();
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
  onAddService(): void {
    this.router.navigate(['/main/services/new']);
  }

  onEditService(id: number): void {
    this.router.navigate(['/main/services', id, 'edit']);
    this.closeActionMenu();
  }

  onDeleteService(service: Service): void {
    if (confirm(`Are you sure you want to delete service "${service.name}"?`)) {
      this.serviceService.deleteService(service.id).subscribe({
        next: () => {
          this.loadServices();
          this.toastrService.success('Service deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting service:', error);
          this.toastrService.error('Failed to delete service');
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

  trackById(index: number, service: Service): number {
    return service.id;
  }
}
