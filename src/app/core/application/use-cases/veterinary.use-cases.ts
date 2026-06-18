import { inject, Injectable } from '@angular/core';
import { VETERINARY_ME_REPOSITORY } from '../../domain/repositories/veterinary.repository';

@Injectable({ providedIn: 'root' })
export class GetVeterinaryDashboardUseCase {
  private readonly repository = inject(VETERINARY_ME_REPOSITORY);

  execute() {
    return this.repository.getDashboard();
  }
}

@Injectable({ providedIn: 'root' })
export class GetVeterinaryAnimalsUseCase {
  private readonly repository = inject(VETERINARY_ME_REPOSITORY);

  execute() {
    return this.repository.getAnimals();
  }
}

@Injectable({ providedIn: 'root' })
export class GetVeterinaryAnimalByIdUseCase {
  private readonly repository = inject(VETERINARY_ME_REPOSITORY);

  execute(id: string) {
    return this.repository.getAnimalById(id);
  }
}
