import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../../shared/components/bp-button/bp-button.component';
import { BpModalComponent } from '../../../shared/components/bp-modal/bp-modal.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { MonitoringZone } from '../../../core/domain/models/bluepatitas.models';

declare const L: any;

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

        <strong class="section-label">Geocerca (Perímetro de seguridad)</strong>
        <div class="map-container">
          <div id="modal-map"></div>
        </div>
        <div class="three-cols">
          <bp-form-field label="Latitud" placeholder="-12.0463" [(value)]="latitudeStr" (valueChange)="onCoordsInputChange()" />
          <bp-form-field label="Longitud" placeholder="-77.0427" [(value)]="longitudeStr" (valueChange)="onCoordsInputChange()" />
          <bp-form-field label="Radio (metros)" placeholder="100" [(value)]="radiusStr" (valueChange)="onRadiusInputChange()" />
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
    .three-cols { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; min-width: 0; }
    .section-label { color: var(--bp-dark-navy); font-size: 12px; }
    .modal-actions { margin-top: 8px; }
    .map-container { position: relative; width: 100%; height: 180px; }
    #modal-map { width: 100%; height: 100%; border-radius: 8px; border: 1px solid var(--bp-border); }
    @media (max-width: 560px) { 
      .two-cols { grid-template-columns: 1fr; }
      .three-cols { grid-template-columns: 1fr; }
    }
  `],
})
export class AddMonitoringZoneModalComponent implements OnChanges {
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Omit<MonitoringZone, 'id'>>();

  name = '';
  pavilion = '';
  capacity = '';
  minTemperature = '';
  maxTemperature = '';

  latitudeStr = '-12.103638802091739';
  longitudeStr = '-76.96249460429247';
  radiusStr = '100';

  map: any;
  marker: any;
  circle: any;

  get latitude(): number {
    return parseFloat(this.latitudeStr) || -12.103638802091739;
  }
  set latitude(v: number) {
    this.latitudeStr = v.toFixed(6);
  }

  get longitude(): number {
    return parseFloat(this.longitudeStr) || -76.96249460429247;
  }
  set longitude(v: number) {
    this.longitudeStr = v.toFixed(6);
  }

  get radius(): number {
    return parseFloat(this.radiusStr) || 100;
  }
  set radius(v: number) {
    this.radiusStr = v.toString();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue) {
      this.initMapDeferred();
    }
  }

  initMapDeferred() {
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  initMap() {
    try {
      if (typeof L === 'undefined') return;

      const mapEl = document.getElementById('modal-map');
      if (!mapEl) return;

      if (this.map) {
        this.map.remove();
        this.map = null;
      }

      this.map = L.map('modal-map').setView([this.latitude, this.longitude], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(this.map);

      this.marker = L.marker([this.latitude, this.longitude], { draggable: true }).addTo(this.map);
      this.circle = L.circle([this.latitude, this.longitude], {
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.15,
        radius: this.radius
      }).addTo(this.map);

      this.map.on('click', (e: any) => {
        this.latitude = e.latlng.lat;
        this.longitude = e.latlng.lng;
        this.updateMapElements();
      });

      this.marker.on('dragend', (e: any) => {
        const pos = this.marker.getLatLng();
        this.latitude = pos.lat;
        this.longitude = pos.lng;
        this.updateMapElements();
      });
    } catch (err) {
      console.warn('Map initialization failed', err);
    }
  }

  updateMapElements() {
    if (this.marker) {
      this.marker.setLatLng([this.latitude, this.longitude]);
    }
    if (this.circle) {
      this.circle.setLatLng([this.latitude, this.longitude]);
      this.circle.setRadius(this.radius);
    }
    if (this.map) {
      this.map.setView([this.latitude, this.longitude]);
    }
  }

  onCoordsInputChange() {
    this.updateMapElements();
  }

  onRadiusInputChange() {
    this.updateMapElements();
  }

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
      geofenceLatitude: this.latitude,
      geofenceLongitude: this.longitude,
      geofenceRadiusMeters: this.radius,
    });

    this.name = '';
    this.pavilion = '';
    this.capacity = '';
    this.minTemperature = '';
    this.maxTemperature = '';
    this.latitudeStr = '-12.103638802091739';
    this.longitudeStr = '-76.96249460429247';
    this.radiusStr = '100';
    this.closed.emit();
  }
}
