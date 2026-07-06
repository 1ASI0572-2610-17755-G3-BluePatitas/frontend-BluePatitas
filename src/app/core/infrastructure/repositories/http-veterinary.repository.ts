import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  AddRecommendationRequest,
  AdminVeterinarianResource,
  ApiVeterinaryObservation,
  CreateObservationRequest,
  InvitedVeterinarianResource,
  InviteVeterinarianRequest,
  VeterinarianAnimalAssignmentResource,
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

  getVeterinarians(): Promise<AdminVeterinarianResource[]> {
    return firstValueFrom(
      this.http.get<AdminVeterinarianResource[]>(`${this.baseUrl}/veterinarians`)
    );
  }

  inviteVeterinarian(request: InviteVeterinarianRequest): Promise<InvitedVeterinarianResource> {
    return firstValueFrom(
      this.http.post<InvitedVeterinarianResource>(`${this.baseUrl}/veterinarians/invite`, request)
    );
  }

  getVeterinarianAnimals(veterinarianId: number): Promise<VeterinaryAnimalResource[]> {
    return firstValueFrom(
      this.http.get<VeterinaryAnimalResource[]>(`${this.baseUrl}/veterinarians/${veterinarianId}/animals`)
    );
  }

  assignAnimalToVeterinarian(veterinarianId: number, animalId: string): Promise<VeterinarianAnimalAssignmentResource> {
    return firstValueFrom(
      this.http.post<VeterinarianAnimalAssignmentResource>(
        `${this.baseUrl}/veterinarians/${veterinarianId}/animals/${animalId}`,
        {}
      )
    );
  }

  unassignAnimalFromVeterinarian(veterinarianId: number, animalId: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.baseUrl}/veterinarians/${veterinarianId}/animals/${animalId}`)
    );
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
