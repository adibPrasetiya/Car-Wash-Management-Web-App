import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientService } from '../../../../core/services/client.service';
import { ToastrService } from '../../../../core/services/toastr.service';
import { Client, ClientSearchParams, ClientListResponse } from '../../../../core/models/client.model';
import { ClientFormComponent } from '../client-form/client-form.component';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-client-list',
  imports: [CommonModule, ReactiveFormsModule, ClientFormComponent],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css'
})
export class ClientListComponent implements OnInit {
  // Form management
  filterForm: FormGroup;

  // Data management
  clients: Client[] = [];
  totalCount = 0;
  totalPages = 0;
  currentPage = 1;
  pageSize = 10;

  // UI state
  isLoading = false;
  searchQuery = '';
  selectedVehicleType = '';
  activeStatusFilter = 'all';

  // Dropdown states
  isVehicleDropdownOpen = false;
  isStatusDropdownOpen = false;

  // Action menus
  activeActionMenu: string | null = null;

  // Client registration modal
  showClientFormModal = false;

  // Pagination options
  pageSizeOptions = [5, 10, 25, 50];

  // Math object for template
  Math = Math;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private toastrService: ToastrService,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      searchQuery: [''],
      vehicleType: [''],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.setupSearchSubscription();
    this.loadClients();
  }

  private setupSearchSubscription(): void {
    this.filterForm.get('searchQuery')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(query => {
        this.searchQuery = query || '';
        this.currentPage = 1;
        this.loadClients();
      });
  }

  loadClients(): void {
    this.isLoading = true;

    const params: ClientSearchParams = {
      search: this.searchQuery,
      vehicleType: this.selectedVehicleType ? this.selectedVehicleType as 'car' | 'motorcycle' | 'truck' : undefined,
      isActive: this.activeStatusFilter === 'active' ? true :
                this.activeStatusFilter === 'inactive' ? false : undefined,
      page: this.currentPage,
      size: this.pageSize
    };

    this.clientService.getClients(params).subscribe({
      next: (response: ClientListResponse) => {
        this.clients = response.clients;
        this.totalCount = response.totalCount;
        this.totalPages = response.totalPages;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading clients:', error);
        this.toastrService.error('Failed to load clients');
        this.isLoading = false;
      }
    });
  }

  // Filter methods
  onVehicleFilter(vehicleType: string): void {
    this.selectedVehicleType = vehicleType;
    this.isVehicleDropdownOpen = false;
    this.currentPage = 1;
    this.loadClients();
  }

  onStatusFilter(status: string): void {
    this.activeStatusFilter = status;
    this.isStatusDropdownOpen = false;
    this.currentPage = 1;
    this.loadClients();
  }

  clearFilters(): void {
    this.filterForm.get('searchQuery')?.setValue('');
    this.selectedVehicleType = '';
    this.activeStatusFilter = 'all';
    this.currentPage = 1;
    this.loadClients();
  }

  // Pagination methods
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadClients();
  }

  onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.pageSize = parseInt(target.value, 10);
    this.currentPage = 1;
    this.loadClients();
  }

  // Action methods
  toggleActionMenu(clientId: string): void {
    this.activeActionMenu = this.activeActionMenu === clientId ? null : clientId;
  }

  editClient(client: Client): void {
    this.activeActionMenu = null;
    // TODO: Implement edit client functionality
    this.toastrService.info('Edit client feature coming soon');
  }

  viewClientDetails(client: Client): void {
    this.activeActionMenu = null;
    // TODO: Navigate to client details page
    this.toastrService.info('Client details feature coming soon');
  }

  deactivateClient(client: Client): void {
    this.activeActionMenu = null;
    if (confirm(`Are you sure you want to deactivate ${client.name}?`)) {
      this.clientService.deleteClient(client.id).subscribe({
        next: () => {
          this.toastrService.success('Client deactivated successfully');
          this.loadClients();
        },
        error: (error) => {
          console.error('Error deactivating client:', error);
          this.toastrService.error('Failed to deactivate client');
        }
      });
    }
  }

  addNewClient(): void {
    this.showClientFormModal = true;
  }

  onClientFormModalVisibilityChange(isVisible: boolean): void {
    this.showClientFormModal = isVisible;
  }

  onClientCreated(client: Client): void {
    this.toastrService.success('Client registered successfully');
    this.loadClients();
  }

  // Helper methods
  getVehicleTypeText(vehicleType: string): string {
    const types: { [key: string]: string } = {
      'car': 'Car',
      'motorcycle': 'Motorcycle',
      'truck': 'Truck'
    };
    return types[vehicleType] || vehicleType;
  }

  getVehicleTypeIcon(vehicleType: string): string {
    const icons: { [key: string]: string } = {
      'car': 'fas fa-car',
      'motorcycle': 'fas fa-motorcycle',
      'truck': 'fas fa-truck'
    };
    return icons[vehicleType] || 'fas fa-car';
  }

  getVehiclesSummary(vehicles: any[]): string {
    return vehicles.map(v => `${v.plateNumber} (${this.getVehicleTypeText(v.vehicleType)})`).join('\n');
  }

  getClientTypeText(clientType: string): string {
    return clientType === 'U' ? 'Registered' : 'Guest';
  }

  getLoyaltyRank(totalTransactions: number): { rank: string, color: string } {
    if (totalTransactions >= 50) return { rank: 'VIP', color: '#ffd700' };
    if (totalTransactions >= 25) return { rank: 'Gold', color: '#ff8c42' };
    if (totalTransactions >= 10) return { rank: 'Silver', color: '#c0c0c0' };
    return { rank: 'Bronze', color: '#cd7f32' };
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID');
  }

  getVisiblePageNumbers(): number[] {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, this.currentPage - delta);
         i <= Math.min(this.totalPages - 1, this.currentPage + delta);
         i++) {
      range.push(i);
    }

    if (this.currentPage - delta > 2) {
      rangeWithDots.push(1, -1);
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (this.currentPage + delta < this.totalPages - 1) {
      rangeWithDots.push(-1, this.totalPages);
    } else if (this.totalPages > 1) {
      rangeWithDots.push(this.totalPages);
    }

    return rangeWithDots;
  }

  // TrackBy function for ngFor
  trackByClientId(index: number, client: Client): string {
    return client.id;
  }

  // Close dropdowns when clicking outside
  closeDropdowns(): void {
    this.isVehicleDropdownOpen = false;
    this.isStatusDropdownOpen = false;
    this.activeActionMenu = null;
  }

  // Prevent dropdown close when clicking inside
  preventClose(event: Event): void {
    event.stopPropagation();
  }
}
