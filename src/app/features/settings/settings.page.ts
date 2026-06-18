import { Component, OnInit } from '@angular/core';
import { Shelter, User } from '../../core/domain/models/bluepatitas.models';
import { GetShelterSettingsUseCase, GetUsersUseCase, UpdateShelterSettingsUseCase } from '../../core/application/use-cases/bluepatitas.use-cases';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../shared/components/bp-button/bp-button.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { AccessRequestsModalComponent, AddUserModalComponent, EditShelterDataModalComponent, EditUserModalComponent } from './components/settings-modals.component';

@Component({
  standalone: true,
  imports: [TranslatePipe, BpButtonComponent, StatusChipComponent, EditShelterDataModalComponent, AddUserModalComponent, EditUserModalComponent, AccessRequestsModalComponent],
  template: `
    <div class="page-header">
      <div class="page-title">
        <h1>{{ 'settings.title' | translate }}</h1>
        <p>{{ 'settings.subtitle' | translate }}</p>
      </div>
    </div>

    @if (hasShelter) {
      <article class="shelter-card surface-card">
        <header>
          <span class="card-icon"></span>
          <h2>{{ 'settings.shelterData' | translate }}</h2>
          <button type="button" (click)="shelterOpen = true"><span class="edit-icon"></span>{{ 'settings.editData' | translate }}</button>
        </header>
        <dl>
          <dt>{{ 'settings.legalName' | translate }}</dt><dd>{{ shelter?.name }}</dd>
          <dt>{{ 'settings.taxId' | translate }}</dt><dd>20123456789</dd>
          <dt>{{ 'settings.officialContact' | translate }}</dt><dd>{{ shelter?.email }}<br />{{ shelter?.phone }}</dd>
          <dt>{{ 'settings.mainAddress' | translate }}</dt><dd>{{ shelterAddress }}</dd>
        </dl>
      </article>
    } @else {
      <article class="create-shelter-card surface-card">
        <header>
          <span class="card-icon create"></span>
          <h2>Crear Refugio</h2>
        </header>
        <div class="create-shelter-content">
          <p>Aún no has registrado un refugio. Crea un refugio para comenzar a gestionar animales, zonas, dispositivos y personal.</p>
          <bp-button prefix="+" (clicked)="shelterOpen = true">Crear Refugio</bp-button>
        </div>
      </article>
    }

    <section class="users-card surface-card">
      @if (!hasShelter) {
        <div class="locked-overlay">
          <span class="lock-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--bp-slate-gray);"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </span>
          <p>Registra un refugio para administrar usuarios y permisos</p>
        </div>
      }
      <header>
        <span class="card-icon users"></span>
        <div>
          <h2>{{ 'settings.usersPermissions' | translate }}</h2>
          <p>{{ 'settings.usersDescription' | translate }}</p>
        </div>
        <div class="user-actions">
          <bp-button variant="secondary" (clicked)="requestsOpen = true" [disabled]="!hasShelter">{{ 'settings.accessRequests' | translate }}</bp-button>
          <bp-button prefix="+" (clicked)="addUserOpen = true" [disabled]="!hasShelter">{{ 'settings.addUser' | translate }}</bp-button>
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
            <button class="edit-action" type="button" (click)="userOpen = true" [attr.aria-label]="'common.edit' | translate" [disabled]="!hasShelter"><span></span></button>
          </article>
        }
      </div>
    </section>

    <bp-edit-shelter-data-modal [open]="shelterOpen" [shelter]="shelter" (closed)="shelterOpen = false" (saved)="onShelterSaved($event)" />
    <bp-add-user-modal [open]="addUserOpen" (closed)="addUserOpen = false" />
    <bp-edit-user-modal [open]="userOpen" (closed)="userOpen = false" />
    <bp-access-requests-modal [open]="requestsOpen" (closed)="requestsOpen = false" />
  `,
  styles: [`
    .surface-card { padding: 20px; position: relative; }
    .shelter-card, .create-shelter-card { margin-bottom: 18px; }
    header { display: flex; align-items: flex-start; gap: 14px; }
    h2 { margin: 0; font-size: 22px; line-height: 1.15; }
    .card-icon { width: 40px; height: 40px; border-radius: 7px; background: var(--bp-surface-blue); flex: 0 0 auto; position: relative; }
    .card-icon::before { content: ''; position: absolute; inset: 12px; border: 2px solid var(--bp-action-blue); border-radius: 3px; }
    .card-icon.users::before { border-radius: 50%; box-shadow: 10px 4px 0 -4px var(--bp-action-blue); }
    .shelter-card header button { margin-left: auto; display: inline-flex; align-items: center; gap: 7px; border: 0; background: transparent; color: var(--bp-action-blue); font-weight: 800; cursor: pointer; }
    .edit-icon { width: 14px; height: 14px; position: relative; color: currentColor; }
    .edit-icon::before { content: ''; position: absolute; left: 2px; top: 8px; width: 9px; height: 4px; border: 2px solid currentColor; border-top: 0; transform: rotate(-45deg); }
    .edit-icon::after { content: ''; position: absolute; left: 8px; top: 1px; width: 4px; height: 9px; border-radius: 2px; background: currentColor; transform: rotate(45deg); }
    dl { display: grid; gap: 10px; margin: 22px 0 0; }
    dt { color: var(--bp-slate-gray); text-transform: uppercase; font-size: 11px; }
    dd { margin: -6px 0 6px; padding-bottom: 10px; border-bottom: 1px solid var(--bp-border); }
    .users-card header { align-items: center; }
    .user-actions { margin-left: auto; }
    .users-table { margin-top: 18px; display: grid; }
    .table-head, .users-table article { display: grid; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--bp-border); }
    .users-table .table-head, .users-table article { grid-template-columns: minmax(220px, 1.4fr) 1fr 1fr 110px 70px; }
    .table-head { color: var(--bp-slate-gray); font-size: 12px; }
    .users-table button { width: 30px; height: 30px; display: grid; place-items: center; border: 0; border-radius: 50%; background: transparent; color: #344454; cursor: pointer; }
    .users-table button span { width: 16px; height: 16px; position: relative; color: currentColor; }
    .users-table button span::before, .users-table button span::after { content: ''; position: absolute; box-sizing: border-box; }
    .edit-action span::before { left: 3px; top: 9px; width: 10px; height: 4px; border: 2px solid currentColor; border-top: 0; transform: rotate(-45deg); }
    .edit-action span::after { left: 9px; top: 2px; width: 4px; height: 9px; border-radius: 2px; background: currentColor; transform: rotate(45deg); }
    .users-card p { margin: 4px 0 0; color: var(--bp-slate-gray); font-size: 12px; }
    .user-actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: flex-end; }
    .identity { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .avatar { width: 30px; height: 30px; border-radius: 50%; background: var(--bp-action-blue); color: #fff; display: grid; place-items: center; font-size: 12px; font-weight: 800; flex: 0 0 auto; }
    strong, small { display: block; min-width: 0; overflow-wrap: anywhere; }
    small { color: var(--bp-slate-gray); font-size: 11px; }
    .role { justify-self: start; border-radius: 5px; padding: 5px 8px; background: #d8edf8; color: #315b76; font-size: 12px; }
    @media (max-width: 820px) {
      .users-card .table-head { display: none; }
      .users-table article { grid-template-columns: 1fr auto; }
      .users-table article > span, .users-table article bp-status-chip { grid-column: 1; }
      .users-table button { grid-column: 2; grid-row: 1; }
      .users-card header { display: grid; }
      .user-actions { margin-left: 0; justify-content: start; }
    }

    /* Locked overlay & create shelter aesthetics */
    .locked-overlay { position: absolute; inset: 0; background: rgba(255, 255, 255, 0.78); backdrop-filter: blur(4px); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; z-index: 10; border-radius: 12px; text-align: center; padding: 20px; }
    .lock-icon { display: inline-flex; align-items: center; justify-content: center; }
    .locked-overlay p { margin: 0; font-weight: 700; color: var(--bp-slate-gray); font-size: 14px; }
    .create-shelter-card { display: flex; flex-direction: column; justify-content: space-between; }
    .create-shelter-content { margin-top: 15px; display: grid; gap: 14px; }
    .create-shelter-content p { margin: 0; color: var(--bp-slate-gray); font-size: 13px; line-height: 1.4; }
    .card-icon.create::before { border: 0; content: '+'; font-size: 24px; font-weight: 800; color: var(--bp-action-blue); display: grid; place-items: center; inset: 0; }
  `],
})
export class SettingsPage implements OnInit {
  users: User[] = [];
  shelter?: Shelter;
  hasShelter = false;
  shelterAddress = '';
  shelterOpen = false;
  addUserOpen = false;
  userOpen = false;
  requestsOpen = false;

  constructor(
    private readonly getUsers: GetUsersUseCase,
    private readonly getShelter: GetShelterSettingsUseCase,
    private readonly updateShelter: UpdateShelterSettingsUseCase,
  ) {}

  async ngOnInit(): Promise<void> {
    const [users, shelter] = await Promise.all([this.getUsers.execute(), this.getShelter.execute()]);
    this.users = users;
    this.updateShelterState(shelter);
  }

  updateShelterState(shelter: Shelter): void {
    this.shelter = shelter;
    this.hasShelter = !!shelter && !!shelter.name?.trim();
    if (this.hasShelter) {
      this.shelterAddress = `${shelter.address}, ${shelter.city || 'Lima'}, Peru`;
    } else {
      this.shelterAddress = '';
    }
  }

  async onShelterSaved(updated: Shelter): Promise<void> {
    const newShelter = await this.updateShelter.execute(updated);
    this.updateShelterState(newShelter);
  }

  initials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }
}
