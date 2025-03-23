import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // Import HttpClient for API calls
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule], // Add FormsModule and CommonModule
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  @ViewChild('backgroundVideo') backgroundVideo!: ElementRef<HTMLVideoElement>;

  email = '';
  currentImage = 'assets/images/login_image5.jpeg'; // Use only login_image5.jpeg
  errorMessage: string | null = null; // To store error message

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    // Slow down the video playback rate
    if (this.backgroundVideo) {
      this.backgroundVideo.nativeElement.playbackRate = 0.5; // Half the normal speed
    }
  }

  ngOnDestroy() {}

  onResetPassword() {
    const resetData = { email: this.email };

    this.http.post('https://localhost:7259/api/auth/forgot-password', resetData)
      .subscribe({
        next: (response) => {
          console.log('Password reset email sent successfully:', response);
          this.router.navigate(['/login']); // Redirect to login after password reset
        },
        error: (error) => {
          console.error('Password reset failed', error);

          // Handle specific errors
          if (error.status === 404) {
            this.errorMessage = 'Email not found. Please check the email address and try again.';
          } else if (error.status === 400) {
            this.errorMessage = 'Please check your email and try again.';
          } else {
            this.errorMessage = `Error: ${error.message}`; // General error message
          }
        }
      });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
