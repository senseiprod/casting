import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SpeakerRequest {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  phone: string;
  username: string;
  role: string;
  earnings: number;
}

export class SpeakerResponse {
  uuid: string;
  code: string;
  nom: string;
  prenom: string;
  email: string;
  phone: string;
  username: string;
  role: string;
  earnings: number;
  constructor(

  ) {
    this.nom="";this.email="";
    this.phone="";
    this.username="",
      this.role="",
      this.earnings=0.0,
      this.uuid="",
      this.prenom="",
      this.code=""

  }

}

@Injectable({
  providedIn: 'root',
})
export class SpeakerService {
  private apiUrl = 'http://localhost:8080/api/speakers';

  constructor(private http: HttpClient) {}

  getAllSpeakers(): Observable<SpeakerResponse[]> {
    return this.http.get<SpeakerResponse[]>(`${this.apiUrl}`);
  }

  getSpeakerById(id: number): Observable<SpeakerResponse> {
    return this.http.get<SpeakerResponse>(`${this.apiUrl}/${id}`);
  }

  getSpeakerByUuid(uuid: string | null): Observable<SpeakerResponse> {
    return this.http.get<SpeakerResponse>(`${this.apiUrl}/uuid/${uuid}`);
  }

  getSpeakerByEmail(email: string): Observable<SpeakerResponse> {
    return this.http.get<SpeakerResponse>(`${this.apiUrl}/email/${email}`);
  }

  getSpeakersByEarnings(earnings: number): Observable<SpeakerResponse[]> {
    return this.http.get<SpeakerResponse[]>(`${this.apiUrl}/earnings/${earnings}`);
  }

  getSpeakersNotDeleted(): Observable<SpeakerResponse[]> {
    return this.http.get<SpeakerResponse[]>(`${this.apiUrl}/active`);
  }

  getSpeakersDeleted(): Observable<SpeakerResponse[]> {
    return this.http.get<SpeakerResponse[]>(`${this.apiUrl}/deleted`);
  }

  searchSpeakers(name: string): Observable<SpeakerResponse[]> {
    return this.http.get<SpeakerResponse[]>(`${this.apiUrl}/search?name=${name}`);
  }

  createSpeaker(speaker: SpeakerRequest): Observable<SpeakerResponse> {
    return this.http.post<SpeakerResponse>(this.apiUrl, speaker);
  }

  updateSpeaker(uuid: string, speaker: SpeakerRequest): Observable<SpeakerResponse> {
    return this.http.put<SpeakerResponse>(`${this.apiUrl}/uuid/${uuid}`, speaker);
  }

  deleteSpeaker(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/uuid/${uuid}`);
  }
}
