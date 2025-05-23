import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


interface DemandeResponse {
  id: number;
  uuid: string;
  code: string;
  titre: string;
  description: string;
  statut: string;
  dateCreation: string;
  utilisateurUuid: string;  // The UUID to get the client name
  type: string;
}

interface ClientResponse {
  uuid: string;
  nom: string;  // The 'nom' property of the client
}

interface SpeakerResponse {
    uuid: string;
    nom: string;  // The 'nom' property of the client
  }

@Injectable({
  providedIn: 'root',
})
export class RequestService {

  private apiUrl = `http://localhost:8080/api/demandes/en-attente`;
  private clientApiUrl = `http://localhost:8080/api/clients/uuid`;
  private speakerApiUrl = `http://localhost:8080/api/speakers/uuid`;
  // Base URL for client

  constructor(private http: HttpClient) { }

  getDemandes(): Observable<DemandeResponse[]> {
    return this.http.get<DemandeResponse[]>(this.apiUrl);
  }

  getClientByUuid(uuid: string): Observable<ClientResponse> {
    return this.http.get<ClientResponse>(`${this.clientApiUrl}/${uuid}`);
  }

  getSpeakerByUuid(uuid: string): Observable<ClientResponse> {
    return this.http.get<SpeakerResponse>(`${this.speakerApiUrl}/${uuid}`);
  }
}
