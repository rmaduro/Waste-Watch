import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/AuthService'; // Import the AuthService
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-register-user',
  standalone: true,
  imports: [CommonModule, FormsModule,TranslateModule],
  templateUrl: './register-user-component.html',
  styleUrls: ['./register-user-component.css'],
})
export class RegisterUserComponent implements OnInit {
  email = '';
  password = '';
  confirmPassword = '';
  role = '';
  currentImage = 'assets/images/login_image3.png';
  message: string = ''; // Variable to hold the success or error message
  messageType: string = ''; // This will hold the class based on success or failure

  constructor(
    private router: Router,
    private authService: AuthService // Inject the AuthService
  ) {}

  ngOnInit() {
    // Check the current user's session info when the component is loaded
    this.authService.checkAuthState().subscribe({
      next: (response) => {
        if (response?.user) {
          console.log('✅ Current user session info:', response.user);
        } else {
          console.log('🚫 No authenticated user found.');
          this.navigateToLogin();
        }
      },
      error: (error) => {
        console.error('⚠️ Error checking authentication state:', error);
        this.navigateToLogin();
      },
    });
  }

  /**
   * Handles user registration.
   */
  onRegister() {
    if (this.password !== this.confirmPassword) {
      console.error('❌ Passwords do not match');
      this.message = 'Passwords do not match!';
      this.messageType = 'alert-danger'; // Set message type to danger
      return;
    }

    const registerData = {
      email: this.email.trim(),
      password: this.password,
      role: this.role.trim(),
    };

    console.log('📤 Sending Registration Data:', registerData);

    this.authService.register(registerData).subscribe({
      next: (response: any) => {
        console.log('✅ Registration Successful:', response);
        this.message = 'User registered successfully!'; // Set the success message
        this.messageType = 'alert-success'; // Set message type to success
      },
      error: (error) => {
        console.error('❌ Registration failed:', error);

        // Handle different error scenarios
        if (error.error && Array.isArray(error.error)) {
          // If backend returns an array of errors
          this.message = error.error
            .map((err: any) => err.message)
            .join('\n');
          this.messageType = 'alert-danger'; // Set message type to danger
        } else if (error.error && error.error.message) {
          // If backend returns a single error message
          if (error.error.message.includes('already exists')) {
            this.message = '⚠️ A user with this email already exists!';
            this.messageType = 'alert-danger'; // Set message type to danger
          } else {
            this.message = `⚠️ Registration failed: ${error.error.message}`;
            this.messageType = 'alert-danger'; // Set message type to danger
          }
        } else {
          this.message = '⚠️ Registration failed. Please try again.';
          this.messageType = 'alert-danger'; // Set message type to danger
        }
      },
    });
  }

  /**
   * Logs out the current user.
   */
  logout() {
    const userEmail = this.authService.getCurrentUser()?.email; // Replace with logic to get email

    if (!userEmail) {
      console.error('❌ No user email found for logout.');
      return;
    }

    this.authService.logout(userEmail).subscribe({
      next: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userEmail');

        this.authService.checkAuthState().subscribe({
          next: (response) => {
            if (!response?.user) {
              console.log('✅ Logged out successfully.');
              this.router.navigate(['/login']);
            } else {
              console.log(
                '⚠️ Logout failed, user still active:',
                response.user
              );
            }
          },
          error: (error) => {
            console.error('⚠️ Error verifying logout:', error);
          },
        });
      },
      error: (error) => {
        console.error('❌ Logout failed:', error);
      },
    });
  }

  /**
   * Redirects to the login page.
   */
  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
