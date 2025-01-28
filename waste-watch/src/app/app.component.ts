import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SideNavComponent } from './components/side-nav/side-nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SideNavComponent],
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
}
