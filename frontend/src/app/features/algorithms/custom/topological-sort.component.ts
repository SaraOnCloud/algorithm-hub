import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UICardComponent } from '../../../ui/card.component';
import { UIButtonComponent } from '../../../ui/button.component';

interface TSNode { id: number; level: number; x: number; y: number; }
interface TSEdge { from: number; to: number; }

@Component({
  standalone: true,
  selector: 'ah-topological-sort',
  imports: [CommonModule, RouterLink, FormsModule, UICardComponent, UIButtonComponent],
  templateUrl: './topological-sort.component.html',
})
export class TopologicalSortComponent implements OnDestroy {
  // Config
  nodeCount = 10;
  minNodes = 4; maxNodes = 24;
  density = 0.35; // probability of forward edge

  // Graph
  nodes: TSNode[] = [];
  edges: TSEdge[] = [];
  adj: number[][] = [];
  indeg: number[] = [];

  // Kahn algorithm state
  queue: number[] = [];
  order: number[] = [];
  current: number | null = null;
  relaxingNeighbors: number[] = [];
  relaxIndex = 0;
  phase: 'select' | 'relax' = 'select';
  cycle = false;

  // Playback
  running = false;
  finished = false;
  speedMultiplier = 1; // 0.25..3
  private baseMs = 650;
  private timer: any = null;

  // Stats
  stepCount = 0;
  indegUpdates = 0;
  enqueues = 0;
  lastMessage = '';

  // SVG layout
  svgWidth = 860; svgHeight = 420; paddingX = 60; paddingY = 48;

  Math = Math;

  constructor() { this.generateDAG(); }
  ngOnDestroy(): void { this.stopTimer(); }

  // --- Graph generation ---
  generateDAG() {
    const n = Math.max(this.minNodes, Math.min(this.maxNodes, Math.floor(this.nodeCount) || this.minNodes));
    this.nodeCount = n;
    // random linear order
    const order = [...Array(n).keys()].sort(()=>Math.random()-0.5);
    const posInOrder: number[] = Array(n).fill(0);
    order.forEach((id,idx)=>posInOrder[id]=idx);

    // Build edges forward only
    const edges: TSEdge[] = [];
    for (let i=0;i<n;i++) {
      for (let j=i+1;j<n;j++) {
        const u = order[i]; const v = order[j];
        if (Math.random() < this.density) edges.push({from: u, to: v});
      }
    }
    // Ensure each node (except first) has at least one incoming by connecting from a previous if none
    const incoming = Array(n).fill(0);
    edges.forEach(e=>incoming[e.to]++);
    for (let k=0;k<n;k++) if (k!==order[0] && incoming[k]===0) {
      // link from a random earlier node in order
      const earlierOptions = order.filter(id => posInOrder[id] < posInOrder[k]);
      const from = earlierOptions[Math.floor(Math.random()*earlierOptions.length)];
      edges.push({from, to: k}); incoming[k]++; }

    this.edges = edges;
    // adjacency & indeg
    this.adj = Array.from({length:n}, ()=>[]);
    this.indeg = Array(n).fill(0);
    edges.forEach(e=>{ this.adj[e.from].push(e.to); this.indeg[e.to]++; });

    // levels (longest path length) in order sequence
    const level = Array(n).fill(0);
    // Topologically process using given linear order
    order.forEach(u => {
      this.adj[u].forEach(v=> level[v] = Math.max(level[v], level[u]+1));
    });
    const maxLevel = Math.max(...level,0);
    const perLevel: number[][] = Array.from({length:maxLevel+1}, ()=>[]);
    for (let i=0;i<n;i++) perLevel[level[i]].push(i);

    // Assign coordinates
    this.nodes = [];
    for (let L=0;L<=maxLevel;L++) {
      const group = perLevel[L];
      group.forEach((id, idx)=>{
        const x = this.paddingX + (L + 0.5) * ((this.svgWidth - 2*this.paddingX)/(maxLevel+1));
        const y = this.paddingY + (idx + 0.5) * ((this.svgHeight - 2*this.paddingY) / (group.length || 1));
        this.nodes.push({id, level: L, x, y});
      });
    }

    this.resetAlgo();
  }

  // --- Reset algorithm state ---
  resetAlgo() {
    this.stopTimer();
    this.queue = [];
    this.order = [];
    this.current = null;
    this.relaxingNeighbors = [];
    this.relaxIndex = 0;
    this.phase = 'select';
    this.cycle = false;
    this.finished = false;
    this.running = false;
    this.stepCount = 0; this.indegUpdates = 0; this.enqueues = 0;
    // seed queue
    for (let i=0;i<this.nodeCount;i++) if (this.indeg[i]===0) this.queue.push(i);
    this.queue.sort((a,b)=>a-b);
    this.lastMessage = this.queue.length? 'Ready. Queue seeded with indegree-0 nodes.' : 'No indegree-0 nodes: cycle detected.';
    if (this.queue.length===0) { this.finished = true; this.cycle = true; }
  }

