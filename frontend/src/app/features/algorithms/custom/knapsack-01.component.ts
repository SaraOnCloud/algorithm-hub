import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UICardComponent } from '../../../ui/card.component';

@Component({
  standalone: true,
  selector: 'ah-knapsack-01',
  imports: [CommonModule, RouterLink, UICardComponent],
  templateUrl: './knapsack-01.component.html',
})
export class Knapsack01Component {}

