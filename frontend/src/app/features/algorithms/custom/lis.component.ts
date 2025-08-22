import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UICardComponent } from '../../../ui/card.component';
import { UIButtonComponent } from '../../../ui/button.component';
import { UIInputComponent } from '../../../ui/input.component';

@Component({
  standalone: true,
  selector: 'ah-lis',
  imports: [CommonModule, RouterLink, FormsModule, UICardComponent, UIButtonComponent, UIInputComponent],
  templateUrl: './lis.component.html',
})
export class LisComponent implements OnDestroy {
  // Data & configuration
  arr: number[] = [];
  size = 12;
  maxVal = 99;

  // Algorithm selection
  mode: 'dp' | 'patience' = 'dp'; // dp: O(n^2), patience: O(n log n)

  // --- O(n^2) DP state ---
  dp: number[] = [];// dp[i] length of LIS ending at i
  prev: number[] = [];// predecessor index

  // --- Patience state ---
  piles: number[][] = []; // conceptual piles (values)
  pileTops: number[] = []; // top values (tails)
  pileIdxForElement: number[] = []; // which pile each element assigned to
  parent: number[] = []; // reconstruction parent for patience method
  tailIndices: number[] = []; // indices of minimal tail for each length
  lisEndIndex: number | null = null; // end index for patience reconstruction

  // Shared / playback state
  i = 0; // current outer index (or current element index in patience)
  j = 0; // inner loop index for DP compare
  bestLen = 0; // best LIS length so far
  lisPathIndices: number[] = []; // indices forming current reconstructed LIS
  running = false;
  finished = false;
  stepCount = 0;
  comparisons = 0;
  updates = 0;
  lastMessage = '';

  speedMultiplier = 1; // 0.25..3
  private baseMs = 650;
  private timer: any = null;

  // Expose Math if needed in template
  Math = Math;

  constructor() {
    this.randomizeArray();
  }

  ngOnDestroy(): void { this.stopTimer(); }

  // --- Array setup ---
  randomizeArray() {
    const n = Math.max(4, Math.min(40, Math.floor(this.size) || 8));
    this.size = n;
    const uniqueBias = Math.random() < 0.6; // sometimes allow duplicates
    const a: number[] = [];
    for (let k = 0; k < n; k++) {
      const val = uniqueBias ? Math.floor(Math.random() * this.maxVal) : Math.floor(Math.random() * (this.maxVal / 2)) + (k % 5) * 2;
      a.push(val);
    }
    this.arr = a;
    this.resetState();
  }

  setSize(v: number) { this.size = v; this.randomizeArray(); }

  // --- Reset & init ---
  resetState() {
    this.stopTimer();
    this.running = false;
    this.finished = this.arr.length <= 1;
    this.i = 0; this.j = 0; this.bestLen = 0; this.stepCount = 0; this.comparisons = 0; this.updates = 0;
    this.lisPathIndices = [];

    // DP init
    this.dp = Array(this.arr.length).fill(1);
    this.prev = Array(this.arr.length).fill(-1);

    // Patience init
    this.piles = [];
    this.pileTops = [];
    this.pileIdxForElement = Array(this.arr.length).fill(-1);
    this.parent = Array(this.arr.length).fill(-1);
    this.tailIndices = [];
    this.lisEndIndex = null;

    this.lastMessage = this.finished ? 'Trivial sequence.' : 'Ready. Choose a mode and press Play or Step.';
  }

