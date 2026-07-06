import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { SupportedLanguage, TranslationService } from '../../core/i18n/translation.service';
import { GetShelterSettingsUseCase } from '../../core/application/use-cases/bluepatitas.use-cases';
import { SessionService } from '../../core/auth/session.service';

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
        <strong>{{ shelterName }}</strong>
        <small>{{ currentUserText }}</small>
      </div>
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>{{ 'common.language' | translate }}</mat-label>
        <mat-select [ngModel]="currentLanguage" (ngModelChange)="setLanguage($event)">
          <mat-option value="en-US">English</mat-option>
          <mat-option value="es-419">Español</mat-option>
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
export class TopbarComponent implements OnInit {
  @Output() menuClicked = new EventEmitter<void>();

  shelterName = 'Refugio WUF';
  currentUserText = 'Santiago - Admin';

  constructor(
    private readonly translations: TranslationService,
    private readonly getShelter: GetShelterSettingsUseCase,
    private readonly session: SessionService
  ) {}

  async ngOnInit(): Promise<void> {
    const user = this.session.getCurrentUser();

    try {
      const shelter = await this.getShelter.execute();
      if (shelter && shelter.name) {
        this.shelterName = shelter.name;
      }
    } catch (err) {
      console.warn('Failed to load shelter settings for topbar:', err);
    }

    if (user?.shelterName) {
      this.shelterName = user.shelterName;
    }

    if (user) {
      const namePart = (user.name || user.email || 'User').split(' ')[0];
      const rolePart = user.role === 'VETERINARIAN' ? 'Vet' : user.role === 'SHELTER_ADMIN' ? 'Admin' : 'Care';
      this.currentUserText = `${namePart} - ${rolePart}`;
    }
  }

  get currentLanguage(): SupportedLanguage {
    return this.translations.currentLanguage();
  }

  setLanguage(language: SupportedLanguage): void {
    this.translations.setLanguage(language);
  }
}
