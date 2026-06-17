import { Provider } from '@angular/core';
import { ALERT_REPOSITORY, ANIMAL_REPOSITORY, DEVICE_REPOSITORY, FEEDING_REPOSITORY, REPORT_REPOSITORY, SHELTER_REPOSITORY, USER_REPOSITORY, VETERINARIAN_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { MONITORING_REPOSITORY } from '../../domain/repositories/monitoring-repository.token';
import { ANIMALS_API_REPOSITORY } from '../../domain/repositories/animals-repository.token';
import { FEEDING_API_REPOSITORY } from '../../domain/repositories/feeding-repository.token';
import { VETERINARY_API_REPOSITORY } from '../../domain/repositories/veterinary-repository.token';
import { MockAlertRepository, MockAnimalRepository, MockDeviceRepository, MockFeedingRepository, MockReportRepository, MockShelterRepository, MockUserRepository, MockVeterinarianRepository } from './mock.repositories';
import { HttpMonitoringRepository } from './http-monitoring.repository';
import { HttpAnimalsRepository } from './http-animals.repository';
import { HttpFeedingRepository } from './http-feeding.repository';
import { HttpVeterinaryRepository } from './http-veterinary.repository';
import { HttpShelterRepository } from './http-shelter.repository';
import { HttpUserRepository } from './http-user.repository';
import { HttpAnimalRepository } from './http-animal.repository';

/**
 * repositoryProviders
 *
 * Registers all repository implementations as Angular providers.
 *
 * ─ Mock repositories are used for legacy feature pages (devices, alerts, etc.)
 *   that have not yet been connected to the real backend.
 * ─ The following bounded contexts use real HTTP repositories:
 *     • Monitoring  → HttpMonitoringRepository  (/api/monitoring/*)
 *     • Animals     → HttpAnimalsRepository     (/api/animals/*)
 *     • Feeding     → HttpFeedingRepository     (/api/feeding/plans/*)
 *     • Veterinary  → HttpVeterinaryRepository  (/api/veterinary/*)
 *     • Shelter     → HttpShelterRepository     (/api/monitoring/shelter and /api/monitoring/zones)
 *     • Users/Auth  → HttpUserRepository        (/api/v1/authentication/*)
 */
export const repositoryProviders: Provider[] = [
  // ── Mock repositories (legacy features not yet on real backend) ──────────
  MockAnimalRepository,
  MockShelterRepository,
  MockDeviceRepository,
  MockAlertRepository,
  MockFeedingRepository,
  MockVeterinarianRepository,
  MockUserRepository,
  MockReportRepository,
  HttpAnimalRepository,
  { provide: ANIMAL_REPOSITORY, useExisting: HttpAnimalRepository },
  { provide: SHELTER_REPOSITORY, useExisting: HttpShelterRepository },
  { provide: DEVICE_REPOSITORY, useExisting: MockDeviceRepository },
  { provide: ALERT_REPOSITORY, useExisting: MockAlertRepository },
  { provide: FEEDING_REPOSITORY, useExisting: MockFeedingRepository },
  { provide: VETERINARIAN_REPOSITORY, useExisting: MockVeterinarianRepository },
  { provide: USER_REPOSITORY, useExisting: HttpUserRepository },
  { provide: REPORT_REPOSITORY, useExisting: MockReportRepository },

  // ── HTTP repositories — real Spring Boot backend ─────────────────────────

  // Monitoring BC (/api/monitoring/*)
  HttpMonitoringRepository,
  { provide: MONITORING_REPOSITORY, useExisting: HttpMonitoringRepository },

  // Animals BC (/api/animals/*)
  HttpAnimalsRepository,
  { provide: ANIMALS_API_REPOSITORY, useExisting: HttpAnimalsRepository },

  // Feeding BC (/api/feeding/plans/*)
  HttpFeedingRepository,
  { provide: FEEDING_API_REPOSITORY, useExisting: HttpFeedingRepository },

  // Veterinary BC (/api/veterinary/*)
  HttpVeterinaryRepository,
  { provide: VETERINARY_API_REPOSITORY, useExisting: HttpVeterinaryRepository },

  // Shelter settings & zones
  HttpShelterRepository,

  // Users & Auth
  HttpUserRepository,
];

