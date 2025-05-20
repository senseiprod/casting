import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AudioResponse {
  id: number;
  speakerUuid: string;
  audioFile: Uint8Array;
  format: string;
  typeAudio: string;
  // Add other fields as needed
}

export interface AudioRequest {
  speakerUuid: string;
  audioFile: File;
  format: string;
  typeAudio: string;
}
export enum TypeAudio {
  ORIGINAL = "ORIGINAL",
  GENERATED = "GENERATED",
  GENERATEDPREMIUM = "GENERATEDPREMIUM"
}

export interface ResponseAudio {
  audioFile: Uint8Array
  typeAudio: TypeAudio
}
@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private apiUrl = 'http://localhost:8080/api/audios'; // Change base URL if needed

  constructor(private http: HttpClient) {}

  getAllAudios(): Observable<AudioResponse[]> {
    return this.http.get<AudioResponse[]>(`${this.apiUrl}/all`);
  }

  createAudio(audioRequest: AudioRequest): Observable<AudioResponse> {
    const formData = new FormData();
    formData.append('speakerId', audioRequest.speakerUuid);
    formData.append('audioFile', audioRequest.audioFile);
    formData.append('format', audioRequest.audioFile.type); // optional if handled by backend
    formData.append('type', audioRequest.typeAudio);

    return this.http.post<AudioResponse>(this.apiUrl, formData);
  }

  downloadAudio(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${id}`, {
      responseType: 'blob'
    });
  }

  getAllAudiosBySpeaker(speakerId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/speaker/${speakerId}`);
  }

  updateAudio(id: number, audioRequest: AudioRequest): Observable<AudioResponse> {
    const body = {
      speakerUuid: audioRequest.speakerUuid,
      format: audioRequest.format,
      typeAudio: audioRequest.typeAudio,
      // Note: This won't include the actual file unless you encode it, consider using FormData if needed
    };
    return this.http.put<AudioResponse>(`${this.apiUrl}/${id}`, body);
  }

  deleteAudio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAudioFile(audioId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/audio/${audioId}`, {
      responseType: 'blob'
    });
  }
}
