import { Injectable, signal } from '@angular/core';
import { AuthSession, BluePatitasRole } from '../domain/models/auth.models';

const SESSION_KEY = 'bluepatitas.session';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly sessionSignal = signal<AuthSession | null>(this.readStoredSession());

  readonly session = this.sessionSignal.asReadonly();

  get currentSession(): AuthSession | null {
    return this.sessionSignal();
  }

  get token(): string {
    return this.currentSession?.token ?? '';
  }

  setSession(session: AuthSession): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.sessionSignal.set(session);
  }

  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
    this.sessionSignal.set(null);
  }

  hasRole(role: BluePatitasRole): boolean {
    return this.currentSession?.roles.includes(role) || this.currentSession?.role === role;
  }

  dashboardPath(session = this.currentSession): string {
    if (session?.role === 'VETERINARIAN') {
      return '/veterinary/dashboard';
    }

    return '/dashboard';
  }

  roleLabel(session = this.currentSession): string {
    if (session?.role === 'VETERINARIAN') {
      return 'Veterinarian';
    }

    return 'Administrator';
  }

  fullName(session = this.currentSession): string {
    return [session?.firstName, session?.lastName].filter(Boolean).join(' ') || this.roleLabel(session);
  }

  private readStoredSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as AuthSession) : null;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  }
}
