import { Component, OnInit } from '@angular/core';
import { SpeakerReservationService, SpeakerReservation } from '../service/speakerReservation.service';
import { UsersService } from '../service/users.service';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  reservations: SpeakerReservation[];
}

interface UserInfo {
  uuid: string;
  id: number;
  nom: string;
  prenom: string;
  phone: string;
  email: string;
  role: string;
}

interface SpeakerInfo {
  uuid: string;
  id: number;
  nom: string;
  prenom: string;
  phone: string;
  email: string;
  specialite: string;
  tarif: number;
}

interface ReservationWithDetails extends SpeakerReservation {
  user?: UserInfo;
  speaker?: SpeakerInfo;
}

@Component({
  selector: 'app-speaker-calendar',
  templateUrl: './speakerCalendar.html',
})
export class SpeakerCalendarComponent implements OnInit {
  currentDate = new Date();
  currentMonth: number;
  currentYear: number;
  calendarDays: CalendarDay[] = [];
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  selectedDate: Date | null = null;
  selectedDateReservations: ReservationWithDetails[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  // Filter options
  selectedSpeakerUuid: string | null = null;
  speakers: SpeakerInfo[] = [];

  constructor(
    private speakerReservationService: SpeakerReservationService,
    private usersService: UsersService
  ) {
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
  }

  ngOnInit(): void {
    this.generateCalendar();
    // You would typically load speakers here from a service
    // this.loadSpeakers();
  }

  generateCalendar(): void {
    this.calendarDays = [];

    // Get first day of month
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);

    // Get days from previous month to fill first week
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek; i > 0; i--) {
      const prevDate = new Date(this.currentYear, this.currentMonth, 1 - i);
      this.calendarDays.push({
        date: prevDate,
        isCurrentMonth: false,
        isToday: this.isToday(prevDate),
        reservations: []
      });
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(this.currentYear, this.currentMonth, i);
      this.calendarDays.push({
        date,
        isCurrentMonth: true,
        isToday: this.isToday(date),
        reservations: []
      });
    }

