import { InjectionToken } from '@angular/core';
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
} from '../models/veterinary-api.models';

export interface VeterinaryApiRepository {
  /** GET /api/veterinary/veterinarians */
  getVeterinarians(): Promise<AdminVeterinarianResource[]>;

  /** POST /api/veterinary/veterinarians/invite */
  inviteVeterinarian(request: InviteVeterinarianRequest): Promise<InvitedVeterinarianResource>;

  /** GET /api/veterinary/veterinarians/{veterinarianId}/animals */
  getVeterinarianAnimals(veterinarianId: number): Promise<VeterinaryAnimalResource[]>;

  /** POST /api/veterinary/veterinarians/{veterinarianId}/animals/{animalId} */
  assignAnimalToVeterinarian(veterinarianId: number, animalId: string): Promise<VeterinarianAnimalAssignmentResource>;

  /** DELETE /api/veterinary/veterinarians/{veterinarianId}/animals/{animalId} */
  unassignAnimalFromVeterinarian(veterinarianId: number, animalId: string): Promise<void>;

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
