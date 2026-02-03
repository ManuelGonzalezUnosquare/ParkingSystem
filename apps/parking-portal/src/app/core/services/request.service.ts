import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { ApiResponse } from "@org/shared-models";

@Injectable({ providedIn: "root" })
export class RequestService {
  private readonly http = inject(HttpClient);

  get<T>(url: string): Observable<T> {
    return this.http.get<ApiResponse<T>>(url).pipe(map((res) => res.data));
  }

  post<T>(url: string, body: object): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(url, body)
      .pipe(map((res) => res.data));
  }

  put<T>(url: string, body: object): Observable<T> {
    return this.http
      .put<ApiResponse<T>>(url, body)
      .pipe(map((res) => res.data));
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(url).pipe(map((res) => res.data));
  }

  patch<T>(url: string, body: object): Observable<T> {
    return this.http
      .patch<ApiResponse<T>>(url, body)
      .pipe(map((res) => res.data));
  }
}
