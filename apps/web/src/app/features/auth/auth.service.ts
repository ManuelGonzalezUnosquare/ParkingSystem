import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { RequestService } from '../../core/services';
import {
  ILogin,
  ApiResponse,
  SessionModel,
  UserModel,
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
}
