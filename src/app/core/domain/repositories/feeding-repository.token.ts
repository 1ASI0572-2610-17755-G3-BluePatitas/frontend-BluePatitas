import { InjectionToken } from '@angular/core';
import {
  ApiFeedingPlan,
  CreateFeedingPlanRequest,
  UpdateFeedingPlanRequest
} from '../models/feeding-api.models';

/**
 * FeedingApiRepository
 *
 * Abstraction for all Feeding-specific HTTP operations against
 * /api/feeding/plans/*. The concrete implementation lives in
 * HttpFeedingRepository (infrastructure layer).
 */
export interface FeedingApiRepository {
  /** GET /api/feeding/plans — get all plans. */
  getAllPlans(): Promise<ApiFeedingPlan[]>;

  /** GET /api/feeding/plans/{animalId} — get all plans for an animal. */
  getPlansByAnimalId(animalId: string): Promise<ApiFeedingPlan[]>;

  /** POST /api/feeding/plans — create a new plan in DRAFT state. */
  createPlan(request: CreateFeedingPlanRequest): Promise<ApiFeedingPlan>;

  /** PUT /api/feeding/plans/{id} — partial update (null fields = no change). */
  updatePlan(id: string, request: UpdateFeedingPlanRequest): Promise<ApiFeedingPlan>;

  /** PUT /api/feeding/plans/{id}/activate — transition plan to ACTIVE. */
  activatePlan(id: string): Promise<ApiFeedingPlan>;

  /** PUT /api/feeding/plans/{id}/deactivate — transition plan to INACTIVE. */
  deactivatePlan(id: string): Promise<ApiFeedingPlan>;
}

export const FEEDING_API_REPOSITORY =
  new InjectionToken<FeedingApiRepository>('FEEDING_API_REPOSITORY');
