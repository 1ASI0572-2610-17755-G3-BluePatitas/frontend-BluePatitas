import { inject, Injectable } from '@angular/core';
import { ANIMALS_API_REPOSITORY } from '../../domain/repositories/animals-repository.token';
import { AssignPerimeterRequest, RegisterAnimalRequest, UpdateHealthRequest } from '../../domain/models/animals-api.models';

/**
 * GetApiAnimalsUseCase
 * Endpoint: GET /api/animals
 */
@Injectable({ providedIn: 'root' })
export class GetApiAnimalsUseCase {
  private readonly repository = inject(ANIMALS_API_REPOSITORY);
  execute() {
    return this.repository.getAnimals();
  }
}

/**
 * GetApiAnimalByIdUseCase
 * Endpoint: GET /api/animals/{id}
 */
@Injectable({ providedIn: 'root' })
export class GetApiAnimalByIdUseCase {
  private readonly repository = inject(ANIMALS_API_REPOSITORY);
  execute(id: string) {
    return this.repository.getAnimalById(id);
  }
}

/**
 * RegisterApiAnimalUseCase
 * Endpoint: POST /api/animals
 */
@Injectable({ providedIn: 'root' })
export class RegisterApiAnimalUseCase {
  private readonly repository = inject(ANIMALS_API_REPOSITORY);
  execute(request: RegisterAnimalRequest) {
    return this.repository.registerAnimal(request);
  }
}

/**
 * UpdateApiAnimalHealthUseCase
 * Endpoint: PUT /api/animals/{id}/health
 */
@Injectable({ providedIn: 'root' })
export class UpdateApiAnimalHealthUseCase {
  private readonly repository = inject(ANIMALS_API_REPOSITORY);
  execute(id: string, request: UpdateHealthRequest) {
    return this.repository.updateHealth(id, request);
  }
}

/**
 * AssignApiAnimalPerimeterUseCase
 * Endpoint: PUT /api/animals/{id}/perimeter
 */
@Injectable({ providedIn: 'root' })
export class AssignApiAnimalPerimeterUseCase {
  private readonly repository = inject(ANIMALS_API_REPOSITORY);
  execute(id: string, request: AssignPerimeterRequest) {
    return this.repository.assignPerimeter(id, request);
  }
}
