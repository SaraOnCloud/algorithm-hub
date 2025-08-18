import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressService, ProgressSummary } from '../../core/progress/progress.service';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-progress',
  imports: [CommonModule, RouterLink],
  template: `
    <h2>Tu progreso</h2>
    <div *ngIf="loading">Cargando...</div>
    <div *ngIf="!loading">
      <p>
        Aprendidos: <strong>{{ summary?.learned || 0 }}</strong> / {{ summary?.total || 0 }}
        ({{ summary?.percent || 0 }}%)
      </p>
      <h3>Algoritmos aprendidos</h3>
      <ul>
        <li *ngFor="let a of learned">
          <a [routerLink]="['/algorithms', a.slug]">{{ a.name }}</a>
        </li>
      </ul>
      <p *ngIf="learned.length === 0">Aún no has marcado algoritmos como aprendidos.</p>
    </div>
  `,
})
export class ProgressComponent implements OnInit {
  private progress = inject(ProgressService);

  summary: ProgressSummary | null = null;
  learned: { slug: string; name: string }[] = [];
  loading = true;

  ngOnInit() {
    this.loading = true;
    this.progress.getSummary().subscribe((s) => (this.summary = s));
    this.progress.getLearned().subscribe((l) => {
      this.learned = l.learned as any;
      this.loading = false;
    });
  }
}

