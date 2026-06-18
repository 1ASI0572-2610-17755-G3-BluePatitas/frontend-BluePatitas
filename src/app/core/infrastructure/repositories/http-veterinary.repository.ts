import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { VeterinaryAnimal, VeterinaryDashboard, VeterinaryObservation } from '../../domain/models/veterinary.models';
import { VeterinaryMeRepository } from '../../domain/repositories/veterinary.repository';

const API_BASE_URL = 'http://localhost:8080';

type RawRecord = Record<string, unknown>;

@Injectable()
export class HttpVeterinaryMeRepository implements VeterinaryMeRepository {
  constructor(private readonly http: HttpClient) {}

  async getDashboard(): Promise<VeterinaryDashboard> {
    const raw = await firstValueFrom(this.http.get<RawRecord>(`${API_BASE_URL}/api/veterinary/me/dashboard`));
    const observations = this.asArray(raw['recentObservations'] ?? raw['observations']).map((item, index) => this.mapObservation(item, index));

    return {
      veterinarianName: this.asString(raw['veterinarianName'] ?? raw['name'], 'Veterinarian'),
      shelterName: this.asString(raw['shelterName'], 'WUF Shelter'),
      animalsUnderCare: this.asNumber(raw['animalsUnderCare'] ?? raw['animalsUnderCareCount'] ?? raw['assignedAnimalsCount'] ?? raw['animalsCount'], 0),
      pendingObservations: this.asNumber(raw['pendingObservations'] ?? raw['pendingObservationsCount'], 0),
      activeAlerts: this.asNumber(raw['activeAlerts'] ?? raw['activeAlertsCount'], 0),
      recentObservations: observations,
    };
  }

  async getAnimals(): Promise<VeterinaryAnimal[]> {
    const raw = await firstValueFrom(this.http.get<unknown>(`${API_BASE_URL}/api/veterinary/me/animals`));
    return this.unwrapArray(raw).map((item) => this.mapAnimal(item));
  }

  async getAnimalById(id: string): Promise<VeterinaryAnimal> {
    const raw = await firstValueFrom(this.http.get<RawRecord>(`${API_BASE_URL}/api/veterinary/animals/${id}`));
    return this.mapAnimal(raw);
  }

  private mapAnimal(raw: RawRecord): VeterinaryAnimal {
    return {
      id: this.asString(raw['id']),
      photoUrl: this.asOptionalString(raw['photoUrl'] ?? raw['imageUrl']),
      name: this.asString(raw['name'], 'Animal'),
      species: this.asString(raw['species'], 'Unknown'),
      breed: this.asString(raw['breed'], 'Mixed breed'),
      healthCondition: this.asString(raw['healthCondition'] ?? raw['status'], 'Healthy'),
      weightKg: this.asNullableNumber(raw['weightKg']),
      observations: this.asArray(raw['observations']).map((item, index) => this.mapObservation(item, index)),
    };
  }

  private mapObservation(raw: RawRecord, index: number): VeterinaryObservation {
    return {
      id: this.asString(raw['id'], `observation-${index}`),
      animalName: this.asString(raw['animalName'] ?? raw['name'], 'Animal'),
      summary: this.asString(raw['summary'] ?? raw['description'] ?? raw['notes'], 'Observation pending review.'),
      createdAt: this.asString(raw['createdAt'] ?? raw['date'], ''),
    };
  }

  private unwrapArray(raw: unknown): RawRecord[] {
    if (Array.isArray(raw)) {
      return this.asArray(raw);
    }

    if (raw && typeof raw === 'object') {
      const record = raw as RawRecord;
      return this.asArray(record['content'] ?? record['items'] ?? record['data'] ?? record['animals']);
    }

    return [];
  }

  private asArray(value: unknown): RawRecord[] {
    return Array.isArray(value) ? value.filter((item): item is RawRecord => !!item && typeof item === 'object') : [];
  }

  private asString(value: unknown, fallback = ''): string {
    return typeof value === 'string' || typeof value === 'number' ? String(value) : fallback;
  }

  private asOptionalString(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() ? value : undefined;
  }

  private asNumber(value: unknown, fallback: number): number {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : fallback;
  }

  private asNullableNumber(value: unknown): number | null {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
  }
}
