import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../../shared/components/bp-button/bp-button.component';
import { BpModalComponent } from '../../../shared/components/bp-modal/bp-modal.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';

const modalStyles = `
  .form-grid { display: grid; gap: 14px; min-width: 0; }
  .two-cols { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; min-width: 0; }
  .modal-actions { margin-top: 8px; }
  .photo-upload { display: grid; justify-items: center; gap: 8px; margin: 2px 0 8px; text-align: center; }
  .photo-circle { width: 96px; height: 96px; border-radius: 50%; border: 1px dashed #8f829b; background: #f5f1f7; position: relative; }
  .photo-circle::before { content: '+'; position: absolute; inset: 0; display: grid; place-items: center; color: #81748c; font-size: 30px; font-weight: 900; }
  .center-copy { text-align: center; }
  .center-copy h3 { margin: 0; font-size: 22px; }
  .center-copy p { margin: 6px auto 0; max-width: 270px; color: var(--bp-slate-gray); }
  .security-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px; }
  .security-card { min-height: 70px; padding: 12px; border-radius: 8px; background: var(--bp-surface-blue); color: var(--bp-dark-navy); }
  .security-card strong, .security-card small { display: block; }
  .security-card small { color: var(--bp-slate-gray); margin-top: 4px; }
  .request { display: flex; justify-content: space-between; gap: 12px; align-items: center; min-width: 0; border: 1px solid var(--bp-border); border-radius: 12px; padding: 14px; }
  .request > div { min-width: 0; }
  .request p { margin: 4px 0 0; color: var(--bp-slate-gray); }
  @media (max-width: 560px) { .two-cols, .request, .security-row { grid-template-columns: 1fr; display: grid; } }
`;

@Component({
  selector: 'bp-edit-shelter-data-modal',
  standalone: true,
  imports: [TranslatePipe, BpModalComponent, FormFieldComponent, BpButtonComponent],
  template: `
    <bp-modal [open]="open" [title]="'settings.editShelter' | translate" size="compact" (closed)="closed.emit()">
      <div class="modal-body form-grid">
        <div class="photo-upload"><span class="photo-circle"></span></div>
        <div class="center-copy">
          <h3>{{ 'settings.shelterConfigTitle' | translate }}</h3>
          <p>{{ 'settings.shelterConfigSubtitle' | translate }}</p>
        </div>
        <bp-form-field [label]="'settings.shelterName' | translate" placeholder="Blue Patitas" />
        <bp-form-field [label]="'settings.mainAddress' | translate" placeholder="Av. Las Flores 123" />
        <bp-form-field [label]="'auth.phone' | translate" placeholder="+51 987 654 321" />
        <bp-form-field [label]="'auth.email' | translate" placeholder="contacto@bluepatitas.com" />
        <section class="security-row">
          <article class="security-card"><strong>{{ 'settings.security' | translate }}</strong><small>2FA {{ 'states.Active' | translate }}</small></article>
          <article class="security-card"><strong>{{ 'settings.sync' | translate }}</strong><small>{{ 'settings.lastSync' | translate }}</small></article>
        </section>
        <div class="modal-actions">
          <bp-button variant="secondary" (clicked)="closed.emit()">{{ 'common.cancel' | translate }}</bp-button>
          <bp-button>{{ 'settings.saveChanges' | translate }}</bp-button>
        </div>
      </div>
    </bp-modal>
  `,
  styles: [modalStyles],
})
export class EditShelterDataModalComponent { @Input() open = false; @Output() closed = new EventEmitter<void>(); }

