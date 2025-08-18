import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UICardComponent } from '../../../ui/card.component';

@Component({
  standalone: true,
  selector: 'ah-activity-selection',
  imports: [CommonModule, RouterLink, UICardComponent],
  templateUrl: './binary-tree-traversals.component.html',
})
export class ActivitySelectionComponent {}

