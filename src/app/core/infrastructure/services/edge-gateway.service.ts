import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, firstValueFrom, map, Observable, of, timeout } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface EdgeGatewayResult<T> {
  ok: boolean;
  data?: T;
  error?: unknown;
  checkedAt: Date;
}

export interface EdgeSimulatorStatus {
  simulacion_activa?: boolean;
  latitude?: number;
  longitude?: number;
  [key: string]: unknown;
}

export interface EdgeDispenserStatus {
  estado?: string;
  activo?: boolean;
  [key: string]: unknown;
}

export interface EdgeScheduleConfig {
  activo?: boolean;
  intervalo?: string;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class EdgeGatewayService {
  private readonly baseUrl = environment.edgeGatewayBaseUrl.replace(/\/$/, '');
  private readonly requestTimeoutMs = 3000;

  constructor(private readonly http: HttpClient) {}

  getSimulatorStatus(): Promise<EdgeGatewayResult<EdgeSimulatorStatus>> {
    return this.safeRequest(this.http.get<EdgeSimulatorStatus>(`${this.baseUrl}/api/simulador/estado`));
  }

  startSimulator(): Promise<EdgeGatewayResult<EdgeSimulatorStatus>> {
    return this.safeRequest(this.http.post<EdgeSimulatorStatus>(`${this.baseUrl}/api/simulador/iniciar`, {}));
  }

  stopSimulator(): Promise<EdgeGatewayResult<EdgeSimulatorStatus>> {
    return this.safeRequest(this.http.post<EdgeSimulatorStatus>(`${this.baseUrl}/api/simulador/detener`, {}));
  }

  moveAway(): Promise<EdgeGatewayResult<EdgeSimulatorStatus>> {
    return this.safeRequest(this.http.post<EdgeSimulatorStatus>(`${this.baseUrl}/api/simulador/alejar`, {}));
  }

  returnHome(): Promise<EdgeGatewayResult<EdgeSimulatorStatus>> {
    return this.safeRequest(this.http.post<EdgeSimulatorStatus>(`${this.baseUrl}/api/simulador/regresar`, {}));
  }

  configureSimulator(payload: Record<string, unknown>): Promise<EdgeGatewayResult<EdgeSimulatorStatus>> {
    return this.safeRequest(this.http.post<EdgeSimulatorStatus>(`${this.baseUrl}/api/simulador/config`, payload));
  }

  getDispenserStatus(): Promise<EdgeGatewayResult<EdgeDispenserStatus>> {
    return this.safeRequest(this.http.get<EdgeDispenserStatus>(`${this.baseUrl}/api/dispensador/status`));
  }

  forceFeed(): Promise<EdgeGatewayResult<EdgeDispenserStatus>> {
    return this.safeRequest(this.http.post<EdgeDispenserStatus>(`${this.baseUrl}/api/dispensador/forzar_alimento`, {}));
  }

  confirmDispense(): Promise<EdgeGatewayResult<EdgeDispenserStatus>> {
    return this.safeRequest(this.http.post<EdgeDispenserStatus>(`${this.baseUrl}/api/dispensador/confirmar`, {}));
  }

  getScheduleConfig(): Promise<EdgeGatewayResult<EdgeScheduleConfig>> {
    return this.safeRequest(this.http.get<EdgeScheduleConfig>(`${this.baseUrl}/api/dispensador/configurar_horario`));
  }

  configureSchedule(active: boolean, interval: string): Promise<EdgeGatewayResult<EdgeScheduleConfig>> {
    return this.safeRequest(
      this.http.post<EdgeScheduleConfig>(`${this.baseUrl}/api/dispensador/configurar_horario`, {
        activo: active,
        intervalo: interval || 'cada 5 minuto'
      })
    );
  }

  private safeRequest<T>(request$: Observable<T>): Promise<EdgeGatewayResult<T>> {
    return firstValueFrom(
      request$.pipe(
        timeout(this.requestTimeoutMs),
        map((data: T): EdgeGatewayResult<T> => ({ ok: true, data, checkedAt: new Date() })),
        catchError((error: unknown): Observable<EdgeGatewayResult<T>> => of({ ok: false, error, checkedAt: new Date() }))
      )
    );
  }
}
