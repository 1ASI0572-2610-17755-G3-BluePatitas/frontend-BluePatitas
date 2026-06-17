import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../../shared/components/bp-button/bp-button.component';
import { BpModalComponent } from '../../../shared/components/bp-modal/bp-modal.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { MonitoringZone } from '../../../core/domain/models/bluepatitas.models';

@Component({
  selector: 'bp-add-monitoring-zone-modal',
  standalone: true,
  imports: [TranslatePipe, BpModalComponent, FormFieldComponent, BpButtonComponent],
  template: `
    <bp-modal [open]="open" [title]="'monitoring.addZone' | translate" (closed)="closed.emit()">
      <div class="modal-body form-grid add-zone-form">
        <p class="intro">{{ 'monitoring.addZoneSubtitle' | translate }}</p>
        <bp-form-field [label]="'monitoring.zoneName' | translate" placeholder="Puppy Zone" [(value)]="name" />
        <bp-form-field [label]="'monitoring.pavilion' | translate" [placeholder]="'monitoring.selectPavilion' | translate" [(value)]="pavilion" />
        <bp-form-field [label]="'monitoring.capacity' | translate" placeholder="15" [(value)]="capacity" />
        <strong class="section-label">{{ 'monitoring.alertLimits' | translate }}</strong>
        <div class="two-cols">
          <bp-form-field [label]="'monitoring.maxTemperature' | translate" placeholder="28 C" [(value)]="maxTemperature" />
          <bp-form-field [label]="'monitoring.minTemperature' | translate" placeholder="18 C" [(value)]="minTemperature" />
        </div>
        <div class="modal-actions">
          <bp-button variant="secondary" (clicked)="closed.emit()">{{ 'common.cancel' | translate }}</bp-button>
          <bp-button prefix="+" (clicked)="onCreate()">{{ 'monitoring.createZone' | translate }}</bp-button>
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
    .modal-actions { margin-top: 8px; }
    @media (max-width: 560px) { .two-cols { grid-template-columns: 1fr; } }
  `],
})
export class AddMonitoringZoneModalComponent {
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Omit<MonitoringZone, 'id'>>();

  name = '';
  pavilion = '';
  capacity = '';
  minTemperature = '';
  maxTemperature = '';

  onCreate(): void {
    if (!this.name.trim()) return;

    this.saved.emit({
      name: this.name.trim(),
      temperatureC: 22,
      humidity: 50,
      status: 'Active',
      animalCount: 0,
      cameraEnabled: false,
      minTemperatureC: this.minTemperature ? parseFloat(this.minTemperature) : null,
      maxTemperatureC: this.maxTemperature ? parseFloat(this.maxTemperature) : null,
    });

    this.name = '';
    this.pavilion = '';
    this.capacity = '';
    this.minTemperature = '';
    this.maxTemperature = '';
    this.closed.emit();
  }
}
