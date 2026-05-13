import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Alert, Device, MonitoringZone } from '../../core/domain/models/bluepatitas.models';
import { GetAlertsUseCase, GetDevicesUseCase, GetMonitoringZonesUseCase } from '../../core/application/use-cases/bluepatitas.use-cases';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../shared/components/bp-button/bp-button.component';
import { BpCardComponent } from '../../shared/components/bp-card/bp-card.component';
import { AddMonitoringZoneModalComponent } from './components/add-monitoring-zone-modal.component';

@Component({
  standalone: true,
  imports: [FormsModule, TranslatePipe, BpButtonComponent, BpCardComponent, AddMonitoringZoneModalComponent],
  template: `
    <div class="page-header">
      <div class="page-title">
        <h1>{{ 'monitoring.title' | translate }}</h1>
        <p>{{ 'monitoring.subtitle' | translate }}</p>
      </div>
      <bp-button prefix="+" (clicked)="zoneOpen = true">{{ 'monitoring.addZone' | translate }}</bp-button>
    </div>

    <div class="search-filter">
      <label class="search-box"><input [(ngModel)]="query" [placeholder]="'monitoring.searchPlaceholder' | translate" /></label>
    </div>

    <section class="monitoring-layout">
      <div class="zone-cards">
        @for (zone of filteredZones; track zone.id; let index = $index) {
          <article class="zone-card">
            <div class="zone-image" [class.cats]="index === 1" [class.placeholder]="index > 1">
              <span class="live">{{ zone.cameraEnabled ? 'Live' : 'Offline' }}</span>
              <b>{{ zone.name }}</b>
            </div>
            <div class="zone-metrics">
              <span>{{ 'monitoring.temperatureShort' | translate }} <strong>{{ zone.temperatureC ?? '--' }}°C</strong></span>
              <span>{{ 'monitoring.humidityShort' | translate }} <strong>{{ zone.humidity ?? '--' }}%</strong></span>
              <span>{{ 'monitoring.animals' | translate }} <strong>{{ zone.animalCount }}</strong></span>
              <span class="state">{{ 'common.status' | translate }} <strong>{{ ('states.' + zone.status) | translate }}</strong></span>
            </div>
            <button class="detail-button" type="button">{{ 'monitoring.viewDetail' | translate }}</button>
          </article>
        }
      </div>

      <aside class="side-stack">
        <bp-card [title]="'monitoring.environmentalAlerts' | translate">
          <div class="alert-list">
            @for (alert of alerts.slice(0, 2); track alert.id) {
              <article [class.critical]="alert.severity === 'Critical'">
                <strong>{{ ('alerts.' + alert.type) | translate }}</strong>
                <p>{{ alert.message }}</p>
              </article>
            }
          </div>
        </bp-card>

        <bp-card [title]="'monitoring.deviceStatus' | translate">
          <div class="device-summary">
            @for (group of deviceGroups; track group.label) {
              <article>
                <span class="device-icon"></span>
                <strong>{{ group.label }}</strong>
                <small [class.warn]="group.warn">{{ group.value }}</small>
              </article>
            }
          </div>
        </bp-card>
      </aside>
    </section>
    <bp-add-monitoring-zone-modal [open]="zoneOpen" (closed)="zoneOpen = false" />
  `,
  styles: [`
    .monitoring-layout { display: grid; grid-template-columns: minmax(0, 1fr) 256px; gap: 12px; align-items: start; }
    .zone-cards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
    .zone-card { background: #fff; border: 1px solid var(--bp-border); border-radius: 8px; overflow: hidden; box-shadow: var(--bp-shadow); }
    .zone-image { position: relative; min-height: 144px; background: linear-gradient(rgba(11,31,47,.18), rgba(11,31,47,.34)), radial-gradient(circle at 35% 70%, rgba(255,255,255,.5) 0 4%, transparent 5%), linear-gradient(135deg, #8daabb, #365668); filter: grayscale(.15); }
    .zone-image.cats { background: linear-gradient(rgba(11,31,47,.18), rgba(11,31,47,.34)), radial-gradient(circle at 58% 48%, rgba(255,255,255,.55) 0 5%, transparent 6%), linear-gradient(135deg, #9fb5c5, #4b6374); }
    .zone-image.placeholder { background: linear-gradient(135deg, #cfe5f5, #8db9d8); }
    .live { position: absolute; top: 12px; right: 12px; display: inline-flex; gap: 6px; align-items: center; border-radius: 999px; background: rgba(11,31,47,.72); color: #fff; padding: 5px 10px; font-size: 11px; font-weight: 800; }
    .live::before { content: ''; width: 7px; height: 7px; border-radius: 50%; background: var(--bp-critical); }
    .zone-image b { position: absolute; left: 10px; bottom: 10px; border-radius: 6px; background: #fff; padding: 6px 10px; font-size: 12px; }
    .zone-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 12px; }
    .zone-metrics span { border: 1px solid #cce4f3; border-radius: 6px; background: var(--bp-surface-blue); padding: 9px; color: var(--bp-slate-gray); font-size: 11px; text-transform: uppercase; }
    .zone-metrics strong { display: block; color: var(--bp-action-blue); font-size: 14px; text-transform: none; margin-top: 3px; }
    .zone-metrics .state { background: #e3fbf6; border-color: #94e8d7; }
    .detail-button { display: block; width: calc(100% - 24px); margin: 0 12px 12px; min-height: 34px; border: 0; border-radius: 999px; background: var(--bp-action-blue); color: #fff; font-weight: 800; cursor: pointer; }
    .side-stack, .alert-list, .device-summary { display: grid; gap: 12px; }
    .alert-list article { border-left: 3px solid #009b96; border-radius: 6px; background: var(--bp-surface-blue); padding: 12px; }
    .alert-list article.critical { border-left-color: var(--bp-critical); background: rgba(217,48,37,.05); }
    .alert-list p { margin: 6px 0 0; color: var(--bp-slate-gray); font-size: 12px; }
    .device-summary article { display: grid; grid-template-columns: 28px minmax(0, 1fr) auto; align-items: center; gap: 10px; padding-bottom: 12px; border-bottom: 1px solid var(--bp-border); }
    .device-summary article:last-child { border-bottom: 0; padding-bottom: 0; }
    .device-icon { width: 28px; height: 28px; border-radius: 50%; background: var(--bp-surface-blue); }
    .device-summary strong { font-size: 13px; }
    .device-summary small { border-radius: 6px; background: #d8fbf4; color: #007a72; padding: 5px 8px; font-size: 11px; font-weight: 800; }
    .device-summary small.warn { background: #fff1f1; color: var(--bp-critical); }
    @media (max-width: 1100px) { .monitoring-layout { grid-template-columns: 1fr; } .side-stack { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 760px) { .zone-cards, .side-stack { grid-template-columns: 1fr; } }
  `],
})
export class MonitoringPage implements OnInit {
  zones: MonitoringZone[] = [];
  devices: Device[] = [];
  alerts: Alert[] = [];
  query = '';
  zoneOpen = false;

