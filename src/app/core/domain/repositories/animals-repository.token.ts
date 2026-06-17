import { InjectionToken } from '@angular/core';
import {
  ApiAnimal,
  AssignPerimeterRequest,
  RegisterAnimalRequest,
  UpdateHealthRequest
} from '../models/animals-api.models';

/**
 * AnimalsRepository
 *
 * Abstraction for all Animals-specific HTTP operations against
 * /api/animals/*. The concrete implementation lives in HttpAnimalsRepository
 * (infrastructure layer).
 */
export interface AnimalsRepository {
  /** GET /api/animals — list all registered animals. */
  getAnimals(): Promise<ApiAnimal[]>;

  /** GET /api/animals/{id} — get a single animal by id. */
  getAnimalById(id: string): Promise<ApiAnimal>;

  /** POST /api/animals — register a new animal (starts as HEALTHY). */
  registerAnimal(request: RegisterAnimalRequest): Promise<ApiAnimal>;

  /** PUT /api/animals/{id}/health — update an animal's health condition. */
  updateHealth(id: string, request: UpdateHealthRequest): Promise<ApiAnimal>;

  /** PUT /api/animals/{id}/perimeter — assign / unassign a perimeter zone. */
  assignPerimeter(id: string, request: AssignPerimeterRequest): Promise<ApiAnimal>;
}

export const ANIMALS_API_REPOSITORY =
  new InjectionToken<AnimalsRepository>('ANIMALS_API_REPOSITORY');
