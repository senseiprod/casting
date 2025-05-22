import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlayHtService {
  private baseUrl = `${environment.apiUrl}/api/playht`;

  constructor(private http: HttpClient) {}

  // Synthèse vocale
  synthesizeSpeech(text: string, voice: string, language: string): Observable<Blob> {
    const params = new URLSearchParams();
    params.set('text', text);
    params.set('voice', voice);
    params.set('language', language);

    return this.http.post(`${this.baseUrl}/synthesize`, params.toString(), {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      }),
      responseType: 'blob' // Réponse sous forme de fichier audio
    });
  }

  // Récupérer les voix clonées
  getClonedVoices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/cloned-voices`);
  }

  // Récupérer les voix de Play.ht
  getVoices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/voices`);
  }

  // Cloner une voix à partir d'un fichier audio
  cloneVoiceFromFile(file: File, voiceName: string): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('voiceName', voiceName);

    return this.http.post(`${this.baseUrl}/clone-voice-from-file`, formData, {
      responseType: 'text'
    });
  }

  // Cloner une voix à partir d'une URL
  cloneVoiceFromUrl(fileUrl: string, voiceName: string): Observable<string> {
    const params = new URLSearchParams();
    params.set('file_url', fileUrl);
    params.set('voice_name', voiceName);

    return this.http.post(`${this.baseUrl}/clone-voice/url`, params.toString(), {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      }),
      responseType: 'text'
    });
  }

  // Supprimer une voix clonée
  deleteClonedVoice(voiceId: string): Observable<string> {
    return this.http.request<string>('DELETE', `${this.baseUrl}/clone-voice`, {
      body: { voice_id: voiceId },
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      responseType: 'text' as 'json'
    });
  }
}
