import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { SupportedLanguage, TranslationService } from '../../core/i18n/translation.service';

@Component({
  selector: 'bp-topbar',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatSelectModule, TranslatePipe],
  template: `
    <header>
      <div>
        <strong>{{ 'topbar.shelter' | translate }}</strong>
        <small>{{ 'topbar.role' | translate }}</small>
      </div>
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>{{ 'common.language' | translate }}</mat-label>
        <mat-select [ngModel]="currentLanguage" (ngModelChange)="setLanguage($event)">
          <mat-option value="en-US">English</mat-option>
          <mat-option value="es-419">Español LATAM</mat-option>
        </mat-select>
      </mat-form-field>
    </header>
  `,
  styles: [`
    header { min-height: 76px; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 18px 32px; background: var(--bp-soft-background); }
    div { display: grid; gap: 2px; }
    small { color: var(--bp-slate-gray); }
    mat-form-field { width: 190px; }
  `],
})
export class TopbarComponent {
  constructor(private readonly translations: TranslationService) {}

  get currentLanguage(): SupportedLanguage {
    return this.translations.currentLanguage();
  }

  setLanguage(language: SupportedLanguage): void {
    this.translations.setLanguage(language);
  }
}
