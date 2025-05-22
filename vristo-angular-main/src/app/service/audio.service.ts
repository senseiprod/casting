import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';


export enum TypeAudio {
    ORIGINAL = 'ORIGINAL',
    GENERATED = 'GENERATED'
  }

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  constructor(private http: HttpClient) {}


  getAllAudios(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/audios/all`).pipe(
      map(audios => audios.map(audio => ({
        ...audio,
        fileUrl: `data:audio/mp3;base64,${audio.audioFile}` // Convert Base64 if needed
      })))
    );
  }


  // Get all speakers
  getSpeakers(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8080/api/speakers`);
  }

  // Search for speakers by name
  searchSpeakersByName(name: string): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/api/speakers/search/${name}`);
  }

  // Upload the audio file
  uploadAudio(file: File, voiceName: string, speakerId: string): Observable<any> {
    const formData = new FormData();
    formData.append('audioFile', file);
    formData.append('format', voiceName);
    formData.append('speakerId', speakerId.toString());
    formData.append('type', 'ORIGINAL');


    return this.http.post<any>(`http://localhost:8080/api/audios`, formData);
  }

  // Upload generated audio file
  uploadGeneratedAudio(file: File, voiceName: string, speakerId: string): Observable<any> {

    const formData = new FormData();
    formData.append('audioFile', file);
    formData.append('format', voiceName);
    formData.append('speakerId', speakerId.toString());
    formData.append('type', 'GENERATED');


    return this.http.post<any>(`http://localhost:8080/api/audios`, formData);
  }

   // Generic upload method with type parameter

}

