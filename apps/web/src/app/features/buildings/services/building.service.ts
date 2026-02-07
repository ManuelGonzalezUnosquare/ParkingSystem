import { Injectable, inject } from '@angular/core';
import {
  ApiResponse,
  BuildingModel,
  ICreateBuilding,
  Search,
} from '@parking-system/libs';
import { Observable } from 'rxjs';
import { RequestService } from '../../../core/services';

@Injectable({
  providedIn: 'root',
})
export class BuildingService {
  private readonly request = inject(RequestService);
  private readonly endpoint = '/api/buildings';

  getAll(dto: Search): Observable<ApiResponse<BuildingModel[]>> {
    return this.request.get<BuildingModel[]>(this.endpoint, dto);
  }

  getById(id: string): Observable<ApiResponse<BuildingModel>> {
    return this.request.get<BuildingModel>(`${this.endpoint}/${id}`);
  }

  create(
    building: Partial<ICreateBuilding>,
  ): Observable<ApiResponse<BuildingModel>> {
    return this.request.post<BuildingModel>(this.endpoint, building);
  }

  update(
    id: string,
    building: ICreateBuilding,
  ): Observable<ApiResponse<BuildingModel>> {
    return this.request.patch<BuildingModel>(
      `${this.endpoint}/${id}`,
      building,
    );
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.request.delete<boolean>(`${this.endpoint}/${id}`);
  }
}
