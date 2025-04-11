import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  @ViewChild('backgroundVideo') backgroundVideo!: ElementRef<HTMLVideoElement>;

  email = '';
  currentImage = 'assets/images/login_image5.jpeg';
  errorMessage: string | null = null;
  currentLanguage = 'en';
  currentLanguageFlag = 'gb';
  currentLanguageName = 'English';
  languageOptions = [
    { code: 'en', flag: 'gb', name: 'English' },
    { code: 'es', flag: 'es', name: 'Español' },
    { code: 'de', flag: 'de', name: 'Deutsch' },
    { code: 'pt', flag: 'pt', name: 'Português' },
    { code: 'fr', flag: 'fr', name: 'Français' },
  ];

  constructor(
    private router: Router,
    private http: HttpClient,
    private translate: TranslateService
  ) {}

  ngOnInit() {
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
    const resetData = { email: this.email };

    this.http.post('https://waste-watch.azurewebsites.net/api/auth/forgot-password', resetData)
      .subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (error) => {
          if (error.status === 404) {
            this.errorMessage = 'Email not found. Please check the email address and try again.';
          } else if (error.status === 400) {
            this.errorMessage = 'Please check your email and try again.';
          } else {
            this.errorMessage = 'An error occurred. Please try again later.';
          }
        }
      });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
