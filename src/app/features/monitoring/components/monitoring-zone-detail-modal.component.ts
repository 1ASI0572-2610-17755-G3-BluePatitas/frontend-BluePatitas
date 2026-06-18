import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, Inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Animal, MonitoringZone } from '../../../core/domain/models/bluepatitas.models';
import { TelemetryRecord, PerimeterAlert } from '../../../core/domain/models/monitoring-api.models';
import { GetTelemetryByTargetUseCase, ProcessTelemetryUseCase } from '../../../core/application/use-cases/monitoring.use-cases';
import { UpdateMonitoringZoneUseCase, DeleteMonitoringZoneUseCase } from '../../../core/application/use-cases/bluepatitas.use-cases';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../../shared/components/bp-button/bp-button.component';
import { BpModalComponent } from '../../../shared/components/bp-modal/bp-modal.component';
import { ANIMAL_REPOSITORY, AnimalRepository } from '../../../core/domain/repositories/repository.tokens';

declare const L: any;

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

          @if (isEditing) {
            <!-- ── Edit View ────────────────────────────────────────────── -->
            <section class="edit-zone-form">
              <div class="telemetry-inputs">
                <label class="full-col">
                  Nombre de la zona
                  <input type="text" [(ngModel)]="editName" placeholder="Nombre" />
                </label>
                <label>
                  Temp mínima límite (°C)
                  <input type="number" [(ngModel)]="editMinTemp" placeholder="ej: 18" />
                </label>
                <label>
                  Temp máxima límite (°C)
                  <input type="number" [(ngModel)]="editMaxTemp" placeholder="ej: 28" />
                </label>
              </div>

              <strong class="section-label" style="margin-top: 14px; display: inline-flex; align-items: center; gap: 4px; color: var(--bp-dark-navy); font-size: 12px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>
                Ajustar Geocerca
              </strong>
              <p class="form-hint" style="font-size: 11px; color: var(--bp-slate-gray); margin-top: 2px;">
                Haz clic en el mapa o arrastra el marcador verde para cambiar las coordenadas de la geocerca.
              </p>
              
              <div class="map-container" style="margin-top: 8px;">
                <div id="detail-map"></div>
              </div>

              <div class="telemetry-inputs" style="margin-top: 10px;">
                <label>
                  Latitud Centro
                  <input type="number" [(ngModel)]="editLatitude" (ngModelChange)="updateEditMap()" step="0.000001" />
                </label>
                <label>
                  Longitud Centro
                  <input type="number" [(ngModel)]="editLongitude" (ngModelChange)="updateEditMap()" step="0.000001" />
                </label>
                <label class="full-col">
                  Radio de Geocerca (metros)
                  <input type="number" [(ngModel)]="editRadius" (ngModelChange)="updateEditMap()" />
                </label>
              </div>

              <div class="form-actions" style="margin-top: 16px;">
                <button class="submit-btn" (click)="saveEdit()" [disabled]="submitting" style="display: inline-flex; align-items: center; gap: 6px; justify-content: center;">
                  @if (submitting) {
                    <svg class="spin-anim" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> Guardando…
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg> Guardar cambios
                  }
                </button>
                <button class="submit-btn" style="background-color: var(--bp-slate-gray);" (click)="cancelEdit()">Cancelar</button>
              </div>
            </section>
          } @else {
            <!-- ── Normal View ──────────────────────────────────────────── -->
            <section class="camera-frame">
              @if (useWebcam) {
                <video id="webcam-video" autoplay playsinline style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;"></video>
              } @else if (zone.imageUrl) {
                <img [src]="zone.imageUrl" [alt]="zone.name" (error)="hideBrokenImage($event)" />
              }
              <b>CAM-01</b>
              <div class="camera-actions" style="z-index: 10;">
                <button type="button" (click)="toggleWebcam()" [title]="'Usar cámara local'" style="width: 28px; height: 28px; border-radius: 50%; background: rgba(11,31,47,.72); border: 0; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; padding: 0; outline: none; margin: 0;">
                  @if (useWebcam) {
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                  }
                </button>
                <i></i>
              </div>
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
                <span class="mini-icon gps-icon"></span>
                <small style="display: inline-flex; align-items: center; gap: 4px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--bp-action-blue);"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  Ubicación GPS
                </small>
                <strong style="font-size: 12px; margin: 11px 0 7px; word-break: break-all; display: block; line-height: 1.4;">
                  @if (latestGpsTelemetry?.latitude && latestGpsTelemetry?.longitude) {
                    Lat: {{ latestGpsTelemetry?.latitude | number:'1.5-5' }}<br>Lng: {{ latestGpsTelemetry?.longitude | number:'1.5-5' }}
                  } @else if (zone?.geofenceLatitude && zone?.geofenceLongitude) {
                    Lat: {{ zone.geofenceLatitude | number:'1.5-5' }}<br>Lng: {{ zone.geofenceLongitude | number:'1.5-5' }}
                  } @else {
                    -- Sin coordenadas
                  }
                  @if (latestTelemetry) { <em class="live-pill" style="margin-top: 4px; display: inline-block;">API</em> }
                </strong>
                <p>Último reporte GPS recibido</p>
              </article>
              <article>
                <span class="mini-icon visual"></span>
                <small>{{ 'monitoring.visualStatus' | translate }}</small>
                <strong style="display: inline-flex; align-items: center; gap: 4px; font-size: 15px;">
                  @if (latestTelemetry && latestTelemetry.visualData) {
                    @if (latestTelemetry.visualData.toUpperCase().includes('ANOMALY')) {
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--bp-critical);"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    } @else {
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #007a72;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    }
                  }
                  {{ visualStatusLabel }}
                </strong>
                <p></p>
              </article>
              <article>
                <span class="mini-icon occupancy"></span>
                <small>{{ 'monitoring.occupancy' | translate }}</small>
                <strong>{{ zone.animalCount }} / 20 {{ 'monitoring.animals' | translate }}</strong>
                <div class="progress"><i [style.width.%]="zone.animalCount * 5"></i></div>
              </article>
            </section>

            <!-- ── Geofence & Location Map ──────────────────────────────── -->
            <section class="geofence-map-section" style="border: 1px solid var(--bp-border); border-radius: 7px; padding: 14px; background: #f8fdff;">
              <strong style="font-size: 13px; color: var(--bp-dark-navy); display: inline-flex; align-items: center; gap: 4px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>
                Mapa de Geocerca y Ubicación GPS
              </strong>
              <div class="map-container" style="margin-top: 8px;">
                <div id="detail-map"></div>
              </div>
            </section>

            <!-- ── Submit new telemetry ───────────────────────────────────── -->
            @if (zone.targetId) {
              <section class="telemetry-form-section">
                <header class="form-section-header">
                  <strong style="display: inline-flex; align-items: center; gap: 4px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M12 2a10 10 0 0 1 10 10M12 6a6 6 0 0 1 6 6M12 10a2 2 0 0 1 2 2"></path><circle cx="12" cy="12" r="1"></circle></svg>
                    Enviar nueva lectura al backend
                  </strong>
                  <span class="form-hint">Los números de la tarjeta se actualizarán al guardar</span>
                </header>
                <div class="telemetry-inputs">
                  <label>
                    <span style="display: inline-flex; align-items: center; gap: 4px;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path></svg>
                      Temperatura (°C)
                    </span>
                    <input type="number" [(ngModel)]="formTemp" placeholder="ej: 25.5" step="0.1" />
                  </label>
                  <label>
                    <span style="display: inline-flex; align-items: center; gap: 4px;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>
                      Humedad (%)
                    </span>
                    <input type="number" [(ngModel)]="formHumidity" placeholder="ej: 55" step="0.1" min="0" max="100" />
                  </label>
                  <label class="full-col">
                    <span style="display: inline-flex; align-items: center; gap: 4px;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                      Datos visuales (opcional)
                    </span>
                    <input type="text" [(ngModel)]="formVisualData" placeholder="ej: NORMAL o ANOMALY" />
                  </label>
                </div>
                <div class="form-actions">
                  <button
                    class="submit-btn"
                    (click)="submitTelemetry()"
                    [disabled]="formTemp === null || formHumidity === null || submitting"
                    style="display: inline-flex; align-items: center; gap: 6px; justify-content: center;">
                    @if (submitting) {
                      <svg class="spin-anim" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> Enviando…
                    } @else {
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg> Guardar en backend
                    }
                  </button>
                  @if (submitSuccess) {
                    <span class="submit-feedback ok" style="display: inline-flex; align-items: center; gap: 4px;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #007a72;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      Guardado — números actualizados
                    </span>
                  }
                  @if (submitError) {
                    <span class="submit-feedback err" style="display: inline-flex; align-items: center; gap: 4px;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--bp-critical);"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      Error al conectar con el backend
                    </span>
                  }
                </div>
              </section>
            }

            <!-- ── Alert history section ─────────────────────────────────── -->
            @if (showAlerts) {
              <section class="alerts-history-section" style="border: 1px solid var(--bp-border); border-radius: 7px; padding: 14px; background: #fff8f8; margin-top: 4px;">
                <strong style="font-size: 13px; color: var(--bp-dark-navy); display: inline-flex; align-items: center; gap: 4px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  Historial de Alertas de Perímetro
                </strong>
                <div class="alerts-list" style="display: grid; gap: 8px; margin-top: 10px; max-height: 200px; overflow-y: auto;">
                  @if (zoneAlerts.length === 0) {
                    <p class="telemetry-empty">No hay alertas de perímetro registradas para esta zona.</p>
                  } @else {
                    @for (alert of zoneAlerts; track alert.id) {
                      <div style="border-left: 3px solid var(--bp-critical); background: #fff; padding: 8px 12px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); font-size: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                          <strong>Brecha de Perímetro</strong>
                          <span style="font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 999px; background: #ffe0e0; color: #a10000;">
                            {{ alert.isBreachConfirmed ? 'Confirmada' : 'Resuelta' }}
                          </span>
                        </div>
                        @if (alert.currentCoordinates) {
                          <p style="margin: 4px 0 0; font-size: 11px; color: var(--bp-slate-gray); display: inline-flex; align-items: center; gap: 4px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            Coordenadas: {{ alert.currentCoordinates.latitude | number:'1.5-5' }}, {{ alert.currentCoordinates.longitude | number:'1.5-5' }}
                          </p>
                        }
                        <small style="color: var(--bp-slate-gray); font-size: 10px; display: inline-flex; align-items: center; gap: 4px; margin-top: 4px;">
                          @if (alert.trackingActive) {
                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 0 1 10 10M12 6a6 6 0 0 1 6 6M12 10a2 2 0 0 1 2 2"></path><circle cx="12" cy="12" r="1"></circle></svg> Tracking Activo
                          } @else {
                            Sin seguimiento
                          }
                        </small>
                      </div>
                    }
                  }
                </div>
              </section>
            }

            <!-- ── Telemetry history ──────────────────────────────────────── -->
            <section class="telemetry-section">
              <header class="telemetry-header">
                <strong>Historial de Telemetría <small>(backend)</small></strong>
                <span class="telemetry-badge" [class.loading]="telemetryLoading" [class.error]="telemetryError" style="display: inline-flex; align-items: center; gap: 4px;">
                  @if (telemetryLoading) {
                    <svg class="spin-anim" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> Cargando…
                  } @else if (telemetryError) {
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> Sin datos
                  } @else {
                    {{ telemetry.length }} registros
                  }
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
                        <th>Latitud</th>
                        <th>Longitud</th>
                        <th>Anomalía visual</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (rec of telemetry.slice().reverse().slice(0, 10); track rec.id) {
                        <tr [class.anomaly]="rec.visualData?.toUpperCase()?.includes('ANOMALY')">
                          <td>{{ formatDate(rec.recordedAt) }}</td>
                          <td><strong>{{ rec.ambientTemperature !== null ? (rec.ambientTemperature | number:'1.1-1') : '--' }}</strong></td>
                          <td><strong>{{ rec.ambientHumidity !== null ? (rec.ambientHumidity | number:'1.1-1') : '--' }}</strong></td>
                          <td>{{ rec.latitude ? (rec.latitude | number:'1.5-5') : '--' }}</td>
                          <td>{{ rec.longitude ? (rec.longitude | number:'1.5-5') : '--' }}</td>
                          <td class="anomaly-cell">
                            @if (rec.visualData?.toUpperCase()?.includes('ANOMALY')) {
                              <span style="display: inline-flex; align-items: center; gap: 4px; color: var(--bp-critical);">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> Sí
                              </span>
                            } @else {
                              <span style="display: inline-flex; align-items: center; gap: 4px; color: #007a72;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> No
                              </span>
                            }
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
          }

          <footer class="modal-actions" style="display: flex; gap: 8px; flex-wrap: wrap;">
            @if (!isEditing) {
              <bp-button variant="secondary" (clicked)="showAlerts = !showAlerts">
                {{ showAlerts ? 'Ocultar alertas' : ('monitoring.alertHistory' | translate) }}
              </bp-button>
              <bp-button (clicked)="startEdit()">Editar zona</bp-button>
              <bp-button variant="secondary" style="color: var(--bp-critical); border-color: var(--bp-critical);" (clicked)="deleteZone()">Eliminar zona</bp-button>
            }
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
    .gps-icon::before { left: 4px; top: 2px; width: 8px; height: 8px; border: 2px solid var(--bp-critical); border-radius: 50% 50% 50% 0; transform: rotate(-45deg); }
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
    .map-container { position: relative; width: 100%; height: 250px; }
    #detail-map { width: 100%; height: 100%; border-radius: 8px; border: 1px solid var(--bp-border); }
    @media (max-width: 560px) {
      .detail-metrics, .telemetry-inputs { grid-template-columns: 1fr; }
      .camera-frame { min-height: 210px; }
      .full-col { grid-column: 1; }
    }
    .spin-anim { animation: bp-spin 1.2s linear infinite; display: inline-block; }
    @keyframes bp-spin { to { transform: rotate(360deg); } }
  `],
})
export class MonitoringZoneDetailModalComponent implements OnChanges, OnDestroy {
  @Input() open = false;
  @Input() zone?: MonitoringZone;
  @Input() allPerimeterAlerts: PerimeterAlert[] = [];
  @Output() closed = new EventEmitter<void>();
  /** Emits when a new telemetry is posted so the parent page can update the zone card. */
  @Output() telemetryPosted = new EventEmitter<{ zoneId: string; temperatureC: number; humidity: number }>();
  @Output() zoneUpdated = new EventEmitter<MonitoringZone>();
  @Output() zoneDeleted = new EventEmitter<string>();

  telemetry: TelemetryRecord[] = [];
  telemetryLoading = false;
  telemetryError = false;
  pollTimer: any = null;
  fastTimer: any = null;
  zoneAnimals: Animal[] = [];
  animalMarkers: { animalId: string; marker: any }[] = [];

  // ── Form state ─────────────────────────────────────────────────────────
  formTemp: number | null = null;
  formHumidity: number | null = null;
  formVisualData = '';
  submitting = false;
  submitSuccess = false;
  submitError = false;

  // ── Edit state ─────────────────────────────────────────────────────────
  isEditing = false;
  editName = '';
  editMinTemp: number | null = null;
  editMaxTemp: number | null = null;
  editLatitude = -12.046374;
  editLongitude = -77.042793;
  editRadius = 100;

  // ── Alert view state ───────────────────────────────────────────────────
  showAlerts = false;

  // ── Edge Simulator state ───────────────────────────────────────────────
  edgeLat: number | null = null;
  edgeLng: number | null = null;

  // ── Leaflet state ──────────────────────────────────────────────────────
  map: any;
  marker: any;
  circle: any;

  // ── Webcam state ───────────────────────────────────────────────────────
  useWebcam = false;
  webcamStream: MediaStream | null = null;

  constructor(
    private readonly getTelemetry: GetTelemetryByTargetUseCase,
    private readonly processTelemetry: ProcessTelemetryUseCase,
    private readonly updateZoneUseCase: UpdateMonitoringZoneUseCase,
    private readonly deleteZoneUseCase: DeleteMonitoringZoneUseCase,
    @Inject(ANIMAL_REPOSITORY) private readonly animalRepo: AnimalRepository,
  ) {}

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    const openChanged = changes['open'];
    const zoneChanged = changes['zone'];

    if ((openChanged || zoneChanged) && this.open && this.zone) {
      this.resetForm();
      this.isEditing = false;
      this.showAlerts = false;
      await this.loadTelemetry(this.zone.targetId ?? this.zone.id);
      await this.loadZoneAnimals();
      this.initMapDeferred();
      this.startPolling();
    }
    if (openChanged && !this.open) {
      this.stopPolling();
      this.stopWebcam();
      this.telemetry = [];
      this.telemetryError = false;
      this.clearAnimalMarkers();
      if (this.map) {
        this.map.remove();
        this.map = null;
      }
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
    this.stopWebcam();
  }

  async toggleWebcam() {
    this.useWebcam = !this.useWebcam;
    if (this.useWebcam) {
      try {
        this.webcamStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setTimeout(() => {
          const videoEl = document.getElementById('webcam-video') as HTMLVideoElement;
          if (videoEl && this.webcamStream) {
            videoEl.srcObject = this.webcamStream;
          }
        }, 100);
      } catch (err) {
        console.error('Error accessing webcam', err);
        alert('No se pudo acceder a la cámara del dispositivo.');
        this.useWebcam = false;
      }
    } else {
      this.stopWebcam();
    }
  }

  stopWebcam() {
    if (this.webcamStream) {
      this.webcamStream.getTracks().forEach(track => track.stop());
      this.webcamStream = null;
    }
    this.useWebcam = false;
  }

  async loadZoneAnimals(): Promise<void> {
    if (!this.zone) return;
    try {
      const all = await this.animalRepo.getAnimals();
      this.zoneAnimals = all.filter((a) => a.zoneId === this.zone!.id);
    } catch (err) {
      console.warn('Could not load animals for zone', err);
      this.zoneAnimals = [];
    }
  }

  clearAnimalMarkers() {
    if (this.map) {
      for (const item of this.animalMarkers) {
        item.marker.remove();
      }
    }
    this.animalMarkers = [];
  }

  startPolling(): void {
    this.stopPolling();
    this.pollTimer = setInterval(async () => {
      if (this.open && this.zone && !this.isEditing) {
        await this.loadTelemetry(this.zone.targetId ?? this.zone.id);
        this.updateLiveMarker();
      }
    }, 5000);
    this.fastTimer = setInterval(async () => {
      if (this.open && this.zone && !this.isEditing) {
        await this.pollEdgeState();
        this.syncAnimalMarkers();
      }
    }, 1000);
  }

  async pollEdgeState() {
    try {
      const response = await fetch('http://localhost:18090/api/simulador/estado');
      if (response.ok) {
        const data = await response.json();
        this.edgeLat = data.latitude;
        this.edgeLng = data.longitude;
      }
    } catch (err) {
      console.warn('Failed to poll Edge state from detail modal', err);
    }
  }

  stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.fastTimer) {
      clearInterval(this.fastTimer);
      this.fastTimer = null;
    }
  }

  updateLiveMarker(): void {
    if (this.map && this.marker && !this.isEditing) {
      const centerLat = this.zone?.geofenceLatitude || -11.854374;
      const centerLng = this.zone?.geofenceLongitude || -76.850793;
      
      if (typeof L !== 'undefined') {
        const newLatLng = L.latLng(centerLat, centerLng);
        this.marker.setLatLng(newLatLng);
        this.marker.getPopup().setContent(`<b>Zona: ${this.zone?.name || 'Mascota'} (Estática)</b><br>Lat: ${centerLat.toFixed(6)}<br>Lng: ${centerLng.toFixed(6)}`);
      }
      this.syncAnimalMarkers();
    }
  }

  get latestTelemetry(): TelemetryRecord | undefined {
    return this.telemetry.length > 0 ? this.telemetry[this.telemetry.length - 1] : undefined;
  }

  get latestTempTelemetry(): TelemetryRecord | undefined {
    for (let i = this.telemetry.length - 1; i >= 0; i--) {
      const t = this.telemetry[i];
      if (t.ambientTemperature !== null && t.ambientTemperature !== undefined) {
        return t;
      }
    }
    return undefined;
  }

  get latestHumidityTelemetry(): TelemetryRecord | undefined {
    for (let i = this.telemetry.length - 1; i >= 0; i--) {
      const t = this.telemetry[i];
      if (t.ambientHumidity !== null && t.ambientHumidity !== undefined) {
        return t;
      }
    }
    return undefined;
  }

  get latestGpsTelemetry(): TelemetryRecord | undefined {
    for (let i = this.telemetry.length - 1; i >= 0; i--) {
      const t = this.telemetry[i];
      if (t.latitude !== null && t.latitude !== undefined && t.longitude !== null && t.longitude !== undefined) {
        return t;
      }
    }
    return undefined;
  }

  /** Temperature shown in the metric card: latest backend value or zone mock. */
  get displayTemp(): number | null {
    return this.latestTempTelemetry?.ambientTemperature ?? this.zone?.temperatureC ?? null;
  }

  /** Humidity shown in the metric card: latest backend value or zone mock. */
  get displayHumidity(): number | null {
    return this.latestHumidityTelemetry?.ambientHumidity ?? this.zone?.humidity ?? null;
  }

  get visualStatusLabel(): string {
    if (this.telemetryLoading) return 'Cargando…';
    const latest = this.latestTelemetry;
    if (!latest || !latest.visualData) return 'Sin datos';
    return latest.visualData.toUpperCase().includes('ANOMALY') ? 'Anomalía detectada' : 'En rango';
  }

  get zoneAlerts(): PerimeterAlert[] {
    return this.allPerimeterAlerts.filter((a) => a.targetId === this.zone?.targetId);
  }

  // ── Map Methods ────────────────────────────────────────────────────────
  initMapDeferred() {
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  initMap() {
    try {
      if (typeof L === 'undefined') return;

      const mapEl = document.getElementById('detail-map');
      if (!mapEl) return;

      if (this.map) {
        this.map.remove();
        this.map = null;
      }

      if (this.isEditing) {
        const lat = this.editLatitude;
        const lng = this.editLongitude;
        const rad = this.editRadius;

        this.map = L.map('detail-map').setView([lat, lng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(this.map);

        this.circle = L.circle([lat, lng], {
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.15,
          radius: rad
        }).addTo(this.map);

        this.marker = L.marker([lat, lng], { draggable: true }).addTo(this.map)
          .bindPopup('<b>Geocerca (Centro Arrastrable)</b>').openPopup();

        this.map.on('click', (e: any) => {
          this.editLatitude = e.latlng.lat;
          this.editLongitude = e.latlng.lng;
          this.updateEditMapElements();
        });

        this.marker.on('dragend', (e: any) => {
          const pos = this.marker.getLatLng();
          this.editLatitude = pos.lat;
          this.editLongitude = pos.lng;
          this.updateEditMapElements();
        });
      } else {
        const centerLat = this.zone?.geofenceLatitude || -11.854374;
        const centerLng = this.zone?.geofenceLongitude || -76.850793;
        const radius = this.zone?.geofenceRadiusMeters || 100;

        this.map = L.map('detail-map').setView([centerLat, centerLng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(this.map);

        this.circle = L.circle([centerLat, centerLng], {
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.1,
          radius: radius
        }).addTo(this.map);

        this.marker = L.marker([centerLat, centerLng]).addTo(this.map)
          .bindPopup(`<b>Zona: ${this.zone?.name || 'Mascota'} (Estática)</b><br>Lat: ${centerLat.toFixed(6)}<br>Lng: ${centerLng.toFixed(6)}`);

        this.syncAnimalMarkers();
      }
    } catch (err) {
      console.warn('Map initialization failed', err);
    }
  }

  syncAnimalMarkers() {
    if (!this.map || this.isEditing) return;

    const redIcon = typeof L !== 'undefined' ? new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    }) : null;

    for (const animal of this.zoneAnimals) {
      const isAssigned = localStorage.getItem('gps_assigned_' + animal.id) === 'true';
      const existing = this.animalMarkers.find((item) => item.animalId === animal.id);

      if (isAssigned) {
        const lat = this.edgeLat ?? this.zone?.geofenceLatitude ?? -12.046374;
        const lng = this.edgeLng ?? this.zone?.geofenceLongitude ?? -77.042793;

        if (existing) {
          existing.marker.setLatLng([lat, lng]);
          existing.marker.getPopup().setContent(`<b>Nombre del Animal: ${animal.name}</b><br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}`);
        } else {
          if (typeof L !== 'undefined') {
            const marker = L.marker([lat, lng], { icon: redIcon }).addTo(this.map)
              .bindPopup(`<b>Nombre del Animal: ${animal.name}</b><br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}`);
            this.animalMarkers.push({ animalId: animal.id, marker });
          }
        }
      } else {
        if (existing) {
          existing.marker.remove();
          this.animalMarkers = this.animalMarkers.filter((item) => item.animalId !== animal.id);
        }
      }
    }

    for (const item of [...this.animalMarkers]) {
      const inZone = this.zoneAnimals.some((a) => a.id === item.animalId);
      if (!inZone) {
        item.marker.remove();
        this.animalMarkers = this.animalMarkers.filter((m) => m.animalId !== item.animalId);
      }
    }
  }

  updateEditMap() {
    this.updateEditMapElements();
  }

  updateEditMapElements() {
    if (this.marker) {
      this.marker.setLatLng([this.editLatitude, this.editLongitude]);
    }
    if (this.circle) {
      this.circle.setLatLng([this.editLatitude, this.editLongitude]);
      this.circle.setRadius(this.editRadius || 1);
    }
    if (this.map) {
      this.map.setView([this.editLatitude, this.editLongitude]);
    }
  }

  // ── Actions Methods ────────────────────────────────────────────────────
  startEdit() {
    this.isEditing = true;
    this.editName = this.zone?.name || '';
    this.editMinTemp = this.zone?.minTemperatureC ?? null;
    this.editMaxTemp = this.zone?.maxTemperatureC ?? null;
    this.editLatitude = this.zone?.geofenceLatitude || -12.046374;
    this.editLongitude = this.zone?.geofenceLongitude || -77.042793;
    this.editRadius = this.zone?.geofenceRadiusMeters || 100;
    this.initMapDeferred();
  }

  cancelEdit() {
    this.isEditing = false;
    this.initMapDeferred();
  }

  async saveEdit() {
    if (!this.zone) return;
    this.submitting = true;
    try {
      const updated = await this.updateZoneUseCase.execute(this.zone.id, {
        name: this.editName,
        targetId: this.zone.targetId,
        temperatureC: this.zone.temperatureC,
        humidity: this.zone.humidity,
        status: this.zone.status,
        animalCount: this.zone.animalCount,
        cameraEnabled: this.zone.cameraEnabled,
        imageUrl: this.zone.imageUrl,
        minTemperatureC: this.editMinTemp,
        maxTemperatureC: this.editMaxTemp,
        geofenceLatitude: this.editLatitude,
        geofenceLongitude: this.editLongitude,
        geofenceRadiusMeters: this.editRadius,
      });

      this.zoneUpdated.emit(updated);
      this.zone = updated;
      this.isEditing = false;
      this.initMapDeferred();
    } catch (err) {
      console.error('Failed to update zone', err);
    } finally {
      this.submitting = false;
    }
  }

  async deleteZone() {
    if (!this.zone) return;
    if (confirm(`¿Estás seguro de que deseas eliminar la zona "${this.zone.name}"?`)) {
      this.submitting = true;
      try {
        await this.deleteZoneUseCase.execute(this.zone.id);
        this.zoneDeleted.emit(this.zone.id);
        this.closed.emit();
      } catch (err) {
        console.error('Failed to delete zone', err);
      } finally {
        this.submitting = false;
      }
    }
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
        // Mock current latitude & longitude slightly offset from geofence center for manual test
        latitude: (this.zone.geofenceLatitude || -12.046374) + 0.0001,
        longitude: (this.zone.geofenceLongitude || -77.042793) + 0.0001,
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
      this.initMapDeferred();
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
