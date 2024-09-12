import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: "root" })
export class PrdService {
  constructor(private readonly http: HttpClient) {}

  create_prd(): Observable<string> {
    return this.http
      //.post<string>("/prd", { title: "test", detail: "test" })
      .post<string>("/chat", 
        {
          "messages": [
            {
              "content": "string",
              "role": "user"
            }
          ],
          "stream": true
        })
      .pipe(map((data) => data),);
  }


}
