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

    this.http.post<any>('https://localhost:7259/api/auth/login', loginData).subscribe({
      next: (response) => {
        console.log('✅ Login successful', response);

        if (response && response.token) {
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('userInfo', JSON.stringify(response)); // Save full user info

          // Store user data for display
          this.loggedInUser = response;

          console.log('🛠️ Full Logged-in User Data:', this.loggedInUser);

          // Redirect user based on role
          this.redirectUserByRole(response.role);
        }
      },
      error: (error) => {
        console.error('❌ Login failed', error);
      }
    });
  }

  redirectUserByRole(role: string) {
    if (role === 'Admin') {
      this.router.navigate(['/register-user']);
    } else if (role === 'Bin Manager') {
      this.router.navigate(['/bin-list']);
    } else if (role === 'Fleet Manager') {
      this.router.navigate(['/vehicle-list']);
    } else {
      console.warn('Role not recognized, redirecting to reset password');
      this.router.navigate(['/reset-password']);
    }
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
