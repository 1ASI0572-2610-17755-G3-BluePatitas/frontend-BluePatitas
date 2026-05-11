import { Injectable } from '@angular/core';
import { Alert, Animal, FeedingPlan } from '../../domain/models/bluepatitas.models';
import { AlertRepository, AnimalRepository, DeviceRepository, FeedingRepository, ReportRepository, ShelterRepository, UserRepository, VeterinarianRepository } from '../../domain/repositories/repository.tokens';
import { mockAlerts, mockAnimals, mockDevices, mockFeedingEvents, mockFeedingPlans, mockReports, mockShelter, mockUsers, mockVeterinarians, mockZones } from '../mock/mock-bluepatitas.data';

@Injectable()
export class MockAnimalRepository implements AnimalRepository {
  async getAnimals(): Promise<Animal[]> {
    return structuredClone(mockAnimals);
  }

  async getAnimalById(id: string): Promise<Animal | undefined> {
    return structuredClone(mockAnimals.find((animal) => animal.id === id));
  }

  async createAnimal(animal: Omit<Animal, 'id'>): Promise<Animal> {
    return { ...animal, id: `animal-${Date.now()}` };
  }
}

@Injectable()
export class MockShelterRepository implements ShelterRepository {
  async getShelterSettings() {
    return structuredClone(mockShelter);
  }

  async getMonitoringZones() {
    return structuredClone(mockZones);
  }
}

@Injectable()
export class MockDeviceRepository implements DeviceRepository {
  async getDevices() {
    return structuredClone(mockDevices);
  }
}

@Injectable()
export class MockAlertRepository implements AlertRepository {
  async getAlerts(): Promise<Alert[]> {
    return structuredClone(mockAlerts);
  }
}

@Injectable()
export class MockFeedingRepository implements FeedingRepository {
  async getPlans() {
    return structuredClone(mockFeedingPlans);
  }

  async getEvents() {
    return structuredClone(mockFeedingEvents);
  }

  async assignDiet(animalId: string, planName: string): Promise<FeedingPlan> {
    return { id: `diet-${Date.now()}`, animalId, name: planName, foodType: 'Balanced diet', schedule: '08:00 / 18:00', notes: 'Assigned locally in mock mode.' };
  }
}

@Injectable()
export class MockVeterinarianRepository implements VeterinarianRepository {
  async getVeterinarians() {
    return structuredClone(mockVeterinarians);
  }
}

@Injectable()
export class MockUserRepository implements UserRepository {
  async getUsers() {
    return structuredClone(mockUsers);
  }
}

@Injectable()
export class MockReportRepository implements ReportRepository {
  async getReports() {
    return structuredClone(mockReports);
  }

  async getReportsByAnimal(animalId: string) {
    return structuredClone(mockReports.filter((report) => report.animalId === animalId));
  }
}
