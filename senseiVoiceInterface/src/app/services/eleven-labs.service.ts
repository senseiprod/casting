import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface Voice {
  id: string;
  name: string;
  gender: string;
  ageZone: string;
  type: string;
  language: string;
  avatar: string;
  price : number ;
  originalVoiceUrl: string;
  clonedVoiceUrl: string;

}
@Injectable({ providedIn: 'root' })
export class ElevenLabsService {
  private baseUrl = `${environment.apiUrl}/api/elevenlabs`; // Remplace avec l'URL réelle de ton backend

  constructor(private http: HttpClient) {}

  /** Ajouter une voix **/
  addVoice(name: string, files: File[], removeBackgroundNoise = false, description?: string, labels?: string): Observable<any> {
    const formData = new FormData();
    formData.append('name', name);
    files.forEach(file => formData.append('files', file));
    formData.append('remove_background_noise', String(removeBackgroundNoise));
    if (description) formData.append('description', description);
    if (labels) formData.append('labels', labels);

    return this.http.post<any>(`${this.baseUrl}/voices/add`, formData);
  }

  /** Convertir du texte en audio **/
  textToSpeech(voiceId: string, text: string, outputFormat = 'mp3_44100_128', enableLogging = true, optimizeStreamingLatency?: number): Observable<Blob> {
    const body = { text ,"model_id": "eleven_multilingual_v2"};
    const params: any = {
      output_format: outputFormat,
      enable_logging: enableLogging
    };
    if (optimizeStreamingLatency !== undefined) {
      params.optimize_streaming_latency = optimizeStreamingLatency;
    }

    return this.http.post(`${this.baseUrl}/text-to-speech/${voiceId}`, body, {
      params,
      responseType: 'blob' // Pour récupérer un fichier audio
    });
  }

  /** Supprimer une voix **/
  deleteVoice(voiceId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/voices/${voiceId}`);
  }

  /** Lister les voix disponibles **/
  listVoices(params: any = {}): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/voices`, { params });
  }
  listVoicesFiltter( pageSize: number = 100,
    gender: string | null = null,
    age: string | null = null,
    language: string | null = null,
    nextPageToken: number = 1,
  ): Observable<Voice[]> {
    let params = new HttpParams()
    .set('page_size', pageSize.toString());
    if (gender) params = params.set('gender', gender);
    if (age) params = params.set('age', age);
    if (language) params = params.set('language', language);
    if (nextPageToken) params = params.set('nextPageToken', nextPageToken);

    return this.http.get<any>(`${this.baseUrl}/shared-voices`, { params }).pipe(
      map(response => {
        console.log(response);
        if (!response || !Array.isArray(response.voices)) {
          console.error("Réponse invalide :", response);
          return [];
        }
  
        return response.voices.map((voice: any) => {
          let avatarUrl = '';
        
          if (voice.gender === 'male') {
            avatarUrl = 'assets/img/avatar men.png';
          } else if (voice.gender === 'female') {
            avatarUrl = 'assets/img/avatar women.png';
          } else {
            avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${voice.name}`;
          }
        
          return {
            id: voice.voice_id,
            name: voice.name || 'Inconnu',
            gender: voice.gender || 'Non défini',
            ageZone: voice.age || 'Non défini',
            type: voice.category || 'Non classé',
            language: voice.language || 'Non défini',
            avatar: avatarUrl,
            price: voice.rate || 0,
            originalVoiceUrl: voice.preview_url || '',
            clonedVoiceUrl: voice.verified_languages?.[0]?.preview_url || ''
          };
        });
        
      })
    );
  }
  

  listSharedVoices(
    pageSize: number = 100,
    search: string | null = null,
    sort: string | null = null,
    category: string | null = null,
    gender: string | null = null,
    age: string | null = null,
    accent: string | null = null,
    language: string | null = null,
    nextPageToken: number = 0,
  ): Observable<any> {
    let params = new HttpParams()
      .set('page_size', pageSize.toString());

    // Add next_page_token if available
    if (nextPageToken) {
      params = params.set('next_page_token', nextPageToken);
    }

    // Add optional parameters if they exist
    if (search) params = params.set('search', search);
    if (sort) params = params.set('sort', sort);
    if (category) params = params.set('category', category);
    if (gender) params = params.set('gender', gender);
    if (age) params = params.set('age', age);
    if (accent) params = params.set('accent', accent);
    if (language) params = params.set('language', language);
    if (nextPageToken) params = params.set('nextPageToken', nextPageToken);
    return this.http.get<any>(`${this.baseUrl}/shared-voices`, { params });
  }
}
