import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  Discount,
  CreateDiscountRequest,
  UpdateDiscountRequest
} from '../../../core/models/service.model';
import { DiscountService } from '../../../core/services/discount.service';
import { ToastrService } from '../../../core/services/toastr.service';

@Component({
  selector: 'app-discount-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './discount-form.component.html',
  styleUrl: './discount-form.component.css'
})
export class DiscountFormComponent implements OnInit {
  isEdit = false;
  discountId?: number;
  isLoading = false;
  isSubmitting = false;

  form = {
    name: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    isActive: true,
    validFrom: '',
    validUntil: ''
  };

  constructor(
    private discountService: DiscountService,
    private router: Router,
    private route: ActivatedRoute,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.discountId = +params['id'];
      }
    });

    if (this.isEdit && this.discountId) {
      this.loadDiscount();
    } else {
      // Set default valid from date to today
      const today = new Date().toISOString().split('T')[0];
      this.form.validFrom = today;
    }
  }

  loadDiscount(): void {
    if (!this.discountId) return;

    this.isLoading = true;
    this.discountService.getDiscountById(this.discountId).subscribe({
      next: (discount) => {
        this.form = {
          name: discount.name,
          description: discount.description || '',
          type: discount.type,
          value: discount.value,
          isActive: discount.isActive,
          validFrom: new Date(discount.validFrom).toISOString().split('T')[0],
          validUntil: discount.validUntil ? new Date(discount.validUntil).toISOString().split('T')[0] : ''
        };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading discount:', error);
        this.toastrService.error('Failed to load discount');
        this.isLoading = false;
        this.goBack();
      }
    });
  }

  onSubmit(): void {
    if (this.isSubmitting || !this.isFormValid()) {
      return;
    }

    this.isSubmitting = true;

    if (this.isEdit) {
      this.updateDiscount();
    } else {
      this.createDiscount();
    }
  }

  private createDiscount(): void {
    const requestData: CreateDiscountRequest = {
      name: this.form.name,
      description: this.form.description || undefined,
      type: this.form.type,
      value: this.form.value,
      isActive: this.form.isActive,
      validFrom: new Date(this.form.validFrom),
      validUntil: this.form.validUntil ? new Date(this.form.validUntil) : undefined
    };

    this.discountService.createDiscount(requestData).subscribe({
      next: () => {
        this.toastrService.success('Discount created successfully');
        this.goBack();
      },
      error: (error) => {
        console.error('Error creating discount:', error);
        this.toastrService.error('Failed to create discount');
        this.isSubmitting = false;
      }
    });
  }

  private updateDiscount(): void {
    if (!this.discountId) return;

    const requestData: UpdateDiscountRequest = {
      name: this.form.name,
      description: this.form.description || undefined,
      type: this.form.type,
      value: this.form.value,
      isActive: this.form.isActive,
      validFrom: new Date(this.form.validFrom),
      validUntil: this.form.validUntil ? new Date(this.form.validUntil) : undefined
    };

    this.discountService.updateDiscount(this.discountId, requestData).subscribe({
      next: () => {
        this.toastrService.success('Discount updated successfully');
        this.goBack();
      },
      error: (error) => {
        console.error('Error updating discount:', error);
        this.toastrService.error('Failed to update discount');
        this.isSubmitting = false;
      }
    });
  }

  isFormValid(): boolean {
    return (
      this.form.name.trim().length > 0 &&
      this.form.value > 0 &&
      this.form.validFrom.length > 0 &&
      (this.form.type === 'percentage' ? this.form.value <= 100 : true)
    );
  }

  goBack(): void {
    this.router.navigate(['/main/discounts']);
  }

  getTitle(): string {
    return this.isEdit ? 'Edit Discount' : 'Add New Discount';
  }

  formatDiscountValue(): string {
    if (this.form.type === 'percentage') {
      return `${this.form.value}%`;
    } else {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
      }).format(this.form.value);
    }
  }

  getValidityStatus(): string {
    if (!this.form.validFrom) return 'Not set';

    const validFrom = new Date(this.form.validFrom);
    const validUntil = this.form.validUntil ? new Date(this.form.validUntil) : null;
    const now = new Date();

    if (validFrom > now) {
      return 'Future discount';
    } else if (validUntil && validUntil < now) {
      return 'Expired';
    } else if (validUntil) {
      return `Active until ${validUntil.toLocaleDateString()}`;
    } else {
      return 'Active (no expiry)';
    }
  }
}
