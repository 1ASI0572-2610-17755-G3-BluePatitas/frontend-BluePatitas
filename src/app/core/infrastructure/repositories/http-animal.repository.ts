import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Animal } from '../../domain/models/bluepatitas.models';
import { AnimalRepository } from '../../domain/repositories/repository.tokens';
import { ApiAnimal, RegisterAnimalRequest } from '../../domain/models/animals-api.models';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpAnimalRepository implements AnimalRepository {

  private readonly baseUrl: string;

  constructor(private readonly http: HttpClient) {
    const base = environment.apiBaseUrl.replace(/\/$/, '');
    this.baseUrl = `${base}/api/animals`;
  }

  async getAnimals(): Promise<Animal[]> {
    try {
      const response = await firstValueFrom(this.http.get<ApiAnimal[]>(this.baseUrl));
      return (response || []).map(api => this.mapToAnimal(api));
    } catch (error) {
      console.warn('Failed to fetch animals from backend, returning empty list', error);
      return [];
    }
  }

  async getAnimalById(id: string): Promise<Animal | undefined> {
    try {
      const response = await firstValueFrom(this.http.get<ApiAnimal>(`${this.baseUrl}/${id}`));
      return response ? this.mapToAnimal(response) : undefined;
    } catch (error) {
      console.warn(`Failed to fetch animal with id ${id}`, error);
      return undefined;
    }
  }

  async createAnimal(animal: Omit<Animal, 'id'>): Promise<Animal> {
    try {
      const totalMonths = this.parseAgeToMonths(animal.age);
      const payload: RegisterAnimalRequest = {
        name: animal.name,
        species: animal.species === 'Cat' ? 'Cat' : 'Dog',
        breed: animal.breed,
        estimatedAgeMonths: totalMonths,
        assignedPerimeterId: animal.zoneId && animal.zoneId !== 'puppies' ? animal.zoneId : null,
        photoUrl: animal.photoUrl || null,
        weightKg: animal.weightKg != null ? animal.weightKg : null
      };

      const response = await firstValueFrom(this.http.post<ApiAnimal>(this.baseUrl, payload));
      return this.mapToAnimal(response);
    } catch (error) {
      console.error('Failed to register animal in backend', error);
      throw error;
    }
  }

  async updateAnimal(animal: Animal): Promise<Animal> {
    try {
      const totalMonths = this.parseAgeToMonths(animal.age);
      const apiBase = environment.apiBaseUrl.replace(/\/$/, '');
      let relativePhotoUrl = animal.photoUrl;
      if (relativePhotoUrl && relativePhotoUrl.startsWith(apiBase)) {
        relativePhotoUrl = relativePhotoUrl.replace(apiBase, '');
      }

      const payload = {
        name: animal.name,
        species: animal.species === 'Cat' ? 'Cat' : 'Dog',
        breed: animal.breed,
        estimatedAgeMonths: totalMonths,
        photoUrl: relativePhotoUrl || null,
        weightKg: animal.weightKg != null ? animal.weightKg : null
      };

      const response = await firstValueFrom(
        this.http.put<ApiAnimal>(`${this.baseUrl}/${animal.id}`, payload)
      );

      // Relocate animal if zoneId is changed
      if (animal.zoneId && animal.zoneId !== 'puppies') {
        await firstValueFrom(
          this.http.put<ApiAnimal>(`${this.baseUrl}/${animal.id}/perimeter`, { perimeterId: animal.zoneId })
        );
      } else {
        await firstValueFrom(
          this.http.put<ApiAnimal>(`${this.baseUrl}/${animal.id}/perimeter`, { perimeterId: null })
        );
      }

      // Update health condition
      let condition: 'HEALTHY' | 'UNDER_OBSERVATION' | 'IN_TREATMENT' | 'CRITICAL' = 'HEALTHY';
      if (animal.status === 'Critical') {
        condition = 'CRITICAL';
      } else if (animal.status === 'Warning') {
        condition = 'UNDER_OBSERVATION';
      }
      await firstValueFrom(
        this.http.put<ApiAnimal>(`${this.baseUrl}/${animal.id}/health`, { healthCondition: condition })
      );

      const latest = await firstValueFrom(this.http.get<ApiAnimal>(`${this.baseUrl}/${animal.id}`));
      return this.mapToAnimal(latest);
    } catch (error) {
      console.error('Failed to update animal in backend', error);
      throw error;
    }
  }

  /**
   * Helper to upload a profile image file to the backend media endpoint.
   * Returns the relative url path (e.g. /uploads/filename.png).
   */
  async uploadPhoto(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const uploadUrl = `${environment.apiBaseUrl.replace(/\/$/, '')}/api/v1/media/upload`;
    
    const response = await firstValueFrom(
      this.http.post<{ url: string }>(uploadUrl, formData)
    );
    return response.url;
  }

  // ── Mappers & Helpers ──────────────────────────────────────────────────────

  private mapToAnimal(api: ApiAnimal): Animal {
    const apiBase = environment.apiBaseUrl.replace(/\/$/, '');
    
    // Set fully qualified photo url if relative
    let photoUrl = '/assets/bluepatitas/animal-firulais.png';
    if (api.photoUrl) {
      photoUrl = api.photoUrl.startsWith('/') 
        ? `${apiBase}${api.photoUrl}` 
        : api.photoUrl;
    }

    // Map health Condition
    let status: 'Healthy' | 'Warning' | 'Critical' = 'Healthy';
    if (api.healthCondition === 'CRITICAL') {
      status = 'Critical';
    } else if (api.healthCondition === 'UNDER_OBSERVATION' || api.healthCondition === 'IN_TREATMENT') {
      status = 'Warning';
    }

    return {
      id: api.id,
      name: api.name,
      species: api.speciesDetails.species === 'Cat' ? 'Cat' : 'Dog',
      breed: api.speciesDetails.breed,
      age: this.formatMonthsToAge(api.speciesDetails.estimatedAgeMonths),
      weightKg: api.weightKg != null ? api.weightKg : 10.0,
      status,
      zoneId: api.assignedPerimeterId || 'puppies',
      photoUrl,
      entryDate: new Date().toISOString().split('T')[0],
      notes: 'Registered in database.'
    };
  }

  private parseAgeToMonths(age: string): number {
    const yearsMatch = age.match(/(\d+)\s*year/i);
    const monthsMatch = age.match(/(\d+)\s*month/i);
    const years = yearsMatch ? parseInt(yearsMatch[1], 10) : 0;
    const months = monthsMatch ? parseInt(monthsMatch[1], 10) : 0;
    return (years * 12) + months;
  }

  private formatMonthsToAge(totalMonths: number): string {
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    let str = '';
    if (years > 0) {
      str += `${years} year${years > 1 ? 's' : ''}`;
    }
    if (months > 0) {
      if (str) str += ' ';
      str += `${months} month${months > 1 ? 's' : ''}`;
    }
    return str || '0 months';
  }
}
