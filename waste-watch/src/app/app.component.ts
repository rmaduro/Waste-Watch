import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SideNavComponent } from './components/side-nav/side-nav.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrash, faTruck, faSignOutAlt, faMap } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SideNavComponent, FontAwesomeModule],
  template: `
    <div class="d-flex">
      <app-side-nav *ngIf="isLoggedIn"></app-side-nav>
      <div class="flex-grow-1">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
})
export class AppComponent {
  isLoggedIn = false;

  // FontAwesome Icons
  faTrash = faTrash;
  faTruck = faTruck;
  faSignOutAlt = faSignOutAlt;
  faMap = faMap;
}
