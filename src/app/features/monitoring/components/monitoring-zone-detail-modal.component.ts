import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonitoringZone } from '../../../core/domain/models/bluepatitas.models';
import { TelemetryRecord } from '../../../core/domain/models/monitoring-api.models';
import { GetTelemetryByTargetUseCase, ProcessTelemetryUseCase } from '../../../core/application/use-cases/monitoring.use-cases';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../../shared/components/bp-button/bp-button.component';
import { BpModalComponent } from '../../../shared/components/bp-modal/bp-modal.component';

@Component({
  selector: 'bp-monitoring-zone-detail-modal',
  standalone: true,
  imports: [TranslatePipe, BpButtonComponent, BpModalComponent, DecimalPipe, FormsModule],
  template: `
    <bp-modal [open]="open" [title]="zone?.name || ''" (closed)="closed.emit()">
      @if (zone) {
        <div class="zone-detail">
          <header class="detail-heading">
            <div>
              <span [class.offline]="!zone.cameraEnabled">{{ zone.cameraEnabled ? 'Live' : 'Offline' }}</span>
              <p>{{ 'monitoring.realtimeSubtitle' | translate }}</p>
            </div>
          </header>

          <section class="camera-frame">
            @if (zone.imageUrl) {
              <img [src]="zone.imageUrl" [alt]="zone.name" (error)="hideBrokenImage($event)" />
            }
            <b>CAM-01</b>
            <div class="camera-actions"><span></span><i></i></div>
          </section>

          <!-- ── Live metrics (real backend values when available) ──────── -->
          <section class="detail-metrics">
            <article>
              <span class="mini-icon temp"></span>
              <small>{{ 'monitoring.temperature' | translate }}</small>
              <strong>
                {{ displayTemp ?? '--' }}°C
                @if (latestTelemetry) { <em class="live-pill">API</em> }
              </strong>
              <p>{{ 'monitoring.temperatureHint' | translate }}</p>
            </article>
            <article>
              <span class="mini-icon humidity"></span>
              <small>{{ 'monitoring.humidity' | translate }}</small>
              <strong>
                {{ displayHumidity ?? '--' }}%
                @if (latestTelemetry) { <em class="live-pill">API</em> }
              </strong>
              <p>{{ 'monitoring.stable' | translate }}</p>
            </article>
            <article>
              <span class="mini-icon visual"></span>
              <small>{{ 'monitoring.visualStatus' | translate }}</small>
              <strong>{{ visualStatusLabel }}</strong>
              <p></p>
            </article>
            <article>
              <span class="mini-icon occupancy"></span>
              <small>{{ 'monitoring.occupancy' | translate }}</small>
              <strong>{{ zone.animalCount }} / 20 {{ 'monitoring.animals' | translate }}</strong>
              <div class="progress"><i [style.width.%]="zone.animalCount * 5"></i></div>
            </article>
          </section>

          <!-- ── Submit new telemetry ───────────────────────────────────── -->
          @if (zone.targetId) {
            <section class="telemetry-form-section">
              <header class="form-section-header">
                <strong>📡 Enviar nueva lectura al backend</strong>
                <span class="form-hint">Los números de la tarjeta se actualizarán al guardar</span>
              </header>
              <div class="telemetry-inputs">
                <label>
                  🌡️ Temperatura (°C)
                  <input type="number" [(ngModel)]="formTemp" placeholder="ej: 25.5" step="0.1" />
                </label>
                <label>
                  💧 Humedad (%)
                  <input type="number" [(ngModel)]="formHumidity" placeholder="ej: 55" step="0.1" min="0" max="100" />
                </label>
                <label class="full-col">
                  🎥 Datos visuales (opcional)
                  <input type="text" [(ngModel)]="formVisualData" placeholder="ej: NORMAL o ANOMALY" />
                </label>
              </div>
              <div class="form-actions">
                <button
                  class="submit-btn"
                  (click)="submitTelemetry()"
                  [disabled]="formTemp === null || formHumidity === null || submitting">
                  {{ submitting ? '⏳ Enviando…' : '✅ Guardar en backend' }}
                </button>
                @if (submitSuccess) {
                  <span class="submit-feedback ok">✓ Guardado — números actualizados</span>
                }
                @if (submitError) {
                  <span class="submit-feedback err">✗ Error al conectar con el backend</span>
                }
              </div>
            </section>
          }

          <!-- ── Telemetry history ──────────────────────────────────────── -->
          <section class="telemetry-section">
            <header class="telemetry-header">
              <strong>Historial de Telemetría <small>(backend)</small></strong>
              <span class="telemetry-badge" [class.loading]="telemetryLoading" [class.error]="telemetryError">
                {{ telemetryLoading ? '⏳ Cargando…' : telemetryError ? '⚠️ Sin datos' : (telemetry.length + ' registros') }}
              </span>
            </header>

            @if (!telemetryLoading && !telemetryError && telemetry.length > 0) {
              <div class="telemetry-table-wrap">
                <table class="telemetry-table">
                  <thead>
                    <tr>
                      <th>Fecha/Hora</th>
                      <th>Temp (°C)</th>
                      <th>Humedad (%)</th>
                      <th>Anomalía visual</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (rec of telemetry.slice().reverse().slice(0, 10); track rec.id) {
                      <tr [class.anomaly]="rec.visualData?.toUpperCase()?.includes('ANOMALY')">
                        <td>{{ formatDate(rec.recordedAt) }}</td>
                        <td><strong>{{ rec.ambientTemperature | number:'1.1-1' }}</strong></td>
                        <td><strong>{{ rec.ambientHumidity | number:'1.1-1' }}</strong></td>
                        <td class="anomaly-cell">
                          {{ rec.visualData?.toUpperCase()?.includes('ANOMALY') ? '⚠️ Sí' : '✅ No' }}
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }

            @if (!telemetryLoading && !telemetryError && telemetry.length === 0) {
              <p class="telemetry-empty">Sin registros de telemetría. Usa el formulario de arriba para enviar el primer dato.</p>
            }
            @if (!telemetryLoading && telemetryError) {
              <p class="telemetry-empty">No se pudo conectar con el backend.</p>
            }
          </section>

          <footer class="modal-actions">
            <bp-button variant="secondary">{{ 'monitoring.alertHistory' | translate }}</bp-button>
            <bp-button>{{ 'monitoring.adjustClimate' | translate }}</bp-button>
          </footer>
        </div>
      }
    </bp-modal>
  `,
  styles: [`
    .zone-detail { display: grid; gap: 16px; padding: 18px; }
    .detail-heading { display: flex; justify-content: space-between; align-items: start; gap: 16px; margin: -18px -18px 0; padding: 18px; border-bottom: 1px solid var(--bp-border); }
    .detail-heading p { margin: 3px 0 0; color: var(--bp-slate-gray); }
    .detail-heading span { border-radius: 999px; background: #ffe7e7; color: var(--bp-critical); padding: 4px 8px; font-size: 11px; }
    .detail-heading span::before { content: ''; display: inline-block; width: 6px; height: 6px; margin-right: 4px; border-radius: 50%; background: currentColor; }
    .detail-heading span.offline { color: var(--bp-slate-gray); background: #edf1f4; }
    .camera-frame { position: relative; min-height: 268px; border-radius: 7px; overflow: hidden; background: linear-gradient(135deg, #d9edf9, #7fa8bd); }
    .camera-frame img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .camera-frame b { position: absolute; top: 14px; left: 14px; border-radius: 5px; padding: 6px 10px; background: rgba(11,31,47,.56); color: #fff; font-size: 12px; }
    .camera-actions { position: absolute; right: 12px; bottom: 12px; display: flex; gap: 8px; }
    .camera-actions span, .camera-actions i { width: 28px; height: 28px; border-radius: 50%; background: rgba(11,31,47,.58); position: relative; }
    .camera-actions span::before { content: ''; position: absolute; left: 9px; top: 8px; width: 8px; height: 10px; border-left: 3px solid #fff; border-right: 3px solid #fff; }
    .camera-actions i::before, .camera-actions i::after { content: ''; position: absolute; inset: 7px; border: 2px solid #fff; border-radius: 2px; }
    /* ── Metrics ────────────────────────────────────────────────────────── */
    .detail-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .detail-metrics article { min-height: 84px; padding: 14px; border: 1px solid var(--bp-border); border-radius: 7px; background: #f8fdff; }
    .detail-metrics small { display: inline-flex; margin-left: 6px; color: var(--bp-action-blue); font-size: 12px; font-weight: 800; }
    .detail-metrics strong { display: block; margin: 7px 0 3px; font-size: 20px; }
    .detail-metrics p { margin: 0; color: var(--bp-slate-gray); font-size: 12px; }
    .live-pill { font-style: normal; font-size: 10px; font-weight: 800; background: #0b7c00; color: #fff; border-radius: 4px; padding: 2px 5px; margin-left: 5px; vertical-align: middle; }
    .mini-icon { display: inline-block; width: 16px; height: 16px; vertical-align: -3px; position: relative; color: var(--bp-action-blue); }
    .mini-icon::before, .mini-icon::after { content: ''; position: absolute; box-sizing: border-box; }
    .temp::before { left: 6px; top: 1px; width: 4px; height: 11px; border: 2px solid currentColor; border-radius: 999px; }
    .temp::after { left: 4px; bottom: 1px; width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
    .humidity::before { inset: 2px 4px; border: 2px solid currentColor; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); }
    .visual::before { left: 4px; top: 2px; width: 8px; height: 8px; border: 2px solid currentColor; border-radius: 1px; }
    .visual::after { left: 2px; top: 11px; width: 12px; height: 2px; background: currentColor; }
    .occupancy::before { left: 2px; top: 3px; width: 5px; height: 5px; border-radius: 50%; background: currentColor; box-shadow: 7px 0 0 currentColor; }
    .occupancy::after { left: 0; top: 10px; width: 15px; height: 5px; border: 2px solid currentColor; border-top: 0; border-radius: 0 0 8px 8px; }
    .progress { height: 5px; margin-top: 8px; border-radius: 999px; background: #d2cbd7; overflow: hidden; }
    .progress i { display: block; height: 100%; border-radius: inherit; background: var(--bp-action-blue); }
    /* ── Telemetry form ─────────────────────────────────────────────────── */
    .telemetry-form-section { border: 2px solid var(--bp-action-blue); border-radius: 8px; padding: 16px; background: linear-gradient(135deg, #f0f8ff, #e8f4fb); }
    .form-section-header { margin-bottom: 12px; }
    .form-section-header strong { font-size: 13px; color: var(--bp-dark-navy); }
    .form-hint { display: block; font-size: 11px; color: var(--bp-slate-gray); margin-top: 2px; }
    .telemetry-inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .telemetry-inputs label { display: flex; flex-direction: column; gap: 5px; font-size: 12px; font-weight: 600; color: var(--bp-dark-navy); }
    .telemetry-inputs input { height: 36px; border: 1px solid var(--bp-border); border-radius: 7px; padding: 0 10px; font-size: 13px; background: #fff; transition: border .15s; }
    .telemetry-inputs input:focus { outline: none; border-color: var(--bp-action-blue); }
    .full-col { grid-column: 1 / -1; }
    .form-actions { display: flex; align-items: center; gap: 12px; margin-top: 12px; flex-wrap: wrap; }
    .submit-btn { height: 36px; padding: 0 18px; border: 0; border-radius: 999px; background: var(--bp-action-blue); color: #fff; font-weight: 800; font-size: 13px; cursor: pointer; transition: opacity .15s; }
    .submit-btn:disabled { opacity: .5; cursor: default; }
    .submit-feedback { font-size: 12px; font-weight: 700; }
    .submit-feedback.ok { color: #007a72; }
    .submit-feedback.err { color: var(--bp-critical); }
    /* ── Telemetry history table ─────────────────────────────────────────── */
    .telemetry-section { border: 1px solid var(--bp-border); border-radius: 7px; padding: 14px; background: #f8fdff; }
    .telemetry-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .telemetry-header strong { font-size: 13px; color: var(--bp-dark-navy); }
    .telemetry-header small { color: var(--bp-slate-gray); font-size: 11px; font-weight: 400; margin-left: 4px; }
    .telemetry-badge { font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 999px; background: #d8fbf4; color: #007a72; }
    .telemetry-badge.loading { background: #fffbea; color: #856404; }
    .telemetry-badge.error { background: #fff1f1; color: var(--bp-critical); }
    .telemetry-table-wrap { overflow-x: auto; }
    .telemetry-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .telemetry-table th { text-align: left; padding: 6px 8px; background: #edf3f7; color: var(--bp-slate-gray); font-weight: 700; border-bottom: 1px solid var(--bp-border); white-space: nowrap; }
    .telemetry-table td { padding: 6px 8px; border-bottom: 1px solid var(--bp-border); color: var(--bp-dark-navy); }
    .telemetry-table tr:last-child td { border-bottom: 0; }
    .telemetry-table tr.anomaly td { background: rgba(217,48,37,.04); }
    .anomaly-cell { font-weight: 600; }
    .telemetry-empty { margin: 0; color: var(--bp-slate-gray); font-size: 12px; text-align: center; padding: 12px 0; }
    .modal-actions { margin: 2px 0 -2px; }
    @media (max-width: 560px) {
      .detail-metrics, .telemetry-inputs { grid-template-columns: 1fr; }
      .camera-frame { min-height: 210px; }
      .full-col { grid-column: 1; }
    }
  `],
})
export class MonitoringZoneDetailModalComponent implements OnChanges {
  @Input() open = false;
  @Input() zone?: MonitoringZone;
  @Output() closed = new EventEmitter<void>();
  /** Emits when a new telemetry is posted so the parent page can update the zone card. */
  @Output() telemetryPosted = new EventEmitter<{ zoneId: string; temperatureC: number; humidity: number }>();

