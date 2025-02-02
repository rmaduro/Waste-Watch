import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrash, faTruck, faSignOutAlt, faMap } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  template: `
    <div class="sidebar">
      <div class="logo-container">
        <img src="assets/images/logo2.png" alt="WasteWatch Logo" class="logo">
        <span class="logo-text">WasteWatch</span>
      </div>

      <ul class="nav flex-column">
        <ng-container *ngFor="let item of navItems">
          <li class="nav-item" [ngClass]="{ 'mt-auto': item.logout }">
            <a class="nav-link"
               [routerLink]="item.route"
               routerLinkActive="active"
               (click)="item.logout ? logout() : null">
              <fa-icon [icon]="item.icon"></fa-icon>
              <span class="link-text">{{ item.label }}</span>
            </a>
          </li>
        </ng-container>
      </ul>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 70px;
      min-height: 100vh;
      background-color: rgb(255, 255, 255);
      transition: width 0.3s ease-in-out;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      padding-top: 10px;
      border-right: 2px solid #dcdcdc;
    }

    .sidebar:hover {
      width: 200px;
    }

    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px 0;
      margin-bottom: 20px;
      transition: all 0.3s ease-in-out;
    }

    .logo {
      width: 40px;
      height: 40px;
      transition: all 0.3s ease-in;
      object-fit: contain;
    }

    .logo-text {
      display: none;
      margin-left: 10px;
      color: #000;
      font-size: 14px;
      white-space: nowrap;
    }

    .nav {
      width: 100%;
      padding: 0;
      margin: 0;
      list-style: none;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .nav-item {
      width: 100%;
    }

    .nav-link {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 50px;
      color: #000 !important;
      text-decoration: none;
      transition: all 0.3s ease-in-out;
      padding: 0;
    }

    .nav-link fa-icon {
      font-size: 20px;
      color: #18b420;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .link-text {
      display: none;
      margin-left: 10px;
      white-space: nowrap;
    }

    .sidebar:hover .logo-container {
      justify-content: flex-start;
      padding-left: 15px;
    }

    .sidebar:hover .logo-text,
    .sidebar:hover .link-text {
      display: block;
    }

    .sidebar:hover .nav-link {
      justify-content: flex-start;
      padding-left: 25px;
    }

    .nav-link.active {
      background-color: rgba(24, 180, 32, 0.1);
    }

    .nav-item.mt-auto {
      margin-top: auto;
      margin-bottom: 20px;
    }
  `]
})
export class SideNavComponent {
  faTrash = faTrash;
  faTruck = faTruck;
  faSignOutAlt = faSignOutAlt;
  faMap = faMap;

  // Define an array of navigation items for easier management and scalability
  navItems = [
    {
      label: 'Bin Management',
      route: '/bin-dashboard',
      icon: this.faTrash,
      logout: false
    },
    {
      label: 'Fleet Management',
      route: '/fleet-dashboard',
      icon: this.faTruck,
      logout: false
    },
    {
      label: 'Map',
      route: '/map',
      icon: this.faMap,
      logout: false
    },
    {
      label: 'Logout',
      route: '',
      icon: this.faSignOutAlt,
      logout: true
    }
  ];

  logout() {
    // Implement logout logic
  }
}
