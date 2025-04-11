import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/AuthService';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule,TranslateModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = '';
  password = '';
  currentImage = 'assets/images/login_image3.png';
  errorMessage = ''; // Display login errors
  isLoading = false; // Prevent multiple login attempts
  passwordVisible = false; // Password visibility flag

  constructor(private router: Router, private authService: AuthService) {
    this.checkAuthState();
  }

  /**
   * Checks if the user is already authenticated.
   * If authenticated, redirects based on roles.
   */
  private checkAuthState() {
    this.authService.checkAuthState().subscribe({
      next: (response) => {
        if (response?.user?.roles) {
          console.log('✅ User is already authenticated:', response.user);
          this.handleNavigation(response.user.roles);
        } else {
          console.log('🚫 No authenticated user found.');
        }
      },
      error: (error) => {
        if (error.status === 401) {
          console.log('🔑 User not authenticated, showing login page.');
        } else {
          console.error('⚠️ Error checking authentication state:', error);
        }
      },
    });
  }

  /**
   * Handles the login form submission.
   */
  onLogin() {
    this.errorMessage = ''; // Clear previous messages

    // Basic validation for email and password
    if (!this.email || !this.password) {
      this.errorMessage = '⚠️ Email and password are required.';
      return; // Prevent submission if fields are empty
    }

    this.isLoading = true; // Show loading state

    // Call login service to attempt login
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('✅ Login successful:', response);
        this.isLoading = false;

        // Check for valid response format (ensure response has user roles)
        if (!response?.user?.roles) {
          console.error('❌ Invalid response format:', response);
          this.errorMessage = '⚠️ Unexpected server response. Please try again.';
          return;
        }

        // Handle navigation based on user roles
        this.handleNavigation(response.user.roles);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Login failed:', error);

        // Handle different error scenarios
        this.handleLoginError(error);
      },
    });
  }

  /**
   * Handles login errors based on the status code.
   */
  private handleLoginError(error: any) {
    if (error.status === 401) {
      // Invalid credentials (wrong email/password)
      this.errorMessage = '❌ Invalid email or password. Please try again.';
    } else if (error.status === 400) {
      // Bad Request - could be missing fields or invalid format
      this.errorMessage = '⚠️ Bad request. Please ensure your input is valid.';
    } else if (error.status === 500) {
      // Internal server error (backend issue)
      this.errorMessage = '⚠️ Server error. Please try again later.';
    } else if (error.status === 0) {
      // Network or connectivity issue
      this.errorMessage = '⚠️ Network error. Please check your internet connection.';
    } else {
      // Any other unknown error
      this.errorMessage = '⚠️ An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Navigates to the appropriate route based on the user's roles.
   */
  private handleNavigation(roles: string[]) {
    const normalizedRoles = roles.map((role) => role.trim().toLowerCase());
    console.log('📌 User roles:', normalizedRoles);

    if (normalizedRoles.includes('admin')) {
      this.router.navigate(['/register-user']);
    } else if (normalizedRoles.includes('bin manager')) {
      this.router.navigate(['/bin-dashboard']);
    } else if (normalizedRoles.includes('fleet manager')) {
      this.router.navigate(['/fleet-dashboard']);
    } else {
      console.warn('⚠️ Unknown role, redirecting to reset password.');
      this.router.navigate(['/reset-password']);
    }
  }

  /**
   * Navigates to the reset password page.
   */
  navigateToResetPassword() {
    this.router.navigate(['/reset-password']);
  }
}
