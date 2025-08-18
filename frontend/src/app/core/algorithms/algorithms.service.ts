import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface Algorithm {
  id: number;
  slug: string;
  name: string;
  category: 'sorting' | 'search' | 'graph' | 'dp' | 'string' | 'greedy' | 'tree';
  difficulty: 'easy' | 'medium' | 'hard';
  description?: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class AlgorithmsService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/algorithms`;

  list(params: { search?: string; category?: string; page?: number; pageSize?: number } = {}): Observable<PagedResult<Algorithm>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') httpParams = httpParams.set(k, String(v));
    });
    return this.http.get<PagedResult<Algorithm>>(this.base, { params: httpParams });
  }

  get(slug: string): Observable<Algorithm> {
    return this.http.get<Algorithm>(`${this.base}/${slug}`);
  }
}

