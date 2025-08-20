import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UICardComponent } from '../../../ui/card.component';
import { UIButtonComponent } from '../../../ui/button.component';

@Component({
  standalone: true,
  selector: 'ah-bubble-sort',
  imports: [CommonModule, RouterLink, FormsModule, UICardComponent, UIButtonComponent],
  templateUrl: './bubble-sort.component.html',
})
export class BubbleSortComponent implements OnDestroy {
  arr: number[] = [];
  size = 12;
  maxVal = 99;

  // Algorithm state
  i = 0; // completed passes
  j = 0; // inner index comparing j and j+1
  n = 0;
  swappedInPass = false;
  finished = false;
  running = false;

  // Visual state
  currentA: number | null = null;
  currentB: number | null = null;
  swappingA: number | null = null;
  swappingB: number | null = null;

  // Stats
  stepCount = 0;
  comparisons = 0;
  swaps = 0;
  lastMessage = '';

  // Playback
  speedMultiplier = 1; // 0.25..2
  private baseMs = 600;
  private timer: any = null;

  constructor() {
    this.randomizeArray();
    this.lastMessage = 'Ready. Press Play or Step to start Bubble Sort.';
  }

  ngOnDestroy(): void { this.stopTimer(); }

  // --- Array setup ---
  randomizeArray() {
    const n = Math.max(3, Math.min(40, Math.floor(this.size) || 3));
    this.size = n;
    // create ascending base with random increments, then shuffle lightly to avoid many duplicates
    const base: number[] = [];
    let cur = Math.floor(Math.random() * 10) + 5; // 5..14
    for (let i = 0; i < n; i++) {
      cur += i === 0 ? 0 : 2 + Math.floor(Math.random() * 8); // +2..+9
      base.push(Math.min(cur, this.maxVal));
    }
    // small shuffle
    for (let k = 0; k < Math.floor(n * 1.5); k++) {
      const a = Math.floor(Math.random() * n);
      const b = Math.floor(Math.random() * n);
      [base[a], base[b]] = [base[b], base[a]];
    }
    this.arr = base;
    this.n = this.arr.length;
    this.resetAlgoState();
  }

  setSize(v: number) { this.size = Math.max(3, Math.min(40, Math.floor(v) || 3)); this.randomizeArray(); }

  resetAlgoState() {
    this.stopTimer();
    this.i = 0; this.j = 0; this.swappedInPass = false;
    this.finished = this.n <= 1;
    this.running = false;
    this.stepCount = 0; this.comparisons = 0; this.swaps = 0;
    this.currentA = this.currentB = null; this.swappingA = this.swappingB = null;
    this.lastMessage = this.finished ? 'Array already sorted (size ≤ 1).' : 'Ready. Press Play or Step to start Bubble Sort.';
  }

  // --- Playback ---
  play() { if (this.finished || this.running) return; this.running = true; this.timer = setInterval(() => this.step(), this.currentDelay()); }
  pause() { this.running = false; this.stopTimer(); }
  stopTimer() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }
  currentDelay() { const mult = Math.min(2, Math.max(0.25, this.speedMultiplier || 1)); return this.baseMs / mult; }
  onSpeedChange() { if (this.running) { this.stopTimer(); this.timer = setInterval(() => this.step(), this.currentDelay()); } }

  // --- Algorithm step ---
  step() {
    if (this.finished) return;
    this.stepCount++;

    // If end of inner loop for current pass
    if (this.j >= this.n - this.i - 1) {
      if (!this.swappedInPass) {
        this.finished = true;
        this.currentA = this.currentB = null;
        this.lastMessage = 'No swaps this pass. Early exit: sorted.';
        this.pause();
        return;
      }
      this.i++; // one more element bubbled to the end
      this.j = 0;
      this.swappedInPass = false;
      this.currentA = this.currentB = null;
      if (this.i >= this.n - 1) {
        this.finished = true;
        this.lastMessage = 'Completed all passes. Sorted.';
        this.pause();
        return;
      }
      this.lastMessage = `Next pass (${this.i}/${this.n - 1}).`;
      return;
    }

    const a = this.j;
    const b = this.j + 1;
    this.currentA = a; this.currentB = b;
    this.comparisons++;

    const va = this.arr[a], vb = this.arr[b];
    if (va > vb) {
      // swap
      this.swaps++;
      this.swappedInPass = true;
      this.swappingA = a; this.swappingB = b;
      [this.arr[a], this.arr[b]] = [this.arr[b], this.arr[a]];
      this.lastMessage = `Swap positions ${a} and ${b} (${va} > ${vb}).`;
      // clear swap highlight shortly
      setTimeout(() => { this.swappingA = this.swappingB = null; }, 350);
    } else {
      this.lastMessage = `Keep positions ${a} and ${b} (${va} ≤ ${vb}).`;
    }

    this.j++;
  }

  // --- Helpers for UI ---
  isCurrentIndex(idx: number) { return idx === this.currentA || idx === this.currentB; }
  isSwappingIndex(idx: number) { return idx === this.swappingA || idx === this.swappingB; }
  isSortedIndex(idx: number) { return idx >= this.n - this.i && this.i > 0; }
  maxArrayVal() { return Math.max(...this.arr, 1); }
  barHeight(v: number) { return (Math.max(v, 1) / this.maxArrayVal() * 220) + 'px'; }
}
