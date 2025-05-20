import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface RecordRequest {
  utilisateurUuid: string;
  startDateTime: string;
  endDateTime: string;
}

interface RecordResponse {
  uuid: string;
  code: string;
  utilisateurUuid: string;
  startDateTime: string;
  endDateTime: string;
}

@Injectable({
  providedIn: 'root',
})
export class RecordService {
  private apiUrl = 'http://localhost:8080/api/records';

  constructor(private http: HttpClient) {}

  createRecord(request: RecordRequest): Observable<RecordResponse> {
    return this.http.post<RecordResponse>(`${this.apiUrl}`, request);
  }

  getRecordByUuid(uuid: string): Observable<RecordResponse> {
    return this.http.get<RecordResponse>(`${this.apiUrl}/${uuid}`);
  }

  getRecordsByDate(date: string): Observable<RecordResponse[]> {
    return this.http.get<RecordResponse[]>(`${this.apiUrl}/date/${date}`);
  }

  getRecordsByDateRange(start: string, end: string): Observable<RecordResponse[]> {
    return this.http.get<RecordResponse[]>(`${this.apiUrl}/range?start=${start}&end=${end}`);
  }

  getRecordsByUserId(userId: string): Observable<RecordResponse[]> {
    return this.http.get<RecordResponse[]>(`${this.apiUrl}/user/${userId}`);
  }

  getAllActiveRecords(): Observable<RecordResponse[]> {
    return this.http.get<RecordResponse[]>(`${this.apiUrl}/active`);
  }

  getAllDeletedRecords(): Observable<RecordResponse[]> {
    return this.http.get<RecordResponse[]>(`${this.apiUrl}/deleted`);
  }

  softDeleteRecord(uuid: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}/soft-delete/${uuid}`, { responseType: 'text' });
  }

  permanentDeleteRecord(uuid: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}/permanent-delete/${uuid}`, { responseType: 'text' });
  }

  updateRecord(uuid: string, startDateTime: string, endDateTime: string): Observable<RecordResponse> {
    return this.http.put<RecordResponse>(`${this.apiUrl}/${uuid}`, { startDateTime, endDateTime });
  }
}
