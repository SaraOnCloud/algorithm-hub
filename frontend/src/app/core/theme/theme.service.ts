import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private storageKey = 'ah_theme';

  init() {
    const saved = localStorage.getItem(this.storageKey) as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    this.apply(theme);
  }

  toggle() {
    const isDark = document.documentElement.classList.contains('dark');
    this.apply(isDark ? 'light' : 'dark');
  }

  apply(mode: 'light' | 'dark') {
    const el = document.documentElement;
    el.classList.toggle('dark', mode === 'dark');
    localStorage.setItem(this.storageKey, mode);
  }
}

