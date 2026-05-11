import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../../shared/components/bp-button/bp-button.component';
import { BpModalComponent } from '../../../shared/components/bp-modal/bp-modal.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';

@Component({
  selector: 'bp-add-veterinarian-modal',
  standalone: true,
  imports: [TranslatePipe, BpModalComponent, FormFieldComponent, BpButtonComponent],
  template: `<bp-modal [open]="open" [title]="'veterinarians.add' | translate" (closed)="closed.emit()"><div class="modal-body form-grid"><bp-form-field label="Full name" /><bp-form-field label="Specialty" /><bp-form-field label="Email" /><div class="modal-actions"><bp-button variant="secondary" (clicked)="closed.emit()">{{ 'common.cancel' | translate }}</bp-button><bp-button>{{ 'common.save' | translate }}</bp-button></div></div></bp-modal>`,
  styles: [`.form-grid { display: grid; gap: 14px; } .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }`],
})
export class AddVeterinarianModalComponent { @Input() open = false; @Output() closed = new EventEmitter<void>(); }

@Component({
  selector: 'bp-edit-veterinarian-modal',
  standalone: true,
  imports: [TranslatePipe, BpModalComponent, FormFieldComponent, BpButtonComponent],
  template: `<bp-modal [open]="open" [title]="'veterinarians.edit' | translate" (closed)="closed.emit()"><div class="modal-body form-grid"><bp-form-field label="Full name" /><bp-form-field label="Phone" /><bp-form-field label="Specialty" /><div class="modal-actions"><bp-button variant="secondary" (clicked)="closed.emit()">{{ 'common.cancel' | translate }}</bp-button><bp-button>{{ 'common.save' | translate }}</bp-button></div></div></bp-modal>`,
  styles: [`.form-grid { display: grid; gap: 14px; } .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }`],
})
export class EditVeterinarianModalComponent { @Input() open = false; @Output() closed = new EventEmitter<void>(); }
