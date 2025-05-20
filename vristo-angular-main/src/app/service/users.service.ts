import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = 'http://localhost:8080/utilisateurs';

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
    return this.http.get(`http://localhost:8080/utilisateurs/${userUuid}/photo`, { responseType: 'blob' });
  }



  createAdmin(admin: any): Observable<any> {
    return this.http.post<any>(`http://localhost:8080/utilisateurs/admin`, admin);
  }

  createClient(client: any): Observable<any> {
    return this.http.post<any>(`http://localhost:8080/utilisateurs/client`, client);
  }

  createSpeaker(speaker: any): Observable<any> {
    return this.http.post<any>(`http://localhost:8080/utilisateurs/speaker`, speaker);
  }

  uploadUserImage(userId: string, formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${userId}/uploadPhoto`, formData);
  }

  fetchUserById(userId: string): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/utilisateurs/${userId}`);
  }

}
