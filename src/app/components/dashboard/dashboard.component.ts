// src/app/components/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { User } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <nav>
        <h1>Mi Dashboard</h1>
        <div class="user-info">
          <span *ngIf="user">Hola, {{ user.firstName }} {{ user.lastName }}</span>
          <button (click)="logout()">Cerrar Sesión</button>
        </div>
      </nav>
      
      <div class="content">
        <div class="card">
          <h3>Bienvenido</h3>
          <p>Email: {{ user?.email }}</p>
          <p>Roles: {{ user?.roles?.join(', ') }}</p>
        </div>
        
        <!-- Mostrar solo si es Admin -->
        <div class="card admin-only" *ngIf="isAdmin">
          <h3>Panel de Administración</h3>
          <p>Solo visible para administradores</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    nav { display: flex; justify-content: space-between; align-items: center; padding: 20px; background: #333; color: white; }
    .user-info { display: flex; align-items: center; gap: 15px; }
    button { padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .content { padding: 30px; }
    .card { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .admin-only { border-left: 4px solid #28a745; }
  `]
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  isAdmin = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      this.isAdmin = user?.roles.includes('Admin') ?? false;
    });
  }

  logout(): void {
    this.authService.logout();
  }
}