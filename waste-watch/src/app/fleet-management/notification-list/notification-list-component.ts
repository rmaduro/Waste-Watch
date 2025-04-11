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
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  isRead: boolean;
  referenceId?: number;
}

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, SideNavComponent,TranslateModule],
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
  currentPage = 1;
  pageSize = 4;
  showDetailsModal = false;
  currentNotificationDetails: Notification | null = null;

  currentLanguage = 'en';
  currentLanguageFlag = 'gb';
  currentLanguageName = 'English';
  languageOptions = [
    { code: 'en', flag: 'gb', name: 'English' },
    { code: 'es', flag: 'es', name: 'Español' },
    { code: 'de', flag: 'de', name: 'Deutsch' },
    { code: 'pt', flag: 'pt', name: 'Português' },
    { code: 'fr', flag: 'fr', name: 'Français' },
  ];

  constructor(private vehicleService: VehicleService, private translate: TranslateService) {
    const savedLang = localStorage.getItem('userLanguage') || 'en';
    this.changeLanguage(savedLang);
    }

  ngOnInit(): void {
    this.loadNotifications();
  }

  changeLanguage(langCode: string) {
    const selectedLang = this.languageOptions.find((l) => l.code === langCode);
    if (selectedLang) {
      this.currentLanguage = selectedLang.code;
      this.currentLanguageFlag = selectedLang.flag;
      this.currentLanguageName = selectedLang.name;
      this.translate.use(langCode);
      // Optional: Save to localStorage
      localStorage.setItem('userLanguage', langCode);
    }
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


  get filteredNotifications() {
    return this.notifications.filter(notification => {
      const matchesType = !this.selectedType || notification.type === this.selectedType;

      return matchesType;
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

  async clearAllNotifications() {
    if (this.notifications.length === 0) return;

    this.isLoading = true;
    const notificationIds = this.notifications.map(n => n.id);
    const successfullyDeleted: number[] = [];

    try {
      for (const id of notificationIds) {
        try {
          await this.vehicleService.deleteFleetNotification(id).toPromise();
          successfullyDeleted.push(id);
        } catch (error) {
          console.error(`Error deleting notification ${id}:`, error);
        }
      }

      this.notifications = this.notifications.filter(
        n => !successfullyDeleted.includes(n.id)
      );

      if (successfullyDeleted.length !== notificationIds.length) {
        this.error = `Deleted ${successfullyDeleted.length} of ${notificationIds.length} notifications. Some could not be deleted.`;
      } else {
        this.selectedNotification = null;
      }
    } catch (error) {
      console.error('Error during deletion process:', error);
      this.error = 'Error occurred while deleting notifications.';
    } finally {
      this.isLoading = false;
    }
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
