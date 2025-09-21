import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoginRequest, AuthResponse } from '../models/auth.model';
import { User } from '../models/user.model';

export type { LoginRequest };

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check if user is already logged in on app initialization
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getAccessToken();
    const user = this.getCurrentUser();

    if (token && user) {
      this.currentUserSubject.next(user);
      this.isLoggedInSubject.next(true);
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          this.setTokens(response.accessToken, response.refreshToken);
          this.setCurrentUser(response.user);
          this.currentUserSubject.next(response.user);
          this.isLoggedInSubject.next(true);
        })
      );
  }

  refreshToken(): Observable<{ accessToken: string }> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<{ accessToken: string }>(`${this.apiUrl}/refresh`, { refreshToken })
      .pipe(
        tap(response => {
          this.setAccessToken(response.accessToken);
        })
      );
  }

  logout(): void {
    this.clearTokens();
    this.clearCurrentUser();
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private setAccessToken(accessToken: string): void {
    localStorage.setItem('accessToken', accessToken);
  }

  private setCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  private clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  private clearCurrentUser(): void {
    localStorage.removeItem('currentUser');
  }
}
