import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UICardComponent } from '../../../ui/card.component';

@Component({
  standalone: true,
  selector: 'ah-rabin-karp',
  imports: [CommonModule, RouterLink, UICardComponent],
  templateUrl: './rabin-karp.component.html',
})
export class RabinKarpComponent {}

