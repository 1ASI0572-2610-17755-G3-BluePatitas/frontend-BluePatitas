import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiFeedingPlan, CreateFeedingPlanRequest, UpdateFeedingPlanRequest } from '../../domain/models/feeding-api.models';
import { FeedingApiRepository } from '../../domain/repositories/feeding-repository.token';
import { environment } from '../../../../environments/environment';

/**
 * HttpFeedingRepository
 *
 * Concrete implementation of {@link FeedingApiRepository} that communicates
 * with the Spring Boot backend at /api/feeding/plans/*.
 *
 * Base URL is read from environment.apiBaseUrl (default: http://localhost:8080).
 */
@Injectable()
export class HttpFeedingRepository implements FeedingApiRepository {

  private readonly baseUrl: string;

  constructor(private readonly http: HttpClient) {
    this.baseUrl = `${environment.apiBaseUrl.replace(/\/$/, '')}/api/feeding/plans`;
  }

  /** GET /api/feeding/plans */
  getAllPlans(): Promise<ApiFeedingPlan[]> {
    return firstValueFrom(this.http.get<ApiFeedingPlan[]>(this.baseUrl));
  }

  /** GET /api/feeding/plans/{animalId} */
  getPlansByAnimalId(animalId: string): Promise<ApiFeedingPlan[]> {
    return firstValueFrom(this.http.get<ApiFeedingPlan[]>(`${this.baseUrl}/${animalId}`));
  }

  /** POST /api/feeding/plans */
  createPlan(request: CreateFeedingPlanRequest): Promise<ApiFeedingPlan> {
    return firstValueFrom(this.http.post<ApiFeedingPlan>(this.baseUrl, request));
  }

  /** PUT /api/feeding/plans/{id} */
  updatePlan(id: string, request: UpdateFeedingPlanRequest): Promise<ApiFeedingPlan> {
    return firstValueFrom(this.http.put<ApiFeedingPlan>(`${this.baseUrl}/${id}`, request));
  }

  /** PUT /api/feeding/plans/{id}/activate */
  activatePlan(id: string): Promise<ApiFeedingPlan> {
    return firstValueFrom(this.http.put<ApiFeedingPlan>(`${this.baseUrl}/${id}/activate`, {}));
  }

  /** PUT /api/feeding/plans/{id}/deactivate */
  deactivatePlan(id: string): Promise<ApiFeedingPlan> {
    return firstValueFrom(this.http.put<ApiFeedingPlan>(`${this.baseUrl}/${id}/deactivate`, {}));
  }
}
