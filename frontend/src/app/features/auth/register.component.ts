import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <h2>Registro</h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <label>Nombre
        <input type="text" formControlName="name" required />
      </label>
      <label>Email
        <input type="email" formControlName="email" required />
      </label>
      <label>Contraseña
        <input type="password" formControlName="password" required minlength="8" />
      </label>
      <button type="submit" [disabled]="form.invalid || loading">Crear cuenta</button>
      <span *ngIf="error" style="color:red">{{ error }}</span>
    </form>
    <p>¿Ya tienes cuenta? <a routerLink="/auth/login">Inicia sesión</a></p>
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;
  error = '';

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    this.auth
      .register(this.form.getRawValue() as any)
      .subscribe({
        next: () => this.router.navigate(['/progress']),
        error: (err) => {
          this.error = err?.error?.message || 'Error al registrarse';
          this.loading = false;
        },
      });
  }
}

