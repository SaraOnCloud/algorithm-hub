import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UICardComponent } from '../../../ui/card.component';

@Component({
  standalone: true,
  selector: 'ah-dijkstra',
  imports: [CommonModule, RouterLink, UICardComponent],
  templateUrl: './dijkstra.component.html',
})
export class DijkstraComponent {}

