import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UICardComponent } from '../../../ui/card.component';

interface NodeV { id: string; x: number; y: number; }
interface EdgeV { from: string; to: string; weight: number; }

type Phase = 'pick' | 'neighbors' | 'done';

@Component({
  standalone: true,
  selector: 'ah-dijkstra',
  imports: [CommonModule, RouterLink, FormsModule, UICardComponent],
  templateUrl: './dijkstra.component.html',
})
export class DijkstraComponent implements OnDestroy {
  // Graph
  nodes: NodeV[] = [];
  edges: EdgeV[] = [];

  // Algorithm state
  sourceId = 'A';
  dist: Record<string, number> = {};
  prev: Record<string, string | null> = {};
  visited = new Set<string>();

  phase: Phase = 'pick';
  currentId: string | null = null;
  neighborIndex = 0;
  currentNeighbor: string | null = null;
  currentEdge: { u: string; v: string } | null = null;

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
    // Directed edges with positive weights
    this.edges = [
      { from: 'A', to: 'B', weight: 4 },
      { from: 'A', to: 'C', weight: 2 },
      { from: 'B', to: 'C', weight: 1 },
      { from: 'B', to: 'D', weight: 5 },
      { from: 'C', to: 'B', weight: 3 },
      { from: 'C', to: 'D', weight: 8 },
      { from: 'C', to: 'E', weight: 10 },
      { from: 'D', to: 'E', weight: 2 },
      { from: 'E', to: 'D', weight: 2 },
    ];
  }

  randomizeWeights() {
    this.edges = this.edges.map(e => ({ ...e, weight: this.randInt(1, 9) }));
    this.reset();
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
    this.reset();
  }

  // --- Control ---
  reset() {
    this.stopTimer();
    this.dist = Object.fromEntries(this.nodes.map(n => [n.id, Infinity]));
    this.prev = Object.fromEntries(this.nodes.map(n => [n.id, null]));
    this.visited = new Set();
    this.dist[this.sourceId] = 0;

    this.phase = 'pick';
    this.currentId = null; this.neighborIndex = 0;
    this.currentNeighbor = null; this.currentEdge = null;
    this.finished = false; this.running = false; this.stepCount = 0;
    this.lastMessage = 'Ready. Press Play or Step to start Dijkstra.';
  }

  setSource(id: string) { this.sourceId = id; this.reset(); }

  play() { if (this.finished || this.running) return; this.running = true; this.timer = setInterval(() => this.step(), this.currentDelay()); }
  pause() { this.running = false; this.stopTimer(); }
  stopTimer() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }
  currentDelay() { const mult = Math.min(2, Math.max(0.25, this.speedMultiplier || 1)); return this.baseMs / mult; }
  onSpeedChange() { if (this.running) { this.stopTimer(); this.timer = setInterval(() => this.step(), this.currentDelay()); } }

  // --- Algorithm step ---
  step() {
    if (this.finished) return;
    this.stepCount++;

    if (this.phase === 'pick') {
      const u = this.pickMinUnvisited();
      if (!u || !Number.isFinite(this.dist[u])) {
        this.finished = true; this.lastMessage = 'Done. All reachable processed.'; this.pause(); return;
      }
      this.currentId = u;
      this.neighborIndex = 0;
      this.currentNeighbor = null; this.currentEdge = null;
      this.phase = 'neighbors';
      this.lastMessage = `Pick ${u} with dist = ${this.formatDist(this.dist[u])}.`;
      return;
    }

    if (this.phase === 'neighbors') {
      const u = this.currentId!;
      const neigh = this.outNeighborsOf(u);
      if (this.neighborIndex >= neigh.length) {
        this.visited.add(u);
        this.phase = 'pick';
        this.currentNeighbor = null; this.currentEdge = null;
        this.lastMessage = `Mark ${u} as visited.`;
        return;
      }
      const { v, w } = neigh[this.neighborIndex++];
      this.currentNeighbor = v; this.currentEdge = { u, v };
      const alt = this.dist[u] + w;
      if (alt < this.dist[v]) {
        this.dist[v] = alt; this.prev[v] = u;
        this.lastMessage = `Relax ${u} → ${v}: dist(${v}) = ${this.formatDist(this.dist[v])}`;
        setTimeout(() => { if (this.currentNeighbor === v) { this.currentNeighbor = null; this.currentEdge = null; } }, 900);
      } else {
        this.lastMessage = `Skip ${u} → ${v} (no improvement).`;
      }
      return;
    }
  }

  // --- Helpers ---
  pickMinUnvisited(): string | null {
    let best: string | null = null; let bestVal = Infinity;
    for (const n of this.nodes) {
      if (this.visited.has(n.id)) continue;
      const d = this.dist[n.id];
      if (d < bestVal) { bestVal = d; best = n.id; }
    }
    return best;
  }

  outNeighborsOf(id: string): Array<{ v: string; w: number }> {
    const res: Array<{ v: string; w: number }> = [];
    for (const e of this.edges) if (e.from === id) res.push({ v: e.to, w: e.weight });
    return res.sort((a, b) => a.v.localeCompare(b.v));
  }

  getNode(id: string) { return this.nodes.find(n => n.id === id)!; }
  formatDist(v: number) { return Number.isFinite(v) ? v : '∞'; }

  // Geometry for SVG
  edgePoints(e: EdgeV) {
    const u = this.getNode(e.from); const v = this.getNode(e.to);
    const r = 22; const dx = v.x - u.x; const dy = v.y - u.y; const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len; const uy = dy / len;
    const x1 = u.x + ux * r; const y1 = u.y + uy * r;
    const x2 = v.x - ux * (r + 8); const y2 = v.y - uy * (r + 8);
    return { x1, y1, x2, y2 };
  }
  edgeMid(e: EdgeV) {
    const p = this.edgePoints(e);
    const t = 1 / 2.3;
    return {
      mx: p.x1 + (p.x2 - p.x1) * t,
      my: p.y1 + (p.y2 - p.y1) * t
    };
  }
  isCurrentEdge(e: EdgeV) { return this.currentEdge && e.from === this.currentEdge.u && e.to === this.currentEdge.v; }
  isVisited(id: string) { return this.visited.has(id); }
  isCurrentNode(id: string) { return this.currentId === id; }
  randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
}
