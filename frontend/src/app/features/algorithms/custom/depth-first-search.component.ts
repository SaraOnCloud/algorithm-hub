import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UICardComponent } from '../../../ui/card.component';

interface NodeV { id: string; x: number; y: number; }
interface EdgeV { a: string; b: string; }

type Phase = 'pop' | 'neighbors' | 'done';

@Component({
  standalone: true,
  selector: 'ah-depth-first-search',
  imports: [CommonModule, RouterLink, FormsModule, UICardComponent],
  templateUrl: './depth-first-search.component.html',
})
export class DepthFirstSearchComponent implements OnDestroy {
  // Graph
  nodes: NodeV[] = [];
  edges: EdgeV[] = [];

  // DFS state
  sourceId = 'A';
  visited = new Set<string>();
  depth: Record<string, number> = {};
  prev: Record<string, string | null> = {};
  stack: string[] = [];

  phase: Phase = 'pop';
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

  // --- Init / Graph helpers ---
  initDefaultGraph() {
    const ids = ['A','B','C','D','E','F'];
    const cx = 260, cy = 200, r = 140;
    this.nodes = ids.map((id, i) => {
      const ang = (Math.PI * 2 * i) / ids.length - Math.PI / 2;
      return { id, x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang) };
    });
    this.edges = [
      { a: 'A', b: 'B' }, { a: 'A', b: 'D' },
      { a: 'B', b: 'C' }, { a: 'B', b: 'E' },
      { a: 'C', b: 'F' }, { a: 'D', b: 'E' }, { a: 'E', b: 'F' },
    ];
  }

  shuffleLayout() {
    const cx = 260, cy = 200, r = 140;
    const ids = [...this.nodes.map(n => n.id)];
    const rot = Math.random() * Math.PI * 2;
    this.nodes = ids.map((id, i) => {
      const ang = rot + (Math.PI * 2 * i) / ids.length - Math.PI / 2;
      const jitter = (Math.random() - 0.5) * 14;
      return { id, x: cx + (r + jitter) * Math.cos(ang), y: cy + (r + jitter) * Math.sin(ang) };
    });
    this.reset();
  }

  randomizeEdges() {
    const ids = this.nodes.map(n => n.id);
    const shuffled = [...ids].sort(() => Math.random() - 0.5);
    const adj = new Map<string, Set<string>>();
    for (const id of ids) adj.set(id, new Set());
    // Spanning tree
    for (let i = 1; i < shuffled.length; i++) {
      const u = shuffled[i];
      const v = shuffled[Math.floor(Math.random() * i)];
      adj.get(u)!.add(v); adj.get(v)!.add(u);
    }
    // Extra edges
    const targetExtra = Math.floor(ids.length * 0.7);
    let added = 0, guard = 0;
    while (added < targetExtra && guard++ < 200) {
      const u = ids[Math.floor(Math.random() * ids.length)];
      const v = ids[Math.floor(Math.random() * ids.length)];
      if (u === v) continue;
      if (adj.get(u)!.has(v)) continue;
      if (adj.get(u)!.size > 3 || adj.get(v)!.size > 3) continue;
      adj.get(u)!.add(v); adj.get(v)!.add(u); added++;
    }
    const uniq = new Set<string>();
    const list: EdgeV[] = [];
    for (const [u, set] of adj) for (const v of set) {
      const key = u < v ? `${u}-${v}` : `${v}-${u}`;
      if (uniq.has(key)) continue; uniq.add(key);
      list.push({ a: u < v ? u : v, b: u < v ? v : u });
    }
    this.edges = list;
    this.reset();
  }

  neighborsOf(id: string): string[] {
    const res: string[] = [];
    for (const e of this.edges) {
      if (e.a === id) res.push(e.b); else if (e.b === id) res.push(e.a);
    }
    return res.sort();
  }

  // --- Control ---
  reset() {
    this.stopTimer();
    this.visited = new Set();
    this.depth = Object.fromEntries(this.nodes.map(n => [n.id, Infinity]));
    this.prev = Object.fromEntries(this.nodes.map(n => [n.id, null]));
    this.depth[this.sourceId] = 0;
    this.stack = [this.sourceId];

    this.phase = 'pop';
    this.currentId = null;
    this.neighborIndex = 0;
    this.currentNeighbor = null;
    this.currentEdge = null;

    this.finished = false;
    this.running = false;
    this.stepCount = 0;
    this.lastMessage = 'Ready. Press Play or Step to start DFS.';
  }

  setSource(id: string) { this.sourceId = id; this.reset(); }

  play() { if (this.finished || this.running) return; this.running = true; this.timer = setInterval(() => this.step(), this.currentDelay()); }
  pause() { this.running = false; this.stopTimer(); }
  stopTimer() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }
  currentDelay() { const mult = Math.min(2, Math.max(0.25, this.speedMultiplier || 1)); return this.baseMs / mult; }
  onSpeedChange() { if (this.running) { this.stopTimer(); this.timer = setInterval(() => this.step(), this.currentDelay()); } }

  // --- Step ---
  step() {
    if (this.finished) return;
    this.stepCount++;

    if (this.phase === 'pop') {
      if (this.stack.length === 0) { this.finished = true; this.lastMessage = 'Done. Stack is empty.'; this.pause(); return; }
      const u = this.stack.pop()!;
      if (this.visited.has(u)) { this.lastMessage = `Skip ${u} (already visited).`; return; }
      this.visited.add(u);
      this.currentId = u;
      this.neighborIndex = 0;
      this.currentNeighbor = null; this.currentEdge = null;
      this.lastMessage = `Visit ${u}. Explore its neighbors.`;
      this.phase = 'neighbors';
      return;
    }

    if (this.phase === 'neighbors') {
      const u = this.currentId!;
      const neigh = this.neighborsOf(u);
      if (this.neighborIndex >= neigh.length) {
        this.phase = 'pop';
        this.currentNeighbor = null; this.currentEdge = null;
        this.lastMessage = `Finished exploring ${u}.`;
        return;
      }
      const v = neigh[this.neighborIndex++];
      this.currentNeighbor = v;
      this.currentEdge = { u, v };

      if (!this.visited.has(v)) {
        if (!Number.isFinite(this.depth[v])) this.depth[v] = (this.depth[u] ?? 0) + 1;
        this.prev[v] = u;
        this.stack.push(v);
        this.lastMessage = `Push ${v} onto stack.`;
        setTimeout(() => { if (this.currentNeighbor === v) { this.currentNeighbor = null; this.currentEdge = null; } }, 900);
      } else {
        this.lastMessage = `Skip ${v} (already visited).`;
      }
      return;
    }
  }

  // --- SVG helpers ---
  getNode(id: string) { return this.nodes.find(n => n.id === id)!; }
  inStack(id: string) { return this.stack.includes(id); }
  isVisited(id: string) { return this.visited.has(id); }
  isCurrent(id: string) { return this.currentId === id; }
  formatDepth(v: number) { return Number.isFinite(v) ? v : '—'; }

  edgePoints(a: string, b: string) {
    const u = this.getNode(a); const v = this.getNode(b);
    const r = 22; const dx = v.x - u.x; const dy = v.y - u.y; const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len; const uy = dy / len;
    const x1 = u.x + ux * r; const y1 = u.y + uy * r;
    const x2 = v.x - ux * r; const y2 = v.y - uy * r;
    return { x1, y1, x2, y2 };
  }

  treeEdges(): Array<{ a: string; b: string }> {
    const res: Array<{ a: string; b: string }> = [];
    for (const id of Object.keys(this.prev)) { const p = this.prev[id]; if (p) res.push({ a: p, b: id }); }
    return res;
  }
}
