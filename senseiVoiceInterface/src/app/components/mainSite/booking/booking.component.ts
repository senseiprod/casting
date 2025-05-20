import { Component,  OnInit } from "@angular/core"
import {  FormBuilder,  FormGroup, Validators } from "@angular/forms"
import  { ReservationService, ReservationRequest } from "../../../services/reservation.service"
import  { AuthService } from "../../../services/auth.service"
import { finalize, switchMap } from "rxjs/operators"

interface TimeSlot {
  time: string
  available: boolean
}

interface Service {
  id: string
  name: string
  description: string
  duration: number // in minutes
}

@Component({
  selector: "app-booking",
  templateUrl: "./booking.component.html",
  styleUrls: ["./booking.component.css"],
})
export class BookingComponent implements OnInit {
  activeTab = "booking" // Default active tab
  bookingForm: FormGroup
  timeSlots: TimeSlot[] = []
  services: Service[] = [
    {
      id: "recording",
      name: "Enregistrement vocal",
      description: "Session d'enregistrement vocal professionnel",
      duration: 120,
    },
    {
      id: "mixing",
      name: "Mixage audio",
      description: "Service de mixage audio professionnel",
      duration: 240,
    },
    {
      id: "mastering",
      name: "Mastering",
      description: "Service de mastering professionnel",
      duration: 180,
    },
    {
      id: "production",
      name: "Production complète",
      description: "Service de production musicale complète",
      duration: 480,
    },
  ]

  // Form submission states
  isSubmitting = false
  submissionSuccess = false
  submissionError: string | null = null
  userUuid : string =''
  // Availability checking states
  isCheckingAvailability = false
  selectedDate = ""
  selectedService: Service | null = null
  selectedDuration = 120 // Default 2 hours in minutes

  // User info - this would typically come from your auth service
  userId = "user123" // Replace with actual user ID from your auth system

  // Minimum date (today)
  minDate: string

  constructor(
    private fb: FormBuilder,
    private reservationService: ReservationService,
    private authService : AuthService
  ) {
    // Set minimum date to today
    const today = new Date()
    this.minDate = today.toISOString().split("T")[0]

    // Initialize form
    this.bookingForm = this.fb.group({
      firstName: ["", [Validators.required]],
      lastName: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      phone: ["", [Validators.required, Validators.pattern(/^\+?[0-9\s\-$$$$]{8,20}$/)]],
      serviceType: ["", [Validators.required]],
      duration: ["2", [Validators.required]],
      date: [this.minDate, [Validators.required]],
      time: ["", [Validators.required]],
      details: [""],
    })
  }

  ngOnInit(): void {
    this.authService.getUserConnect().subscribe((data)=>{
      this.userUuid = data.uuid
    })
    // Initialize time slots for today
    this.generateTimeSlots()

    // Listen for date changes to update time slots
    this.bookingForm.get("date")?.valueChanges.subscribe((date) => {
      this.selectedDate = date
      this.checkAvailability()
    })

    // Listen for service type changes
    this.bookingForm.get("serviceType")?.valueChanges.subscribe((serviceId) => {
      this.selectedService = this.services.find((s) => s.id === serviceId) || null
      if (this.selectedDate) {
        this.checkAvailability()
      }
    })

    // Listen for duration changes
    this.bookingForm.get("duration")?.valueChanges.subscribe((hours) => {
      if (hours === "custom") {
        // Handle custom duration input
        this.selectedDuration = 120 // Default to 2 hours until custom value is entered
      } else {
        this.selectedDuration = Number.parseInt(hours) * 60 // Convert hours to minutes
        if (this.selectedDate) {
          this.checkAvailability()
        }
      }
    })
  }

