import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.scss'
})
export class AppHeaderComponent {
  @Input() currentRate: number = 2.5;

  getCurrencySymbol(currency: string): string {
    return currency === 'ouro-real' ? 'OR' : 'TB';
  }
} 