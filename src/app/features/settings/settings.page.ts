import { Component, OnInit } from '@angular/core';
import { User } from '../../core/domain/models/bluepatitas.models';
import { GetShelterSettingsUseCase, GetUsersUseCase } from '../../core/application/use-cases/bluepatitas.use-cases';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../shared/components/bp-button/bp-button.component';
import { BpCardComponent } from '../../shared/components/bp-card/bp-card.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { AccessRequestsModalComponent, AddIoTDeviceModalComponent, AddUserModalComponent, EditShelterDataModalComponent, EditUserModalComponent } from './components/settings-modals.component';

@Component({
  standalone: true,
  imports: [TranslatePipe, BpButtonComponent, BpCardComponent, StatusChipComponent, EditShelterDataModalComponent, AddUserModalComponent, EditUserModalComponent, AccessRequestsModalComponent, AddIoTDeviceModalComponent],
  template: `
    <div class="page-header">
      <div class="page-title"><h1>{{ 'settings.title' | translate }}</h1><p>{{ 'settings.subtitle' | translate }}</p></div>
      <bp-button icon="settings" (clicked)="shelterOpen = true">{{ 'settings.editShelter' | translate }}</bp-button>
    </div>
    <section class="settings-grid">
      <bp-card [title]="'topbar.shelter' | translate">
        <p class="muted">{{ shelterAddress }}</p>
        <div class="actions"><bp-button variant="secondary" (clicked)="requestsOpen = true">{{ 'settings.accessRequests' | translate }}</bp-button><bp-button variant="secondary" (clicked)="deviceOpen = true">{{ 'settings.addDevice' | translate }}</bp-button></div>
      </bp-card>
      <bp-card [title]="'settings.addUser' | translate">
        <div class="users">
          @for (user of users; track user.id) {
            <article><div><strong>{{ user.name }}</strong><p>{{ user.role }} · {{ user.email }}</p></div><bp-status-chip [status]="user.status" /><bp-button variant="secondary" icon="edit" (clicked)="userOpen = true">{{ 'common.edit' | translate }}</bp-button></article>
          }
        </div>
        <bp-button icon="person_add" (clicked)="addUserOpen = true">{{ 'settings.addUser' | translate }}</bp-button>
      </bp-card>
    </section>
    <bp-edit-shelter-data-modal [open]="shelterOpen" (closed)="shelterOpen = false" />
    <bp-add-user-modal [open]="addUserOpen" (closed)="addUserOpen = false" />
    <bp-edit-user-modal [open]="userOpen" (closed)="userOpen = false" />
    <bp-access-requests-modal [open]="requestsOpen" (closed)="requestsOpen = false" />
    <bp-add-iot-device-modal [open]="deviceOpen" (closed)="deviceOpen = false" />
  `,
  styles: [`.settings-grid { display: grid; grid-template-columns: .8fr 1.2fr; gap: 20px; } .actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px; } .users { display: grid; gap: 12px; margin-bottom: 18px; } article { display: grid; grid-template-columns: 1fr auto auto; gap: 14px; align-items: center; border: 1px solid var(--bp-border); border-radius: 14px; padding: 14px; } p { margin: 4px 0 0; color: var(--bp-slate-gray); } @media (max-width: 1100px) { .settings-grid { grid-template-columns: 1fr; } }`],
})
export class SettingsPage implements OnInit {
  users: User[] = [];
  shelterAddress = '';
  shelterOpen = false;
  addUserOpen = false;
  userOpen = false;
  requestsOpen = false;
  deviceOpen = false;

  constructor(private readonly getUsers: GetUsersUseCase, private readonly getShelter: GetShelterSettingsUseCase) {}

  async ngOnInit(): Promise<void> {
    const [users, shelter] = await Promise.all([this.getUsers.execute(), this.getShelter.execute()]);
    this.users = users;
    this.shelterAddress = `${shelter.address}, ${shelter.city}`;
  }
}
