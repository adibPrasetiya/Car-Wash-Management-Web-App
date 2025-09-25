import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  Service,
  CreateServiceRequest,
  UpdateServiceRequest
} from '../../../core/models/service.model';
import { ServiceService } from '../../../core/services/service.service';
import { ToastrService } from '../../../core/services/toastr.service';

@Component({
  selector: 'app-service-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './service-form.component.html',
  styleUrl: './service-form.component.css'
})
export class ServiceFormComponent implements OnInit {
  isEdit = false;
  serviceId?: number;
  isLoading = false;
  isSubmitting = false;

  form = {
    name: '',
    description: '',
    price: 0,
    isAvailable: true
  };

  constructor(
    private serviceService: ServiceService,
    private router: Router,
    private route: ActivatedRoute,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.serviceId = +params['id'];
      }
    });


    if (this.isEdit && this.serviceId) {
      this.loadService();
    }
  }

  loadService(): void {
    if (!this.serviceId) return;

    this.isLoading = true;
    this.serviceService.getServiceById(this.serviceId).subscribe({
      next: (service) => {
        this.form = {
          name: service.name,
          description: service.description || '',
          price: service.price,
          isAvailable: service.isAvailable
        };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading service:', error);
        this.toastrService.error('Failed to load service');
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
      this.updateService();
    } else {
      this.createService();
    }
  }

  private createService(): void {
    this.serviceService.createService(this.form as CreateServiceRequest).subscribe({
      next: () => {
        this.toastrService.success('Service created successfully');
        this.goBack();
      },
      error: (error) => {
        console.error('Error creating service:', error);
        this.toastrService.error('Failed to create service');
        this.isSubmitting = false;
      }
    });
  }

  private updateService(): void {
    if (!this.serviceId) return;

    this.serviceService.updateService(this.serviceId, this.form as UpdateServiceRequest).subscribe({
      next: () => {
        this.toastrService.success('Service updated successfully');
        this.goBack();
      },
      error: (error) => {
        console.error('Error updating service:', error);
        this.toastrService.error('Failed to update service');
        this.isSubmitting = false;
      }
    });
  }

  isFormValid(): boolean {
    return this.form.name.trim().length > 0 && this.form.price > 0;
  }

  goBack(): void {
    this.router.navigate(['/main/services']);
  }

  getTitle(): string {
    return this.isEdit ? 'Edit Service' : 'Add New Service';
  }
}
