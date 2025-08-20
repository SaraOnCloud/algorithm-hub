import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UICardComponent } from '../../../ui/card.component';

interface NodeV { id: string; x: number; y: number; }
interface EdgeV { a: string; b: string; weight: number; }

type EStatus = 'pending' | 'current' | 'picked' | 'discarded';

@Component({
  standalone: true,
  selector: 'ah-kruskal',
  imports: [CommonModule, RouterLink, FormsModule, UICardComponent],
  templateUrl: './kruskal.component.html',
})
export class KruskalComponent implements OnDestroy {
  // Graph
  nodes: NodeV[] = [];
  edges: EdgeV[] = [];

  // Sorted edges with status
  sorted: Array<EdgeV & { status: EStatus }> = [];
  eIndex = 0;

  // MST state
  mst: EdgeV[] = [];
  totalWeight = 0;

  // DSU
  parent = new Map<string, string>();
  rank = new Map<string, number>();

  // Playback
  running = false;
  finished = false;
  stepCount = 0;
  speedMultiplier = 1;
  private baseMs = 700;
  private timer: any = null;

  // UI
  lastMessage = '';

  constructor() {
    this.initDefaultGraph();
    this.reset();
  }
  ngOnDestroy(): void { this.stopTimer(); }

  // --- Init ---
  initDefaultGraph() {
    const ids = ['A','B','C','D','E','F'];
    const cx = 260, cy = 200, r = 140;
    this.nodes = ids.map((id, i) => {
      const ang = (Math.PI * 2 * i) / ids.length - Math.PI / 2;
      return { id, x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang) };
    });
    this.edges = [
      { a: 'A', b: 'B', weight: 4 }, { a: 'A', b: 'C', weight: 3 },
      { a: 'B', b: 'C', weight: 1 }, { a: 'B', b: 'D', weight: 2 },
      { a: 'C', b: 'D', weight: 4 }, { a: 'C', b: 'E', weight: 2 },
      { a: 'D', b: 'E', weight: 3 }, { a: 'D', b: 'F', weight: 2 },
      { a: 'E', b: 'F', weight: 3 },
    ];
  }

  shuffleLayout() {
    const cx = 260, cy = 200, r = 140;
    const ids = [...this.nodes.map(n => n.id)];
    const rot = Math.random() * Math.PI * 2;
    this.nodes = ids.map((id, i) => {
      const ang = rot + (Math.PI * 2 * i) / ids.length - Math.PI / 2;
      const jitter = (Math.random() - 0.5) * 16;
      return { id, x: cx + (r + jitter) * Math.cos(ang), y: cy + (r + jitter) * Math.sin(ang) };
    });
  }

  randomizeWeights() {
    this.edges = this.edges.map(e => ({ ...e, weight: this.randInt(1, 9) }));
    this.reset();
  }

  // --- Control ---
  reset() {
    this.stopTimer();
    this.sorted = this.edges.map(e => ({ ...e, status: 'pending' as EStatus }))
      .sort((x, y) => x.weight - y.weight);
    this.eIndex = 0;
    this.mst = [];
    this.totalWeight = 0;
    this.parent = new Map(this.nodes.map(n => [n.id, n.id]));
    this.rank = new Map(this.nodes.map(n => [n.id, 0]));
    this.running = false; this.finished = false; this.stepCount = 0;
    this.lastMessage = 'Ready. Press Play or Step to start Kruskal.';
  }

  play() { if (this.finished || this.running) return; this.running = true; this.timer = setInterval(() => this.step(), this.currentDelay()); }
  pause() { this.running = false; this.stopTimer(); }
  stopTimer() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }
  currentDelay() { const m = Math.min(2, Math.max(0.25, this.speedMultiplier || 1)); return this.baseMs / m; }
  onSpeedChange() { if (this.running) { this.stopTimer(); this.timer = setInterval(() => this.step(), this.currentDelay()); } }

  // --- DSU ---
  find(x: string): string { const p = this.parent.get(x)!; if (p !== x) { const r = this.find(p); this.parent.set(x, r); return r; } return p; }
  union(x: string, y: string): boolean {
    let rx = this.find(x), ry = this.find(y);
    if (rx === ry) return false;
    const rxRank = this.rank.get(rx)!; const ryRank = this.rank.get(ry)!;
    if (rxRank < ryRank) { this.parent.set(rx, ry); }
    else if (rxRank > ryRank) { this.parent.set(ry, rx); }
    else { this.parent.set(ry, rx); this.rank.set(rx, rxRank + 1); }
    return true;
  }

  // --- Step ---
  step() {
    if (this.finished) return;
    this.stepCount++;

    // Stop if MST has V-1 edges or no more edges
    if (this.mst.length >= this.nodes.length - 1 || this.eIndex >= this.sorted.length) {
      this.finished = true; this.pause(); this.lastMessage = 'MST completed.'; return;
    }

    // Advance to next pending edge
    while (this.eIndex < this.sorted.length && this.sorted[this.eIndex].status !== 'pending') this.eIndex++;
    if (this.eIndex >= this.sorted.length) { this.finished = true; this.pause(); this.lastMessage = 'Done.'; return; }

    const e = this.sorted[this.eIndex];
    e.status = 'current';

    const canUnion = this.union(e.a, e.b);
    if (canUnion) {
      e.status = 'picked';
      this.mst.push({ a: e.a, b: e.b, weight: e.weight });
      this.totalWeight += e.weight;
      this.lastMessage = `Pick ${e.a}—${e.b} (w=${e.weight}).`;
    } else {
      e.status = 'discarded';
      this.lastMessage = `Discard ${e.a}—${e.b} (cycle).`;
    }

    this.eIndex++;

    // End condition
    if (this.mst.length >= this.nodes.length - 1) { this.finished = true; this.pause(); this.lastMessage = 'MST completed.'; }
  }

  // --- SVG helpers ---
  getNode(id: string) { return this.nodes.find(n => n.id === id)!; }
  edgePoints(a: string, b: string) {
    const u = this.getNode(a); const v = this.getNode(b);
    const r = 22; const dx = v.x - u.x; const dy = v.y - u.y; const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len; const uy = dy / len;
    const x1 = u.x + ux * r; const y1 = u.y + uy * r;
    const x2 = v.x - ux * r; const y2 = v.y - uy * r;
    return { x1, y1, x2, y2 };
  }
  isPickedEdge(a: string, b: string) { return this.mst.some(e => (e.a === a && e.b === b) || (e.a === b && e.b === a)); }
  isCurrentEdge(a: string, b: string) { const e = this.sorted[this.eIndex - 1]; return e && ((e.a === a && e.b === b) || (e.a === b && e.b === a)) && e.status === 'current'; }
  edgeStatus(a: string, b: string): EStatus {
    if (this.isPickedEdge(a, b)) return 'picked';
    if (this.isCurrentEdge(a, b)) return 'current';
    const found = this.sorted.find(e => ((e.a === a && e.b === b) || (e.a === b && e.b === a)) && e.status === 'discarded');
    if (found) return 'discarded';
    return 'pending';
  }

  // Util
  randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
}
