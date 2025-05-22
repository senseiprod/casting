import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface VoixResponse {
  uuid: string;
  code: string;
  speakerUuid: string;
  nombrePoint: number;
  gender: string;
  language: string;
  type: string;
  name: string;
  price: number;
  url: UrlInfo;
}

export interface UrlInfo {
  id: string;
  name: string;
  type: string;
  voice_engine: string;
}

export interface VoixRequest {
  name: string;
  gender: string;
  language: string;
  price: string;
}

@Injectable({
  providedIn: 'root'
})
export class VoixService {
  private apiUrl = `${environment.apiUrl}/api/voix`;

  constructor(private http: HttpClient) {}

  createVoice(file: File, voiceName: string, userId: number): Observable<VoixResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('voiceName', voiceName);
    formData.append('id', userId.toString());
    return this.http.post<VoixResponse>(`${this.apiUrl}/create`, formData);
  }

  getVoicesBySpeaker(uuid: string | null): Observable<VoixResponse[]> {
    return this.http.get<VoixResponse[]>(`${this.apiUrl}/speaker-voice/${uuid}`);
  }
  getVoiceById(id: string): Observable<VoixResponse> {
    return this.http.get<VoixResponse>(`${this.apiUrl}/${id}`);
  }

  getAllVoices(): Observable<VoixResponse[]> {
    return this.http.get<VoixResponse[]>(`${this.apiUrl}/all`);
  }

  updateVoice(id: number, voixRequest: VoixRequest): Observable<VoixResponse> {
    return this.http.put<VoixResponse>(`${this.apiUrl}/update/${id}`, voixRequest);
  }

  deleteVoice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}
