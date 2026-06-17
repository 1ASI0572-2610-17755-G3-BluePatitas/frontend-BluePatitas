/**
 * feeding-api.models.ts
 *
 * TypeScript types that mirror the backend's Feeding bounded context
 * aggregates returned by /api/feeding/plans/*.
 */

/** Mirrors the backend FeedingPlanStatus enumeration. */
export type ApiFeedingPlanStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';

/** Mirrors the backend DietType value object (embedded in FeedingPlan). */
export interface ApiDietType {
  name: string;
  nutritionalNotes: string | null;
}

/** Mirrors the backend FoodAmount value object (embedded in FeedingPlan). */
export interface ApiFoodAmount {
  quantity: number;
  unit: string;
}

/** Mirrors the backend FeedingSchedule value object (embedded in FeedingPlan). */
export interface ApiFeedingSchedule {
  timesPerDay: number;
  scheduledTimes: string;  // comma-separated "HH:mm" e.g. "08:00,13:00,19:00"
  toleranceMinutes: number;
}

/** Mirrors the backend FeedingPlan aggregate root. */
export interface ApiFeedingPlan {
  id: string;
  animalId: string;
  dietType: ApiDietType;
  foodAmount: ApiFoodAmount;
  schedule: ApiFeedingSchedule;
  status: ApiFeedingPlanStatus;
  createdAt: string;   // ISO-8601 LocalDateTime as string
  updatedAt: string;
}

/** Request body for POST /api/feeding/plans */
export interface CreateFeedingPlanRequest {
  animalId: string;
  dietName: string;
  nutritionalNotes?: string | null;
  foodQuantity: number;
  foodUnit: string;
  timesPerDay: number;
  scheduledTimes: string;
  toleranceMinutes?: number;
}

/** Request body for PUT /api/feeding/plans/{id} */
export interface UpdateFeedingPlanRequest {
  dietName?: string | null;
  nutritionalNotes?: string | null;
  foodQuantity?: number | null;
  foodUnit?: string | null;
  timesPerDay?: number | null;
  scheduledTimes?: string | null;
  toleranceMinutes?: number | null;
}
