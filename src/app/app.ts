import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainDashboardComponent } from './main-dashboard/main-dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MainDashboardComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
}
