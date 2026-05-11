import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../../shared/components/bp-button/bp-button.component';
import { BpModalComponent } from '../../../shared/components/bp-modal/bp-modal.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';

const modalStyles = `.form-grid { display: grid; gap: 12px; }`;

@Component({ selector: 'bp-edit-shelter-data-modal', standalone: true, imports: [TranslatePipe, BpModalComponent, FormFieldComponent, BpButtonComponent], template: `<bp-modal [open]="open" [title]="'settings.editShelter' | translate" (closed)="closed.emit()"><div class="modal-body form-grid"><bp-form-field label="Shelter name" /><bp-form-field label="Address" /><bp-button>{{ 'common.save' | translate }}</bp-button></div></bp-modal>`, styles: [modalStyles] })
export class EditShelterDataModalComponent { @Input() open = false; @Output() closed = new EventEmitter<void>(); }

@Component({ selector: 'bp-add-user-modal', standalone: true, imports: [TranslatePipe, BpModalComponent, FormFieldComponent, BpButtonComponent], template: `<bp-modal [open]="open" [title]="'settings.addUser' | translate" (closed)="closed.emit()"><div class="modal-body form-grid"><bp-form-field label="Name" /><bp-form-field label="Email" /><bp-form-field label="Role" /><bp-button>{{ 'common.save' | translate }}</bp-button></div></bp-modal>`, styles: [modalStyles] })
export class AddUserModalComponent { @Input() open = false; @Output() closed = new EventEmitter<void>(); }

@Component({ selector: 'bp-edit-user-modal', standalone: true, imports: [TranslatePipe, BpModalComponent, FormFieldComponent, BpButtonComponent], template: `<bp-modal [open]="open" [title]="'settings.editUser' | translate" (closed)="closed.emit()"><div class="modal-body form-grid"><bp-form-field label="Name" /><bp-form-field label="Role" /><bp-button>{{ 'common.save' | translate }}</bp-button></div></bp-modal>`, styles: [modalStyles] })
export class EditUserModalComponent { @Input() open = false; @Output() closed = new EventEmitter<void>(); }

@Component({ selector: 'bp-access-requests-modal', standalone: true, imports: [TranslatePipe, BpModalComponent, BpButtonComponent], template: `<bp-modal [open]="open" [title]="'settings.accessRequests' | translate" (closed)="closed.emit()"><div class="modal-body form-grid"><p class="muted">2 pending veterinarian access requests.</p><bp-button>{{ 'common.save' | translate }}</bp-button></div></bp-modal>`, styles: [modalStyles] })
export class AccessRequestsModalComponent { @Input() open = false; @Output() closed = new EventEmitter<void>(); }

@Component({ selector: 'bp-add-iot-device-modal', standalone: true, imports: [TranslatePipe, BpModalComponent, FormFieldComponent, BpButtonComponent], template: `<bp-modal [open]="open" [title]="'settings.addDevice' | translate" (closed)="closed.emit()"><div class="modal-body form-grid"><bp-form-field label="Device name" /><bp-form-field label="Device type" /><bp-form-field label="Monitoring zone" /><bp-button>{{ 'common.save' | translate }}</bp-button></div></bp-modal>`, styles: [modalStyles] })
export class AddIoTDeviceModalComponent { @Input() open = false; @Output() closed = new EventEmitter<void>(); }