  // Generate time slots from 9 AM to 6 PM
  generateTimeSlots(): void {
    this.timeSlots = []
    // Generate slots every 30 minutes from 9 AM to 6 PM
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, "0")
        const formattedMinute = minute.toString().padStart(2, "0")
        this.timeSlots.push({
          time: `${formattedHour}:${formattedMinute}`,
          available: true, // Default to available
        })
      }
    }
  }

  // Check availability for the selected date
  checkAvailability(): void {
    if (!this.selectedDate) return

    this.isCheckingAvailability = true
    this.generateTimeSlots() // Reset slots

    this.reservationService
      .getReservedHoursByDate(this.selectedDate)
      .pipe(finalize(() => (this.isCheckingAvailability = false)))
      .subscribe(
        (reservedHours) => {
          // Mark reserved slots as unavailable
          this.timeSlots.forEach((slot) => {
            // Check if this slot overlaps with any reserved hour
            for (const reservedHour of reservedHours) {
              const [startHour, endHour] = reservedHour.split("-")
              if (this.isTimeInRange(slot.time, startHour, endHour)) {
                slot.available = false
                break
              }
            }

            // Check if the slot + duration would extend beyond business hours
            if (slot.available && this.selectedDuration) {
              const slotTime = new Date(`${this.selectedDate}T${slot.time}:00`)
              const endTime = new Date(slotTime.getTime() + this.selectedDuration * 60000)
              const endHour = endTime.getHours()
              const endMinute = endTime.getMinutes()

              // If end time is after 6 PM, mark as unavailable
              if (endHour > 18 || (endHour === 18 && endMinute > 0)) {
                slot.available = false
              }
            }
          })

          // If a time was previously selected, check if it's still available
          const selectedTime = this.bookingForm.get("time")?.value
          if (selectedTime) {
            const isStillAvailable = this.timeSlots.find((slot) => slot.time === selectedTime && slot.available)

            if (!isStillAvailable) {
              // Reset the time selection if it's no longer available
              this.bookingForm.get("time")?.setValue("")
            }
          }
        },
        (error) => {
          console.error("Error checking availability:", error)
          // Reset all slots to available in case of error
          this.timeSlots.forEach((slot) => (slot.available = true))
        },
      )
  }

  // Check if a time is within a range
  isTimeInRange(time: string, startTime: string, endTime: string): boolean {
    // Convert all times to minutes since midnight for easier comparison
    const timeMinutes = this.timeToMinutes(time)
    const startMinutes = this.timeToMinutes(startTime)
    const endMinutes = this.timeToMinutes(endTime)

    return timeMinutes >= startMinutes && timeMinutes < endMinutes
  }

  // Convert time string (HH:MM) to minutes since midnight
  timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
  }

  // Calculate end time based on start time and duration
  calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(":").map(Number)
    const startDate = new Date()
    startDate.setHours(hours, minutes, 0, 0)

    const endDate = new Date(startDate.getTime() + durationMinutes * 60000)
    const endHours = endDate.getHours().toString().padStart(2, "0")
    const endMinutes = endDate.getMinutes().toString().padStart(2, "0")

    return `${endHours}:${endMinutes}`
  }

  // Submit the reservation
  submitReservation(): void {
    if (this.bookingForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.bookingForm.controls).forEach((key) => {
        this.bookingForm.get(key)?.markAsTouched()
      })
      return
    }

    const formValues = this.bookingForm.value
    const startTime = formValues.time
    const endTime = this.calculateEndTime(startTime, this.selectedDuration)

    const reservationRequest: ReservationRequest = {
      date: formValues.date,
      heureDebut: startTime,
      heureFin: endTime,
      service: formValues.serviceType,
      userUuid: this.userUuid,
    }

    this.isSubmitting = true
    this.submissionError = null

    // First check if the slot is still available
    this.reservationService
      .getReservationsByDateAndRange(
        reservationRequest.date,
        reservationRequest.heureDebut,
        reservationRequest.heureFin,
      )
      .pipe(
        switchMap((existingReservations) => {
          if (existingReservations.length > 0) {
            // Slot is no longer available
            throw new Error("Ce créneau n'est plus disponible. Veuillez en choisir un autre.")
          }
          // Proceed with creating the reservation
          return this.reservationService.createReservation(reservationRequest)
        }),
        finalize(() => (this.isSubmitting = false)),
      )
      .subscribe(
        (response) => {
          console.log("Reservation created:", response)
          this.submissionSuccess = true

          // Reset form after successful submission
          setTimeout(() => {
            this.bookingForm.reset({
              date: this.minDate,
              duration: "2",
            })
            this.submissionSuccess = false
            this.checkAvailability()
          }, 3000)
        },
        (error) => {
          console.error("Error creating reservation:", error)
          this.submissionError =
            error.message || "Une erreur s'est produite lors de la réservation. Veuillez réessayer."
        },
      )
  }

  // Helper method to check if a form control is invalid and touched
  isInvalidAndTouched(controlName: string): boolean {
    const control = this.bookingForm.get(controlName)
    return control ? control.invalid && control.touched : false
  }

  // Helper method to get error message for a form control
  getErrorMessage(controlName: string): string {
    const control = this.bookingForm.get(controlName)
    if (!control) return ""

    if (control.hasError("required")) {
      return "Ce champ est requis"
    }

    if (control.hasError("email")) {
      return "Veuillez entrer une adresse email valide"
    }

    if (control.hasError("pattern")) {
      if (controlName === "phone") {
        return "Veuillez entrer un numéro de téléphone valide"
      }
    }

    return "Champ invalide"
  }
}
