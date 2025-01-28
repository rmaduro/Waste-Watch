import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule], // Add FormsModule here
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = '';
  password = '';
  currentImage = 'assets/images/login_image3.png';

  constructor(private router: Router) {}

  onLogin() {
    this.router.navigate(['/bin-dashboard']);
  }

  navigateToResetPassword() {
    this.router.navigate(['/reset-password']);
  }
}
