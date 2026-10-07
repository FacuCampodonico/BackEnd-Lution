import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import type { Response } from 'express';
import { map, type Observable } from 'rxjs';

@Injectable()
export class JsonNullInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((value: unknown) => {
        if (value === null) {
          context
            .switchToHttp()
            .getResponse<Response>()
            .type('application/json');
          return 'null';
        }
        return value;
      }),
    );
  }
}