  // --- Playback controls ---
  play(){ if (this.running || this.finished) return; this.running = true; this.timer = setInterval(()=>this.step(), this.delay()); }
  pause(){ this.running = false; this.stopTimer(); }
  toggle(){ this.running? this.pause(): this.play(); }
  delay(){ const m = Math.min(3, Math.max(0.25, this.speedMultiplier||1)); return this.baseMs / m; }
  onSpeedChange(){ if (this.running){ this.stopTimer(); this.timer = setInterval(()=>this.step(), this.delay()); } }
  stopTimer(){ if (this.timer){ clearInterval(this.timer); this.timer = null; } }

  // --- Step logic (Kahn) ---
  step(){ if (this.finished) return; this.stepCount++; if (this.phase==='select') this.stepSelect(); else this.stepRelax(); }

  stepSelect(){
    if (this.queue.length===0){
      if (this.order.length < this.nodeCount){ this.cycle = true; this.finished = true; this.lastMessage = 'Queue empty before processing all nodes ⇒ cycle detected.'; this.pause(); }
      return;
    }
    // choose next (smallest id for determinism)
    this.queue.sort((a,b)=>a-b);
    const u = this.queue.shift()!;
    this.current = u;
    this.order.push(u);
    this.relaxingNeighbors = [...this.adj[u]]; // copy
    this.relaxIndex = 0;
    this.phase = 'relax';
    if (this.relaxingNeighbors.length===0){
      this.lastMessage = `Select node ${u} (no outgoing edges).`;
      // immediately move back to select
      this.phase = 'select';
      this.current = null;
      this.checkFinish();
    } else {
      this.lastMessage = `Select node ${u}, begin relaxing ${this.relaxingNeighbors.length} outgoing edges.`;
    }
  }

  stepRelax(){
    if (this.current==null){ this.phase='select'; return; }
    if (this.relaxIndex >= this.relaxingNeighbors.length){
      this.phase='select';
      this.current = null;
      this.checkFinish();
      return;
    }
    const v = this.relaxingNeighbors[this.relaxIndex];
    // decrement indegree
    this.indeg[v]--; this.indegUpdates++;
    if (this.indeg[v]===0){ this.queue.push(v); this.enqueues++; this.lastMessage = `Edge processed. indeg[${v}]→0 ⇒ enqueue ${v}.`; }
    else { this.lastMessage = `Edge processed. indeg[${v}]=${this.indeg[v]}.`; }
    this.relaxIndex++;
    if (this.relaxIndex >= this.relaxingNeighbors.length){ this.lastMessage += ' Finished all edges.'; }
  }

  checkFinish(){
    if (this.order.length === this.nodeCount){ this.finished = true; this.lastMessage = 'All nodes processed. Topological order complete.'; this.pause(); }
  }

  // --- Helpers for template ---
  isProcessed(id:number){ return this.order.includes(id); }
  isCurrent(id:number){ return this.current===id; }
  edgeColor(e:TSEdge){
    const processedFrom = this.isProcessed(e.from);
    const processedTo = this.isProcessed(e.to);
    if (processedFrom && processedTo) return '#10b981'; // emerald
    if (this.current===e.from && this.phase==='relax' && this.relaxingNeighbors[this.relaxIndex]===e.to) return '#f59e0b'; // amber current edge
    if (processedFrom) return '#6366f1'; // indigo
    return '#94a3b8'; // slate
  }
  edgeOpacity(e:TSEdge){ if (this.current===e.from && this.phase==='relax') return 0.9; return this.isProcessed(e.from)?0.85:0.35; }
  nodeFill(n:TSNode){ if (this.isProcessed(n.id)) return 'fill-emerald-500'; if (this.isCurrent(n.id)) return 'fill-indigo-500'; if (this.indeg[n.id]===0 && !this.isProcessed(n.id)) return 'fill-indigo-300 dark:fill-indigo-700'; return 'fill-slate-300 dark:fill-slate-600'; }
  nodeStroke(n:TSNode){ if (this.isProcessed(n.id)) return 'stroke-emerald-600'; if (this.isCurrent(n.id)) return 'stroke-indigo-600'; return 'stroke-slate-500 dark:stroke-slate-400'; }
  nodeLabel(n:TSNode){ return n.id; }
  queueSorted(){ return [...this.queue].sort((a,b)=>a-b); }
  processedOrder(){ return this.order.join(', '); }

  regenerate(){ this.generateDAG(); }
}
