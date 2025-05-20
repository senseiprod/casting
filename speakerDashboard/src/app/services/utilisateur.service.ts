import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface UtilisateurRequest {
  nom: string;
  prenom: string;
  email: string;
  phone: string;
}

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrl = 'http://localhost:8080/utilisateurs';

  constructor(private http: HttpClient) {}

  uploadPhoto(userId: string | null, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/${userId}/uploadPhoto`, formData);
  }

  getPhoto(userId: string | null): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${userId}/photo`, { responseType: 'blob' });
  }
  updateUser(id: string, utilisateur: UtilisateurRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, utilisateur);
  }
}
