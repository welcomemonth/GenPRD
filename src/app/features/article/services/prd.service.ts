import { Injectable } from "@angular/core";
import { Observable, Subject, catchError, tap, throwError } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import { chatStream, readStream } from "src/app/shared/services/gpt.service";

@Injectable({ providedIn: "root" })
export class PrdService {

  constructor(private http: HttpClient) {}

  create_prd(project_name: string, project_desc: string): Observable<string> {
    const subject = new Subject<string>();

    chatStream("/api/prd/generate", {
      project_name: project_name,
      project_desc: project_desc
    }).then(({ body, status }) => {
      if (body) {
        const reader = body.getReader();
        readStream(reader, status, subject).catch(error => subject.error(error));
      } else {
        subject.error("No response body");
      }
    }).catch(error => subject.error(error));
    return subject.asObservable();
  }

  sendDataToApi(content: string, all_content: string, rewrite_requirement: string): Observable<any> {
    const apiUrl = '/prd/rewrite';
    return this.http.post(apiUrl, 
      { "stream": false,
        "content": content,
        "all_content": all_content,
        "rewrite_requirement": rewrite_requirement }
      ).pipe(
        tap((response: any) => {
          console.log('数据已发送', response);
        }),
        catchError((error: any) => {
          console.log("Error:", error);
          return throwError(() => new Error('Something bad happened!'));
        })
      );
  }
}