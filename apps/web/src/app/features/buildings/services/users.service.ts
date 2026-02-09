import { inject, Injectable } from '@angular/core';
import { RequestService } from '@core/services';
import {
  ApiResponse,
  ICreateUser,
  SearchBuildingUsers,
  UserModel,
} from '@parking-system/libs';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly request = inject(RequestService);
  private readonly endpoint = '/api/users';

  getAll(dto: SearchBuildingUsers): Observable<ApiResponse<UserModel[]>> {
    return this.request.get<UserModel[]>(this.endpoint, dto);
  }

  getById(id: string): Observable<ApiResponse<UserModel>> {
    return this.request.get<UserModel>(`${this.endpoint}/${id}`);
  }

  create(user: ICreateUser): Observable<ApiResponse<UserModel>> {
    return this.request.post<UserModel>(this.endpoint, user);
  }

  update(
    id: string,
    building: ICreateUser,
  ): Observable<ApiResponse<UserModel>> {
    return this.request.patch<UserModel>(`${this.endpoint}/${id}`, building);
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.request.delete<boolean>(`${this.endpoint}/${id}`);
  }
}
