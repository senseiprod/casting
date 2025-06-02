// Updated ProjectService with audio handling methods
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface Project {
  id: number;
  uuid: string;
  code: string;
  name: string;
  description: string;
  dateCreation: Date;
  user: any;
  preferedVoice: any;
  actions?: Action[];
  deleted: boolean;
}

export interface Action {
  id: number;
  uuid: string;
  code: string;
  text: string;
  audio: any;
  statutAction: string;
  language: string;
  audioGenerated: string | ArrayBuffer | null;
  voice: any;
  dateCreation: Date;
  utilisateur: any;
  project?: Project;
  deleted: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private baseUrl = `${environment.apiUrl}/api/projects`;
  private audioCache: Map<string, Blob> = new Map();

  constructor(private http: HttpClient) { }

  getProjectsBySpeaker(uuid: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}/speaker/${uuid}`);
  }


  // GET all active projects
  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.baseUrl);
  }

  // GET project by UUID
  getProjectByUuid(uuid: string): Observable<Project> {
    return this.http.get<Project>(`${this.baseUrl}/${uuid}`);
  }

  // POST create new project
  createProject(project: any): Observable<Project> {
    return this.http.post<Project>(this.baseUrl, project);
  }

  // PUT update project
  updateProject(uuid: string, project: Project): Observable<Project> {
    return this.http.put<Project>(`${this.baseUrl}/${uuid}`, project);
  }

  // DELETE (soft delete)
  deleteProject(uuid: string): Observable<Project> {
    return this.http.delete<Project>(`${this.baseUrl}/${uuid}`);
  }

  // Get audio data for an action
  getAudioData(action: Action): Observable<Blob> {
    // If we already have this audio in cache, return it
    if (action.uuid && this.audioCache.has(action.uuid)) {
      return of(this.audioCache.get(action.uuid) as Blob);
    }

    // If audioGenerated is a URL string, fetch the audio
    if (typeof action.audioGenerated === 'string' && action.audioGenerated.startsWith('http')) {
      return this.http.get(action.audioGenerated, { responseType: 'blob' }).pipe(
        map(blob => {
          if (action.uuid) {
            this.audioCache.set(action.uuid, blob);
          }
          return blob;
        }),
        catchError(error => {
          console.error('Error fetching audio:', error);
          throw new Error('Failed to fetch audio data');
        })
      );
    }

    // If audioGenerated is a base64 string or byte array, convert to Blob
    if (action.audioGenerated) {
      try {
        let audioBlob: Blob;

        if (typeof action.audioGenerated === 'string') {
          // Handle base64 string
          const base64 = action.audioGenerated.split(',')[1] || action.audioGenerated;
          const byteCharacters = atob(base64);
          const byteArrays = [];

          for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);

            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }

            byteArrays.push(new Uint8Array(byteNumbers));
          }

          audioBlob = new Blob(byteArrays, { type: 'audio/mpeg' });
        } else if (action.audioGenerated instanceof ArrayBuffer) {
          // Handle ArrayBuffer
          audioBlob = new Blob([action.audioGenerated], { type: 'audio/mpeg' });
        } else {
          // Handle other binary formats
          audioBlob = new Blob([action.audioGenerated], { type: 'audio/mpeg' });
        }

        if (action.uuid) {
          this.audioCache.set(action.uuid, audioBlob);
        }

        return of(audioBlob);
      } catch (error) {
        console.error('Error converting audio data:', error);
        throw new Error('Failed to process audio data');
      }
    }

    // If we get here, we need to fetch the audio from the server by ID
    const audioUrl = `${environment.apiUrl}/api/actions/${action.uuid}/audio`;
    return this.http.get(audioUrl, { responseType: 'blob' }).pipe(
      map(blob => {
        if (action.uuid) {
          this.audioCache.set(action.uuid, blob);
        }
        return blob;
      }),
      catchError(error => {
        console.error('Error fetching audio:', error);
        throw new Error('Failed to fetch audio data');
      })
    );
  }

  // Create an object URL for audio playback
  createAudioUrl(action: Action): Observable<string> {
    return this.getAudioData(action).pipe(
      map(blob => URL.createObjectURL(blob)),
      catchError(error => {
        console.error('Error creating audio URL:', error);
        throw new Error('Failed to create audio URL');
      })
    );
  }

  // Download audio file
  downloadAudio(action: Action, filename?: string): Observable<boolean> {
    return this.getAudioData(action).pipe(
      map(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `audio_${action.code || action.id || 'download'}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the URL object after download
        setTimeout(() => URL.revokeObjectURL(url), 100);

        return true;
      }),
      catchError(error => {
        console.error('Error downloading audio:', error);
        return of(false);
      })
    );
  }
}
