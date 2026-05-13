import { Component, OnInit } from '@angular/core';
import { Device, Shelter, User } from '../../core/domain/models/bluepatitas.models';
import { GetDevicesUseCase, GetShelterSettingsUseCase, GetUsersUseCase } from '../../core/application/use-cases/bluepatitas.use-cases';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../shared/components/bp-button/bp-button.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { AccessRequestsModalComponent, AddIoTDeviceModalComponent, AddUserModalComponent, EditShelterDataModalComponent, EditUserModalComponent } from './components/settings-modals.component';

@Component({
  standalone: true,
  imports: [TranslatePipe, BpButtonComponent, StatusChipComponent, EditShelterDataModalComponent, AddUserModalComponent, EditUserModalComponent, AccessRequestsModalComponent, AddIoTDeviceModalComponent],
  template: `
    <div class="page-header">
      <div class="page-title">
        <h1>{{ 'settings.title' | translate }}</h1>
        <p>{{ 'settings.subtitle' | translate }}</p>
      </div>
    </div>

    <section class="settings-top">
      <article class="shelter-card surface-card">
        <header>
          <span class="card-icon"></span>
          <h2>{{ 'settings.shelterData' | translate }}</h2>
          <button type="button" (click)="shelterOpen = true">✎ {{ 'settings.editData' | translate }}</button>
        </header>
        <dl>
          <dt>{{ 'settings.legalName' | translate }}</dt><dd>{{ shelter?.name }}</dd>
          <dt>{{ 'settings.taxId' | translate }}</dt><dd>20123456789</dd>
          <dt>{{ 'settings.officialContact' | translate }}</dt><dd>{{ shelter?.email }}<br />{{ shelter?.phone }}</dd>
          <dt>{{ 'settings.mainAddress' | translate }}</dt><dd>{{ shelterAddress }}</dd>
        </dl>
      </article>

      <article class="devices-card surface-card">
        <header>
          <span class="card-icon device"></span>
          <h2>{{ 'settings.iotDevices' | translate }}</h2>
          <bp-button prefix="+" (clicked)="deviceOpen = true">{{ 'settings.addDevice' | translate }}</bp-button>
        </header>
        <div class="device-table">
          <div class="table-head"><span>{{ 'settings.type' | translate }}</span><span>{{ 'settings.modelId' | translate }}</span><span>{{ 'settings.assignment' | translate }}</span><span>{{ 'common.status' | translate }}</span><span>{{ 'common.actions' | translate }}</span></div>
          @for (device of devices; track device.id) {
            <article>
              <span>{{ device.type }}</span>
              <span>{{ device.id.toUpperCase() }}</span>
              <span>{{ device.zoneId }}</span>
              <bp-status-chip [status]="device.status" />
              <button type="button" aria-label="More actions">⋮</button>
            </article>
          }
        </div>
      </article>
    </section>

    <section class="users-card surface-card">
      <header>
        <span class="card-icon users"></span>
        <div>
          <h2>{{ 'settings.usersPermissions' | translate }}</h2>
          <p>{{ 'settings.usersDescription' | translate }}</p>
        </div>
        <div class="user-actions">
          <bp-button variant="secondary" (clicked)="requestsOpen = true">{{ 'settings.accessRequests' | translate }} <span class="badge">2</span></bp-button>
          <bp-button prefix="+" (clicked)="addUserOpen = true">{{ 'settings.addUser' | translate }}</bp-button>
        </div>
      </header>
      <div class="users-table">
        <div class="table-head"><span>{{ 'settings.user' | translate }}</span><span>{{ 'settings.role' | translate }}</span><span>{{ 'settings.lastAccess' | translate }}</span><span>{{ 'common.status' | translate }}</span><span>{{ 'common.actions' | translate }}</span></div>
        @for (user of users; track user.id) {
          <article>
            <div class="identity"><span class="avatar">{{ initials(user.name) }}</span><div><strong>{{ user.name }}</strong><small>{{ user.email }}</small></div></div>
            <span class="role">{{ user.role }}</span>
            <span>{{ user.id === 'user-1' ? '2 h ago' : user.id === 'user-2' ? 'Yesterday' : '3 days ago' }}</span>
            <bp-status-chip [status]="user.status" />
            <button type="button" (click)="userOpen = true" [attr.aria-label]="'common.edit' | translate">✎</button>
          </article>
        }
      </div>
    </section>

    <bp-edit-shelter-data-modal [open]="shelterOpen" (closed)="shelterOpen = false" />
    <bp-add-user-modal [open]="addUserOpen" (closed)="addUserOpen = false" />
    <bp-edit-user-modal [open]="userOpen" (closed)="userOpen = false" />
    <bp-access-requests-modal [open]="requestsOpen" (closed)="requestsOpen = false" />
    <bp-add-iot-device-modal [open]="deviceOpen" (closed)="deviceOpen = false" />
  `,
  styles: [`
    .settings-top { display: grid; grid-template-columns: .82fr 1.55fr; gap: 14px; margin-bottom: 18px; }
    .surface-card { padding: 20px; }
    header { display: flex; align-items: flex-start; gap: 14px; }
    h2 { margin: 0; font-size: 22px; line-height: 1.15; }
    .card-icon { width: 40px; height: 40px; border-radius: 7px; background: var(--bp-surface-blue); flex: 0 0 auto; position: relative; }
    .card-icon::before { content: ''; position: absolute; inset: 12px; border: 2px solid var(--bp-action-blue); border-radius: 3px; }
    .card-icon.device::before { border-radius: 50%; }
    .card-icon.users::before { border-radius: 50%; box-shadow: 10px 4px 0 -4px var(--bp-action-blue); }
    .shelter-card header button { margin-left: auto; border: 0; background: transparent; color: var(--bp-action-blue); font-weight: 800; cursor: pointer; }
    dl { display: grid; gap: 10px; margin: 22px 0 0; }
    dt { color: var(--bp-slate-gray); text-transform: uppercase; font-size: 11px; }
    dd { margin: -6px 0 6px; padding-bottom: 10px; border-bottom: 1px solid var(--bp-border); }
    .devices-card header, .users-card header { align-items: center; }
    .devices-card header bp-button, .user-actions { margin-left: auto; }
    .device-table, .users-table { margin-top: 18px; display: grid; }
    .table-head, .device-table article, .users-table article { display: grid; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--bp-border); }
    .device-table .table-head, .device-table article { grid-template-columns: 1fr 1fr 1.2fr 100px 52px; }
    .users-table .table-head, .users-table article { grid-template-columns: minmax(220px, 1.4fr) 1fr 1fr 110px 70px; }
    .table-head { color: var(--bp-slate-gray); font-size: 12px; }
    .device-table button, .users-table button { border: 0; background: transparent; font-size: 20px; color: #344454; cursor: pointer; }
    .users-card p { margin: 4px 0 0; color: var(--bp-slate-gray); font-size: 12px; }
    .user-actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: flex-end; }
    .badge { display: inline-grid; place-items: center; width: 18px; height: 18px; border-radius: 50%; background: var(--bp-critical); color: #fff; font-size: 11px; margin-left: 4px; }
    .identity { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .avatar { width: 30px; height: 30px; border-radius: 50%; background: var(--bp-action-blue); color: #fff; display: grid; place-items: center; font-size: 12px; font-weight: 800; flex: 0 0 auto; }
    strong, small { display: block; min-width: 0; overflow-wrap: anywhere; }
    small { color: var(--bp-slate-gray); font-size: 11px; }
    .role { justify-self: start; border-radius: 5px; padding: 5px 8px; background: #d8edf8; color: #315b76; font-size: 12px; }
    @media (max-width: 1120px) { .settings-top { grid-template-columns: 1fr; } }
    @media (max-width: 820px) {
      .devices-card .table-head, .users-card .table-head { display: none; }
      .device-table article, .users-table article { grid-template-columns: 1fr auto; }
      .device-table article > span, .users-table article > span, .users-table article bp-status-chip { grid-column: 1; }
      .device-table button, .users-table button { grid-column: 2; grid-row: 1; }
      .users-card header { display: grid; }
      .user-actions { margin-left: 0; justify-content: start; }
    }
  `],
})
export class SettingsPage implements OnInit {
  users: User[] = [];
  devices: Device[] = [];
  shelter?: Shelter;
  shelterAddress = '';
  shelterOpen = false;
  addUserOpen = false;
  userOpen = false;
  requestsOpen = false;
  deviceOpen = false;

  constructor(
    private readonly getUsers: GetUsersUseCase,
    private readonly getShelter: GetShelterSettingsUseCase,
    private readonly getDevices: GetDevicesUseCase,
  ) {}

  async ngOnInit(): Promise<void> {
    const [users, shelter, devices] = await Promise.all([this.getUsers.execute(), this.getShelter.execute(), this.getDevices.execute()]);
    this.users = users;
    this.shelter = shelter;
    this.devices = devices;
    this.shelterAddress = `${shelter.address}, ${shelter.city}, Peru`;
  }

  initials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }
}
