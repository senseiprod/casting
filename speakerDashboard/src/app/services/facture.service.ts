import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FactureClient {
  code: string;
  dateEmission: string;
  datePaiement: string;
  montant: number;
  statut: string;
  clientUuid: string;
}

export interface FactureSpeaker {
  code: string;
  dateEmission: string;
  datePaiement: string;
  montant: number;
  statut: string;
  speakerUuid: string;
  file: File;
}

export interface FactureClientResponse {
  uuid: string;
  code: string;
  dateEmission: string;
  datePaiement: string;
  montant: number;
  statut: string;
  clientUuid: string;
}

export interface FactureSpeakerResponse {
  uuid: string;
  code: string;
  dateEmission: string;
  datePaiement: string;
  montant: number;
  statut: string;
  speakerUuid: string;
  pdfData?: any;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FactureService {

  private baseUrl = 'http://localhost:8080/api/factures';

  constructor(private http: HttpClient) { }

  ajouterFactureClient(data: FactureClient): Observable<FactureClientResponse> {
    return this.http.post<FactureClientResponse>(`${this.baseUrl}/client`, data);
  }

  ajouterFactureSpeaker(data: FormData): Observable<FactureSpeakerResponse> {
    return this.http.post<FactureSpeakerResponse>(`${this.baseUrl}/speaker`, data);
  }

  getAllFactures(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}`);
  }

  getFacturesClient(clientUuid: string): Observable<FactureClientResponse[]> {
    return this.http.get<FactureClientResponse[]>(`${this.baseUrl}/client/${clientUuid}`);
  }

  getFacturesSpeaker(speakerUuid: string): Observable<FactureSpeakerResponse[]> {
    return this.http.get<FactureSpeakerResponse[]>(`${this.baseUrl}/speaker/${speakerUuid}`);
  }

  getFacturesParStatut(statut: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/statut/${statut}`);
  }

  getFacturesApresDate(date: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/date/${date}`);
  }

  getSpeakerFactureById(id: number): Observable<FactureSpeakerResponse> {
    return this.http.get<FactureSpeakerResponse>(`${this.baseUrl}/${id}`);
  }

  uploadPdf(id: string, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/${id}/uploadPdf`, formData, { responseType: 'text' });
  }

  downloadPdf(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/downloadPdf`, {
      responseType: 'blob'
    });
  }
}
