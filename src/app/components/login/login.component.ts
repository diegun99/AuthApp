// src/app/components/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <h2>Iniciar Sesión</h2>
      
      <form (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Email</label>
          <input type="email" [(ngModel)]="email" name="email" required>
        </div>
        
        <div class="form-group">
          <label>Contraseña</label>
          <input type="password" [(ngModel)]="password" name="password" required>
        </div>
        
        <button type="submit" [disabled]="loading">
          {{ loading ? 'Cargando...' : 'Ingresar' }}
        </button>
        
        <div *ngIf="error" class="error">{{ error }}</div>
      </form>
      
      <div class="divider">o</div>
      
      <button class="google-btn" (click)="loginWithGoogle()">
        <img src="assets/google-icon.svg" alt="Google">
        Continuar con Google
      </button>
      
      <p>¿No tienes cuenta? <a routerLink="/register">Regístrate</a></p>
    </div>
  `,
  styles: [`
    .auth-container { max-width: 400px; margin: 50px auto; padding: 30px; }
    .form-group { margin-bottom: 15px; }
    input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
    button { width: 100%; padding: 12px; background: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .google-btn { background: white; color: #333; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 10px; }
    .error { color: red; margin-top: 10px; }
    .divider { text-align: center; margin: 20px 0; color: #999; }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.loading = true;
    this.error = '';
    
    this.authService.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error = err.error?.message || 'Error al iniciar sesión';
        this.loading = false;
      }
    });
  }

  loginWithGoogle(): void {
    this.authService.loginWithGoogle();
  }
}