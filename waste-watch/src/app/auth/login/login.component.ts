import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../service/AuthService'; // Import the AuthService

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = '';
  password = '';
  currentImage = 'assets/images/login_image3.png';
  errorMessage = ''; // To display login errors to the user

  constructor(
    private router: Router,
    private authService: AuthService // Inject the AuthService
  ) {
    // Check if user is already authenticated on component init
    this.checkAuthState();
  }

  /**
   * Checks if the user is already authenticated.
   * If authenticated, redirects to the appropriate route based on roles.
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
      }
    });
  }

  /**
   * Handles the login form submission.
   */
  onLogin() {
    this.errorMessage = ''; // Clear previous error messages

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('✅ Login successful:', response);

        if (!response?.user?.roles) {
          console.error('❌ Invalid response format or missing roles:', response);
          this.errorMessage = 'Invalid response from server. Please try again.';
          return;
        }

        this.handleNavigation(response.user.roles);
      },
      error: (error) => {
        console.error('❌ Login failed:', error);
        this.errorMessage = 'Invalid email or password. Please try again.';
      }
    });
  }

  /**
   * Navigates to the appropriate route based on the user's roles.
   * @param roles - The roles assigned to the user.
   */
  private handleNavigation(roles: string[]) {
    const normalizedRoles = roles.map(role => role.trim().toLowerCase());
    console.log('📌 User roles:', normalizedRoles);

    if (normalizedRoles.includes('admin')) {
      this.router.navigate(['/register-user']); // Only Admin can register users
    } else if (normalizedRoles.includes('bin manager')) {
      this.router.navigate(['/bin-dashboard']); // Redirect Bin Manager
    } else if (normalizedRoles.includes('fleet manager')) {
      this.router.navigate(['/fleet-dashboard']); // Redirect Fleet Manager
    } else {
      console.warn('⚠️ User has no recognized role, redirecting to reset password.');
      this.router.navigate(['/reset-password']); // Default fallback
    }
  }

  /**
   * Navigates to the reset password page.
   */
  navigateToResetPassword() {
    this.router.navigate(['/reset-password']);
  }
}
