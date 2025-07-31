import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { CurrencyConverterComponent } from './app/currency-converter/currency-converter.component';

bootstrapApplication(CurrencyConverterComponent, {
  providers: [
    provideZonelessChangeDetection()
  ]
});
