import { Component, OnInit } from '@angular/core';
import { Device, MonitoringZone } from '../../core/domain/models/bluepatitas.models';
import { GetDevicesUseCase, GetMonitoringZonesUseCase } from '../../core/application/use-cases/bluepatitas.use-cases';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../shared/components/bp-button/bp-button.component';
import { BpCardComponent } from '../../shared/components/bp-card/bp-card.component';
import { DeviceStatusCardComponent } from '../../shared/components/device-status-card/device-status-card.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { AddMonitoringZoneModalComponent } from './components/add-monitoring-zone-modal.component';

@Component({
  standalone: true,
  imports: [TranslatePipe, BpButtonComponent, BpCardComponent, DeviceStatusCardComponent, StatusChipComponent, AddMonitoringZoneModalComponent],
  template: `
    <div class="page-header">
      <div class="page-title">
        <h1>{{ 'monitoring.title' | translate }}</h1>
        <p>{{ 'monitoring.subtitle' | translate }}</p>
      </div>
      <bp-button (clicked)="zoneOpen = true">{{ 'monitoring.addZone' | translate }}</bp-button>
    </div>

    <section class="monitoring-grid">
      <bp-card [title]="'dashboard.environmentByZone' | translate">
        <div class="zones">
          @for (zone of zones; track zone.id) {
            <article>
              <header><strong>{{ zone.name }}</strong><bp-status-chip [status]="zone.status" /></header>
              <div class="readings">
                <span>{{ 'monitoring.temperature' | translate }}<b>{{ zone.temperatureC ?? '--' }}°C</b></span>
                <span>{{ 'monitoring.humidity' | translate }}<b>{{ zone.humidity ?? '--' }}%</b></span>
                <span>{{ 'monitoring.camera' | translate }}<b>{{ zone.cameraEnabled ? 'Online' : 'Offline' }}</b></span>
              </div>
            </article>
          }
        </div>
      </bp-card>
      <bp-card [title]="'nav.devices' | translate">
        <div class="devices">
          @for (device of devices; track device.id) { <bp-device-status-card [device]="device" /> }
        </div>
      </bp-card>
    </section>
    <bp-add-monitoring-zone-modal [open]="zoneOpen" (closed)="zoneOpen = false" />
  `,
  styles: [`
    .monitoring-grid { display: grid; grid-template-columns: 1.4fr .8fr; gap: 20px; }
    .zones, .devices { display: grid; gap: 14px; }
    article { border: 1px solid var(--bp-border); border-radius: 14px; padding: 18px; }
    article header { display: flex; justify-content: space-between; gap: 16px; }
    .readings { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 16px; }
    .readings span { background: var(--bp-surface-blue); border-radius: 10px; padding: 12px; color: var(--bp-slate-gray); }
    .readings b { display: block; color: var(--bp-dark-navy); margin-top: 4px; font-size: 20px; }
    @media (max-width: 1100px) { .monitoring-grid { grid-template-columns: 1fr; } }
  `],
})
export class MonitoringPage implements OnInit {
  zones: MonitoringZone[] = [];
  devices: Device[] = [];
  zoneOpen = false;

  constructor(private readonly getZones: GetMonitoringZonesUseCase, private readonly getDevices: GetDevicesUseCase) {}

  async ngOnInit(): Promise<void> {
    [this.zones, this.devices] = await Promise.all([this.getZones.execute(), this.getDevices.execute()]);
  }
}
