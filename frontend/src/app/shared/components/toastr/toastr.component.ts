import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastrService, ToastNotification } from '../../../core/services/toastr.service';

@Component({
  selector: 'app-toastr',
  imports: [CommonModule],
  templateUrl: './toastr.component.html',
  styleUrl: './toastr.component.css'
})
export class ToastrComponent implements OnInit, OnDestroy {
  notifications: ToastNotification[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private toastrService: ToastrService) {}

  ngOnInit(): void {
    // Register this component with the service
    this.toastrService.registerComponent(this);

    // Subscribe to notifications
    this.subscription = this.toastrService.notifications$.subscribe(
      (notifications) => {
        this.notifications = notifications;
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // Remove notification manually (when user clicks close button)
  removeNotification(id: string): void {
    this.toastrService.removeNotification(id);
  }

  // Get appropriate icon for notification type
  getIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-times-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'info':
        return 'fas fa-info-circle';
      default:
        return 'fas fa-bell';
    }
  }

  // Get appropriate Bootstrap alert class
  getAlertClass(type: string): string {
    switch (type) {
      case 'success':
        return 'alert-success';
      case 'error':
        return 'alert-danger';
      case 'warning':
        return 'alert-warning';
      case 'info':
        return 'alert-info';
      default:
        return 'alert-secondary';
    }
  }

  // Get professional toast class
  getProfessionalToastClass(type: string): string {
    switch (type) {
      case 'success':
        return 'toast-type-success';
      case 'error':
        return 'toast-type-error';
      case 'warning':
        return 'toast-type-warning';
      case 'info':
        return 'toast-type-info';
      default:
        return 'toast-type-info';
    }
  }

  // Get appropriate toast class (legacy support)
  getToastClass(type: string): string {
    return this.getProfessionalToastClass(type);
  }

  // Get appropriate icon color class
  getIconColorClass(type: string): string {
    switch (type) {
      case 'success':
        return 'text-success';
      case 'error':
        return 'text-danger';
      case 'warning':
        return 'text-warning';
      case 'info':
        return 'text-info';
      default:
        return 'text-secondary';
    }
  }

  // Get type label
  getTypeLabel(type: string): string {
    switch (type) {
      case 'success':
        return 'Success';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Info';
      default:
        return 'Notification';
    }
  }

  // Get time ago
  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const seconds = Math.floor(diff / 1000);

    if (seconds < 60) {
      return 'just now';
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}m ago`;
    } else {
      const hours = Math.floor(seconds / 3600);
      return `${hours}h ago`;
    }
  }

  // TrackBy function for better performance
  trackByFn(index: number, item: ToastNotification): string {
    return item.id;
  }
}
