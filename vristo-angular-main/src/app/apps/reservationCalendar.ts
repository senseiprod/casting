import { Component, OnInit } from '@angular/core';
import { ReservationService, Reservation } from '../service/reservation.service';
import { UsersService } from '../service/users.service';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  reservations: Reservation[];
  reservedHours: string[];
}

interface UserInfo {
    uuid: string;
    id: number;
    nom: string;
    prenom: string;
    phone: string; // Note: it's 'phone' not 'telephone'
    email: string;
    role: string;
}

interface ReservationWithUser extends Reservation {
  user?: UserInfo;
}

@Component({
  selector: 'app-calendar',
  templateUrl: './reservationCalendar.html',
})
export class CalendarComponent implements OnInit {
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
  selectedDateReservations: ReservationWithUser[] = [];
  selectedDateReservedHours: string[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private reservationService: ReservationService,
    private usersService: UsersService
  ) {
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
  }

  ngOnInit(): void {
    this.generateCalendar();
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
        reservations: [],
        reservedHours: []
      });
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(this.currentYear, this.currentMonth, i);
      this.calendarDays.push({
        date,
        isCurrentMonth: true,
        isToday: this.isToday(date),
        reservations: [],
        reservedHours: []
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
        reservations: [],
        reservedHours: []
      });
    }

    // Fetch reservations for the visible month range
    this.fetchReservationsForVisibleDates();
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

  fetchReservationsForVisibleDates(): void {
    if (this.calendarDays.length === 0) return;

    this.isLoading = true;
    this.errorMessage = null;

    const startDate = this.formatDate(this.calendarDays[0].date);
    const endDate = this.formatDate(this.calendarDays[this.calendarDays.length - 1].date);

    console.log('Fetching reservations from', startDate, 'to', endDate);

    this.reservationService.getReservationsByDateRange(startDate, endDate)
      .subscribe({
        next: (reservations: Reservation[]) => {
          console.log('Received reservations:', reservations);

          // Reset reservations
          this.calendarDays.forEach(day => day.reservations = []);

          // Assign reservations to days
          reservations.forEach((reservation: Reservation) => {
            console.log('Processing reservation for date:', reservation.date);

            const reservationDate = new Date(reservation.date);
            console.log('Parsed reservation date:', reservationDate);

            const calendarDay = this.calendarDays.find(day => {
              const dayMatches =
                day.date.getDate() === reservationDate.getDate() &&
                day.date.getMonth() === reservationDate.getMonth() &&
                day.date.getFullYear() === reservationDate.getFullYear();

              if (dayMatches) {
                console.log('Found matching day:', this.formatDate(day.date));
              }

              return dayMatches;
            });

            if (calendarDay) {
              console.log('Adding reservation to day:', this.formatDate(calendarDay.date));
              calendarDay.reservations.push(reservation);
            } else {
              console.warn('No matching calendar day found for reservation date:', reservation.date);
            }
          });

          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching reservations:', error);
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
    this.reservationService.getReservationsByDate(formattedDate)
      .pipe(
        switchMap((reservations: Reservation[]) => {
          console.log('Received reservations for selected date:', reservations);

          if (reservations.length === 0) {
            return of([]);
          }

          // Create an array of observables for fetching user details
          const userObservables = reservations.map(reservation => {
            return this.usersService.fetchUserById(reservation.userUuid).pipe(
              catchError(error => {
                console.error(`Error fetching user ${reservation.userUuid}:`, error);
                return of(null); // Return null if user fetch fails
              }),
              // Map the user to the reservation
              switchMap(user => {
                const reservationWithUser: ReservationWithUser = {
                  ...reservation,
                  user: user
                };
                return of(reservationWithUser);
              })
            );
          });

          // Wait for all user fetches to complete
          return forkJoin(userObservables);
        })
      )
      .subscribe({
        next: (reservationsWithUsers: ReservationWithUser[]) => {
          console.log('Reservations with user details:', reservationsWithUsers);
          this.selectedDateReservations = reservationsWithUsers;
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

  // Format time for display (e.g., "14:00:00" to "14:00")
  formatTime(time: string): string {
    if (!time) return '';
    return time.substring(0, 5);
  }

  

   // Update these methods to match the actual user object structure

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

  // Get user email
  getUserEmail(user: UserInfo | undefined): string {
    if (!user || !user.email) return 'No email';
    return user.email;
  }

  // Get user role
  getUserRole(user: UserInfo | undefined): string {
    if (!user || !user.role) return 'Unknown role';
    return user.role;
  }
}
