import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Report } from '../../../core/domain/models/bluepatitas.models';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../../shared/components/bp-button/bp-button.component';
import { BpModalComponent } from '../../../shared/components/bp-modal/bp-modal.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';

@Component({
  selector: 'bp-add-animal-modal',
  standalone: true,
  imports: [TranslatePipe, BpModalComponent, FormFieldComponent, BpButtonComponent],
  template: `
    <bp-modal [open]="open" [title]="'animals.add' | translate" size="compact" (closed)="closed.emit()">
      <div class="modal-body animal-form">
        <div class="photo-upload"><span></span><small>{{ 'animals.uploadPhoto' | translate }}</small></div>
        <bp-form-field [label]="'animals.name' | translate" placeholder="Firulais" />
        <bp-form-field [label]="'animals.species' | translate" [placeholder]="'animals.selectSpecies' | translate" />
        <bp-form-field [label]="'animals.breedCross' | translate" placeholder="Mixed breed" />
        <div class="field-block">
          <label>{{ 'animals.sex' | translate }}</label>
          <div class="segmented"><button type="button" class="active">{{ 'animals.male' | translate }}</button><button type="button">{{ 'animals.female' | translate }}</button></div>
        </div>
        <div class="two-cols">
          <bp-form-field [label]="'animals.years' | translate" placeholder="0" type="number" />
          <bp-form-field [label]="'animals.months' | translate" placeholder="0" type="number" />
        </div>
        <bp-form-field [label]="'animals.initialHealth' | translate" placeholder="Healthy" />
        <bp-form-field [label]="'animals.entryDate' | translate" type="date" />
        <div class="modal-actions">
          <bp-button variant="ghost" (clicked)="closed.emit()">{{ 'common.cancel' | translate }}</bp-button>
          <bp-button prefix="+">{{ 'animals.registerAnimal' | translate }}</bp-button>
        </div>
      </div>
    </bp-modal>
  `,
  styles: [`
    .animal-form { display: grid; gap: 12px; }
    .photo-upload { display: grid; justify-items: center; gap: 8px; margin-top: -4px; }
    .photo-upload span { width: 88px; height: 88px; border-radius: 50%; border: 1px dashed #7d6b91; background: #f3eef6; position: relative; }
    .photo-upload span::before { content: '+'; position: absolute; inset: 0; display: grid; place-items: center; color: #7d6b91; font-size: 28px; font-weight: 700; }
    .photo-upload small { color: var(--bp-action-blue); font-size: 11px; font-weight: 700; }
    .field-block label { display: block; margin-bottom: 7px; color: var(--bp-dark-navy); font-size: 12px; font-weight: 700; }
    .segmented { display: grid; grid-template-columns: 1fr 1fr; border-radius: 10px; background: #eee8ef; padding: 4px; }
    .segmented button { min-height: 32px; border: 0; border-radius: 7px; background: transparent; color: var(--bp-slate-gray); cursor: pointer; }
    .segmented .active { background: #fff; color: var(--bp-action-blue); box-shadow: 0 1px 4px rgba(11,31,47,.08); }
    .two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .modal-actions { display: flex; justify-content: space-between; gap: 12px; margin-top: 8px; }
  `],
})
export class AddAnimalModalComponent {
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();
}

@Component({
  selector: 'bp-assign-diet-modal',
  standalone: true,
  imports: [TranslatePipe, BpModalComponent, FormFieldComponent, BpButtonComponent],
  template: `
    <bp-modal [open]="open" [title]="'animals.assignDiet' | translate" (closed)="closed.emit()">
      <div class="modal-body diet-form">
        <div class="food-types">
          <button class="active" type="button">{{ 'animals.dryFood' | translate }}</button>
          <button type="button">{{ 'animals.wetFood' | translate }}</button>
          <button type="button">{{ 'animals.specialDiet' | translate }}</button>
        </div>
        <bp-form-field [label]="'animals.foodBrand' | translate" placeholder="Puppy Pro" />
        <div class="two-cols">
          <bp-form-field [label]="'animals.portion' | translate" placeholder="250 g" />
          <bp-form-field [label]="'animals.dailyFrequency' | translate" placeholder="2 times per day" />
        </div>
        <div class="two-cols">
          <bp-form-field [label]="'animals.mealTime' | translate" placeholder="08:00" />
          <bp-form-field [label]="'animals.mealTime' | translate" placeholder="18:00" />
        </div>
        <bp-form-field [label]="'animals.feedingNotes' | translate" placeholder="Hydration check after each meal" [multiline]="true" />
        <div class="modal-actions">
          <bp-button variant="secondary" (clicked)="closed.emit()">{{ 'common.cancel' | translate }}</bp-button>
          <bp-button>{{ 'animals.saveDiet' | translate }}</bp-button>
        </div>
      </div>
    </bp-modal>
  `,
  styles: [`
    .diet-form { display: grid; gap: 14px; }
    .food-types { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .food-types button { min-height: 56px; border: 1px solid var(--bp-border); border-radius: 12px; background: #fff; color: var(--bp-dark-navy); font-weight: 800; cursor: pointer; }
    .food-types .active { border-color: var(--bp-action-blue); background: var(--bp-surface-blue); color: var(--bp-action-blue); }
    .two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
    @media (max-width: 560px) { .food-types, .two-cols { grid-template-columns: 1fr; } }
  `],
})
export class AssignDietModalComponent {
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();
}

