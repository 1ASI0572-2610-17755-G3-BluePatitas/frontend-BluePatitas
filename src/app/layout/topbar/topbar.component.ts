import { Component, EventEmitter, Output } from '@angular/core';
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
      <button class="menu-button" type="button" (click)="menuClicked.emit()" aria-label="Open menu">
        <span></span><span></span><span></span>
      </button>
      <div class="identity">
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
    header { min-height: 70px; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 18px 32px 14px; background: var(--bp-soft-background); }
    .identity { display: grid; gap: 2px; }
    small { color: var(--bp-slate-gray); }
    mat-form-field { width: 190px; margin-left: auto; }
    .menu-button { display: none; width: 42px; height: 42px; border: 1px solid var(--bp-border); border-radius: 10px; background: #fff; cursor: pointer; place-items: center; gap: 4px; padding: 10px; }
    .menu-button span { display: block; width: 18px; height: 2px; background: var(--bp-dark-navy); border-radius: 99px; }
    @media (max-width: 920px) {
      header { padding: 14px 18px; }
      .menu-button { display: grid; }
      .identity { display: none; }
    }
    @media (max-width: 520px) {
      mat-form-field { width: 150px; }
    }
  `],
})
export class TopbarComponent {
  @Output() menuClicked = new EventEmitter<void>();

  constructor(private readonly translations: TranslationService) {}

  get currentLanguage(): SupportedLanguage {
    return this.translations.currentLanguage();
  }

  setLanguage(language: SupportedLanguage): void {
    this.translations.setLanguage(language);
  }
}
