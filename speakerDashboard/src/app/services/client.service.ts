import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface ClientRequest {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  phone: string;
  username: string;
  role: string;
  fidelite: string;
  // Ajoutez d'autres champs nécessaires
}

export class ClientResponse {
  uuid: string;
  code: string;
  nom: string;
  prenom: string;
  email: string;
  phone: string;
  username: string;
  role: string;
  fidelite: string;
  constructor(

  ) {
    this.nom="";this.email="";
    this.phone="";
    this.username="",
      this.role="",
      this.uuid="",
      this.prenom="",
      this.code="",
      this.fidelite=""


  }
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = `${environment.apiUrl}/api/clients`;

  constructor(private http: HttpClient) {}

  getAllClients(): Observable<ClientResponse[]> {
    return this.http.get<ClientResponse[]>(this.apiUrl);
  }

  getClientById(id: number): Observable<ClientResponse> {
    return this.http.get<ClientResponse>(`${this.apiUrl}/${id}`);
  }

  getClientByUuid(uuid: string): Observable<ClientResponse> {
    return this.http.get<ClientResponse>(`${this.apiUrl}/uuid/${uuid}`);
  }

  getClientByEmail(email: string): Observable<ClientResponse> {
    return this.http.get<ClientResponse>(`${this.apiUrl}/email/${email}`);
  }

  getClientByFidelite(fidelite: string): Observable<ClientResponse> {
    return this.http.get<ClientResponse>(`${this.apiUrl}/fidelite/${fidelite}`);
  }

  getClientsNotDeleted(): Observable<ClientResponse[]> {
    return this.http.get<ClientResponse[]>(`${this.apiUrl}/not-deleted`);
  }

  getClientsDeleted(): Observable<ClientResponse[]> {
    return this.http.get<ClientResponse[]>(`${this.apiUrl}/deleted`);
  }

  createClient(client: ClientRequest): Observable<ClientResponse> {
    return this.http.post<ClientResponse>(this.apiUrl, client);
  }

  updateClient(uuid: string, client: ClientRequest): Observable<ClientResponse> {
    return this.http.put<ClientResponse>(`${this.apiUrl}/${uuid}`, client);
  }

  deleteClient(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${uuid}`);
  }
}
