import { inject, Injectable } from '@angular/core';
import { Animal } from '../../domain/models/bluepatitas.models';
import { ANIMAL_REPOSITORY } from '../../domain/repositories/repository.tokens';

@Injectable({ providedIn: 'root' })
export class GetAnimalsUseCase {
  private readonly repository = inject(ANIMAL_REPOSITORY);
  execute(): Promise<Animal[]> {
    return this.repository.getAnimals();
  }
}

@Injectable({ providedIn: 'root' })
export class GetAnimalByIdUseCase {
  private readonly repository = inject(ANIMAL_REPOSITORY);
  execute(id: string): Promise<Animal | undefined> {
    return this.repository.getAnimalById(id);
  }
}

@Injectable({ providedIn: 'root' })
export class CreateAnimalUseCase {
  private readonly repository = inject(ANIMAL_REPOSITORY);
  execute(animal: Omit<Animal, 'id'>): Promise<Animal> {
    return this.repository.createAnimal(animal);
  }
}
