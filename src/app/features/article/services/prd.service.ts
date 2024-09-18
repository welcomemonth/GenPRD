import { Injectable } from "@angular/core";
import { Observable, from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders } from "@angular/common/http";

@Injectable({ providedIn: "root" })
export class PrdService {
  constructor(private readonly http: HttpClient) {}

  create_prd(title: string, detail: string): Observable<any> {
    return this.http
      //.post<string>("/prd", { title: "test", detail: "test" })
      .post<any>("/chat", 
        {
          "messages": [
            {
              "content": detail + "请帮我整理成markdown的格式",
              "role": "user"
            }
          ],
          "stream": false
        })
      .pipe(map((data) => data),);
  }

  /*create_prd(): Observable<any> {
    return this.http.post<any>("/chat", {
      "messages": [
        {
          "content": "string",
          "role": "user"
        }
      ],
      "stream": true
    }, { 
    observe: 'events',
    responseType: 'json' }).pipe(
      map(event => {
        if (event.type === HttpEventType.Response) {
          // 解析流式 JSON 数据
          const reader = new FileReader();
          reader.onload = () => {
            const json = JSON.parse(reader.result as string);
            console.log('Streamed JSON:', json);
          };
          reader.readAsText(new Blob([event.body as string]));
        }
        return event;
      })
    );
  }*/
}