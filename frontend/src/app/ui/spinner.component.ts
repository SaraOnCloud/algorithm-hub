import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'ui-spinner',
  template: `
    <span
      [class]="'inline-block rounded-full border-2 border-current border-t-transparent animate-spin ' + sizeClass"
      role="status"
      aria-label="Cargando"
    ></span>
  `,
})
export class UISpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  get sizeClass() {
    switch (this.size) {
      case 'sm': return 'w-4 h-4';
      case 'lg': return 'w-8 h-8';
      default: return 'w-6 h-6';
    }
  }
}

