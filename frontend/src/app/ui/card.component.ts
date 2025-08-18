import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  standalone: true,
  selector: 'ui-card',
  imports: [NgIf],
  template: `
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-card">
      <div *ngIf="title || subtitle" class="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">{{ title }}</h3>
        <p *ngIf="subtitle" class="text-sm text-gray-500 dark:text-gray-400">{{ subtitle }}</p>
      </div>
      <div class="p-4">
        <ng-content />
      </div>
      <div *ngIf="hasActions" class="px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 rounded-b-lg">
        <ng-content select=".card-actions" />
      </div>
    </div>
  `,
})
export class UICardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() hasActions = false;
}
