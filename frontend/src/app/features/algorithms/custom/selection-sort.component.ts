import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UICardComponent } from '../../../ui/card.component';
import { UIButtonComponent } from '../../../ui/button.component';

@Component({
  standalone: true,
  selector: 'ah-selection-sort',
  imports: [CommonModule, RouterLink, FormsModule, UICardComponent, UIButtonComponent],
  templateUrl: './selection-sort.component.html',
})
export class SelectionSortComponent implements OnDestroy {
  arr: number[] = [];
  size = 14;
  maxVal = 99;

  // Algorithm indices
  i = 0; // boundary of sorted prefix
  j = 1; // scanning index
  minIdx = 0; // current minimum index in unsorted suffix
  n = 0;

  // State
  running = false;
  finished = false;
  swapping = false;

  // Stats
  stepCount = 0;
  comparisons = 0;
  swaps = 0;
  lastMessage = '';

  // Playback
  speedMultiplier = 1; // 0.25..3
  private baseMs = 600;
  private timer: any = null;

  Math = Math;

  constructor() { this.randomizeArray(); }
  ngOnDestroy(): void { this.stopTimer(); }

  randomizeArray() {
    const n = Math.max(3, Math.min(60, Math.floor(this.size) || 8));
    this.size = n;
    this.arr = Array.from({length: n}, () => Math.floor(Math.random() * this.maxVal) + 1);
    this.n = this.arr.length;
    this.resetAlgo();
  }

  resetAlgo() {
    this.stopTimer();
    this.i = 0; this.minIdx = 0; this.j = 1;
    this.finished = this.n <= 1;
    this.running = false;
    this.swapping = false;
    this.stepCount = 0; this.comparisons = 0; this.swaps = 0;
    this.lastMessage = this.finished ? 'Trivial array.' : 'Ready. Press Play or Step to start Selection Sort.';
  }

  // Playback controls
  play() { if (this.running || this.finished) return; this.running = true; this.timer = setInterval(()=>this.step(), this.delay()); }
  pause() { this.running = false; this.stopTimer(); }
  toggle() { this.running ? this.pause() : this.play(); }
  delay() { const m = Math.min(3, Math.max(0.25, this.speedMultiplier || 1)); return this.baseMs / m; }
  onSpeedChange() { if (this.running) { this.stopTimer(); this.timer = setInterval(()=>this.step(), this.delay()); } }
  stopTimer() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }

  step() {
    if (this.finished || this.swapping) return;
    this.stepCount++;

    if (this.i >= this.n - 1) { // done
      this.finished = true; this.pause(); this.lastMessage = 'Array sorted.'; return;
    }

    // If scanning finished for current i, perform swap if needed and advance i
    if (this.j >= this.n) {
      if (this.minIdx !== this.i) {
        this.swapping = true;
        const a = this.i, b = this.minIdx;
        [this.arr[a], this.arr[b]] = [this.arr[b], this.arr[a]];
        this.swaps++;
        this.lastMessage = `Swap placed minimum ${this.arr[a]} into position ${a}.`;
        setTimeout(()=>{ this.swapping = false; this.advanceBoundary(); }, 320);
      } else {
        this.lastMessage = `Position ${this.i} already minimal (${this.arr[this.i]}).`;
        this.advanceBoundary();
      }
      return;
    }

    // Compare current j
    this.comparisons++;
    if (this.arr[this.j] < this.arr[this.minIdx]) {
      this.minIdx = this.j;
      this.lastMessage = `New minimum at index ${this.minIdx} (value ${this.arr[this.minIdx]}).`;
    } else {
      this.lastMessage = `Keep current minimum index ${this.minIdx} (value ${this.arr[this.minIdx]}).`;
    }
    this.j++;
  }

  advanceBoundary() {
    this.i++;
    if (this.i >= this.n - 1) { this.finished = true; this.pause(); this.lastMessage += ' Sorting complete.'; return; }
    this.minIdx = this.i;
    this.j = this.i + 1;
  }

  // UI helpers
  maxArrayVal() { return Math.max(...this.arr, 1); }
  barHeight(v: number) { return (Math.max(v,1) / this.maxArrayVal() * 220) + 'px'; }
  isSorted(idx: number) { return idx < this.i; }
  isCurrentMin(idx: number) { return idx === this.minIdx && !this.finished && !this.swapping; }
  isScanning(idx: number) { return idx === this.j && !this.finished && !this.swapping; }
  inActiveRange(idx: number) { return idx >= this.i && !this.finished; }
  isSwappingIndex(idx: number) { return this.swapping && (idx === this.i || idx === this.minIdx); }

  barClasses(idx: number) {
    let cls = 'relative flex items-end justify-center rounded-md text-[10px] font-semibold transition-all duration-300 select-none';
    if (this.isSwappingIndex(idx)) cls += ' outline outline-2 outline-emerald-400';
    if (this.isSorted(idx)) cls += ' bg-emerald-500 text-white shadow shadow-emerald-500/30';
    else if (this.isCurrentMin(idx)) cls += ' bg-indigo-600 text-white';
    else if (this.isScanning(idx)) cls += ' bg-amber-500 text-white';
    else if (this.inActiveRange(idx)) cls += ' bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-slate-100';
    else cls += ' bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 opacity-60';
    return cls;
  }
}
