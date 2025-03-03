import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

  loggedInUser: any = {};

  constructor(private router: Router, private http: HttpClient) {}

  onLogin() {
    const loginData = { email: this.email, password: this.password };
    console.log('Sending login request with data:', loginData); // Debug

    this.http.post<any>('https://localhost:7259/api/auth/login', loginData).subscribe({
      next: (response) => {
        console.log('✅ Login successful');
        console.log('Full response:', response); // Log the entire response to ensure it has user and roles

        // Check if response and roles are defined before accessing them
        if (!response || !response.user || !response.user.roles) {
          console.error('❌ Invalid response format or missing roles:', response);
          return; // Exit early if roles are missing
        }

        console.log('Response roles:', response.user.roles); // Debug roles

        // Store token and user data in localStorage
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userInfo', JSON.stringify(response));
        localStorage.setItem('userRoles', JSON.stringify(response.user.roles || []));

        console.log('Stored authToken:', localStorage.getItem('authToken')); // Debug
        console.log('Stored userRoles:', localStorage.getItem('userRoles')); // Debug

        // Extract roles from the response
        let roles = response.user.roles || [];
        console.log('📌 Original roles from response:', roles); // Debug roles

        // Check if roles exist before trying to normalize
        if (!roles || roles.length === 0) {
          console.error('❌ No roles found in response:', roles);
          return;
        }

        // Normalize roles (trim and convert to lowercase)
        roles = roles.map((role: string) => {
          const normalizedRole = role.trim().toLowerCase();
          console.log(`📌 Normalized role: '${role}' -> '${normalizedRole}'`); // Debug each role normalization
          return normalizedRole;
        });
        console.log('📌 Normalized roles:', roles); // Debug normalized roles

        // Check if normalized roles array is populated correctly
        if (!roles.length) {
          console.warn('⚠️ No roles found after normalization');
        }

        // Debug: Check exact role comparison
        console.log('Checking for "admin" in normalized roles:', roles.includes('admin')); // Debug
        console.log('Checking if roles include "admin":', roles); // Debug

        // Redirect based on roles
        if (roles.includes('admin')) { // Check for lowercase 'admin'
          console.log('🟢 Redirecting to /register-user');
          this.router.navigate(['/register-user']).then((success) => {
            if (success) {
              console.log('✅ Navigation to /register-user successful');
            } else {
              console.error('❌ Navigation to /register-user failed');
            }
          }).catch(err => {
            console.error('❌ Navigation error:', err);
          });
        } else if (roles.includes('bin manager')) { // Check for lowercase 'bin manager'
          console.log('🟠 Redirecting to /bin-list');
          this.router.navigate(['/bin-list']).then((success) => {
            if (success) {
              console.log('✅ Navigation to /bin-list successful');
            } else {
              console.error('❌ Navigation to /bin-list failed');
            }
          }).catch(err => {
            console.error('❌ Navigation error:', err);
          });
        } else if (roles.includes('fleet manager')) { // Check for lowercase 'fleet manager'
          console.log('🔵 Redirecting to /vehicle-list');
          this.router.navigate(['/vehicle-list']).then((success) => {
            if (success) {
              console.log('✅ Navigation to /vehicle-list successful');
            } else {
              console.error('❌ Navigation to /vehicle-list failed');
            }
          }).catch(err => {
            console.error('❌ Navigation error:', err);
          });
        } else {
          console.warn('🔴 Role not recognized, redirecting to reset password');
          this.router.navigate(['/reset-password']).then((success) => {
            if (success) {
              console.log('✅ Navigation to /reset-password successful');
            } else {
              console.error('❌ Navigation to /reset-password failed');
            }
          }).catch(err => {
            console.error('❌ Navigation error:', err);
          });
        }
      },
      error: (error) => {
        console.error('❌ Login failed', error);
      }
    });
  }




  isLoggedIn(): boolean {
    const token = localStorage.getItem('authToken');
    return token !== null;
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    console.log('Logged out');
    this.router.navigate(['/login']);
  }

  // ✅ Add this method to fix the error
  navigateToResetPassword() {
    this.router.navigate(['/reset-password']);
  }
}
