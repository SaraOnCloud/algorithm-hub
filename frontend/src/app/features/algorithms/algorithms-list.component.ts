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
    <div class="space-y-8">
      <!-- Header Section -->
      <div class="text-center space-y-4">
        <h1 class="text-4xl font-bold text-gray-900 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          🧠 Algoritmos de Programación
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Explora y aprende los algoritmos más importantes de la ciencia de la computación
        </p>
      </div>

      <!-- Filters Section -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">🔍 Buscar algoritmo</label>
            <input 
              type="text" 
              [(ngModel)]="search" 
              placeholder="Buscar por nombre..." 
              (ngModelChange)="refresh()" 
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          </div>
          <div class="sm:w-64">
            <label class="block text-sm font-medium text-gray-700 mb-2">📂 Categoría</label>
            <select 
              [(ngModel)]="category" 
              (change)="refresh()"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            >
              <option value="">Todas las categorías</option>
              <option value="sorting">🔄 Ordenamiento</option>
              <option value="search">🔍 Búsqueda</option>
              <option value="graph">🕸️ Grafos</option>
              <option value="dp">⚡ Programación Dinámica</option>
              <option value="string">📝 Cadenas</option>
              <option value="greedy">🎯 Algoritmos Voraces</option>
              <option value="tree">🌳 Árboles</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex justify-center py-12">
        <div class="flex items-center space-x-3">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span class="text-lg text-gray-600">Cargando algoritmos...</span>
        </div>
      </div>

      <!-- Algorithms Grid -->
      <div *ngIf="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let a of items" class="group">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-primary-300 transition-all duration-300 overflow-hidden">
            <!-- Card Header -->
            <div class="p-6 pb-4">
              <div class="flex items-start justify-between mb-3">
                <h3 class="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {{ a.name }}
                </h3>
                <div *ngIf="auth.isAuthenticated && isLearned(a.slug)" class="text-green-500">
                  ✅
                </div>
              </div>
              
              <!-- Badges -->
              <div class="flex flex-wrap gap-2 mb-4">
                <span [class]="getCategoryBadgeClass(a.category)">
                  {{ getCategoryIcon(a.category) }} {{ getCategoryName(a.category) }}
                </span>
                <span [class]="getDifficultyBadgeClass(a.difficulty)">
                  {{ getDifficultyIcon(a.difficulty) }} {{ getDifficultyName(a.difficulty) }}
                </span>
              </div>

              <!-- Description -->
              <p *ngIf="a.description" class="text-sm text-gray-600 mb-4 line-clamp-2">
                {{ a.description }}
              </p>
            </div>

            <!-- Card Actions -->
            <div class="px-6 pb-6 flex gap-3">
              <a 
                [routerLink]="['/algorithms', a.slug]"
                class="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-center py-2.5 px-4 rounded-lg font-medium transition-colors"
              >
                Ver Algoritmo
              </a>
              <button 
                *ngIf="auth.isAuthenticated" 
                (click)="toggle(a)" 
                [disabled]="toggling === a.slug"
                [class]="isLearned(a.slug) ? 
                  'bg-green-100 hover:bg-green-200 text-green-700 border border-green-300' : 
                  'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'"
                class="px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {{ isLearned(a.slug) ? '✅' : '📚' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && items.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">🔍</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">No se encontraron algoritmos</h3>
        <p class="text-gray-600">Intenta ajustar tus filtros de búsqueda</p>
      </div>

      <!-- Pagination -->
      <div *ngIf="total > pageSize" class="flex justify-center">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-2 flex items-center gap-2">
          <button 
            (click)="prev()" 
            [disabled]="page===1"
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>
          <span class="px-4 py-2 text-sm text-gray-600">
            Página {{ page }} de {{ totalPages }}
          </span>
          <button 
            (click)="next()" 
            [disabled]="page===totalPages"
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
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

  getCategoryBadgeClass(category: string): string {
    const baseClass = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    switch (category) {
      case 'sorting': return `${baseClass} bg-blue-100 text-blue-800`;
      case 'search': return `${baseClass} bg-green-100 text-green-800`;
      case 'graph': return `${baseClass} bg-purple-100 text-purple-800`;
      case 'dp': return `${baseClass} bg-yellow-100 text-yellow-800`;
      case 'string': return `${baseClass} bg-pink-100 text-pink-800`;
      case 'greedy': return `${baseClass} bg-orange-100 text-orange-800`;
      case 'tree': return `${baseClass} bg-emerald-100 text-emerald-800`;
      default: return `${baseClass} bg-gray-100 text-gray-800`;
    }
  }

  getDifficultyBadgeClass(difficulty: string): string {
    const baseClass = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    switch (difficulty) {
      case 'easy': return `${baseClass} bg-green-100 text-green-800`;
      case 'medium': return `${baseClass} bg-yellow-100 text-yellow-800`;
      case 'hard': return `${baseClass} bg-red-100 text-red-800`;
      default: return `${baseClass} bg-gray-100 text-gray-800`;
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'sorting': return '🔄';
      case 'search': return '🔍';
      case 'graph': return '🕸️';
      case 'dp': return '⚡';
      case 'string': return '📝';
      case 'greedy': return '🎯';
      case 'tree': return '🌳';
      default: return '📊';
    }
  }

  getCategoryName(category: string): string {
    switch (category) {
      case 'sorting': return 'Ordenamiento';
      case 'search': return 'Búsqueda';
      case 'graph': return 'Grafos';
      case 'dp': return 'Prog. Dinámica';
      case 'string': return 'Cadenas';
      case 'greedy': return 'Voraces';
      case 'tree': return 'Árboles';
      default: return category;
    }
  }

  getDifficultyIcon(difficulty: string): string {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '⚪';
    }
  }

  getDifficultyName(difficulty: string): string {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Medio';
      case 'hard': return 'Difícil';
      default: return difficulty;
    }
  }
}