@Component({
  selector: 'bp-view-reports-modal',
  standalone: true,
  imports: [TranslatePipe, BpModalComponent, BpButtonComponent],
  template: `
    <bp-modal [open]="open" [title]="'animals.viewReports' | translate" (closed)="closed.emit()">
      <div class="modal-body reports">
        <header>
          <div>
            <small>{{ 'animals.reportFor' | translate }}</small>
            <h3>{{ animalName || 'Animal' }}</h3>
          </div>
          <div class="range-tabs"><button class="active">7D</button><button>30D</button><button>90D</button></div>
        </header>
        <section class="summary">
          <article><b>18.4 kg</b><span>{{ 'animals.weightTrend' | translate }}</span></article>
          <article><b>92%</b><span>{{ 'animals.feedingCompletion' | translate }}</span></article>
        </section>
        <div class="chart" aria-label="Report chart"><i></i><i></i><i></i><i></i><i></i></div>
        <section class="timeline">
          @for (report of reports; track report.id) {
            <article>
              <time>{{ report.createdAt }}</time>
              <strong>{{ report.title }}</strong>
              <p>{{ report.summary }}</p>
            </article>
          }
        </section>
        <div class="modal-actions">
          <bp-button variant="secondary">{{ 'animals.exportPdf' | translate }}</bp-button>
          <bp-button (clicked)="closed.emit()">{{ 'common.close' | translate }}</bp-button>
        </div>
      </div>
    </bp-modal>
  `,
  styles: [`
    .reports { display: grid; gap: 16px; }
    header, .summary, .modal-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    header h3 { margin: 2px 0 0; font-size: 22px; }
    header small, time, p, .summary span { color: var(--bp-slate-gray); }
    .range-tabs { display: inline-flex; border: 1px solid var(--bp-border); border-radius: 999px; padding: 3px; }
    .range-tabs button { border: 0; border-radius: 999px; background: transparent; padding: 7px 12px; cursor: pointer; color: var(--bp-slate-gray); }
    .range-tabs .active { background: var(--bp-action-blue); color: #fff; }
    .summary article { flex: 1; border: 1px solid var(--bp-border); border-radius: 12px; padding: 14px; background: var(--bp-surface-blue); }
    .summary b, .summary span { display: block; }
    .summary b { font-size: 24px; }
    .chart { height: 118px; display: grid; grid-template-columns: repeat(5, 1fr); align-items: end; gap: 10px; border: 1px solid var(--bp-border); border-radius: 12px; padding: 16px; background: linear-gradient(180deg, #fff, #f7fbff); }
    .chart i { display: block; border-radius: 999px 999px 4px 4px; background: var(--bp-secondary-blue); }
    .chart i:nth-child(1) { height: 42%; } .chart i:nth-child(2) { height: 62%; } .chart i:nth-child(3) { height: 54%; } .chart i:nth-child(4) { height: 78%; } .chart i:nth-child(5) { height: 68%; }
    .timeline { display: grid; gap: 10px; }
    .timeline article { border-left: 3px solid var(--bp-action-blue); padding: 4px 0 4px 12px; }
    .timeline strong { display: block; margin: 3px 0; }
    .timeline p { margin: 0; }
    @media (max-width: 560px) { header, .summary, .modal-actions { display: grid; } }
  `],
})
export class ViewReportsModalComponent {
  @Input() open = false;
  @Input() animalName = '';
  @Input() reports: Report[] = [];
  @Output() closed = new EventEmitter<void>();
}