  telemetry: TelemetryRecord[] = [];
  telemetryLoading = false;
  telemetryError = false;

  // ── Form state ─────────────────────────────────────────────────────────
  formTemp: number | null = null;
  formHumidity: number | null = null;
  formVisualData = '';
  submitting = false;
  submitSuccess = false;
  submitError = false;

  constructor(
    private readonly getTelemetry: GetTelemetryByTargetUseCase,
    private readonly processTelemetry: ProcessTelemetryUseCase,
  ) {}

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    const openChanged = changes['open'];
    const zoneChanged = changes['zone'];

    if ((openChanged || zoneChanged) && this.open && this.zone) {
      this.resetForm();
      await this.loadTelemetry(this.zone.targetId ?? this.zone.id);
    }
    if (openChanged && !this.open) {
      this.telemetry = [];
      this.telemetryError = false;
    }
  }

  get latestTelemetry(): TelemetryRecord | undefined {
    return this.telemetry.length > 0 ? this.telemetry[this.telemetry.length - 1] : undefined;
  }

  /** Temperature shown in the metric card: latest backend value or zone mock. */
  get displayTemp(): number | null {
    return this.latestTelemetry?.ambientTemperature ?? this.zone?.temperatureC ?? null;
  }

  /** Humidity shown in the metric card: latest backend value or zone mock. */
  get displayHumidity(): number | null {
    return this.latestTelemetry?.ambientHumidity ?? this.zone?.humidity ?? null;
  }

  get visualStatusLabel(): string {
    if (this.telemetryLoading) return '…';
    const latest = this.latestTelemetry;
    if (!latest || !latest.visualData) return '— Sin datos';
    return latest.visualData.toUpperCase().includes('ANOMALY') ? '⚠️ Anomalía detectada' : '✅ En rango';
  }

  async submitTelemetry(): Promise<void> {
    if (this.formTemp === null || this.formHumidity === null || !this.zone?.targetId) return;
    this.submitting = true;
    this.submitSuccess = false;
    this.submitError = false;
    try {
      await this.processTelemetry.execute({
        targetId: this.zone.targetId,
        ambientTemperature: this.formTemp,
        ambientHumidity: this.formHumidity,
        visualData: this.formVisualData || undefined,
      });
      // Refresh history after posting
      await this.loadTelemetry(this.zone.targetId);
      this.submitSuccess = true;
      // Notify parent page so the zone card updates immediately
      this.telemetryPosted.emit({
        zoneId: this.zone.id,
        temperatureC: this.formTemp,
        humidity: this.formHumidity,
      });
      this.resetForm();
      setTimeout(() => (this.submitSuccess = false), 4000);
    } catch (err) {
      console.error('[MonitoringZoneDetail] submitTelemetry failed', err);
      this.submitError = true;
      setTimeout(() => (this.submitError = false), 4000);
    } finally {
      this.submitting = false;
    }
  }

  formatDate(isoString: string): string {
    try {
      return new Date(isoString).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
    } catch {
      return isoString;
    }
  }

  hideBrokenImage(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  private async loadTelemetry(targetId: string): Promise<void> {
    this.telemetryLoading = true;
    this.telemetryError = false;
    try {
      this.telemetry = await this.getTelemetry.execute(targetId);
    } catch (err) {
      console.warn('[MonitoringZoneDetail] Could not load telemetry from backend', err);
      this.telemetryError = true;
      this.telemetry = [];
    } finally {
      this.telemetryLoading = false;
    }
  }

  private resetForm(): void {
    this.formTemp = null;
    this.formHumidity = null;
    this.formVisualData = '';
    this.submitSuccess = false;
    this.submitError = false;
  }
}
