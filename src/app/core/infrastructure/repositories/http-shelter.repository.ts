import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Shelter, MonitoringZone } from '../../domain/models/bluepatitas.models';
import { ShelterRepository } from '../../domain/repositories/repository.tokens';
import { environment } from '../../../../environments/environment';

/**
 * HttpShelterRepository
 *
 * Communicates with the Spring Boot backend at /api/monitoring/shelter and /api/monitoring/zones.
 */
@Injectable({
  providedIn: 'root'
})
export class HttpShelterRepository implements ShelterRepository {

  private readonly shelterUrl: string;
  private readonly zonesUrl: string;

  constructor(private readonly http: HttpClient) {
    const base = environment.apiBaseUrl.replace(/\/$/, '');
    this.shelterUrl = `${base}/api/monitoring/shelter`;
    this.zonesUrl = `${base}/api/monitoring/zones`;
  }

  private createEmptyShelter(): Shelter {
    return {
      id: '',
      name: '',
      city: '',
      address: '',
      administrator: '',
      phone: '',
      email: ''
    };
  }

  async getShelterSettings(): Promise<Shelter> {
    try {
      const response = await firstValueFrom(this.http.get<Shelter | null>(this.shelterUrl));
      return response || this.createEmptyShelter();
    } catch (error) {
      console.warn('Failed to fetch shelter settings, returning default empty shelter', error);
      return this.createEmptyShelter();
    }
  }

  async updateShelterSettings(shelter: Shelter): Promise<Shelter> {
    try {
      const response = await firstValueFrom(this.http.put<Shelter>(this.shelterUrl, shelter));
      return response || shelter;
    } catch (error) {
      console.error('Failed to update shelter settings', error);
      throw error;
    }
  }

  async getMonitoringZones(): Promise<MonitoringZone[]> {
    try {
      const response = await firstValueFrom(this.http.get<MonitoringZone[]>(this.zonesUrl));
      return response || [];
    } catch (error) {
      console.warn('Failed to fetch monitoring zones, returning empty list', error);
      return [];
    }
  }

  async createMonitoringZone(zone: Omit<MonitoringZone, 'id'>): Promise<MonitoringZone> {
    try {
      const response = await firstValueFrom(this.http.post<MonitoringZone>(this.zonesUrl, zone));
      return response;
    } catch (error) {
      console.error('Failed to create monitoring zone', error);
      throw error;
    }
  }

  async updateMonitoringZone(id: string, zone: Omit<MonitoringZone, 'id'>): Promise<MonitoringZone> {
    try {
      const response = await firstValueFrom(this.http.put<MonitoringZone>(`${this.zonesUrl}/${id}`, zone));
      return response;
    } catch (error) {
      console.error('Failed to update monitoring zone', error);
      throw error;
    }
  }

  async deleteMonitoringZone(id: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete<void>(`${this.zonesUrl}/${id}`));
    } catch (error) {
      console.error('Failed to delete monitoring zone', error);
      throw error;
    }
  }
}
