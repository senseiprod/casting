import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface ReservationRequest {
  date: string; // format: YYYY-MM-DD
  heureDebut: string; // format: HH:mm
  heureFin: string; // format: HH:mm
  service: string;
  userUuid: string;
}

export interface ReservationResponse {
  date: string;
  heureDebut: string;
  heureFin: string;
  service: string;
  userUuid: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = `${environment.apiUrl}/api/reservations`;

  constructor(private http: HttpClient) {}

  // ✅ Créer une réservation
  createReservation(request: ReservationRequest): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(this.apiUrl, request);
  }

  // ✅ Obtenir les réservations par date
  getReservationsByDate(date: string): Observable<ReservationResponse[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<ReservationResponse[]>(`${this.apiUrl}/by-date`, { params });
  }

  // ✅ Obtenir les réservations par date et plage horaire
  getReservationsByDateAndRange(date: string, start: string, end: string): Observable<ReservationResponse[]> {
    const params = new HttpParams()
      .set('date', date)
      .set('start', start)
      .set('end', end);
    return this.http.get<ReservationResponse[]>(`${this.apiUrl}/by-date-and-range`, { params });
  }

  // ✅ Obtenir les réservations dans une plage de dates
  getReservationsByDateRange(startDate: string, endDate: string): Observable<ReservationResponse[]> {
    const params = new HttpParams()
      .set('start', startDate)
      .set('end', endDate);
    return this.http.get<ReservationResponse[]>(`${this.apiUrl}/by-date-range`, { params });
  }

  // ✅ Obtenir les heures déjà réservées pour une date
  getReservedHoursByDate(date: string): Observable<string[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<string[]>(`${this.apiUrl}/reserved-hours`, { params });
  }
}
