import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-user-component.html',
  styleUrls: ['./register-user-component.css']
})
export class RegisterUserComponent {
  email = '';
  password = '';
  confirmPassword = '';
  role = '';
  currentImage = 'assets/images/login_image3.png';

  constructor(private router: Router, private http: HttpClient) {}

  onRegister() {
    if (this.password !== this.confirmPassword) {
      console.error('Passwords do not match');
      return;
    }

    const registerData = {
      email: this.email,
      password: this.password,
      role: this.role
    };
    
    this.http.post('https://localhost:7259/api/auth/register', registerData)
    .subscribe({
      next: (response: any) => {
        console.log('✅ Registration Response:', response);
        if (response && response.success) {
          console.log('🎉 Registration Successful! Redirecting to login...');
          this.router.navigate(['/login']);
        } else {
          console.warn('⚠️ API Response does not confirm success:', response);
        }
      },
      error: (error) => {
        console.error('❌ Registration failed:', error);
      }
    });

  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
