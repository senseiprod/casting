import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = `${environment.apiUrl}/utilisateurs`;
   private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  addUser(user: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, user);
  }

  updateUser(user: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${user.id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getUserImage(userUuid: string): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/utilisateurs/${userUuid}/photo`, { responseType: 'blob' });
  }



  createAdmin(admin: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/utilisateurs/admin`, admin);
  }

  createClient(client: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/utilisateurs/client`, client);
  }

  createSpeaker(speaker: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/utilisateurs/speaker`, speaker);
  }

  uploadUserImage(userId: string, formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${userId}/uploadPhoto`, formData);
  }

  fetchUserById(userId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/utilisateurs/${userId}`);
  }

}
