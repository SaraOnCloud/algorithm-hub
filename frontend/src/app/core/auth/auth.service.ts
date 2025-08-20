import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private userSubject = new BehaviorSubject<User | null>(this.loadUser());
  user$ = this.userSubject.asObservable();

  get token(): string | null {
    return localStorage.getItem('ah_token');
  }

  get isAuthenticated(): boolean {
    return !!this.token;
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem('ah_user');
    return raw ? (JSON.parse(raw) as User) : null;
  }

  private setSession(resp: AuthResponse) {
    localStorage.setItem('ah_token', resp.accessToken);
    localStorage.setItem('ah_user', JSON.stringify(resp.user));
    this.userSubject.next(resp.user);
  }

  logout() {
    localStorage.removeItem('ah_token');
    localStorage.removeItem('ah_user');
    this.userSubject.next(null);
  }

  register(payload: { email: string; password: string; name: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiBaseUrl}/auth/register`, payload)
      .pipe(tap((resp) => this.setSession(resp)));
  }

  login(payload: { email: string; password: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiBaseUrl}/auth/login`, payload)
      .pipe(tap((resp) => this.setSession(resp)));
  }
}
