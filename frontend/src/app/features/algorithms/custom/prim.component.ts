import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UICardComponent } from '../../../ui/card.component';

@Component({
  standalone: true,
  selector: 'ah-prim',
  imports: [CommonModule, RouterLink, UICardComponent],
  templateUrl: './prim.component.html',
})
export class PrimComponent {}

