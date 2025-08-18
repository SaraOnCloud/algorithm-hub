import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'algorithms' },
  {
    path: 'auth',
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent) },
    ],
  },
  {
    path: 'algorithms',
    children: [
      { path: '', loadComponent: () => import('./features/algorithms/algorithms-list.component').then(m => m.AlgorithmsListComponent) },
      { path: ':slug', loadComponent: () => import('./features/algorithms/algorithm-detail.component').then(m => m.AlgorithmDetailComponent) },
    ],
  },
  { path: 'progress', canActivate: [authGuard], loadComponent: () => import('./features/progress/progress.component').then(m => m.ProgressComponent) },
  { path: '**', redirectTo: 'algorithms' },
];
