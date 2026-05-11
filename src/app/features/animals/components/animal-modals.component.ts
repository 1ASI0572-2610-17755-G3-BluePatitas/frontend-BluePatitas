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
    <bp-modal [open]="open" [title]="'animals.add' | translate" (closed)="closed.emit()">
      <div class="modal-body form-grid">
        <bp-form-field label="Name" />
        <bp-form-field label="Breed" />
        <bp-form-field label="Age" />
        <bp-form-field label="Weight" />
        <bp-button>{{ 'common.save' | translate }}</bp-button>
      </div>
    </bp-modal>
  `,
  styles: [`.form-grid { display: grid; gap: 12px; }`],
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
      <div class="modal-body form-grid">
        <bp-form-field label="Diet name" placeholder="Adult Care" />
        <bp-form-field label="Schedule" placeholder="08:00 / 18:00" />
        <bp-button>{{ 'common.save' | translate }}</bp-button>
      </div>
    </bp-modal>
  `,
  styles: [`.form-grid { display: grid; gap: 12px; }`],
})
export class AssignDietModalComponent {
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();
}

@Component({
  selector: 'bp-view-reports-modal',
  standalone: true,
  imports: [TranslatePipe, BpModalComponent],
  template: `
    <bp-modal [open]="open" [title]="'animals.viewReports' | translate" (closed)="closed.emit()">
      <div class="modal-body reports">
        @for (report of reports; track report.id) {
          <article>
            <strong>{{ report.title }}</strong>
            <time>{{ report.createdAt }}</time>
            <p>{{ report.summary }}</p>
          </article>
        }
      </div>
    </bp-modal>
  `,
  styles: [`.reports { display: grid; gap: 12px; } article { border: 1px solid var(--bp-border); border-radius: 12px; padding: 14px; } time, p { color: var(--bp-slate-gray); } p { margin-bottom: 0; }`],
})
export class ViewReportsModalComponent {
  @Input() open = false;
  @Input() reports: Report[] = [];
  @Output() closed = new EventEmitter<void>();
}
