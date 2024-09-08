import { HttpInterceptorFn } from "@angular/common/http";

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  // const apiReq = req.clone({ url: `https://api.realworld.io/api${req.url}` });
  const apiReq = req.clone({ url: `http://192.168.0.102:8000/api${req.url}` });
  return next(apiReq);
};
