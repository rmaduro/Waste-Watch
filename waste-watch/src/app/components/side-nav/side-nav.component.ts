import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-dark text-white" style="width: 250px; min-height: 100vh;">
      <div class="p-3">
        <img src="assets/logo.png" alt="WasteWatch Logo" class="img-fluid mb-4">
        <ul class="nav flex-column">
          <li class="nav-item">
            <a class="nav-link text-white" routerLink="/bin-dashboard" routerLinkActive="active">
              <i class="bi bi-trash"></i> Bin Management
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link text-white" routerLink="/fleet-dashboard" routerLinkActive="active">
              <i class="bi bi-truck"></i> Fleet Management
            </a>
          </li>
          <li class="nav-item mt-auto">
            <a class="nav-link text-white" (click)="logout()">
              <i class="bi bi-box-arrow-right"></i> Logout
            </a>
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .nav-link.active {
      background-color: rgba(255,255,255,0.1);
    }
  `]
})
export class SideNavComponent {
  logout() {
    // Implement logout logic
  }
}
