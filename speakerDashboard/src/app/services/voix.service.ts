import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface Voix2Response {
  uuid: string;
  code: string;
  speakerUuid: string;
  nombrePoint: number;
  gender: string;
  language: string;
  type: string;
  typeVoice: string;
  name: string;
  price: number;
  elevenlabs_id: string;
}
@Injectable({
  providedIn: 'root'
})
export class VoixService {

  private apiUrl = 'http://localhost:8080/api/voix2';

  constructor(private http: HttpClient) {}

  getAllVoicesBySpeaker(speakerUuid: string): Observable<Voix2Response[]> {
    return this.http.get<Voix2Response[]>(`${this.apiUrl}/speaker-voice/${speakerUuid}`);
  }
}
