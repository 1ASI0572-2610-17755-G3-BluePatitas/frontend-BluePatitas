import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Veterinarian } from '../../../core/domain/models/bluepatitas.models';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../../shared/components/bp-button/bp-button.component';
import { BpModalComponent } from '../../../shared/components/bp-modal/bp-modal.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';

const modalStyles = `
  .form-grid { display: grid; gap: 14px; min-width: 0; }
  .two-cols { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; min-width: 0; }
  .modal-actions { margin-top: 8px; }
  .photo-upload { display: grid; justify-items: center; gap: 8px; margin: 4px 0 10px; color: var(--bp-action-blue); font-size: 11px; font-weight: 800; }
  .photo-circle { width: 76px; height: 76px; border-radius: 50%; display: grid; place-items: center; border: 1px dashed #b2a5bb; background: #f6f2f8; color: #8e7d9b; position: relative; overflow: hidden; }
  .photo-circle img { width: 100%; height: 100%; object-fit: cover; }
  .photo-circle::before { content: '+'; font-size: 26px; font-weight: 800; }
  .photo-circle.has-image::before { display: none; }
  .status-tabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; padding: 4px; border: 1px solid #cbe5f7; border-radius: 10px; background: var(--bp-surface-blue); }
  .status-tabs button { min-height: 30px; border: 0; border-radius: 7px; background: transparent; color: var(--bp-slate-gray); font-weight: 700; cursor: pointer; }
  .status-tabs .active { background: #fff; color: var(--bp-action-blue); box-shadow: 0 1px 4px rgba(11,31,47,.08); }
  .assigned-note { display: flex; gap: 12px; align-items: center; padding: 12px; border: 1px solid #bfe0f4; border-radius: 10px; background: var(--bp-surface-blue); }
  .assigned-note span { width: 34px; height: 34px; border-radius: 8px; background: #fff; position: relative; flex: 0 0 auto; }
  .assigned-note span::before { content: ''; position: absolute; left: 9px; top: 8px; width: 5px; height: 5px; border-radius: 50%; background: var(--bp-slate-gray); box-shadow: 7px 0 0 var(--bp-slate-gray); }
  .assigned-note strong, .assigned-note small { display: block; }
  .assigned-note small { color: var(--bp-slate-gray); font-size: 11px; }
  label.field-label { color: var(--bp-dark-navy); font-size: 12px; font-weight: 800; }
  @media (max-width: 560px) { .two-cols, .status-tabs { grid-template-columns: 1fr; } }
`;

@Component({
  selector: 'bp-add-veterinarian-modal',
  standalone: true,
  imports: [TranslatePipe, BpModalComponent, FormFieldComponent, BpButtonComponent],
  template: `
    <bp-modal [open]="open" [title]="'veterinarians.newTitle' | translate" size="compact" (closed)="closed.emit()">
      <div class="modal-body form-grid">
        <p class="muted">{{ 'veterinarians.newSubtitle' | translate }}</p>
        <div class="photo-upload"><span class="photo-circle"></span>{{ 'veterinarians.uploadPhoto' | translate }}</div>
        <bp-form-field [label]="'veterinarians.fullName' | translate" placeholder="Dr. Juan Perez" />
        <bp-form-field [label]="'veterinarians.institutionalEmail' | translate" placeholder="user@bluepatitas.com" />
        <bp-form-field [label]="'veterinarians.phoneWhatsapp' | translate" placeholder="+51 999 888 777" />
        <bp-form-field [label]="'veterinarians.specialty' | translate" [placeholder]="'veterinarians.selectSpecialty' | translate" />
        <div class="modal-actions">
          <bp-button variant="secondary" (clicked)="closed.emit()">{{ 'common.cancel' | translate }}</bp-button>
          <bp-button prefix="+">{{ 'veterinarians.register' | translate }}</bp-button>
        </div>
      </div>
    </bp-modal>
  `,
  styles: [modalStyles + `.muted { margin: -8px 0 4px; color: var(--bp-slate-gray); }`],
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
    <bp-modal [open]="open" [title]="'veterinarians.edit' | translate" size="compact" (closed)="closed.emit()">
      <div class="modal-body form-grid">
        <p class="muted">{{ 'veterinarians.editSubtitle' | translate }}</p>
        <div class="photo-upload">
          <span class="photo-circle" [class.has-image]="vet?.avatarUrl">
            @if (vet?.avatarUrl) { <img [src]="vet?.avatarUrl" [alt]="vet?.name" /> }
          </span>
          {{ 'veterinarians.changePhoto' | translate }}
        </div>
        <bp-form-field [label]="'veterinarians.fullName' | translate" [placeholder]="vet?.name || 'Elena Ramos'" />
        <bp-form-field [label]="'auth.email' | translate" [placeholder]="vet?.email || 'eramos@bluepatitas.com'" />
        <bp-form-field [label]="'veterinarians.specialty' | translate" [placeholder]="vet?.specialty || 'Internal medicine'" />
        <label class="field-label">{{ 'veterinarians.availabilityStatus' | translate }}</label>
        <div class="status-tabs">
          <button class="active" type="button">{{ 'states.Active' | translate }}</button>
          <button type="button">{{ 'veterinarians.resting' | translate }}</button>
          <button type="button">{{ 'veterinarians.inactive' | translate }}</button>
        </div>
        <section class="assigned-note">
          <span></span>
          <div>
            <strong>12 {{ 'veterinarians.animalsUnderCare' | translate }}</strong>
            <small>{{ 'veterinarians.reassignHint' | translate }}</small>
          </div>
        </section>
        <div class="modal-actions">
          <bp-button variant="secondary" (clicked)="closed.emit()">{{ 'common.cancel' | translate }}</bp-button>
          <bp-button>{{ 'veterinarians.saveChanges' | translate }}</bp-button>
        </div>
      </div>
    </bp-modal>
  `,
  styles: [modalStyles + `.muted { margin: -8px 0 4px; color: var(--bp-slate-gray); }`],
})
export class EditVeterinarianModalComponent {
  @Input() open = false;
  @Input() vet?: Veterinarian;
  @Output() closed = new EventEmitter<void>();
}
