import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MonitoringZone } from '../../../core/domain/models/bluepatitas.models';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../../shared/components/bp-button/bp-button.component';
import { BpModalComponent } from '../../../shared/components/bp-modal/bp-modal.component';

@Component({
  selector: 'bp-monitoring-zone-detail-modal',
  standalone: true,
  imports: [TranslatePipe, BpButtonComponent, BpModalComponent],
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

          <section class="detail-metrics">
            <article>
              <span class="mini-icon temp"></span>
              <small>{{ 'monitoring.temperature' | translate }}</small>
              <strong>{{ zone.temperatureC ?? '--' }}°C</strong>
              <p>{{ 'monitoring.temperatureHint' | translate }}</p>
            </article>
            <article>
              <span class="mini-icon humidity"></span>
              <small>{{ 'monitoring.humidity' | translate }}</small>
              <strong>{{ zone.humidity ?? '--' }}%</strong>
              <p>{{ 'monitoring.stable' | translate }}</p>
            </article>
            <article>
              <span class="mini-icon visual"></span>
              <small>{{ 'monitoring.visualStatus' | translate }}</small>
              <strong>{{ 'monitoring.inRange' | translate }}</strong>
              <p></p>
            </article>
            <article>
              <span class="mini-icon occupancy"></span>
              <small>{{ 'monitoring.occupancy' | translate }}</small>
              <strong>{{ zone.animalCount }} / 20 {{ 'monitoring.animals' | translate }}</strong>
              <div class="progress"><i [style.width.%]="zone.animalCount * 5"></i></div>
            </article>
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
    .detail-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .detail-metrics article { min-height: 84px; padding: 14px; border: 1px solid var(--bp-border); border-radius: 7px; background: #f8fdff; }
    .detail-metrics small { display: inline-flex; margin-left: 6px; color: var(--bp-action-blue); font-size: 12px; font-weight: 800; }
    .detail-metrics strong { display: block; margin: 7px 0 3px; font-size: 20px; }
    .detail-metrics p { margin: 0; color: var(--bp-slate-gray); font-size: 12px; }
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
    .modal-actions { margin: 2px 0 -2px; }
    @media (max-width: 560px) {
      .detail-metrics { grid-template-columns: 1fr; }
      .camera-frame { min-height: 210px; }
    }
  `],
})
export class MonitoringZoneDetailModalComponent {
  @Input() open = false;
  @Input() zone?: MonitoringZone;
  @Output() closed = new EventEmitter<void>();

  hideBrokenImage(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
