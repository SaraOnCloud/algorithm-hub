import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UICardComponent } from '../../../ui/card.component';

@Component({
  standalone: true,
  selector: 'ah-topological-sort',
  imports: [CommonModule, RouterLink, UICardComponent],
  templateUrl: './topological-sort.component.html',
})
export class TopologicalSortComponent {}

