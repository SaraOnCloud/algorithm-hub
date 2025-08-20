import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UICardComponent } from '../../../ui/card.component';

@Component({
  standalone: true,
  selector: 'ah-insertion-sort',
  imports: [CommonModule, RouterLink, FormsModule, UICardComponent],
  templateUrl: './insertion-sort.component.html',
})
export class InsertionSortComponent implements OnDestroy {
  // Data
  arr: number[] = [];
  size = 12;

  // Algorithm state
  i = 1; // current index to insert
  j = 0; // scanning left pointer
  keyVal: number | null = null;
  phase: 'pick' | 'shift' | 'insert' | 'done' = 'pick';

  // Visual highlights
  highlightCompare: number | null = null; // j index being compared
  highlightShift: number | null = null;   // j+1 index being shifted
  highlightInsert: number | null = null;  // insertion index highlight

  // Playback
  running = false;
  finished = false;
  speedMultiplier = 1; // 0.25..2
  private baseMs = 600;
  private timer: any = null;

  // Stats
  stepCount = 0;
  comparisons = 0;
  shifts = 0;
  lastMessage = '';

  constructor() {
    this.randomizeArray();
  }

  ngOnDestroy(): void { this.stopTimer(); }

  // --- Data/setup ---
  randomizeArray() {
    const n = Math.max(3, Math.min(40, Math.floor(this.size) || 3));
    this.size = n;
    const base: number[] = [];
    let cur = Math.floor(Math.random() * 10) + 5; // 5..14
    for (let i = 0; i < n; i++) {
      cur += i === 0 ? 0 : 2 + Math.floor(Math.random() * 8);
      base.push(cur);
    }
    for (let k = 0; k < Math.floor(n * 1.4); k++) {
      const a = Math.floor(Math.random() * n);
      const b = Math.floor(Math.random() * n);
      [base[a], base[b]] = [base[b], base[a]];
    }
    this.arr = base;
    this.resetAlgo();
  }

  setSize(v: number) { this.size = Math.max(3, Math.min(40, Math.floor(v) || 3)); this.randomizeArray(); }

  resetAlgo() {
    this.stopTimer();
    this.i = 1;
    this.j = 0;
    this.keyVal = null;
    this.phase = 'pick';
    this.highlightCompare = this.highlightShift = this.highlightInsert = null;
    this.running = false;
    this.finished = this.arr.length <= 1;
    this.stepCount = 0; this.comparisons = 0; this.shifts = 0;
    this.lastMessage = this.finished ? 'Array already sorted (size ≤ 1).' : 'Ready. Press Play or Step to start Insertion Sort.';
  }

  // --- Playback ---
  play() { if (this.finished || this.running) return; this.running = true; this.timer = setInterval(() => this.step(), this.currentDelay()); }
  pause() { this.running = false; this.stopTimer(); }
  stopTimer() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }
  currentDelay() { const mult = Math.min(2, Math.max(0.25, this.speedMultiplier || 1)); return this.baseMs / mult; }
  onSpeedChange() { if (this.running) { this.stopTimer(); this.timer = setInterval(() => this.step(), this.currentDelay()); } }

  // --- Step logic ---
  step() {
    if (this.finished) return;
    this.stepCount++;

    if (this.phase === 'pick') {
      if (this.i >= this.arr.length) {
        this.finished = true; this.pause(); this.lastMessage = 'Completed. Sorted.'; return;
      }
      this.keyVal = this.arr[this.i];
      this.j = this.i - 1;
      this.highlightCompare = this.j;
      this.highlightShift = this.j + 1;
      this.lastMessage = `Pick key = ${this.keyVal} at index ${this.i}.`;
      this.phase = 'shift';
      return;
    }

    if (this.phase === 'shift') {
      this.highlightInsert = null;
      if (this.j >= 0 && this.keyVal !== null && this.arr[this.j] > this.keyVal) {
        this.comparisons++;
        // shift right
        this.arr[this.j + 1] = this.arr[this.j];
        this.shifts++;
        this.j--;
        this.highlightCompare = this.j;
        this.highlightShift = this.j + 1;
        this.lastMessage = `Shift value to the right; j moves to ${this.j}.`;
        return;
      }
      // done shifting; insert
      this.phase = 'insert';
    }

    if (this.phase === 'insert') {
      const insertPos = this.j + 1;
      if (this.keyVal !== null) {
        this.arr[insertPos] = this.keyVal;
        this.highlightInsert = insertPos;
        this.lastMessage = `Insert key at index ${insertPos}.`;
      }
      this.keyVal = null;
      this.i++;
      this.phase = 'pick';
      // clear insert highlight shortly
      setTimeout(() => { if (this.highlightInsert === insertPos) this.highlightInsert = null; }, 350);
      return;
    }
  }

  // --- Helpers for UI ---
  isSortedPrefix(idx: number) { return idx < this.i && this.phase !== 'shift'; }
  isCompareIdx(idx: number) { return this.highlightCompare === idx; }
  isShiftIdx(idx: number) { return this.highlightShift === idx; }
  isInsertIdx(idx: number) { return this.highlightInsert === idx; }
  maxArrayVal() { return Math.max(...this.arr, 1); }
  barHeight(v: number) { return (Math.max(v, 1) / this.maxArrayVal() * 220) + 'px'; }
}
