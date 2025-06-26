import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LahajatiService {
  private baseUrl = `${environment.apiUrl}/api/lahajati`;

  constructor(private http: HttpClient) {}

  generateSpeech(requestBody: any): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/absolute-control`, requestBody, {
      responseType: 'blob'
    });
  }

  getVoices(page?: number, perPage?: number, gender?: string): Observable<string> {
    let params = new HttpParams();
    if (perPage != null) params = params.set('per_page', perPage);
    if (gender) params = params.set('gender', gender);

    return this.http.get(`${this.baseUrl}/voices-absolute-control`, { params, responseType: 'text' });
  }

  getPerformanceStyles(page?: number, perPage?: number): Observable<string> {
    let params = new HttpParams();
    if (perPage != null) params = params.set('per_page', perPage);

    return this.http.get(`${this.baseUrl}/performance-absolute-control`, { params, responseType: 'text' });
  }

  getDialects(page?: number, perPage?: number): Observable<string> {
    let params = new HttpParams();
    if (perPage != null) params = params.set('per_page', perPage);

    return this.http.get(`${this.baseUrl}/dialect-absolute-control`, { params, responseType: 'text' });
  }

  textToSpeechPro(requestBody: any): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/text-to-speech-pro`, requestBody, {
      responseType: 'blob'
    });
  }

  speechToSpeechPro(audioFile: File, idVoice: string, professionalQuality: boolean = false): Observable<Blob> {
    const formData = new FormData();
    formData.append('audio_file', audioFile);
    formData.append('id_voice', idVoice);
    formData.append('professional_quality', professionalQuality ? '1' : '0');

    return this.http.post(`${this.baseUrl}/speech-to-speech-pro`, formData, {
      responseType: 'blob'
    });
  }

  getGeneralVoices(page?: number, perPage?: number, gender?: string): Observable<string> {
    let params = new HttpParams();
    if (page != null) params = params.set('page', page.toString());
    if (perPage != null) params = params.set('per_page', perPage.toString());
    if (gender) params = params.set('gender', gender);

    return this.http.get(`${this.baseUrl}/voices`, { params, responseType: 'text' });
  }

  createClonedVoice(voiceName: string, gender: string, voiceImage: File, audioFile: File, voiceTags: string): Observable<string> {
    const formData = new FormData();
    formData.append('voice_name', voiceName);
    formData.append('gender', gender);
    formData.append('voice_image', voiceImage);
    formData.append('audio_file', audioFile);
    formData.append('voice_tags', voiceTags);

    return this.http.post(`${this.baseUrl}/voices/cloned`, formData, { responseType: 'text' });
  }

  updateClonedVoice(voiceId: string, requestBody: any): Observable<string> {
    return this.http.put(`${this.baseUrl}/voices/cloned/${voiceId}`, requestBody, { responseType: 'text' });
  }

  deleteClonedVoice(voiceId: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}/voices/cloned/${voiceId}`, { responseType: 'text' });
  }
}
