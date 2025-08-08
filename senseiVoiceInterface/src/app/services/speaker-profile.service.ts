import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SpeakerProfileResponse } from '../models/speaker-profile.model';

@Injectable({
  providedIn: 'root'
})
export class SpeakerProfileService {
  private baseUrl = 'http://localhost:8080/api/speaker-profiles';

  constructor(private http: HttpClient) {}

  getSpeakerProfile(uuid: string): Observable<SpeakerProfileResponse> {
    return this.http.get<SpeakerProfileResponse>(`${this.baseUrl}/${uuid}`);
  }

  getSpeakerProfileWithStatistics(uuid: string): Observable<SpeakerProfileResponse> {
    return this.http.get<SpeakerProfileResponse>(`${this.baseUrl}/${uuid}/detailed`);
  }

  initializeSpeakerWithDarija(uuid: string): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/${uuid}/initialize-darija`, {});
  }

  getSpeakerCompletionStatus(uuid: string): Observable<string> {
    return this.http.get<string>(`${this.baseUrl}/${uuid}/completion-status`);
  }

  getSpeakerStatistics(uuid: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${uuid}/statistics`);
  }

  isSpeakerProfileComplete(uuid: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/${uuid}/is-complete`);
  }

  getSpeakerLanguages(uuid: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${uuid}/languages`);
  }

  getSpeakerAudios(uuid: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${uuid}/audios`);
  }

  getSpeakerVoices(uuid: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${uuid}/voices`);
  }
}
