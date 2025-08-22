import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UICardComponent } from '../../../ui/card.component';
import { UIButtonComponent } from '../../../ui/button.component';

interface PrimNode { id: number; x: number; y: number; }
interface PrimEdge { a: number; b: number; w: number; }

@Component({
  standalone: true,
  selector: 'ah-prim',
  imports: [CommonModule, RouterLink, FormsModule, UICardComponent, UIButtonComponent],
  templateUrl: './prim.component.html',
})
export class PrimComponent implements OnDestroy {
  // Graph configuration
  nodeCount = 8;
  minNodes = 4;
  maxNodes = 16;
  nodes: PrimNode[] = [];
  edges: PrimEdge[] = []; // undirected unique (a<b)
  weightMatrix: number[][] = [];
  dense = 0.75; // probability of keeping an edge (after ensuring connectivity)

  // Algorithm state
  startNode = 0;
  inMST: boolean[] = [];
  key: number[] = [];
  parent: number[] = [];
  selectedCount = 0;
  finished = false;

  phase: 'select' | 'relax' = 'select';
  relaxingNeighbors: number[] = []; // neighbor indices of current node
  relaxIndex = 0; // which neighbor we are processing
  currentNode: number | null = null; // last selected node
  candidateNext: number | null = null; // node that will be chosen next (preview)

  // Playback
  running = false;
  speedMultiplier = 1; // 0.25..3
  private baseMs = 650;
  private timer: any = null;

  // Stats
  stepCount = 0;
  selections = 0;
  relaxations = 0;
  updates = 0;
  lastMessage = '';

  Math = Math;
  INF = Infinity;

  constructor() {
    this.generateGraph();
  }

  ngOnDestroy(): void { this.stopTimer(); }

  // --- Graph Generation ---
  generateGraph() {
    const n = Math.max(this.minNodes, Math.min(this.maxNodes, Math.floor(this.nodeCount) || this.minNodes));
    this.nodeCount = n;
    this.nodes = Array.from({ length: n }, (_, i) => ({ id: i, x: Math.random(), y: Math.random() }));

    // build full graph with euclidean weights
    const fullEdges: PrimEdge[] = [];
    for (let a = 0; a < n; a++) {
      for (let b = a + 1; b < n; b++) {
        const w = this.euclid(this.nodes[a], this.nodes[b]);
        fullEdges.push({ a, b, w });
      }
    }

    // Start with minimum spanning tree via simple random chain to ensure connectivity
    const kept = new Set<string>();
    const order = [...Array(n).keys()].sort(() => Math.random() - 0.5);
    for (let i = 0; i < order.length - 1; i++) {
      const a = Math.min(order[i], order[i + 1]);
      const b = Math.max(order[i], order[i + 1]);
      kept.add(a + '-' + b);
    }
    // Add additional random edges with density threshold
    fullEdges.forEach(e => {
      const key = e.a + '-' + e.b;
      if (kept.has(key)) return;
      if (Math.random() < this.dense) kept.add(key);
    });

    this.edges = fullEdges.filter(e => kept.has(e.a + '-' + e.b));

    // Weight matrix (Infinity for absent)
    this.weightMatrix = Array.from({ length: n }, () => Array(n).fill(Infinity));
    this.edges.forEach(e => { this.weightMatrix[e.a][e.b] = e.w; this.weightMatrix[e.b][e.a] = e.w; });

    this.resetAlgo();
  }

  euclid(a: PrimNode, b: PrimNode) { return Math.round(Math.hypot(a.x - b.x, a.y - b.y) * 100); }

  // --- Algorithm Reset ---
  resetAlgo() {
    const n = this.nodeCount;
    this.inMST = Array(n).fill(false);
    this.key = Array(n).fill(Infinity);
    this.parent = Array(n).fill(-1);
    this.key[this.startNode] = 0;
    this.phase = 'select';
    this.relaxingNeighbors = [];
    this.relaxIndex = 0;
    this.currentNode = null;
    this.candidateNext = null;
    this.selectedCount = 0;
    this.finished = n === 0;
    this.stepCount = 0; this.selections = 0; this.relaxations = 0; this.updates = 0;
    this.lastMessage = this.finished ? 'Empty graph.' : 'Ready. Press Play or Step to run Prim\'s algorithm.';
    if (!this.finished) this.previewNext();
  }

  setStart(idx: number) { if (this.running) return; this.startNode = idx; this.resetAlgo(); }

  nodeCountChanged() { this.generateGraph(); }

