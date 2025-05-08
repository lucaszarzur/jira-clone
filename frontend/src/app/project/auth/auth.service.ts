import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JUser } from '@trungk18/interface/user';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { AuthStore } from './auth.store';
import { environment } from 'src/environments/environment';
import { LoginPayload } from '@trungk18/project/auth/loginPayload';
import { Router } from '@angular/router';

export interface AuthResponse extends JUser {
  token: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl: string;
  private tokenKey = 'jira_auth_token';

  constructor(
    private _http: HttpClient,
    private _store: AuthStore,
    private _router: Router
  ) {
    this.baseUrl = environment.apiUrl;
    this.checkToken();
  }

  // Check if token exists in localStorage and validate it
  private checkToken(): void {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      this.getCurrentUser().subscribe();
    }
  }

  // Get authentication token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Save token to localStorage
  private saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Remove token from localStorage
  private removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  // Login with email and password
  login({ email, password }: LoginPayload): Observable<AuthResponse> {
    this._store.setLoading(true);

    return this._http
      .post<AuthResponse>(`${this.baseUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          // Save token
          this.saveToken(response.token);

          // Update store with user data
          this._store.update(state => ({
            ...state,
            ...response
          }));
        }),
        finalize(() => {
          this._store.setLoading(false);
        }),
        catchError(err => {
          this._store.setError(err);
          return of(err);
        })
      );
  }

  // Register new user
  register(payload: RegisterPayload): Observable<AuthResponse> {
    this._store.setLoading(true);

    return this._http
      .post<AuthResponse>(`${this.baseUrl}/auth/register`, payload)
      .pipe(
        tap(response => {
          // Save token
          this.saveToken(response.token);

          // Update store with user data
          this._store.update(state => ({
            ...state,
            ...response
          }));
        }),
        finalize(() => {
          this._store.setLoading(false);
        }),
        catchError(err => {
          this._store.setError(err);
          return of(err);
        })
      );
  }

  // Get current user data
  getCurrentUser(): Observable<JUser> {
    this._store.setLoading(true);

    return this._http
      .get<JUser>(`${this.baseUrl}/auth/me`)
      .pipe(
        tap(user => {
          this._store.update(state => ({
            ...state,
            ...user
          }));
        }),
        finalize(() => {
          this._store.setLoading(false);
        }),
        catchError(err => {
          // If error, logout
          this.logout();
          return of(null);
        })
      );
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Logout user
  logout(): void {
    // Remove token
    this.removeToken();

    // Reset store
    this._store.reset();

    // Redirect to login page
    this._router.navigate(['/login']);
  }

  // Change password
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this._http.post(`${this.baseUrl}/auth/change-password`, {
      currentPassword,
      newPassword
    });
  }
}


