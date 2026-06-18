import { inject, Injectable } from '@angular/core';
import { ALERT_REPOSITORY, DEVICE_REPOSITORY, FEEDING_REPOSITORY, REPORT_REPOSITORY, SHELTER_REPOSITORY, USER_REPOSITORY, VETERINARIAN_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { Veterinarian, User, Shelter, MonitoringZone } from '../../domain/models/bluepatitas.models';

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
export class CreateVeterinarianUseCase {
  private readonly repository = inject(VETERINARIAN_REPOSITORY);
  execute(vet: Omit<Veterinarian, 'id'>) {
    return this.repository.createVeterinarian(vet);
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

@Injectable({ providedIn: 'root' })
export class CreateUserUseCase {
  private readonly repository = inject(USER_REPOSITORY);
  execute(user: Omit<User, 'id'>) {
    return this.repository.createUser(user);
  }
}

@Injectable({ providedIn: 'root' })
export class LoginUseCase {
  private readonly repository = inject(USER_REPOSITORY);
  execute(email: string, password: string) {
    return this.repository.login(email, password);
  }
}

@Injectable({ providedIn: 'root' })
export class UpdateShelterSettingsUseCase {
  private readonly repository = inject(SHELTER_REPOSITORY);
  execute(shelter: Shelter) {
    return this.repository.updateShelterSettings(shelter);
  }
}

@Injectable({ providedIn: 'root' })
export class GetFeedingPlansUseCase {
  private readonly repository = inject(FEEDING_REPOSITORY);
  execute() {
    return this.repository.getPlans();
  }
}

@Injectable({ providedIn: 'root' })
export class GetFeedingEventsUseCase {
  private readonly repository = inject(FEEDING_REPOSITORY);
  execute() {
    return this.repository.getEvents();
  }
}

@Injectable({ providedIn: 'root' })
export class CreateMonitoringZoneUseCase {
  private readonly repository = inject(SHELTER_REPOSITORY);
  execute(zone: Omit<MonitoringZone, 'id'>) {
    return this.repository.createMonitoringZone(zone);
  }
}

@Injectable({ providedIn: 'root' })
export class UpdateMonitoringZoneUseCase {
  private readonly repository = inject(SHELTER_REPOSITORY);
  execute(id: string, zone: Omit<MonitoringZone, 'id'>) {
    return this.repository.updateMonitoringZone(id, zone);
  }
}

@Injectable({ providedIn: 'root' })
export class DeleteMonitoringZoneUseCase {
  private readonly repository = inject(SHELTER_REPOSITORY);
  execute(id: string) {
    return this.repository.deleteMonitoringZone(id);
  }
}

@Injectable({ providedIn: 'root' })
export class UpdateVeterinarianUseCase {
  private readonly repository = inject(VETERINARIAN_REPOSITORY);
  execute(vet: Veterinarian) {
    return this.repository.updateVeterinarian(vet);
  }
}

@Injectable({ providedIn: 'root' })
export class DeleteVeterinarianUseCase {
  private readonly repository = inject(VETERINARIAN_REPOSITORY);
  execute(id: string) {
    return this.repository.deleteVeterinarian(id);
  }
}


