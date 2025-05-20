import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, tap } from 'rxjs';

export interface SpeakerReservation {
  date: string;
  userUuid: string;
  speakerUuid: string;
  service: string;
  id?: string;
}

export interface SpeakerReservationRequest {
  date: string;
  userUuid: string;
  speakerUuid: string;
  service: string;
}

@Injectable({
  providedIn: 'root'
})
export class SpeakerReservationService {
  private apiUrl = 'http://localhost:8080/api/reservationsSpeaker';

  constructor(private http: HttpClient) { }

  // Create a speaker reservation
  createReservation(request: SpeakerReservationRequest): Observable<SpeakerReservation> {
    console.log('Creating speaker reservation:', request);
    return this.http.post<SpeakerReservation>(this.apiUrl, request)
      .pipe(
        tap(response => console.log('Speaker reservation created:', response)),
        catchError(error => {
          console.error('Error creating speaker reservation:', error);
          throw error;
        })
      );
  }

  // Get all speaker reservations
  getAllReservations(): Observable<SpeakerReservation[]> {
    console.log('Fetching all speaker reservations');
    return this.http.get<SpeakerReservation[]>(this.apiUrl)
      .pipe(
        tap(response => console.log('All speaker reservations received:', response)),
        catchError(error => {
          console.error('Error fetching all speaker reservations:', error);
          throw error;
        })
      );
  }

  // Get reservation by ID
  getReservationById(id: string): Observable<SpeakerReservation> {
    console.log('Fetching speaker reservation by ID:', id);
    return this.http.get<SpeakerReservation>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(response => console.log('Speaker reservation received:', response)),
        catchError(error => {
          console.error(`Error fetching speaker reservation with ID ${id}:`, error);
          throw error;
        })
      );
  }

  // Update a reservation
  updateReservation(id: string, request: SpeakerReservationRequest): Observable<SpeakerReservation> {
    console.log('Updating speaker reservation:', id, request);
    return this.http.put<SpeakerReservation>(`${this.apiUrl}/${id}`, request)
      .pipe(
        tap(response => console.log('Speaker reservation updated:', response)),
        catchError(error => {
          console.error(`Error updating speaker reservation with ID ${id}:`, error);
          throw error;
        })
      );
  }

  // Delete a reservation
  deleteReservation(id: string): Observable<void> {
    console.log('Deleting speaker reservation:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => console.log('Speaker reservation deleted')),
        catchError(error => {
          console.error(`Error deleting speaker reservation with ID ${id}:`, error);
          throw error;
        })
      );
  }

  // Get reservations by user UUID
  getReservationsByUser(userUuid: string): Observable<SpeakerReservation[]> {
    console.log('Fetching speaker reservations for user:', userUuid);
    return this.http.get<SpeakerReservation[]>(`${this.apiUrl}/user/${userUuid}`)
      .pipe(
        tap(response => console.log('Speaker reservations for user received:', response)),
        catchError(error => {
          console.error(`Error fetching speaker reservations for user ${userUuid}:`, error);
          throw error;
        })
      );
  }

  // Get reservations by speaker UUID
  getReservationsBySpeaker(speakerUuid: string): Observable<SpeakerReservation[]> {
    console.log('Fetching reservations for speaker:', speakerUuid);
    return this.http.get<SpeakerReservation[]>(`${this.apiUrl}/speaker/${speakerUuid}`)
      .pipe(
        tap(response => console.log('Reservations for speaker received:', response)),
        catchError(error => {
          console.error(`Error fetching reservations for speaker ${speakerUuid}:`, error);
          throw error;
        })
      );
  }

  // Get reservations by date
  getReservationsByDate(date: string): Observable<SpeakerReservation[]> {
    console.log('Fetching speaker reservations for date:', date);

    // Ensure date is in the correct format (YYYY-MM-DD)
    const formattedDate = this.ensureDateFormat(date);

    return this.http.get<SpeakerReservation[]>(`${this.apiUrl}/date/${formattedDate}`)
      .pipe(
        tap(response => console.log('Speaker reservations for date received:', response)),
        catchError(error => {
          console.error(`Error fetching speaker reservations for date ${formattedDate}:`, error);
          throw error;
        })
      );
  }

  // Get reservations by user UUID and date
  getReservationsByUserAndDate(userUuid: string, date: string): Observable<SpeakerReservation[]> {
    console.log('Fetching speaker reservations for user and date:', userUuid, date);

    const formattedDate = this.ensureDateFormat(date);

    return this.http.get<SpeakerReservation[]>(`${this.apiUrl}/user/${userUuid}/date/${formattedDate}`)
      .pipe(
        tap(response => console.log('Speaker reservations for user and date received:', response)),
        catchError(error => {
          console.error(`Error fetching speaker reservations for user ${userUuid} and date ${formattedDate}:`, error);
          throw error;
        })
      );
  }

  // Get reservations by speaker UUID and date
  getReservationsBySpeakerAndDate(speakerUuid: string, date: string): Observable<SpeakerReservation[]> {
    console.log('Fetching reservations for speaker and date:', speakerUuid, date);

    const formattedDate = this.ensureDateFormat(date);

    return this.http.get<SpeakerReservation[]>(`${this.apiUrl}/speaker/${speakerUuid}/date/${formattedDate}`)
      .pipe(
        tap(response => console.log('Reservations for speaker and date received:', response)),
        catchError(error => {
          console.error(`Error fetching reservations for speaker ${speakerUuid} and date ${formattedDate}:`, error);
          throw error;
        })
      );
  }

  // Helper method to ensure date is in YYYY-MM-DD format
  private ensureDateFormat(date: string): string {
    // If it's already in the correct format, return it
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }

    // Try to parse and format the date
    try {
      const dateObj = new Date(date);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error('Error formatting date:', e);
      return date; // Return original if parsing fails
    }
  }
}
