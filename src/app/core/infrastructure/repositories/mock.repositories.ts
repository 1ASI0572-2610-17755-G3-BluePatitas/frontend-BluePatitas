import { Injectable } from '@angular/core';
import { Alert, Animal, FeedingPlan, Veterinarian, User, Shelter, MonitoringZone } from '../../domain/models/bluepatitas.models';
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
    const newAnimal = { ...animal, id: `animal-${Date.now()}` } as Animal;
    mockAnimals.push(newAnimal);
    return newAnimal;
  }

  async updateAnimal(animal: Animal): Promise<Animal> {
    const idx = mockAnimals.findIndex((a) => a.id === animal.id);
    if (idx !== -1) {
      mockAnimals[idx] = animal;
    }
    return animal;
  }

  async deleteAnimal(id: string): Promise<void> {
    const idx = mockAnimals.findIndex((a) => a.id === id);
    if (idx !== -1) {
      mockAnimals.splice(idx, 1);
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
    mockShelter.name = shelter.name;
    mockShelter.address = shelter.address;
    mockShelter.phone = shelter.phone;
    mockShelter.email = shelter.email;
    mockShelter.city = shelter.city;
    mockShelter.administrator = shelter.administrator;
    return structuredClone(mockShelter);
  }

  async createMonitoringZone(zone: Omit<MonitoringZone, 'id'>): Promise<MonitoringZone> {
    const newZone = {
      ...zone,
      id: `zone-${Date.now()}`,
      status: zone.status || 'Active',
      temperatureC: zone.temperatureC !== undefined ? zone.temperatureC : 22,
      humidity: zone.humidity !== undefined ? zone.humidity : 50,
      animalCount: zone.animalCount || 0,
      cameraEnabled: zone.cameraEnabled !== undefined ? zone.cameraEnabled : true
    } as MonitoringZone;
    mockZones.push(newZone);
    return structuredClone(newZone);
  }

  async updateMonitoringZone(id: string, zone: Omit<MonitoringZone, 'id'>): Promise<MonitoringZone> {
    const idx = mockZones.findIndex((z) => z.id === id);
    const updated = { ...zone, id } as MonitoringZone;
    if (idx !== -1) {
      mockZones[idx] = updated;
    }
    return structuredClone(updated);
  }

  async deleteMonitoringZone(id: string): Promise<void> {
    const idx = mockZones.findIndex((z) => z.id === id);
    if (idx !== -1) {
      mockZones.splice(idx, 1);
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
    const newVet = { ...vet, id: `vet-${Date.now()}` } as Veterinarian;
    mockVeterinarians.push(newVet);
    return newVet;
  }

  async updateVeterinarian(vet: Veterinarian): Promise<Veterinarian> {
    const idx = mockVeterinarians.findIndex(v => v.id === vet.id);
    if (idx !== -1) {
      mockVeterinarians[idx] = vet;
    }
    return vet;
  }

  async deleteVeterinarian(id: string): Promise<void> {
    const idx = mockVeterinarians.findIndex(v => v.id === id);
    if (idx !== -1) {
      mockVeterinarians.splice(idx, 1);
    }
  }
}

@Injectable()
export class MockUserRepository implements UserRepository {
  async getUsers() {
    return structuredClone(mockUsers);
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const newUser = { ...user, id: `user-${Date.now()}` } as User;
    mockUsers.push(newUser);
    return newUser;
  }

  async login(email: string, password: string): Promise<{ token: string; user: User } | null> {
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser) {
      return {
        token: `mock-token-${Date.now()}`,
        user: foundUser
      };
    }
    return null;
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
