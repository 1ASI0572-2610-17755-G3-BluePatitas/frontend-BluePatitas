import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { User } from '../../domain/models/bluepatitas.models';
import { UserRepository } from '../../domain/repositories/repository.tokens';
import { environment } from '../../../../environments/environment';
import { normalizeRole } from '../../auth/session.service';

/**
 * HttpUserRepository
 *
 * Implements authentication and user actions communicating with the Spring Boot backend.
 */
@Injectable({
  providedIn: 'root'
})
export class HttpUserRepository implements UserRepository {

  private readonly authUrl: string;
  private readonly usersUrl: string;
  private readonly veterinaryUrl: string;

  constructor(private readonly http: HttpClient) {
    const base = environment.apiBaseUrl.replace(/\/$/, '');
    this.authUrl = `${base}/api/v1/authentication`;
    this.usersUrl = `${base}/api/v1/users`;
    this.veterinaryUrl = `${base}/api/veterinary`;
  }

  async getUsers(): Promise<User[]> {
    try {
      const response = await firstValueFrom(this.http.get<any[]>(this.usersUrl));
      return (response || []).map(u => ({
        id: String(u.id),
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email.split('@')[0],
        role: normalizeRole(this.extractRoles(u)),
        roles: this.extractRoles(u),
        firstName: u.firstName,
        lastName: u.lastName,
        shelterId: u.shelterId,
        shelterName: u.shelterName,
        email: u.email,
        status: 'Active'
      }));
    } catch (error) {
      console.warn('Failed to fetch users, returning empty list', error);
      return [];
    }
  }

  async createUser(user: Omit<User, 'id'> & { password?: string }): Promise<User> {
    try {
      const parts = user.name.split(' ');
      const firstName = parts[0] || 'Admin';
      const lastName = parts.slice(1).join(' ') || 'User';

      const payload = {
        firstName,
        lastName,
        email: user.email,
        phoneNumber: '+51 999 888 777',
        password: user.password || 'password123',
        role: 'ROLE_SHELTER_ADMIN'
      };

      const response = await firstValueFrom(this.http.post<any>(`${this.authUrl}/sign-up`, payload));
      return {
        id: String(response.id),
        name: `${response.firstName || ''} ${response.lastName || ''}`.trim(),
        role: normalizeRole(this.extractRoles(response)),
        roles: this.extractRoles(response),
        firstName: response.firstName,
        lastName: response.lastName,
        shelterId: response.shelterId,
        shelterName: response.shelterName,
        email: response.email,
        status: 'Active'
      };
    } catch (error) {
      console.error('Failed to create user/sign-up', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<{ token: string; user: User } | null> {
    try {
      const payload = { email, password };
      const response = await firstValueFrom(this.http.post<any>(`${this.authUrl}/sign-in`, payload));

      if (response && response.token) {
        return {
          token: response.token,
          user: this.mapAuthenticatedUser(response, email)
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to login', error);
      return null;
    }
  }

  async redeemVeterinarianCode(payload: { code: string; password: string }): Promise<{ token: string; user: User }> {
    const response = await firstValueFrom(
      this.http.post<any>(`${this.veterinaryUrl}/veterinarians/redeem-code`, payload)
    );

    if (!response?.token) {
      throw new Error('Redeem code response did not include a token');
    }

    return {
      token: response.token,
      user: this.mapAuthenticatedUser(response)
    };
  }

  private mapAuthenticatedUser(response: any, fallbackEmail = ''): User {
    const roles = this.extractRoles(response);
    const emailValue = response.email || fallbackEmail;
    const firstName = response.firstName || response.givenName || '';
    const lastName = response.lastName || response.familyName || '';

    return {
      id: String(response.id ?? response.userId ?? response.veterinarianId ?? ''),
      name: `${firstName} ${lastName}`.trim() || response.name || emailValue.split('@')[0],
      role: normalizeRole(roles),
      roles,
      firstName,
      lastName,
      shelterId: response.shelterId,
      shelterName: response.shelterName,
      email: emailValue,
      status: 'Active'
    };
  }

  private extractRoles(source: any): string[] {
    const collected: string[] = [];
    const append = (value: any) => {
      if (!value) {
        return;
      }
      if (Array.isArray(value)) {
        value.forEach(append);
        return;
      }
      if (typeof value === 'object') {
        append(value.authority ?? value.role ?? value.name);
        return;
      }
      collected.push(String(value));
    };

    append(source?.role);
    append(source?.roles);
    append(source?.authorities);

    return Array.from(new Set(collected));
  }
}
