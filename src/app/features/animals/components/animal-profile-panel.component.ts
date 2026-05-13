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
        <header class="hero">
          <img [src]="animal.photoUrl" [alt]="animal.name" />
          <div>
            <h2>{{ animal.name }}</h2>
            <div class="chips">
              <span class="id-chip">BP-{{ animal.id.toUpperCase() }}</span>
              <bp-status-chip [status]="animal.status" />
            </div>
          </div>
          <button class="close" type="button" (click)="closed.emit()" [attr.aria-label]="'common.close' | translate">×</button>
        </header>

        <nav class="tabs" aria-label="Animal profile sections">
          <span class="active">{{ 'animals.generalInfo' | translate }}</span>
          <span>{{ 'animals.diet' | translate }}</span>
          <span>{{ 'animals.location' | translate }}</span>
          <span>{{ 'nav.alerts' | translate }}</span>
        </nav>

        <div class="stats">
          <span><b>{{ animal.weightKg }} kg</b><small>{{ 'animals.weight' | translate }}</small></span>
          <span><b>{{ animal.species === 'Dog' ? 'Male' : 'Female' }}</b><small>{{ 'animals.sex' | translate }}</small></span>
          <span><b>{{ animal.status === 'Healthy' ? 'Up to date' : 'Review' }}</b><small>{{ 'animals.vaccines' | translate }}</small></span>
        </div>

        <section class="clinical">
          <div class="section-title">
            <h3>{{ 'animals.clinicalDetails' | translate }}</h3>
            <button type="button">{{ 'animals.editProfile' | translate }}</button>
          </div>
          <label>{{ 'animals.breedCross' | translate }}</label>
          <p>{{ animal.breed }}</p>
          <label>{{ 'animals.entryDate' | translate }}</label>
          <p>{{ animal.entryDate }}</p>
          <label>{{ 'animals.behaviorNotes' | translate }}</label>
          <p>{{ animal.notes }}</p>
        </section>

        <section class="zone-card">
          <small>{{ 'animals.currentZone' | translate }}</small>
          <h3>{{ zoneName }}</h3>
          <button type="button">{{ 'animals.viewZoneCamera' | translate }}</button>
        </section>

        <footer>
          <bp-button variant="secondary" (clicked)="assignDiet.emit()">{{ 'animals.assignDiet' | translate }}</bp-button>
          <bp-button (clicked)="viewReports.emit()">{{ 'animals.viewReports' | translate }}</bp-button>
        </footer>
      </aside>
    }
  `,
  styles: [`
    aside { position: fixed; top: 0; right: 0; z-index: 20; width: min(370px, 96vw); height: 100vh; overflow: auto; background: white; border-left: 1px solid var(--bp-border); box-shadow: -18px 0 40px rgba(11,31,47,.14); display: grid; grid-template-rows: auto auto auto auto auto 1fr; }
    .hero { display: grid; grid-template-columns: 66px minmax(0, 1fr) auto; gap: 16px; align-items: center; padding: 22px 18px 18px; background: #dff3ff; border-bottom: 1px solid var(--bp-border); }
    .hero img { width: 66px; height: 66px; border-radius: 50%; object-fit: cover; background: var(--bp-primary-blue); }
    h2 { margin: 0 0 8px; font-size: 24px; line-height: 1.1; }
    .chips { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .id-chip { border-radius: 4px; background: #c8ddeb; color: var(--bp-dark-navy); padding: 5px 8px; font-size: 11px; font-weight: 800; }
    .close { width: 32px; height: 32px; border: 0; border-radius: 50%; background: #eef8ff; color: var(--bp-dark-navy); cursor: pointer; font-size: 22px; line-height: 1; }
    .tabs { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border-bottom: 1px solid var(--bp-border); }
    .tabs span { padding: 12px 8px; color: var(--bp-slate-gray); text-align: center; font-size: 11px; border-bottom: 2px solid transparent; }
    .tabs .active { color: var(--bp-action-blue); border-bottom-color: var(--bp-action-blue); }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 16px 18px 8px; }
    .stats span { border: 1px solid var(--bp-border); border-radius: 6px; background: #fff; padding: 14px 8px; text-align: center; min-width: 0; }
    .stats b { display: block; font-size: 15px; }
    .stats small { display: block; color: var(--bp-slate-gray); font-size: 9px; text-transform: uppercase; margin-top: 5px; }
    .clinical { margin: 10px 18px; border: 1px solid var(--bp-border); border-radius: 8px; padding: 12px 14px; }
    .section-title { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
    h3 { margin: 0; font-size: 14px; }
    .section-title button { border: 0; background: transparent; color: var(--bp-action-blue); font-size: 11px; font-weight: 800; cursor: pointer; }
    label { display: block; color: var(--bp-slate-gray); font-size: 10px; margin-top: 10px; }
    p { margin: 4px 0 0; border-radius: 3px; background: #eef7fd; padding: 8px; color: var(--bp-dark-navy); font-size: 12px; line-height: 1.4; }
    .zone-card { margin: 0 18px 14px; padding: 16px; border-radius: 8px; border: 1px solid #9bcaf3; background: radial-gradient(circle at right, rgba(207,229,245,.72), transparent 42%), #e7f7ff; }
    .zone-card small { color: var(--bp-dark-navy); font-weight: 800; }
    .zone-card h3 { color: var(--bp-action-blue); font-size: 22px; margin: 8px 0 16px; }
    .zone-card button { width: 100%; min-height: 34px; border: 1px solid var(--bp-border); border-radius: 6px; background: #fff; color: var(--bp-dark-navy); cursor: pointer; }
    footer { margin-top: auto; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 12px 18px; border-top: 1px solid var(--bp-border); background: #fff; }
    @media (max-width: 520px) {
      aside { width: 100vw; }
    }
  `],
})
export class AnimalProfilePanelComponent {
  @Input() animal?: Animal;
  @Input() zoneName = 'Patio 1';
  @Output() closed = new EventEmitter<void>();
  @Output() assignDiet = new EventEmitter<void>();
  @Output() viewReports = new EventEmitter<void>();
}
