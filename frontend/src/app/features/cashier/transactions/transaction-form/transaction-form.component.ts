import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TransactionService } from '../../../../core/services/transaction.service';
import { ToastrService } from '../../../../core/services/toastr.service';
import { CreateTransactionRequest } from '../../../../core/models/transaction.model';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transaction-form.component.html',
  styleUrl: './transaction-form.component.css'
})
export class TransactionFormComponent implements OnInit {
  transactionForm: FormGroup;
  isLoading = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private toastrService: ToastrService,
    private router: Router
  ) {
    this.transactionForm = this.fb.group({
      clientName: ['', [Validators.required, Validators.minLength(2)]],
      clientType: ['U', [Validators.required]],
      vehicleType: ['car', [Validators.required]],
      plateNumber: ['', [Validators.required, Validators.minLength(3)]],
      serviceType: ['', [Validators.required, Validators.minLength(5)]],
      amount: ['', [Validators.required, Validators.min(1000)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    // Form is already initialized with default values
  }

  onSubmit(): void {
    if (this.transactionForm.valid) {
      this.isSubmitting = true;

      const formValue = this.transactionForm.value;
      const transactionData: CreateTransactionRequest = {
        clientName: formValue.clientName,
        clientType: formValue.clientType,
        vehicleType: formValue.vehicleType,
        plateNumber: formValue.plateNumber,
        serviceType: formValue.serviceType,
        amount: Number(formValue.amount),
        cashierId: 'cashier1', // In real app, get from auth service
        cashierName: 'Ahmad Rizki', // In real app, get from auth service
        notes: formValue.notes
      };

      this.transactionService.createTransaction(transactionData).subscribe({
        next: (transaction) => {
          this.isSubmitting = false;
          this.toastrService.success('Transaksi berhasil ditambahkan!');
          this.router.navigate(['/main/cashier/transactions']);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error creating transaction:', error);
          this.toastrService.error('Gagal menambahkan transaksi. Silakan coba lagi.');
        }
      });
    } else {
      this.toastrService.warning('Mohon lengkapi semua field yang diperlukan.');
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/main/cashier/transactions']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.transactionForm.controls).forEach(key => {
      const control = this.transactionForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.transactionForm.get(fieldName);
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
        return `${this.getFieldLabel(fieldName)} minimal Rp ${minValue.toLocaleString('id-ID')}`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      client: 'Nama client',
      tanggal: 'Tanggal',
      deskripsi: 'Deskripsi',
      jumlah: 'Jumlah'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.transactionForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }

  fillTemplate(description: string, amount: number): void {
    this.transactionForm.patchValue({
      deskripsi: description,
      jumlah: amount
    });
  }
}
