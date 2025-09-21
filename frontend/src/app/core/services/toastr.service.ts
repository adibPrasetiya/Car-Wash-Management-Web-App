import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ToastrService {
  private notificationsSubject = new BehaviorSubject<ToastNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private toastrComponent: any = null;

  constructor() { }

  // Register the ToastrComponent instance
  registerComponent(component: any): void {
    this.toastrComponent = component;
  }

  // Show success notification
  success(message: string): void {
    this.addNotification('success', message);
  }

  // Show error notification
  error(message: string): void {
    this.addNotification('error', message);
  }

  // Show info notification
  info(message: string): void {
    this.addNotification('info', message);
  }

  // Show warning notification
  warning(message: string): void {
    this.addNotification('warning', message);
  }

  // Add notification to the list
  private addNotification(type: 'success' | 'error' | 'info' | 'warning', message: string): void {
    const notification: ToastNotification = {
      id: this.generateId(),
      type,
      message,
      timestamp: new Date()
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, notification]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      this.removeNotification(notification.id);
    }, 3000);
  }

  // Remove notification by id
  removeNotification(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const filteredNotifications = currentNotifications.filter(n => n.id !== id);
    this.notificationsSubject.next(filteredNotifications);
  }

  // Generate unique id for notifications
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // Clear all notifications
  clearAll(): void {
    this.notificationsSubject.next([]);
  }
}
