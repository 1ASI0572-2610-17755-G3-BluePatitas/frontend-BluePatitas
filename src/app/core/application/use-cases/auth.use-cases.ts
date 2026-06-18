import { Injectable } from '@angular/core';
import { AuthSession, SignInRequest } from '../../domain/models/auth.models';
import { HttpAuthRepository } from '../../infrastructure/repositories/http-auth.repository';

@Injectable({ providedIn: 'root' })
export class SignInUseCase {
  constructor(private readonly repository: HttpAuthRepository) {}

  execute(credentials: SignInRequest): Promise<AuthSession> {
    return this.repository.signIn(credentials);
  }
}
