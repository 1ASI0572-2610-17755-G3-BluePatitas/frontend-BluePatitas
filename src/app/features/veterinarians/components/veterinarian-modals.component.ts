import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../../shared/components/bp-button/bp-button.component';
import { BpModalComponent } from '../../../shared/components/bp-modal/bp-modal.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';

const modalStyles = `
  .form-grid { display: grid; gap: 14px; min-width: 0; }
  .two-cols { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; min-width: 0; }
  .modal-actions { margin-top: 8px; }
  @media (max-width: 560px) { .two-cols { grid-template-columns: 1fr; } }
`;

@Component({
  selector: 'bp-add-veterinarian-modal',
  standalone: true,
  imports: [TranslatePipe, BpModalComponent, FormFieldComponent, BpButtonComponent],
  template: `
    <bp-modal [open]="open" [title]="'veterinarians.add' | translate" (closed)="closed.emit()">
      <div class="modal-body form-grid">
        <bp-form-field [label]="'veterinarians.fullName' | translate" placeholder="Dra. Elena Ramos" />
        <bp-form-field [label]="'auth.email' | translate" placeholder="elena@bluepatitas.app" />
        <div class="two-cols">
          <bp-form-field [label]="'veterinarians.specialty' | translate" placeholder="Internal medicine" />
          <bp-form-field [label]="'auth.phone' | translate" placeholder="+51 900 111 222" />
        </div>
        <bp-form-field [label]="'veterinarians.assignedAnimals' | translate" placeholder="12" />
        <div class="modal-actions">
          <bp-button variant="secondary" (clicked)="closed.emit()">{{ 'common.cancel' | translate }}</bp-button>
          <bp-button>{{ 'veterinarians.saveVeterinarian' | translate }}</bp-button>
        </div>
      </div>
    </bp-modal>
  `,
  styles: [modalStyles],
})
export class AddVeterinarianModalComponent {
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();
}

@Component({
  selector: 'bp-edit-veterinarian-modal',
  standalone: true,
  imports: [TranslatePipe, BpModalComponent, FormFieldComponent, BpButtonComponent],
  template: `
    <bp-modal [open]="open" [title]="'veterinarians.edit' | translate" (closed)="closed.emit()">
      <div class="modal-body form-grid">
        <bp-form-field [label]="'veterinarians.fullName' | translate" placeholder="Dra. Elena Ramos" />
        <bp-form-field [label]="'auth.email' | translate" placeholder="elena@bluepatitas.app" />
        <div class="two-cols">
          <bp-form-field [label]="'veterinarians.specialty' | translate" placeholder="Internal medicine" />
          <bp-form-field [label]="'common.status' | translate" placeholder="Active" />
        </div>
        <div class="modal-actions">
          <bp-button variant="secondary" (clicked)="closed.emit()">{{ 'common.cancel' | translate }}</bp-button>
          <bp-button>{{ 'common.save' | translate }}</bp-button>
        </div>
      </div>
    </bp-modal>
  `,
  styles: [modalStyles],
})
export class EditVeterinarianModalComponent {
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();
}