  // Playback control
  play() { if (this.running || this.finished) return; this.running = true; this.timer = setInterval(() => this.step(), this.delay()); }
  pause() { this.running = false; this.stopTimer(); }
  toggle() { this.running ? this.pause() : this.play(); }
  delay() { const m = Math.min(3, Math.max(0.25, this.speedMultiplier || 1)); return this.baseMs / m; }
  onSpeedChange() { if (this.running) { this.stopTimer(); this.timer = setInterval(() => this.step(), this.delay()); } }
  stopTimer() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }

  // --- Algorithm Step ---
  step() {
    if (this.finished) return;
    this.stepCount++;
    if (this.phase === 'select') {
      this.doSelect();
    } else {
      this.doRelax();
    }
  }

  doSelect() {
    // pick node u not in MST with smallest key
    let best = Infinity; let bestIdx: number | null = null;
    for (let i = 0; i < this.nodeCount; i++) {
      if (!this.inMST[i] && this.key[i] < best) { best = this.key[i]; bestIdx = i; }
    }
    if (bestIdx == null) { // Should not happen unless disconnected remainder (Infinity keys)
      this.finished = true; this.pause(); this.lastMessage = 'No reachable nodes remain (disconnected?).'; return;
    }
    this.inMST[bestIdx] = true;
    this.currentNode = bestIdx;
    this.selections++;
    this.selectedCount++;
    this.lastMessage = `Select node ${bestIdx} with key=${best}.`;
    if (this.selectedCount >= this.nodeCount) { this.finished = true; this.pause(); this.lastMessage += ' MST complete.'; return; }
    // prepare relax phase
    this.relaxingNeighbors = this.neighborsOf(bestIdx).filter(v => !this.inMST[v]);
    this.relaxingNeighbors.sort((a,b)=>this.weightMatrix[bestIdx][a]-this.weightMatrix[bestIdx][b]);
    this.relaxIndex = 0;
    this.phase = 'relax';
  }

  doRelax() {
    if (this.relaxIndex >= this.relaxingNeighbors.length) {
      this.phase = 'select';
      this.previewNext();
      this.lastMessage = `Finished relaxing neighbors of ${this.currentNode}.`; // preview set within previewNext
      return;
    }
    const u = this.currentNode!;
    const v = this.relaxingNeighbors[this.relaxIndex];
    const w = this.weightMatrix[u][v];
    this.relaxations++;
    if (w < this.key[v]) {
      this.key[v] = w;
      this.parent[v] = u;
      this.updates++;
      this.lastMessage = `Update: key[${v}] = ${w} via parent ${u}.`;
    } else {
      this.lastMessage = `Skip: edge (${u},${v}) weight ${w} ≥ current key[${v}]=${this.key[v]}.`;
    }
    this.relaxIndex++;
  }

  previewNext() {
    let best = Infinity; let bestIdx: number | null = null;
    for (let i = 0; i < this.nodeCount; i++) if (!this.inMST[i] && this.key[i] < best) { best = this.key[i]; bestIdx = i; }
    this.candidateNext = bestIdx;
  }

  // Helpers
  neighborsOf(i: number) { const res: number[] = []; for (let j = 0; j < this.nodeCount; j++) if (this.weightMatrix[i][j] < Infinity) res.push(j); return res; }
  edgeKey(a: number, b: number) { return a < b ? `${a}-${b}` : `${b}-${a}`; }
  isEdgeInMST(a: number, b: number) { // Only if parent relation
    return (this.parent[b] === a) || (this.parent[a] === b);
  }
  isEdgeRelaxing(a: number, b: number) {
    if (this.phase !== 'relax' || this.currentNode == null) return false;
    const u = this.currentNode;
    const v = this.relaxingNeighbors[this.relaxIndex] ?? null;
    return (u === a && v === b) || (u === b && v === a);
  }
  nodeFill(i: number) {
    if (this.inMST[i]) return 'fill-emerald-500';
    if (this.phase === 'select' && this.candidateNext === i) return 'fill-indigo-500 animate-pulse';
    if (this.phase === 'relax' && this.currentNode === i) return 'fill-indigo-500';
    return 'fill-slate-300 dark:fill-slate-600';
  }
  nodeStroke(i: number) {
    if (this.startNode === i) return 'stroke-indigo-600';
    if (this.parent[i] !== -1) return 'stroke-emerald-500';
    return 'stroke-slate-500 dark:stroke-slate-400';
  }
  edgeStroke(a: number, b: number) {
    if (this.isEdgeInMST(a,b)) return 'stroke-emerald-500';
    if (this.isEdgeRelaxing(a,b)) return 'stroke-amber-500';
    return 'stroke-slate-400 dark:stroke-slate-600';
  }
  edgeOpacity(a:number,b:number){ if(this.isEdgeInMST(a,b)) return 0.95; if(this.isEdgeRelaxing(a,b)) return 0.9; return 0.4; }

  svgWidth = 760; svgHeight = 420; padding = 40;
  nodeX(i: number) { return this.padding + this.nodes[i].x * (this.svgWidth - 2*this.padding); }
  nodeY(i: number) { return this.padding + this.nodes[i].y * (this.svgHeight - 2*this.padding); }

  // Derived MST edges list for display
  mstEdges(): PrimEdge[] {
    const list: PrimEdge[] = [];
    for (let v = 0; v < this.nodeCount; v++) {
      const p = this.parent[v];
      if (p !== -1) list.push({ a: Math.min(p,v), b: Math.max(p,v), w: this.weightMatrix[p][v] });
    }
    return list;
  }

  totalWeight() { return this.mstEdges().reduce((s,e)=>s+e.w,0); }

  clickNode(i: number) { if (this.running) return; if (this.selectedCount>0) return; this.setStart(i); }
}
