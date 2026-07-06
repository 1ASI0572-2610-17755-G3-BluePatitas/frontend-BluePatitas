import { InjectionToken } from '@angular/core';
import {
  AddRecommendationRequest,
  ApiVeterinaryObservation,
  CreateObservationRequest,
  VeterinaryAnimalDetailResource,
  VeterinaryAnimalResource,
  VeterinaryDashboardResource
} from '../models/veterinary-api.models';

export interface VeterinaryApiRepository {
  /** GET /api/veterinary/me/dashboard */
  getMyDashboard(): Promise<VeterinaryDashboardResource>;

  /** GET /api/veterinary/me/animals */
  getMyAnimals(): Promise<VeterinaryAnimalResource[]>;

  /** GET /api/veterinary/animals/{id} */
  getAnimalDetail(animalId: string): Promise<VeterinaryAnimalDetailResource | ApiVeterinaryObservation[]>;

  /** POST /api/veterinary/observations */
  createObservation(request: CreateObservationRequest): Promise<ApiVeterinaryObservation>;

  /** GET /api/veterinary/observations/{id} */
  getObservationById(id: string): Promise<ApiVeterinaryObservation>;

  /** Compatibility alias for the current animal clinical history endpoint. */
  getObservationsByAnimalId(animalId: string): Promise<ApiVeterinaryObservation[]>;

  /** POST /api/veterinary/observations/{id}/recommendation */
  addRecommendation(observationId: string, request: AddRecommendationRequest): Promise<ApiVeterinaryObservation>;
}

export const VETERINARY_API_REPOSITORY =
  new InjectionToken<VeterinaryApiRepository>('VETERINARY_API_REPOSITORY');
