import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppHeaderComponent } from '../app-header/app-header.component';
import { CurrencyConverterComponent } from '../currency-converter/currency-converter.component';

@Component({
  selector: 'app-main-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AppHeaderComponent,
    CurrencyConverterComponent
  ],
  templateUrl: './main-dashboard.component.html',
  styleUrl: './main-dashboard.component.scss'
})
export class MainDashboardComponent {
  constructor() {
  }
}
