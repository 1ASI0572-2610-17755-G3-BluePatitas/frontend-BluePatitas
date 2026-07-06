import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  AddRecommendationRequest,
  ApiVeterinaryObservation,
  CreateObservationRequest,
  VeterinaryAnimalDetailResource,
  VeterinaryAnimalResource,
  VeterinaryDashboardResource
} from '../../domain/models/veterinary-api.models';
import { VeterinaryApiRepository } from '../../domain/repositories/veterinary-repository.token';
import { environment } from '../../../../environments/environment';

@Injectable()
export class HttpVeterinaryRepository implements VeterinaryApiRepository {
  private readonly baseUrl: string;

  constructor(private readonly http: HttpClient) {
    this.baseUrl = `${environment.apiBaseUrl.replace(/\/$/, '')}/api/veterinary`;
  }

  getMyDashboard(): Promise<VeterinaryDashboardResource> {
    return firstValueFrom(
      this.http.get<VeterinaryDashboardResource>(`${this.baseUrl}/me/dashboard`)
    );
  }

  getMyAnimals(): Promise<VeterinaryAnimalResource[]> {
    return firstValueFrom(
      this.http.get<VeterinaryAnimalResource[]>(`${this.baseUrl}/me/animals`)
    );
  }

  getAnimalDetail(animalId: string): Promise<VeterinaryAnimalDetailResource | ApiVeterinaryObservation[]> {
    return firstValueFrom(
      this.http.get<VeterinaryAnimalDetailResource | ApiVeterinaryObservation[]>(`${this.baseUrl}/animals/${animalId}`)
    );
  }

  createObservation(request: CreateObservationRequest): Promise<ApiVeterinaryObservation> {
    return firstValueFrom(
      this.http.post<ApiVeterinaryObservation>(`${this.baseUrl}/observations`, request)
    );
  }

  getObservationById(id: string): Promise<ApiVeterinaryObservation> {
    return firstValueFrom(
      this.http.get<ApiVeterinaryObservation>(`${this.baseUrl}/observations/${id}`)
    );
  }

  getObservationsByAnimalId(animalId: string): Promise<ApiVeterinaryObservation[]> {
    return this.getAnimalDetail(animalId).then((response) => {
      if (Array.isArray(response)) {
        return response;
      }
      return response.observations ?? [];
    });
  }

  addRecommendation(observationId: string, request: AddRecommendationRequest): Promise<ApiVeterinaryObservation> {
    return firstValueFrom(
      this.http.post<ApiVeterinaryObservation>(
        `${this.baseUrl}/observations/${observationId}/recommendation`,
        request
      )
    );
  }
}
