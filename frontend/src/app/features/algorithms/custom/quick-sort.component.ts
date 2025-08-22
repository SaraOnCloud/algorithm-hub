import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UICardComponent } from '../../../ui/card.component';
import { UIButtonComponent } from '../../../ui/button.component';

interface QSegment {
  l: number; r: number; phase: 'choose' | 'scan' | 'finalize' | 'done';
  i: number; store: number; pivotVal: number | null; pivotPos: number | null; origPivotIndex: number | null;
}

@Component({
  standalone: true,
  selector: 'ah-quick-sort',
  imports: [CommonModule, RouterLink, FormsModule, UICardComponent, UIButtonComponent],
  templateUrl: './quick-sort.component.html',
})
export class QuickSortComponent implements OnDestroy {
  arr: number[] = [];
  size = 14;
  maxVal = 99;

  stack: QSegment[] = [];
  fixed = new Set<number>(); // indices whose final position is determined
  current: QSegment | null = null;

  // Stats / state
  comparisons = 0;
  swaps = 0;
  partitions = 0;
  stepCount = 0;
  maxDepth = 0;
  lastMessage = '';
  finished = false;
  running = false;

  // Playback
  speedMultiplier = 1; // 0.25..3
  private baseMs = 600;
  private timer: any = null;

  // Options
  randomPivot = true; // allow toggling random pivot

  Math = Math;

  constructor() { this.randomizeArray(); }
  ngOnDestroy(): void { this.stopTimer(); }

  randomizeArray() {
    const n = Math.max(3, Math.min(60, Math.floor(this.size) || 8));
    this.size = n;
    this.arr = Array.from({length: n}, () => Math.floor(Math.random() * this.maxVal) + 1);
    this.resetAlgo();
  }

  resetAlgo() {
    this.stopTimer();
    this.stack = [{ l: 0, r: this.arr.length - 1, phase: 'choose', i: 0, store: 0, pivotVal: null, pivotPos: null, origPivotIndex: null }];
    this.fixed.clear();
    this.current = null;
    this.comparisons = 0; this.swaps = 0; this.partitions = 0; this.stepCount = 0; this.maxDepth = 1;
    this.finished = this.arr.length <= 1;
    if (this.finished && this.arr.length === 1) this.fixed.add(0);
    this.lastMessage = this.finished ? 'Trivial array.' : 'Ready. Press Play or Step to start Quick Sort.';
  }

