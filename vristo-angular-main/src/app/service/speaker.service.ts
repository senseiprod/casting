import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpeakerService {
  private apiUrl = 'http://localhost:8080/api/speakers'; // Adjust the URL to your backend

  constructor(private http: HttpClient) { }

  getSpeakers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getSpeakerByUuid(uuid: string): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8080/api/speakers/${uuid}`);
  }
}
