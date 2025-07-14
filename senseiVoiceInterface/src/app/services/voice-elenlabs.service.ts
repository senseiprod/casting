
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Voix2Response {
  ageZone: string;
  avatar: string;
  originalVoiceUrl: string;
  uuid: string;
  code: string;
  speakerId: string;
  nombrePoint: number;
  gender: string;
  language: string;
  type: string;
  typeVoice: string;
  name: string;
  price: number;
  elevenlabs_id: string;
  previewUrl: string;

}

export interface Voix2Request {
  name: string;
  gender: string;
  language: string;
  price: number;
  removeBackgroundNoise: boolean;
  description: string;
  labels?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VoiceElenlabsService {
  private apiUrl = `${environment.apiUrl}/api/voix2`; // À adapter selon ton backend

  constructor(private http: HttpClient) {}

  createVoice(
    file: File,
    name: string,
    userId: string,
    gender: string,
    language: string,
    price: number,
    removeBackgroundNoise: boolean,
    description: string,
    labels?: string
  ): Observable<Voix2Response> {
    const formData = new FormData();
    formData.append('files', file);
    formData.append('name', name);
    formData.append('id', userId);
    formData.append('gender', gender);
    formData.append('language', language);
    formData.append('price', price.toString());
    formData.append('removeBackgroundNoise', String(removeBackgroundNoise));
    formData.append('description', description);
    if (labels) {
      formData.append('labels', labels);
    }

    return this.http.post<Voix2Response>(`${this.apiUrl}/create`, formData);
  }

  getVoiceById(id: string): Observable<Voix2Response> {
    return this.http.get<Voix2Response>(`${this.apiUrl}/${id}`);
  }

  getAllVoices(): Observable<Voix2Response[]> {
    return this.http.get<Voix2Response[]>(`${this.apiUrl}/all`);
  }

  getVoicesBySpeaker(speakerUuid: string): Observable<Voix2Response[]> {
    return this.http.get<Voix2Response[]>(`${this.apiUrl}/speaker-voice/${speakerUuid}`);
  }

  updateVoice(id: number, voixRequest: Voix2Request): Observable<Voix2Response> {
    return this.http.put<Voix2Response>(`${this.apiUrl}/update/${id}`, voixRequest);
  }

  deleteVoice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}
