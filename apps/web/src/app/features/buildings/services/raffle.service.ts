import { Injectable, inject } from '@angular/core';
import { RequestService } from '@core/services';
import {
  ApiResponse,
  RaffleExecutionResultModel,
  RaffleHistoryModel,
  RaffleModel,
  RaffleResultModel,
  Search,
  SearchRaffleResults,
} from '@parking-system/libs';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class RaffleService {
  private readonly request = inject(RequestService);
  private readonly endpoint = '/api/raffle';

  loadHistory(
    buildingId: string,
    dto: Search,
  ): Observable<ApiResponse<RaffleHistoryModel[]>> {
    return this.request.get<RaffleHistoryModel[]>(
      `${this.endpoint}/${buildingId}/history`,
      dto,
    );
  }

  loadNext(buildingId: string): Observable<ApiResponse<RaffleModel>> {
    return this.request.get<RaffleModel>(`${this.endpoint}/${buildingId}/next`);
  }

  loadById(raffleId: string): Observable<ApiResponse<RaffleModel>> {
    return this.request.get<RaffleModel>(`${this.endpoint}/${raffleId}`);
  }

  executeRaffle(
    buildingId: string,
  ): Observable<ApiResponse<RaffleExecutionResultModel>> {
    return this.request.post<RaffleExecutionResultModel>(
      `${this.endpoint}/${buildingId}/execute`,
      {},
    );
  }

  loadResults(filters: SearchRaffleResults) {
    return this.request.get<RaffleResultModel[]>(`api/results`, filters);
  }
}
