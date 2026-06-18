import { InjectionToken } from '@angular/core';
import { VeterinaryAnimal, VeterinaryDashboard } from '../models/veterinary.models';

export interface VeterinaryMeRepository {
  getDashboard(): Promise<VeterinaryDashboard>;
  getAnimals(): Promise<VeterinaryAnimal[]>;
  getAnimalById(id: string): Promise<VeterinaryAnimal>;
}

export const VETERINARY_ME_REPOSITORY = new InjectionToken<VeterinaryMeRepository>('VETERINARY_ME_REPOSITORY');