  // Playback controls
  play() { if (this.running || this.finished) return; this.running = true; this.timer = setInterval(()=>this.step(), this.delay()); }
  pause() { this.running = false; this.stopTimer(); }
  toggle() { this.running ? this.pause() : this.play(); }
  delay() { const m = Math.min(3, Math.max(0.25, this.speedMultiplier || 1)); return this.baseMs / m; }
  onSpeedChange() { if (this.running) { this.stopTimer(); this.timer = setInterval(()=>this.step(), this.delay()); } }
  stopTimer() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }

  // Algorithm step
  step() {
    if (this.finished) return;
    if (!this.current) this.current = this.stack[this.stack.length - 1] || null;
    if (!this.current) { this.finished = true; this.lastMessage = 'Done.'; this.pause(); return; }

    this.stepCount++;
    const seg = this.current;

    switch (seg.phase) {
      case 'choose':
        this.choosePivot(seg);
        break;
      case 'scan':
        this.scanStep(seg);
        break;
      case 'finalize':
        this.finalizePivot(seg);
        break;
      case 'done':
        this.advanceSegment();
        break;
    }
    this.maxDepth = Math.max(this.maxDepth, this.stack.length);
  }

  choosePivot(seg: QSegment) {
    if (seg.l >= seg.r) { // size 1 or empty segment
      if (seg.l === seg.r) this.fixed.add(seg.l);
      seg.phase = 'done';
      this.lastMessage = `Segment [${seg.l},${seg.r}] trivial.`;
      this.advanceSegment();
      return;
    }
    const pivotIndex = this.randomPivot ? (seg.l + Math.floor(Math.random() * (seg.r - seg.l + 1))) : seg.r;
    seg.origPivotIndex = pivotIndex;
    const r = seg.r;
    if (pivotIndex !== r) { this.swap(pivotIndex, r); }
    seg.pivotPos = r;
    seg.pivotVal = this.arr[r];
    seg.store = seg.l;
    seg.i = seg.l;
    seg.phase = 'scan';
    this.lastMessage = `Choose pivot value ${seg.pivotVal} from index ${pivotIndex}, move to end.`;
  }

  scanStep(seg: QSegment) {
    if (seg.i < seg.r) {
      const val = this.arr[seg.i];
      this.comparisons++;
      if (val <= (seg.pivotVal as number)) {
        if (seg.i !== seg.store) this.swap(seg.i, seg.store);
        seg.store++;
        this.lastMessage = `arr[i]=${val} ≤ pivot ${seg.pivotVal}. Move forward; store=${seg.store}.`;
      } else {
        this.lastMessage = `arr[i]=${val} > pivot ${seg.pivotVal}. Leave in place.`;
      }
      seg.i++;
      if (seg.i === seg.r) seg.phase = 'finalize';
    } else {
      seg.phase = 'finalize';
    }
  }

  finalizePivot(seg: QSegment) {
    const store = seg.store;
    const r = seg.r;
    if (store !== r) this.swap(store, r);
    // pivot now at store
    this.fixed.add(store);
    this.partitions++;
    this.lastMessage = `Place pivot at final index ${store}. Partition done.`;
    // push children segments
    const leftL = seg.l, leftR = store - 1;
    const rightL = store + 1, rightR = seg.r;
    seg.phase = 'done';
    this.advanceSegment();
    if (rightL < rightR) this.stack.push({ l: rightL, r: rightR, phase: 'choose', i: rightL, store: rightL, pivotVal: null, pivotPos: null, origPivotIndex: null });
    else if (rightL === rightR) { this.fixed.add(rightL); }
    if (leftL < leftR) this.stack.push({ l: leftL, r: leftR, phase: 'choose', i: leftL, store: leftL, pivotVal: null, pivotPos: null, origPivotIndex: null });
    else if (leftL === leftR) { this.fixed.add(leftL); }
  }

  advanceSegment() {
    // Remove any done segments from top
    while (this.stack.length && this.stack[this.stack.length - 1].phase === 'done') this.stack.pop();
    this.current = this.stack[this.stack.length - 1] || null;
    if (!this.current) { this.finished = true; this.lastMessage += ' Sorting complete.'; this.pause(); }
  }

  swap(a: number, b: number) { const tmp = this.arr[a]; this.arr[a] = this.arr[b]; this.arr[b] = tmp; this.swaps++; }

  // Helpers for UI
  barHeight(v: number) { const max = Math.max(...this.arr, 1); return (Math.max(v,1) / max * 220) + 'px'; }
  isPivot(idx: number) { return !!this.current && this.current.pivotPos === idx && this.current.phase !== 'done'; }
  isScanning(idx: number) { return !!this.current && this.current.phase === 'scan' && this.current.i === idx; }
  isStore(idx: number) { return !!this.current && this.current.phase === 'scan' && this.current.store === idx; }
  inCurrentSegment(idx: number) { return !!this.current && idx >= this.current.l && idx <= this.current.r && this.current.phase !== 'done'; }
  isFixed(idx: number) { return this.fixed.has(idx); }

  barClasses(idx: number) {
    let cls = 'relative flex items-end justify-center rounded-md text-[10px] font-semibold transition-all duration-300 select-none';
    if (this.isFixed(idx)) cls += ' bg-emerald-500 text-white shadow shadow-emerald-500/30';
    else if (this.isPivot(idx)) cls += ' bg-indigo-600 text-white';
    else if (this.isScanning(idx)) cls += ' bg-amber-500 text-white';
    else if (this.isStore(idx)) cls += ' bg-sky-500 text-white';
    else if (this.inCurrentSegment(idx)) cls += ' bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-slate-100';
    else cls += ' bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 opacity-60';
    return cls;
  }

  segmentLabel(idx: number) {
    if (!this.current) return '';
    if (this.isPivot(idx)) return 'P';
    if (this.isScanning(idx)) return 'i';
    if (this.isStore(idx)) return 's';
    return '';
  }

  stackDepth() { return this.stack.length; }
  pivotStrategyLabel() { return this.randomPivot ? 'Random pivot' : 'Last element pivot'; }
  togglePivotStrategy() { if (this.running) return; this.randomPivot = !this.randomPivot; this.resetAlgo(); }
}
