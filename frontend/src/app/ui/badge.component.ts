import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'ui-badge',
  template: `
    <span [class]="'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ' + colorClass">
      <ng-content />
    </span>
  `,
})
export class UIBadgeComponent {
  @Input() variant: 'primary' | 'green' | 'yellow' | 'red' | 'gray' = 'gray';
  get colorClass() {
    switch (this.variant) {
      case 'primary': return 'bg-primary-100 text-primary-700';
      case 'green': return 'bg-emerald-100 text-emerald-700';
      case 'yellow': return 'bg-amber-100 text-amber-800';
      case 'red': return 'bg-rose-100 text-rose-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }
}
