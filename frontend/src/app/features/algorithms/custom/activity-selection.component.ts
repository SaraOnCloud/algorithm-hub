import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UICardComponent } from '../../../ui/card.component';
import { UIButtonComponent } from '../../../ui/button.component';

interface Activity { id: number; start: number; end: number; duration: number; label: string; }

@Component({
  standalone: true,
  selector: 'ah-activity-selection',
  imports: [CommonModule, RouterLink, FormsModule, UICardComponent, UIButtonComponent],
  templateUrl: './activity-selection.component.html',
})
export class ActivitySelectionComponent implements OnDestroy {
  // Raw & sorted activities
  public allActivities: Activity[] = [];
  public sorted: Activity[] = [];
  public chosen: Set<number> = new Set();
  public rejected: Set<number> = new Set();

  // Algorithm state
  public idx = 0;
  public lastFinish = 0;
  public negInf = Number.NEGATIVE_INFINITY;
  public running = false;
  public finished = false;
  public stepCount = 0;
  public comparisons = 0;
  public selectedCount = 0;
  public lastMessage = '';

  // Playback
  public speedMultiplier = 1;
  private baseMs = 650;
  private timer: any = null;

  // Form
  public newStart: number | null = null;
  public newEnd: number | null = null;
  public autoLabels = true;
  public nextLabelChar = 65;
  public showSorted = true;

  Math = Math;

  constructor() { this.randomizeActivities(); }
  ngOnDestroy(): void { this.stopTimer(); }

  // --- Data generation ---
  randomizeActivities() {
    const n = 8 + Math.floor(Math.random() * 6);
    this.allActivities = [];
    this.nextLabelChar = 65;
    for (let i=0;i<n;i++) {
      const s = Math.floor(Math.random()*50);
      const len = 1 + Math.floor(Math.random()*10);
      const e = s + len + Math.floor(Math.random()*6);
      this.allActivities.push(this.makeActivity(s, e));
    }
    this.prepare();
  }

  makeActivity(start: number, end: number): Activity {
    if (end <= start) end = start + 1;
    const label = this.autoLabels ? String.fromCharCode(this.nextLabelChar++) : `Act ${Date.now()%1000}`;
    return { id: Math.random(), start, end, duration: end - start, label };
  }

  addActivity() {
    if (this.newStart == null || this.newEnd == null) return;
    if (this.newEnd <= this.newStart) return;
    this.allActivities.push(this.makeActivity(this.newStart, this.newEnd));
    this.newStart = this.newEnd = null;
    this.prepare();
  }

  prepare() {
    this.sorted = [...this.allActivities].sort((a,b)=> a.end===b.end ? a.start-b.start : a.end-b.end);
    this.resetAlgo();
  }

  // --- Algorithm reset ---
  resetAlgo() {
    this.stopTimer();
    this.chosen.clear();
    this.rejected.clear();
    this.idx = 0;
    this.lastFinish = this.negInf; // sentinel
    this.running = false;
    this.finished = this.sorted.length === 0;
    this.stepCount = 0; this.comparisons = 0; this.selectedCount = 0;
    this.lastMessage = this.finished ? 'No activities.' : 'Ready. Press Play or Step to start Activity Selection.';
  }

  // Playback controls
  play(){ if (this.running || this.finished) return; this.running = true; this.timer = setInterval(()=>this.step(), this.delay()); }
  pause(){ this.running = false; this.stopTimer(); }
  toggle(){ this.running ? this.pause() : this.play(); }
  delay(){ const m = Math.min(3, Math.max(0.25, this.speedMultiplier||1)); return this.baseMs / m; }
  onSpeedChange(){ if (this.running){ this.stopTimer(); this.timer = setInterval(()=>this.step(), this.delay()); } }
  stopTimer(){ if (this.timer){ clearInterval(this.timer); this.timer = null; } }

  // --- Step logic ---
  step() {
    if (this.finished) return;
    if (this.idx >= this.sorted.length) { this.finish(); return; }
    this.stepCount++;
    const act = this.sorted[this.idx];
    this.comparisons++;
    if (act.start >= this.lastFinish) {
      this.chosen.add(act.id);
      this.lastFinish = act.end;
      this.selectedCount++;
      this.lastMessage = `Select ${act.label} [${act.start}, ${act.end}) — compatible (start >= lastFinish).`;
    } else {
      this.rejected.add(act.id);
      this.lastMessage = `Reject ${act.label} [${act.start}, ${act.end}) — overlaps (start < ${this.lastFinish}).`;
    }
    this.idx++;
    if (this.idx >= this.sorted.length) this.finish();
  }

  finish(){ this.finished = true; this.pause(); this.lastMessage += ' Finished.'; }

  // --- Helpers for template ---
  isChosen(act: Activity){ return this.chosen.has(act.id); }
  isRejected(act: Activity){ return this.rejected.has(act.id); }
  isCurrent(act: Activity){ return !this.finished && this.sorted[this.idx]?.id === act.id; }
  timelineSpan(){
    if (!this.allActivities.length) return { minS: 0, maxE: 1, span: 1 };
    const minS = Math.min(...this.allActivities.map(a=>a.start));
    const maxE = Math.max(...this.allActivities.map(a=>a.end));
    return { minS, maxE, span: Math.max(1, maxE - minS) };
  }
  barLeft(act: Activity){ const {minS, span} = this.timelineSpan(); return ((act.start - minS)/span*100).toFixed(3)+'%'; }
  barWidth(act: Activity){ const {span} = this.timelineSpan(); return (act.duration/span*100).toFixed(3)+'%'; }
  barClasses(act: Activity){
    let cls = 'absolute top-0 h-full rounded-md text-[10px] flex items-center justify-center font-semibold transition-all duration-300 overflow-hidden';
    if (this.isChosen(act)) cls += ' bg-emerald-500 text-white shadow shadow-emerald-500/30';
    else if (this.isCurrent(act)) cls += ' bg-indigo-500 text-white';
    else if (this.isRejected(act)) cls += ' bg-rose-500/80 text-white';
    else cls += ' bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-slate-100';
    return cls;
  }
  percentChosen(){ return this.sorted.length? (this.chosen.size/this.sorted.length*100):0; }
  toggleOrderView(){ this.showSorted = !this.showSorted; }
  displayedList(){ return this.showSorted ? this.sorted : this.allActivities; }
  displayLastFinish(){ return this.lastFinish === this.negInf ? '-∞' : this.lastFinish; }

  theoreticalMax(){ return this.chosen.size; }
}
