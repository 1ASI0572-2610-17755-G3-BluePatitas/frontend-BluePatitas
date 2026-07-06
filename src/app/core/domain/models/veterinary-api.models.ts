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

export interface VeterinaryDashboardResource {
  veterinarianId: number;
  veterinarianName: string;
  shelterId: string;
  shelterName: string;
  assignedAnimalsCount: number;
  pendingObservationsCount: number;
  activeAlertsCount: number;
  recentObservationsCount: number;
}

export interface VeterinaryAnimalResource {
  id: string;
  name: string;
  species: string;
  breed: string;
  photoUrl: string | null;
  healthCondition: string;
  weightKg: number | null;
  shelterId: string;
}

export interface VeterinaryAnimalDetailResource extends VeterinaryAnimalResource {
  observations?: ApiVeterinaryObservation[];
}

export interface AdminVeterinarianResource {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  shelterId: string;
  shelterName: string;
  status: 'PENDING' | 'ACTIVE' | string;
  assignedAnimalsCount: number;
}

export interface InvitedVeterinarianResource {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  shelterId: string;
  shelterName: string;
  status: 'PENDING' | 'ACTIVE' | string;
  invitationCode: string;
}

export interface InviteVeterinarianRequest {
  email: string;
  firstName: string;
  lastName: string;
}

export interface VeterinarianAnimalAssignmentResource {
  id: string;
  veterinarianId: number;
  animalId: string;
  shelterId: string;
  active: boolean;
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
