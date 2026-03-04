import { inject, Injectable } from '@angular/core';
import { RequestService } from './request.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly request = inject(RequestService);
  private readonly endpoint = '/api/profile';
}
