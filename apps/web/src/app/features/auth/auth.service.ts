import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { RequestService } from '../../core/services';
import {
  ILogin,
  ApiResponse,
  SessionModel,
  UserModel,
  IResetPasswordRequest,
  IResetPasswordByCode,
} from '@parking-system/libs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly request = inject(RequestService);
  private readonly endpoint = '/api/auth';

  login(credentials: ILogin): Observable<ApiResponse<SessionModel>> {
    return this.request.post<SessionModel>(
      `${this.endpoint}/login`,
      credentials,
    );
  }
  getCurrentUser(): Observable<ApiResponse<UserModel>> {
    return this.request.get<UserModel>(`${this.endpoint}/me`);
  }

  requestResetPassword(
    payload: IResetPasswordRequest,
  ): Observable<ApiResponse<string>> {
    return this.request.post<string>(
      `${this.endpoint}/reset-password-request`,
      payload,
    );
  }

  resetPasswordConfirm(
    payload: IResetPasswordByCode,
  ): Observable<ApiResponse<SessionModel>> {
    return this.request.post<SessionModel>(
      `${this.endpoint}/reset-password-confirm`,
      payload,
    );
  }

  validateResetCode(code: string): Observable<ApiResponse<string>> {
    return this.request.post<string>(`${this.endpoint}/validate-reset-code/`, {
      code,
    });
  }
}
