import { Component, OnInit, OnDestroy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Alert, Device, MonitoringZone } from '../../core/domain/models/bluepatitas.models';
import { PerimeterAlert } from '../../core/domain/models/monitoring-api.models';
import { GetAlertsUseCase, GetDevicesUseCase, GetMonitoringZonesUseCase, CreateMonitoringZoneUseCase } from '../../core/application/use-cases/bluepatitas.use-cases';
import { GetPerimeterAlertsUseCase, EnableTrackingUseCase, ResolveAlertUseCase, GetTelemetryByTargetUseCase } from '../../core/application/use-cases/monitoring.use-cases';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../shared/components/bp-button/bp-button.component';
import { BpCardComponent } from '../../shared/components/bp-card/bp-card.component';
import { AddMonitoringZoneModalComponent } from './components/add-monitoring-zone-modal.component';
import { MonitoringZoneDetailModalComponent } from './components/monitoring-zone-detail-modal.component';

/** How often to poll the backend for new telemetry (ms). */
const POLL_INTERVAL_MS = 5_000;

interface LiveZoneReading {
  temperatureC: number | null;
  humidity: number | null;
  updatedAt: Date;
  /** Flash flag — set to true for one render cycle when a new value arrives. */
  changed: boolean;
}

@Component({
  standalone: true,
  imports: [FormsModule, DecimalPipe, TranslatePipe, BpButtonComponent, BpCardComponent, AddMonitoringZoneModalComponent, MonitoringZoneDetailModalComponent],
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

    <!-- ── Live status bar ───────────────────────────────────────────────── -->
    <div class="live-status-bar" [class.connected]="backendOnline" [class.disconnected]="!backendOnline && !initialLoading">
      <span class="pulse-dot" [class.active]="backendOnline"></span>
      @if (initialLoading) {
        <span>Conectando con el backend…</span>
      } @else if (backendOnline) {
        <span>
          Recibiendo datos en tiempo real
          <em>— actualización cada {{ POLL_INTERVAL_MS / 1000 }}s</em>
          @if (lastPollTime) {
            <em>· Último update: {{ formatTime(lastPollTime) }}</em>
          }
        </span>
      } @else {
        <span>⚠ Backend no disponible — esperando conexión…</span>
      }
    </div>

    <section class="monitoring-layout">
      <div class="zone-cards">
        @for (zone of filteredZones; track zone.id; let index = $index) {
          <article class="zone-card">
            <div class="zone-image" [class.cats]="index === 1" [class.placeholder]="!zone.imageUrl">
              @if (zone.imageUrl) {
                <img [src]="zone.imageUrl" [alt]="zone.name" (error)="hideBrokenImage($event)" />
              }
              <span class="live" [class.offline]="!zone.cameraEnabled">{{ zone.cameraEnabled ? 'Live' : 'Offline' }}</span>
              <b>{{ zone.name }}</b>
            </div>
            <div class="zone-metrics">
              <span [class.flash]="liveData[zone.id]?.changed">
                <i class="metric-icon temp"></i>TEMP
                <strong>{{ displayTemp(zone) ?? '--' }}°C</strong>
                @if (liveData[zone.id]) { <small class="api-tag">LIVE</small> }
              </span>
              <span [class.flash]="liveData[zone.id]?.changed">
                <i class="metric-icon humidity"></i>HUM
                <strong>{{ displayHumidity(zone) ?? '--' }}%</strong>
                @if (liveData[zone.id]) { <small class="api-tag">LIVE</small> }
              </span>
              <span><i class="metric-icon animals"></i>{{ 'monitoring.animals' | translate }} <strong>{{ zone.animalCount }}</strong></span>
              <span class="state"><i class="metric-icon status"></i>STATUS <strong>{{ ('states.' + zone.status) | translate }}</strong></span>
            </div>
            @if (liveData[zone.id]?.updatedAt) {
              <p class="zone-timestamp">🕒 {{ formatTime(liveData[zone.id].updatedAt) }}</p>
            }
            <button class="detail-button" type="button" (click)="selectedZone = zone">{{ 'monitoring.viewDetail' | translate }}</button>
          </article>
        }
      </div>

      <aside class="side-stack">
        <!-- Alerts (local mock) -->
        <bp-card [title]="'monitoring.environmentalAlerts' | translate">
          <div class="alert-list">
            @for (alert of allAlerts; track alert.id) {
              <article [class.critical]="alert.severity === 'Critical'">
                <strong>{{ ('alerts.' + alert.type) | translate }}</strong>
                <p>{{ alert.message }}</p>
              </article>
            }
          </div>
        </bp-card>

        <!-- Perimeter alerts (backend) -->
        <bp-card title="Alertas de Perímetro (API)">
          @if (apiLoading) {
            <p class="api-status loading">⏳ Conectando…</p>
          } @else if (apiError) {
            <p class="api-status error">⚠️ Backend no disponible</p>
          } @else if (perimeterAlerts.length === 0) {
            <p class="api-status ok">✅ Sin alertas activas</p>
          } @else {
            <div class="alert-list">
              @for (pa of perimeterAlerts; track pa.id) {
                <article [class.critical]="pa.isBreachConfirmed && pa.trackingActive" class="perimeter-alert">
                  <div class="pa-header">
                    <strong>Brecha de Perímetro</strong>
                    <span class="pa-badge" [class.tracking]="pa.trackingActive" [class.confirmed]="pa.isBreachConfirmed && !pa.trackingActive">
                      {{ pa.trackingActive ? '📡 Tracking' : pa.isBreachConfirmed ? '⚠️ Confirmada' : '🔍 Sin confirmar' }}
                    </span>
                  </div>
                  <p class="pa-target">Target: <code>{{ pa.targetId.slice(0, 8) }}…</code></p>
                  @if (pa.currentCoordinates) {
                    <p class="pa-coords">📍 {{ pa.currentCoordinates.latitude | number:'1.4-4' }}, {{ pa.currentCoordinates.longitude | number:'1.4-4' }}</p>
                  }
                  <div class="pa-actions">
                    @if (pa.isBreachConfirmed && !pa.trackingActive) {
                      <button class="pa-btn track" (click)="enableTracking(pa)" [disabled]="actionLoading === pa.id">
                        {{ actionLoading === pa.id ? '…' : '📡 Tracking' }}
                      </button>
                    }
                    @if (pa.isBreachConfirmed) {
                      <button class="pa-btn resolve" (click)="resolveAlert(pa)" [disabled]="actionLoading === pa.id">
                        {{ actionLoading === pa.id ? '…' : '✔ Resolver' }}
                      </button>
                    }
                  </div>
                </article>
              }
            </div>
          }
        </bp-card>

        <!-- Device summary -->
        <bp-card [title]="'monitoring.deviceStatus' | translate">
          <div class="device-summary">
            @for (group of deviceGroups; track group.label) {
              <article>
                <span class="device-icon" [class]="group.icon"></span>
                <strong>{{ group.label }}</strong>
                <small [class.warn]="group.warn">{{ group.value }}</small>
              </article>
            }
          </div>
        </bp-card>
      </aside>
    </section>

    <bp-add-monitoring-zone-modal [open]="zoneOpen" (closed)="zoneOpen = false" (saved)="onZoneSaved($event)" />
    <bp-monitoring-zone-detail-modal
      [open]="!!selectedZone"
      [zone]="selectedZone"
      (closed)="selectedZone = undefined"
      (telemetryPosted)="onTelemetryPosted($event)" />
  `,
  styles: [`
    /* ── Live status bar ─────────────────────────────────────────────────── */
    .live-status-bar {
      display: flex; align-items: center; gap: 10px;
      border-radius: 10px; padding: 10px 16px; margin-bottom: 14px;
      font-size: 12px; font-weight: 600;
      background: #f3f4f6; color: #6b7280;
      transition: background .4s, color .4s;
    }
    .live-status-bar.connected { background: #ecfdf5; color: #065f46; }
    .live-status-bar.disconnected { background: #fff7ed; color: #92400e; }
    .live-status-bar em { font-style: normal; font-weight: 400; opacity: .75; }
    .pulse-dot {
      width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
      background: #d1d5db;
      transition: background .4s;
    }
    .pulse-dot.active {
      background: #10b981;
      animation: pulse-ring 2s ease-out infinite;
    }
    @keyframes pulse-ring {
      0%   { box-shadow: 0 0 0 0 rgba(16,185,129,.5); }
      60%  { box-shadow: 0 0 0 8px rgba(16,185,129,0); }
      100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
    }
    /* ── Flash animation when a value changes ────────────────────────────── */
    @keyframes value-flash {
      0%   { background: rgba(16,185,129,.25); }
      100% { background: transparent; }
    }
    .flash { animation: value-flash .8s ease-out; }
    /* ── LIVE tag ────────────────────────────────────────────────────────── */
    .api-tag {
      display: inline-block; font-size: 9px; font-weight: 800; letter-spacing: .5px;
      background: #10b981; color: #fff; border-radius: 4px;
      padding: 1px 4px; margin-left: 4px; vertical-align: middle;
    }
    /* ── Timestamp under zone card ───────────────────────────────────────── */
    .zone-timestamp {
      margin: -4px 12px 6px; font-size: 10px; color: var(--bp-slate-gray);
    }
    /* ── Layout (same as before) ─────────────────────────────────────────── */
    .monitoring-layout { display: grid; grid-template-columns: minmax(0, 1fr) 274px; gap: 12px; align-items: start; }
    .zone-cards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
    .zone-card { background: #fff; border: 1px solid var(--bp-border); border-radius: 8px; overflow: hidden; box-shadow: var(--bp-shadow); }
    .zone-image { position: relative; min-height: 144px; background: linear-gradient(rgba(11,31,47,.18),rgba(11,31,47,.34)),linear-gradient(135deg,#8daabb,#365668); overflow: hidden; }
    .zone-image img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: grayscale(.12) saturate(.72); }
    .zone-image::after { content: ''; position: absolute; inset: 0; background: rgba(11,31,47,.22); }
    .zone-image.cats { background: linear-gradient(rgba(11,31,47,.18),rgba(11,31,47,.34)),linear-gradient(135deg,#9fb5c5,#4b6374); }
    .zone-image.placeholder { background: linear-gradient(135deg,#cfe5f5,#8db9d8); }
    .live { position: absolute; z-index: 1; top: 12px; right: 12px; display: inline-flex; gap: 6px; align-items: center; border-radius: 999px; background: rgba(11,31,47,.72); color: #fff; padding: 5px 10px; font-size: 11px; font-weight: 800; }
    .live::before { content: ''; width: 7px; height: 7px; border-radius: 50%; background: var(--bp-critical); }
    .live.offline::before { background: #b5c2cc; }
    .zone-image b { position: absolute; z-index: 1; left: 10px; bottom: 10px; border-radius: 6px; background: #fff; padding: 6px 10px; font-size: 12px; }
    .zone-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 12px; }
    .zone-metrics span { border: 1px solid #cce4f3; border-radius: 6px; background: var(--bp-surface-blue); padding: 9px; color: var(--bp-slate-gray); font-size: 11px; text-transform: uppercase; transition: background .3s; }
    .zone-metrics strong { display: block; color: var(--bp-action-blue); font-size: 16px; font-weight: 800; text-transform: none; margin-top: 3px; }
    .zone-metrics .state { background: #e3fbf6; border-color: #94e8d7; }
    .metric-icon { display: inline-block; width: 13px; height: 13px; margin-right: 4px; vertical-align: -2px; position: relative; color: #405064; }
    .metric-icon::before, .metric-icon::after { content: ''; position: absolute; box-sizing: border-box; }
    .metric-icon.temp::before { left: 5px; top: 0; width: 4px; height: 9px; border: 1.5px solid currentColor; border-radius: 999px; }
    .metric-icon.temp::after { left: 3px; bottom: 0; width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
    .metric-icon.humidity::before { inset: 1px 3px; border: 1.5px solid currentColor; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); }
    .metric-icon.animals::before { left: 4px; top: 6px; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    .metric-icon.animals::after { left: 1px; top: 2px; width: 3px; height: 3px; border-radius: 50%; background: currentColor; box-shadow: 4px -2px 0 currentColor, 8px 0 0 currentColor, 10px 4px 0 currentColor; }
    .metric-icon.status::before { inset: 1px; border: 1.5px solid currentColor; border-radius: 50%; }
    .metric-icon.status::after { left: 4px; top: 4px; width: 5px; height: 3px; border-left: 1.5px solid currentColor; border-bottom: 1.5px solid currentColor; transform: rotate(-45deg); }
    .detail-button { display: block; width: calc(100% - 24px); margin: 0 12px 12px; min-height: 34px; border: 0; border-radius: 999px; background: var(--bp-action-blue); color: #fff; font-weight: 800; cursor: pointer; }
    .side-stack, .alert-list, .device-summary { display: grid; gap: 12px; }
    .alert-list article { border-left: 3px solid #009b96; border-radius: 6px; background: var(--bp-surface-blue); padding: 12px; }
    .alert-list article.critical { border-left-color: var(--bp-critical); background: rgba(217,48,37,.05); }
    .alert-list p { margin: 6px 0 0; color: var(--bp-slate-gray); font-size: 12px; }
    .api-status { margin: 0; padding: 10px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; }
    .api-status.loading { background: #fffbea; color: #856404; }
    .api-status.error { background: #fff1f1; color: var(--bp-critical); }
    .api-status.ok { background: #edfdf8; color: #007a72; }
    .perimeter-alert { border-left-color: #e68a00 !important; background: #fffbea !important; }
    .perimeter-alert.critical { border-left-color: var(--bp-critical) !important; background: rgba(217,48,37,.05) !important; }
    .pa-header { display: flex; justify-content: space-between; align-items: center; gap: 6px; flex-wrap: wrap; }
    .pa-badge { font-size: 10px; font-weight: 800; padding: 3px 7px; border-radius: 999px; background: #ffefc4; color: #7a4800; white-space: nowrap; }
    .pa-badge.tracking { background: #d6f0ff; color: #005f8e; }
    .pa-badge.confirmed { background: #ffe0e0; color: #a10000; }
    .pa-target, .pa-coords { margin: 4px 0 0; font-size: 11px; color: var(--bp-slate-gray); }
    .pa-target code { background: #edf3f7; border-radius: 4px; padding: 1px 4px; font-size: 10px; }
    .pa-actions { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
    .pa-btn { border: 0; border-radius: 6px; padding: 5px 10px; font-size: 11px; font-weight: 700; cursor: pointer; transition: opacity .15s; }
    .pa-btn:disabled { opacity: .5; cursor: default; }
    .pa-btn.track { background: #d6f0ff; color: #005f8e; }
    .pa-btn.resolve { background: #d8fbf4; color: #007a72; }
    .device-summary article { display: grid; grid-template-columns: 28px minmax(0, 1fr) auto; align-items: center; gap: 10px; padding-bottom: 12px; border-bottom: 1px solid var(--bp-border); }
    .device-summary article:last-child { border-bottom: 0; padding-bottom: 0; }
    .device-icon { width: 28px; height: 28px; border-radius: 50%; background: var(--bp-surface-blue); position: relative; color: var(--bp-action-blue); }
    .device-icon::before, .device-icon::after { content: ''; position: absolute; box-sizing: border-box; }
    .device-icon.camera::before { inset: 8px 7px; border: 2px solid currentColor; border-radius: 2px; }
    .device-icon.sensor::before { left: 8px; top: 6px; width: 12px; height: 14px; border-left: 2px solid currentColor; border-right: 2px solid currentColor; border-radius: 50%; }
    .device-icon.gps::before { inset: 7px 9px 9px; border: 2px solid var(--bp-critical); border-radius: 50% 50% 50% 0; transform: rotate(-45deg); }
    .device-icon.dispenser::before { inset: 7px 9px; border: 2px solid currentColor; border-radius: 2px; }
    .device-summary strong { font-size: 13px; }
    .device-summary small { border-radius: 6px; background: #d8fbf4; color: #007a72; padding: 5px 8px; font-size: 11px; font-weight: 800; }
    .device-summary small.warn { background: #fff1f1; color: var(--bp-critical); }
    @media (max-width: 1100px) { .monitoring-layout { grid-template-columns: 1fr; } .side-stack { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 760px) { .zone-cards, .side-stack { grid-template-columns: 1fr; } }
  `],
})
export class MonitoringPage implements OnInit, OnDestroy {
  readonly POLL_INTERVAL_MS = POLL_INTERVAL_MS;

  zones: MonitoringZone[] = [];
  devices: Device[] = [];
  alerts: Alert[] = [];
  perimeterAlerts: PerimeterAlert[] = [];
  environmentalAlerts: Alert[] = [];
  query = '';
  zoneOpen = false;
  selectedZone?: MonitoringZone;

  apiLoading = true;
  apiError = false;
  actionLoading: string | null = null;

  initialLoading = true;
  backendOnline = false;
  lastPollTime: Date | null = null;

  /** Live readings per zone.id — updated automatically every POLL_INTERVAL_MS. */
  liveData: Record<string, LiveZoneReading> = {};

  private pollTimer: ReturnType<typeof setInterval> | null = null;

  get allAlerts(): Alert[] {
    return [...this.environmentalAlerts, ...this.alerts];
  }

  constructor(
    private readonly getZones: GetMonitoringZonesUseCase,
    private readonly getDevices: GetDevicesUseCase,
    private readonly getAlerts: GetAlertsUseCase,
    private readonly getPerimeterAlerts: GetPerimeterAlertsUseCase,
    private readonly enableTrackingUseCase: EnableTrackingUseCase,
    private readonly resolveAlertUseCase: ResolveAlertUseCase,
    private readonly getTelemetry: GetTelemetryByTargetUseCase,
    private readonly createZone: CreateMonitoringZoneUseCase,
  ) {}

  get filteredZones(): MonitoringZone[] {
    const needle = this.query.trim().toLowerCase();
    return !needle ? this.zones : this.zones.filter((z) => z.name.toLowerCase().includes(needle));
  }

  get deviceGroups(): Array<{ label: string; value: string; icon: string; warn?: boolean }> {
    const cam = this.devices.filter((d) => d.type === 'Camera').length;
    const sen = this.devices.filter((d) => d.type === 'Sensor T/H').length;
    const gps = this.devices.filter((d) => d.type === 'GPS Collar').length;
    const dis = this.devices.filter((d) => d.type === 'Dispenser').length;
    return [
      { label: 'IP Cameras',        value: `${cam}/12 Online`, icon: 'camera' },
      { label: 'Temp/Hum Sensors',  value: `${sen}/24 Online`, icon: 'sensor' },
      { label: 'GPS Collars',       value: `${gps}/45 Online`, icon: 'gps', warn: true },
      { label: 'Dispensers',        value: `${dis}/8 Online`,  icon: 'dispenser' },
    ];
  }

  displayTemp(zone: MonitoringZone): number | null {
    return this.liveData[zone.id]?.temperatureC ?? zone.temperatureC;
  }

  displayHumidity(zone: MonitoringZone): number | null {
    return this.liveData[zone.id]?.humidity ?? zone.humidity;
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  async ngOnInit(): Promise<void> {
    [this.zones, this.devices, this.alerts] = await Promise.all([
      this.getZones.execute(),
      this.getDevices.execute(),
      this.getAlerts.execute(),
    ]);

    // Perimeter alerts (background, non-blocking)
    this.apiLoading = true;
    this.apiError = false;
    this.getPerimeterAlerts.execute()
      .then((list) => { this.perimeterAlerts = list; })
      .catch(() => { this.apiError = true; })
      .finally(() => { this.apiLoading = false; });

    // First telemetry load
    await this.pollTelemetry();
    this.initialLoading = false;

    // Start polling loop
    this.pollTimer = setInterval(() => this.pollTelemetry(), POLL_INTERVAL_MS);
  }

  ngOnDestroy(): void {
    if (this.pollTimer !== null) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  /**
   * Fetches the latest telemetry for every zone that has a targetId.
   * If the value changed since the last poll, marks it so the flash animation triggers.
   */
  private async pollTelemetry(): Promise<void> {
    const zones = this.zones.filter((z) => z.targetId);
    if (zones.length === 0) return;

    const results = await Promise.allSettled(
      zones.map(async (zone) => {
        const records = await this.getTelemetry.execute(zone.targetId!);
        if (records.length === 0) return;

        const latest = records[records.length - 1];
        const prev = this.liveData[zone.id];

        const tempChanged = !prev || prev.temperatureC !== latest.ambientTemperature;
        const humChanged  = !prev || prev.humidity      !== latest.ambientHumidity;
        const anyChange   = tempChanged || humChanged;

        // Update the live data record
        this.liveData[zone.id] = {
          temperatureC: latest.ambientTemperature,
          humidity:     latest.ambientHumidity,
          updatedAt:    new Date(latest.recordedAt ?? Date.now()),
          changed:      anyChange,
        };

        // Reset the "changed" flag after one animation cycle (900ms)
        if (anyChange) {
          setTimeout(() => {
            if (this.liveData[zone.id]) {
              this.liveData[zone.id] = { ...this.liveData[zone.id], changed: false };
            }
          }, 900);
        }
      })
    );

    const anySuccess = results.some((r) => r.status === 'fulfilled');
    this.backendOnline = anySuccess;
    if (anySuccess) this.lastPollTime = new Date();
    this.checkEnvironmentalAlerts();
  }

  checkEnvironmentalAlerts(): void {
    const newEnvAlerts: Alert[] = [];
    for (const zone of this.zones) {
      const temp = this.liveData[zone.id]?.temperatureC ?? zone.temperatureC;
      const hum = this.liveData[zone.id]?.humidity ?? zone.humidity;

      if (temp !== null && temp !== undefined) {
        if (zone.maxTemperatureC !== null && zone.maxTemperatureC !== undefined && temp > zone.maxTemperatureC) {
          newEnvAlerts.push({
            id: `temp-high-${zone.id}`,
            type: 'High temperature',
            message: `Temperature is above the optimal range in ${zone.name}.`,
            severity: 'Critical',
            zoneId: zone.id,
            createdAt: new Date().toISOString()
          });
        } else if (zone.minTemperatureC !== null && zone.minTemperatureC !== undefined && temp < zone.minTemperatureC) {
          newEnvAlerts.push({
            id: `temp-low-${zone.id}`,
            type: 'Low temperature',
            message: `Temperature is below the optimal range in ${zone.name}.`,
            severity: 'Critical',
            zoneId: zone.id,
            createdAt: new Date().toISOString()
          });
        }
      }

      if (hum !== null && hum !== undefined && hum >= 70) {
        newEnvAlerts.push({
          id: `hum-high-${zone.id}`,
          type: 'High humidity',
          message: `Humidity has exceeded the safe threshold in ${zone.name}.`,
          severity: 'Warning',
          zoneId: zone.id,
          createdAt: new Date().toISOString()
        });
      }
    }
    this.environmentalAlerts = newEnvAlerts;
  }

  onTelemetryPosted(event: { zoneId: string; temperatureC: number; humidity: number }): void {
    this.liveData[event.zoneId] = {
      temperatureC: event.temperatureC,
      humidity:     event.humidity,
      updatedAt:    new Date(),
      changed:      true,
    };
    this.backendOnline = true;
    this.lastPollTime = new Date();
    this.checkEnvironmentalAlerts();
    setTimeout(() => {
      if (this.liveData[event.zoneId]) {
        this.liveData[event.zoneId] = { ...this.liveData[event.zoneId], changed: false };
      }
    }, 900);
  }

  async onZoneSaved(event: Omit<MonitoringZone, 'id'>): Promise<void> {
    const newZone = await this.createZone.execute(event);
    this.zones.push(newZone);
  }

  async enableTracking(alert: PerimeterAlert): Promise<void> {
    this.actionLoading = alert.id;
    try {
      const updated = await this.enableTrackingUseCase.execute(alert.targetId, alert.id);
      this.perimeterAlerts = this.perimeterAlerts.map((a) => (a.id === updated.id ? updated : a));
    } catch (err) { console.error('[Monitoring] enableTracking failed', err); }
    finally { this.actionLoading = null; }
  }

  async resolveAlert(alert: PerimeterAlert): Promise<void> {
    this.actionLoading = alert.id;
    try {
      const updated = await this.resolveAlertUseCase.execute(alert.id);
      this.perimeterAlerts = this.perimeterAlerts.map((a) => (a.id === updated.id ? updated : a));
    } catch (err) { console.error('[Monitoring] resolveAlert failed', err); }
    finally { this.actionLoading = null; }
  }

  hideBrokenImage(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
