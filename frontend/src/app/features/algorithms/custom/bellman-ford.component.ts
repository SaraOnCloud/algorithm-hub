import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UICardComponent } from '../../../ui/card.component';

@Component({
  standalone: true,
  selector: 'ah-bellman-ford',
  imports: [CommonModule, RouterLink, UICardComponent],
  templateUrl: './bellman-ford.component.html',
})
export class BellmanFordComponent {}

