import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

interface LoginResponse {
  message: string;
  user: {
    email: string;
    userName: string;
    roles: string[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private userRolesSubject = new BehaviorSubject<string[]>([]);
  private currentUserSubject = new BehaviorSubject<{ email: string; userName: string; roles: string[] } | null>(null);

  // Observable streams for components to subscribe to
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  userRoles$ = this.userRolesSubject.asObservable();
  currentUser$ = this.currentUserSubject.asObservable();

  private apiUrl = 'https://localhost:7259/api/auth';

  constructor(private http: HttpClient, private router: Router) {
    // Check authentication state when the service is instantiated
    this.checkAuthState().subscribe();
  }

  /**
   * Checks the current authentication state by calling the `/current-user` endpoint.
   * Updates the authentication state, user roles, and current user info based on the response.
   */
  checkAuthState(): Observable<LoginResponse | null> {
    return this.http.get<LoginResponse>(`${this.apiUrl}/current-user`, {
      withCredentials: true, // Ensures cookies are sent with the request
    }).pipe(
      tap((response) => {
        if (response?.user) {
          this.setAuthState(true, response.user.roles, response.user);
          console.log('Current user session info:', response.user); // Log the current user's session info
        } else {
          this.setAuthState(false, [], null);
        }
      }),
      catchError((error) => {
        this.setAuthState(false, [], null);
        console.error('Error checking authentication state:', error);
        return of(null); // Return null if there's an error
      })
    );
  }

  /**
   * Logs in the user by calling the `/login` endpoint.
   * Updates the authentication state, user roles, and current user info if successful.
   */
  login(email: string, password: string): Observable<LoginResponse> {
    const loginData = { email, password };

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, loginData, {
      withCredentials: true, // Ensures cookies are sent/received
    }).pipe(
      tap((response) => {
        if (response?.user?.roles) {
          this.setAuthState(true, response.user.roles, response.user);
        }
      })
    );
  }

  /**
   * Resets the user's password by calling the `/reset-password` endpoint.
   */
  resetPassword(resetData: {
    email: string;
    token: string;
    newPassword: string;
    confirmPassword: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, resetData, {
      withCredentials: true, // Ensures cookies are sent with the request
    });
  }

  /**
   * Registers a new user by calling the `/register` endpoint.
   */
  register(registerData: { email: string; password: string; role: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, registerData, {
      headers: { 'Content-Type': 'application/json' }, // Ensure JSON format
      withCredentials: true,
    }).pipe(
      tap((response) => console.log('✅ Registration Response:', response)),
      catchError((error) => {
        console.error('❌ Registration Error:', error);
        return of(error);
      })
    );
  }

  /**
   * Logs out the user by calling the `/logout` endpoint.
   * Clears the authentication state, user roles, and current user info.
   */
  logout(email: string): Observable<any> {
    return this.http.post(
      'https://localhost:7259/api/auth/logout',
      { email },
      { withCredentials: true, responseType: 'text' } // Ensure cookies are sent
    ).pipe(
      tap(() => {
        console.log('Logout request sent for user:', email);
        // Clear client-side state
        this.setAuthState(false, [], null);
      }),
      catchError((error) => {
        console.error('Logout failed:', error);
        throw error;
      })
    );
  }


  /**
   * Updates the authentication state, user roles, and current user info.
   * @param isAuthenticated - Whether the user is authenticated.
   * @param roles - The roles assigned to the user.
   * @param user - The current user's info (email, username, roles).
   */
  private setAuthState(
    isAuthenticated: boolean,
    roles: string[],
    user: { email: string; userName: string; roles: string[] } | null
  ): void {
    this.isAuthenticatedSubject.next(isAuthenticated);
    this.userRolesSubject.next(roles);
    this.currentUserSubject.next(user);
  }

  /**
   * Returns the current authentication state.
   */
  getIsAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Returns the current user roles.
   */
  getUserRoles(): string[] {
    return this.userRolesSubject.value;
  }

  /**
   * Returns the current user's info.
   */
  getCurrentUser(): { email: string; userName: string; roles: string[] } | null {
    return this.currentUserSubject.value;
  }

}
