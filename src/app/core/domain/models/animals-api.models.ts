/**
 * animals-api.models.ts
 *
 * TypeScript types that mirror the backend's Animals bounded context
 * aggregates returned by /api/animals/*.
 */

/** Mirrors the backend HealthStatus enumeration. */
export type ApiHealthStatus = 'HEALTHY' | 'IN_TREATMENT' | 'CRITICAL' | 'UNDER_OBSERVATION';

/** Mirrors the backend SpeciesInfo value object (embedded in Animal). */
export interface SpeciesInfo {
  species: string;
  breed: string;
  estimatedAgeMonths: number;
}

/** Mirrors the backend Animal aggregate root. */
export interface ApiAnimal {
  id: string;
  name: string;
  speciesDetails: SpeciesInfo;
  healthCondition: ApiHealthStatus;
  assignedPerimeterId: string | null;
  photoUrl?: string | null;
  weightKg?: number | null;
}

/** Request body for POST /api/animals */
export interface RegisterAnimalRequest {
  name: string;
  species: string;
  breed: string;
  estimatedAgeMonths: number;
  assignedPerimeterId?: string | null;
  photoUrl?: string | null;
  weightKg?: number | null;
}

/** Request body for PUT /api/animals/{id}/health */
export interface UpdateHealthRequest {
  healthCondition: ApiHealthStatus;
}

/** Request body for PUT /api/animals/{id}/perimeter */
export interface AssignPerimeterRequest {
  perimeterId: string | null;
}
