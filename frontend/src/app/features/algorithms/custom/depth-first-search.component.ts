import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UICardComponent } from '../../../ui/card.component';

@Component({
  standalone: true,
  selector: 'ah-depth-first-search',
  imports: [CommonModule, RouterLink, UICardComponent],
  templateUrl: './depth-first-search.component.html',
})
export class DepthFirstSearchComponent {}

