import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CurrencyConverterComponent } from './currency-converter.component.js';
import { ReactiveFormsModule } from '@angular/forms';
import { PLATFORM_ID, provideZonelessChangeDetection } from '@angular/core';

describe('CurrencyConverterComponent', () => {
  let component: CurrencyConverterComponent;
  let fixture: ComponentFixture<CurrencyConverterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, CurrencyConverterComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        provideZonelessChangeDetection()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CurrencyConverterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve inicializar os formulários corretamente', () => {
    expect(component.converterForm).toBeDefined();
    expect(component.rateForm).toBeDefined();
    expect(component.converterForm.get('fromCurrency')?.value).toBe('ouro-real');
    expect(component.converterForm.get('toCurrency')?.value).toBe('tibar');
  });

  it('deve calcular a conversão corretamente (ouro-real para tibar)', () => {
    component.converterForm.patchValue({
      fromCurrency: 'ouro-real',
      toCurrency: 'tibar',
      amount: 10
    });
    component.calculateConversion();
    expect(component.convertedAmount()).toBe(25);
  });

  it('deve calcular a conversão corretamente (tibar para ouro-real)', () => {
    component.converterForm.patchValue({
      fromCurrency: 'tibar',
      toCurrency: 'ouro-real',
      amount: 10
    });
    component.calculateConversion();
    expect(component.convertedAmount()).toBe(4);
  });

  it('deve zerar a conversão se valores inválidos', () => {
    component.converterForm.patchValue({
      fromCurrency: null,
      toCurrency: null,
      amount: null
    });
    component.calculateConversion();
    expect(component.convertedAmount()).toBe(0);
  });

  it('deve realizar conversão corretamente', async () => {
    spyOn(component as any, 'saveConversionHistory').and.callFake(() => {});
    spyOn(console, 'log');
    spyOn(component, 'clearForm').and.callThrough();

    component.converterForm.patchValue({
      fromCurrency: 'ouro-real',
      toCurrency: 'tibar',
      amount: 10
    });
    await component.performConversion();

    expect(component.isConverting()).toBeFalse();
    expect(console.log).toHaveBeenCalledWith(jasmine.stringMatching('Conversão realizada:'), jasmine.any(Object));
    expect(component.clearForm).toHaveBeenCalled();
  });

  it('deve atualizar a taxa corretamente', async () => {
    spyOn(console, 'log');
    component.rateForm.patchValue({ newRate: 3.0 });
    await component.updateRate();

    expect(component.currentRate()).toBe(3.0);
    expect(component.showUpdateRateModal()).toBeFalse();
    expect(console.log).toHaveBeenCalledWith('Taxa atualizada para:', 3.0);
  });

  it('deve abrir e fechar modal de atualização de taxa', () => {
    component.openUpdateRateModal();
    expect(component.showUpdateRateModal()).toBeTrue();
    expect(component.rateForm.get('newRate')?.value).toBe(component.currentRate());

    component.closeUpdateRateModal();
    expect(component.showUpdateRateModal()).toBeFalse();
    expect(component.rateForm.get('newRate')?.value).toBeNull();
  });

  it('deve limpar o formulário corretamente', () => {
    component.converterForm.patchValue({
      fromCurrency: 'tibar',
      toCurrency: 'ouro-real',
      amount: 10
    });
    component.clearForm();

    expect(component.converterForm.get('fromCurrency')?.value).toBe('ouro-real');
    expect(component.converterForm.get('toCurrency')?.value).toBe('tibar');
    expect(component.converterForm.get('amount')?.value).toBeNull();
    expect(component.convertedAmount()).toBe(0);
  });

  it('deve limpar o histórico de conversões', () => {
    component.conversionHistory.set([
      {
        id: '1',
        fromCurrency: 'ouro-real',
        toCurrency: 'tibar',
        fromAmount: 10,
        toAmount: 25,
        rate: 2.5,
        timestamp: new Date()
      }
    ]);

    spyOn(localStorage, 'removeItem');
    component.clearHistory();
    expect(component.conversionHistory().length).toBe(0);
    expect(localStorage.removeItem).toHaveBeenCalledWith('wefin-conversion-history');
  });

  it('getCurrencySymbol deve retornar símbolo correto', () => {
    expect(component.getCurrencySymbol('ouro-real')).toBe('OR');
    expect(component.getCurrencySymbol('tibar')).toBe('TB');
  });

  it('trackByConversion deve retornar id corretamente', () => {
    const conversion = {
      id: 'abc123',
      fromCurrency: '',
      toCurrency: '',
      fromAmount: 0,
      toAmount: 0,
      rate: 0,
      timestamp: new Date()
    };
    expect(component.trackByConversion(0, conversion)).toBe('abc123');
  });

  it('loadConversionHistory deve carregar histórico do localStorage', () => {
    const fakeHistory = [
      {
        id: '1',
        fromCurrency: 'ouro-real',
        toCurrency: 'tibar',
        fromAmount: 10,
        toAmount: 25,
        rate: 2.5,
        timestamp: new Date().toISOString()
      }
    ];
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(fakeHistory));
    component['loadConversionHistory']();
    const history = component.conversionHistory();
    expect(history.length).toBe(1);
    expect(history[0].timestamp instanceof Date).toBeTrue();
  });

  it('loadConversionHistory deve lidar com erro JSON inválido', () => {
    spyOn(localStorage, 'getItem').and.returnValue('invalid-json');
    spyOn(console, 'error');
    component['loadConversionHistory']();
    expect(console.error).toHaveBeenCalled();
  });

  it('saveConversionHistory deve salvar histórico no localStorage', () => {
    spyOn(localStorage, 'setItem').and.callFake(() => {});
    spyOn(console, 'error');

    component.conversionHistory.set([
      {
        id: '1',
        fromCurrency: 'ouro-real',
        toCurrency: 'tibar',
        fromAmount: 10,
        toAmount: 25,
        rate: 2.5,
        timestamp: new Date()
      }
    ]);

    component['saveConversionHistory']();
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('saveConversionHistory deve lidar com erro ao salvar', () => {
    spyOn(localStorage, 'setItem').and.throwError('QuotaExceededError');
    spyOn(console, 'error');
    component['saveConversionHistory']();
    expect(console.error).toHaveBeenCalled();
  });
});
