/**
 * veterinary-api.models.ts
 *
 * TypeScript types that mirror the backend's Veterinary bounded context
 * aggregates returned by /api/veterinary/*.
 */

/** Mirrors the backend VeterinaryObservation aggregate root. */
export interface ApiVeterinaryObservation {
  id: string;
  animalId: string;
  veterinarianId: string;
  description: string;
  recommendation: string | null;
  createdAt: string;  // ISO-8601 LocalDateTime as string
}

/** Request body for POST /api/veterinary/observations */
export interface CreateObservationRequest {
  animalId: string;
  veterinarianId: string;
  description: string;
}

/** Request body for POST /api/veterinary/observations/{id}/recommendation */
export interface AddRecommendationRequest {
  recommendation: string;
}
