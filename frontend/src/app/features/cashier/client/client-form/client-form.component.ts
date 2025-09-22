import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ClientService } from '../../../../core/services/client.service';
import { ToastrService } from '../../../../core/services/toastr.service';
import { CreateClientRequest, Client } from '../../../../core/models/client.model';

@Component({
  selector: 'app-client-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.css'
})
export class ClientFormComponent implements OnInit {
  @Input() isVisible = false;
  @Output() visibilityChange = new EventEmitter<boolean>();
  @Output() clientCreated = new EventEmitter<Client>();

  clientForm: FormGroup;
  isSubmitting = false;
  currentStep: 'client' | 'vehicle' = 'client';

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private toastrService: ToastrService
  ) {
    this.clientForm = this.fb.group({
      // Client information
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^(\+62|62|0)[0-9]{9,13}$/)]],

      // Vehicle information
      vehicleType: ['car', [Validators.required]],
      plateNumber: ['', [Validators.required, Validators.pattern(/^[A-Z]{1,2}[0-9]{1,4}[A-Z]{1,3}$/i)]]
    });
  }

  ngOnInit(): void {
  }

  // Modal control methods
  openModal(): void {
    this.isVisible = true;
    this.currentStep = 'client';
    this.clientForm.reset({
      vehicleType: 'car'
    });
    this.visibilityChange.emit(this.isVisible);
  }

  closeModal(): void {
    this.isVisible = false;
    this.currentStep = 'client';
    this.clientForm.reset();
    this.visibilityChange.emit(this.isVisible);
  }

  // Step navigation
  nextStep(): void {
    if (this.currentStep === 'client') {
      // Validate client fields
      const clientFields = ['name', 'email', 'phone'];
      let isValid = true;

      clientFields.forEach(field => {
        const control = this.clientForm.get(field);
        if (control) {
          control.markAsTouched();
          if (field === 'name' || field === 'phone') {
            if (control.invalid) {
              isValid = false;
            }
          }
          // Email is optional, but if provided, must be valid
          if (field === 'email' && control.value && control.invalid) {
            isValid = false;
          }
        }
      });

      if (isValid) {
        this.currentStep = 'vehicle';
      }
    }
  }

  previousStep(): void {
    if (this.currentStep === 'vehicle') {
      this.currentStep = 'client';
    }
  }

  // Form submission
  onSubmit(): void {
    if (this.clientForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const formValue = this.clientForm.value;
      const clientData: CreateClientRequest = {
        name: formValue.name,
        phone: formValue.phone,
        email: formValue.email || undefined,
        plateNumber: formValue.plateNumber,
        vehicleType: formValue.vehicleType,
        type: 'U' // Registered user
      };

      this.clientService.createClient(clientData).subscribe({
        next: (client) => {
          this.isSubmitting = false;
          this.toastrService.success('Client berhasil didaftarkan!');
          this.clientCreated.emit(client);
          this.closeModal();
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error creating client:', error);
          this.toastrService.error('Gagal mendaftarkan client');
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  // Validation helper methods
  private markFormGroupTouched(): void {
    Object.keys(this.clientForm.controls).forEach(key => {
      const control = this.clientForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.clientForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.clientForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} wajib diisi`;
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} minimal ${requiredLength} karakter`;
      }
      if (field.errors['email']) {
        return 'Format email tidak valid';
      }
      if (field.errors['pattern']) {
        if (fieldName === 'phone') {
          return 'Format nomor telepon tidak valid (contoh: +628123456789)';
        }
        if (fieldName === 'plateNumber') {
          return 'Format nomor plat tidak valid (contoh: B1234ABC)';
        }
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Nama',
      email: 'Email',
      phone: 'Nomor Telepon',
      vehicleType: 'Jenis Kendaraan',
      plateNumber: 'Nomor Plat'
    };
    return labels[fieldName] || fieldName;
  }

  // Handle modal background click
  onModalBackgroundClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  // Prevent form submission on Enter in input fields
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (this.currentStep === 'client') {
        this.nextStep();
      } else {
        this.onSubmit();
      }
    }
  }
}
