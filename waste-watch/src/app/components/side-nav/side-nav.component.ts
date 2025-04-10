import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrash, faTruck, faSignOutAlt, faMap, faDashboard,faBell } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../services/AuthService'; // Import AuthService

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <div class="sidebar">
      <div class="logo-container">
        <img src="assets/images/logo2.png" alt="WasteWatch Logo" class="logo">
        <span class="logo-text">WasteWatch</span>
      </div>

      <ul class="nav flex-column">
        <!-- Conditional Rendering of Fleet Manager or Bin Manager Links -->
        <li *ngIf="isFleetManager" class="nav-item">
          <a class="nav-link" (click)="navigateTo('/fleet-dashboard', $event)">
            <div class="icon-container">
              <fa-icon [icon]="faDashboard"></fa-icon>
            </div>
            <span class="link-text">Fleet Dashboard</span>
          </a>
        </li>
        <li *ngIf="isFleetManager" class="nav-item">
          <a class="nav-link" (click)="navigateTo('/vehicle-list', $event)">
            <div class="icon-container">
              <fa-icon [icon]="faTruck"></fa-icon>
            </div>
            <span class="link-text">Vehicle Roster</span>
          </a>
        </li>
        <li *ngIf="isFleetManager" class="nav-item">
          <a class="nav-link" (click)="navigateTo('/vehicle-map', $event)">
            <div class="icon-container">
              <fa-icon [icon]="faMap"></fa-icon>
            </div>
            <span class="link-text">Fleet Monitoring</span>
          </a>
        </li>
        <li *ngIf="isFleetManager" class="nav-item">
          <a class="nav-link" (click)="navigateTo('/fleet-notification-list', $event)">
            <div class="icon-container">
              <fa-icon [icon]="faBell"></fa-icon>
            </div>
            <span class="link-text">Fleet Notification List</span>
          </a>
        </li>

        <li *ngIf="isBinManager" class="nav-item">
          <a class="nav-link" (click)="navigateTo('/bin-dashboard', $event)">
            <div class="icon-container">
              <fa-icon [icon]="faDashboard"></fa-icon>
            </div>
            <span class="link-text">Bin Dashboard</span>
          </a>
        </li>
        <li *ngIf="isBinManager" class="nav-item">
          <a class="nav-link" (click)="navigateTo('/bin-list', $event)">
            <div class="icon-container">
              <fa-icon [icon]="faTrash"></fa-icon>
            </div>
            <span class="link-text">Bin List</span>
          </a>
        </li>
        <li *ngIf="isBinManager" class="nav-item">
          <a class="nav-link" (click)="navigateTo('/bin-map', $event)">
            <div class="icon-container">
              <fa-icon [icon]="faMap"></fa-icon>
            </div>
            <span class="link-text">Bin Monitoring</span>
          </a>
        </li>
        <li *ngIf="isBinManager" class="nav-item">
          <a class="nav-link" (click)="navigateTo('/bin-notification-list', $event)">
            <div class="icon-container">
              <fa-icon [icon]="faBell"></fa-icon>
            </div>
            <span class="link-text">Bin Notification List</span>
          </a>
        </li>

        <li class="nav-item mt-auto">
          <a class="nav-link logout" (click)="logout()">
            <div class="icon-container">
              <fa-icon [icon]="faSignOutAlt"></fa-icon>
            </div>
            <span class="link-text">Logout</span>
          </a>
        </li>
      </ul>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 70px;
      min-height: 100vh;
      background-color: #ffffff;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      padding-top: 16px;
      border-right: 1px solid #e5e7eb;
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
      z-index: 1000;
    }

    .sidebar:hover {
      width: 220px;
    }

    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 0 24px 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .logo {
      width: 42px;
      height: 42px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      object-fit: contain;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    }

    .logo-text {
      display: none;
      margin-left: 12px;
      color: #111827;
      font-size: 16px;
      font-weight: 600;
      white-space: nowrap;
      opacity: 0;
      transform: translateX(-10px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .nav {
      width: 100%;
      padding: 0 8px;
      margin: 0;
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
    }

    .nav-item {
      width: 100%;
      display: flex;
      justify-content: center;
    }

    .nav-link {
      display: flex;
      align-items: center;
      color: #4b5563 !important;
      text-decoration: none;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      padding: 10px;
      border-radius: 12px;
      background-color: rgba(24, 180, 32, 0.08);
      width: 44px;
      position: relative;
      overflow: hidden;
    }

    .nav-link:hover {
      background-color: rgba(24, 180, 32, 0.15);
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(24, 180, 32, 0.1);
    }

    .nav-link:active {
      transform: translateY(0);
    }

    .icon-container {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .nav-link fa-icon {
      font-size: 18px;
      color: #16a34a;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .link-text {
      display: none;
      margin-left: 12px;
      font-size: 14px;
      font-weight: 500;
      white-space: nowrap;
      opacity: 0;
      transform: translateX(-10px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Hover states */
    .sidebar:hover {
      width: 220px;
    }

    .sidebar:hover .logo-container {
      justify-content: flex-start;
      padding-left: 16px;
    }

    .sidebar:hover .logo-text,
    .sidebar:hover .link-text {
      display: block;
      opacity: 1;
      transform: translateX(0);
    }

    .sidebar:hover .nav-link {
      width: 100%;
      padding: 10px 14px;
    }

    /* Active state */
    .nav-link.active {
      background-color: rgba(24, 180, 32, 0.15);
      box-shadow: 0 2px 4px rgba(24, 180, 32, 0.1);
    }

    .nav-link.active fa-icon {
      color: #15803d;
    }

    /* Logout styling */
    .nav-item.mt-auto {
      margin-top: auto;
      margin-bottom: 16px;
    }

    .nav-link.logout {
      background-color: rgba(239, 68, 68, 0.08);
    }

    .nav-link.logout:hover {
      background-color: rgba(239, 68, 68, 0.15);
      box-shadow: 0 2px 4px rgba(239, 68, 68, 0.1);
    }

    .nav-link.logout fa-icon {
      color: #ef4444;
    }
  `]
})
export class SideNavComponent implements OnInit {
  faTrash = faTrash;
  faTruck = faTruck;
  faSignOutAlt = faSignOutAlt;
  faMap = faMap;
  faDashboard = faDashboard;
  faBell = faBell;

  isFleetManager = false;
  isBinManager = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Check the user roles on initialization
    this.authService.userRoles$.subscribe(roles => {
      this.isFleetManager = roles.includes('Fleet Manager');
      this.isBinManager = roles.includes('Bin Manager');
    });
  }

  // Programmatic navigation with console log
  navigateTo(route: string, event: Event) {
    event.preventDefault(); // Prevent default anchor tag behavior
    console.log(`Navigating to ${route}`);
    this.router.navigate([route]);
  }

  // Logout with console log
  logout() {
    console.log('Logging out...');
    const user = this.authService.getCurrentUser();
    if (user) {
      this.authService.logout(user.email).subscribe(() => {
        console.log('Logout successful, redirecting to login page');
        this.router.navigate(['/login']);  // Redirect to login page
      }, error => {
        console.error('Logout failed', error); // Log error if logout fails
      });
    }
  }
}
