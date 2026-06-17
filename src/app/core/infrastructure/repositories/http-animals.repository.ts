import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiAnimal, AssignPerimeterRequest, RegisterAnimalRequest, UpdateHealthRequest } from '../../domain/models/animals-api.models';
import { AnimalsRepository } from '../../domain/repositories/animals-repository.token';
import { environment } from '../../../../environments/environment';

/**
 * HttpAnimalsRepository
 *
 * Concrete implementation of {@link AnimalsRepository} that communicates with
 * the Spring Boot backend at /api/animals/*.
 *
 * Base URL is read from environment.apiBaseUrl (default: http://localhost:8080).
 */
@Injectable()
export class HttpAnimalsRepository implements AnimalsRepository {

  private readonly baseUrl: string;

  constructor(private readonly http: HttpClient) {
    this.baseUrl = `${environment.apiBaseUrl.replace(/\/$/, '')}/api/animals`;
  }

  /** GET /api/animals */
  getAnimals(): Promise<ApiAnimal[]> {
    return firstValueFrom(this.http.get<ApiAnimal[]>(this.baseUrl));
  }

  /** GET /api/animals/{id} */
  getAnimalById(id: string): Promise<ApiAnimal> {
    return firstValueFrom(this.http.get<ApiAnimal>(`${this.baseUrl}/${id}`));
  }

  /** POST /api/animals */
  registerAnimal(request: RegisterAnimalRequest): Promise<ApiAnimal> {
    return firstValueFrom(this.http.post<ApiAnimal>(this.baseUrl, request));
  }

  /** PUT /api/animals/{id}/health */
  updateHealth(id: string, request: UpdateHealthRequest): Promise<ApiAnimal> {
    return firstValueFrom(this.http.put<ApiAnimal>(`${this.baseUrl}/${id}/health`, request));
  }

  /** PUT /api/animals/{id}/perimeter */
  assignPerimeter(id: string, request: AssignPerimeterRequest): Promise<ApiAnimal> {
    return firstValueFrom(this.http.put<ApiAnimal>(`${this.baseUrl}/${id}/perimeter`, request));
  }
}
