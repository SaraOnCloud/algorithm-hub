import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UICardComponent } from '../../../ui/card.component';
import { UIButtonComponent } from '../../../ui/button.component';

interface NodeV {
  id: string;
  x: number;
  y: number;
}
interface EdgeV {
  from: string;
  to: string;
  weight: number;
}

type Phase = 'relax' | 'checkNeg' | 'done';

@Component({
  standalone: true,
  selector: 'ah-bellman-ford',
  imports: [CommonModule, RouterLink, FormsModule, UICardComponent, UIButtonComponent],
  templateUrl: './bellman-ford.component.html',
})
export class BellmanFordComponent implements OnDestroy {
  // Grafo base
  nodes: NodeV[] = [];
  edges: EdgeV[] = [];

  // Estado del algoritmo
  sourceId = 'A';
  dist: Record<string, number> = {};
  prev: Record<string, string | null> = {};

  iter = 0; // iteración actual (0..V-2)
  edgeIndex = 0; // índice de arista dentro de la iteración
  totalIterations = 0; // V-1
  phase: Phase = 'relax';

  running = false;
  finished = false;
  negativeCycle = false;

  // Visual
  currentEdge: EdgeV | null = null;
  lastUpdateNode: string | null = null;
  lastMessage = '';

  // Control reproducción
  speedMultiplier = 1; // 0.25..2
  private baseMs = 800;
  private timer: any = null;

  constructor() {
    this.initDefaultGraph();
    this.reset();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  // --- Inicialización ---
  initDefaultGraph() {
    // Pentágono + algunas diagonales con un peso negativo para ilustrar
    const cx = 260, cy = 200, r = 140;
    const ids = ['A', 'B', 'C', 'D', 'E'];
    this.nodes = ids.map((id, i) => {
      const ang = (Math.PI * 2 * i) / ids.length - Math.PI / 2;
      return { id, x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang) };
    });

    this.edges = [
      { from: 'A', to: 'B', weight: 6 },
      { from: 'A', to: 'D', weight: 7 },
      { from: 'B', to: 'C', weight: 5 },
      { from: 'B', to: 'D', weight: 8 },
      { from: 'B', to: 'E', weight: -4 },
      { from: 'C', to: 'B', weight: -2 },
      { from: 'D', to: 'C', weight: -3 },
      { from: 'D', to: 'E', weight: 9 },
      { from: 'E', to: 'A', weight: 2 },
      { from: 'E', to: 'C', weight: 7 },
    ];

    this.totalIterations = this.nodes.length - 1;
  }

  reset() {
    this.stopTimer();
    this.dist = Object.fromEntries(this.nodes.map(n => [n.id, Infinity]));
    this.prev = Object.fromEntries(this.nodes.map(n => [n.id, null]));
    this.dist[this.sourceId] = 0;

    this.iter = 0;
    this.edgeIndex = 0;
    this.phase = 'relax';

    this.currentEdge = null;
    this.lastUpdateNode = null;
    this.lastMessage = 'Lista para empezar. Pulsa Reproducir o Paso.';

    this.finished = false;
    this.negativeCycle = false;
    this.running = false;
  }

  setSource(id: string) {
    this.sourceId = id;
    this.reset();
  }

  randomizeWeights() {
    // Aleatoriza pesos entre -5..9 para mostrar casos variados
    this.edges = this.edges.map(e => ({ ...e, weight: this.randInt(-5, 9) }));
    this.reset();
  }

  // --- Reproducción ---
  play() {
    if (this.finished) return;
    if (!this.running) {
      this.running = true;
      this.timer = setInterval(() => this.step(), this.currentDelay());
    }
  }
  pause() {
    this.running = false;
    this.stopTimer();
  }
  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  currentDelay() {
    const mult = Math.min(2, Math.max(0.25, this.speedMultiplier || 1));
    return this.baseMs / mult;
  }
  onSpeedChange() {
    if (this.running) {
      // Reinicia el intervalo con la nueva velocidad
      this.stopTimer();
      this.timer = setInterval(() => this.step(), this.currentDelay());
    }
  }

  // --- Algoritmo paso a paso ---
  step() {
    if (this.finished) return;

    if (this.phase === 'relax') {
      const e = this.edges[this.edgeIndex];
      this.currentEdge = e;
      const du = this.dist[e.from];
      const dv = this.dist[e.to];
      if (du + e.weight < dv) {
        this.dist[e.to] = du + e.weight;
        this.prev[e.to] = e.from;
        this.lastUpdateNode = e.to;
        this.lastMessage = `Relax: ${e.from} → ${e.to} mejora dist(${e.to}) = ${this.formatDist(this.dist[e.to])}`;
        // Limpia el highlight suavemente
        setTimeout(() => { if (this.lastUpdateNode === e.to) this.lastUpdateNode = null; }, 900);
      } else {
        this.lastMessage = `No mejora con ${e.from} → ${e.to}`;
      }

      // Avanza
      this.edgeIndex++;
      if (this.edgeIndex >= this.edges.length) {
        this.edgeIndex = 0;
        this.iter++;
        if (this.iter >= this.totalIterations) {
          // Pasamos a chequeo de ciclo negativo
          this.phase = 'checkNeg';
          this.lastMessage = 'Comprobando ciclos negativos…';
        }
      }
    } else if (this.phase === 'checkNeg') {
      const e = this.edges[this.edgeIndex];
      this.currentEdge = e;
      const du = this.dist[e.from];
      const dv = this.dist[e.to];
      if (du + e.weight < dv) {
        this.negativeCycle = true;
        this.finished = true;
        this.lastMessage = `Se detectó ciclo negativo vía ${e.from} → ${e.to}`;
        this.pause();
        return;
      }
      this.edgeIndex++;
      if (this.edgeIndex >= this.edges.length) {
        this.finished = true;
        this.lastMessage = 'Completado. No hay ciclos negativos.';
        this.pause();
      }
    }
  }

  // --- Utilidades ---
  getNode(id: string) { return this.nodes.find(n => n.id === id)!; }
  formatDist(v: number) { return Number.isFinite(v) ? v : '∞'; }
  randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  // Geometría para SVG
  edgePoints(e: EdgeV) {
    const u = this.getNode(e.from);
    const v = this.getNode(e.to);
    // desplazamiento para que la flecha no toque el círculo (radio 22)
    const r = 22;
    const dx = v.x - u.x; const dy = v.y - u.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len; const uy = dy / len;
    const x1 = u.x + ux * r; const y1 = u.y + uy * r;
    const x2 = v.x - ux * (r + 8); const y2 = v.y - uy * (r + 8); // deja espacio al triángulo
    return { x1, y1, x2, y2 };
  }
  edgeMid(e: EdgeV) {
    const p = this.edgePoints(e);
    return { mx: (p.x1 + p.x2) / 2, my: (p.y1 + p.y2) / 2 };
  }
  isCurrent(e: EdgeV) { return this.currentEdge && e.from === this.currentEdge.from && e.to === this.currentEdge.to; }
  isSource(n: NodeV) { return n.id === this.sourceId; }
}
