import { Injectable } from '@angular/core';
import { Alert, Animal, FeedingPlan, MonitoringZone, Shelter, User, Veterinarian } from '../../domain/models/bluepatitas.models';
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
    const created = { ...animal, id: `animal-${Date.now()}` };
    mockAnimals.push(created);
    return structuredClone(created);
  }

  async updateAnimal(animal: Animal): Promise<Animal> {
    const index = mockAnimals.findIndex((item) => item.id === animal.id);
    if (index >= 0) {
      mockAnimals[index] = animal;
    }
    return structuredClone(animal);
  }

  async deleteAnimal(id: string): Promise<void> {
    const index = mockAnimals.findIndex((animal) => animal.id === id);
    if (index >= 0) {
      mockAnimals.splice(index, 1);
    }
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

  async updateShelterSettings(shelter: Shelter): Promise<Shelter> {
    Object.assign(mockShelter, shelter);
    return structuredClone(mockShelter);
  }

  async createMonitoringZone(zone: Omit<MonitoringZone, 'id'>): Promise<MonitoringZone> {
    const created = { ...zone, id: `zone-${Date.now()}` };
    mockZones.push(created);
    return structuredClone(created);
  }

  async updateMonitoringZone(id: string, zone: Omit<MonitoringZone, 'id'>): Promise<MonitoringZone> {
    const updated = { ...zone, id };
    const index = mockZones.findIndex((item) => item.id === id);
    if (index >= 0) {
      mockZones[index] = updated;
    }
    return structuredClone(updated);
  }

  async deleteMonitoringZone(id: string): Promise<void> {
    const index = mockZones.findIndex((zone) => zone.id === id);
    if (index >= 0) {
      mockZones.splice(index, 1);
    }
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

  async createVeterinarian(vet: Omit<Veterinarian, 'id'>): Promise<Veterinarian> {
    const created = { ...vet, id: `vet-${Date.now()}` };
    mockVeterinarians.push(created);
    return structuredClone(created);
  }

  async updateVeterinarian(vet: Veterinarian): Promise<Veterinarian> {
    const index = mockVeterinarians.findIndex((item) => item.id === vet.id);
    if (index >= 0) {
      mockVeterinarians[index] = vet;
    }
    return structuredClone(vet);
  }

  async deleteVeterinarian(id: string): Promise<void> {
    const index = mockVeterinarians.findIndex((vet) => vet.id === id);
    if (index >= 0) {
      mockVeterinarians.splice(index, 1);
    }
  }
}

@Injectable()
export class MockUserRepository implements UserRepository {
  async getUsers() {
    return structuredClone(mockUsers);
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const created = { ...user, id: `user-${Date.now()}` };
    mockUsers.push(created);
    return structuredClone(created);
  }

  async login(email: string, _password: string): Promise<{ token: string; user: User } | null> {
    const user = mockUsers.find((item) => item.email.toLowerCase() === email.toLowerCase());
    return user ? { token: 'mock-token', user: structuredClone(user) } : null;
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
