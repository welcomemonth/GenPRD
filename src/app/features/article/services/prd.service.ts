import { Injectable } from "@angular/core";
import { Observable, from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders } from "@angular/common/http";
import { chat } from "src/app/shared/services/gpt.service";

@Injectable({ providedIn: "root" })
export class PrdService {
  constructor(private readonly http: HttpClient) {}

  private readStream = async (
    reader: ReadableStreamDefaultReader<Uint8Array>,
    status: number
  ) => {
    let partialLine = "";
  
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const { value, done } = await reader.read();
      if (done) break;
      const decoder = new TextDecoder("utf-8");
      const decodedText = decoder.decode(value, { stream: true });
  
      if (status !== 200) {
        const json = JSON.parse(decodedText); // start with "data: "
        const content = json.error.message ?? decodedText;
        // appendLastMessageContent(content);
        console.log("!=200: ",content);
        return;
      }
  
      const chunk = partialLine + decodedText;
      const newLines = chunk.split(/\r?\n/);
  
      partialLine = newLines.pop() ?? "";
  
      for (const line of newLines) {
        // console.log(line);
        if (line.length === 0) continue; // ignore empty message
        if (line.startsWith(":")) continue; // ignore sse comment message
        if (line === "data: [DONE]") return; //
        try {
          const json = JSON.parse(line);  //个人后端接口解析没有'data:' 
          const content =
          status === 200
            ? json.choices[0].delta.content ?? ""
            : json.error.message;
        // appendLastMessageContent(content);
        console.log(content);
        } catch (error) {
          const json = JSON.parse(line.substring(6)); // start with "data: "
          const content =
          status === 200
            ? json.choices[0].delta.content ?? ""
            : json.error.message;
          // appendLastMessageContent(content);
          console.log(content);
        }
      }
    }
  };

  async create_prd() {
      const { body, status } = await chat([{
        "content": "讲个笑话",
        "role": "user"
      }]);
      if (body) {
        const reader = body.getReader();
        await this.readStream(reader, status);
      }
  }
}