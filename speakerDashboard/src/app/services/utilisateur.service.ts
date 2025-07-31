import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface UtilisateurRequest {
  code: string;
  deleted: boolean;
  id: number;
  nom: string;
  role: string;
  prenom: string;
  email: string;
  motDePasse: string;
  phone: string;
  verified: boolean;
  balance: number;
  fidelity: number;
}

export interface ChangePasswordRequest {
  email: string;
  oldPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrl = `${environment.apiUrl}/utilisateurs`;

  constructor(private http: HttpClient) {}

    uploadPhoto(userId: string | null, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/${userId}/uploadPhoto`, formData);
  }

  getPhoto(userId: string | null): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${userId}/photo`, { responseType: 'blob' });
  }

  updateUtilisateur(id: string, utilisateur: UtilisateurRequest): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, utilisateur);
  }



}
