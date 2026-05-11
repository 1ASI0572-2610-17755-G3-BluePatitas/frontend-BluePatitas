import { inject, Injectable } from '@angular/core';
import { ALERT_REPOSITORY, DEVICE_REPOSITORY, FEEDING_REPOSITORY, REPORT_REPOSITORY, SHELTER_REPOSITORY, USER_REPOSITORY, VETERINARIAN_REPOSITORY } from '../../domain/repositories/repository.tokens';

@Injectable({ providedIn: 'root' })
export class AssignDietUseCase {
  private readonly repository = inject(FEEDING_REPOSITORY);
  execute(animalId: string, planName: string) {
    return this.repository.assignDiet(animalId, planName);
  }
}

@Injectable({ providedIn: 'root' })
export class GetAlertsUseCase {
  private readonly repository = inject(ALERT_REPOSITORY);
  execute() {
    return this.repository.getAlerts();
  }
}

@Injectable({ providedIn: 'root' })
export class GetMonitoringZonesUseCase {
  private readonly repository = inject(SHELTER_REPOSITORY);
  execute() {
    return this.repository.getMonitoringZones();
  }
}

@Injectable({ providedIn: 'root' })
export class GetDevicesUseCase {
  private readonly repository = inject(DEVICE_REPOSITORY);
  execute() {
    return this.repository.getDevices();
  }
}

@Injectable({ providedIn: 'root' })
export class GetVeterinariansUseCase {
  private readonly repository = inject(VETERINARIAN_REPOSITORY);
  execute() {
    return this.repository.getVeterinarians();
  }
}

@Injectable({ providedIn: 'root' })
export class GetShelterSettingsUseCase {
  private readonly repository = inject(SHELTER_REPOSITORY);
  execute() {
    return this.repository.getShelterSettings();
  }
}

@Injectable({ providedIn: 'root' })
export class GetReportsUseCase {
  private readonly repository = inject(REPORT_REPOSITORY);
  execute(animalId?: string) {
    return animalId ? this.repository.getReportsByAnimal(animalId) : this.repository.getReports();
  }
}

@Injectable({ providedIn: 'root' })
export class GetUsersUseCase {
  private readonly repository = inject(USER_REPOSITORY);
  execute() {
    return this.repository.getUsers();
  }
}
