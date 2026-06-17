import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { User } from '../../domain/models/bluepatitas.models';
import { UserRepository } from '../../domain/repositories/repository.tokens';
import { environment } from '../../../../environments/environment';

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

  constructor(private readonly http: HttpClient) {
    const base = environment.apiBaseUrl.replace(/\/$/, '');
    this.authUrl = `${base}/api/v1/authentication`;
    this.usersUrl = `${base}/api/v1/users`;
  }

  async getUsers(): Promise<User[]> {
    try {
      const response = await firstValueFrom(this.http.get<any[]>(this.usersUrl));
      return (response || []).map(u => ({
        id: String(u.id),
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email.split('@')[0],
        role: u.roles && u.roles.includes('ROLE_SHELTER_ADMIN') ? 'Administrator' : 'Caretaker',
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
        role: 'Administrator',
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
        const user: User = {
          id: String(response.id),
          name: `${response.firstName || ''} ${response.lastName || ''}`.trim() || response.email.split('@')[0],
          role: 'Administrator',
          email: response.email,
          status: 'Active'
        };
        return {
          token: response.token,
          user
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to login', error);
      return null;
    }
  }
}
