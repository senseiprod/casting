import { Component, Input, Output, EventEmitter } from "@angular/core"
import {  FormBuilder,  FormGroup, Validators } from "@angular/forms"
import  { SpeakerResponse } from "../../../services/speaker-service.service"

@Component({
  selector: "app-reservation-modal",
  templateUrl: "./reservation-modal.component.html",
  styleUrls: ["./reservation-modal.component.css"],
})
export class ReservationModalComponent {
  @Input() speaker: SpeakerResponse | null = null
  @Input() isOpen = false
  @Output() close = new EventEmitter<void>()
  @Output() submit = new EventEmitter<any>()

  reservationForm: FormGroup
  minDate: string

  voiceOverTypes = [
    { id: "commercial", name: "Commercial" },
    { id: "narrative", name: "Narration" },
    { id: "corporate", name: "Corporate" },
    { id: "elearning", name: "E-Learning" },
    { id: "character", name: "Character Voice" },
  ]

  constructor(private fb: FormBuilder) {
    // Set minimum date to today
    const today = new Date()
    this.minDate = today.toISOString().split("T")[0]

    this.reservationForm = this.fb.group({
      date: [this.minDate, Validators.required],
      time: ["09:00", Validators.required],
      durationMinutes: [30, [Validators.required, Validators.min(5), Validators.max(240)]],
      voiceOverType: ["commercial", Validators.required],
      notes: [""],
    })
  }

  closeModal(): void {
    this.close.emit()
  }

  submitReservation(): void {
    if (this.reservationForm.valid) {
      this.submit.emit({
        speakerId: this.speaker?.uuid,
        speakerName: `${this.speaker?.prenom} ${this.speaker?.nom}`,
        ...this.reservationForm.value,
      })
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.reservationForm.controls).forEach((key) => {
        this.reservationForm.get(key)?.markAsTouched()
      })
    }
  }
}
