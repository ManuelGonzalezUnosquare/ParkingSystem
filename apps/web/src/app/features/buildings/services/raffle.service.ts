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

  load(id: string): Observable<ApiResponse<RaffleModel[]>> {
    return this.request.get<RaffleModel[]>(`${this.endpoint}/${id}`);
  }

  loadHistory(): Observable<ApiResponse<RaffleResultModel[]>> {
    return this.request.get<RaffleResultModel[]>(`${this.endpoint}/history`);
  }

  loadNext(): Observable<ApiResponse<RaffleModel>> {
    return this.request.get<RaffleModel>(`${this.endpoint}/next`);
  }

  //TODO: MOVE THIS
  executeRaffle(): Observable<ApiResponse<RaffleExecutionResultModel>> {
    return this.request.post<RaffleExecutionResultModel>(
      '/api/raffle/execute',
      {},
    );
  }
}
