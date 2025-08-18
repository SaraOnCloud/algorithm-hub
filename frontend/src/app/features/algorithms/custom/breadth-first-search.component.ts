import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UICardComponent } from '../../../ui/card.component';

@Component({
  standalone: true,
  selector: 'ah-breadth-first-search',
  imports: [CommonModule, RouterLink, UICardComponent],
  templateUrl: './breadth-first-search.component.html',
})
export class BreadthFirstSearchComponent {}

