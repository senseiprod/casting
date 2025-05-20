import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DemandeRequest {
  titre: string;
  description: string;
  utilisateurUuid: string;
  type : string;
}

export interface DemandeResponse {
  uuid: string;
  code: string;
  titre: string;
  description: string;
  statut: string;
  dateCreation: string;
  utilisateurUuid: string;
  type : string;
}

@Injectable({
  providedIn: 'root'
})
export class DemandeService {
  private apiUrl = 'http://localhost:8080/api/demandes';

  constructor(private http: HttpClient) {}

  getAllDemandes(): Observable<DemandeResponse[]> {
    return this.http.get<DemandeResponse[]>(this.apiUrl);
  }

  getDemandeById(id: number): Observable<DemandeResponse> {
    return this.http.get<DemandeResponse>(`${this.apiUrl}/${id}`);
  }

  getDemandeByUuid(uuid: string): Observable<DemandeResponse> {
    return this.http.get<DemandeResponse>(`${this.apiUrl}/uuid/${uuid}`);
  }

    getDemandesByDemandeurUuid(uuid: string | null): Observable<DemandeResponse[]> {
    return this.http.get<DemandeResponse[]>(`${this.apiUrl}/demandeur/${uuid}`);
  }

  getDemandesEnAttente(): Observable<DemandeResponse[]> {
    return this.http.get<DemandeResponse[]>(`${this.apiUrl}/en-attente`);
  }

  getDemandesAcceptees(): Observable<DemandeResponse[]> {
    return this.http.get<DemandeResponse[]>(`${this.apiUrl}/acceptees`);
  }

  getDemandesRefusees(): Observable<DemandeResponse[]> {
    return this.http.get<DemandeResponse[]>(`${this.apiUrl}/refusees`);
  }

  countDemandesEnAttente(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/en-attente`);
  }

  countDemandesAcceptees(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/acceptees`);
  }

  countDemandesRefusees(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/refusees`);
  }

  createDemande(demande: DemandeRequest): Observable<DemandeResponse> {
    return this.http.post<DemandeResponse>(this.apiUrl, demande);
  }

  updateDemande(uuid: string, status: string): Observable<DemandeResponse> {
    return this.http.put<DemandeResponse>(`${this.apiUrl}/update/${uuid}`, null, {
      params: { status }
    });
  }

  deleteDemande(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${uuid}`);
  }
}
