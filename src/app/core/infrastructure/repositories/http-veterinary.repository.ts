import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AddRecommendationRequest, ApiVeterinaryObservation, CreateObservationRequest } from '../../domain/models/veterinary-api.models';
import { VeterinaryApiRepository } from '../../domain/repositories/veterinary-repository.token';
import { environment } from '../../../../environments/environment';

/**
 * HttpVeterinaryRepository
 *
 * Concrete implementation of {@link VeterinaryApiRepository} that communicates
 * with the Spring Boot backend at /api/veterinary/*.
 *
 * Base URL is read from environment.apiBaseUrl (default: http://localhost:8080).
 */
@Injectable()
export class HttpVeterinaryRepository implements VeterinaryApiRepository {

  private readonly baseUrl: string;

  constructor(private readonly http: HttpClient) {
    this.baseUrl = `${environment.apiBaseUrl.replace(/\/$/, '')}/api/veterinary`;
  }

  /** POST /api/veterinary/observations */
  createObservation(request: CreateObservationRequest): Promise<ApiVeterinaryObservation> {
    return firstValueFrom(
      this.http.post<ApiVeterinaryObservation>(`${this.baseUrl}/observations`, request)
    );
  }

  /** GET /api/veterinary/observations/{id} */
  getObservationById(id: string): Promise<ApiVeterinaryObservation> {
    return firstValueFrom(
      this.http.get<ApiVeterinaryObservation>(`${this.baseUrl}/observations/${id}`)
    );
  }

  /** GET /api/veterinary/animals/{id} */
  getObservationsByAnimalId(animalId: string): Promise<ApiVeterinaryObservation[]> {
    return firstValueFrom(
      this.http.get<ApiVeterinaryObservation[]>(`${this.baseUrl}/animals/${animalId}`)
    );
  }

  /** POST /api/veterinary/observations/{id}/recommendation */
  addRecommendation(observationId: string, request: AddRecommendationRequest): Promise<ApiVeterinaryObservation> {
    return firstValueFrom(
      this.http.post<ApiVeterinaryObservation>(
        `${this.baseUrl}/observations/${observationId}/recommendation`,
        request
      )
    );
  }
}
