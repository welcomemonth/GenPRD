import { Injectable } from "@angular/core";
import { Observable, Subject } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import { chatStream, readStream } from "src/app/shared/services/gpt.service";

@Injectable({ providedIn: "root" })
export class PrdService {
  
  constructor() {}

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
}