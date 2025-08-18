import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlgorithmsService, Algorithm, PagedResult } from '../../core/algorithms/algorithms.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProgressService } from '../../core/progress/progress.service';
import { AuthService } from '../../core/auth/auth.service';
import { map } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-algorithms-list',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <h2>Algoritmos</h2>
    <div class="filters">
      <input type="text" [(ngModel)]="search" placeholder="Buscar..." (ngModelChange)="refresh()" />
      <select [(ngModel)]="category" (change)="refresh()">
        <option value="">Todas las categorías</option>
        <option value="sorting">Sorting</option>
        <option value="search">Search</option>
        <option value="graph">Graph</option>
        <option value="dp">DP</option>
        <option value="string">String</option>
        <option value="greedy">Greedy</option>
        <option value="tree">Tree</option>
      </select>
    </div>

    <div *ngIf="loading">Cargando...</div>

    <ul>
      <li *ngFor="let a of items">
        <a [routerLink]="['/algorithms', a.slug]">{{ a.name }}</a>
        <small>({{ a.category }} · {{ a.difficulty }})</small>
        <button *ngIf="auth.isAuthenticated" (click)="toggle(a)" [disabled]="toggling === a.slug">
          {{ isLearned(a.slug) ? 'Desmarcar' : 'Aprendido' }}
        </button>
      </li>
    </ul>

    <div class="pager" *ngIf="total > pageSize">
      <button (click)="prev()" [disabled]="page===1">Anterior</button>
      <span>Página {{ page }} / {{ totalPages }}</span>
      <button (click)="next()" [disabled]="page===totalPages">Siguiente</button>
    </div>
  `,
  styles: [
    `
      .filters { display: flex; gap: .5rem; margin: .5rem 0; }
      ul { list-style: none; padding: 0; }
      li { margin: .25rem 0; }
      .pager { display:flex; gap:.5rem; align-items:center; }
    `,
  ],
})
export class AlgorithmsListComponent implements OnInit {
  private algos = inject(AlgorithmsService);
  protected progress = inject(ProgressService);
  protected auth = inject(AuthService);

  items: Algorithm[] = [];
  total = 0;
  page = 1;
  pageSize = 10;
  search = '';
  category = '';
  loading = false;
  toggling: string | null = null;
  learnedSlugs = new Set<string>();

  get totalPages() { return Math.max(1, Math.ceil(this.total / this.pageSize)); }

  ngOnInit() {
    if (this.auth.isAuthenticated) {
      this.progress.getLearned().subscribe((res) => (this.learnedSlugs = res.slugs));
    }
    this.refresh();
  }

  isLearned(slug: string) { return this.learnedSlugs.has(slug); }

  refresh() {
    this.loading = true;
    this.algos.list({ search: this.search, category: this.category || undefined, page: this.page, pageSize: this.pageSize }).subscribe({
      next: (res: PagedResult<Algorithm>) => {
        this.items = res.items; this.total = res.total; this.page = res.page; this.pageSize = res.pageSize; this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  prev() { if (this.page > 1) { this.page--; this.refresh(); } }
  next() { if (this.page < this.totalPages) { this.page++; this.refresh(); } }

  toggle(a: Algorithm) {
    if (!this.auth.isAuthenticated) return;
    this.toggling = a.slug;
    const obs$ = this.isLearned(a.slug)
      ? this.progress.unlearn(a.slug)
      : this.progress.learn(a.slug).pipe(map(() => void 0));
    obs$.subscribe({
      next: () => {
        if (this.isLearned(a.slug)) this.learnedSlugs.delete(a.slug); else this.learnedSlugs.add(a.slug);
        this.toggling = null;
      },
      error: () => { this.toggling = null; },
    });
  }
}
