import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UICardComponent } from '../../../ui/card.component';

interface NodeV { id: string; x: number; y: number; }
interface EdgeV { from: string; to: string; weight: number; }

@Component({
  standalone: true,
  selector: 'ah-floyd-warshall',
  imports: [CommonModule, RouterLink, FormsModule, UICardComponent],
  templateUrl: './floyd-warshall.component.html',
})
export class FloydWarshallComponent implements OnDestroy {
  // Graph
  nodes: NodeV[] = [];
  edges: EdgeV[] = [];

  // Matrix state
  nodeIds: string[] = [];
  dist: Record<string, Record<string, number>> = {};
  next: Record<string, Record<string, string | null>> = {};

  // Triple-loop indices
  kIndex = 0; iIndex = 0; jIndex = 0;
  currentTriple: { i: string | null; j: string | null; k: string | null } = { i: null, j: null, k: null };
  lastUpdated: { i: string | null; j: string | null } = { i: null, j: null };

  running = false;
  finished = false;
  stepCount = 0;
  lastMessage = '';

  // Playback
  speedMultiplier = 1;
  private baseMs = 700;
  private timer: any = null;

  constructor() {
    this.initDefaultGraph();
    this.reset();
  }

  ngOnDestroy(): void { this.stopTimer(); }

  // --- Init ---
  initDefaultGraph() {
    const ids = ['A','B','C','D','E'];
    const cx = 260, cy = 200, r = 140;
    this.nodes = ids.map((id, i) => {
      const ang = (Math.PI * 2 * i) / ids.length - Math.PI / 2;
      return { id, x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang) };
    });
    this.edges = [
      { from: 'A', to: 'B', weight: 3 },
      { from: 'A', to: 'D', weight: 7 },
      { from: 'B', to: 'C', weight: 1 },
      { from: 'B', to: 'D', weight: 5 },
      { from: 'C', to: 'E', weight: 2 },
      { from: 'D', to: 'E', weight: 3 },
      { from: 'E', to: 'A', weight: 4 },
    ];
  }

  shuffleLayout() {
    const cx = 260, cy = 200, r = 140;
    const ids = [...this.nodes.map(n => n.id)];
    const rot = Math.random() * Math.PI * 2;
    this.nodes = ids.map((id, i) => {
      const ang = rot + (Math.PI * 2 * i) / ids.length - Math.PI / 2;
      const jitter = (Math.random() - 0.5) * 12;
      return { id, x: cx + (r + jitter) * Math.cos(ang), y: cy + (r + jitter) * Math.sin(ang) };
    });
  }

  randomizeWeights() {
    this.edges = this.edges.map(e => ({ ...e, weight: this.randInt(-3, 9) }));
    this.reset();
  }

  // --- Control ---
  reset() {
    this.stopTimer();
    this.nodeIds = this.nodes.map(n => n.id);
    this.dist = {} as any; this.next = {} as any;
    for (const i of this.nodeIds) {
      this.dist[i] = {} as any; this.next[i] = {} as any;
      for (const j of this.nodeIds) {
        this.dist[i][j] = i === j ? 0 : Infinity;
        this.next[i][j] = null;
      }
    }
    for (const e of this.edges) {
      if (e.weight < this.dist[e.from][e.to]) {
        this.dist[e.from][e.to] = e.weight;
        this.next[e.from][e.to] = e.to;
      }
    }
    this.kIndex = 0; this.iIndex = 0; this.jIndex = 0;
    this.currentTriple = { i: null, j: null, k: null };
    this.lastUpdated = { i: null, j: null };
    this.running = false; this.finished = false; this.stepCount = 0;
    this.lastMessage = 'Ready. Press Play or Step to start Floyd–Warshall.';
  }

  play() { if (this.finished || this.running) return; this.running = true; this.timer = setInterval(() => this.step(), this.currentDelay()); }
  pause() { this.running = false; this.stopTimer(); }
  stopTimer() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }
  currentDelay() { const mult = Math.min(2, Math.max(0.25, this.speedMultiplier || 1)); return this.baseMs / mult; }
  onSpeedChange() { if (this.running) { this.stopTimer(); this.timer = setInterval(() => this.step(), this.currentDelay()); } }

  // --- Step ---
  step() {
    if (this.finished) return;
    const n = this.nodeIds.length;
    const k = this.nodeIds[this.kIndex];
    const i = this.nodeIds[this.iIndex];
    const j = this.nodeIds[this.jIndex];
    this.currentTriple = { i, j, k };
    this.stepCount++;

    const dik = this.dist[i][k];
    const dkj = this.dist[k][j];
    const dij = this.dist[i][j];

    if (Number.isFinite(dik) && Number.isFinite(dkj) && dik + dkj < dij) {
      this.dist[i][j] = dik + dkj;
      this.next[i][j] = this.next[i][k];
      this.lastUpdated = { i, j };
      this.lastMessage = `Relax via ${k}: dist(${i},${j}) = ${this.formatDist(this.dist[i][j])}`;
      setTimeout(() => { if (this.lastUpdated.i === i && this.lastUpdated.j === j) this.lastUpdated = { i: null, j: null }; }, 900);
    } else {
      this.lastMessage = `No improvement for (${i},${j}) via ${k}.`;
    }

    // advance indices: j -> i -> k
    this.jIndex++;
    if (this.jIndex >= n) {
      this.jIndex = 0; this.iIndex++;
      if (this.iIndex >= n) {
        this.iIndex = 0; this.kIndex++;
        if (this.kIndex >= n) {
          this.finished = true; this.pause(); this.lastMessage = 'Completed all relaxations.'; return;
        }
      }
    }
  }

  // --- Helpers ---
  getNode(id: string) { return this.nodes.find(n => n.id === id)!; }
  isCurrentNode(id: string) { return this.currentTriple.i === id || this.currentTriple.j === id || this.currentTriple.k === id; }
  isCurrentEdge(u: string, v: string) { return (this.currentTriple.i === u && this.currentTriple.k === v) || (this.currentTriple.k === u && this.currentTriple.j === v) || (this.currentTriple.i === u && this.currentTriple.j === v); }
  formatDist(v: number) { return Number.isFinite(v) ? v : '∞'; }

  edgePoints(u: string, v: string) {
    const a = this.getNode(u); const b = this.getNode(v);
    const r = 22; const dx = b.x - a.x; const dy = b.y - a.y; const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len; const uy = dy / len;
    const x1 = a.x + ux * r; const y1 = a.y + uy * r;
    const x2 = b.x - ux * (r + 8); const y2 = b.y - uy * (r + 8);
    return { x1, y1, x2, y2 };
  }
  edgeMid(u: string, v: string) {
    const p = this.edgePoints(u, v);
    return { mx: (p.x1 + p.x2) / 2, my: (p.y1 + p.y2) / 2 };
  }
  hasEdge(u: string, v: string) { return this.edges.some(e => e.from === u && e.to === v); }
  weightOf(u: string, v: string) { const e = this.edges.find(e => e.from === u && e.to === v); return e ? e.weight : null; }

  randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
}
