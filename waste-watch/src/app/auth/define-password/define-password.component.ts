import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/AuthService'; // Import the AuthService
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule,TranslateModule],
  templateUrl: './define-password.component.html',
  styleUrls: ['./define-password.component.css'],
})
export class DefinePasswordComponent implements OnInit, OnDestroy {
  @ViewChild('backgroundVideo') backgroundVideo!: ElementRef<HTMLVideoElement>;

  email = '';
  password = '';
  confirmPassword = '';
  currentImage = 'assets/images/login_image5.jpeg';
  readonly token: string = ''; // Marking as readonly for extra security

  errorMessage: string = ''; // Error message to show in UI
  successMessage: string = ''; // Success message to show in UI

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService // Inject the AuthService
  ) {}

  ngOnInit() {
    // Get the email and token from URL
    this.route.queryParams.subscribe((params) => {
      this.email = params['email'] || ''; // Automatically fill the email field
      (this as any).token = params['token'] || ''; // Store the token internally (not shown in UI)
    });
    console.log('Token from URL:', this.token);

    // Print the current user's session info when the page is loaded
    this.authService.checkAuthState().subscribe({
      next: (response) => {
        if (response?.user) {
          console.log('Current user session info:', response.user);
        } else {
          console.log('No authenticated user found.');
        }
      },
      error: (error) => {
        console.error('Error checking authentication state:', error);
      },
    });

    if (this.backgroundVideo) {
      this.backgroundVideo.nativeElement.playbackRate = 0.5;
    }
  }

  ngOnDestroy() {}

  onResetPassword() {
    this.clearMessages();

    if (!this.password || !this.confirmPassword) {
      this.errorMessage = 'Por favor, preencha todos os campos.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'As senhas não coincidem!';
      return;
    }

    const resetData = {
      email: this.email,
      token: this.token, // Send the token without showing it
      newPassword: this.password,
      confirmPassword: this.confirmPassword, // Fixed syntax
    };

    this.authService.resetPassword(resetData).subscribe({
      next: (response) => {
        this.successMessage =
          'Senha redefinida com sucesso! Redirecionando para login...';
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message ||
          'Falha ao redefinir a senha. Tente novamente.';
      },
    });
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
