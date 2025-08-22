import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UICardComponent } from '../../../ui/card.component';
import { UIButtonComponent } from '../../../ui/button.component';
import { UIInputComponent } from '../../../ui/input.component';

@Component({
  standalone: true,
  selector: 'ah-rabin-karp',
  imports: [CommonModule, RouterLink, FormsModule, UICardComponent, UIButtonComponent, UIInputComponent],
  templateUrl: './rabin-karp.component.html',
})
export class RabinKarpComponent implements OnDestroy {
  // Input text & pattern
  text = 'abracadabra abracadabra';
  pattern = 'abra';

  // Rolling hash config (base and modulus)
  base = 257; // base for polynomial hash (≥ alphabet size)
  mod = 1_000_000_007; // large prime to reduce collisions
  maxBase = 1000;

  // Derived lengths
  n = 0; // text length
  m = 0; // pattern length

  // Hash state
  patternHash = 0;
  windowHash = 0;
  highestPow = 1; // base^(m-1) % mod for leading char removal

  // Iteration state
  i = 0; // current window start
  matches: number[] = [];
  finished = false;
  running = false;
  pausedAtEnd = false;

  // Stats
  stepCount = 0;
  hashComparisons = 0;
  charComparisons = 0;
  confirmedMatches = 0;
  collisions = 0; // hash equal but chars mismatch
  lastMessage = '';

  // Playback
  speedMultiplier = 1; // 0.25..3
  private baseMs = 650;
  private timer: any = null;

  // UI advanced flags
  showCharCodes = false;

  Math = Math;

  constructor() {
    this.recomputeAll();
  }
  ngOnDestroy(): void { this.stopTimer(); }

  // --- Lifecycle & resets ---
  recomputeAll() {
    this.stopTimer();
    this.running = false; this.finished = false; this.pausedAtEnd = false;
    this.matches = [];
    this.n = this.text.length; this.m = this.pattern.length;
    this.stepCount = this.hashComparisons = this.charComparisons = this.confirmedMatches = this.collisions = 0;
    this.i = 0; this.lastMessage = '';
    if (this.m === 0) { this.finished = true; this.lastMessage = 'Empty pattern — nothing to search.'; return; }
    if (this.n < this.m) { this.finished = true; this.lastMessage = 'Pattern longer than text.'; return; }
    // Precompute highest power base^(m-1) % mod
    this.highestPow = 1;
    for (let k = 1; k <= this.m - 1; k++) this.highestPow = (this.highestPow * this.base) % this.mod;
    // Compute pattern hash & first window hash
    this.patternHash = 0; this.windowHash = 0;
    for (let k = 0; k < this.m; k++) {
      this.patternHash = (this.patternHash * this.base + this.code(this.pattern[k])) % this.mod;
      this.windowHash = (this.windowHash * this.base + this.code(this.text[k])) % this.mod;
    }
    this.lastMessage = 'Ready. Press Play or Step to begin Rabin-Karp.';
  }

  // Character numeric code (can adjust mapping)
  code(ch: string) { return ch.charCodeAt(0); }

  // --- Rolling hash update for next window ---
  advanceWindow() {
    if (this.i + this.m >= this.n) return; // last window already hashed
    const oldChar = this.text[this.i];
    const nextChar = this.text[this.i + this.m];
    let val = this.windowHash - (this.code(oldChar) * this.highestPow) % this.mod;
    if (val < 0) val += this.mod;
    val = (val * this.base + this.code(nextChar)) % this.mod;
    this.windowHash = val;
  }

  // --- Playback controls ---
  play() { if (this.running || this.finished) return; this.running = true; this.timer = setInterval(()=>this.step(), this.delay()); }
  pause() { this.running = false; this.stopTimer(); }
  toggle() { this.running ? this.pause() : this.play(); }
  delay() { const m = Math.min(3, Math.max(0.25, this.speedMultiplier || 1)); return this.baseMs / m; }
  onSpeedChange() { if (this.running) { this.stopTimer(); this.timer = setInterval(()=>this.step(), this.delay()); } }
  stopTimer() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }

  // --- Core step (one window comparison) ---
  step() {
    if (this.finished) return;
    this.stepCount++;
    if (this.i > this.n - this.m) { // safety
      this.finished = true; this.pause(); return;
    }
    // Compare hashes
    this.hashComparisons++;
    if (this.windowHash === this.patternHash) {
      // Potential match -> verify chars
      let ok = true;
      for (let k = 0; k < this.m; k++) {
        this.charComparisons++;
        if (this.text[this.i + k] !== this.pattern[k]) { ok = false; break; }
      }
      if (ok) {
        this.matches.push(this.i);
        this.confirmedMatches++;
        this.lastMessage = `Match confirmed at index ${this.i}.`;
      } else {
        this.collisions++;
        this.lastMessage = `Hash collision at index ${this.i}.`;
      }
    } else {
      this.lastMessage = `No match at index ${this.i}.`;
    }

    // Prepare next window
    this.advanceWindow();
    this.i++;
    if (this.i > this.n - this.m) { this.finished = true; this.pause(); this.lastMessage += ' Search finished.'; }
  }

  // --- Helpers for template ---
  isInWindow(idx: number) { return !this.finished && idx >= this.i && idx < this.i + this.m; }
  isMatchStart(idx: number) { return this.matches.includes(idx); }
  windowIndices(): number[] { return Array.from({length: this.m}, (_,k)=>this.i + k).filter(p=>p < this.n); }
  patternChars() { return this.pattern.split(''); }
  textChars() { return this.text.split(''); }

  matchCount() { return this.confirmedMatches; }
  collisionRate() { return this.hashComparisons ? (this.collisions / this.hashComparisons) : 0; }

  toggleCharCodes() { this.showCharCodes = !this.showCharCodes; }

  regenerateRandomText() {
    if (this.running) return;
    const alphabet = 'abcdefghijklmnopqrstuvwxyz ';
    const len = 40 + Math.floor(Math.random()*20); // 40-59
    let t = '';
    for (let i=0;i<len;i++) t += alphabet[Math.floor(Math.random()*alphabet.length)];
    this.text = t;
    if (this.pattern.length === 0) this.pattern = 'abc';
    this.recomputeAll();
  }

  randomPatternFromText() {
    if (this.text.length < 3) return;
    const L = 3 + Math.floor(Math.random()*Math.min(6, this.text.length));
    const start = Math.max(0, Math.floor(Math.random()*(this.text.length - L)));
    this.pattern = this.text.substring(start, start + L);
    this.recomputeAll();
  }

  updateBaseOrMod() {
    if (this.base < 2) this.base = 2; if (this.base > this.maxBase) this.base = this.maxBase;
    if (this.mod <= 1000) this.mod = 1009; // ensure not too tiny
    this.recomputeAll();
  }
}
