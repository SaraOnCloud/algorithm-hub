import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UICardComponent } from '../../../ui/card.component';

@Component({
  standalone: true,
  selector: 'ah-floyd-warshall',
  imports: [CommonModule, RouterLink, UICardComponent],
  templateUrl: './floyd-warshall.component.html',
})
export class FloydWarshallComponent {}

