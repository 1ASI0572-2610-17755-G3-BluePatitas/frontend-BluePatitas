import { inject, Injectable } from '@angular/core';
import { FEEDING_API_REPOSITORY } from '../../domain/repositories/feeding-repository.token';
import { CreateFeedingPlanRequest, UpdateFeedingPlanRequest } from '../../domain/models/feeding-api.models';

/**
 * GetApiFeedingPlansByAnimalUseCase
 * Endpoint: GET /api/feeding/plans/{animalId}
 */
@Injectable({ providedIn: 'root' })
export class GetApiFeedingPlansByAnimalUseCase {
  private readonly repository = inject(FEEDING_API_REPOSITORY);
  execute(animalId: string) {
    return this.repository.getPlansByAnimalId(animalId);
  }
}

/**
 * CreateApiFeedingPlanUseCase
 * Endpoint: POST /api/feeding/plans
 */
@Injectable({ providedIn: 'root' })
export class CreateApiFeedingPlanUseCase {
  private readonly repository = inject(FEEDING_API_REPOSITORY);
  execute(request: CreateFeedingPlanRequest) {
    return this.repository.createPlan(request);
  }
}

/**
 * UpdateApiFeedingPlanUseCase
 * Endpoint: PUT /api/feeding/plans/{id}
 */
@Injectable({ providedIn: 'root' })
export class UpdateApiFeedingPlanUseCase {
  private readonly repository = inject(FEEDING_API_REPOSITORY);
  execute(id: string, request: UpdateFeedingPlanRequest) {
    return this.repository.updatePlan(id, request);
  }
}

/**
 * ActivateApiFeedingPlanUseCase
 * Endpoint: PUT /api/feeding/plans/{id}/activate
 */
@Injectable({ providedIn: 'root' })
export class ActivateApiFeedingPlanUseCase {
  private readonly repository = inject(FEEDING_API_REPOSITORY);
  execute(id: string) {
    return this.repository.activatePlan(id);
  }
}

/**
 * DeactivateApiFeedingPlanUseCase
 * Endpoint: PUT /api/feeding/plans/{id}/deactivate
 */
@Injectable({ providedIn: 'root' })
export class DeactivateApiFeedingPlanUseCase {
  private readonly repository = inject(FEEDING_API_REPOSITORY);
  execute(id: string) {
    return this.repository.deactivatePlan(id);
  }
}

/**
 * GetAllApiFeedingPlansUseCase
 * Endpoint: GET /api/feeding/plans
 */
@Injectable({ providedIn: 'root' })
export class GetAllApiFeedingPlansUseCase {
  private readonly repository = inject(FEEDING_API_REPOSITORY);
  execute() {
    return this.repository.getAllPlans();
  }
}
