// src/app/components/auth-callback/auth-callback.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: `<div class="loading">Procesando autenticación...</div>`,
  styles: [`.loading { text-align: center; padding: 50px; font-size: 18px; }`]
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Google redirige con ?token=xxx en la URL
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.authService.handleGoogleCallback(token);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}