  // Playback controls
  play() { if (this.running || this.finished) return; this.running = true; this.timer = setInterval(() => this.step(), this.currentDelay()); }
  pause() { this.running = false; this.stopTimer(); }
  toggle() { this.running ? this.pause() : this.play(); }
  currentDelay() { const m = Math.min(3, Math.max(0.25, this.speedMultiplier || 1)); return this.baseMs / m; }
  onSpeedChange() { if (this.running) { this.stopTimer(); this.timer = setInterval(() => this.step(), this.currentDelay()); } }
  stopTimer() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }

  switchMode(m: 'dp' | 'patience') {
    if (this.mode === m) return;
    this.mode = m;
    this.resetState();
  }

  // --- Algorithm steps dispatcher ---
  step() {
    if (this.finished) return;
    this.stepCount++;
    if (this.mode === 'dp') this.stepDP(); else this.stepPatience();
  }

  // --- O(n^2) DP step ---
  private stepDP() {
    const n = this.arr.length;
    if (n <= 1) { this.finished = true; return; }

    if (this.i >= n) { // done all outer iterations
      this.reconstructDPFinal();
      this.finished = true; this.pause();
      this.lastMessage = 'Completed DP. Length = ' + this.bestLen + '.';
      return;
    }

    // When starting a new i
    if (this.j === 0) {
      this.lastMessage = `Evaluating extensions ending at index ${this.i} (value ${this.arr[this.i]}).`;
    }

    if (this.j < this.i) {
      // compare arr[j] < arr[i]
      const a = this.arr[this.j];
      const b = this.arr[this.i];
      this.comparisons++;
      if (a < b) {
        if (this.dp[this.j] + 1 > this.dp[this.i]) {
          this.dp[this.i] = this.dp[this.j] + 1;
          this.prev[this.i] = this.j;
          this.updates++;
          this.lastMessage = `Update: extend subsequence at ${this.j} (len ${this.dp[this.j]}) with value ${b} → new len ${this.dp[this.i]}.`;
        } else {
          this.lastMessage = `No update: using index ${this.j} gives length ${this.dp[this.j] + 1} ≤ current ${this.dp[this.i]}.`;
        }
      } else {
        this.lastMessage = `Skip: arr[${this.j}]=${a} not < arr[${this.i}]=${b}.`;
      }
      this.j++;
      return;
    }

    // Completed inner loop for i
    if (this.dp[this.i] > this.bestLen) this.bestLen = this.dp[this.i];
    this.j = 0;
    this.i++;

    if (this.i >= n) {
      this.reconstructDPFinal();
      this.finished = true; this.pause();
      this.lastMessage = 'DP finished. LIS length ' + this.bestLen + '.';
    }
  }

  private reconstructDPFinal() {
    let idx = 0;
    let best = 0;
    for (let k = 0; k < this.dp.length; k++) if (this.dp[k] > best) { best = this.dp[k]; idx = k; }
    this.bestLen = best;
    const seq: number[] = [];
    while (idx !== -1) { seq.push(idx); idx = this.prev[idx]; }
    this.lisPathIndices = seq.reverse();
  }

  // --- Patience step (incremental) ---
  private stepPatience() {
    const n = this.arr.length;
    if (n === 0) { this.finished = true; return; }

    if (this.i >= n) {
      // finalize reconstruction once
      if (this.lisPathIndices.length === 0) this.reconstructPatience();
      this.finished = true; this.pause();
      this.lastMessage = 'Patience algorithm finished. Length = ' + this.bestLen + '.';
      return;
    }

    const val = this.arr[this.i];
    // binary search over pileTops
    let lo = 0, hi = this.pileTops.length - 1, pos = this.pileTops.length;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      this.comparisons++;
      if (this.pileTops[mid] >= val) { pos = mid; hi = mid - 1; } else lo = mid + 1;
    }
    if (pos === this.pileTops.length) {
      // new pile
      this.piles.push([val]);
      this.pileTops.push(val);
      this.lastMessage = `Create new pile ${pos} with ${val}.`;
    } else {
      // replace top
      this.piles[pos].push(val);
      this.pileTops[pos] = val;
      this.lastMessage = `Place ${val} on pile ${pos} (replace top).`;
    }
    this.pileIdxForElement[this.i] = pos;

    // parent linkage
    if (pos === 0) {
      this.parent[this.i] = -1;
    } else {
      // find latest index before i with pile index pos-1
      for (let k = this.i - 1; k >= 0; k--) {
        if (this.pileIdxForElement[k] === pos - 1) { this.parent[this.i] = k; break; }
      }
    }

    // track tails as indices (for reconstruction) using standard patience variant
    if (pos === this.tailIndices.length) {
      this.tailIndices.push(this.i);
    } else {
      this.tailIndices[pos] = this.i;
    }
    if (pos === this.tailIndices.length - 1) {
      this.lisEndIndex = this.i;
      this.bestLen = this.tailIndices.length;
    }

    this.i++;
  }

  private reconstructPatience() {
    if (this.lisEndIndex == null) return;
    const seq: number[] = [];
    let idx = this.lisEndIndex;
    while (idx !== -1 && idx != null) { seq.push(idx); idx = this.parent[idx]; }
    this.lisPathIndices = seq.reverse();
  }

  // --- Helpers for UI ---
  isInLISIndex(i: number) { return this.lisPathIndices.includes(i); }
  isCurrentOuter(i: number) { return !this.finished && this.mode === 'dp' && i === this.i; }
  isCurrentInner(i: number) { return !this.finished && this.mode === 'dp' && i === this.j && this.j < this.i; }
  dpMax() { return Math.max(...this.dp, 1); }
  barHeightDp(i: number) { return (this.dp[i] / this.dpMax() * 120) + 'px'; }
  pileClass(pIndex: number) { return 'border rounded p-2 flex flex-col gap-1 transition-colors ' + (pIndex === this.pileTops.length - 1 ? 'border-primary-500/60 bg-primary-500/5' : 'border-gray-300 dark:border-gray-700'); }
  isPileElementActive(idx: number) { return idx === this.i - 1 && !this.finished; }
  elementClasses(i: number) {
    const base = 'relative flex items-end justify-center rounded-md text-xs font-medium transition-all duration-300 px-1';
    let color = 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100';
    if (this.isInLISIndex(i)) color = 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30';
    else if (this.mode==='dp' && this.isCurrentOuter(i)) color = 'bg-indigo-500 text-white';
    else if (this.mode==='dp' && this.isCurrentInner(i)) color = 'bg-amber-500 text-white';
    else if (this.mode==='patience' && i === this.i) color = 'bg-indigo-500 text-white';
    return `${base} ${color}`;
  }

  computedHeight(i: number) {
    const val = this.arr[i];
    const max = Math.max(...this.arr, 1);
    const base = this.mode === 'dp' ? 140 : 120;
    const h = (Math.max(val,1)/max) * base + 40;
    return h + 'px';
  }

  reconstructNow() {
    if (this.mode === 'dp') this.reconstructDPFinal(); else this.reconstructPatience();
  }
}
