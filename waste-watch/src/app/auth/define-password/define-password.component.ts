import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // Import HttpClient for API calls
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule], // Add FormsModule and CommonModule
  templateUrl: './define-password.component.html',
  styleUrls: ['./define-password.component.css'],
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  @ViewChild('backgroundVideo') backgroundVideo!: ElementRef<HTMLVideoElement>;

  email = '';
  password = '';
  confirmPassword = '';
  currentImage = 'assets/images/login_image5.jpeg'; // Use only login_image5.jpeg

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    // Slow down the video playback rate
    if (this.backgroundVideo) {
      this.backgroundVideo.nativeElement.playbackRate = 0.5; // Half the normal speed
    }
  }

  ngOnDestroy() {}

  // On form submission
  onResetPassword() {
    // Check if the passwords match before proceeding
    if (this.password !== this.confirmPassword) {
      console.error('Passwords do not match!');
      return;
    }

    // Prepare the data to send to the backend
    const resetData = {
      email: this.email,
      newPassword: this.password
    };

    // Make the API call to reset the password
    this.http.post('https://localhost:7259/api/auth/reset-password', resetData)
      .subscribe({
        next: (response) => {
          console.log('Password reset successfully:', response);
          this.router.navigate(['/login']); // Redirect to login after password reset
        },
        error: (error) => {
          console.error('Password reset failed', error);
          if (error.status === 404) {
            console.error('Endpoint not found');
          } else {
            console.error(`Error: ${error.message}`);
          }
        }
      });
  }

  // Navigation to the login page
  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
