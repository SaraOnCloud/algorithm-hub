import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50/50 to-white dark:from-gray-950 dark:to-gray-900 py-10 px-4">
      <div class="w-full max-w-5xl grid md:grid-cols-2 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-card bg-white dark:bg-gray-900">
        <!-- Left panel / illustration -->
        <div class="hidden md:flex flex-col justify-center gap-4 p-10 bg-gradient-to-br from-primary-600 to-primary-400 text-white">
            <h2 class="text-3xl font-bold leading-tight">Algorithm Hub</h2>
            <p class="text-white/90">Learn, visualize and practice algorithms with interactive experiences.</p>
            <ul class="space-y-2 text-white/90 text-sm">
              @for (feat of features; track feat) {
                <li class="flex items-center gap-2"><span class="inline-block h-1.5 w-1.5 rounded-full bg-white"></span> {{ feat }}</li>
              }
            </ul>
        </div>

        <!-- Right panel / form -->
        <div class="p-6 sm:p-10">
          <div class="mb-6 text-center md:text-left">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Sign in</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400">Enter your credentials to continue</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                formControlName="email"
                placeholder="you@example.com"
                autocomplete="email"
                autofocus
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              />
              @if (form.get('email')?.touched && form.get('email')?.invalid) {
                <p class="mt-1 text-xs text-red-600">
                  @if (form.get('email')?.errors?.['required']) { <span>Email is required.</span> }
                  @if (form.get('email')?.errors?.['email']) { <span>Enter a valid email.</span> }
                </p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                type="password"
                formControlName="password"
                placeholder="••••••••"
                autocomplete="current-password"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              />
              @if (form.get('password')?.touched && form.get('password')?.invalid) {
                <p class="mt-1 text-xs text-red-600">
                  @if (form.get('password')?.errors?.['required']) { <span>Password is required.</span> }
                  @if (form.get('password')?.errors?.['minlength']) { <span>Minimum 8 characters.</span> }
                </p>
              }
            </div>

            @if (error) {
              <div class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{{ error }}</div>
            }

            <div class="mt-6 flex items-center justify-between">
              <a routerLink="/auth/register" class="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">Create account</a>
              <button
                type="submit"
                [disabled]="form.invalid || loading"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                @if (loading) {
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                }
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;
  error = '';
  features = [
    'Animated visualizations',
    'Saved progress & achievements',
    'Curated interview-oriented content',
  ];

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';
    this.auth
      .login(this.form.getRawValue() as any)
      .subscribe({
        next: () => this.router.navigate(['/progress']),
        error: (err) => {
          const status = err?.status;
          if (status === 404) this.error = 'Service unavailable. Ensure backend is running at http://localhost:3000/api/v1.';
          else if (status === 401) this.error = 'Invalid credentials. Check your email and password.';
            else if (status === 422) this.error = 'Invalid data. Review the information.';
          else this.error = err?.error?.message || 'Login error';
          this.loading = false;
        },
      });
  }
}
