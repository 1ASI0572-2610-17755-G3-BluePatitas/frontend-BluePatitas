import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Veterinarian } from '../../domain/models/bluepatitas.models';
import { VeterinarianRepository } from '../../domain/repositories/repository.tokens';

const API_BASE_URL = 'http://localhost:8080';

type RawRecord = Record<string, unknown>;

@Injectable()
export class HttpVeterinarianRepository implements VeterinarianRepository {
  constructor(private readonly http: HttpClient) {}

  async getVeterinarians(): Promise<Veterinarian[]> {
    const raw = await firstValueFrom(this.http.get<unknown>(`${API_BASE_URL}/api/veterinary/veterinarians`));
    return this.unwrapArray(raw).map((item) => this.mapVeterinarian(item));
  }

  private mapVeterinarian(raw: RawRecord): Veterinarian {
    const firstName = this.asString(raw['firstName']);
    const lastName = this.asString(raw['lastName']);
    const name = this.asString(raw['name'], [firstName, lastName].filter(Boolean).join(' ') || 'Veterinarian');

    return {
      id: this.asString(raw['id']),
      name,
      firstName,
      lastName,
      specialty: this.asString(raw['specialty'] ?? raw['role'], 'Veterinarian'),
      phone: this.asString(raw['phone']),
      email: this.asString(raw['email']),
      status: this.normalizeStatus(raw['status']),
      avatarUrl: this.asOptionalString(raw['avatarUrl'] ?? raw['photoUrl']),
      role: this.asOptionalString(raw['role']),
      shelterName: this.asOptionalString(raw['shelterName']),
      assignedAnimalsCount: this.asNumber(raw['assignedAnimalsCount'] ?? raw['animalsUnderCare'] ?? raw['animalsCount'], 0),
    };
  }

  private unwrapArray(raw: unknown): RawRecord[] {
    if (Array.isArray(raw)) {
      return this.asArray(raw);
    }

    if (raw && typeof raw === 'object') {
      const record = raw as RawRecord;
      return this.asArray(record['content'] ?? record['items'] ?? record['data'] ?? record['veterinarians']);
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

  private normalizeStatus(value: unknown): 'Active' | 'Warning' {
    return String(value).toUpperCase() === 'WARNING' || String(value).toUpperCase() === 'INACTIVE' ? 'Warning' : 'Active';
  }
}
