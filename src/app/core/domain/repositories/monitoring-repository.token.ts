import { InjectionToken } from '@angular/core';
import { PerimeterAlert, TelemetryRecord, TelemetryRequest } from '../models/monitoring-api.models';

/**
 * MonitoringRepository
 *
 * Abstraction for all monitoring-specific HTTP operations against
 * /api/monitoring/alerts and /api/monitoring/telemetry.
 * The concrete implementation lives in HttpMonitoringRepository
 * (infrastructure layer).
 */
export interface MonitoringRepository {
  // ── Alerts ───────────────────────────────────────────────────────────────
  /** GET /api/monitoring/alerts — returns all perimeter alerts. */
  getPerimeterAlerts(): Promise<PerimeterAlert[]>;

  /** POST /api/monitoring/alerts/{targetId}/tracking — enable tracking. */
  enableTracking(targetId: string, alertId: string): Promise<PerimeterAlert>;

  /** PUT /api/monitoring/alerts/{id}/resolve — resolve an alert. */
  resolveAlert(alertId: string): Promise<PerimeterAlert>;

  // ── Telemetry ─────────────────────────────────────────────────────────────
  /** GET /api/monitoring/telemetry/{targetId} — get telemetry history. */
  getTelemetryByTarget(targetId: string): Promise<TelemetryRecord[]>;

  /** POST /api/monitoring/telemetry — ingest a new telemetry reading. */
  processTelemetry(request: TelemetryRequest): Promise<TelemetryRecord>;
}

export const MONITORING_REPOSITORY = new InjectionToken<MonitoringRepository>('MONITORING_REPOSITORY');
