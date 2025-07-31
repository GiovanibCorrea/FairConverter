import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core'; // já está usando 👍
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

TestBed.initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
  { teardown: { destroyAfterEach: false } }
);

TestBed.configureTestingModule({
  providers: [provideZonelessChangeDetection()]
});