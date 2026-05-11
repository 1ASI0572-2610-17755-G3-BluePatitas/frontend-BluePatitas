import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Animal } from '../../../core/domain/models/bluepatitas.models';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../../shared/components/bp-button/bp-button.component';
import { StatusChipComponent } from '../../../shared/components/status-chip/status-chip.component';

@Component({
  selector: 'bp-animal-profile-panel',
  standalone: true,
  imports: [TranslatePipe, BpButtonComponent, StatusChipComponent],
  template: `
    @if (animal) {
      <aside>
        <button class="close" type="button" (click)="closed.emit()">×</button>
        <img [src]="animal.photoUrl" [alt]="animal.name" />
        <h2>{{ animal.name }}</h2>
        <bp-status-chip [status]="animal.status" />
        <div class="stats">
          <span>{{ animal.weightKg }} kg<small>Weight</small></span>
          <span>{{ animal.age }}<small>Age</small></span>
          <span>{{ animal.species }}<small>Species</small></span>
        </div>
        <section>
          <h3>{{ 'animals.entryDate' | translate }}</h3>
          <p>{{ animal.entryDate }}</p>
          <h3>{{ 'animals.behaviorNotes' | translate }}</h3>
          <p>{{ animal.notes }}</p>
        </section>
        <footer>
          <bp-button (clicked)="assignDiet.emit()">{{ 'animals.assignDiet' | translate }}</bp-button>
          <bp-button variant="secondary" (clicked)="viewReports.emit()">{{ 'animals.viewReports' | translate }}</bp-button>
        </footer>
      </aside>
    }
  `,
  styles: [`
    aside { position: fixed; top: 0; right: 0; z-index: 20; width: min(473px, 96vw); height: 100vh; overflow: auto; background: white; border-left: 1px solid var(--bp-border); box-shadow: -18px 0 40px rgba(11,31,47,.14); padding: 28px; }
    .close { position: absolute; top: 18px; right: 18px; border: 0; background: var(--bp-surface-blue); border-radius: 50%; width: 32px; height: 32px; cursor: pointer; }
    img { width: 96px; height: 96px; border-radius: 24px; object-fit: cover; background: var(--bp-primary-blue); }
    h2 { margin: 18px 0 10px; font-size: 30px; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 24px 0; }
    .stats span { background: var(--bp-surface-blue); border-radius: 12px; padding: 14px; font-weight: 800; }
    .stats small { display: block; color: var(--bp-slate-gray); font-weight: 600; margin-top: 4px; }
    h3 { margin: 18px 0 6px; }
    p { color: var(--bp-slate-gray); }
    footer { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 24px; }
  `],
})
export class AnimalProfilePanelComponent {
  @Input() animal?: Animal;
  @Output() closed = new EventEmitter<void>();
  @Output() assignDiet = new EventEmitter<void>();
  @Output() viewReports = new EventEmitter<void>();
}
