import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/AuthService';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-register-user',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './register-user-component.html',
  styleUrls: ['./register-user-component.css'],
})
export class RegisterUserComponent implements OnInit {
  email = '';
  password = '';
  confirmPassword = '';
  role = '';
  currentImage = 'assets/images/login_image3.png';
  message: string = '';
  messageType: string = '';
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
    private router: Router,
    private authService: AuthService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.authService.checkAuthState().subscribe({
      next: (response) => {
        if (!response?.user) {
          this.navigateToLogin();
        }
      },
      error: () => {
        this.navigateToLogin();
      },
    });

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

  onRegister() {
    if (this.password !== this.confirmPassword) {
      this.message = 'Passwords do not match!';
      this.messageType = 'alert-danger';
      return;
    }

    const registerData = {
      email: this.email.trim(),
      password: this.password,
      role: this.role.trim(),
    };

    this.authService.register(registerData).subscribe({
      next: () => {
        this.message = 'User registered successfully!';
        this.messageType = 'alert-success';
      },
      error: (error) => {
        if (error.error && Array.isArray(error.error)) {
          this.message = error.error
            .map((err: any) => err.message)
            .join('\n');
          this.messageType = 'alert-danger';
        } else if (error.error && error.error.message) {
          if (error.error.message.includes('already exists')) {
            this.message = 'A user with this email already exists!';
          } else {
            this.message = `Registration failed: ${error.error.message}`;
          }
          this.messageType = 'alert-danger';
        } else {
          this.message = 'Registration failed. Please try again.';
          this.messageType = 'alert-danger';
        }
      },
    });
  }

  logout() {
    const userEmail = this.authService.getCurrentUser()?.email;

    if (!userEmail) {
      return;
    }

    this.authService.logout(userEmail).subscribe({
      next: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userEmail');

        this.authService.checkAuthState().subscribe({
          next: (response) => {
            if (!response?.user) {
              this.router.navigate(['/login']);
            }
          },
          error: () => {}
        });
      },
      error: () => {}
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
