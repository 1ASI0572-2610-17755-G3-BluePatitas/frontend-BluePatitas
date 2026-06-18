import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthSession, SignInRequest } from '../../domain/models/auth.models';

const API_BASE_URL = 'http://localhost:8080';

@Injectable()
export class HttpAuthRepository {
  constructor(private readonly http: HttpClient) {}

  signIn(credentials: SignInRequest): Promise<AuthSession> {
    return firstValueFrom(this.http.post<AuthSession>(`${API_BASE_URL}/api/v1/authentication/sign-in`, credentials));
  }
}
