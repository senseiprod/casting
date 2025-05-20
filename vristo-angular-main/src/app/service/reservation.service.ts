import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, tap } from 'rxjs';

export interface Reservation {
  date: string;
  heureDebut: string;
  heureFin: string;
  service: string;
  userUuid: string;
}

export interface ReservationRequest {
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
  // Make sure this base URL matches your backend
  private apiUrl = 'http://localhost:8080/api/reservations';

  constructor(private http: HttpClient) { }

  // Create a reservation
  createReservation(request: ReservationRequest): Observable<Reservation> {
    console.log('Creating reservation:', request);
    return this.http.post<Reservation>(this.apiUrl, request)
      .pipe(
        tap(response => console.log('Reservation created:', response)),
        catchError(error => {
          console.error('Error creating reservation:', error);
          throw error;
        })
      );
  }

  // Get reservations for a specific date
  getReservationsByDate(date: string): Observable<Reservation[]> {
    console.log('Fetching reservations for date:', date);

    // Ensure date is in the correct format (YYYY-MM-DD)
    const formattedDate = this.ensureDateFormat(date);

    const params = new HttpParams().set('date', formattedDate);

    console.log('Request URL:', `${this.apiUrl}/by-date`, 'with params:', params.toString());

    return this.http.get<Reservation[]>(`${this.apiUrl}/by-date`, { params })
      .pipe(
        tap(response => console.log('Reservations received:', response)),
        catchError(error => {
          console.error('Error fetching reservations by date:', error);
          throw error;
        })
      );
  }

  // Get reservations for a date range
  getReservationsByDateRange(startDate: string, endDate: string): Observable<Reservation[]> {
    console.log('Fetching reservations for date range:', startDate, 'to', endDate);

    // Ensure dates are in the correct format
    const formattedStartDate = this.ensureDateFormat(startDate);
    const formattedEndDate = this.ensureDateFormat(endDate);

    const params = new HttpParams()
      .set('start', formattedStartDate)
      .set('end', formattedEndDate);

    console.log('Request URL:', `${this.apiUrl}/by-date-range`, 'with params:', params.toString());

    return this.http.get<Reservation[]>(`${this.apiUrl}/by-date-range`, { params })
      .pipe(
        tap(response => console.log('Reservations for range received:', response)),
        catchError(error => {
          console.error('Error fetching reservations by date range:', error);
          throw error;
        })
      );
  }

  // Get reservations for a date between two times
  getReservationsByDateAndTimeRange(date: string, startTime: string, endTime: string): Observable<Reservation[]> {
    console.log('Fetching reservations for date and time range:', date, startTime, 'to', endTime);

    const formattedDate = this.ensureDateFormat(date);

    const params = new HttpParams()
      .set('date', formattedDate)
      .set('start', startTime)
      .set('end', endTime);

    return this.http.get<Reservation[]>(`${this.apiUrl}/by-date-and-range`, { params })
      .pipe(
        tap(response => console.log('Reservations for date and time range received:', response)),
        catchError(error => {
          console.error('Error fetching reservations by date and time range:', error);
          throw error;
        })
      );
  }

  // Get reserved hours for a date
  getReservedHoursByDate(date: string): Observable<string[]> {
    console.log('Fetching reserved hours for date:', date);

    const formattedDate = this.ensureDateFormat(date);

    const params = new HttpParams().set('date', formattedDate);

    return this.http.get<string[]>(`${this.apiUrl}/reserved-hours`, { params })
      .pipe(
        tap(response => console.log('Reserved hours received:', response)),
        catchError(error => {
          console.error('Error fetching reserved hours:', error);
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
