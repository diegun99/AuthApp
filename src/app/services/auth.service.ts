// src/app/services/auth.service.ts
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface AuthResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  token: string;
  expiresAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private router: Router
  ) {
    // Al iniciar, verificar si hay token guardado (solo en el navegador)
    if (this.isBrowser) {
      this.loadUserFromStorage();
    }
  }

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // ═══════════════════════════════════════════════════════
  // REGISTRO
  // ═══════════════════════════════════════════════════════
  register(data: { email: string; password: string; firstName: string; lastName: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  // ═══════════════════════════════════════════════════════
  // LOGIN CON EMAIL/PASSWORD
  // ═══════════════════════════════════════════════════════
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          this.setSession(response);
          this.currentUserSubject.next({
            id: response.id,
            email: response.email,
            firstName: response.firstName,
            lastName: response.lastName,
            roles: response.roles
          });
        })
      );
  }

  // ═══════════════════════════════════════════════════════
  // LOGIN CON GOOGLE
  // ═══════════════════════════════════════════════════════
  loginWithGoogle(): void {
    if (!this.isBrowser) return;
    // Redirigimos al backend, que redirige a Google
    window.location.href = `${this.apiUrl}/google-login`;
  }

  // ═══════════════════════════════════════════════════════
  // MANEJAR CALLBACK DE GOOGLE
  // ═══════════════════════════════════════════════════════
  handleGoogleCallback(token: string): void {
    // Guardar token y obtener datos del usuario
    localStorage.setItem('token', token);
    this.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUserSubject.next(user);
        this.router.navigate(['/dashboard']);
      },
      error: () => this.logout()
    });
  }

  // ═══════════════════════════════════════════════════════
  // OBTENER USUARIO ACTUAL
  // ═══════════════════════════════════════════════════════
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  // ═══════════════════════════════════════════════════════
  // LOGOUT
  // ═══════════════════════════════════════════════════════
  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // ═══════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════
  isAuthenticated(): boolean {
    if (!this.isBrowser) return false;

    const token = localStorage.getItem('token');
    if (!token) return false;
    
    // Verificar si el token no ha expirado
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.roles.includes(role) ?? false;
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('token');
  }

  private setSession(authResult: AuthResponse): void {
    localStorage.setItem('token', authResult.token);
    localStorage.setItem('expires_at', authResult.expiresAt);
  }

  private loadUserFromStorage(): void {
    if (this.isAuthenticated()) {
      this.getCurrentUser().subscribe({
        next: (user) => this.currentUserSubject.next(user),
        error: () => this.logout()
      });
    }
  }
}