import { inject, Injectable } from '@angular/core';
import { MONITORING_REPOSITORY } from '../../domain/repositories/monitoring-repository.token';
import { TelemetryRequest } from '../../domain/models/monitoring-api.models';

/**
 * GetPerimeterAlertsUseCase
 *
 * Retrieves all perimeter breach alerts from the backend.
 * Endpoint: GET /api/monitoring/alerts
 */
@Injectable({ providedIn: 'root' })
export class GetPerimeterAlertsUseCase {
  private readonly repository = inject(MONITORING_REPOSITORY);
  execute() {
    return this.repository.getPerimeterAlerts();
  }
}

/**
 * EnableTrackingUseCase
 *
 * Activates real-time location tracking for a confirmed perimeter breach alert.
 * Endpoint: POST /api/monitoring/alerts/{targetId}/tracking
 */
@Injectable({ providedIn: 'root' })
export class EnableTrackingUseCase {
  private readonly repository = inject(MONITORING_REPOSITORY);
  execute(targetId: string, alertId: string) {
    return this.repository.enableTracking(targetId, alertId);
  }
}

/**
 * ResolveAlertUseCase
 *
 * Resolves (closes) an existing perimeter breach alert.
 * Endpoint: PUT /api/monitoring/alerts/{id}/resolve
 */
@Injectable({ providedIn: 'root' })
export class ResolveAlertUseCase {
  private readonly repository = inject(MONITORING_REPOSITORY);
  execute(alertId: string) {
    return this.repository.resolveAlert(alertId);
  }
}

/**
 * GetTelemetryByTargetUseCase
 *
 * Retrieves the full telemetry history for a given target (zone/animal).
 * Endpoint: GET /api/monitoring/telemetry/{targetId}
 */
@Injectable({ providedIn: 'root' })
export class GetTelemetryByTargetUseCase {
  private readonly repository = inject(MONITORING_REPOSITORY);
  execute(targetId: string) {
    return this.repository.getTelemetryByTarget(targetId);
  }
}

/**
 * ProcessTelemetryUseCase
 *
 * Ingests a new environmental telemetry reading into the backend.
 * Endpoint: POST /api/monitoring/telemetry
 */
@Injectable({ providedIn: 'root' })
export class ProcessTelemetryUseCase {
  private readonly repository = inject(MONITORING_REPOSITORY);
  execute(request: TelemetryRequest) {
    return this.repository.processTelemetry(request);
  }
}

/**
 * DismissAlertUseCase
 *
 * Dismisses (deletes) a perimeter alert from the system permanently.
 * Endpoint: DELETE /api/monitoring/alerts/{id}
 */
@Injectable({ providedIn: 'root' })
export class DismissAlertUseCase {
  private readonly repository = inject(MONITORING_REPOSITORY);
  execute(alertId: string) {
    return this.repository.dismissAlert(alertId);
  }
}
