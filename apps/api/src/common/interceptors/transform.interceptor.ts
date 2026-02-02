import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { ApiResponse } from "@org/shared-models";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const hasMeta = data && data.meta;
        const result = hasMeta ? data.data : data;
        const meta = hasMeta ? data.meta : undefined;

        return {
          data: result ?? (Array.isArray(result) ? [] : {}),
          meta,
          message: data?.message || "Request successful",
          statusCode: context.switchToHttp().getResponse().statusCode,
        };
      })
    );
  }
}
