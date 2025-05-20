import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReservationSpeakerDto {
  date: string; // format YYYY-MM-DD
  userUuid: string;
  speakerUuid: string;
  service: string;
}

export interface ReservationSpeakerDtoResponse extends ReservationSpeakerDto {
  uuid: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationSpeakerService {
  private baseUrl = 'http://localhost:8080/api/reservationsSpeaker';

  constructor(private http: HttpClient) {}

  // 🔹 Create
  createReservation(dto: ReservationSpeakerDto): Observable<ReservationSpeakerDtoResponse> {
    return this.http.post<ReservationSpeakerDtoResponse>(this.baseUrl, dto);
  }

  // 🔹 Read - All
  getAllReservations(): Observable<ReservationSpeakerDtoResponse[]> {
    return this.http.get<ReservationSpeakerDtoResponse[]>(this.baseUrl);
  }

  // 🔹 Read - By ID
  getReservationById(id: number): Observable<ReservationSpeakerDtoResponse> {
    return this.http.get<ReservationSpeakerDtoResponse>(`${this.baseUrl}/${id}`);
  }

  // 🔹 Update
  updateReservation(id: number, dto: ReservationSpeakerDto): Observable<ReservationSpeakerDtoResponse> {
    return this.http.put<ReservationSpeakerDtoResponse>(`${this.baseUrl}/${id}`, dto);
  }

  // 🔹 Delete
  deleteReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // 🔹 Find by User UUID
  getReservationsByUser(userUuid: string): Observable<ReservationSpeakerDtoResponse[]> {
    return this.http.get<ReservationSpeakerDtoResponse[]>(`${this.baseUrl}/user/${userUuid}`);
  }

  // 🔹 Find by Speaker UUID
  getReservationsBySpeaker(speakerUuid: string): Observable<ReservationSpeakerDtoResponse[]> {
    return this.http.get<ReservationSpeakerDtoResponse[]>(`${this.baseUrl}/speaker/${speakerUuid}`);
  }

  // 🔹 Find by Date
  getReservationsByDate(date: string): Observable<ReservationSpeakerDtoResponse[]> {
    return this.http.get<ReservationSpeakerDtoResponse[]>(`${this.baseUrl}/date/${date}`);
  }

  // 🔹 Find by User UUID and Date
  getReservationsByUserAndDate(userUuid: string, date: string): Observable<ReservationSpeakerDtoResponse[]> {
    return this.http.get<ReservationSpeakerDtoResponse[]>(`${this.baseUrl}/user/${userUuid}/date/${date}`);
  }

  // 🔹 Find by Speaker UUID and Date
  getReservationsBySpeakerAndDate(speakerUuid: string, date: string): Observable<ReservationSpeakerDtoResponse[]> {
    return this.http.get<ReservationSpeakerDtoResponse[]>(`${this.baseUrl}/speaker/${speakerUuid}/date/${date}`);
  }
}
