import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UICardComponent } from '../../../ui/card.component';
import { UIButtonComponent } from '../../../ui/button.component';

interface VNode {
  id: number;
  label: string;
  x: number;
  y: number;
  left?: number;
  right?: number;
}

 type Traversal = 'Preorder' | 'Inorder' | 'Postorder' | 'Level-order';

@Component({
  standalone: true,
  selector: 'ah-binary-tree-traversals',
  imports: [CommonModule, RouterLink, FormsModule, UICardComponent, UIButtonComponent],
  templateUrl: './binary-tree-traversals.component.html',
})
export class BinaryTreeTraversalsComponent implements OnDestroy {
  // Tree model
  nodes: VNode[] = [];
  rootId: number | null = null;
  targetNodes = 11; // requested count
  sparsity = 0.25; // probability to skip a child

  // Layout
  width = 680; height = 420; marginX = 24; levelH = 90; topPad = 40;

  // Traversal state
  traversal: Traversal = 'Inorder';
  order: number[] = [];
  visited = new Set<number>();
  currentIndex = 0;
  currentId: number | null = null;
  finished = false;
  running = false;
  lastMessage = '';

  // Playback
  speedMultiplier = 1; // 0.25..2
  private baseMs = 700;
  private timer: any = null;

  constructor() {
    this.rebuildTree();
  }

  ngOnDestroy(): void { this.stopTimer(); }

  // --- Tree generation ---
  rebuildTree() {
    this.stopTimer();
    const { nodes, rootId } = this.generateRandomTree(this.targetNodes, this.sparsity);
    this.nodes = nodes;
    this.rootId = rootId;
    this.computeLayout();
    this.recomputeOrder();
    this.resetTraversal();
    this.lastMessage = 'Ready. Choose a traversal and press Play or Step.';
  }

  setTargetNodes(n: number) {
    this.targetNodes = Math.max(3, Math.min(31, Math.floor(n) || 3));
    this.rebuildTree();
  }

  randomizeValuesOnly() {
    // keep shape but randomize labels
    for (const n of this.nodes) n.label = String(this.randInt(1, 99));
    this.recomputeOrder();
    this.resetTraversal();
    this.lastMessage = 'Values randomized.';
  }

  generateRandomTree(target: number, sparsity: number): { nodes: VNode[]; rootId: number | null } {
    let nextId = 1;
    const nodes: VNode[] = [];

    const createNode = (): number => {
      const id = nextId++;
      nodes.push({ id, label: String(this.randInt(1, 99)), x: 0, y: 0 });
      return id;
    };

    const queue: Array<{ id: number; depth: number }> = [];
    const rootId = createNode();
    queue.push({ id: rootId, depth: 0 });

    while (queue.length && nodes.length < target) {
      const { id, depth } = queue.shift()!;
      const canAddChildren = nodes.length < target && depth < 4; // limit depth
      if (!canAddChildren) continue;

      // Decide children
      for (const side of ['left', 'right'] as const) {
        if (nodes.length >= target) break;
        if (Math.random() > sparsity || depth === 0) {
          const childId = createNode();
          const n = nodes.find(n => n.id === id)!;
          (n as any)[side] = childId;
          queue.push({ id: childId, depth: depth + 1 });
        }
      }
    }

    return { nodes, rootId };
  }

  // --- Layout ---
  computeLayout() {
    if (!this.rootId) return;
    const map = new Map<number, VNode>(this.nodes.map(n => [n.id, n]));

    const layoutRec = (id: number, depth: number, xMin: number, xMax: number) => {
      const node = map.get(id)!;
      node.y = this.topPad + depth * this.levelH;
      const x = (xMin + xMax) / 2;
      node.x = x;
      if (node.left) layoutRec(node.left, depth + 1, xMin, x);
      if (node.right) layoutRec(node.right, depth + 1, x, xMax);
    };

    layoutRec(this.rootId, 0, this.marginX, this.width - this.marginX);
  }

  // --- Traversals ---
  recomputeOrder() {
    this.order = [];
    if (!this.rootId) return;
    const map = new Map<number, VNode>(this.nodes.map(n => [n.id, n]));

    const pre = (id: number) => { if (!id) return; const n = map.get(id)!; this.order.push(id); if (n.left) pre(n.left); if (n.right) pre(n.right); };
    const ino = (id: number) => { if (!id) return; const n = map.get(id)!; if (n.left) ino(n.left); this.order.push(id); if (n.right) ino(n.right); };
    const post = (id: number) => { if (!id) return; const n = map.get(id)!; if (n.left) post(n.left); if (n.right) post(n.right); this.order.push(id); };
    const level = (root: number) => { const q: number[] = [root]; while (q.length) { const u = q.shift()!; this.order.push(u); const n = map.get(u)!; if (n.left) q.push(n.left); if (n.right) q.push(n.right); } };

    switch (this.traversal) {
      case 'Preorder': pre(this.rootId); break;
      case 'Inorder': ino(this.rootId); break;
      case 'Postorder': post(this.rootId); break;
      case 'Level-order': level(this.rootId); break;
    }
  }

  // --- Playback ---
  play() { if (this.finished || this.running || !this.order.length) return; this.running = true; this.timer = setInterval(() => this.step(), this.currentDelay()); }
  pause() { this.running = false; this.stopTimer(); }
  stopTimer() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }
  currentDelay() { const mult = Math.min(2, Math.max(0.25, this.speedMultiplier || 1)); return this.baseMs / mult; }
  onSpeedChange() { if (this.running) { this.stopTimer(); this.timer = setInterval(() => this.step(), this.currentDelay()); } }

  resetTraversal() {
    this.pause();
    this.visited.clear();
    this.currentIndex = 0;
    this.currentId = null;
    this.finished = false;
  }

  onTraversalChange() {
    this.recomputeOrder();
    this.resetTraversal();
    this.lastMessage = `Traversal set to ${this.traversal}.`;
  }

  step() {
    if (this.finished) return;
    if (this.currentIndex >= this.order.length) { this.finished = true; this.lastMessage = 'Done.'; this.pause(); return; }
    const id = this.order[this.currentIndex];
    this.currentId = id;
    this.visited.add(id);
    this.currentIndex++;
    const node = this.nodes.find(n => n.id === id);
    this.lastMessage = node ? `Visit node ${node.label}.` : 'Visit node.';

    if (this.currentIndex >= this.order.length) { this.finished = true; this.lastMessage += ' Finished.'; this.pause(); }
  }

  // --- Helpers ---
  nodeById(id: number | undefined | null) { return this.nodes.find(n => n.id === id); }
  isVisited(id: number) { return this.visited.has(id); }
  isCurrent(id: number) { return this.currentId === id; }
  randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
}
