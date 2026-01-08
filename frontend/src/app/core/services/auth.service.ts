import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<AuthUser | null>;
  public currentUser: Observable<AuthUser | null>;
  private baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.apiUrl;
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<AuthUser | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
    console.log('AuthService initialized, current user:', this.currentUserValue);
  }

  public get currentUserValue(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  public get token(): string | null {
    return this.currentUserValue?.token || null;
  }

  login(email: string, password: string): Observable<AuthUser> {
    console.log('Logging in with:', email);
    return this.http.post<AuthUser>(`${this.baseUrl}/auth/login`, { email, password })
      .pipe(
        tap(user => {
          console.log('Login successful:', user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }


  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
