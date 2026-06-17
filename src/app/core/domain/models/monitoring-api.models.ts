/**
 * monitoring-api.models.ts
 *
 * TypeScript types that mirror the backend's monitoring bounded context
 * aggregates returned by /api/monitoring/alerts and /api/monitoring/telemetry.
 */

/** Mirrors the backend PerimeterAlert aggregate. */
export interface PerimeterAlert {
  id: string;
  targetId: string;
  isBreachConfirmed: boolean;
  currentCoordinates: LocationContext | null;
  trackingActive: boolean;
}

/** Embedded GPS coordinates for a PerimeterAlert. */
export interface LocationContext {
  latitude: number;
  longitude: number;
}

/** Mirrors the backend TelemetryRecord aggregate. */
export interface TelemetryRecord {
  id: string;
  targetId: string;
  ambientTemperature: number | null;
  ambientHumidity: number | null;
  visualData: string | null;
  recordedAt: string; // ISO-8601 LocalDateTime serialized as string
}

/** Request body for POST /api/monitoring/telemetry */
export interface TelemetryRequest {
  targetId: string;
  ambientTemperature: number;
  ambientHumidity: number;
  visualData?: string;
}

/** Request body for POST /api/monitoring/alerts/{targetId}/tracking */
export interface EnableTrackingRequest {
  alertId: string;
}
