import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TransactionService } from '../../../../core/services/transaction.service';
import { ToastrService } from '../../../../core/services/toastr.service';
import { OrderService } from '../../../../core/services/order.service';
import { ClientService } from '../../../../core/services/client.service';
import { PrintService, TicketData } from '../../../../core/services/print.service';
import { CreateTransactionRequest } from '../../../../core/models/transaction.model';
import { OrderItem, Product, Order } from '../../../../core/models/order.model';
import { Client, CreateClientRequest } from '../../../../core/models/client.model';
import { ClientFormComponent } from '../../client/client-form/client-form.component';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ClientFormComponent],
  templateUrl: './transaction-form.component.html',
  styleUrl: './transaction-form.component.css'
})
export class TransactionFormComponent implements OnInit {
  @ViewChild(ClientFormComponent) clientFormComponent!: ClientFormComponent;

  orderForm: FormGroup;
  isLoading = false;
  isSubmitting = false;

  // Order management
  orderItems: OrderItem[] = [];
  searchQuery = '';
  searchResults: Product[] = [];
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];

  // Invoice details
  invoiceNumber = '';
  customerId = '';
  selectedBiller = 'James Potter';

  // Payment calculation
  subtotal = 0;
  tax = 0;
  taxRate = 0.05; // 5%
  discount = 0;
  roundoff = 0;
  total = 0;

  // Payment method
  selectedPaymentMethod: 'cash' | 'card' | 'scan' = 'cash';

  // Client selection
  selectedClientType: 'guest' | 'registered' = 'guest';
  selectedClient: Client | null = null;
  clientSearchResults: Client[] = [];
  clientSearchQuery = '';
  isSearchingClients = false;

  // Client registration modal
  showClientFormModal = false;

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private orderService: OrderService,
    private clientService: ClientService,
    private toastrService: ToastrService,
    private printService: PrintService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.orderForm = this.fb.group({
      searchQuery: [''],
      clientSearchQuery: [''],
      customerId: [''],
      customerName: [''],
      vehicleType: ['car'],
      plateNumber: [''],
      phoneNumber: [''],
      discount: [0, [Validators.min(0)]],
      notes: ['']
    });

    this.invoiceNumber = this.orderService.generateInvoiceNumber();
  }

  ngOnInit(): void {
    console.log('TransactionFormComponent: ngOnInit started');
    this.loadProducts();
    this.setupSearchSubscription();
    this.setupClientSearchSubscription();
  }

  private loadProducts(): void {
    this.isLoading = true;
    this.orderService.getProducts().subscribe({
      next: (products) => {
        console.log('Products loaded:', products.length); // Debug log
        this.allProducts = products;
        this.filteredProducts = products; // Show all products initially
        this.searchResults = products;
        this.isLoading = false;

        // Force change detection
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.toastrService.error('Gagal memuat produk');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private setupSearchSubscription(): void {
    this.orderForm.get('searchQuery')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(query => {
        this.filterProducts(query || '');
      });
  }

  private filterProducts(query: string): void {
    if (!query || query.length === 0) {
      this.filteredProducts = this.allProducts;
    } else {
      this.filteredProducts = this.allProducts.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.sku.toLowerCase().includes(query.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(query.toLowerCase()))
      );
    }
  }

  private setupClientSearchSubscription(): void {
    this.orderForm.get('clientSearchQuery')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query => {
          this.clientSearchQuery = query || '';
          if (query && query.length >= 2) {
            this.isSearchingClients = true;
            return this.clientService.searchClients(query);
          }
          return of([]);
        })
      )
      .subscribe(results => {
        this.clientSearchResults = results;
        this.isSearchingClients = false;
      });
  }

  // Toggle product selection
  toggleProductSelection(product: Product): void {
    const existingItem = this.orderItems.find(item => item.id === product.id);

    if (existingItem) {
      // Product already selected, increase quantity
      this.updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      // Add new product
      this.addProductToOrder(product);
    }
  }

  // Check if product is selected
  isProductSelected(product: Product): boolean {
    return this.orderItems.some(item => item.id === product.id);
  }

  // Get product quantity
  getProductQuantity(product: Product): number {
    const item = this.orderItems.find(item => item.id === product.id);
    return item ? item.quantity : 0;
  }

  // Add product to order
  addProductToOrder(product: Product): void {
    const existingItem = this.orderItems.find(item => item.id === product.id);

    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        existingItem.quantity++;
        existingItem.subtotal = existingItem.quantity * existingItem.price;
      } else {
        this.toastrService.warning('Stok tidak mencukupi');
        return;
      }
    } else {
      const newItem: OrderItem = {
        id: product.id,
        productName: product.name,
        sku: product.sku,
        price: product.price,
        quantity: 1,
        subtotal: product.price,
        stock: product.stock,
        image: product.image
      };
      this.orderItems.push(newItem);
    }

    this.calculateTotals();
    // Don't clear search for grid view
  }

  // Update item quantity
  updateQuantity(itemId: string, newQuantity: number): void {
    const item = this.orderItems.find(i => i.id === itemId);
    if (item) {
      if (newQuantity <= 0) {
        this.removeItem(itemId);
      } else if (newQuantity <= item.stock) {
        item.quantity = newQuantity;
        item.subtotal = item.quantity * item.price;
        this.calculateTotals();
      } else {
        this.toastrService.warning('Stok tidak mencukupi');
      }
    }
  }

  // Handle quantity change from input
  onQuantityChange(itemId: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const newQuantity = parseInt(target.value, 10);
    this.updateQuantity(itemId, newQuantity);
  }

  // Remove item from order
  removeItem(itemId: string): void {
    this.orderItems = this.orderItems.filter(item => item.id !== itemId);
    this.calculateTotals();
  }

  // Clear all items
  clearAllItems(): void {
    this.orderItems = [];
    this.calculateTotals();
  }

  // Calculate order totals
  private calculateTotals(): void {
    const discountValue = this.orderForm.get('discount')?.value || 0;
    const totals = this.orderService.calculateOrderTotals(this.orderItems, discountValue, this.taxRate);

    this.subtotal = totals.subtotal;
    this.tax = totals.tax;
    this.total = totals.total;
    this.roundoff = totals.roundoff;
    this.discount = discountValue;
  }

  // Handle discount change
  onDiscountChange(): void {
    this.calculateTotals();
  }

  // Clear search
  private clearSearch(): void {
    this.orderForm.get('searchQuery')?.setValue('');
    this.searchResults = this.allProducts; // Show all products when search is cleared
  }

  // Make payment
  makePayment(): void {
    if (this.orderItems.length === 0) {
      this.toastrService.warning('Tidak ada item dalam pesanan');
      return;
    }

    this.isSubmitting = true;

    // Convert order to transaction format
    const formValue = this.orderForm.value;
    const serviceDescription = this.orderItems.map(item =>
      `${item.productName} (${item.quantity}x)`
    ).join(', ');

    const transactionData: CreateTransactionRequest = {
      clientName: formValue.customerName || 'Walk-in Customer',
      clientType: this.selectedClientType === 'registered' ? 'U' : 'P',
      vehicleType: formValue.vehicleType,
      plateNumber: formValue.plateNumber || '',
      serviceType: serviceDescription,
      amount: this.total,
      cashierId: 'cashier1',
      cashierName: this.selectedBiller,
      notes: formValue.notes
    };

    this.transactionService.createTransaction(transactionData).subscribe({
      next: (transaction) => {
        this.isSubmitting = false;
        this.toastrService.success('Pembayaran berhasil!');

        // Generate dan print tiket antrian otomatis
        this.generateAndPrintTicket(transaction, formValue);

        this.router.navigate(['/main/cashier/transactions']);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error creating transaction:', error);
        this.toastrService.error('Gagal memproses pembayaran');
      }
    });
  }

  // Generate and print ticket
  private generateAndPrintTicket(transaction: any, formValue: any): void {
    // Generate nomor antrian berdasarkan client type
    const clientType = this.selectedClientType === 'registered' ? 'U' : 'P';
    const queueNumber = this.printService.generateQueueNumber(clientType);

    // Prepare ticket data
    const ticketData: TicketData = {
      transactionId: transaction.id || transaction.transactionId || `TXN${Date.now()}`,
      queueNumber: queueNumber,
      clientName: formValue.customerName || 'Walk-in Customer',
      clientType: clientType,
      vehicleType: this.getVehicleTypeText(formValue.vehicleType),
      plateNumber: formValue.plateNumber || '-',
      serviceType: this.getServiceDescription(),
      amount: this.total,
      date: new Date(),
      cashierName: this.selectedBiller
    };

    // Print tiket (2 copies)
    this.printService.printTicket(ticketData);

    // Show success message with queue number
    setTimeout(() => {
      this.toastrService.success(`Tiket antrian ${queueNumber} telah dicetak!`);
    }, 500);
  }

  // Helper method untuk mendapatkan deskripsi layanan
  private getServiceDescription(): string {
    if (this.orderItems.length === 0) {
      return 'Car Wash Service';
    }

    if (this.orderItems.length === 1) {
      return this.orderItems[0].productName;
    }

    if (this.orderItems.length <= 3) {
      return this.orderItems.map(item => item.productName).join(', ');
    }

    return `${this.orderItems[0].productName} + ${this.orderItems.length - 1} layanan lainnya`;
  }

  // Helper method untuk mendapatkan text jenis kendaraan
  private getVehicleTypeText(vehicleType: string): string {
    const types: { [key: string]: string } = {
      'car': 'Mobil',
      'motorcycle': 'Motor',
      'truck': 'Truk'
    };
    return types[vehicleType] || vehicleType;
  }

  // Preview ticket (for testing purposes)
  previewTicket(): void {
    const formValue = this.orderForm.value;
    const clientType = this.selectedClientType === 'registered' ? 'U' : 'P';
    const queueNumber = this.printService.generateQueueNumber(clientType);

    const ticketData: TicketData = {
      transactionId: `TXN${Date.now()}`,
      queueNumber: queueNumber,
      clientName: formValue.customerName || 'Walk-in Customer',
      clientType: clientType,
      vehicleType: this.getVehicleTypeText(formValue.vehicleType),
      plateNumber: formValue.plateNumber || '-',
      serviceType: this.getServiceDescription(),
      amount: this.total,
      date: new Date(),
      cashierName: this.selectedBiller
    };

    this.printService.previewTicket(ticketData);
  }

  // Cancel order
  cancelOrder(): void {
    this.orderItems = [];
    this.calculateTotals();
    this.orderForm.reset({
      vehicleType: 'car',
      discount: 0
    });
    this.toastrService.info('Pesanan dibatalkan');
  }

  onCancel(): void {
    this.router.navigate(['/main/cashier/transactions']);
  }

  // Add new customer
  addNewCustomer(): void {
    const customerName = prompt('Masukkan nama customer baru:');
    if (customerName) {
      this.orderForm.get('customerName')?.setValue(customerName);
      this.customerId = 'CUST' + Date.now();
    }
  }

  // Scan barcode (placeholder)
  scanBarcode(): void {
    this.toastrService.info('Fitur scan barcode akan segera tersedia');
  }

  // Apply promo code
  applyPromoCode(): void {
    this.toastrService.info('Fitur promo code akan segera tersedia');
  }

  // Client selection methods
  selectClientType(type: 'guest' | 'registered'): void {
    this.selectedClientType = type;
    this.selectedClient = null;
    this.clientSearchResults = [];
    this.orderForm.get('clientSearchQuery')?.setValue('');

    if (type === 'guest') {
      // Reset form for guest
      this.orderForm.patchValue({
        customerId: '',
        customerName: '',
        vehicleType: 'car',
        plateNumber: '',
        phoneNumber: ''
      });
    }
  }

  onClientSearch(): void {
    // This will be handled by the subscription
  }

  selectClient(client: Client): void {
    this.selectedClient = client;
    this.clientSearchResults = [];
    this.orderForm.patchValue({
      customerId: client.id,
      customerName: client.name,
      vehicleType: client.vehicleType,
      plateNumber: client.plateNumber,
      phoneNumber: client.phone
    });
    this.orderForm.get('clientSearchQuery')?.setValue('');
  }

  clearSelectedClient(): void {
    this.selectedClient = null;
    this.orderForm.patchValue({
      customerId: '',
      customerName: '',
      vehicleType: 'car',
      plateNumber: '',
      phoneNumber: ''
    });
  }

  createNewClient(): void {
    this.showClientFormModal = true;
  }

  onClientFormModalVisibilityChange(isVisible: boolean): void {
    this.showClientFormModal = isVisible;
  }

  onClientCreated(client: Client): void {
    this.selectClient(client);
    this.selectedClientType = 'registered';
  }

  editClient(client: Client): void {
    this.toastrService.info('Edit client feature coming soon');
  }

  private markFormGroupTouched(): void {
    Object.keys(this.orderForm.controls).forEach(key => {
      const control = this.orderForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.orderForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} wajib diisi`;
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} minimal ${requiredLength} karakter`;
      }
      if (field.errors['min']) {
        const minValue = field.errors['min'].min;
        return `${this.getFieldLabel(fieldName)} minimal ${minValue}`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      customerName: 'Nama Customer',
      plateNumber: 'Nomor Plat',
      discount: 'Diskon'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.orderForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }

  // Format currency for display
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Get client type text
  getClientTypeText(clientType: string): string {
    return clientType === 'U' ? 'Registered' : 'Guest';
  }

  // TrackBy function for ngFor
  trackByItemId(index: number, item: OrderItem): string {
    return item.id;
  }

  // TrackBy function for products
  trackByProductId(index: number, product: Product): string {
    return product.id;
  }
}
