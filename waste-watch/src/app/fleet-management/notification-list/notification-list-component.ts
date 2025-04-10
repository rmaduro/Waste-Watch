import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBell,
  faFilter,
  faCheck,
  faTimes,
  faExclamationTriangle,
  faInfoCircle,
  faSpinner,
  faCalendarAlt,
  faTrash,
  faEye,
  faClose
} from '@fortawesome/free-solid-svg-icons';
import { SideNavComponent } from '../../components/side-nav/side-nav.component';
import { VehicleService } from '../../services/FleetService';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  isRead: boolean;
  referenceId?: number;
  priority: 'low' | 'medium' | 'high';
}

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, SideNavComponent],
  templateUrl: './notification-list-component.html',
  styleUrls: ['./notification-list-component.css']
})
export class FleetNotificationListComponent implements OnInit {
  faBell = faBell;
  faFilter = faFilter;
  faCheck = faCheck;
  faTimes = faTimes;
  faExclamationTriangle = faExclamationTriangle;
  faInfoCircle = faInfoCircle;
  faSpinner = faSpinner;
  faCalendarAlt = faCalendarAlt;
  faTrash = faTrash;
  faEye = faEye;
  faClose = faClose;

  notifications: Notification[] = [];
  selectedNotification: Notification | null = null;
  isLoading = false;
  error = '';
  selectedType = '';
  selectedPriority = '';
  selectedStatus = '';
  currentPage = 1;
  pageSize = 5;
  showDetailsModal = false;
  currentNotificationDetails: Notification | null = null;

  constructor(private vehicleService: VehicleService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications() {
    this.isLoading = true;
    this.error = '';

    this.vehicleService.getFleetNotifications().pipe(
      catchError(error => {
        console.error('Error loading notifications:', error);
        this.error = 'Failed to load notifications. Please try again later.';
        return of([]);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe((response: any) => {
      this.notifications = response.map((item: any) => ({
        id: item.id,
        title: item.title || 'Notification',
        message: item.message || '',
        type: this.mapNotificationType(item.type),
        timestamp: new Date(item.createdAt),
        isRead: item.isRead || false,
        referenceId: item.referenceId,
        priority: this.mapNotificationPriority(item.priority)
      }));
    });
  }

  private mapNotificationType(type: string): 'info' | 'warning' | 'error' | 'success' {
    switch (type?.toLowerCase()) {
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'success': return 'success';
      default: return 'info';
    }
  }

  private mapNotificationPriority(priority: string): 'low' | 'medium' | 'high' {
    switch (priority?.toLowerCase()) {
      case 'high': return 'high';
      case 'medium': return 'medium';
      default: return 'low';
    }
  }

  get filteredNotifications() {
    return this.notifications.filter(notification => {
      const matchesType = !this.selectedType || notification.type === this.selectedType;
      const matchesPriority = !this.selectedPriority || notification.priority === this.selectedPriority;
      const matchesStatus = !this.selectedStatus ||
        (this.selectedStatus === 'read' ? notification.isRead : !notification.isRead);

      return matchesType && matchesPriority && matchesStatus;
    });
  }

  get paginatedNotifications() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredNotifications.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredNotifications.length / this.pageSize);
  }

  get hasUnreadNotifications(): boolean {
    return this.notifications.some(notification => !notification.isRead);
  }

  getNotificationIcon(type: string) {
    switch (type) {
      case 'info': return this.faInfoCircle;
      case 'warning': return this.faExclamationTriangle;
      case 'error': return this.faTimes;
      case 'success': return this.faCheck;
      default: return this.faInfoCircle;
    }
  }

  selectNotification(notification: Notification) {
    this.selectedNotification = notification;
  }

  markAsRead(notification: Notification) {
    notification.isRead = true;
  }

  markAllAsRead() {
    this.notifications.forEach(notification => notification.isRead = true);
  }

  clearAllNotifications() {
    this.notifications = [];
    this.selectedNotification = null;
  }

  viewDetails(notification: Notification) {
    this.currentNotificationDetails = notification;
    this.showDetailsModal = true;
  }

  closeModal() {
    this.showDetailsModal = false;
    this.currentNotificationDetails = null;
  }

  onFilterChange() {
    this.currentPage = 1;
  }

  nextPage() {
    if (this.currentPage * this.pageSize < this.filteredNotifications.length) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}