    // Add days from next month to complete the calendar
    const remainingDays = 42 - this.calendarDays.length; // 6 rows of 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(this.currentYear, this.currentMonth + 1, i);
      this.calendarDays.push({
        date: nextDate,
        isCurrentMonth: false,
        isToday: this.isToday(nextDate),
        reservations: []
      });
    }

    // Fetch reservations for the visible month
    this.fetchReservationsForMonth();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDateForDisplay(date: Date): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  fetchReservationsForMonth(): void {
    this.isLoading = true;
    this.errorMessage = null;

    // Get the first and last day of the current month view
    const firstVisibleDate = this.calendarDays[0].date;
    const lastVisibleDate = this.calendarDays[this.calendarDays.length - 1].date;

    // For each day in the month, fetch reservations
    const observables = this.calendarDays.map(day => {
      const formattedDate = this.formatDate(day.date);

      // If a speaker is selected, get reservations for that speaker and date
      if (this.selectedSpeakerUuid) {
        return this.speakerReservationService.getReservationsBySpeakerAndDate(
          this.selectedSpeakerUuid,
          formattedDate
        ).pipe(
          catchError(error => {
            console.error(`Error fetching reservations for date ${formattedDate}:`, error);
            return of([]);
          })
        );
      } else {
        // Otherwise, get all reservations for the date
        return this.speakerReservationService.getReservationsByDate(formattedDate).pipe(
          catchError(error => {
            console.error(`Error fetching reservations for date ${formattedDate}:`, error);
            return of([]);
          })
        );
      }
    });

    // Wait for all requests to complete
    forkJoin(observables).subscribe({
      next: (results) => {
        // Assign reservations to each day
        results.forEach((reservations, index) => {
          this.calendarDays[index].reservations = reservations;
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching reservations for month:', error);
        this.errorMessage = 'Failed to load reservations. Please try again.';
        this.isLoading = false;
      }
    });
  }

  previousMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }

  selectDate(day: CalendarDay): void {
    this.selectedDate = day.date;
    const formattedDate = this.formatDate(day.date);
    this.isLoading = true;
    this.errorMessage = null;
    this.selectedDateReservations = [];

    console.log('Selected date:', formattedDate);

    // Get reservations for the selected date
    let reservationObservable;

    if (this.selectedSpeakerUuid) {
      reservationObservable = this.speakerReservationService.getReservationsBySpeakerAndDate(
        this.selectedSpeakerUuid,
        formattedDate
      );
    } else {
      reservationObservable = this.speakerReservationService.getReservationsByDate(formattedDate);
    }

    reservationObservable.pipe(
      switchMap((reservations: SpeakerReservation[]) => {
        console.log('Received reservations for selected date:', reservations);

        if (reservations.length === 0) {
          return of([]);
        }

        // Create an array of observables for fetching user and speaker details
        const detailsObservables = reservations.map(reservation => {
          // Fetch user details
          const userObservable = this.usersService.fetchUserById(reservation.userUuid).pipe(
            catchError(error => {
              console.error(`Error fetching user ${reservation.userUuid}:`, error);
              return of(null);
            })
          );

          // Fetch speaker details (assuming you have a method to fetch speaker details)
          const speakerObservable = this.usersService.fetchUserById(reservation.speakerUuid).pipe(
            catchError(error => {
              console.error(`Error fetching speaker ${reservation.speakerUuid}:`, error);
              return of(null);
            })
          );

          // Combine user and speaker details with reservation
          return forkJoin([userObservable, speakerObservable]).pipe(
            switchMap(([user, speaker]) => {
              const reservationWithDetails: ReservationWithDetails = {
                ...reservation,
                user: user,
                speaker: speaker as unknown as SpeakerInfo // Type casting as your actual speaker type
              };
              return of(reservationWithDetails);
            })
          );
        });

        // Wait for all detail fetches to complete
        return forkJoin(detailsObservables);
      })
    ).subscribe({
      next: (reservationsWithDetails: ReservationWithDetails[]) => {
        console.log('Reservations with details:', reservationsWithDetails);
        this.selectedDateReservations = reservationsWithDetails;
        this.isLoading = false;
      },
      error: (error) => {
        console.error(`Error processing reservations for ${formattedDate}:`, error);
        this.errorMessage = 'Failed to load reservation details. Please try again.';
        this.selectedDateReservations = [];
        this.isLoading = false;
      }
    });
  }

  getReservationCount(day: CalendarDay): number {
    return day.reservations.length;
  }

  hasReservations(day: CalendarDay): boolean {
    return day.reservations.length > 0;
  }

  // Filter by speaker
  onSpeakerChange(speakerUuid: string): void {
    this.selectedSpeakerUuid = speakerUuid;
    this.generateCalendar(); // Reload calendar with filtered data
  }

  clearSpeakerFilter(): void {
    this.selectedSpeakerUuid = null;
    this.generateCalendar(); // Reload calendar with all data
  }

  // Get full name from user object
  getUserFullName(user: UserInfo | undefined): string {
    if (!user) return 'Unknown User';
    return `${user.prenom || ''} ${user.nom || ''}`.trim() || 'Unknown User';
  }

  // Get phone number from user object
  getUserPhone(user: UserInfo | undefined): string {
    if (!user || !user.phone) return 'No phone number';
    return user.phone;
  }

  // Get full name from speaker object
  getSpeakerFullName(speaker: SpeakerInfo | undefined): string {
    if (!speaker) return 'Unknown Speaker';
    return `${speaker.prenom || ''} ${speaker.nom || ''}`.trim() || 'Unknown Speaker';
  }

  // Get speciality from speaker object
  getSpeakerSpeciality(speaker: SpeakerInfo | undefined): string {
    if (!speaker || !speaker.specialite) return 'Unknown Speciality';
    return speaker.specialite;
  }
}
