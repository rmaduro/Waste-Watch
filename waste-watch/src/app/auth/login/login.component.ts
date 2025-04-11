import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/AuthService';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = '';
  password = '';
  currentImage = 'assets/images/login_image3.png';
  errorMessage = '';
  isLoading = false;
  passwordVisible = false;
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
  ) {
    translate.setDefaultLang('en');
    translate.use('en');
    this.checkAuthState();
  }

  ngOnInit() {
    const savedLang = localStorage.getItem('userLanguage') || 'en';
    this.changeLanguage(savedLang);
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  private checkAuthState() {
    this.authService.checkAuthState().subscribe({
      next: (response) => {
        if (response?.user?.roles) {
          this.handleNavigation(response.user.roles);
        }
      },
      error: (error) => {
        if (error.status !== 401) {
          this.errorMessage = 'Error checking authentication state';
        }
      },
    });
  }

  onLogin() {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Email and password are required';
      return;
    }

    this.isLoading = true;

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (!response?.user?.roles) {
          this.errorMessage = 'Unexpected server response';
          return;
        }

        this.handleNavigation(response.user.roles);
      },
      error: (error) => {
        this.isLoading = false;
        this.handleLoginError(error);
      },
    });
  }

  private handleLoginError(error: any) {
    if (error.status === 401) {
      this.errorMessage = 'Invalid email or password';
    } else if (error.status === 400) {
      this.errorMessage = 'Invalid input format';
    } else if (error.status === 500) {
      this.errorMessage = 'Server error';
    } else if (error.status === 0) {
      this.errorMessage = 'Network connection error';
    } else {
      this.errorMessage = 'An unexpected error occurred';
    }
  }

  private handleNavigation(roles: string[]) {
    const normalizedRoles = roles.map((role) => role.trim().toLowerCase());

    if (normalizedRoles.includes('admin')) {
      this.router.navigate(['/register-user']);
    } else if (normalizedRoles.includes('bin manager')) {
      this.router.navigate(['/bin-dashboard']);
    } else if (normalizedRoles.includes('fleet manager')) {
      this.router.navigate(['/fleet-dashboard']);
    } else {
      this.router.navigate(['/reset-password']);
    }
  }

  navigateToResetPassword() {
    this.router.navigate(['/reset-password']);
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
}
