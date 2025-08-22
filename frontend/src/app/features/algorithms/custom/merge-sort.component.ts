import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UICardComponent } from '../../../ui/card.component';
import { UIButtonComponent } from '../../../ui/button.component';

@Component({
  standalone: true,
  selector: 'ah-merge-sort',
  imports: [CommonModule, RouterLink, FormsModule, UICardComponent, UIButtonComponent],
  templateUrl: './merge-sort.component.html',
})
export class MergeSortComponent implements OnDestroy {
  arr: number[] = [];
  aux: number[] = [];
  size = 14;
  maxVal = 99;

  // Bottom-up merge sort state
  width = 1; // current subarray width being merged
  leftStart = 0; // start index of current merge
  mid = 0; // mid (start of right half)
  rightEnd = 0; // exclusive end of current merge range
  i = 0; // current index in left half (absolute)
  j = 0; // current index in right half (absolute)
  k = 0; // write index in main array
  passCopied = false; // whether aux has been synced for current pass

  // Playback / control
  running = false;
  finished = false;
  speedMultiplier = 1; // 0.25..3
  private baseMs = 500;
  private timer: any = null;

  // Stats
  stepCount = 0;
  comparisons = 0;
  writes = 0;
  mergesCompleted = 0;
  passesCompleted = 0;
  lastMessage = '';

  Math = Math;

  constructor() { this.randomizeArray(); }
  ngOnDestroy(): void { this.stop(); }

  // --- Array setup ---
  randomizeArray() {
    const n = Math.max(3, Math.min(60, Math.floor(this.size) || 8));
    this.size = n;
    const a: number[] = [];
    for (let i = 0; i < n; i++) a.push(Math.floor(Math.random() * this.maxVal) + 1);
    this.arr = a;
    this.resetState();
  }

  resetState() {
    this.stop();
    this.aux = [...this.arr];
    this.width = 1;
    this.leftStart = 0;
    this.passCopied = false;
    this.finished = this.arr.length <= 1;
    this.stepCount = 0; this.comparisons = 0; this.writes = 0; this.mergesCompleted = 0; this.passesCompleted = 0;
    this.lastMessage = this.finished ? 'Trivial array.' : 'Ready. Press Play or Step to start Merge Sort.';
    if (!this.finished) this.initCurrentMerge();
  }

