import { Injectable, inject } from '@angular/core';
import { RequestService } from '@core/services';
import {
  ApiResponse,
  RaffleExecutionResultModel,
  RaffleModel,
  RaffleResultModel,
} from '@parking-system/libs';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class RaffleService {
  private readonly request = inject(RequestService);
  private readonly endpoint = '/api/raffle';

  loadAllRaffles(buildingId: string): Observable<ApiResponse<RaffleModel[]>> {
    return this.request.get<RaffleModel[]>(`${this.endpoint}/${buildingId}`);
  }

  loadHistory(
    buildingId: string,
  ): Observable<ApiResponse<RaffleResultModel[]>> {
    return this.request.get<RaffleResultModel[]>(
      `${this.endpoint}/${buildingId}/history`,
    );
  }

  loadNext(buildingId: string): Observable<ApiResponse<RaffleModel>> {
    return this.request.get<RaffleModel>(`${this.endpoint}/${buildingId}/next`);
  }

  executeRaffle(
    buildingId: string,
  ): Observable<ApiResponse<RaffleExecutionResultModel>> {
    return this.request.post<RaffleExecutionResultModel>(
      `${this.endpoint}/${buildingId}/execute`,
      {},
    );
  }
}
