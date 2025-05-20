import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AudioResponse {
  id: number;
  speakerUuid: string;
  format: string;
  audioFile: string; // Base64 string
}

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private apiUrl = 'http://localhost:8080/api/audios';

  constructor(private http: HttpClient) {}

  createAudio(speakerId: string, audioFile: File, format: string): Observable<AudioResponse> {
    const formData = new FormData();
    formData.append('speakerId', speakerId);
    formData.append('audioFile', audioFile);
    formData.append('format', format);

    return this.http.post<AudioResponse>(`${this.apiUrl}`, formData);
  }

  getAudioById(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${id}`, { responseType: 'blob' });
  }

    getAllAudiosBySpeaker(speakerId: string | null): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/speaker/${speakerId}`);
  }

  updateAudio(id: number, audioRequest: Partial<AudioResponse>): Observable<AudioResponse> {
    return this.http.put<AudioResponse>(`${this.apiUrl}/${id}`, audioRequest);
  }

  deleteAudio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}