  // Playback
  play() { if (this.running || this.finished) return; this.running = true; this.timer = setInterval(() => this.step(), this.delay()); }
  pause() { this.running = false; this.stopTimer(); }
  toggle() { this.running ? this.pause() : this.play(); }
  delay() { const m = Math.min(3, Math.max(0.25, this.speedMultiplier || 1)); return this.baseMs / m; }
  onSpeedChange() { if (this.running) { this.stopTimer(); this.timer = setInterval(() => this.step(), this.delay()); } }
  stopTimer() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }
  stop() { this.pause(); }

  // Initialize current merge boundaries
  initCurrentMerge() {
    const n = this.arr.length;
    if (this.leftStart >= n) { // move to next pass
      this.width *= 2;
      this.passesCompleted++;
      if (this.width >= n) { this.finished = true; this.lastMessage = 'All passes complete. Sorted.'; this.pause(); return; }
      this.leftStart = 0;
      this.passCopied = false; // need fresh copy for new pass
    }
    if (this.finished) return;

    if (!this.passCopied) { // copy arr to aux for new pass
      this.aux = [...this.arr];
      this.passCopied = true;
      this.lastMessage = `Start new pass width=${this.width}. Copy array to auxiliary.`;
    }

    const l = this.leftStart;
    const m = l + this.width;
    const r = Math.min(l + this.width * 2, this.arr.length);
    this.mid = Math.min(m, this.arr.length);
    this.rightEnd = r;
    this.i = l;
    this.j = this.mid;
    this.k = l;

    // If right half empty, skip merge (already sorted segment)
    if (this.mid >= this.rightEnd) {
      this.lastMessage = `Skip singleton segment [${l}, ${this.rightEnd}).`;
      this.finishCurrentMerge();
      return;
    }
    this.lastMessage = `Merge ranges [${l}, ${this.mid}) and [${this.mid}, ${this.rightEnd}).`;
  }

  finishCurrentMerge() {
    this.mergesCompleted++;
    this.leftStart += this.width * 2;
    this.initCurrentMerge();
  }

  // One algorithm micro-step: either a comparison+write or draining remainder
  step() {
    if (this.finished) return;
    this.stepCount++;

    // If current merge already done (k reached rightEnd)
    if (this.k >= this.rightEnd) { this.lastMessage = `Completed merge for [${this.leftStart - this.width * 2}, ${this.rightEnd}).`; this.finishCurrentMerge(); return; }

    // If left part consumed
    if (this.i >= this.mid) {
      this.arr[this.k++] = this.aux[this.j++];
      this.writes++;
      this.lastMessage = `Drain right value → position ${this.k - 1}.`;
      if (this.k >= this.rightEnd) this.finishCurrentMerge();
      return;
    }
    // If right part consumed
    if (this.j >= this.rightEnd) {
      this.arr[this.k++] = this.aux[this.i++];
      this.writes++;
      this.lastMessage = `Drain left value → position ${this.k - 1}.`;
      if (this.k >= this.rightEnd) this.finishCurrentMerge();
      return;
    }

    // Compare next elements
    const leftVal = this.aux[this.i];
    const rightVal = this.aux[this.j];
    this.comparisons++;
    if (leftVal <= rightVal) {
      this.arr[this.k++] = leftVal; this.i++; this.writes++;
      this.lastMessage = `Take left (${leftVal} ≤ ${rightVal}). Write at ${this.k - 1}.`;
    } else {
      this.arr[this.k++] = rightVal; this.j++; this.writes++;
      this.lastMessage = `Take right (${rightVal} < ${leftVal}). Write at ${this.k - 1}.`;
    }

    // Completed range?
    if (this.k >= this.rightEnd) this.finishCurrentMerge();
  }

  // Helpers for template visualization
  isInCurrentRange(idx: number) { return !this.finished && idx >= this.leftStart && idx < this.rightEnd; }
  isLeft(idx: number) { return this.isInCurrentRange(idx) && idx < this.mid; }
  isRight(idx: number) { return this.isInCurrentRange(idx) && idx >= this.mid; }
  isConsumed(idx: number) { return this.isInCurrentRange(idx) && idx < this.k; }
  isActiveLeft(idx: number) { return idx === this.i && this.i < this.mid; }
  isActiveRight(idx: number) { return idx === this.j && this.j < this.rightEnd; }
  isJustWritten(idx: number) { return idx === this.k - 1 && this.k - 1 >= this.leftStart && this.k - 1 < this.rightEnd; }
  maxArrayVal() { return Math.max(...this.arr, 1); }
  barHeight(v: number) { return (Math.max(v,1) / this.maxArrayVal() * 220) + 'px'; }
  barClasses(idx: number) {
    let cls = 'relative flex items-end justify-center rounded-md text-[10px] font-semibold transition-all duration-300 select-none';
    if (this.isInCurrentRange(idx)) cls += ' ring-1 ring-indigo-400/40';
    if (this.isConsumed(idx)) cls += ' opacity-70';
    if (this.isJustWritten(idx)) cls += ' outline outline-2 outline-emerald-400';
    if (this.isActiveLeft(idx)) cls += ' bg-indigo-500 text-white shadow';
    else if (this.isActiveRight(idx)) cls += ' bg-amber-500 text-white shadow';
    else if (this.isLeft(idx)) cls += ' bg-indigo-200 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-200';
    else if (this.isRight(idx)) cls += ' bg-amber-200 dark:bg-amber-700 text-amber-900 dark:text-amber-100';
    else cls += ' bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100';
    return cls;
  }

  progressPercent() {
    const n = this.arr.length;
    if (n <= 1) return 100;
    // approximate progress: passes completed plus fraction of current pass merges done
    const mergesInPass = Math.ceil(n / (this.width * 2));
    const mergesDoneThisPass = Math.min(mergesInPass, Math.floor(this.leftStart / (this.width * 2)));
    const passFraction = mergesInPass ? mergesDoneThisPass / mergesInPass : 0;
    const totalPasses = Math.ceil(Math.log2(n));
    const overall = (this.passesCompleted + passFraction) / totalPasses * 100;
    return Math.min(100, Math.max(0, overall));
  }
}
