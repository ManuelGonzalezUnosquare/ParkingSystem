import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '@parking-system/libs';

@Injectable({ providedIn: 'root' })
export class RequestService {
  private readonly http = inject(HttpClient);

  get<T>(url: string): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(url).pipe(map((res) => res));
  }

  post<T>(url: string, body: object): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(url, body).pipe(map((res) => res));
  }

  put<T>(url: string, body: object): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(url, body).pipe(map((res) => res));
  }

  delete<T>(url: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(url).pipe(map((res) => res));
  }

  patch<T>(url: string, body: object): Observable<ApiResponse<T>> {
    return this.http.patch<ApiResponse<T>>(url, body).pipe(map((res) => res));
  }
}
