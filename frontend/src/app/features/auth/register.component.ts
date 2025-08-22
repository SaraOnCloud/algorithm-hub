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
    <section class="min-h-screen flex items-center justify-center py-10 px-4">
      <div class="w-full max-w-5xl grid md:grid-cols-2 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-card bg-white dark:bg-gray-900">
        <!-- Left panel / illustration -->
        <div class="hidden md:flex flex-col justify-center gap-4 p-10 bg-[#030e29] text-white">
          <h2 class="text-3xl font-bold text-white leading-tight">Join Algorithm Hub</h2>
          <p class="text-white/90">Create your account and start your algorithm learning journey.</p>
          <ul class="space-y-2 text-white/90 text-sm">
            @for (feat of features; track feat) {
              <li class="flex items-center gap-2"><span class="inline-block h-1.5 w-1.5 rounded-full bg-white"></span> {{ feat }}</li>
            }
          </ul>
        </div>

        <!-- Right panel / form -->
        <div class="p-6 sm:p-10">
          <div class="mb-6 text-center md:text-left">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Create account</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400">Fill in your details to begin</p>
          </div>

          @if (successMessage) {
            <div class="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 mb-5">
              {{ successMessage }}<br />
              <span class="block mt-2">You can close this tab after verifying, then <a routerLink="/auth/login" class="underline font-medium">sign in</a>.</span>
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4" *ngIf="!successMessage">
             <div>
               <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full name</label>
               <input
                 type="text"
                 formControlName="name"
                 placeholder="Your full name"
                 autocomplete="name"
                 autofocus
                 class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
               />
               @if (form.get('name')?.touched && form.get('name')?.invalid) {
                 <p class="mt-1 text-xs text-red-600">
                   @if (form.get('name')?.errors?.['required']) { <span>Name is required.</span> }
                   @if (form.get('name')?.errors?.['minlength']) { <span>Minimum 2 characters.</span> }
                 </p>
               }
             </div>

             <div>
               <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
               <input
                 type="email"
                 formControlName="email"
                 placeholder="you@example.com"
                 autocomplete="email"
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
                 autocomplete="new-password"
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
               <a routerLink="/auth/login" class="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">Already have an account?</a>
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
                 Create account
               </button>
             </div>
           </form>
        </div>
      </div>
    </section>
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;
  error = '';
  successMessage = '';
  features = [
    'Full access to visualizations',
    'Progress tracking',
    'Developer community',
  ];

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true; this.error = '';
    this.auth.register(this.form.getRawValue() as any).subscribe({
      next: (resp) => {
        this.successMessage = resp.message || 'Account created. Check your inbox to verify your email.';
        this.loading = false;
        this.form.disable();
      },
      error: (err) => {
        const status = err?.status;
        if (status === 404) this.error = 'Service unavailable.';
        else if (status === 409) this.error = 'This email is already registered.';
        else this.error = err?.error?.message || 'Registration error';
        this.loading = false;
      }
    });
  }
}
