import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../../shared/components/bp-button/bp-button.component';
import { BpModalComponent } from '../../../shared/components/bp-modal/bp-modal.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';

@Component({
  selector: 'bp-add-monitoring-zone-modal',
  standalone: true,
  imports: [TranslatePipe, BpModalComponent, FormFieldComponent, BpButtonComponent],
  template: `
    <bp-modal [open]="open" [title]="'monitoring.addZone' | translate" (closed)="closed.emit()">
      <div class="modal-body form-grid">
        <bp-form-field label="Zone name" />
        <bp-form-field label="Temperature range" placeholder="22°C - 28°C" />
        <bp-form-field label="Humidity range" placeholder="45% - 70%" />
        <div class="modal-actions">
          <bp-button variant="secondary" (clicked)="closed.emit()">{{ 'common.cancel' | translate }}</bp-button>
          <bp-button>{{ 'common.save' | translate }}</bp-button>
        </div>
      </div>
    </bp-modal>
  `,
  styles: [`.form-grid { display: grid; gap: 14px; } .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }`],
})
export class AddMonitoringZoneModalComponent {
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();
}
