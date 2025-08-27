import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UICardComponent } from '../../../ui/card.component';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'ah-knapsack-01',
  imports: [CommonModule, FormsModule, RouterLink, UICardComponent],
  templateUrl: './knapsack-01.component.html',
  styleUrls: ['./knapsack-01.component.scss']
})
export class Knapsack01Component implements OnInit {
  items: Array<{ id: number; name: string; weight: number; value: number; color: string }> = [];
  capacity = 10;
  maxCapacity = 20;

  // DP tables
  dp: number[][] = [];
  take: boolean[][] = [];

  // stepping state
  i = 0; // row (0..n)
  w = 0; // col (0..capacity)
  running = false;
  autoplay = false;
  speed = 700; // ms
  private timer: any = null;

  // derived/result
  finished = false;
  solution: number[] = []; // indices of items included

  ngOnInit() {
    this.seedItems();
    this.resetTables();
  }

  seedItems() {
    if (this.items.length) return;
    this.items = [
      { id: 1, name: 'Watch', weight: 3, value: 6, color: '#06b6d4' },
      { id: 2, name: 'Book', weight: 2, value: 4, color: '#f59e0b' },
      { id: 3, name: 'Camera', weight: 4, value: 5, color: '#8b5cf6' },
      { id: 4, name: 'Laptop', weight: 5, value: 8, color: '#22c55e' },
    ];
  }

  resetTables() {
    const n = this.items.length;
    const C = this.capacity;
    this.dp = Array.from({ length: n + 1 }, () => Array(C + 1).fill(0));
    this.take = Array.from({ length: n + 1 }, () => Array(C + 1).fill(false));
    this.i = 0;
    this.w = 0;
    this.running = false;
    this.autoplay = false;
    this.finished = false;
    this.solution = [];
    this.clearTimer();
  }

  onCapacityChange() {
    if (this.capacity > this.maxCapacity) this.capacity = this.maxCapacity;
    if (this.capacity < 0) this.capacity = 0;
    this.resetTables();
  }

  addItem() {
    const id = Math.max(0, ...this.items.map(i => i.id)) + 1;
    const palette = ['#06b6d4', '#f59e0b', '#8b5cf6', '#22c55e', '#ef4444', '#0ea5e9', '#e879f9'];
    const color = palette[id % palette.length];
    const weight = Math.max(1, Math.floor(Math.random() * 6));
    const value = Math.max(1, Math.floor(Math.random() * 10));
    this.items.push({ id, name: `Item ${id}`, weight, value, color });
    this.resetTables();
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
    this.resetTables();
  }

  randomize() {
    this.items.forEach(it => {
      it.weight = Math.max(1, Math.floor(Math.random() * 6));
      it.value = Math.max(1, Math.floor(Math.random() * 12));
    });
    this.capacity = Math.min(this.maxCapacity, Math.max(4, Math.floor(Math.random() * 16)));
    this.resetTables();
  }

  toggleAutoplay() {
    this.autoplay = !this.autoplay;
    if (this.autoplay) {
      this.running = true;
      this.timer = setInterval(() => {
        if (!this.stepForward()) {
          this.autoplay = false;
          this.running = false;
          this.clearTimer();
        }
      }, this.speed);
    } else {
      this.running = false;
      this.clearTimer();
    }
  }

  setSpeed(ms: number) {
    this.speed = ms;
    if (this.autoplay) {
      this.clearTimer();
      this.toggleAutoplay(); // will stop, so start again
      this.toggleAutoplay();
    }
  }

  stepForward(): boolean {
    if (this.finished) return false;
    const n = this.items.length;
    const C = this.capacity;

    // advance to next cell (i, w)
    if (this.i === 0 && this.w === 0) {
      // first cell is already 0
    }

    // compute current cell if inside table and not first row
    if (!(this.i === 0)) {
      const item = this.items[this.i - 1];
      if (item) {
        if (item.weight <= this.w) {
          const include = item.value + this.dp[this.i - 1][this.w - item.weight];
          const exclude = this.dp[this.i - 1][this.w];
          if (include > exclude) {
            this.dp[this.i][this.w] = include;
            this.take[this.i][this.w] = true;
          } else {
            this.dp[this.i][this.w] = exclude;
            this.take[this.i][this.w] = false;
          }
        } else {
          this.dp[this.i][this.w] = this.dp[this.i - 1][this.w];
          this.take[this.i][this.w] = false;
        }
      }
    }

    // move pointer to next cell
    if (this.w < C) {
      this.w++;
    } else {
      this.w = 0;
      if (this.i < n) {
        this.i++;
      } else {
        // finished filling last cell
        this.finished = true;
        this.running = false;
        this.clearTimer();
        this.backtrackSolution();
        return false;
      }
    }
    this.running = true;
    return true;
  }

  stepBackward() {
    // Recompute up to previous cell for simplicity
    const prev = this.linearIndex() - 1;
    if (prev < 0) return;
    this.resetTables();
    for (let k = 0; k <= prev; k++) this.stepForward();
    this.running = false;
    this.autoplay = false;
  }

  private linearIndex(): number {
    return this.i * (this.capacity + 1) + this.w;
  }

  private backtrackSolution() {
    const n = this.items.length;
    let w = this.capacity;
    const chosen: number[] = [];
    for (let i = n; i >= 1; i--) {
      if (this.take[i][w]) {
        chosen.push(i - 1);
        w -= this.items[i - 1].weight;
      }
    }
    this.solution = chosen.reverse();
  }

  clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  trackByIndex(i: number) { return i; }
}
