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
import { AuthService } from '../../services/AuthService';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './define-password.component.html',
  styleUrls: ['./define-password.component.css'],
})
export class DefinePasswordComponent implements OnInit, OnDestroy {
  @ViewChild('backgroundVideo') backgroundVideo!: ElementRef<HTMLVideoElement>;

  email = '';
  password = '';
  confirmPassword = '';
  currentImage = 'assets/images/login_image5.jpeg';
  readonly token: string = '';

  errorMessage: string = '';
  successMessage: string = '';
  currentLanguage = 'en';
  currentLanguageFlag = 'gb';
  currentLanguageName = 'English';
  isDropdownOpen = false;
  languageOptions = [
    { code: 'en', flag: 'gb', name: 'English' },
    { code: 'es', flag: 'es', name: 'Español' },
    { code: 'de', flag: 'de', name: 'Deutsch' },
    { code: 'pt', flag: 'pt', name: 'Português' },
    { code: 'fr', flag: 'fr', name: 'Français' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.email = params['email'] || '';
      (this as any).token = params['token'] || '';
    });

    this.authService.checkAuthState().subscribe({
      error: () => {} // Silent error handling
    });

    if (this.backgroundVideo) {
      this.backgroundVideo.nativeElement.playbackRate = 0.5;
    }

    const savedLang = localStorage.getItem('userLanguage') || 'en';
    this.changeLanguage(savedLang);
  }

  changeLanguage(langCode: string) {
    const selectedLang = this.languageOptions.find((l) => l.code === langCode);
    if (selectedLang) {
      this.currentLanguage = selectedLang.code;
      this.currentLanguageFlag = selectedLang.flag;
      this.currentLanguageName = selectedLang.name;
      this.translate.use(langCode);
      localStorage.setItem('userLanguage', langCode);
    }
  }

  ngOnDestroy() {}

  onResetPassword() {
    this.clearMessages();

    if (!this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill all fields';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    const resetData = {
      email: this.email,
      token: this.token,
      newPassword: this.password,
      confirmPassword: this.confirmPassword,
    };

    this.authService.resetPassword(resetData).subscribe({
      next: () => {
        this.successMessage = 'Password reset successfully! Redirecting...';
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to reset password';
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
