import { HttpInterceptorFn } from "@angular/common/http";
import { throwError } from "rxjs";
import { catchError } from "rxjs/operators";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401) {
         // 路由到登录页面
         window.location.href = "/";
      }
      return throwError(() => err.error);
    })
  );
};
