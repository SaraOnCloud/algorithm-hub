import { Component, Input } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';

@Component({
  standalone: true,
  selector: 'ui-button',
  imports: [NgClass, NgIf],
  template: `
    <button
      [attr.type]="type"
      [disabled]="disabled || loading"
      [ngClass]="[
        'btn',
        sizeClass,
        variantClass,
        fullWidth ? 'w-full' : ''
      ]"
    >
      <span *ngIf="loading" class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
      <ng-content />
    </button>
  `,
})
export class UIButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'ghost' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() fullWidth = false;
  @Input() disabled = false;
  @Input() loading = false;

  get variantClass() {
    switch (this.variant) {
      case 'secondary': return 'btn-secondary';
      case 'outline': return 'btn-outline';
      case 'ghost': return 'btn-ghost';
      default: return 'btn-primary';
    }
  }
  get sizeClass() {
    switch (this.size) {
      case 'sm': return 'btn-sm';
      case 'lg': return 'btn-lg';
      default: return 'btn-md';
    }
  }
}

