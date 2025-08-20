import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UICardComponent } from '../../../ui/card.component';
import { UIButtonComponent } from '../../../ui/button.component';

@Component({
  standalone: true,
  selector: 'ah-binary-search',
  imports: [CommonModule, RouterLink, FormsModule, UICardComponent, UIButtonComponent],
  templateUrl: './binary-search.component.html',
})
export class BinarySearchComponent implements OnDestroy {
  arr: number[] = [];
  size = 12;
  target: number | null = null;

  left = 0;
  right = 0;
  mid = -1;
  foundIndex: number | null = null;

  running = false;
  finished = false;
  stepCount = 0;
  lastMessage = '';

  speedMultiplier = 1;
  private baseMs = 700;
  private timer: any = null;

  constructor() {
    this.buildArray(this.size);
    // Sugerir un objetivo dentro del array
    this.target = this.arr[Math.floor(this.arr.length / 2)];
    this.resetBounds();
    this.lastMessage = 'Lista para empezar. Pulsa Reproducir o Paso.';
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  // --- Construcción y reinicio ---
  buildArray(n: number) {
    n = Math.max(3, Math.min(30, Math.floor(n)) || 3);
    // Generar ascendentes sin duplicados con incrementos aleatorios
    const out: number[] = [];
    let cur = Math.floor(Math.random() * 6); // 0..5
    for (let i = 0; i < n; i++) {
      const inc = 1 + Math.floor(Math.random() * 9); // 1..9
      cur += i === 0 ? 0 : inc;
      out.push(cur);
    }
    this.arr = out;
  }

  resetBounds() {
    this.left = 0;
    this.right = this.arr.length - 1;
    this.mid = -1;
    this.foundIndex = null;
    this.finished = false;
    this.running = false;
    this.stepCount = 0;
  }

  resetAll() {
    this.stopTimer();
    this.resetBounds();
    this.lastMessage = 'Reiniciado.';
  }

  randomizeArray() {
    this.buildArray(this.size);
    this.resetAll();
    // Mantener target si existe; si no, proponer uno existente
    if (this.target == null) this.pickExistingTarget();
  }

  setSize(n: number) {
    this.size = Math.max(3, Math.min(30, Math.floor(n)) || 3);
    this.randomizeArray();
  }

  pickExistingTarget() {
    if (this.arr.length) {
      this.target = this.arr[Math.floor(Math.random() * this.arr.length)];
      this.lastMessage = 'Objetivo elegido del array.';
    }
  }
  pickMissingTarget() {
    // Elegir un valor que no esté presente (mayor al último + offset)
    const last = this.arr[this.arr.length - 1] ?? 0;
    this.target = last + 2 + Math.floor(Math.random() * 7);
    this.lastMessage = 'Objetivo elegido que no está presente.';
  }

  // --- Reproducción ---
  play() {
    if (this.finished || this.running) return;
    if (this.target == null) return;
    this.running = true;
    this.timer = setInterval(() => this.step(), this.currentDelay());
  }
  pause() {
    this.running = false;
    this.stopTimer();
  }
  stopTimer() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }
  currentDelay() {
    const mult = Math.min(2, Math.max(0.25, this.speedMultiplier || 1));
    return this.baseMs / mult;
  }
  onSpeedChange() {
    if (this.running) { this.stopTimer(); this.timer = setInterval(() => this.step(), this.currentDelay()); }
  }

  // --- Paso del algoritmo ---
  step() {
    if (this.finished) return;
    if (this.target == null) { this.pause(); return; }

    if (this.left > this.right) {
      this.finished = true;
      this.lastMessage = 'No encontrado.';
      this.pause();
      return;
    }

    this.mid = Math.floor((this.left + this.right) / 2);
    const val = this.arr[this.mid];
    this.stepCount++;

    if (val === this.target) {
      this.foundIndex = this.mid;
      this.finished = true;
      this.lastMessage = `Encontrado ${val} en índice ${this.mid}.`;
      this.pause();
      return;
    }

    if (val < this.target) {
      this.left = this.mid + 1;
      this.lastMessage = `${val} < ${this.target}. Mover izquierda a ${this.left}.`;
    } else {
      this.right = this.mid - 1;
      this.lastMessage = `${val} > ${this.target}. Mover derecha a ${this.right}.`;
    }
  }

  // Utilidades
  idxInRange(i: number) { return i >= this.left && i <= this.right; }
}
