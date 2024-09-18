import { Component, Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: "root" })
export class ChatComponent implements OnInit {
  messages: string[] = [];
  cancelGeneration: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.create_prd().subscribe({
        next:(data) => {
            this.handleStreamData(data)
        },
        error:(error) => {
            console.error('Stream Error:', error)
        }
    });
  }

  create_prd(): Observable<any> {
    return this.http.post<any>("/chat", {
      "messages": [
        {
          "content": "string",
          "role": "user"
        }
      ],
      "stream": true
    });
  }

  handleStreamData(data: any) {
    // Assuming `data` is a chunk of streamed data
    if (this.cancelGeneration) {
      // Handle cancellation logic if needed
      return;
    }

    // Example of handling the streamed data
    if (data && data.choices) {
      for (const choice of data.choices) {
        let delta = choice.delta?.content;

        if (delta !== undefined) {
          this.messages.push(delta);
          // Optionally update UI or perform other actions
          console.log('New Message:', delta);
        }
      }
    }
  }
}
