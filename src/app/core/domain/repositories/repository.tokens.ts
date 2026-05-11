import { InjectionToken } from '@angular/core';
import { Alert, Animal, Device, FeedingEvent, FeedingPlan, MonitoringZone, Report, Shelter, User, Veterinarian } from '../models/bluepatitas.models';

export interface AnimalRepository {
  getAnimals(): Promise<Animal[]>;
  getAnimalById(id: string): Promise<Animal | undefined>;
  createAnimal(animal: Omit<Animal, 'id'>): Promise<Animal>;
}

export interface ShelterRepository {
  getShelterSettings(): Promise<Shelter>;
  getMonitoringZones(): Promise<MonitoringZone[]>;
}

export interface DeviceRepository {
  getDevices(): Promise<Device[]>;
}

export interface AlertRepository {
  getAlerts(): Promise<Alert[]>;
}

export interface FeedingRepository {
  getPlans(): Promise<FeedingPlan[]>;
  getEvents(): Promise<FeedingEvent[]>;
  assignDiet(animalId: string, planName: string): Promise<FeedingPlan>;
}

export interface VeterinarianRepository {
  getVeterinarians(): Promise<Veterinarian[]>;
}

export interface UserRepository {
  getUsers(): Promise<User[]>;
}

export interface ReportRepository {
  getReports(): Promise<Report[]>;
  getReportsByAnimal(animalId: string): Promise<Report[]>;
}

export const ANIMAL_REPOSITORY = new InjectionToken<AnimalRepository>('ANIMAL_REPOSITORY');
export const SHELTER_REPOSITORY = new InjectionToken<ShelterRepository>('SHELTER_REPOSITORY');
export const DEVICE_REPOSITORY = new InjectionToken<DeviceRepository>('DEVICE_REPOSITORY');
export const ALERT_REPOSITORY = new InjectionToken<AlertRepository>('ALERT_REPOSITORY');
export const FEEDING_REPOSITORY = new InjectionToken<FeedingRepository>('FEEDING_REPOSITORY');
export const VETERINARIAN_REPOSITORY = new InjectionToken<VeterinarianRepository>('VETERINARIAN_REPOSITORY');
export const USER_REPOSITORY = new InjectionToken<UserRepository>('USER_REPOSITORY');
export const REPORT_REPOSITORY = new InjectionToken<ReportRepository>('REPORT_REPOSITORY');
