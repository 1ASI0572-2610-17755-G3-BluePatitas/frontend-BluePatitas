import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PerimeterAlert, TelemetryRecord, TelemetryRequest } from '../../domain/models/monitoring-api.models';
import { MonitoringRepository } from '../../domain/repositories/monitoring-repository.token';
import { environment } from '../../../../environments/environment';

/**
 * HttpMonitoringRepository
 *
 * Concrete implementation of MonitoringRepository that communicates with the
 * Spring Boot backend at /api/monitoring/*.
 *
 * Base URL is read from environment.apiBaseUrl (default: http://localhost:8080).
 */
@Injectable()
export class HttpMonitoringRepository implements MonitoringRepository {

  private readonly alertsUrl: string;
  private readonly telemetryUrl: string;

  constructor(private readonly http: HttpClient) {
    const base = environment.apiBaseUrl.replace(/\/$/, '');
    this.alertsUrl = `${base}/api/monitoring/alerts`;
    this.telemetryUrl = `${base}/api/monitoring/telemetry`;
  }

  // ── Alerts ──────────────────────────────────────────────────────────────────

  /** GET /api/monitoring/alerts */
  getPerimeterAlerts(): Promise<PerimeterAlert[]> {
    return firstValueFrom(
      this.http.get<PerimeterAlert[]>(this.alertsUrl)
    );
  }

  /** POST /api/monitoring/alerts/{targetId}/tracking */
  enableTracking(targetId: string, alertId: string): Promise<PerimeterAlert> {
    return firstValueFrom(
      this.http.post<PerimeterAlert>(
        `${this.alertsUrl}/${targetId}/tracking`,
        { alertId }
      )
    );
  }

  /** PUT /api/monitoring/alerts/{id}/resolve */
  resolveAlert(alertId: string): Promise<PerimeterAlert> {
    return firstValueFrom(
      this.http.put<PerimeterAlert>(
        `${this.alertsUrl}/${alertId}/resolve`,
        {}
      )
    );
  }

  // ── Telemetry ────────────────────────────────────────────────────────────────

  /** GET /api/monitoring/telemetry/{targetId} */
  getTelemetryByTarget(targetId: string): Promise<TelemetryRecord[]> {
    return firstValueFrom(
      this.http.get<TelemetryRecord[]>(`${this.telemetryUrl}/${targetId}`)
    );
  }

  /** POST /api/monitoring/telemetry */
  processTelemetry(request: TelemetryRequest): Promise<TelemetryRecord> {
    return firstValueFrom(
      this.http.post<TelemetryRecord>(this.telemetryUrl, request)
    );
  }
}