  constructor(
    private readonly getZones: GetMonitoringZonesUseCase,
    private readonly getDevices: GetDevicesUseCase,
    private readonly getAlerts: GetAlertsUseCase,
  ) {}

  get filteredZones(): MonitoringZone[] {
    const needle = this.query.trim().toLowerCase();
    return !needle ? this.zones : this.zones.filter((zone) => zone.name.toLowerCase().includes(needle));
  }

  get deviceGroups(): Array<{ label: string; value: string; warn?: boolean }> {
    const cameraCount = this.devices.filter((device) => device.type === 'Camera').length;
    const sensorCount = this.devices.filter((device) => device.type === 'Sensor T/H').length;
    const collarCount = this.devices.filter((device) => device.type === 'GPS Collar').length;
    const dispenserCount = this.devices.filter((device) => device.type === 'Dispenser').length;
    return [
      { label: 'IP Cameras', value: `${cameraCount}/12 Online` },
      { label: 'Temp/Hum Sensors', value: `${sensorCount}/24 Online` },
      { label: 'GPS Collars', value: `${collarCount}/45 Online`, warn: true },
      { label: 'Dispensers', value: `${dispenserCount}/8 Online` },
    ];
  }

  async ngOnInit(): Promise<void> {
    [this.zones, this.devices, this.alerts] = await Promise.all([this.getZones.execute(), this.getDevices.execute(), this.getAlerts.execute()]);
  }
}
