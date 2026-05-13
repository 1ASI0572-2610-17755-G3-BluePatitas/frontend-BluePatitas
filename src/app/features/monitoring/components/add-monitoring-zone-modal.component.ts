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
        <bp-form-field [label]="'monitoring.zoneName' | translate" placeholder="Puppy Zone" />
        <div class="two-cols">
          <bp-form-field [label]="'monitoring.minTemperature' | translate" placeholder="22°C" />
          <bp-form-field [label]="'monitoring.maxTemperature' | translate" placeholder="28°C" />
        </div>
        <div class="two-cols">
          <bp-form-field [label]="'monitoring.minHumidity' | translate" placeholder="45%" />
          <bp-form-field [label]="'monitoring.maxHumidity' | translate" placeholder="70%" />
        </div>
        <bp-form-field [label]="'monitoring.cameraUrl' | translate" placeholder="rtsp://camera-zone-01" />
        <div class="modal-actions">
          <bp-button variant="secondary" (clicked)="closed.emit()">{{ 'common.cancel' | translate }}</bp-button>
          <bp-button>{{ 'monitoring.saveZone' | translate }}</bp-button>
        </div>
      </div>
    </bp-modal>
  `,
  styles: [`
    .form-grid { display: grid; gap: 14px; min-width: 0; }
    .two-cols { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; min-width: 0; }
    .modal-actions { margin-top: 8px; }
    @media (max-width: 560px) { .two-cols { grid-template-columns: 1fr; } }
  `],
})
export class AddMonitoringZoneModalComponent {
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();
}
