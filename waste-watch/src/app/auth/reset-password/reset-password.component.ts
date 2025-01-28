import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(private router: Router) {}

  ngOnInit() {
    // Slow down the video playback rate
    if (this.backgroundVideo) {
      this.backgroundVideo.nativeElement.playbackRate = 0.5; // Half the normal speed
    }
  }

  ngOnDestroy() {}

  onResetPassword() {
    // Perform reset password logic
    console.log('Reset password requested for email:', this.email);
    this.router.navigate(['/login']); // Redirect to login after reset
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
