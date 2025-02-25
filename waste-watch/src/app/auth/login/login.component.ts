import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { CommonModule } from '@angular/common'; // Import CommonModule

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

  constructor(private router: Router, private http: HttpClient) {}

  onLogin() {
    const loginData = { email: this.email, password: this.password };

    this.http.post('https://localhost:7259/api/auth/login', loginData).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        this.router.navigate(['/vehicle-list']);
      },
      error: (error) => {
        console.error('Login failed', error);
      }
    });
  }

  navigateToResetPassword() {
    this.router.navigate(['/reset-password']);
  }
}
