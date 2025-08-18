import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface ProgressSummary {
  learned: number;
  total: number;
  percent: number;
}

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl;

  getSummary(): Observable<ProgressSummary> {
    return this.http.get<ProgressSummary>(`${this.base}/me/progress`);
  }

  getLearned(): Observable<{ learned: { slug: string; name: string }[]; slugs: Set<string> }> {
    return this.http.get<{ learned: any[] }>(`${this.base}/me/algorithms`).pipe(
      map((res) => ({ learned: res.learned, slugs: new Set(res.learned.map((a) => a.slug as string)) })),
    );
  }

  learn(slug: string): Observable<{ slug: string; learnedAt: string }> {
    return this.http.post<{ slug: string; learnedAt: string }>(`${this.base}/me/algorithms/${slug}/learn`, {});
  }

  unlearn(slug: string) {
    return this.http.delete<void>(`${this.base}/me/algorithms/${slug}/learn`);
  }
}

