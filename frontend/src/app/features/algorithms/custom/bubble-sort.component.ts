import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UICardComponent } from '../../../ui/card.component';

@Component({
  standalone: true,
  selector: 'ah-bubble-sort',
  imports: [CommonModule, RouterLink, UICardComponent],
  templateUrl: './bubble-sort.component.html',
})
export class BubbleSortComponent {}
