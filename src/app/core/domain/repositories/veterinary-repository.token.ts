import { InjectionToken } from '@angular/core';
import {
  AddRecommendationRequest,
  ApiVeterinaryObservation,
  CreateObservationRequest
} from '../models/veterinary-api.models';

/**
 * VeterinaryApiRepository
 *
 * Abstraction for all Veterinary-specific HTTP operations against
 * /api/veterinary/*. The concrete implementation lives in
 * HttpVeterinaryRepository (infrastructure layer).
 */
export interface VeterinaryApiRepository {
  /** POST /api/veterinary/observations — create a new clinical observation. */
  createObservation(request: CreateObservationRequest): Promise<ApiVeterinaryObservation>;

  /** GET /api/veterinary/observations/{id} — get a single observation. */
  getObservationById(id: string): Promise<ApiVeterinaryObservation>;

  /** GET /api/veterinary/animals/{id} — list all observations for an animal. */
  getObservationsByAnimalId(animalId: string): Promise<ApiVeterinaryObservation[]>;

  /**
   * POST /api/veterinary/observations/{id}/recommendation
   * Adds a recommendation and triggers automatic FeedingPlan creation.
   */
  addRecommendation(observationId: string, request: AddRecommendationRequest): Promise<ApiVeterinaryObservation>;
}

export const VETERINARY_API_REPOSITORY =
  new InjectionToken<VeterinaryApiRepository>('VETERINARY_API_REPOSITORY');
