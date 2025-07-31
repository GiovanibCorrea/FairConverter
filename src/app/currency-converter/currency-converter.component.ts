import { Component, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

export interface Conversion {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  timestamp: Date;
}

@Component({
  selector: 'app-currency-converter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './currency-converter.component.html',
  styleUrl: './currency-converter.component.scss'
})
export class CurrencyConverterComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private fb = inject(FormBuilder);

  currentRate = signal<number>(2.5);
  convertedAmount = signal<number>(0);
  isConverting = signal<boolean>(false);
  isUpdatingRate = signal<boolean>(false);
  showUpdateRateModal = signal<boolean>(false);
  conversionHistory = signal<Conversion[]>([]);

  converterForm!: FormGroup;
  rateForm!: FormGroup;

  get fromCurrency(): string {
    return this.converterForm?.get('fromCurrency')?.value || 'ouro-real';
  }

  get toCurrency(): string {
    return this.converterForm?.get('toCurrency')?.value || 'tibar';
  }

  ngOnInit(): void {
    this.initializeForms();
    if (isPlatformBrowser(this.platformId)) {
      this.loadConversionHistory();
    }
    this.setupFormSubscriptions();
  }

  private initializeForms(): void {
    this.converterForm = this.fb.group({
      fromCurrency: ['ouro-real', Validators.required],
      toCurrency: ['tibar', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]]
    });

    this.rateForm = this.fb.group({
      newRate: [null, [Validators.required, Validators.min(0.01)]]
    });
  }

  private setupFormSubscriptions(): void {
    this.converterForm.get('fromCurrency')?.valueChanges.subscribe(fromCurrency => {
      const toCurrency = fromCurrency === 'ouro-real' ? 'tibar' : 'ouro-real';
      this.converterForm.patchValue({ toCurrency }, { emitEvent: false });
      this.calculateConversion();
    });
    
    this.converterForm.get('toCurrency')?.valueChanges.subscribe(toCurrency => {
      const fromCurrency = toCurrency === 'ouro-real' ? 'tibar' : 'ouro-real';
      this.converterForm.patchValue({ fromCurrency }, { emitEvent: false });
      this.calculateConversion();
    });
    

    this.converterForm.valueChanges.subscribe(() => {
      this.calculateConversion();
    });
  }

  calculateConversion(): void {
    const amount = this.converterForm.get('amount')?.value;
    const fromCurrency = this.converterForm.get('fromCurrency')?.value;
    const toCurrency = this.converterForm.get('toCurrency')?.value;

    if (amount && fromCurrency && toCurrency) {
      let convertedValue = 0;

      if (fromCurrency === 'ouro-real' && toCurrency === 'tibar') {
        convertedValue = amount * this.currentRate();
      } else if (fromCurrency === 'tibar' && toCurrency === 'ouro-real') {
        convertedValue = amount / this.currentRate();
      }

      this.convertedAmount.set(convertedValue);
    } else {
      this.convertedAmount.set(0);
    }
  }

  async performConversion(): Promise<void> {
    if (this.converterForm.invalid) {
      return;
    }

    this.isConverting.set(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const formValue = this.converterForm.value;
      const conversion: Conversion = {
        id: this.generateId(),
        fromCurrency: formValue.fromCurrency,
        toCurrency: formValue.toCurrency,
        fromAmount: formValue.amount,
        toAmount: this.convertedAmount(),
        rate: this.currentRate(),
        timestamp: new Date()
      };

      const currentHistory = this.conversionHistory();
      this.conversionHistory.set([conversion, ...currentHistory]);

      this.saveConversionHistory();

      this.clearForm();

      console.log('Conversão realizada:', conversion);
    } catch (error) {
      console.error('Erro na conversão:', error);
    } finally {
      this.isConverting.set(false);
    }
  }

  async updateRate(): Promise<void> {
    if (this.rateForm.invalid) {
      return;
    }

    this.isUpdatingRate.set(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newRate = this.rateForm.get('newRate')?.value;
      this.currentRate.set(newRate);

      this.calculateConversion();

      this.closeUpdateRateModal();

      console.log('Taxa atualizada para:', newRate);
    } catch (error) {
      console.error('Erro ao atualizar taxa:', error);
    } finally {
      this.isUpdatingRate.set(false);
    }
  }

  openUpdateRateModal(): void {
    this.rateForm.patchValue({ newRate: this.currentRate() });
    this.showUpdateRateModal.set(true);
  }

  closeUpdateRateModal(): void {
    this.showUpdateRateModal.set(false);
    this.rateForm.reset();
  }

  clearForm(): void {
    this.converterForm.reset({
      fromCurrency: 'ouro-real',
      toCurrency: 'tibar',
      amount: null
    });
    this.convertedAmount.set(0);
  }

  clearHistory(): void {
    this.conversionHistory.set([]);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('wefin-conversion-history');
    }
  }

  getCurrencySymbol(currency: string): string {
    return currency === 'ouro-real' ? 'OR' : 'TB';
  }

  trackByConversion(index: number, conversion: Conversion): string {
    return conversion.id;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private loadConversionHistory(): void {
    try {
      const saved = localStorage.getItem('wefin-conversion-history');
      if (saved) {
        const history = JSON.parse(saved);

        const convertedHistory = history.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        this.conversionHistory.set(convertedHistory);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  }

  private saveConversionHistory(): void {
    try {
      const history = this.conversionHistory();
      localStorage.setItem('wefin-conversion-history', JSON.stringify(history));
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
    }
  }
} 