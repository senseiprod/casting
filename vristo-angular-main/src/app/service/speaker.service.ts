import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SpeakerService {
  private apiUrl = `${environment.apiUrl}/api/speakers`; // Adjust the URL to your backend

  constructor(private http: HttpClient) { }

  getSpeakers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getSpeakerByUuid(uuid: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/speakers/${uuid}`);
  }
}
