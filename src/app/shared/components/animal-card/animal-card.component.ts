import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Animal } from '../../../core/domain/models/bluepatitas.models';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { TranslationService } from '../../../core/i18n/translation.service';
import { StatusChipComponent } from '../status-chip/status-chip.component';

@Component({
  selector: 'bp-animal-card',
  standalone: true,
  imports: [StatusChipComponent, TranslatePipe],
  template: `
    <button type="button" (click)="selected.emit(animal)" [class.selected]="selectedId === animal.id">
      <img [src]="animal.photoUrl || placeholderPhoto" [alt]="animal.name" (error)="usePlaceholder($event)" />
      <div class="content">
        <strong>{{ animal.name }}</strong>
        <small>ID: {{ animal.id.toUpperCase() }}</small>
        <span>{{ ('species.' + animal.species) | translate }} · {{ formatAge(animal.age) }}</span>
      </div>
      <bp-status-chip [status]="animal.status" />
      <footer>
        <small>{{ zoneLabel }}</small>
        <b>{{ 'animals.viewProfile' | translate }}</b>
      </footer>
    </button>
  `,
  styles: [`
    button { position: relative; width: 100%; min-height: 118px; display: grid; grid-template-columns: 82px minmax(0, 1fr); grid-template-rows: 1fr auto; gap: 8px 14px; align-items: start; padding: 10px; border: 1px solid var(--bp-border); border-radius: 8px; background: white; text-align: left; cursor: pointer; box-shadow: 0 4px 14px rgba(11,31,47,.04); overflow: hidden; }
    button:hover, button.selected { border-color: var(--bp-action-blue); box-shadow: 0 10px 24px rgba(11,31,47,.08); }
    button.selected { background: #e9f7ff; outline: 1px solid var(--bp-action-blue); }
    img { grid-column: 1; grid-row: 1; width: 82px; height: 82px; border-radius: 6px; object-fit: cover; background: var(--bp-primary-blue); }
    .content { min-width: 0; padding-top: 2px; padding-right: 96px; }
    strong { display: block; font-size: 17px; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    small { display: block; color: var(--bp-slate-gray); min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 12px; }
    span { display: block; color: #334155; font-size: 12px; margin-top: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    bp-status-chip { position: absolute; top: 14px; right: 12px; max-width: 92px; }
    footer { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 0 4px; }
    footer b { color: var(--bp-action-blue); font-size: 12px; }
    @media (max-width: 720px) {
      button { grid-template-columns: 72px minmax(0, 1fr); }
      img { width: 72px; height: 72px; }
      .content { padding-right: 0; }
      bp-status-chip { position: static; grid-column: 2; grid-row: 2; justify-self: start; }
    }
  `]
})
export class AnimalCardComponent {
  readonly placeholderPhoto = '/assets/bluepatitas/animal-firulais.png';

  @Input({ required: true }) animal!: Animal;
  @Input() selectedId = '';
  @Input() zoneLabel = '';
  @Output() selected = new EventEmitter<Animal>();

  private translationService = inject(TranslationService);

  formatAge(age: string): string {
    if (!age) return age;
    let formatted = age;
    const isEs = this.translationService.currentLanguage() === 'es-419';
    if (isEs) {
      formatted = formatted.replace(/years/gi, 'años').replace(/year/gi, 'año');
      formatted = formatted.replace(/months/gi, 'meses').replace(/month/gi, 'mes');
    }
    return formatted;
  }

  usePlaceholder(event: Event): void {
    const image = event.target as HTMLImageElement;
    if (!image.src.endsWith(this.placeholderPhoto)) {
      image.src = this.placeholderPhoto;
    }
  }
}
