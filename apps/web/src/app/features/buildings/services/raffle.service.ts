import { Injectable, inject } from '@angular/core';
import { RequestService } from '@core/services';
import { ApiResponse, RaffleModel } from '@parking-system/libs';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class RaffleService {
  private readonly request = inject(RequestService);
  private readonly endpoint = '/api/raffle';

  load(): Observable<ApiResponse<RaffleModel[]>> {
    return this.request.get<RaffleModel[]>(this.endpoint);
  }

  //TODO: MOVE THIS
  executeRaffle() {
    return this.request.post<boolean>('/api/raffle', {});
  }
}
