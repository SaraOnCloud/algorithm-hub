import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AlgorithmsService, Algorithm } from '../../core/algorithms/algorithms.service';
import { ProgressService } from '../../core/progress/progress.service';
import { AuthService } from '../../core/auth/auth.service';
import { map } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-algorithm-detail',
  imports: [CommonModule, RouterLink],
  template: `
    <a routerLink="/algorithms">← Volver</a>
    <div *ngIf="loading">Cargando...</div>
    <div *ngIf="algo">
      <h2>{{ algo.name }}</h2>
      <p><strong>Slug:</strong> {{ algo.slug }}</p>
      <p><strong>Categoría:</strong> {{ algo.category }} · <strong>Dificultad:</strong> {{ algo.difficulty }}</p>
      <p>{{ algo.description }}</p>
      <button *ngIf="auth.isAuthenticated" (click)="toggle()" [disabled]="toggling">
        {{ learned ? 'Desmarcar' : 'Marcar como aprendido' }}
      </button>
    </div>
  `,
})
export class AlgorithmDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private algos = inject(AlgorithmsService);
  protected progress = inject(ProgressService);
  protected auth = inject(AuthService);

  algo: Algorithm | null = null;
  learned = false;
  toggling = false;
  loading = true;

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.algos.get(slug).subscribe({
      next: (a) => { this.algo = a; this.loading = false; },
      error: () => { this.loading = false; },
    });
    if (this.auth.isAuthenticated) {
      this.progress.getLearned().subscribe((res) => {
        this.learned = res.slugs.has(slug);
      });
    }
  }

  toggle() {
    if (!this.algo) return;
    this.toggling = true;
    const slug = this.algo.slug;
    const obs$ = this.learned
      ? this.progress.unlearn(slug)
      : this.progress.learn(slug).pipe(map(() => void 0));
    obs$.subscribe({
      next: () => { this.learned = !this.learned; this.toggling = false; },
      error: () => { this.toggling = false; },
    });
  }
}
