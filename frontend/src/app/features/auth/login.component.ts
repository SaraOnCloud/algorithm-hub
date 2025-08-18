import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { UICardComponent } from '../../ui/card.component';
import { UIInputComponent } from '../../ui/input.component';
import { UIButtonComponent } from '../../ui/button.component';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, UICardComponent, UIInputComponent, UIButtonComponent],
  template: `
    <div class="min-h-[70vh] flex items-center justify-center">
      <div class="w-full max-w-md">
        <ui-card title="Iniciar sesión" [hasActions]="true">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <ui-input label="Email" type="email" autoComplete="email" formControlName="email" placeholder="tucorreo@dominio.com" />
            <ui-input label="Contraseña" type="password" autoComplete="current-password" formControlName="password" placeholder="••••••••" />
            <p *ngIf="error" class="text-sm text-red-600">{{ error }}</p>
            <div class="card-actions flex items-center justify-between">
              <a routerLink="/auth/register" class="text-sm text-gray-600 hover:text-gray-900">Crear cuenta</a>
              <ui-button type="submit" [loading]="loading">Entrar</ui-button>
            </div>
          </form>
        </ui-card>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;
  error = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    this.auth
      .login(this.form.getRawValue() as any)
      .subscribe({
        next: () => this.router.navigate(['/progress']),
        error: (err) => {
          this.error = err?.error?.message || 'Error al iniciar sesión';
          this.loading = false;
        },
      });
  }
}
