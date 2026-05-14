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
      <div class="modal-body form-grid add-zone-form">
        <p class="intro">{{ 'monitoring.addZoneSubtitle' | translate }}</p>
        <bp-form-field [label]="'monitoring.zoneName' | translate" placeholder="Puppy Zone" />
        <bp-form-field [label]="'monitoring.pavilion' | translate" [placeholder]="'monitoring.selectPavilion' | translate" />
        <bp-form-field [label]="'monitoring.capacity' | translate" placeholder="15" />
        <bp-form-field [label]="'monitoring.linkCamera' | translate" placeholder="CAM-NORTH-04" />
        <label class="sensor-option"><span></span>{{ 'monitoring.primarySensor' | translate }}</label>
        <label class="sensor-option"><span></span>{{ 'monitoring.secondarySensor' | translate }}</label>
        <strong class="section-label">{{ 'monitoring.alertLimits' | translate }}</strong>
        <div class="two-cols">
          <bp-form-field [label]="'monitoring.maxTemperature' | translate" placeholder="28 C" />
          <bp-form-field [label]="'monitoring.minTemperature' | translate" placeholder="18 C" />
        </div>
        <div class="modal-actions">
          <bp-button variant="secondary" (clicked)="closed.emit()">{{ 'common.cancel' | translate }}</bp-button>
          <bp-button prefix="+">{{ 'monitoring.createZone' | translate }}</bp-button>
        </div>
      </div>
    </bp-modal>
  `,
  styles: [`
    .form-grid { display: grid; gap: 14px; min-width: 0; }
    .add-zone-form { padding-top: 12px; }
    .intro { margin: -10px 0 0; color: var(--bp-slate-gray); font-size: 12px; }
    .two-cols { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; min-width: 0; }
    .section-label { color: var(--bp-dark-navy); font-size: 12px; }
    .sensor-option { min-height: 44px; display: flex; align-items: center; gap: 12px; padding: 0 14px; border: 1px solid var(--bp-border); border-radius: 10px; background: #f9fdff; color: var(--bp-dark-navy); font-weight: 600; }
    .sensor-option span { width: 18px; height: 18px; border: 2px solid #8b97a4; border-radius: 50%; flex: 0 0 auto; }
    .modal-actions { margin-top: 8px; }
    @media (max-width: 560px) { .two-cols { grid-template-columns: 1fr; } }
  `],
})
export class AddMonitoringZoneModalComponent {
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();
}
