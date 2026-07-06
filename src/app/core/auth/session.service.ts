import { Injectable } from '@angular/core';
import { User } from '../domain/models/bluepatitas.models';

export type NormalizedRole = 'SHELTER_ADMIN' | 'VETERINARIAN' | 'CARETAKER' | 'UNKNOWN';

export interface CurrentUser extends User {
  role: NormalizedRole;
  roles?: string[];
  shelterId?: string;
  shelterName?: string;
}

const ADMIN_ROLES = new Set(['ROLE_SHELTER_ADMIN', 'SHELTER_ADMIN', 'ADMIN', 'ADMINISTRATOR']);
const VETERINARIAN_ROLES = new Set(['ROLE_VETERINARIAN', 'VETERINARIAN', 'VET']);
const CARETAKER_ROLES = new Set(['ROLE_CARETAKER', 'CARETAKER']);

export function normalizeRole(input: unknown): NormalizedRole {
  const values = Array.isArray(input) ? input : [input];
  for (const raw of values) {
    const value = String(raw ?? '').trim().toUpperCase();
    if (ADMIN_ROLES.has(value)) {
      return 'SHELTER_ADMIN';
    }
    if (VETERINARIAN_ROLES.has(value)) {
      return 'VETERINARIAN';
    }
    if (CARETAKER_ROLES.has(value)) {
      return 'CARETAKER';
    }
  }
  return 'UNKNOWN';
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  getToken(): string | null {
    return this.storage()?.getItem('token') ?? null;
  }

  getCurrentUser(): CurrentUser | null {
    const raw = this.storage()?.getItem('currentUser');
    if (!raw) {
      return null;
    }

    try {
      const user = JSON.parse(raw) as CurrentUser;
      const role = normalizeRole([user.role, ...(user.roles ?? [])]);
      return { ...user, role };
    } catch {
      return null;
    }
  }

  saveSession(token: string, user: User): void {
    const storage = this.storage();
    if (!storage) {
      return;
    }

    const role = normalizeRole([user.role, ...(user.roles ?? [])]);
    storage.setItem('token', token);
    storage.setItem('currentUser', JSON.stringify({ ...user, role }));
  }

  clearSession(): void {
    const storage = this.storage();
    if (!storage) {
      return;
    }

    storage.removeItem('token');
    storage.removeItem('currentUser');
    storage.removeItem('fcmToken');
  }

  isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'SHELTER_ADMIN';
  }

  isVeterinarian(): boolean {
    return this.getCurrentUser()?.role === 'VETERINARIAN';
  }

  private storage(): Storage | null {
    return typeof window !== 'undefined' ? window.localStorage : null;
  }
}
