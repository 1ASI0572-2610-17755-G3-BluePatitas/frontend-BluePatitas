import { Component, Input } from '@angular/core';
import { Device } from '../../../core/domain/models/bluepatitas.models';
import { StatusChipComponent } from '../status-chip/status-chip.component';

@Component({
  selector: 'bp-device-status-card',
  standalone: true,
  imports: [StatusChipComponent],
  template: `
    <article>
      <strong>{{ device.name }}</strong>
      <small>{{ device.type }} · {{ device.lastSync }}</small>
      <bp-status-chip [status]="device.status" />
    </article>
  `,
  styles: [`
    article { display: grid; gap: 6px; padding: 16px; border: 1px solid var(--bp-border); border-radius: 14px; background: white; }
    small { color: var(--bp-slate-gray); }
  `],
})
export class DeviceStatusCardComponent {
  @Input({ required: true }) device!: Device;
}
