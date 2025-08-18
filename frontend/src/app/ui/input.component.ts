import { Component, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  standalone: true,
  selector: 'ui-input',
  imports: [NgIf],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UIInputComponent),
      multi: true,
    },
  ],
  template: `
    <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1" *ngIf="label">{{ label }}</label>
    <input
      class="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500"
      [attr.type]="type"
      [attr.placeholder]="placeholder"
      [attr.autocomplete]="autoComplete"
      [disabled]="disabled"
      [value]="value ?? ''"
      (input)="onChange($any($event.target).value)"
      (blur)="onTouched()"
    />
    <p *ngIf="hint" class="mt-1 text-xs text-gray-500">{{ hint }}</p>
  `,
})
export class UIInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() type: 'text' | 'email' | 'password' = 'text';
  @Input() autoComplete = 'off';

  disabled = false;
  value: any = '';
  onChange: (val: any) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(obj: any): void { this.value = obj; }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState?(isDisabled: boolean): void { this.disabled = isDisabled; }
}
