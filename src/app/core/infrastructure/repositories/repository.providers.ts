import { Provider } from '@angular/core';
import { ALERT_REPOSITORY, ANIMAL_REPOSITORY, DEVICE_REPOSITORY, FEEDING_REPOSITORY, REPORT_REPOSITORY, SHELTER_REPOSITORY, USER_REPOSITORY, VETERINARIAN_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { MockAlertRepository, MockAnimalRepository, MockDeviceRepository, MockFeedingRepository, MockReportRepository, MockShelterRepository, MockUserRepository, MockVeterinarianRepository } from './mock.repositories';

export const repositoryProviders: Provider[] = [
  MockAnimalRepository,
  MockShelterRepository,
  MockDeviceRepository,
  MockAlertRepository,
  MockFeedingRepository,
  MockVeterinarianRepository,
  MockUserRepository,
  MockReportRepository,
  { provide: ANIMAL_REPOSITORY, useExisting: MockAnimalRepository },
  { provide: SHELTER_REPOSITORY, useExisting: MockShelterRepository },
  { provide: DEVICE_REPOSITORY, useExisting: MockDeviceRepository },
  { provide: ALERT_REPOSITORY, useExisting: MockAlertRepository },
  { provide: FEEDING_REPOSITORY, useExisting: MockFeedingRepository },
  { provide: VETERINARIAN_REPOSITORY, useExisting: MockVeterinarianRepository },
  { provide: USER_REPOSITORY, useExisting: MockUserRepository },
  { provide: REPORT_REPOSITORY, useExisting: MockReportRepository },
];