@Component({
  selector: 'bp-add-user-modal',
  standalone: true,
  imports: [TranslatePipe, BpModalComponent, FormFieldComponent, BpButtonComponent],
  template: `
    <bp-modal [open]="open" [title]="'settings.addUser' | translate" (closed)="closed.emit()">
      <div class="modal-body form-grid">
        <bp-form-field [label]="'settings.userName' | translate" placeholder="Maria Herrera" />
        <bp-form-field [label]="'auth.email' | translate" placeholder="maria@refugiowuf.pe" />
        <div class="two-cols"><bp-form-field [label]="'settings.role' | translate" placeholder="Caretaker" /><bp-form-field [label]="'common.status' | translate" placeholder="Active" /></div>
        <div class="modal-actions"><bp-button variant="secondary" (clicked)="closed.emit()">{{ 'common.cancel' | translate }}</bp-button><bp-button>{{ 'settings.inviteUser' | translate }}</bp-button></div>
      </div>
    </bp-modal>
  `,
  styles: [modalStyles],
})
export class AddUserModalComponent { @Input() open = false; @Output() closed = new EventEmitter<void>(); }

@Component({
  selector: 'bp-edit-user-modal',
  standalone: true,
  imports: [TranslatePipe, BpModalComponent, FormFieldComponent, BpButtonComponent],
  template: `
    <bp-modal [open]="open" [title]="'settings.editUser' | translate" (closed)="closed.emit()">
      <div class="modal-body form-grid">
        <bp-form-field [label]="'settings.userName' | translate" placeholder="Elena Ramos" />
        <div class="two-cols"><bp-form-field [label]="'settings.role' | translate" placeholder="Veterinarian" /><bp-form-field [label]="'common.status' | translate" placeholder="Active" /></div>
        <div class="modal-actions"><bp-button variant="secondary" (clicked)="closed.emit()">{{ 'common.cancel' | translate }}</bp-button><bp-button>{{ 'common.save' | translate }}</bp-button></div>
      </div>
    </bp-modal>
  `,
  styles: [modalStyles],
})
export class EditUserModalComponent { @Input() open = false; @Output() closed = new EventEmitter<void>(); }

@Component({
  selector: 'bp-access-requests-modal',
  standalone: true,
  imports: [TranslatePipe, BpModalComponent, BpButtonComponent],
  template: `
    <bp-modal [open]="open" [title]="'settings.accessRequests' | translate" (closed)="closed.emit()">
      <div class="modal-body form-grid">
        <article class="request"><div><strong>Dra. Sofia Marin</strong><p>Veterinarian - sofia&#64;bluepatitas.app</p></div><bp-button>{{ 'settings.approve' | translate }}</bp-button></article>
        <article class="request"><div><strong>Care Operations</strong><p>Caretaker - care.ops&#64;refugiowuf.pe</p></div><bp-button variant="secondary">{{ 'settings.review' | translate }}</bp-button></article>
        <div class="modal-actions"><bp-button variant="secondary" (clicked)="closed.emit()">{{ 'common.close' | translate }}</bp-button></div>
      </div>
    </bp-modal>
  `,
  styles: [modalStyles],
})
export class AccessRequestsModalComponent { @Input() open = false; @Output() closed = new EventEmitter<void>(); }

@Component({
  selector: 'bp-add-iot-device-modal',
  standalone: true,
  imports: [TranslatePipe, BpModalComponent, FormFieldComponent, BpButtonComponent],
  template: `
    <bp-modal [open]="open" [title]="'settings.addDevice' | translate" (closed)="closed.emit()">
      <div class="modal-body form-grid">
        <bp-form-field [label]="'settings.deviceName' | translate" placeholder="Camera Patio 1" />
        <div class="two-cols"><bp-form-field [label]="'settings.deviceType' | translate" placeholder="Camera" /><bp-form-field [label]="'settings.deviceModel' | translate" placeholder="CAM-01-A" /></div>
        <bp-form-field [label]="'settings.assignment' | translate" placeholder="Puppy Zone" />
        <div class="modal-actions"><bp-button variant="secondary" (clicked)="closed.emit()">{{ 'common.cancel' | translate }}</bp-button><bp-button>{{ 'settings.registerDevice' | translate }}</bp-button></div>
      </div>
    </bp-modal>
  `,
  styles: [modalStyles],
})
export class AddIoTDeviceModalComponent { @Input() open = false; @Output() closed = new EventEmitter<void>(); }
