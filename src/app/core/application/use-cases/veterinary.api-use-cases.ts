import { inject, Injectable } from '@angular/core';
import { VETERINARY_API_REPOSITORY } from '../../domain/repositories/veterinary-repository.token';
import { AddRecommendationRequest, CreateObservationRequest } from '../../domain/models/veterinary-api.models';

@Injectable({ providedIn: 'root' })
export class GetVeterinaryDashboardUseCase {
  private readonly repository = inject(VETERINARY_API_REPOSITORY);
  execute() {
    return this.repository.getMyDashboard();
  }
}

@Injectable({ providedIn: 'root' })
export class GetVeterinaryAnimalsUseCase {
  private readonly repository = inject(VETERINARY_API_REPOSITORY);
  execute() {
    return this.repository.getMyAnimals();
  }
}

@Injectable({ providedIn: 'root' })
export class GetVeterinaryAnimalDetailUseCase {
  private readonly repository = inject(VETERINARY_API_REPOSITORY);
  execute(animalId: string) {
    return this.repository.getAnimalDetail(animalId);
  }
}

/**
 * CreateApiObservationUseCase
 * Endpoint: POST /api/veterinary/observations
 */
@Injectable({ providedIn: 'root' })
export class CreateApiObservationUseCase {
  private readonly repository = inject(VETERINARY_API_REPOSITORY);
  execute(request: CreateObservationRequest) {
    return this.repository.createObservation(request);
  }
}

/**
 * GetApiObservationByIdUseCase
 * Endpoint: GET /api/veterinary/observations/{id}
 */
@Injectable({ providedIn: 'root' })
export class GetApiObservationByIdUseCase {
  private readonly repository = inject(VETERINARY_API_REPOSITORY);
  execute(id: string) {
    return this.repository.getObservationById(id);
  }
}

/**
 * GetApiObservationsByAnimalUseCase
 * Endpoint: GET /api/veterinary/animals/{id}
 */
@Injectable({ providedIn: 'root' })
export class GetApiObservationsByAnimalUseCase {
  private readonly repository = inject(VETERINARY_API_REPOSITORY);
  execute(animalId: string) {
    return this.repository.getObservationsByAnimalId(animalId);
  }
}

/**
 * AddApiRecommendationUseCase
 * Endpoint: POST /api/veterinary/observations/{id}/recommendation
 * Also triggers automatic FeedingPlan creation on the backend.
 */
@Injectable({ providedIn: 'root' })
export class AddApiRecommendationUseCase {
  private readonly repository = inject(VETERINARY_API_REPOSITORY);
  execute(observationId: string, request: AddRecommendationRequest) {
    return this.repository.addRecommendation(observationId, request);
  }
}
