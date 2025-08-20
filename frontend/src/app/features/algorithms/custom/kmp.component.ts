import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UICardComponent } from '../../../ui/card.component';

type Stage = 'buildLPS' | 'search' | 'done';

@Component({
  standalone: true,
  selector: 'ah-kmp',
  imports: [CommonModule, RouterLink, FormsModule, UICardComponent],
  templateUrl: './kmp.component.html',
})
export class KmpComponent implements OnDestroy {
  // Input strings
  text = 'ABABDABACDABABCABAB';
  pattern = 'ABABCABAB';

  // LPS table
  lps: number[] = [];
  lpsI = 1; // current index while building LPS
  lpsLen = 0; // length of previous longest prefix suffix

  // Search pointers
  iText = 0;
  jPat = 0;

  // Stage
  stage: Stage = 'buildLPS';

  // Playback
  running = false;
  finished = false;
  speedMultiplier = 1;
  private baseMs = 600;
  private timer: any = null;

  // Status
  stepCount = 0;
  lastMessage = '';
  matches: number[] = [];

  // Highlight helpers
  compareTextIdx: number | null = null;
  comparePatIdx: number | null = null;
  insertLpsIdx: number | null = null;

  constructor() {
    this.resetAll();
  }

  ngOnDestroy(): void { this.stopTimer(); }

  // --- Control ---
  resetAll() {
    this.stopTimer();
    this.buildLpsReset();
    this.searchReset(true);
    this.stage = 'buildLPS';
    this.finished = false;
    this.running = false;
    this.stepCount = 0;
    this.lastMessage = 'Ready. Enter text/pattern or press Play.';
  }

  onTextChange() { this.resetAll(); }
  onPatternChange() { this.resetAll(); }

  play() { if (this.finished || this.running) return; this.running = true; this.timer = setInterval(() => this.step(), this.currentDelay()); }
  pause() { this.running = false; this.stopTimer(); }
  stopTimer() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }
  currentDelay() { const m = Math.min(2, Math.max(0.25, this.speedMultiplier || 1)); return this.baseMs / m; }
  onSpeedChange() { if (this.running) { this.stopTimer(); this.timer = setInterval(() => this.step(), this.currentDelay()); } }

  // --- LPS build ---
  buildLpsReset() {
    const m = this.pattern.length;
    this.lps = Array(Math.max(m, 0)).fill(0);
    this.lpsI = 1;
    this.lpsLen = 0;
    this.insertLpsIdx = null;
  }

  buildLpsStep(): boolean {
    const m = this.pattern.length;
    if (m <= 1 || this.lpsI >= m) return false;

    const chI = this.pattern[this.lpsI];
    const chLen = this.pattern[this.lpsLen];
    this.comparePatIdx = this.lpsI;
    // compare pattern[lpsI] with pattern[lpsLen]
    if (chI === chLen) {
      this.lpsLen++;
      this.lps[this.lpsI] = this.lpsLen;
      this.insertLpsIdx = this.lpsI;
      this.lastMessage = `LPS: match at i=${this.lpsI}. Set lps[${this.lpsI}] = ${this.lpsLen}.`;
      this.lpsI++;
      return true;
    } else {
      if (this.lpsLen !== 0) {
        this.lpsLen = this.lps[this.lpsLen - 1];
        this.lastMessage = `LPS: mismatch at i=${this.lpsI}. Move len to lps[len-1] = ${this.lpsLen}.`;
        return true; // continue next step without incrementing i
      } else {
        this.lps[this.lpsI] = 0;
        this.insertLpsIdx = this.lpsI;
        this.lastMessage = `LPS: mismatch with len=0. Set lps[${this.lpsI}] = 0.`;
        this.lpsI++;
        return true;
      }
    }
  }

  // --- Search ---
  searchReset(clearMatches = false) {
    this.iText = 0; this.jPat = 0;
    if (clearMatches) this.matches = [];
    this.compareTextIdx = null; this.comparePatIdx = null;
  }

  searchStep(): boolean {
    const n = this.text.length; const m = this.pattern.length;
    if (m === 0) { this.lastMessage = 'Empty pattern matches at index 0.'; this.matches = [0]; return false; }
    if (n === 0) { this.lastMessage = 'Empty text. Nothing to search.'; return false; }
    if (this.iText >= n) return false;

    this.compareTextIdx = this.iText;
    this.comparePatIdx = this.jPat;

    if (this.text[this.iText] === this.pattern[this.jPat]) {
      this.iText++; this.jPat++;
      this.lastMessage = 'Match. Advance both i and j.';
      if (this.jPat === m) {
        const pos = this.iText - this.jPat;
        this.matches.push(pos);
        this.lastMessage = `Pattern found at index ${pos}. Continue with j = lps[j-1].`;
        this.jPat = this.lps[m - 1];
      }
      return true;
    } else {
      if (this.jPat !== 0) {
        this.jPat = this.lps[this.jPat - 1];
        this.lastMessage = `Mismatch. Set j = lps[j-1] = ${this.jPat}.`;
        return true;
      } else {
        this.iText++;
        this.lastMessage = 'Mismatch with j=0. Increment i.';
        return true;
      }
    }
  }

  // --- Step orchestrator ---
  step() {
    if (this.finished) return;
    this.stepCount++;
    this.insertLpsIdx = null;

    if (this.stage === 'buildLPS') {
      const progressed = this.buildLpsStep();
      if (!progressed || this.lpsI >= this.pattern.length) {
        this.stage = 'search';
        this.lastMessage = 'LPS built. Starting search…';
      }
      return;
    }

    if (this.stage === 'search') {
      const progressed = this.searchStep();
      if (!progressed || this.iText >= this.text.length) {
        this.stage = 'done';
        this.finished = true; this.pause();
        this.lastMessage = 'Search finished.';
      }
      return;
    }
  }

  // --- UI helpers ---
  patternStart() { return this.iText - this.jPat; }
  gap(n: number) { const len = n > 0 ? n : 0; return Array.from({ length: len }); }
  isCompareText(idx: number) { return this.compareTextIdx === idx; }
  isComparePat(idx: number) { return this.comparePatIdx === idx; }
  isMatchedPat(idx: number) { return idx < this.jPat; }
  isInsertLps(idx: number) { return this.insertLpsIdx === idx; }
  isCurrentLpsPos(idx: number) { return this.lpsI === idx; }
}
